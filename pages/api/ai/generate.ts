import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/adminAuth";
import { getFallbackColorName } from "../../../lib/colorNamer";

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

async function callGemini(prompt: string, apiKey: string) {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.8-flash",
    "gemini-3.8-flash-lite",
    "gemini-3.5-flash",
  ];
  let lastError = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

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

      lastError = data.error?.message || `Model ${model} trả về mã ${res.status}`;
      console.warn(`Gemini model ${model} issue:`, lastError);
    } catch (err: any) {
      lastError = err.message || `Lỗi kết nối tới ${model}`;
      console.warn(`Gemini model ${model} fetch exception:`, lastError);
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Chưa cấu hình GEMINI_API_KEY trong file .env của hệ thống.",
    });
  }

  const {
    type,
    title,
    content,
    description,
    focusKeyword,
    productName,
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

      const prompt = `Bạn là chuyên gia SEO bài viết tiếng Việt cho thương hiệu may đồng phục Univi.
Hãy viết 1 đoạn Meta Description ngắn gọn, thu hút, chuẩn SEO (chiều dài tối ưu từ 150 đến 175 ký tự, tuyệt đối không quá 190 ký tự) dựa vào tiêu đề và nội dung bài viết dưới đây.

Yêu cầu:
1. Tóm tắt nội dung cốt lõi và nêu bật điểm hấp dẫn nhất để người tìm kiếm Google muốn nhấp vào xem ngay lập tức.
2. ${focusKeyword ? `Chứa từ khóa chính "${focusKeyword}" một cách khéo léo, tự nhiên.` : "Chứa các cụm từ khóa tự nhiên liên quan đến bài viết."}
3. Câu văn mạch lạc, hấp dẫn, chuẩn tiếng Việt, không dùng đại từ rườm rà.
4. Tuyệt đối KHÔNG đặt trong dấu ngoặc kép, KHÔNG dùng hashtag, KHÔNG chứa markdown hay icon.
5. Chỉ trả về DUY NHẤT một đoạn văn bản mô tả ngắn, không thêm bất kỳ lời dẫn hay giải thích nào khác.

Tiêu đề bài viết: ${cleanTitle || "Chưa có tiêu đề"}
Nội dung bài viết: ${cleanContent.slice(0, 3500)}`;

      const rawDesc = await callGemini(prompt, apiKey);
      let description = rawDesc.trim().replace(/^["']|["']$/g, "").trim();

      if (description.length > 195) {
        const lastPeriod = description.lastIndexOf(".", 190);
        if (lastPeriod > 140) {
          description = description.slice(0, lastPeriod + 1);
        } else {
          const lastSpace = description.lastIndexOf(" ", 185);
          description = (lastSpace > 140 ? description.slice(0, lastSpace) : description.slice(0, 185)) + "...";
        }
      }

      return res.status(200).json({ description });
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

      const prompt = isProduct
        ? `Bạn là chuyên gia tư vấn may đồng phục và chăm sóc khách hàng của thương hiệu may mặc Univi (dongphucunivi.com).
Hãy dựa vào các thông tin sản phẩm dưới đây để tạo từ 3 đến 5 câu hỏi thường gặp (FAQ) kèm câu trả lời chuẩn xác, chuyên nghiệp để khách hàng yên tâm đặt may hoặc mua sản phẩm.

Thông tin sản phẩm:
- Tên sản phẩm: ${name}
${category ? `- Danh mục: ${category}` : ""}
${material ? `- Chất liệu vải: ${material}` : ""}
${productLine ? `- Dòng sản phẩm: ${productLine}` : ""}
${collarType ? `- Kiểu cổ: ${collarType}` : ""}
${shirtType ? `- Loại áo: ${shirtType}` : ""}
${colorNames ? `- Màu sắc: ${colorNames}` : ""}
${cleanDesc ? `- Mô tả ngắn: ${cleanDesc}` : ""}
${cleanContent ? `- Tóm tắt chi tiết: ${cleanContent.slice(0, 1500)}` : ""}

Yêu cầu:
1. Câu hỏi là những thắc mắc thực tế, quan trọng nhất của khách hàng khi đặt may hoặc mua sản phẩm này (số lượng đặt tối thiểu, thời gian may và giao hàng, chất liệu vải có thoáng mát/co giãn/bền màu không, in thêu logo theo yêu cầu, chính sách bảo hành & bảng size).
2. Câu trả lời ngắn gọn (khoảng 2-3 câu), văn phong chuyên nghiệp, tin cậy, thể hiện uy tín của Univi.
3. BẮT BUỘC trả về duy nhất định dạng JSON array hợp lệ, KHÔNG bọc trong markdown block (\`\`\`json), KHÔNG kèm bất kỳ text lời dẫn nào khác.

Cấu trúc JSON:
[
  {"question": "Câu hỏi 1?", "answer": "Câu trả lời 1..."},
  {"question": "Câu hỏi 2?", "answer": "Câu trả lời 2..."}
]`
        : `Bạn là chuyên gia nội dung và chăm sóc khách hàng cho thương hiệu may đồng phục Univi.
Hãy dựa vào tiêu đề và nội dung bài viết dưới đây để tạo từ 3 đến 5 câu hỏi thường gặp (FAQ) kèm câu trả lời hữu ích, chuẩn xác để tích hợp FAQ Schema vào bài viết.

Yêu cầu:
1. Câu hỏi là những thắc mắc thực tế, quan trọng nhất mà người đọc/khách hàng muốn biết liên quan trực tiếp đến bài viết.
2. Câu trả lời ngắn gọn, súc tích (khoảng 2-3 câu), văn phong chuyên nghiệp, dễ hiểu, uy tín.
3. BẮT BUỘC trả về duy nhất định dạng JSON array hợp lệ, KHÔNG bọc trong markdown block (như \`\`\`json), KHÔNG kèm bất kỳ text lời dẫn nào khác.

Cấu trúc JSON:
[
  {"question": "Câu hỏi 1?", "answer": "Câu trả lời 1..."},
  {"question": "Câu hỏi 2?", "answer": "Câu trả lời 2..."}
]

Tiêu đề bài viết: ${name || "Chưa có tiêu đề"}
Nội dung bài viết: ${cleanContent.slice(0, 3500)}`;

      const rawFaqs = await callGemini(prompt, apiKey);
      let cleanJson = rawFaqs.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

      const match = cleanJson.match(/\[[\s\S]*\]/);
      if (match) {
        cleanJson = match[0];
      }

      let parsedFaqs = JSON.parse(cleanJson);

      if (!Array.isArray(parsedFaqs)) {
        throw new Error("Dữ liệu trả về không phải là mảng FAQ hợp lệ.");
      }

      parsedFaqs = parsedFaqs
        .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }));

      return res.status(200).json({ faqs: parsedFaqs });
    }

    // ----------------------------------------------------
    // 3. TẠO MÔ TẢ SẢN PHẨM (PRODUCT SHORT DESCRIPTION) DỰA VÀO DỮ LIỆU ĐANG CÓ
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

      const prompt = `Bạn là chuyên gia sáng tạo nội dung và SEO cho thương hiệu thời trang & may đồng phục cao cấp Univi (dongphucunivi.com).
Hãy viết một đoạn Mô tả ngắn sản phẩm (Product Short Description) súc tích, hấp dẫn, chuẩn SEO (chiều dài tối ưu từ 160 đến 250 ký tự, tuyệt đối không quá 290 ký tự) dựa trên các thông số sản phẩm dưới đây:

Thông số sản phẩm:
- Tên sản phẩm: ${name}
${category ? `- Danh mục: ${category}` : ""}
${productLine ? `- Dòng sản phẩm: ${productLine}` : ""}
${collarType ? `- Kiểu cổ: ${collarType}` : ""}
${shirtType ? `- Loại áo: ${shirtType}` : ""}
${material ? `- Chất liệu vải: ${material}` : ""}
${colorNames ? `- Màu sắc: ${colorNames}` : ""}
${cleanContent ? `- Tóm tắt nội dung chi tiết: ${cleanContent.slice(0, 400)}` : ""}

Yêu cầu:
1. Nêu bật ưu điểm: phom dáng hiện đại, chất liệu bền đẹp, thoáng khí, thấm hút mồ hôi, co giãn thoải mái, thích hợp làm đồng phục doanh nghiệp, teambuilding hoặc thể thao vận động.
2. Câu văn cuốn hút, tự nhiên, văn phong chuẩn tiếng Việt, kích thích khách hàng liên hệ đặt may.
3. Chứa tên sản phẩm hoặc từ khóa chính một cách tự nhiên.
4. Tuyệt đối KHÔNG đặt trong dấu ngoặc kép, KHÔNG dùng hashtag, KHÔNG markdown.
5. Chỉ trả về DUY NHẤT một đoạn văn bản mô tả, không thêm bất kỳ lời dẫn hay giải thích nào khác.`;

      const rawDesc = await callGemini(prompt, apiKey);
      let description = rawDesc.trim().replace(/^["']|["']$/g, "").trim();

      if (description.length > 295) {
        const lastPeriod = description.lastIndexOf(".", 280);
        if (lastPeriod > 160) {
          description = description.slice(0, lastPeriod + 1);
        } else {
          const lastSpace = description.lastIndexOf(" ", 270);
          description = (lastSpace > 160 ? description.slice(0, lastSpace) : description.slice(0, 270)) + "...";
        }
      }

      return res.status(200).json({ description });
    }

    // ----------------------------------------------------
    // 4. CHỈNH SỬA & TỐI ƯU NỘI DUNG CHI TIẾT SẢN PHẨM CHUẨN SEO
    // ----------------------------------------------------
    if (type === "product_seo_content") {
      const rawContent = (content || "").trim();
      const name = (productName || title || "").trim();

      if (!rawContent || stripHtml(rawContent).length < 20) {
        return res.status(400).json({
          error: "Vui lòng nhập hoặc có sẵn nội dung chi tiết trước khi tối ưu SEO bằng Gemini AI.",
        });
      }

      const prompt = `Bạn là chuyên gia SEO On-page và Copywriter hàng đầu cho thương hiệu may đồng phục Univi (dongphucunivi.com).
Nhiệm vụ của bạn: Tối ưu và chỉnh sửa lại nội dung chi tiết bài viết giới thiệu sản phẩm dưới đây thành một bài viết chuẩn SEO On-page hoàn hảo, giữ chân khách hàng và gia tăng tỷ lệ chuyển đổi đặt may đồng phục.

Thông tin sản phẩm:
- Tên sản phẩm: ${name || "Đồng phục cao cấp Univi"}
${category ? `- Danh mục: ${category}` : ""}
${material ? `- Chất liệu: ${material}` : ""}

Nội dung chi tiết hiện tại của sản phẩm:
${rawContent}

Yêu cầu biên tập chuẩn SEO On-page:
1. GIỮ NGUYÊN TOÀN BỘ các thẻ hình ảnh <img>, liên kết <a>, bảng <table> nếu có trong nội dung gốc (tuyệt đối không làm mất URL ảnh hay đường link đã chèn).
2. Tái cấu trúc bài viết mạch lạc, bố cục chuẩn SEO:
   - Sử dụng các thẻ tiêu đề <h2>, <h3> cuốn hút, chứa từ khóa liên quan đến tên sản phẩm và dòng đồng phục (ví dụ: Đặc điểm nổi bật, Chất liệu vải & Công nghệ may, Bảng thông số & Hướng dẫn chọn size, Tại sao nên chọn may đồng phục Univi...).
   - Đoạn văn ngắn gọn (2-4 câu/đoạn), rõ ràng, dễ đọc trên di động.
   - Sử dụng danh sách gạch đầu dòng <ul><li> để làm nổi bật các tính năng vượt trội: thoáng mát, co giãn, thấm hút mồ hôi, bền màu, in/thêu logo sắc nét.
   - Bổ sung lời kêu gọi hành động (CTA) chuyên nghiệp, tự nhiên ở cuối bài (khuyên khách hàng liên hệ hotline/zalo Univi để nhận mẫu vải và báo giá ưu đãi).
3. Đảm bảo từ khóa chính và các từ khóa phụ (may đồng phục, áo thun, polo, thể thao...) xuất hiện tự nhiên, tránh nhồi nhét.
4. ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
   - Trả về DUY NHẤT mã HTML hợp lệ để hiển thị trực tiếp trong trình soạn thảo Rich Text (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <table>, <img>, <a>...).
   - Tuyệt đối KHÔNG bọc trong khối code markdown (như \`\`\`html hoặc \`\`\`), KHÔNG kèm lời dẫn "Dưới đây là..." hay giải thích bên ngoài.`;

      const generatedHtml = await callGemini(prompt, apiKey);

      // Làm sạch mã markdown block nếu có
      let cleanHtml = generatedHtml
        .replace(/^```(?:html)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return res.status(200).json({ content: cleanHtml });
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

      // Chuẩn bị danh sách fallback
      const fallbackResults = colorItems.map((item) => ({
        id: item.id,
        name: getFallbackColorName(item.color1, item.color2),
      }));

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
Tuyệt đối KHÔNG bọc trong markdown code block (\`\`\`json), KHÔNG kèm lời dẫn nào khác.`;

        const rawJson = await callGemini(prompt, apiKey);
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
          });
        }
      } catch (geminiErr) {
        console.warn("Lỗi Gemini color_name, chuyển sang fallback color naming:", geminiErr);
      }

      // Trả về fallback naming nếu Gemini gặp lỗi mạng hoặc định dạng
      return res.status(200).json({
        name: fallbackResults[0].name,
        results: fallbackResults,
      });
    }
  } catch (error: any) {
    console.error("Lỗi Gemini API generate:", error);
    return res.status(500).json({
      error: error.message || "Không thể tạo nội dung bằng Gemini AI. Vui lòng thử lại sau.",
    });
  }
}
