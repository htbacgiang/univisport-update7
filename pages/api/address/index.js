import db from "../../../utils/db";
import User from "../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

/**
 * Validate các trường dữ liệu địa chỉ
 * @param {object} data - Dữ liệu địa chỉ
 * @param {boolean} isUpdate - Cập nhật hay thêm mới
 * @returns {string|null} - Thông báo lỗi nếu không hợp lệ, ngược lại null
 */
function validateAddress(data, isUpdate = false) {
  if (!data || typeof data !== "object") {
    return "Dữ liệu địa chỉ không hợp lệ";
  }

  const { fullName, phoneNumber, address1, city, cityName, district, districtName, ward, wardName, type } = data;

  if (!isUpdate || fullName !== undefined) {
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return "Họ và tên người nhận không được để trống";
    }
  }

  if (!isUpdate || phoneNumber !== undefined) {
    if (!phoneNumber || typeof phoneNumber !== "string" || !/^[0-9+\s-]{9,15}$/.test(phoneNumber.trim())) {
      return "Số điện thoại người nhận không hợp lệ";
    }
  }

  if (!isUpdate || address1 !== undefined) {
    if (!address1 || typeof address1 !== "string" || !address1.trim()) {
      return "Địa chỉ chi tiết (số nhà, tên đường) không được để trống";
    }
  }

  if (!isUpdate || city !== undefined) {
    if (!city || !cityName) {
      return "Tỉnh/Thành phố là bắt buộc";
    }
  }

  if (!isUpdate || district !== undefined) {
    if (!district || !districtName) {
      return "Quận/Huyện là bắt buộc";
    }
  }

  if (!isUpdate || ward !== undefined) {
    if (!ward || !wardName) {
      return "Phường/Xã là bắt buộc";
    }
  }

  if (type !== undefined && !["home", "office"].includes(type)) {
    return "Loại địa chỉ phải là 'home' hoặc 'office'";
  }

  return null;
}

export default async function handler(req, res) {
  // 1. Bắt buộc đăng nhập
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized: Vui lòng đăng nhập" });
  }

  // 2. Lấy userId từ session, tuyệt đối không lấy từ query parameter
  const userId = session.user.id || session.user._id;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ error: "Unauthorized: Danh tính không hợp lệ" });
  }

  // 3. Chặn tấn công IDOR: Nếu query có userId nhưng không trùng với session userId thì từ chối
  if (req.query.userId && req.query.userId.toString() !== userId.toString()) {
    return res.status(403).json({ error: "Forbidden: Bạn không có quyền thao tác trên tài khoản khác" });
  }

  await db.connectDb();
  const { method, query: { addressId } } = req;

  try {
    switch (method) {
      case "GET": {
        const user = await User.findById(userId).select("address");
        if (!user) return res.status(404).json({ error: "User not found" });

        const targetAddressId = addressId || req.query.addressId;
        if (targetAddressId) {
          if (!mongoose.isValidObjectId(targetAddressId)) {
            return res.status(400).json({ error: "Invalid addressId" });
          }
          const address = user.address.find(
            (addr) => addr._id.toString() === targetAddressId.toString()
          );
          if (!address) {
            return res.status(404).json({ error: "Address not found" });
          }
          return res.status(200).json({ address });
        }

        return res.status(200).json({ addresses: user.address || [] });
      }

      case "POST": {
        const newAddress = req.body;
        const validationError = validateAddress(newAddress, false);
        if (validationError) {
          return res.status(400).json({ error: validationError });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const isFirstAddress = !user.address || user.address.length === 0;
        const shouldBeDefault = Boolean(newAddress.isDefault || isFirstAddress);

        if (shouldBeDefault) {
          await User.updateOne(
            { _id: userId },
            { $set: { "address.$[].isDefault": false } }
          );
        }

        const addressToPush = {
          fullName: newAddress.fullName.trim(),
          phoneNumber: newAddress.phoneNumber.trim(),
          address1: newAddress.address1.trim(),
          city: String(newAddress.city),
          cityName: String(newAddress.cityName).trim(),
          district: String(newAddress.district),
          districtName: String(newAddress.districtName).trim(),
          ward: String(newAddress.ward),
          wardName: String(newAddress.wardName).trim(),
          country: newAddress.country ? String(newAddress.country).trim() : "Vietnam",
          type: newAddress.type || "home",
          isDefault: shouldBeDefault,
        };

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $push: { address: addressToPush } },
          { new: true, runValidators: true }
        );

        return res.status(200).json({ addresses: updatedUser.address });
      }

      case "PUT": {
        const updatedAddress = req.body || {};
        const addrId = updatedAddress.addressId || updatedAddress._id || addressId || req.query.addressId;

        if (!addrId || !mongoose.isValidObjectId(addrId)) {
          return res.status(400).json({ error: "Missing or invalid addressId" });
        }

        const validationError = validateAddress(updatedAddress, true);
        if (validationError) {
          return res.status(400).json({ error: validationError });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const existingAddress = user.address.id(addrId);
        if (!existingAddress) {
          return res.status(404).json({ error: "Address not found" });
        }

        if (updatedAddress.isDefault) {
          await User.updateOne(
            { _id: userId },
            { $set: { "address.$[].isDefault": false } }
          );
        }

        const cleanAddress = {
          fullName: updatedAddress.fullName !== undefined ? updatedAddress.fullName.trim() : existingAddress.fullName,
          phoneNumber: updatedAddress.phoneNumber !== undefined ? updatedAddress.phoneNumber.trim() : existingAddress.phoneNumber,
          address1: updatedAddress.address1 !== undefined ? updatedAddress.address1.trim() : existingAddress.address1,
          city: updatedAddress.city !== undefined ? String(updatedAddress.city) : existingAddress.city,
          cityName: updatedAddress.cityName !== undefined ? String(updatedAddress.cityName).trim() : existingAddress.cityName,
          district: updatedAddress.district !== undefined ? String(updatedAddress.district) : existingAddress.district,
          districtName: updatedAddress.districtName !== undefined ? String(updatedAddress.districtName).trim() : existingAddress.districtName,
          ward: updatedAddress.ward !== undefined ? String(updatedAddress.ward) : existingAddress.ward,
          wardName: updatedAddress.wardName !== undefined ? String(updatedAddress.wardName).trim() : existingAddress.wardName,
          country: updatedAddress.country !== undefined ? String(updatedAddress.country).trim() : existingAddress.country,
          type: updatedAddress.type !== undefined ? updatedAddress.type : existingAddress.type,
          isDefault: updatedAddress.isDefault !== undefined ? Boolean(updatedAddress.isDefault) : existingAddress.isDefault,
          _id: addrId,
        };

        const updatedUser = await User.findOneAndUpdate(
          { _id: userId, "address._id": addrId },
          { $set: { "address.$": cleanAddress } },
          { new: true, runValidators: true }
        );

        return res.status(200).json({ addresses: updatedUser.address });
      }

      case "DELETE": {
        const id = addressId || req.query.addressId || req.body?.addressId;
        if (!id || !mongoose.isValidObjectId(id)) {
          return res.status(400).json({ error: "Missing or invalid addressId" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const addressToDelete = user.address.id(id);
        if (!addressToDelete) {
          return res.status(404).json({ error: "Address not found" });
        }

        const wasDefault = addressToDelete.isDefault;

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $pull: { address: { _id: id } } },
          { new: true }
        );

        // Nếu xóa địa chỉ mặc định và vẫn còn địa chỉ khác, gán cái đầu tiên làm mặc định
        if (wasDefault && updatedUser.address && updatedUser.address.length > 0) {
          const hasDefault = updatedUser.address.some((addr) => addr.isDefault);
          if (!hasDefault) {
            updatedUser.address[0].isDefault = true;
            await updatedUser.save();
          }
        }

        return res.status(200).json({ addresses: updatedUser.address });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
      }
    }
  } catch (error) {
    console.error("Address API error:", error);
    return res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
}
