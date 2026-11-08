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

/**
 * Fallback tạo mô tả sản phẩm chuẩn SEO từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgeProductDescription(params: {
  productName: string;
  category?: string;
  material?: string;
  collarType?: string;
  shirtType?: string;
}): string {
  const name = params.productName.trim();
  const cat = params.category || detectCategoryFromText(name);
  const mat = params.material ? params.material.trim() : "chất liệu thể thao cao cấp";

  let desc = `${name} thiết kế hiện đại, may từ ${mat} tích hợp công nghệ thoát ẩm UNI DRY một chiều thoáng khí vượt trội, co giãn linh hoạt và phom dáng chuẩn chỉn chu, lý tưởng làm đồng phục doanh nghiệp và thể thao vận động.`;
  if (desc.length > 280) {
    desc = desc.slice(0, 277) + "...";
  }
  return desc;
}

/**
 * Fallback tạo danh sách FAQ sản phẩm từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgeProductFaqs(params: {
  productName: string;
  material?: string;
}): { question: string; answer: string }[] {
  const name = params.productName.trim() || "sản phẩm đồng phục Univi";
  const mat = params.material ? params.material.trim() : "vải thể thao cao cấp";

  return [
    {
      question: `Số lượng đặt may tối thiểu (MOQ) cho ${name} là bao nhiêu?`,
      answer: `Univi nhận đặt may từ 10 sản phẩm đối với các mẫu và chất liệu vải có sẵn. Với đơn hàng số lượng lớn cho chuỗi phòng tập, câu lạc bộ hoặc doanh nghiệp, Univi áp dụng chính sách chiết khấu và hỗ trợ tối ưu.`,
    },
    {
      question: `Univi có hỗ trợ tư vấn thiết kế logo và lên mockup 3D cho ${name} không?`,
      answer: `Có, Univi hỗ trợ tư vấn thiết kế bộ nhận diện và lên bản vẽ mockup 3D hoàn toàn miễn phí, giúp khách hàng duyệt chuẩn màu sắc, phom dáng và vị trí logo trước khi sản xuất hàng loạt.`,
    },
    {
      question: `Chất liệu ${mat} của ${name} có ưu điểm gì nổi bật?`,
      answer: `Sản phẩm sử dụng ${mat} ứng dụng công nghệ thoát ẩm UNI DRY cơ chế 1 chiều, giúp đẩy mồ hôi ra ngoài bề mặt để bay hơi nhanh, giữ bề mặt da luôn khô thoáng, co giãn thoải mái và an toàn lành tính cho da khi vận động liên tục.`,
    },
    {
      question: `Univi sử dụng công nghệ in ấn nào và độ bền logo ra sao?`,
      answer: `Univi ứng dụng các công nghệ in hiện đại như In PET (DTF), decal PU cao cấp và thêu vi tính sắc nét, đảm bảo hình in bám chắc, không bong tróc, chuẩn màu thương hiệu và bền bỉ qua nhiều chu kỳ giặt.`,
    },
    {
      question: `Hướng dẫn giặt và bảo quản ${name} đúng cách để giữ độ bền lâu nhất?`,
      answer: `Để bảo vệ sợi vải và hình in, bạn nên lộn trái trang phục trước khi giặt, ưu tiên giặt tay hoặc giặt máy chế độ nhẹ với nước mát dưới 40°C, phơi nơi râm mát và tránh ủi trực tiếp lên các chi tiết in ấn logo.`,
    },
  ];
}

/**
 * Fallback tạo Meta Description bài viết từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgePostDescription(params: {
  title: string;
  content?: string;
  focusKeyword?: string;
}): string {
  const title = params.title.trim();
  const kw = params.focusKeyword?.trim();
  let desc = "";
  if (kw && !title.toLowerCase().includes(kw.toLowerCase())) {
    desc = `${title} - Khám phá cẩm nang và giải pháp ${kw} chuyên nghiệp từ Univi, cam kết chất lượng, công nghệ thoát ẩm UNI DRY và phom dáng chỉn chu.`;
  } else {
    desc = `${title} - Cẩm nang tư vấn chuyên sâu về giải pháp may đồng phục thể thao, tiêu chuẩn chất liệu vải UNI DRY và quy trình may đo cao cấp từ Univi.`;
  }
  if (desc.length > 175) {
    desc = desc.slice(0, 172) + "...";
  }
  return desc;
}

/**
 * Fallback tạo FAQ bài viết từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgePostFaqs(params: {
  title: string;
}): { question: string; answer: string }[] {
  return [
    {
      question: `Tại sao nên lựa chọn giải pháp may đồng phục chuyên nghiệp tại Univi?`,
      answer: `Univi là đơn vị tiên phong cung cấp giải pháp đồng phục thể thao và doanh nghiệp với quy trình sản xuất trực tiếp tại xưởng, chất liệu vải ứng dụng công nghệ thoát ẩm UNI DRY thoáng mát và chính sách lưu rập hỗ trợ tái đặt đồng bộ.`,
    },
    {
      question: `Univi nhận đặt may từ số lượng bao nhiêu sản phẩm?`,
      answer: `Univi nhận đơn đặt may linh hoạt từ 10 sản phẩm trở lên đối với mẫu và chất liệu có sẵn, hỗ trợ tối đa cho các đội nhóm, câu lạc bộ và chuỗi phòng tập vừa và nhỏ.`,
    },
    {
      question: `Khách hàng có được duyệt mẫu mockup trước khi sản xuất không?`,
      answer: `Khách hàng được Univi tư vấn concept và hỗ trợ lên thiết kế mockup 3D miễn phí để duyệt chuẩn phom dáng, phối màu và vị trí in thêu logo trước khi tiến hành may hàng loạt.`,
    },
  ];
}

/**
 * Fallback tối ưu cấu trúc nội dung chi tiết chuẩn SEO từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgeSeoContent(params: {
  productName: string;
  content: string;
  material?: string;
}): string {
  const name = params.productName.trim() || "Sản phẩm đồng phục cao cấp Univi";
  const mat = params.material ? params.material.trim() : "chất liệu thể thao cao cấp";

  return `
<h2>Đặc điểm nổi bật của ${name}</h2>
<p>${name} là dòng sản phẩm đồng phục chuyên nghiệp được Univi phát triển với thiết kế hiện đại, phom dáng chuẩn tôn dáng người mặc và đường may tinh xảo, đáp ứng trọn vẹn tiêu chuẩn vận động lẫn nhận diện thương hiệu.</p>

<h2>Chất liệu ${mat} & Công nghệ thoát ẩm UNI DRY</h2>
<p>Sản phẩm sử dụng ${mat} chọn lọc kỹ lưỡng, mang lại trải nghiệm êm ái và bảo vệ làn da tối ưu:</p>
<ul>
  <li><strong>Công nghệ thoát ẩm UNI DRY:</strong> Cơ chế dẫn ẩm 1 chiều giúp hút mồ hôi từ da và phân tán ra bề mặt ngoài vải để bay hơi nhanh chóng, không gây bết dính.</li>
  <li><strong>Co giãn linh hoạt:</strong> Đảm bảo khả năng đàn hồi và phục hồi phom dáng xuất sắc sau nhiều lần giặt.</li>
  <li><strong>Chất liệu an toàn:</strong> Sợi vải được xử lý an toàn, lành tính cho làn da, thoáng khí và hạn chế mùi ẩm mốc.</li>
</ul>

<h2>Ứng dụng & Hướng dẫn bảo quản chuẩn</h2>
<p>Phù hợp cho đồng phục huấn luyện viên, hội viên thể thao, đội nhóm vận động và đồng phục sự kiện doanh nghiệp.</p>
<ul>
  <li>Nên lộn trái áo khi giặt để bảo vệ mặt vải và chi tiết in logo.</li>
  <li>Giặt tay hoặc giặt máy ở chế độ nhẹ nhàng với nước mát dưới 40°C.</li>
  <li>Phơi ở nơi thoáng gió, râm mát, tránh ánh nắng trực tiếp gay gắt.</li>
  <li>Không là/ủi trực tiếp lên các chi tiết in ấn hoặc thêu logo.</li>
</ul>

<div class="univi-cta-box" style="margin-top: 24px; padding: 16px 20px; background: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px;">
  <h3 style="margin-top: 0; color: #0f172a;">Liên hệ tư vấn & Thiết kế Mockup 3D miễn phí</h3>
  <p style="margin-bottom: 0; color: #475569;">Đồng Phục Univi nhận may đơn từ 10 sản phẩm, hỗ trợ tư vấn chất liệu mẫu thực tế và thiết kế mockup 3D theo đúng nhận diện thương hiệu. Hãy liên hệ ngay với đội ngũ tư vấn Univi qua hotline hoặc Zalo để được phục vụ chu đáo nhất.</p>
</div>
`.trim();
}

/**
 * Fallback tạo Mô tả ngắn Feedback từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgeFeedbackDescription(params: {
  customer: string;
  title?: string;
  category?: string;
  industry?: string;
  location?: string;
  serviceTags?: string;
}): string {
  const customer = params.customer?.trim() || "đối tác";
  const cat = params.category || "đồng phục thể thao";
  const ind = params.industry ? ` ${params.industry}` : "";
  const loc = params.location ? ` tại ${params.location}` : "";

  let desc = `Giải pháp ${cat.toLowerCase()}${ind} chuyên nghiệp Univi thiết kế riêng cho ${customer}${loc}, ứng dụng công nghệ thoát ẩm UNI DRY một chiều thoáng mát, nâng tầm nhận diện thương hiệu.`;
  if (desc.length > 185) {
    desc = desc.slice(0, 182) + "...";
  }
  return desc;
}

/**
 * Fallback tạo Tổng quan chi tiết Feedback từ bộ Knowledge khi Gemini AI hết quota
 */
export function generateKnowledgeFeedbackOverview(params: {
  customer: string;
  title?: string;
  category?: string;
  industry?: string;
  location?: string;
  employeeCount?: string;
  serviceTags?: string;
  year?: number | string;
}): string {
  const customer = params.customer?.trim() || "Đối tác";
  const cat = params.category || "Đồng phục thể thao";
  const ind = params.industry ? `bộ môn ${params.industry}` : "môi trường thể thao & vận động";
  const loc = params.location ? ` tại ${params.location}` : "";
  const services = params.serviceTags || "Đồng phục HLV, PT và Hội viên";

  return `
<h2>Bối cảnh & Bài toán đồng phục của ${customer}</h2>
<p>${customer}${loc} là đơn vị hoạt động chuyên nghiệp trong lĩnh vực ${ind}. Với đặc thù cường độ vận động cao và tiếp xúc thường xuyên với khách hàng, ${customer} đặt ra yêu cầu khắt khe về trang phục: vừa phải đảm bảo sự thoải mái tối đa cho đội ngũ, vừa mang tính nhận diện đồng bộ, sang trọng và chuẩn mực thương hiệu.</p>

<h2>Giải pháp đồng phục Univi & Công nghệ thoát ẩm UNI DRY</h2>
<p>Thấu hiểu những tiêu chuẩn đó, Đồng Phục Univi đã tư vấn giải pháp trang phục toàn diện cho ${customer}:</p>
<ul>
  <li><strong>Chất liệu vải thể thao cao cấp:</strong> Tuyển chọn các dòng vải chuyên dụng của Univi với độ co giãn đa chiều, mềm mại, bền màu và an toàn lành tính cho làn da khi vận động đổ nhiều mồ hôi.</li>
  <li><strong>Công nghệ thoát ẩm UNI DRY:</strong> Cơ chế dẫn ẩm 1 chiều tiên tiến giúp hút ẩm từ bề mặt da và phân tán nhanh ra mặt ngoài vải để bay hơi, giữ cho huấn luyện viên và nhân sự luôn khô ráo, tự tin suốt ngày dài.</li>
  <li><strong>In thêu logo sắc nét:</strong> Ứng dụng công nghệ in PET (DTF) chuẩn màu nhận diện và đường chỉ may giấu kỹ thuật cao, đảm bảo độ bền tối đa qua nhiều chu kỳ giặt sấy.</li>
  <li><strong>Hạng mục cung cấp:</strong> ${services}.</li>
</ul>

<h2>Trải nghiệm thực tế & Phản hồi từ ${customer}</h2>
<p>Toàn thể đội ngũ nhân sự và ban lãnh đạo ${customer} đánh giá rất cao sản phẩm hoàn thiện của Univi. Phom dáng áo chuẩn chỉnh, tôn dáng người mặc và chất vải nhẹ mát đã tạo nên nguồn năng lượng tích cực, giúp nâng tầm hình ảnh chuyên nghiệp trong mắt học viên và đối tác.</p>
<p>Bên cạnh đó, chính sách tư vấn thiết kế mockup 3D miễn phí cùng khả năng lưu trữ thông số rập của Univi giúp ${customer} hoàn toàn an tâm khi tái đặt hàng đồng bộ cho các giai đoạn mở rộng tiếp theo.</p>

<div class="univi-cta-box" style="margin-top: 24px; padding: 18px 22px; background: #f8fafc; border-left: 4px solid #105d97; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #0f172a; font-size: 1.15rem;">Bạn đang tìm giải pháp đồng phục chuyên nghiệp cho thương hiệu của mình?</h3>
  <p style="margin-bottom: 0; color: #475569;">Đồng Phục Univi là đơn vị tiên phong cung cấp giải pháp đồng phục thể thao và doanh nghiệp cho hàng ngàn chuỗi phòng tập, CLB và tổ chức trên toàn quốc. Nhận đơn may từ 10 sản phẩm, hỗ trợ thiết kế mockup 3D miễn phí. Liên hệ ngay hotline hoặc Zalo của Univi để nhận tư vấn chi tiết!</p>
</div>
`.trim();
}
