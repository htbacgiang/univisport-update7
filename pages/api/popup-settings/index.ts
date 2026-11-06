import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getToken } from "next-auth/jwt";
import PopupSetting from "../../../models/PopupSetting";
import User from "../../../models/User";
import db from "../../../utils/db";
import { normalizePopupConfig, resolveActivePopup } from "../../../lib/popup-helper";
import { DEFAULT_POPUP_SETTINGS } from "../../../data/defaultPopupSettings";
import type { PopupSettingsConfig, ActivePopupResolved } from "../../../types/popup";

type PopupApiResponse = {
  config?: PopupSettingsConfig;
  resolved?: ActivePopupResolved;
  message?: string;
  err?: string;
};

const GLOBAL_POPUP_KEY = "global";
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PopupApiResponse>
) {
  if (req.method === "GET") {
    return getPopupConfig(req, res);
  }

  if (req.method === "PUT") {
    return updatePopupConfig(req, res);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ err: "Method not allowed" });
}

async function getPopupConfig(
  _req: NextApiRequest,
  res: NextApiResponse<PopupApiResponse>
) {
  try {
    await db.connectDb();
    let setting = await PopupSetting.findOne({ key: GLOBAL_POPUP_KEY }).lean();

    if (!setting) {
      // Seed default nếu chưa có
      try {
        const created = await PopupSetting.create({
          ...DEFAULT_POPUP_SETTINGS,
          key: GLOBAL_POPUP_KEY,
        });
        setting = created.toObject ? created.toObject() : created;
      } catch {
        // Fallback in-memory
        setting = DEFAULT_POPUP_SETTINGS;
      }
    }

    const config = normalizePopupConfig(setting);
    const resolved = resolveActivePopup(config);

    return res.status(200).json({ config, resolved });
  } catch (error) {
    const fallbackConfig = normalizePopupConfig(DEFAULT_POPUP_SETTINGS);
    const fallbackResolved = resolveActivePopup(fallbackConfig);
    return res.status(200).json({
      config: fallbackConfig,
      resolved: fallbackResolved,
    });
  }
}

async function updatePopupConfig(
  req: NextApiRequest,
  res: NextApiResponse<PopupApiResponse>
) {
  const role = await getRequestRole(req);

  if (role !== "admin") {
    return res.status(401).json({ err: "Bạn cần quyền admin để cấu hình popup" });
  }

  try {
    const rawBody = req.body?.config || req.body;
    const configToSave = normalizePopupConfig(rawBody);

    await db.connectDb();
    const updated = await PopupSetting.findOneAndUpdate(
      { key: GLOBAL_POPUP_KEY },
      {
        $set: {
          enabled: configToSave.enabled,
          defaultPopup: configToSave.defaultPopup,
          holidays: configToSave.holidays,
          testMode: configToSave.testMode,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    const normalized = normalizePopupConfig(updated);
    const resolved = resolveActivePopup(normalized);

    return res.status(200).json({
      config: normalized,
      resolved,
      message: "Cập nhật cấu hình Popup thành công!",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi khi lưu cấu hình popup";
    return res.status(500).json({ err: message });
  }
}

async function getRequestRole(req: NextApiRequest) {
  try {
    const token = await getToken({ req, secret: AUTH_SECRET });
    const tokenRole = (token as { role?: unknown } | null)?.role;

    if (typeof tokenRole === "string") {
      return tokenRole;
    }

    const session = await getServerSession(req as any, {} as any, authOptions as NextAuthOptions);
    const sessionRole = (session?.user as { role?: unknown } | undefined)?.role;

    if (typeof sessionRole === "string") {
      return sessionRole;
    }

    const userId =
      typeof (token as { id?: unknown } | null)?.id === "string"
        ? ((token as { id: string }).id)
        : typeof token?.sub === "string"
          ? token.sub
          : undefined;

    if (!userId) {
      return undefined;
    }

    await db.connectDb();
    const user = await User.findById(userId).select("role").lean();
    const role = (user as { role?: unknown } | null)?.role;

    return typeof role === "string" ? role : undefined;
  } catch {
    return undefined;
  }
}
