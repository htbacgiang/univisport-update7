import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/adminAuth";
import { getFallbackColorName } from "../../../lib/colorNamer";
import {
  buildKnowledgePromptContext,
  generateKnowledgeProductDescription,
  generateKnowledgeProductFaqs,
  generateKnowledgePostDescription,
  generateKnowledgePostFaqs,
  generateKnowledgeSeoContent,
} from "../../../lib/knowledgeBase";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lấy danh sách các GEMINI API KEY có trong .env (hỗ trợ phân tách bằng dấu phẩy hoặc các biến GEMINI_API_KEY_2...)
 */
function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const primary = process.env.GEMINI_API_KEY || "";
  if (primary) {
    keys.push(...primary.split(",").map((k) => k.trim()).filter(Boolean));
  }
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim() && !keys.includes(k.trim())) {
      keys.push(k.trim());
    }
  }
  return keys;
}

/**
 * Danh sách mô hình Gemini theo thứ tự ưu tiên (ưu tiên các model còn quota và không bị deprecated)
 */
const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

async function callGemini(prompt: string, apiKeys: string[]): Promise<string> {
  let lastError = "";

  for (const apiKey of apiKeys) {
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }

        const msg = data.error?.message || `Model ${model} trả về mã ${res.status}`;
        lastError = msg;
        console.warn(`Gemini [${model}] issue:`, msg.slice(0, 120));
      } catch (err: any) {
        lastError = err.message || `Lỗi kết nối tới ${model}`;
        console.warn(`Gemini [${model}] fetch error:`, lastError);
      }
    }
  }

  throw new Error(lastError || "Tất cả các mô hình Gemini đều không phản hồi.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  if (!(await requireAdmin(req, res))) return;

  const apiKeys = getGeminiApiKeys();
  const hasApiKey = apiKeys.length > 0;

  const {
    type,
    title,
    content,
    description,
    focusKeyword,
    productName,
    maSanPham,
    category,
    material,
    productLine,
    collarType,
    shirtType,
    colors,
    color1,
    color2,
  } = req.body || {};

  const validTypes = [
    "description",
    "faqs",
    "product_faqs",
    "product_description",
    "product_seo_content",
    "color_name",
  ];

  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({
      error: `Tham số type không hợp lệ. Chỉ chấp nhận một trong các loại: ${validTypes.join(", ")}.`,
    });
  }

  try {
    // ----------------------------------------------------
    // 1. TẠO MÔ TẢ CHO BÀI VIẾT (POST META DESCRIPTION)
    // ----------------------------------------------------
    if (type === "description") {
      const cleanContent = stripHtml(content || "");
      const cleanTitle = (title || "").trim();

      if (!cleanTitle && cleanContent.length < 30) {
        return res.status(400).json({
          error: "Vui lòng nhập tiêu đề hoặc nội dung bài viết trước khi tạo bằng Gemini AI.",
        });
      }

      if (hasApiKey) {
        try {
          const knowledgeContext = buildKnowledgePromptContext({
            category,
            productName: cleanTitle,
            type: "description",
          });

          const prompt = `Bạn là chuyên gia SEO bài viết tiếng Việt cho thương hiệu may đồng phục Univi (dongphucunivi.com).
Dưới đây là BỘ TRI THỨC CHUẨN (Source of Truth) của Univi từ /docs/knowledge. Bạn BẮT BUỘC phải đọc và áp dụng chính xác các quy chuẩn, chất liệu và văn phong này:
${knowledgeContext}

Tiêu đề bài viết: ${cleanTitle || "Chưa có tiêu đề"}
${focusKeyword ? `Từ khóa chính (Focus Keyword): ${focusKeyword}` : ""}
Nội dung bài viết: ${cleanContent.slice(0, 3500)}

Yêu cầu tạo Meta Description:
1. Viết 1 đoạn Meta Description ngắn gọn, thu hút, chuẩn SEO (chiều dài tối ưu từ 150 đến 175 ký tự, tuyệt đối không quá 190 ký tự) dựa vào tiêu đề, nội dung bài viết và Bộ tri thức Univi.
2. Tóm tắt nội dung cốt lõi và nêu bật điểm hấp dẫn nhất để người tìm kiếm Google muốn nhấp vào xem ngay lập tức.
3. ${focusKeyword ? `Chứa từ khóa chính "${focusKeyword}" một cách khéo léo, tự nhiên.` : "Chứa các cụm từ khóa tự nhiên liên quan đến bài viết."}
4. TUYỆT ĐỐI TUÂN THỦ TỪ CẤM từ Knowledge: KHÔNG dùng "số 1", "hàng đầu", "dẫn đầu", "giá rẻ nhất", "mua ngay/chốt đơn"...
5. TUYỆT ĐỐI KHÔNG nhắc đến "QCVN 01:2017/BCT" hay từ viết tắt QCVN.
6. Câu văn mạch lạc, hấp dẫn, chuẩn tiếng Việt, không dùng đại từ rườm rà.
7. Tuyệt đối KHÔNG đặt trong dấu ngoặc kép, KHÔNG dùng hashtag, KHÔNG chứa markdown hay icon.
8. Chỉ trả về DUY NHẤT một đoạn văn bản mô tả ngắn, không thêm bất kỳ lời dẫn hay giải thích nào khác.`;

          const rawDesc = await callGemini(prompt, apiKeys);
          let desc = rawDesc.trim().replace(/^["']|["']$/g, "").trim();

          if (desc.length > 195) {
            const lastPeriod = desc.lastIndexOf(".", 190);
            if (lastPeriod > 140) {
              desc = desc.slice(0, lastPeriod + 1);
            } else {
              const lastSpace = desc.lastIndexOf(" ", 185);
              desc = (lastSpace > 140 ? desc.slice(0, lastSpace) : desc.slice(0, 185)) + "...";
            }
          }

          return res.status(200).json({ description: desc, fallback: false });
        } catch (geminiErr: any) {
          console.warn("Lỗi Gemini bài viết description, dùng Knowledge fallback:", geminiErr.message);
        }
      }

      // Knowledge Base Fallback
      const fallbackDesc = generateKnowledgePostDescription({
        title: cleanTitle,
        content: cleanContent,
        focusKeyword,
      });
      return res.status(200).json({ description: fallbackDesc, fallback: true });
    }

    // ----------------------------------------------------
    // 2. TẠO FAQ CHO BÀI VIẾT HOẶC SẢN PHẨM
    // ----------------------------------------------------
    if (type === "faqs" || type === "product_faqs") {
      const name = (productName || title || "").trim();
      const cleanContent = stripHtml(content || "");
      const cleanDesc = (description || "").trim();

      if (!name && cleanContent.length < 30) {
        return res.status(400).json({
          error: "Vui lòng nhập tên sản phẩm hoặc nội dung trước khi tạo FAQ bằng Gemini AI.",
        });
      }

      const colorNames = Array.isArray(colors)
        ? colors
            .map((c: any) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean)
            .join(", ")
        : "";

      const isProduct = type === "product_faqs" || !!productName;

      if (hasApiKey) {
        try {
          let prompt = "";
          if (isProduct) {
            const knowledgeContext = buildKnowledgePromptContext({
              category,
              maSanPham,
              productName: name,
              type: "product_faqs",
            });

            prompt = `Bạn là chuyên gia tư vấn may đồng phục và chăm sóc khách hàng của thương hiệu may mặc Univi (dongphucunivi.com).
Dưới đây là BỘ TRI THỨC CHUẨN (Source of Truth) của Univi từ /docs/knowledge. Bạn BẮT BUỘC phải đọc kỹ và dựa vào các sự thật/chính sách thực tế này để tạo câu hỏi và trả lời chính xác:
${knowledgeContext}

Thông tin sản phẩm đang xét:
- Mã sản phẩm: ${maSanPham || "Chưa có mã"}
- Tên sản phẩm: ${name}
${category ? `- Danh mục: ${category}` : ""}
${material ? `- Chất liệu vải: ${material}` : ""}
${productLine ? `- Dòng sản phẩm: ${productLine}` : ""}
${collarType ? `- Kiểu cổ: ${collarType}` : ""}
${shirtType ? `- Loại áo: ${shirtType}` : ""}
${colorNames ? `- Màu sắc: ${colorNames}` : ""}
${cleanDesc ? `- Mô tả ngắn: ${cleanDesc}` : ""}
${cleanContent ? `- Tóm tắt chi tiết: ${cleanContent.slice(0, 1500)}` : ""}

Yêu cầu tạo FAQ:
1. Tạo từ 3 đến 5 câu hỏi thường gặp (FAQ) kèm câu trả lời chuẩn xác, chuyên nghiệp nhất theo đúng bộ Knowledge:
   - Số lượng đặt may tối thiểu (MOQ): nhận từ 10 sản phẩm (với mẫu/vải có sẵn).
   - Miễn phí thiết kế mockup 3D theo nhận diện thương hiệu.
   - Chất liệu vải: vải chuyên dụng với công nghệ thoát ẩm UNI DRY, xử lý an toàn lành tính cho da.
   - Công nghệ in logo: In PET (DTF), decal PU, thêu vi tính; độ bền cao.
   - Chính sách tái đặt đồng bộ: Lưu thông số rập và màu khi phòng tập/doanh nghiệp mở thêm chi nhánh.
   - Hướng dẫn bảo quản chuẩn của Univi: lộn trái khi giặt, giặt tay/nhẹ, tránh nước nóng >40°C, phơi râm mát.
2. TUYỆT ĐỐI TUÂN THỦ TỪ CẤM từ Knowledge: KHÔNG dùng "số 1", "hàng đầu", "giá rẻ nhất", "mua ngay/chốt đơn"...
3. TUYỆT ĐỐI KHÔNG nhắc đến "QCVN 01:2017/BCT" hay từ viết tắt QCVN.
4. Câu trả lời ngắn gọn (2-3 câu), văn phong chuyên nghiệp, nâng cao uy tín Univi.
5. BẮT BUỘC trả về duy nhất định dạng JSON array hợp lệ, KHÔNG bọc trong markdown block, KHÔNG kèm bất kỳ text lời dẫn nào khác.

Cấu trúc JSON:
[
  {"question": "Câu hỏi 1?", "answer": "Câu trả lời 1..."},
  {"question": "Câu hỏi 2?", "answer": "Câu trả lời 2..."}
]`;
          } else {
            const knowledgeContext = buildKnowledgePromptContext({
              category,
              productName: name,
              type: "faqs",
            });

            prompt = `Bạn là chuyên gia nội dung và chăm sóc khách hàng cho thương hiệu may đồng phục Univi (dongphucunivi.com).
Dưới đây là BỘ TRI THỨC CHUẨN (Source of Truth) của Univi từ /docs/knowledge (gồm chính sách MOQ từ 10 áo, tiến độ, in ấn, chất liệu và FAQ chuẩn):
${knowledgeContext}

Tiêu đề bài viết: ${name || "Chưa có tiêu đề"}
Nội dung bài viết: ${cleanContent.slice(0, 3500)}

Yêu cầu tạo FAQ Schema cho bài viết:
1. Dựa vào nội dung bài viết và Bộ tri thức chuẩn Univi, hãy tạo từ 3 đến 5 câu hỏi thường gặp (FAQ) kèm câu trả lời hữu ích, chuẩn xác, chuyên nghiệp.
2. Câu hỏi là những thắc mắc thực tế, quan trọng nhất của người đọc/khách hàng liên quan trực tiếp đến chủ đề bài viết.
3. Câu trả lời ngắn gọn, súc tích (khoảng 2-3 câu), văn phong chuyên nghiệp, uy tín, đảm bảo tính xác thực theo Knowledge Univi (nhận đặt từ 10 áo với mẫu có sẵn, miễn phí thiết kế mockup, công nghệ UNI DRY, lưu rập/màu để tái đặt...).
4. TUYỆT ĐỐI TUÂN THỦ TỪ CẤM từ Knowledge: KHÔNG dùng "số 1", "hàng đầu", "giá rẻ nhất", "mua ngay/chốt đơn"...
5. TUYỆT ĐỐI KHÔNG nhắc đến "QCVN 01:2017/BCT" hay từ viết tắt QCVN.
6. BẮT BUỘC trả về duy nhất định dạng JSON array hợp lệ, KHÔNG bọc trong markdown block, KHÔNG kèm bất kỳ text lời dẫn nào khác.

Cấu trúc JSON:
[
  {"question": "Câu hỏi 1?", "answer": "Câu trả lời 1..."},
  {"question": "Câu hỏi 2?", "answer": "Câu trả lời 2..."}
]`;
          }

          const rawFaqs = await callGemini(prompt, apiKeys);
          let cleanJson = rawFaqs.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

          const match = cleanJson.match(/\[[\s\S]*\]/);
          if (match) {
            cleanJson = match[0];
          }

          let parsedFaqs = JSON.parse(cleanJson);

          if (Array.isArray(parsedFaqs) && parsedFaqs.length > 0) {
            const valid = parsedFaqs
              .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
              .map((item) => ({
                question: item.question.trim(),
                answer: item.answer.trim(),
              }));

            if (valid.length > 0) {
              return res.status(200).json({ faqs: valid, fallback: false });
            }
          }
        } catch (geminiErr: any) {
          console.warn("Lỗi Gemini FAQs, chuyển sang Knowledge fallback:", geminiErr.message);
        }
      }

      // Knowledge Base Fallback
      const fallbackFaqs = isProduct
        ? generateKnowledgeProductFaqs({ productName: name, material })
        : generateKnowledgePostFaqs({ title: name });

      return res.status(200).json({ faqs: fallbackFaqs, fallback: true });
    }

    // ----------------------------------------------------
    // 3. TẠO MÔ TẢ SẢN PHẨM (PRODUCT SHORT DESCRIPTION) DỰA VÀO DỮ LIỆU ĐANG CÓ & KNOWLEDGE BASE
    // ----------------------------------------------------
    if (type === "product_description") {
      const name = (productName || title || "").trim();
      if (!name) {
        return res.status(400).json({
          error: "Vui lòng nhập Tên sản phẩm trước khi tạo mô tả bằng Gemini AI.",
        });
      }

      const colorNames = Array.isArray(colors)
        ? colors
            .map((c) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean)
            .join(", ")
        : "";

      const cleanContent = stripHtml(content || "");

      if (hasApiKey) {
        try {
          const knowledgeContext = buildKnowledgePromptContext({
            category,
            maSanPham,
            productName: name,
            type: "product_description",
          });

          const prompt = `Bạn là chuyên gia sáng tạo nội dung và SEO cho thương hiệu thời trang & may đồng phục cao cấp Univi (dongphucunivi.com).
Dưới đây là BỘ TRI THỨC CHUẨN (Source of Truth) của Univi từ /docs/knowledge. Bạn BẮT BUỘC phải đọc và áp dụng chính xác các quy chuẩn, chất liệu và văn phong này:
${knowledgeContext}

Thông số sản phẩm:
- Mã sản phẩm: ${maSanPham || "Chưa có mã"}
- Tên sản phẩm: ${name}
${category ? `- Danh mục: ${category}` : ""}
${productLine ? `- Dòng sản phẩm: ${productLine}` : ""}
${collarType ? `- Kiểu cổ: ${collarType}` : ""}
${shirtType ? `- Loại áo: ${shirtType}` : ""}
${material ? `- Chất liệu vải: ${material}` : ""}
${colorNames ? `- Màu sắc: ${colorNames}` : ""}
${cleanContent ? `- Tóm tắt nội dung chi tiết: ${cleanContent.slice(0, 400)}` : ""}

Yêu cầu:
1. Viết một đoạn Mô tả ngắn sản phẩm (Product Short Description) súc tích, hấp dẫn, chuẩn SEO (chiều dài tối ưu từ 160 đến 250 ký tự, tuyệt đối không quá 290 ký tự).
2. Nêu bật ưu điểm theo đúng chuẩn Univi: phom dáng hiện đại, chất liệu bền đẹp, công nghệ thoát ẩm UNI DRY, thoáng khí, co giãn thoải mái, thích hợp làm đồng phục doanh nghiệp, teambuilding hoặc thể thao vận động.
3. TUYỆT ĐỐI TUÂN THỦ TỪ CẤM từ Knowledge: KHÔNG dùng "số 1", "dẫn đầu", "hàng đầu", "giá rẻ nhất", "mua ngay/chốt đơn"...
4. TUYỆT ĐỐI KHÔNG nhắc đến "QCVN 01:2017/BCT" hay từ viết tắt QCVN.
5. Chứa tên sản phẩm hoặc từ khóa chính một cách tự nhiên.
6. Tuyệt đối KHÔNG đặt trong dấu ngoặc kép, KHÔNG dùng hashtag, KHÔNG markdown.
7. Chỉ trả về DUY NHẤT một đoạn văn bản mô tả, không thêm bất kỳ lời dẫn hay giải thích nào khác.`;

          const rawDesc = await callGemini(prompt, apiKeys);
          let desc = rawDesc.trim().replace(/^["']|["']$/g, "").trim();

          if (desc.length > 295) {
            const lastPeriod = desc.lastIndexOf(".", 280);
            if (lastPeriod > 160) {
              desc = desc.slice(0, lastPeriod + 1);
            } else {
              const lastSpace = desc.lastIndexOf(" ", 270);
              desc = (lastSpace > 160 ? desc.slice(0, lastSpace) : desc.slice(0, 270)) + "...";
            }
          }

          return res.status(200).json({ description: desc, fallback: false });
        } catch (geminiErr: any) {
          console.warn("Lỗi Gemini product_description, chuyển sang Knowledge fallback:", geminiErr.message);
        }
      }

      // Knowledge Base Fallback
      const fallbackDesc = generateKnowledgeProductDescription({
        productName: name,
        category,
        material,
        collarType,
        shirtType,
      });

      return res.status(200).json({ description: fallbackDesc, fallback: true });
    }

    // ----------------------------------------------------
    // 4. CHỈNH SỬA & TỐI ƯU NỘI DUNG CHI TIẾT SẢN PHẨM CHUẨN SEO DỰA THEO KNOWLEDGE BASE
    // ----------------------------------------------------
    if (type === "product_seo_content") {
      const rawContent = (content || "").trim();
      const name = (productName || title || "").trim();

      if (!rawContent || stripHtml(rawContent).length < 20) {
        return res.status(400).json({
          error: "Vui lòng nhập hoặc có sẵn nội dung chi tiết trước khi tối ưu SEO bằng Gemini AI.",
        });
      }

      if (hasApiKey) {
        try {
          const knowledgeContext = buildKnowledgePromptContext({
            category,
            maSanPham,
            productName: name,
            type: "product_seo_content",
          });

          const prompt = `Bạn là chuyên gia SEO On-page và Copywriter hàng đầu cho thương hiệu may đồng phục Univi (dongphucunivi.com).
Dưới đây là BỘ TRI THỨC CHUẨN (Source of Truth) của Univi từ /docs/knowledge. Bạn BẮT BUỘC phải đọc và áp dụng chính xác các quy chuẩn về chất liệu vải, công nghệ UNI DRY và quy tắc claim:
${knowledgeContext}

Thông tin sản phẩm:
- Mã sản phẩm: ${maSanPham || "Chưa có mã"}
- Tên sản phẩm: ${name || "Đồng phục cao cấp Univi"}
${category ? `- Danh mục: ${category}` : ""}
${material ? `- Chất liệu: ${material}` : ""}

Nội dung chi tiết hiện tại của sản phẩm:
${rawContent}

Yêu cầu biên tập chuẩn SEO On-page:
1. GIỮ NGUYÊN TOÀN BỘ các thẻ hình ảnh <img>, liên kết <a>, bảng <table> nếu có trong nội dung gốc (tuyệt đối không làm mất URL ảnh hay đường link đã chèn).
2. Tái cấu trúc bài viết mạch lạc, bố cục chuẩn SEO dựa theo kiến thức thực tế của Univi:
   - Sử dụng các thẻ tiêu đề <h2>, <h3> rõ ràng, cuốn hút (ví dụ: Đặc điểm nổi bật, Chất liệu vải & Công nghệ thoát ẩm UNI DRY, Bảng thông số & Hướng dẫn bảo quản, Tại sao các phòng tập và đội nhóm tin chọn Univi...).
   - Viết đúng các thông số thực tế của 5 dòng vải Univi (UNI QUICKDRY, UNI SUPERCOOL, UNI AIR, UNI COOL PIQUÉ, UNI ELITE), cam kết chất liệu an toàn lành tính cho da.
   - Đoạn văn ngắn gọn (2-4 câu/đoạn), rõ ràng, dễ đọc trên di động.
   - Sử dụng danh sách gạch đầu dòng <ul><li> để làm nổi bật các tính năng vượt trội: thoáng mát, co giãn, thoát ẩm một chiều, độ bền màu, in/thêu logo sắc nét.
   - Bổ sung lời kêu gọi hành động (CTA) chuẩn B2B ở cuối bài theo đúng thư viện CTA của Univi (hướng dẫn khách hàng liên hệ hotline/zalo Univi để nhận tư vấn mẫu và thiết kế mockup 3D miễn phí).
3. TUYỆT ĐỐI TUÂN THỦ TỪ CẤM từ Knowledge: KHÔNG dùng "số 1", "dẫn đầu", "hàng đầu", "giá rẻ nhất", "mua ngay/chốt đơn", "chất lượng gấp đôi giá bằng một nửa"...
4. TUYỆT ĐỐI KHÔNG nhắc đến "QCVN 01:2017/BCT" hay từ viết tắt QCVN trong bất kỳ câu chữ nào.
5. ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
   - Trả về DUY NHẤT mã HTML hợp lệ để hiển thị trực tiếp trong trình soạn thảo Rich Text (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <table>, <img>, <a>...).
   - Tuyệt đối KHÔNG bọc trong khối code markdown (không dùng ba dấu backtick), KHÔNG kèm lời dẫn "Dưới đây là..." hay giải thích bên ngoài.`;

          const generatedHtml = await callGemini(prompt, apiKeys);

          // Làm sạch mã markdown block nếu có
          let cleanHtml = generatedHtml
            .replace(/^```(?:html)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

          return res.status(200).json({ content: cleanHtml, fallback: false });
        } catch (geminiErr: any) {
          console.warn("Lỗi Gemini product_seo_content, chuyển sang Knowledge fallback:", geminiErr.message);
        }
      }

      // Knowledge Base Fallback
      const fallbackHtml = generateKnowledgeSeoContent({
        productName: name,
        content: rawContent,
        material,
      });

      return res.status(200).json({ content: fallbackHtml, fallback: true });
    }

    // ----------------------------------------------------
    // 5. TẠO TÊN MÀU THEO BẢNG MÀU / MÃ MÀU ĐÃ CHỌN BẰNG AI
    // ----------------------------------------------------
    if (type === "color_name") {
      let colorItems: { id: number | string; color1: string; color2?: string }[] = [];

      if (Array.isArray(colors) && colors.length > 0) {
        colorItems = colors.map((item, idx) => ({
          id: item.id ?? idx,
          color1: item.color1 || item.hex || "#000000",
          color2: item.color2 || item.hex2 || "",
        }));
      } else if (color1) {
        colorItems = [{ id: 0, color1: color1, color2: color2 || "" }];
      } else {
        return res.status(400).json({
          error: "Vui lòng cung cấp mã màu (color1, color2) để AI đặt tên màu.",
        });
      }

      // Chuẩn bị danh sách fallback ngay lập tức từ Color Dictionary
      const fallbackResults = colorItems.map((item) => ({
        id: item.id,
        name: getFallbackColorName(item.color1, item.color2),
      }));

      if (hasApiKey) {
        try {
          const prompt = `Bạn là chuyên gia màu sắc thời trang may mặc tại Việt Nam.
Hãy đặt tên màu tiếng Việt chuẩn xác, sang trọng, thường dùng trong ngành thời trang thể thao, may đồng phục áo thun, polo cho các mã màu HEX sau:

Danh sách mã màu:
${JSON.stringify(colorItems, null, 2)}

Quy tắc đặt tên màu:
1. Nếu chỉ có color1: Đặt tên màu tiếng Việt ngắn gọn, chuẩn thời trang (ví dụ: "Đen", "Trắng", "Xanh navy", "Xanh than", "Xanh bích", "Đỏ đô", "Đỏ tươi", "Xám tiêu", "Xám ghi", "Vàng nghệ", "Cam đất", "Xanh rêu", "Xanh ngọc", "Hồng pastel", "Nâu tây"...).
2. Nếu có cả color1 và color2: Đặt tên dạng phối màu (ví dụ: "Xanh navy phối Trắng", "Đen phối Đỏ", "Xám tiêu phối Cam", "Trắng phối Xanh bích"...).
3. Tên màu viết hoa chữ cái đầu, tự nhiên, không quá 35 ký tự.
4. BẮT BUỘC trả về DUY NHẤT một mảng JSON hợp lệ theo định dạng:
[
  {"id": 0, "name": "Tên màu"}
]
Tuyệt đối KHÔNG bọc trong markdown code block, KHÔNG kèm lời dẫn nào khác.`;

          const rawJson = await callGemini(prompt, apiKeys);
          let cleanJson = rawJson.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

          const match = cleanJson.match(/\[[\s\S]*\]/);
          if (match) cleanJson = match[0];

          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map();
            parsed.forEach((p) => {
              if (p && p.id !== undefined && p.name) {
                map.set(String(p.id), String(p.name).trim().replace(/^["']|["']$/g, ""));
              }
            });

            const results = colorItems.map((item) => ({
              id: item.id,
              name: map.get(String(item.id)) || getFallbackColorName(item.color1, item.color2),
            }));

            return res.status(200).json({
              name: results[0]?.name || fallbackResults[0].name,
              results,
              fallback: false,
            });
          }
        } catch (geminiErr: any) {
          console.warn("Lỗi Gemini color_name, chuyển sang fallback color naming:", geminiErr.message);
        }
      }

      // Trả về fallback naming nếu Gemini gặp lỗi quota hoặc định dạng
      return res.status(200).json({
        name: fallbackResults[0].name,
        results: fallbackResults,
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Lỗi Gemini API generate:", error);
    return res.status(500).json({
      error: error.message || "Không thể tạo nội dung bằng Gemini AI. Vui lòng thử lại sau.",
    });
  }
}
