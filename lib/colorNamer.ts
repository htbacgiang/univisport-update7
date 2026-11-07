// Mapping of standard Vietnamese fashion & sportswear color names
interface ColorEntry {
  hex: string;
  name: string;
  r: number;
  g: number;
  b: number;
}

const HEX_COLOR_MAP: { hex: string; name: string }[] = [
  // Đen, trắng, xám
  { hex: "#000000", name: "Đen" },
  { hex: "#111827", name: "Đen tuyền" },
  { hex: "#1f2937", name: "Than chì" },
  { hex: "#374151", name: "Xám đậm" },
  { hex: "#4b5563", name: "Xám tiêu" },
  { hex: "#6b7280", name: "Xám ghi" },
  { hex: "#9ca3af", name: "Xám bạc" },
  { hex: "#d1d5db", name: "Xám sáng" },
  { hex: "#e5e7eb", name: "Ghi sáng" },
  { hex: "#f3f4f6", name: "Trắng xám" },
  { hex: "#ffffff", name: "Trắng" },
  { hex: "#fdfbf7", name: "Trắng kem" },
  { hex: "#f8fafc", name: "Trắng tinh" },
  { hex: "#faf5ef", name: "Trắng ngà" },
  { hex: "#f5f5dc", name: "Màu kem" },
  { hex: "#f5ebe0", name: "Be sáng" },
  { hex: "#e7d7c1", name: "Be" },
  { hex: "#d4b996", name: "Màu Khaki" },

  // Xanh dương, navy, xanh da trời
  { hex: "#0a192f", name: "Xanh navy đậm" },
  { hex: "#0f172a", name: "Xanh đen" },
  { hex: "#1e3a8a", name: "Xanh navy" },
  { hex: "#172554", name: "Xanh than" },
  { hex: "#1d4ed8", name: "Xanh bích" },
  { hex: "#2563eb", name: "Xanh dương" },
  { hex: "#3b82f6", name: "Xanh coban" },
  { hex: "#60a5fa", name: "Xanh da trời" },
  { hex: "#93c5fd", name: "Xanh pastel" },
  { hex: "#bfdbfe", name: "Xanh baby" },
  { hex: "#0284c7", name: "Xanh biển" },
  { hex: "#0ea5e9", name: "Xanh cyan" },
  { hex: "#38bdf8", name: "Xanh thiên thanh" },
  { hex: "#0891b2", name: "Xanh cổ vịt" },
  { hex: "#06b6d4", name: "Xanh ngọc bích" },
  { hex: "#14b8a6", name: "Xanh ngọc" },
  { hex: "#5eead4", name: "Xanh ngọc sáng" },
  { hex: "#a7f3d0", name: "Xanh bạc hà" },

  // Xanh lá, rêu
  { hex: "#14532d", name: "Xanh lá đậm" },
  { hex: "#166534", name: "Xanh lục" },
  { hex: "#15803d", name: "Xanh lá cây" },
  { hex: "#22c55e", name: "Xanh lá tươi" },
  { hex: "#4ade80", name: "Xanh neon" },
  { hex: "#3f6212", name: "Xanh rêu đậm" },
  { hex: "#4d7c0f", name: "Xanh rêu" },
  { hex: "#65a30d", name: "Xanh oliu" },
  { hex: "#84cc16", name: "Xanh cốm" },
  { hex: "#a3e635", name: "Xanh chuối" },

  // Đỏ, mận, hồng
  { hex: "#450a0a", name: "Đỏ bầm" },
  { hex: "#7f1d1d", name: "Đỏ đô" },
  { hex: "#991b1b", name: "Đỏ mận" },
  { hex: "#b91c1c", name: "Đỏ ruby" },
  { hex: "#dc2626", name: "Đỏ tươi" },
  { hex: "#ef4444", name: "Đỏ cờ" },
  { hex: "#f87171", name: "Đỏ san hô" },
  { hex: "#831843", name: "Đỏ rượu" },
  { hex: "#9d174d", name: "Hồng cánh sen đậm" },
  { hex: "#be185d", name: "Hồng mười giờ" },
  { hex: "#db2777", name: "Hồng sen" },
  { hex: "#ec4899", name: "Hồng dâu" },
  { hex: "#f472b6", name: "Hồng phấn" },
  { hex: "#fbcfe8", name: "Hồng pastel" },
  { hex: "#fda4af", name: "Hồng đào" },

  // Cam, vàng
  { hex: "#7c2d12", name: "Nâu cam" },
  { hex: "#9a3412", name: "Cam đất" },
  { hex: "#c2410c", name: "Cam cháy" },
  { hex: "#ea580c", name: "Cam đậm" },
  { hex: "#f97316", name: "Cam tươi" },
  { hex: "#fb923c", name: "Cam cà rốt" },
  { hex: "#fdba74", name: "Cam sữa" },
  { hex: "#713f12", name: "Nâu vàng" },
  { hex: "#854d0e", name: "Vàng mustard" },
  { hex: "#a16207", name: "Vàng đồng" },
  { hex: "#ca8a04", name: "Vàng bò" },
  { hex: "#d97706", name: "Vàng hổ phách" },
  { hex: "#eab308", name: "Vàng tươi" },
  { hex: "#facc15", name: "Vàng chanh" },
  { hex: "#fde047", name: "Vàng nghệ" },
  { hex: "#fef08a", name: "Vàng pastel" },

  // Tím
  { hex: "#3b0764", name: "Tím than" },
  { hex: "#581c87", name: "Tím thẫm" },
  { hex: "#6b21a8", name: "Tím huế" },
  { hex: "#7e22ce", name: "Tím đậm" },
  { hex: "#9333ea", name: "Tím hoa cà" },
  { hex: "#a855f7", name: "Tím phong lan" },
  { hex: "#c084fc", name: "Tím pastel" },
  { hex: "#e9d5ff", name: "Tím nhạt" },

  // Nâu
  { hex: "#291809", name: "Nâu đen" },
  { hex: "#451a03", name: "Nâu sô-cô-la" },
  { hex: "#5b2c14", name: "Nâu cafe" },
  { hex: "#78350f", name: "Nâu đậm" },
  { hex: "#8c532b", name: "Nâu đất" },
  { hex: "#a06c3f", name: "Nâu tây" },
  { hex: "#b45309", name: "Nâu quế" },
  { hex: "#b8860b", name: "Vàng rơm" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

const COLOR_DATABASE: ColorEntry[] = HEX_COLOR_MAP.map((item) => {
  const rgb = hexToRgb(item.hex)!;
  return { ...item, r: rgb.r, g: rgb.g, b: rgb.b };
});

// Human perception weighted distance (Redmean metric)
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (((512 + rmean) * dr * dr) >> 8) +
      4 * dg * dg +
      (((767 - rmean) * db * db) >> 8)
  );
}

export function findClosestColorName(hex: string): string {
  if (!hex) return "Không xác định";
  const rgb = hexToRgb(hex);
  if (!rgb) return "Màu tuỳ chọn";

  let minDistance = Infinity;
  let closestName = "Không xác định";

  for (const entry of COLOR_DATABASE) {
    const dist = colorDistance(rgb.r, rgb.g, rgb.b, entry.r, entry.g, entry.b);
    if (dist < minDistance) {
      minDistance = dist;
      closestName = entry.name;
    }
  }

  return closestName;
}

export function getFallbackColorName(color1?: string, color2?: string): string {
  const name1 = findClosestColorName(color1 || "#000000");
  if (!color2 || !color2.trim()) {
    return name1;
  }
  const name2 = findClosestColorName(color2);
  if (name1.toLowerCase() === name2.toLowerCase()) {
    return name1;
  }
  return `${name1} phối ${name2}`;
}

