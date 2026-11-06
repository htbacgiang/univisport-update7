/**
 * Từ điển nội dung mẫu chuẩn cho từng ngày lễ Việt Nam
 * Mặc định tự động điền đầy đủ hình ảnh banner và nội dung lời chúc cao cấp chuẩn UniVi (#105d97)
 * Các câu trong lời chúc được kết nối tự nhiên, liền mạch trên cùng một đoạn văn
 */

export interface HolidayTemplateData {
  bannerImage: string;
  bannerAlt: string;
  bannerPosition: string;
  scriptTagline: string;
  mainTitle: string;
  dateSubtitle: string;
  recipientGreeting: string;
  wishes: string[];
  signature: string;
  actionText: string;
}

export const HOLIDAY_DEFAULT_TEMPLATES: Record<string, HolidayTemplateData> = {
  october20: {
    bannerImage: "/images/campaigns/anh-pik-20-10.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10",
    bannerPosition: "object-[center_30%]",
    scriptTagline: "Chúc mừng",
    mainTitle: "NGÀY PHỤ NỮ VIỆT NAM",
    dateSubtitle: "20 THÁNG 10",
    recipientGreeting: "Gửi những người phụ nữ tuyệt vời đang đồng hành cùng UniVi!",
    wishes: [
      "Nhân ngày Phụ nữ Việt Nam 20/10, Đồng Phục Thể thao UniVi xin gửi những lời chúc tốt đẹp và trân trọng nhất đến Quý khách hàng, Quý đối tác cùng toàn thể chị em trong cộng đồng thể thao. Chúc một nửa thế giới luôn mạnh khỏe, hạnh phúc, tự tin và rạng rỡ; luôn có cơ hội phát huy thế mạnh, theo đuổi đam mê và tỏa sáng bằng chính bản sắc của mình. Cảm ơn Quý khách hàng và đối tác đã tin tưởng, đồng hành cùng UniVi trên hành trình lan tỏa tinh thần thể thao và xây dựng những tập thể chuyên nghiệp. Chúc chị em có một ngày 20/10 thật nhiều niềm vui, yêu thương và những khoảnh khắc đáng nhớ!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Gửi ngàn lời chúc yêu thương 🌸",
  },

  tet_holiday: {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Năm Mới Tết Nguyên Đán",
    bannerPosition: "object-[center_35%]",
    scriptTagline: "Khai xuân đắc lộc",
    mainTitle: "CHÚC MỪNG NĂM MỚI - TẾT NGUYÊN ĐÁN",
    dateSubtitle: "XUÂN BÍNH NGỌ - TẾT CỔ TRUYỀN",
    recipientGreeting: "Đồng Phục UniVi Kính Chúc Quý Khách Hàng & Đối Tác Năm Mới An Khang Thịnh Vượng!",
    wishes: [
      "Nhân dịp Tết cổ truyền dân tộc, UniVi Sport xin gửi tới Quý khách hàng, Quý đối tác cùng toàn thể gia đình những lời chúc tốt đẹp, bình an và may mắn nhất. Kính chúc Quý khách một năm mới dồi dào sức khỏe, vạn sự hanh thông, công việc phát đạt và luôn tràn đầy năng lượng tích cực trên mọi chặng đường thể thao. Cảm ơn Quý khách đã luôn tin tưởng và lựa chọn UniVi làm người bạn đồng hành tin cậy trong việc xây dựng hình ảnh tập thể và các giải đấu thể thao chuyên nghiệp. Chúc Quý khách cùng gia đình đón một mùa Tết ấm áp, sum vầy và ngập tràn niềm vui hạnh phúc!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Khai Xuân & Gửi Lời Chúc Tết 🧧",
  },

  women_day_83: {
    bannerImage: "/images/campaigns/anh-pik-20-10.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Ngày Quốc Tế Phụ Nữ 8/3",
    bannerPosition: "object-[center_30%]",
    scriptTagline: "Thân gửi phái đẹp",
    mainTitle: "NGÀY QUỐC TẾ PHỤ NỮ",
    dateSubtitle: "08 THÁNG 03",
    recipientGreeting: "Gửi những người phụ nữ tuyệt vời đang đồng hành và lan tỏa tinh thần thể thao cùng UniVi!",
    wishes: [
      "Nhân ngày Quốc tế Phụ nữ 8/3, UniVi Sport xin trân trọng gửi những lời chúc tốt đẹp, dịu dàng và chân thành nhất đến Quý khách hàng, Quý đối tác cùng toàn thể phái đẹp. Chúc một nửa thế giới luôn luôn rạng rỡ, tự tin, hạnh phúc và không ngừng tỏa sáng với đam mê thể thao và sự nghiệp của riêng mình. Cảm ơn chị em đã luôn tin tưởng, đồng hành cùng UniVi trên hành trình kiến tạo những bộ đồng phục đẳng cấp và giàu bản sắc. Chúc Quý khách có một ngày 8/3 thật nhiều hoa, ngập tràn yêu thương và những khoảnh khắc đáng nhớ bên người thân!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Gửi Ngàn Lời Chúc Yêu Thương 🌸",
  },

  holiday_304: {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Đại Lễ 30/4 & 1/5",
    bannerPosition: "object-[center_30%]",
    scriptTagline: "Tự hào non sông",
    mainTitle: "GIẢI PHÓNG MIỀN NAM & QUỐC TẾ LAO ĐỘNG",
    dateSubtitle: "30 THÁNG 04 - 01 THÁNG 05",
    recipientGreeting: "Chào Mừng Đại Lễ Non Sông Thống Nhất & Tôn Vinh Người Lao Động Việt Nam!",
    wishes: [
      "UniVi Sport xin kính chúc Quý khách hàng, Quý đối tác cùng toàn thể gia đình một kỳ nghỉ lễ 30/4 - 1/5 thật nhiều niềm vui, sức khỏe và ngập tràn hạnh phúc. Hòa chung niềm tự hào dân tộc, chúng tôi xin gửi lời tri ấn sâu sắc đến những đóng góp bền bỉ của người lao động trên khắp mọi miền Tổ quốc. Cảm ơn Quý khách hàng đã luôn đồng hành và ủng hộ các sản phẩm đồng phục chất lượng cao của UniVi trong suốt thời gian qua. Chúc Quý khách có những ngày nghỉ lễ ý nghĩa, an toàn và tái tạo nguồn năng lượng dồi dào để tiếp tục bứt phá mọi mục tiêu!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Bắn Pháo Hoa Mừng Đại Lễ 🎆",
  },

  national_day_29: {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Ngày Quốc Khánh 2/9",
    bannerPosition: "object-[center_35%]",
    scriptTagline: "Tự hào Việt Nam",
    mainTitle: "QUỐC KHÁNH NƯỚC CHXHCN VIỆT NAM",
    dateSubtitle: "02 THÁNG 09",
    recipientGreeting: "Kính Chúc Quý Khách Hàng Kỳ Nghỉ Tết Độc Lập Ngập Tràn Niềm Tự Hào & Hạnh Phúc!",
    wishes: [
      "Nhân dịp Quốc khánh 2/9, Đồng Phục Thể Thao UniVi xin trân trọng gửi tới Quý khách hàng, Quý đối tác những lời chúc bình an, thịnh vượng và hạnh phúc nhất. Tự hào là thương hiệu may mặc thể thao của người Việt, UniVi luôn nỗ lực không ngừng để tạo ra những sản phẩm đồng phục chất lượng cao, đồng hành cùng các đội tuyển, doanh nghiệp và câu lạc bộ trên cả nước. Cảm ơn Quý khách đã luôn tin tưởng và lựa chọn sản phẩm của chúng tôi trong hành trình lan tỏa tinh thần thể thao tích cực. Chúc Quý khách cùng người thân có những ngày nghỉ lễ Quốc khánh thật trọn vẹn, ấm cúng và đầy ý nghĩa!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Chào Mừng Quốc Khánh 2/9 🇻🇳",
  },

  teachers_day_2011: {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: "Đồng Phục UniVi Tri Ân Ngày Nhà Giáo Việt Nam 20/11",
    bannerPosition: "object-[center_35%]",
    scriptTagline: "Tri ân người truyền lửa",
    mainTitle: "NGÀY NHÀ GIÁO VIỆT NAM",
    dateSubtitle: "20 THÁNG 11",
    recipientGreeting: "Tri Ân Thầy Cô Giáo, Huấn Luyện Viên & Các Chuyên Gia Thể Thao Đang Cống Hiến Vì Thế Hệ Trẻ!",
    wishes: [
      "Nhân ngày Nhà giáo Việt Nam 20/11, UniVi Sport xin gửi lời tri ân sâu sắc và những lời chúc tốt đẹp nhất đến các Thầy Cô giáo, các Huấn luyện viên thể thao, Master Yoga & Fitness. Cảm ơn những người thầy, người cô đã luôn tận tụy, kiên nhẫn truyền cảm hứng, rèn luyện thể chất và bồi dưỡng ý chí kiên cường cho bao thế hệ học trò và vận động viên. UniVi tự hào được đồng hành cùng các thầy cô và huấn luyện viên trong việc mang đến những bộ đồng phục thể thao chất lượng, chuyên nghiệp nhất. Kính chúc các Thầy Cô luôn dồi dào sức khỏe, tràn đầy nhiệt huyết và gặt hái thêm nhiều thành công trên sự nghiệp trồng người cao quý!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Gửi Ngàn Lời Tri Ân Thầy Cô 💐",
  },

  xmas_newyear: {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: "Đồng Phục UniVi Chúc Mừng Giáng Sinh & Năm Mới",
    bannerPosition: "object-[center_35%]",
    scriptTagline: "Mùa lễ hội an lành",
    mainTitle: "GIÁNG SINH & CHÀO NĂM MỚI",
    dateSubtitle: "MERRY CHRISTMAS & HAPPY NEW YEAR",
    recipientGreeting: "Kính Chúc Quý Khách Hàng Một Mùa Giáng Sinh Ấm Áp & Năm Mới Bứt Phá Thành Công!",
    wishes: [
      "UniVi Sport xin kính chúc Quý khách hàng cùng gia đình một mùa Giáng sinh an lành, ấm áp, ngập tràn tình yêu thương và tiếng cười. Cảm ơn Quý khách đã luôn tin yêu và lựa chọn các sản phẩm đồng phục của UniVi trong suốt một năm qua. Bước sang thềm năm mới, kính chúc Quý khách dồi dào sức khỏe, may mắn, hạnh phúc viên mãn và luôn cháy hết mình cùng đam mê thể thao. UniVi hân hạnh tiếp tục đồng hành cùng Quý khách kiến tạo nên những hình ảnh đội ngũ chuyên nghiệp và bứt phá mọi giới hạn!",
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Gửi Lời Chúc Giáng Sinh & Năm Mới 🎄",
  },
};

/**
 * Lấy nội dung mẫu mặc định cho một componentKey hoặc tên ngày lễ
 */
export function getHolidayDefaultTemplate(
  componentKey?: string,
  holidayName?: string
): HolidayTemplateData {
  if (componentKey && HOLIDAY_DEFAULT_TEMPLATES[componentKey]) {
    return HOLIDAY_DEFAULT_TEMPLATES[componentKey];
  }

  const name = holidayName || "NGÀY LỄ ĐẶC BIỆT";
  return {
    bannerImage: "/images/banner-home.jpg",
    bannerAlt: `Đồng Phục UniVi Chúc Mừng ${name}`,
    bannerPosition: "object-[center_30%]",
    scriptTagline: "Chúc mừng ngày lễ",
    mainTitle: name.toUpperCase(),
    dateSubtitle: "CHIẾN DỊCH ĐẶC BIỆT UNIVI",
    recipientGreeting: `Đồng Phục UniVi Kính Chúc Quý Khách Hàng Kỳ Nghỉ Lễ Nhiều Niềm Vui & Hạnh Phúc!`,
    wishes: [
      `Nhân dịp ${name}, UniVi Sport xin trân trọng gửi tới Quý khách hàng cùng toàn thể gia đình những lời chúc tốt đẹp, bình an và hạnh phúc nhất. Cảm ơn Quý khách hàng và Quý đối tác đã luôn tin tưởng, đồng hành cùng UniVi trên hành trình lan tỏa tinh thần thể thao và xây dựng những tập thể chuyên nghiệp. Kính chúc Quý khách có những khoảnh khắc tuyệt vời và đáng nhớ bên gia đình và bạn bè!`,
    ],
    signature: "Trân trọng, UniVi Sport",
    actionText: "Gửi Ngàn Lời Chúc Yêu Thương 🌸",
  };
}
