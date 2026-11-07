import * as fs from "fs";
import * as path from "path";

interface KnowledgeParams {
  category?: string;
  maSanPham?: string;
  productName?: string;
  type?: string;
}

// Memory cache for knowledge files to avoid repeated disk I/O
let cachedCoreRules: string | null = null;
let cachedProductFilesMap: Map<string, string> | null = null;

function cleanKnowledgeText(text: string): string {
  if (!text) return "";
  return text
    .split("\n")
    // Loại bỏ các dòng gắn nhãn [NỘI BỘ] hoặc [CẦN XÁC MINH] theo quy tắc 00-huong-dan-su-dung-knowledge.md
    .filter((line) => !line.includes("[NỘI BỘ]") && !line.includes("[CẦN XÁC MINH]"))
    .join("\n")
    // Xóa tuyệt đối mọi mã hoặc tham chiếu QCVN theo yêu cầu người dùng
    .replace(/QCVN\s*01:2017\/BCT/gi, "tiêu chuẩn an toàn dệt may")
    .replace(/QCVN/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safeReadFile(filePath: string): string {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.warn(`Không thể đọc file knowledge: ${filePath}`, err);
  }
  return "";
}

function getKnowledgeDir(): string {
  return path.join(process.cwd(), "docs", "knowledge");
}

/**
 * Trích xuất mã sản phẩm từ chuỗi (vd: "APL01", "ACT1", "Áo Polo Pickleball APL01" -> "APL01")
 */
function extractProductCode(codeOrName: string): string | null {
  if (!codeOrName) return null;
  const match = codeOrName.trim().match(/\b([a-zA-Z]{1,5}\d{1,4}[a-zA-Z\d-]*)\b/);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Tự động nhận diện danh mục / bộ môn thể thao từ tiêu đề hoặc nội dung
 */
export function detectCategoryFromText(text: string): string {
  if (!text) return "";
  const t = text.toLowerCase();
  if (t.includes("pickleball")) return "dong-phuc-pickleball";
  if (t.includes("gym") || t.includes("fitness") || t.includes("pt") || t.includes("hlv")) return "dong-phuc-gym";
  if (t.includes("pilates")) return "dong-phuc-pilates";
  if (t.includes("yoga")) return "dong-phuc-yoga";
  if (t.includes("chạy bộ") || t.includes("chay bo") || t.includes("running") || t.includes("marathon") || t.includes("runner")) return "dong-phuc-chay-bo";
  if (t.includes("mma") || t.includes("golf") || t.includes("tennis") || t.includes("áo gió") || t.includes("ao gio")) return "dong-phuc-mma-golf-tennis-ao-gio";
  if (
    t.includes("doanh nghiệp") ||
    t.includes("doanh nghiep") ||
    t.includes("công sở") ||
    t.includes("cong so") ||
    t.includes("sơ mi") ||
    t.includes("so mi") ||
    t.includes("vest") ||
    t.includes("polo")
  )
    return "dong-phuc-doanh-nghiep";
  return "";
}

/**
 * Đọc file thông tin cụ thể của từng sản phẩm trong docs/knowledge/san-pham/*.md
 */
function getProductSpecificKnowledge(maSanPham?: string, productName?: string): string {
  const kDir = getKnowledgeDir();
  const spDir = path.join(kDir, "san-pham");
  if (!fs.existsSync(spDir)) return "";

  if (!cachedProductFilesMap) {
    cachedProductFilesMap = new Map();
    try {
      const files = fs.readdirSync(spDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const key = file.replace(/\.md$/i, "").toUpperCase();
          cachedProductFilesMap.set(key, path.join(spDir, file));
        }
      }
    } catch (e) {
      console.warn("Lỗi đọc danh mục san-pham knowledge:", e);
    }
  }

  const targetCodes: string[] = [];
  if (maSanPham) {
    targetCodes.push(maSanPham.toUpperCase());
    const extracted = extractProductCode(maSanPham);
    if (extracted && !targetCodes.includes(extracted)) targetCodes.push(extracted);
  }
  if (productName) {
    const extracted = extractProductCode(productName);
    if (extracted && !targetCodes.includes(extracted)) targetCodes.push(extracted);
  }

  for (const code of targetCodes) {
    const filePath = cachedProductFilesMap.get(code);
    if (filePath) {
      const raw = safeReadFile(filePath);
      if (raw) {
        return cleanKnowledgeText(raw).slice(0, 3000); // Lấy tối đa 3000 ký tự chi tiết
      }
    }
  }

  return "";
}

/**
 * Đọc tài liệu kiến thức theo từng bộ môn / danh mục sản phẩm
 */
function getCategoryKnowledge(category?: string): string {
  if (!category) return "";
  const kDir = getKnowledgeDir();
  const cat = category.toLowerCase().trim();

  let fileName = "";
  if (cat.includes("gym") || cat.includes("fitness") || cat.includes("pt")) {
    fileName = "11-dong-phuc-gym-fitness-pt.md";
  } else if (cat.includes("yoga")) {
    fileName = "12-dong-phuc-yoga.md";
  } else if (cat.includes("pilates")) {
    fileName = "13-dong-phuc-pilates.md";
  } else if (cat.includes("pickleball")) {
    fileName = "14-dong-phuc-pickleball.md";
  } else if (cat.includes("chay-bo") || cat.includes("running") || cat.includes("marathon")) {
    fileName = "15-dong-phuc-chay-bo.md";
  } else if (cat.includes("mma") || cat.includes("golf") || cat.includes("tennis") || cat.includes("ao-gio")) {
    fileName = "16-dong-phuc-mma-golf-tennis-ao-gio.md";
  } else if (
    cat.includes("doanh-nghiep") ||
    cat.includes("so-mi") ||
    cat.includes("vest") ||
    cat.includes("polo-dn") ||
    cat.includes("teambuilding") ||
    cat.includes("bao-ho")
  ) {
    fileName = "17-dong-phuc-doanh-nghiep.md";
  }

  if (fileName) {
    const content = safeReadFile(path.join(kDir, fileName));
    return cleanKnowledgeText(content).slice(0, 2500); // Lấy phần quan trọng đầu file
  }

  return "";
}

/**
 * Trích xuất bộ quy chuẩn cốt lõi (Định vị, Từ cấm, 5 dòng vải chuẩn, Công nghệ UNI DRY, Chính sách)
 */
function getCoreKnowledgeRules(): string {
  if (cachedCoreRules) return cachedCoreRules;

  const coreText = `
[QUY CHUẨN ĐỊNH VỊ & THƯƠNG HIỆU - BẮT BUỘC TUÂN THỦ]
- Tên thương hiệu chuẩn: Đồng Phục Univi (hoặc Univi). Slogan: YOUR UNIFORM, YOUR BRAND!
- Câu định vị chuẩn [FACT]: "Đồng Phục Univi là đơn vị TIÊN PHONG cung cấp giải pháp đồng phục thể thao chuyên nghiệp cho các chuỗi phòng tập và các đội nhóm tập Gym, Fitness, Pickleball, Yoga, Running, Pilates, MMA... tại Việt Nam."
- Luôn dùng từ "TIÊN PHONG".
- TUYỆT ĐỐI CẤM CÁC TỪ SAU: "số 1", "dẫn đầu", "hàng đầu", "tốt nhất", "giá rẻ nhất", "siêu rẻ", "mua ngay", "chốt đơn", "chất lượng gấp đôi giá bằng một nửa".
- Bản chất mô hình: Univi cung cấp giải pháp đồng phục và sản xuất trực tiếp tại xưởng (xưởng Đan Phượng, Hà Nội), không qua trung gian. Phục vụ khách hàng B2B toàn quốc (chuỗi phòng tập, CLB, doanh nghiệp, đội nhóm). Không định nghĩa Univi là "xưởng may" đơn thuần.

[HỆ THỐNG 5 DÒNG VẢI CHUYÊN DỤNG CHUẨN CỦA UNIVI]
1. UNI QUICKDRY (UNIA01): 88% Polyester – 12% Elastane, 180 GSM (mỏng, mịn, co giãn, nhanh khô; hợp Gym, Running, Kickfit, MMA, hội viên).
2. UNI SUPERCOOL (UNIA02): 89% Polyamide – 11% Elastane, 180 GSM (mềm, mượt, mát, co giãn cao, có độ rủ; hợp HLV/PT, Gym, Yoga, Pilates, Golf).
3. UNI AIR (UNIA12): 90% Polyester – 10% Elastane, 150 GSM (mỏng, siêu nhẹ, cấu trúc lỗ thoáng khí; hợp Running, các môn ra nhiều mồ hôi).
4. UNI COOL PIQUÉ (UNIA114): 86% Polyamide – 14% Elastane, 175 GSM (vải cá sấu piqué thể thao mềm mát; hợp Polo HLV/PT, quản lý, Golf, Pickleball, doanh nghiệp).
5. UNI ELITE (UNIA11): 93% Polyester – 7% Elastane, 170 GSM (nhẹ, thoáng, bề mặt dệt vân cao cấp; hợp Polo Golf, Pickleball, quản lý).

[CÔNG NGHỆ THOÁT ẨM UNI DRY & AN TOÀN CHO DA]
- UNI DRY: công nghệ xử lý thoát ẩm cơ chế 1 chiều, dẫn mồ hôi từ bề mặt da ra ngoài lớp vải để bay hơi nhanh, TUYỆT ĐỐI không thấm ngược vào da.
- An toàn chất liệu: Chất liệu vải được xử lý an toàn, lành tính cho da, không gây kích ứng khi vận động đổ nhiều mồ hôi.
- LƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG nhắc đến mã quy chuẩn "QCVN 01:2017/BCT" hay từ viết tắt QCVN trong bất kỳ câu chữ nào.

[CHÍNH SÁCH ĐẶT HÀNG & BẢO QUẢN]
- Nhận đơn từ 10 sản phẩm (với mẫu và vải có sẵn).
- Miễn phí thiết kế concept và mockup 3D theo nhận diện thương hiệu.
- Giao hàng toàn quốc. Hỗ trợ xuất hóa đơn VAT.
- Lưu thông số rập và màu vải để tái đặt đồng bộ khi phòng tập/doanh nghiệp mở thêm chi nhánh.
- Hướng dẫn bảo quản chuẩn: lộn trái trước khi giặt, giặt tay hoặc giặt nhẹ, không giặt nước nóng >40°C, phơi nơi thoáng mát tránh nắng gắt, không ủi trực tiếp lên logo/hình in.

[LỜI KÊU GỌI HÀNH ĐỘNG (CTA) CHUẨN B2B]
- Hướng người đọc liên hệ để được tư vấn giải pháp đồng phục chuyên nghiệp, nhận mẫu vải trực tiếp hoặc tư vấn mockup thiết kế miễn phí.
`;

  cachedCoreRules = cleanKnowledgeText(coreText);
  return cachedCoreRules;
}

/**
 * Tổng hợp toàn bộ Knowledge Context chuẩn để chèn vào Gemini Prompt
 */
export function buildKnowledgePromptContext(params: KnowledgeParams): string {
  const coreRules = getCoreKnowledgeRules();
  const cat = params.category || detectCategoryFromText(params.productName || "");
  const categoryKnowledge = getCategoryKnowledge(cat);
  const productKnowledge = getProductSpecificKnowledge(params.maSanPham, params.productName);

  let context = `\n=== BỘ TRI THỨC CHUẨN UNIVI (NGUỒN SỰ THẬT DUY NHẤT TỪ /docs/knowledge) ===\n${coreRules}\n`;

  if (categoryKnowledge) {
    context += `\n[KIẾN THỨC CHUYÊN SÂU THEO BỘ MÔN / DANH MỤC: ${cat}]\n${categoryKnowledge}\n`;
  }

  if (productKnowledge) {
    context += `\n[THÔNG TIN CHI TIẾT SẢN PHẨM TỪ HỒ SƠ KNOWLEDGE: ${params.maSanPham || params.productName}]\n${productKnowledge}\n`;
  }

  context += `\n[NGUYÊN TẮC ÁP DỤNG KNOWLEDGE CHO AI]
1. Tuyệt đối bám sát các sự thật (Facts), thông số vải, công nghệ UNI DRY và định vị chuẩn từ bộ Knowledge trên.
2. Không bịa đặt số liệu hay giấy chứng nhận chưa được ghi nhận trong Knowledge.
3. Tuyệt đối tuân thủ danh sách từ cấm (không dùng "số 1", "hàng đầu", "giá rẻ nhất", "mua ngay/chốt đơn"...).
4. TUYỆT ĐỐI KHÔNG nhắc đến mã "QCVN 01:2017/BCT" hay từ viết tắt QCVN trong bất kỳ câu chữ nào.
===================================================================\n`;

  return context;
}
