import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ContactForm from '../../header/ContactForm';
import ProcessSteps, { PROCESS_STEPS } from '../ProcessSteps';

// Nguồn dữ kiện: docs/knowledge/12-dong-phuc-yoga.md + dữ liệu sản phẩm danh mục Yoga trong DB.
// Không thêm thông số chất liệu, giá, MOQ hoặc năng lực sản xuất chưa có trong knowledge.
// Claim năng lực: chỉ giữ mục [FACT] trong knowledge 03/19/20. MOQ (27 #4), địa chỉ xưởng (27 #6)
// và email công khai (01 §7) còn chờ xác minh → không đưa vào trang.

const heroStats = [
  'Xưởng sản xuất 2.000m2 tại Hà Nội',
  'Công suất 100.000 sản phẩm/tháng',
  'Phòng R&D riêng',
  'Thiết kế miễn phí theo nhận diện studio',
];

const trustBadges = [
  ['Xưởng sản xuất 2.000m2 tại Hà Nội', 'Chủ động sản xuất, kiểm soát chất liệu, size, đường may và tiến độ cho đơn studio.'],
  ['Công suất 100.000 sản phẩm/tháng', 'Phù hợp Yoga Studio nhỏ, chuỗi studio, Wellness Center, workshop và retreat quy mô lớn.'],
  ['Phòng R&D riêng', 'Nghiên cứu cảm giác mặc, độ co giãn, form dáng và trải nghiệm chuyển động.'],
  ['Công nghệ UNI DRY', 'Hỗ trợ đưa hơi ẩm ra ngoài để giảm cảm giác bết dính trong lớp học.'],
  ['Giao hàng toàn quốc', 'Hỗ trợ triển khai đồng phục Yoga cho studio và doanh nghiệp tại nhiều tỉnh thành.'],
  ['Thiết kế miễn phí', 'Tư vấn phối màu, logo, vị trí nhận diện và hệ sản phẩm theo từng vai trò.'],
];

// Phân loại theo dữ liệu mô tả sản phẩm (DB) và bảng mẫu trong knowledge 12.
const productTypes = [
  ['Áo bra Yoga (set bra + legging cạp cao)', 'A001, A005, A007, A008, A11, A12, A15, A3007, A4013, A4014', 'Nâng đỡ vừa, để lộ vai và lưng; nhiều kiểu lưng đan dây, racerback hoặc lệch vai'],
  ['Áo croptop Yoga', 'A006', 'Quai bản to, ôm dáng, che phủ nhiều hơn bra; đa năng cho nhiều lớp tập'],
  ['Áo tập Yoga dáng khác', 'A004 (áo peplum bèo eo), ACT3 (áo Yoga form ôm)', 'Cho studio muốn khác biệt về kiểu dáng hoặc cần thêm lựa chọn che phủ'],
  ['Quần legging Yoga', 'Legging cạp cao đi kèm trong các set', 'Đồng màu với áo, co giãn cao, cạp cao giữ form khi gập và xoắn người'],
  ['Bộ đồ tập Yoga liền thân', 'JUMP13 (jumpsuit sát nách, quần ống loe)', 'Một món duy nhất, lưng đan dây nổi bật, hợp lớp Yoga nhẹ nhàng và chụp ảnh'],
];

const yogaModels = [
  ['A4013', 'Đồng phục Yoga 4013', 'Áo bra lệch vai, vải gân, legging cạp cao cho studio muốn hình ảnh cá tính.', 'https://live.staticflickr.com/65535/55332208090_cd311ace9b_b.jpg', '/san-pham/dong-phuc-yoga-4013', 'Studio cá tính'],
  ['A11', 'Đồng phục Yoga A11', 'Áo bra lưng đan dây chéo kép nâng đỡ, phù hợp HLV Yoga hoặc lớp cần nét nữ tính.', 'https://live.staticflickr.com/65535/54898256343_f46a50ea32_b.jpg', '/san-pham/dong-phuc-yoga-a11', 'HLV Yoga'],
  ['A001', 'Đồng phục Yoga A001', 'Áo bra 2 dây và legging cạp cao, dễ mặc cho studio mới triển khai đồng phục.', 'https://live.staticflickr.com/65535/55331402991_8a49650a7c_b.jpg', '/san-pham/dong-phuc-yoga-a001', 'Mẫu dễ mặc'],
  ['A004', 'Đồng phục Yoga A004', 'Áo peplum bèo eo, lưng đan chéo, 8 màu cho studio cần nhiều lựa chọn đồng bộ.', 'https://live.staticflickr.com/65535/55331789064_413b5bb95a_b.jpg', '/san-pham/dong-phuc-yoga-a004', 'Nhiều màu'],
  ['A005', 'Đồng phục Yoga A005', 'Áo bra lưng đan dây nghệ thuật, nữ tính và nổi bật trong ảnh lớp học.', 'https://live.staticflickr.com/65535/55331958954_be0e8a9806_b.jpg', '/san-pham/dong-phuc-yoga-a005', 'Studio nữ tính'],
  ['A006', 'Đồng phục Yoga A006', 'Áo croptop quai bản to ôm dáng và legging cạp cao, che phủ nhiều hơn bra.', 'https://live.staticflickr.com/65535/55332009409_0812920c5d_b.jpg', '/san-pham/dong-phuc-yoga-a006', 'Croptop đa năng'],
  ['A008', 'Đồng phục Yoga A008', 'Áo bra racerback lưng chữ T nâng đỡ, gọn và linh hoạt cho lớp năng động.', 'https://live.staticflickr.com/65535/55332258690_b983997bb9_b.jpg', '/san-pham/dong-phuc-yoga-a008', 'Lớp năng động'],
  ['A007', 'Đồng phục Yoga A007', 'Áo bra quai bèo cánh tiên, lưng đan dây buộc nữ tính và legging cạp cao.', 'https://live.staticflickr.com/65535/55330886257_9412f79e5e_b.jpg', '/san-pham/dong-phuc-yoga-a007', 'Phong cách nữ tính'],
];

const shirtTypes = [
  ['Áo bra Yoga', 'Cấu trúc chủ đạo trong dòng Yoga của Univi. Bra cần nâng đỡ vừa đủ, không ép ngực, không cấn vai và không xô lệch khi đảo ngược hoặc nâng tay. Kiểu lưng quyết định cảm giác và hình ảnh: lưng đan dây (A11, A005, A007), racerback lưng chữ T (A008), 2 dây cơ bản (A001, A12, A15, A3007) hoặc lệch vai (A4013).'],
  ['Áo croptop Yoga', 'Croptop quai bản to như A006 che phủ nhiều hơn bra, phù hợp người mới tập, lớp đông học viên hoặc studio muốn hình ảnh kín đáo hơn nhưng vẫn gọn gàng. Croptop cần đủ ôm để không cuộn lên khi gập người.'],
  ['Áo tank top và T-shirt Yoga', 'Kín đáo hơn bra, phù hợp nhiều độ tuổi và vóc dáng. Đây là điểm bắt đầu dễ triển khai cho đồng phục hội viên, workshop hoặc lễ tân, trước khi studio mở rộng sang set tập đầy đủ.'],
  ['Áo peplum và áo Yoga dáng riêng', 'Áo peplum bèo eo lưng đan chéo (A004) hoặc áo form ôm như ACT3 giúp studio có thêm lựa chọn khác biệt về kiểu dáng mà vẫn đồng bộ bảng màu nhận diện.'],
];

const styleGroups = [
  ['Nữ tính, điểm nhấn lưng áo', 'Lưng đan dây hoặc chi tiết bèo: A11 (đan dây chéo kép), A005 (đan dây nghệ thuật), A007 (quai bèo cánh tiên, lưng buộc dây), A004 (peplum lưng đan chéo).'],
  ['Năng động, nâng đỡ', 'Racerback lưng chữ T như A008, gọn ở vai và ổn định khi chuyển động nhanh hơn.'],
  ['Tối giản, dễ phối', 'Bra 2 dây hoặc bra cơ bản: A001, A12, A15, A3007. Dễ chọn size, dễ đồng bộ cho cả đội ngũ.'],
  ['Cá tính, khác biệt', 'Bra lệch vai trên nền vải gân như A4013, phù hợp studio muốn hình ảnh mạnh trên mạng xã hội.'],
  ['Thoải mái, che phủ hơn', 'Croptop quai bản to A006 cho người mới tập hoặc lớp cần sự kín đáo.'],
  ['Liền thân, ống loe', 'Jumpsuit JUMP13 sát nách, quần ống loe, lưng đan dây nổi bật cho lớp Yoga nhẹ nhàng và buổi chụp ảnh.'],
];

const chooseCriteria = [
  ['Độ kín khi kéo giãn', 'Legging không xuyên thấu khi gập người, squat hoặc chó úp mặt. Bra và croptop không bị lệch khi đảo ngược.'],
  ['Cạp quần không tụt', 'Cạp cao, đủ ôm để giữ form trong cả buổi tập, không phải kéo lại giữa các tư thế.'],
  ['Áo không cuộn lên', 'Croptop và áo dáng ôm cần giữ vị trí khi nâng tay, vặn mình hoặc nằm trên thảm.'],
  ['Co giãn 4 chiều', 'Tư thế Yoga gập, xoắn và kéo giãn theo nhiều hướng nên vải phải co giãn đều, không gò bó.'],
  ['Đường may giảm ma sát', 'Kiểm tra kỹ vai, lưng, hông, đùi trong và cạp quần vì đây là các vùng dễ cọ vào da hoặc thảm tập.'],
  ['Màu và mức che phủ', 'Chọn theo vai trò người mặc và mức tự tin của đội ngũ, không ép mọi vóc dáng vào cùng một kiểu áo.'],
];

const materials = [
  ['UNI SUPERCOOL', 'Polyamide pha Spandex', 'Mềm, mượt, mát, mịn, co giãn 4 chiều', 'Áo bra, croptop, legging, set HLV Yoga'],
  ['Vải gân (ribbed)', 'Bề mặt gân, dùng trên một số mẫu', 'Tạo hiệu ứng bề mặt, ôm dáng', 'Mẫu cá tính như A4013'],
  ['UNI DRY', 'Công nghệ xử lý thoát ẩm', 'Hỗ trợ đưa hơi ẩm từ da ra bề mặt ngoài để bay hơi', 'Lớp đông người, HLV dạy liên tục, phòng nóng ẩm'],
];

const designPrinciples = [
  ['Làn da thứ hai', 'Nhẹ hơn, mềm hơn, mát hơn để người tập gần như quên mình đang mặc đồ và tập trung vào hơi thở, chuyển động.'],
  ['Ôm sát hỗ trợ vận động', 'Không phải bó chặt, mà là vừa đủ gọn để không cuộn, không vướng và không che mất đường chuyển động khi gập, xoắn hoặc nâng tay.'],
  ['Đường may giảm ma sát', 'Kiểm tra kỹ vai, lưng, hông, đùi trong và cạp quần vì đây là các vùng dễ cọ vào da hoặc thảm tập.'],
];

const studioRoles = [
  ['Lễ tân và tư vấn viên', 'Là điểm chạm đầu tiên nhưng không cần mặc set tập sát da trong cả ca. T-shirt form đứng, Polo thể thao hoặc áo khoác nhẹ thường phù hợp hơn. Màu và logo nên liên kết với đội HLV.'],
  ['Hội viên', 'Hội viên có vóc dáng và mức tự tin khác nhau. T-shirt hoặc tank top là điểm bắt đầu dễ triển khai hơn bra và legging vì ít rào cản size. Khi có phản hồi, studio mới mở rộng sang set tập.'],
  ['Workshop', 'Cần sản phẩm dễ chọn size, nhận diện rõ, phù hợp thời gian sử dụng ngắn. Ngày tổ chức và tên chương trình chỉ nên in khi studio chấp nhận sản phẩm khó dùng lại.'],
  ['Retreat', 'Brief cần ghi rõ khí hậu, lịch hoạt động và mức vận động. Tính năng chống UV hoặc nhanh khô chỉ nên cam kết theo đúng mã vải. Có thể bổ sung áo khoác nhẹ hoặc T-shirt cộng đồng.'],
];

const modelSolutions = [
  ['Boutique Yoga Studio', 'Ưu tiên bảng màu dịu, chất liệu mềm mịn, logo tinh tế và sản phẩm lên hình tốt trong không gian lớp học.'],
  ['Chuỗi Yoga Studio', 'Cần chuẩn hóa 2S Uniform, hồ sơ màu, size, vị trí logo và khả năng đặt bổ sung đồng đều giữa các cơ sở.'],
  ['Wellness Center và resort', 'Cần hình ảnh thư giãn, cao cấp, mức che phủ linh hoạt và chất liệu dễ chịu khi mặc lâu.'],
  ['Wellness doanh nghiệp', 'Cần sản phẩm dễ mặc, kín đáo, phù hợp nhiều vóc dáng và bám màu thương hiệu công ty.'],
];

// Quy trình chung, thay 2 bước nhắc lớp máy/Reformer (Pilates) bằng chuyển động Yoga thực tế.
const yogaProcessSteps = PROCESS_STEPS.map((s) => {
  if (s.step === '01') return { ...s, desc: 'Ai mặc, lớp Yoga nhẹ nhàng hay cường độ cao, bao nhiêu cơ sở, mặc thường xuyên đến đâu và vai trò của từng nhóm.' };
  if (s.step === '05') return { ...s, desc: 'Gập người, chó úp mặt, vặn xoắn, giơ tay, giữ tư thế thăng bằng và đảo ngược để kiểm tra độ kín, cạp quần và áo không cuộn.' };
  return s;
});

const processChecklist = [
  ['Khảo sát', 'Mô hình studio, vai trò người mặc, tần suất sử dụng, ngân sách, ngày cần hàng và mục tiêu thương hiệu.'],
  ['Chất liệu', 'Chọn theo vai trò: HLV Yoga, lễ tân, hội viên, workshop, retreat hoặc wellness doanh nghiệp.'],
  ['Thiết kế', 'Chốt màu, logo, vị trí in/thêu, form, mức che phủ và hình mô phỏng trước khi sản xuất.'],
  ['Mặc thử', 'Test bằng động tác gập người, xoắn, squat, nâng tay, plank và các tư thế đảo ngược.'],
  ['Sản xuất', 'Kiểm tra vải, size, đường may, logo, đóng gói và tiến độ giao hàng.'],
  ['Đặt bổ sung', 'Lưu mã vải, bảng màu, size chart, file thiết kế và mẫu đã duyệt.'],
];

const caseStudies = [
  ['Studio Yoga 5 HLV', 'Bắt đầu bằng một set bra + legging cho giáo viên và một mẫu T-shirt workshop cho học viên. Sau khi có phản hồi tốt, mở rộng sang retreat hoặc bộ sưu tập member.'],
  ['Chuỗi Yoga Studio', 'Giữ chung bảng màu và vị trí logo; HLV mặc set Yoga, lễ tân mặc T-shirt hoặc Polo, hội viên có áo cộng đồng. Lưu hồ sơ mẫu để cơ sở mới cấp phát đúng sản phẩm.'],
  ['Wellness Retreat', 'Chọn T-shirt retreat, áo khoác nhẹ, tank top hoặc set mềm cho giáo viên. Nếu có nhiều hoạt động, chia sản phẩm theo buổi tập, di chuyển và chụp ảnh cộng đồng.'],
];

export const yogaFaqs = [
  ['Đồng phục Yoga của Univi gồm những sản phẩm nào?', 'Dòng Yoga của Univi chủ yếu là set 2 món đồng màu gồm áo bra hoặc croptop và quần legging cạp cao. Ngoài ra có mẫu áo Yoga ACT3 và jumpsuit JUMP13. Studio có thể trao đổi thêm về tank top, T-shirt hoặc áo khoác Yoga khi xây hệ đồng phục cho nhiều vai trò.'],
  ['Áo tập Yoga nữ nên chọn áo bra hay áo croptop?', 'Áo bra phù hợp HLV và lớp chuyên sâu cần thị phạm rõ chuyển động. Áo croptop quai bản to che phủ nhiều hơn, phù hợp người mới tập, lớp đông học viên hoặc studio muốn hình ảnh kín đáo hơn. Cả hai cần nâng đỡ vừa đủ, không ép ngực và không cuộn khi gập người.'],
  ['Quần legging Yoga thế nào là đạt?', 'Legging Yoga cần không xuyên thấu khi gập người hoặc squat, không tụt cạp, co giãn cao và giữ form sau nhiều lần kéo giãn. Studio nên mặc thử bằng chuyển động thật trước khi sản xuất số lượng lớn.'],
  ['Đồ tập Yoga nên chọn chất liệu gì?', 'Nên ưu tiên vải Polyamide pha Spandex như UNI SUPERCOOL: mềm, mịn, mát và co giãn 4 chiều. Với HLV dạy nhiều ca hoặc lớp đông người, công nghệ UNI DRY hỗ trợ giảm cảm giác ẩm bết.'],
  ['Có nên may đồ tập Yoga bằng Cotton không?', 'Không nên chỉ chọn Cotton. Cotton có thể mềm khi mặc nhẹ, nhưng dễ ẩm, nặng và bết khi giữ mồ hôi lâu. Yoga cần vải đi theo chuyển động và giữ dáng sau nhiều lần kéo giãn.'],
  ['Số lượng tối thiểu khi đặt đồng phục Yoga là bao nhiêu?', 'Số lượng tối thiểu phụ thuộc vào việc studio chọn mẫu và vải có sẵn hay thiết kế riêng, cùng màu vải và kiểu dáng. Univi tư vấn số lượng cụ thể theo từng mẫu khi nhận brief của studio.'],
  ['Univi có thiết kế đồng phục Yoga miễn phí không?', 'Có. Univi hỗ trợ tư vấn ý tưởng, phối màu và thiết kế đồng phục theo nhận diện thương hiệu của studio. Mục tiêu là giúp mẫu đồng phục phù hợp vai trò người mặc, không chỉ đẹp trên hình mô phỏng.'],
  ['Đồng phục HLV Yoga nên là áo bra, tank top hay T-shirt?', 'Tùy định vị studio và mức độ tự tin của đội ngũ. Áo bra và legging phù hợp lớp chuyên sâu. Tank top hoặc T-shirt ôm vừa phù hợp nhiều vóc dáng hơn và dễ dùng cho studio mới triển khai đồng phục.'],
  ['Có nên làm đồng phục riêng cho hội viên Yoga Studio không?', 'Có, nếu studio muốn xây cộng đồng và tăng nhận diện. Đồng phục hội viên có thể bắt đầu từ áo workshop, áo retreat hoặc sản phẩm theo khóa học thay vì triển khai ngay một bộ đồ tập đầy đủ.'],
  ['Univi có lưu file thiết kế để đặt bổ sung không?', 'Studio nên lưu bảng màu, logo, vị trí in, mã vải và size chart. Univi có thể hỗ trợ quy trình này để các đợt đặt bổ sung ổn định hơn và tránh lệch mẫu giữa các lần sản xuất.'],
  ['Univi có giao đồng phục Yoga toàn quốc không?', 'Có. Univi hỗ trợ giao hàng toàn quốc cho các dự án đồng phục Yoga Studio, Wellness Center và chương trình wellness doanh nghiệp.'],
  ['Studio nên chuẩn bị gì trước khi liên hệ tư vấn?', 'Bạn nên chuẩn bị logo, màu thương hiệu, số lượng dự kiến, nhóm người mặc, mô hình studio và mục tiêu sử dụng như HLV, lễ tân, hội viên, workshop, retreat hoặc chương trình wellness cho doanh nghiệp.'],
];

function Section({ id, title, children, className = '' }) {
  return (
    <article id={id} className={`scroll-mt-24 bg-white py-2 ${className}`}>
      <h2 className="mb-3 text-xl md:text-2xl font-medium tracking-tight leading-tight text-gray-900">
        {title}
      </h2>
      {children}
    </article>
  );
}

function InlineLink({ href, children }) {
  return (
    <Link href={href} className="font-semibold text-[#105d97] hover:underline">
      {children}
    </Link>
  );
}

function TextCard({ title, children }) {
  return (
    <div className="border-l-4 border-[#105d97]/20 py-1 pl-4">
      <h3 className="mb-1 text-base font-medium text-gray-900">{title}</h3>
      <div className="text-sm leading-6 text-gray-700 md:text-base">{children}</div>
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold text-gray-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-4 py-3 align-top text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageBlock({ src, alt, caption, priority = false }) {
  return (
    <figure className="overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        className="h-auto w-full object-cover"
        sizes="(max-width: 1024px) 100vw, 900px"
        priority={priority}
      />
      <figcaption className="px-4 py-3 text-center text-sm italic text-gray-500">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function YogaUniviPage({ products = [] }) {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const productCount = Array.isArray(products) ? products.length : 0;

  return (
    <div className="text-gray-700">
      <section className="bg-white pb-8">
        <p className="mb-2 text-xs font-medium text-[#105d97] uppercase tracking-[0.15em]">UniFlow by Univi</p>
        <p className="text-2xl md:text-3xl font-medium tracking-tight leading-tight text-gray-900">
          Đồng Phục Yoga Theo Yêu Cầu: Áo Tập Yoga, Quần Legging Và Bộ Đồ Tập Yoga Nữ Cho Studio
        </p>
        <div className="mt-4 space-y-2 text-base leading-6 text-gray-700">
          <p>
            Đừng chọn đồng phục Yoga hay đồ tập Yoga chỉ vì đẹp. Một bộ đồ lên hình tốt vẫn có thể
            thất bại trong lớp học nếu vải bí nóng, legging tụt cạp, áo cuộn khi nâng tay hoặc vải
            mỏng lộ khi gập người.
          </p>
          <p>
            Với Yoga Studio, HLV Yoga và Wellness Center,{' '}
            <InlineLink href="/gioi-thieu">Đồng Phục Univi</InlineLink> xem đồng phục là một phần
            của trải nghiệm dịch vụ: áo tập Yoga và quần tập Yoga phải đi theo hơi thở và chuyển
            động trước, sau đó mới đến màu sắc, logo và hình ảnh thương hiệu của studio.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsQuoteFormOpen(true)}
            className="rounded border border-[#105d97] bg-[#105d97] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0e4f82]"
          >
            Nhận tư vấn
          </button>
          <Link
            href="#bo-suu-tap-dong-phuc-yoga"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#105d97] hover:text-[#105d97]"
          >
            Xem bộ sưu tập
          </Link>
        </div>
      </section>

      <Section id="bo-suu-tap-dong-phuc-yoga" title="1. Bộ Sưu Tập Đồng Phục Yoga Tại Univi" className="border-t border-gray-100">
        <div className="mb-4 space-y-3 leading-6">
          <p>
            Dòng đồng phục Yoga của Univi{' '}
            {productCount > 0 ? `hiện có ${productCount} mẫu, phần lớn là` : 'chủ yếu là'} set 2
            món đồng màu gồm áo bra hoặc áo croptop và quần legging cạp cao, cùng mẫu áo Yoga ACT3
            và jumpsuit JUMP13. Mỗi mẫu có
            nhiều màu để studio chọn theo bảng màu nhận diện; A004 có 8 màu, A005 có 7 màu.
          </p>
          <p>
            Bảng dưới đây phân loại các mẫu theo kiểu áo để bạn tìm nhanh áo bra Yoga, áo croptop
            Yoga, quần legging Yoga hoặc bộ đồ tập Yoga liền thân phù hợp với lớp học của mình.
          </p>
        </div>
        <div className="mb-6">
          <SimpleTable
            headers={['Nhóm sản phẩm', 'Mã mẫu', 'Đặc điểm']}
            rows={productTypes}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6">
          {yogaModels.map(([code, name, summary, image, href, fit]) => (
            <Link key={code} href={href} className="block pb-6">
              <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden bg-gray-50">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 220px"
                />
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-sm font-medium text-[#105d97]">{code}</p>
                <h3 className="text-lg md:text-xl font-medium text-gray-900">{name}</h3>
                <p className="text-sm leading-6 text-gray-700">{summary}</p>
                <p className="text-sm font-semibold text-gray-900">Phù hợp: {fit}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="ao-tap-yoga" title="2. Các Loại Áo Tập Yoga Phổ Biến">
        <p className="mb-6 leading-6">
          Áo tập Yoga nữ quyết định phần lớn cảm giác khi giữ tư thế: vai có bị cấn không, ngực có
          được nâng đỡ vừa đủ không và áo có cuộn lên khi gập người không. Mỗi kiểu áo phù hợp một
          nhóm người mặc và một hình ảnh studio khác nhau.
        </p>
        <div className="space-y-5">
          {shirtTypes.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-6">
          <ImageBlock
            src="/images/yoga-1.jpg"
            alt="Lớp Yoga mặc áo tập Yoga nữ dáng peplum, áo bra lưng đan chéo và legging cạp cao"
            caption="Áo bra, áo peplum và legging cạp cao đồng màu: các kiểu áo tập Yoga phổ biến trong đồng phục studio."
            priority
          />
        </div>
      </Section>

      <Section id="quan-tap-yoga" title="3. Quần Tập Yoga Và Cách Chọn Form Phù Hợp">
        <div className="space-y-3 leading-6">
          <p>
            Quần legging Yoga là món chịu nhiều lực kéo nhất trong một buổi tập. Khi gập người, chó
            úp mặt hoặc squat, vải bị kéo căng ở hông và đùi; nếu vải mỏng hoặc độ co giãn thấp,
            legging dễ xuyên thấu và mất form sau vài lần giặt.
          </p>
          <p>
            Các set Yoga của Univi dùng legging cạp cao đồng màu với áo. Cạp cao giúp giữ bụng
            gọn, hạn chế tụt khi xoắn người và tạo đường liền mạch với áo bra hoặc croptop. Với lớp
            Yoga nhẹ nhàng hoặc buổi chụp ảnh, jumpsuit JUMP13 với quần ống loe là lựa chọn khác
            biệt, một món duy nhất mà vẫn gọn.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextCard title="Ba yêu cầu bắt buộc với legging Yoga">
            <p>Không xuyên thấu, không tụt cạp và co giãn cao. Thiếu một trong ba, người tập sẽ phải chỉnh quần giữa các tư thế thay vì tập trung vào hơi thở.</p>
          </TextCard>
          <TextCard title="Thử bằng chuyển động thật">
            <p>Trước khi đặt số lượng lớn, studio nên mặc thử bằng động tác gập người, squat, chó úp mặt và các tư thế đảo ngược dưới ánh sáng lớp học.</p>
          </TextCard>
        </div>
      </Section>

      <Section id="bo-do-tap-yoga-nu" title="4. Bộ Đồ Tập Yoga Nữ Theo Phong Cách">
        <p className="mb-4 leading-6">
          Yoga mang tính lifestyle cao; màu sắc và kiểu dáng ảnh hưởng trực tiếp đến cảm xúc tập
          luyện. Studio có thể chọn bộ đồ tập Yoga nữ theo phong cách muốn truyền tải, sau đó đồng
          bộ màu theo nhận diện thương hiệu.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {styleGroups.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
      </Section>

      <Section id="cach-chon-quan-ao-tap-yoga" title="5. Cách Chọn Quần Áo Tập Yoga Phù Hợp">
        <p className="mb-6 leading-6">
          Quần áo tập Yoga tốt là bộ đồ người mặc quên đi trong lúc tập. Trước khi chốt mẫu, hãy
          kiểm tra theo các tiêu chí dưới đây thay vì chỉ nhìn ảnh sản phẩm.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {chooseCriteria.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-6">
          <ImageBlock
            src="https://live.staticflickr.com/65535/55331826240_0abf20a194_b.jpg"
            alt="Quần áo tập Yoga ôm sát hỗ trợ vận động"
            caption="Form đúng giúp trang phục không cuộn, không vướng và không che mất đường chuyển động."
          />
        </div>
      </Section>

      <Section id="chat-lieu" title="6. Chất Liệu Vải May Đồ Tập Yoga">
        <div className="space-y-3 leading-6">
          <p>
            Chất liệu là phần quan trọng nhất của đồ tập Yoga. Da tiếp xúc trực tiếp với vải trong
            thời gian dài khi giữ tư thế, nằm trên thảm hoặc xoắn người trong không gian kín.
          </p>
          <p>
            <InlineLink href="/vai-super-cool-la-gi">Vải Super Cool</InlineLink> là chất liệu chủ
            lực của dòng Yoga Univi, dùng cho áo bra, croptop và legging. Một số mẫu dùng vải gân
            (ribbed) để tạo hiệu ứng bề mặt. Với HLV dạy nhiều ca hoặc lớp đông người,{' '}
            <InlineLink href="/cong-nghe-uni-dry">công nghệ UNI DRY</InlineLink> hỗ trợ kiểm soát
            cảm giác ẩm bết tốt hơn.
          </p>
        </div>
        <div className="mt-6">
          <SimpleTable
            headers={['Chất liệu', 'Cấu tạo / định vị', 'Ưu điểm', 'Phù hợp']}
            rows={materials}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {designPrinciples.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextCard title="Không nên chỉ chọn Cotton">
            <p>
              Cotton có thể mềm khi mặc nhẹ, nhưng dễ ẩm, nặng và bết khi giữ mồ hôi lâu. Yoga cần
              vải đi theo chuyển động, hỗ trợ thoát ẩm và giữ dáng sau nhiều lần kéo giãn.
            </p>
          </TextCard>
          <TextCard title="Kiểm tra bằng chuyển động thật">
            <p>
              Studio nên thử mẫu bằng động tác gập, xoắn, squat, nâng tay, plank và các tư thế đảo
              ngược trước khi sản xuất số lượng lớn.
            </p>
          </TextCard>
        </div>
        <div className="mt-6">
          <ImageBlock
            src="/images/vai-yoga.jpg"
            alt="Cận cảnh vải gân và đường may áo bra Yoga Univi"
            caption="Vải gân và đường may trên áo bra Yoga: chất liệu chỉ có ý nghĩa khi người mặc cảm nhận được trong lúc tập."
          />
        </div>
      </Section>

      <Section id="dong-phuc-hlv-yoga" title="7. Đồng Phục HLV Yoga">
        <div className="space-y-3 leading-6">
          <p>
            Giáo viên Yoga cần thị phạm các tư thế gập, xoắn, kéo giãn và đảo ngược trong nhiều ca
            liên tục. Legging cạp cao, áo bra nâng đỡ vừa, áo croptop quai bản to, tank top hoặc
            T-shirt ôm vừa là những lựa chọn thực tế. Sản phẩm cần ổn định khi nâng tay, không cuộn
            áo, không tụt cạp và đủ kín khi kéo giãn.
          </p>
          <p>
            Đồng phục giúp học viên mới nhận ra ai là người hướng dẫn, đồng thời giúp HLV có hình
            ảnh gọn gàng khi quay video bài tập hoặc chụp ảnh lớp học. Form ổn định còn hạn chế việc
            phải kéo áo, chỉnh cạp quần giữa lớp, một chi tiết nhỏ nhưng ảnh hưởng trực tiếp đến cảm
            nhận của học viên. Xem thêm hướng dẫn về{' '}
            <InlineLink href="/bai-viet/dong-phuc-yoga-studio">đồng phục Yoga Studio và HLV</InlineLink>.
          </p>
        </div>
        <div className="mt-6">
          <ImageBlock
            src="https://live.staticflickr.com/65535/55373505125_49f448bfa5_b.jpg"
            alt="Đồng phục HLV Yoga và đội ngũ studio"
            caption="Đồng phục HLV Yoga cần ổn định khi thị phạm và đồng bộ với nhận diện studio."
          />
        </div>
      </Section>

      <Section id="dong-phuc-yoga-studio" title="8. Đồng Phục Yoga Studio">
        <div className="mb-6 space-y-3 leading-6">
          <p>
            Đồng phục Yoga Studio là hệ trang phục cho tất cả những người cùng xuất hiện trong
            studio: HLV, lễ tân, tư vấn viên, học viên và cộng đồng workshop hoặc retreat. Sản phẩm
            khác nhau, nhưng dùng chung ngôn ngữ về màu, logo và tinh thần thương hiệu.
          </p>
          <p>
            Màu sắc và logo lặp lại trên giáo viên, quầy lễ tân, ảnh lớp học và video tạo thành một
            mã nhận diện. Khi mở thêm cơ sở, bộ chuẩn gồm file logo, mã màu, mã vải, bảng size và
            mẫu duyệt giúp cơ sở mới giữ cùng trải nghiệm hình ảnh.{' '}
            <InlineLink href="/giai-phap-2s">Giải pháp 2S Uniform</InlineLink> của Univi tách rõ
            Staff Uniform cho nhân sự và Student/Member Uniform cho học viên để việc mở rộng dễ quản
            lý hơn.
          </p>
        </div>
        <div className="space-y-5">
          {studioRoles.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {modelSolutions.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-6">
          <ImageBlock
            src="/bo-suu-tap/yoga-2.jpg"
            alt="Lớp Yoga Studio mặc đồng phục Yoga đồng bộ: áo bra lệch vai và legging cạp cao cùng màu"
            caption="Đồng phục tạo giá trị khi được mặc thường xuyên, hỗ trợ đúng công việc và giữ hình ảnh studio nhất quán."
          />
        </div>
      </Section>

      <Section id="may-dong-phuc-yoga-theo-yeu-cau" title="9. May Đồng Phục Yoga Theo Yêu Cầu">
        <div className="mb-4 space-y-3 leading-6">
          <p>
            May đồng phục Yoga theo yêu cầu khác mua đồ tập bán lẻ ở chỗ sản phẩm phải phù hợp nhiều
            vóc dáng, đúng vai trò, chịu được tần suất sử dụng, lên hình đồng bộ và có hồ sơ để đặt
            bổ sung. Studio có thể chọn mẫu sẵn rồi đổi màu theo nhận diện, hoặc làm việc với Univi
            để chốt màu, logo, vị trí in/thêu, form và mức che phủ.
          </p>
          <p>
            Khi studio mở thêm lớp, tuyển thêm HLV hoặc tổ chức workshop mới,{' '}
            <InlineLink href="/xuong-may-dong-phuc-univi">xưởng sản xuất đồng phục thể thao</InlineLink>{' '}
            cần bảo đảm khả năng tái sản xuất và kiểm soát chất lượng. Bạn có thể xem thêm{' '}
            <InlineLink href="/ho-so-nang-luc">hồ sơ năng lực Univi</InlineLink> và bài viết{' '}
            <InlineLink href="/bai-viet/may-dong-phuc-yoga">may đồng phục Yoga chuyên dụng</InlineLink>{' '}
            trước khi lựa chọn đối tác. Univi hỗ trợ giao hàng toàn quốc, từ Hà Nội, TP.HCM đến Đà
            Nẵng và các tỉnh thành khác.
          </p>
        </div>
        <div className="mb-6 overflow-hidden border border-gray-200">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/0AABoh2a-Sk"
            title="Năng lực sản xuất đồng phục thể thao Univi"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustBadges.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
      </Section>

      <Section id="quy-trinh" title="10. Quy Trình Thiết Kế Và Sản Xuất">
        <p className="mb-5 leading-6">
          Một dự án đồng phục Yoga tốt cần chất liệu, thiết kế và năng lực sản xuất đi cùng nhau.
          Nếu chỉ có mẫu đẹp nhưng không tái sản xuất ổn định, studio sẽ gặp khó khi tuyển thêm nhân
          sự hoặc tổ chức chương trình mới.
        </p>
        <ProcessSteps variant="vertical" steps={yogaProcessSteps} />
        <div className="mt-6">
          <SimpleTable
            headers={['Hạng mục', 'Cần chuẩn bị']}
            rows={processChecklist}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {caseStudies.map(([title, text]) => (
            <TextCard key={title} title={title}>
              <p>{text}</p>
            </TextCard>
          ))}
        </div>
        <div className="mt-6 rounded-lg bg-gray-50 p-5">
          <p className="text-lg font-medium text-gray-900">Checklist trước khi chốt đơn</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-gray-700 md:grid-cols-2">
            {[
              'Studio đã xác định rõ vai trò người mặc chưa?',
              'Mỗi vai trò có yêu cầu chất liệu và dáng mặc riêng chưa?',
              'Mẫu đã được mặc thử bằng chuyển động thật chưa?',
              'Bảng màu thương hiệu đã được chuẩn hóa chưa?',
              'Logo đã có vị trí cố định chưa?',
              'Studio có cần đồng phục cho hội viên, workshop hoặc retreat không?',
              'Nhà cung cấp có khả năng đặt bổ sung không?',
              'Có lưu file thiết kế, mã vải và size chart không?',
            ].map((item) => (
              <li key={item} className="border-l-2 border-[#105d97]/20 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <ImageBlock
            src="https://live.staticflickr.com/65535/55373233833_a455fac31d_b.jpg"
            alt="May đồng phục Yoga theo yêu cầu tại Univi"
            caption="Univi phát triển đồng phục Yoga theo nguyên tắc đúng chất liệu, đúng vai trò, đúng chuyển động và đúng nhận diện thương hiệu."
          />
        </div>
      </Section>

      <section className="bg-[#105d97] p-5 text-white">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-100">
              Univi SPORTS UNIFORM - YOUR UNIFORM, YOUR BRAND!
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-medium tracking-tight leading-tight">
              Liên Hệ Với Xưởng May Đồng Phục Univi Ngay Hôm Nay
            </h2>

            <div className="mt-3 grid gap-1 text-sm text-blue-50">
              <p><span className="font-semibold">Văn phòng:</span> Nhà D14, ngõ 180 đường Thanh Bình, phường Hà Đông, thành phố Hà Nội</p>
              <p><span className="font-semibold">Xưởng sản xuất:</span> Hà Nội</p>
              <p><span className="font-semibold">Hotline:</span> 0834.204.999 / 096.156.7997</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuoteFormOpen(true)}
            className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-[#105d97] hover:bg-blue-50"
          >
            Nhận tư vấn đồng phục Yoga
          </button>
        </div>
      </section>

      <Section id="faq" title="Câu Hỏi Thường Gặp Về Đồng Phục Yoga">
        <div className="space-y-3">
          {yogaFaqs.map(([question, answer]) => (
            <details key={question} className="group rounded-lg border border-gray-200 bg-gray-50">
              <summary className="cursor-pointer px-4 py-3 font-semibold text-gray-900">
                {question}
              </summary>
              <p className="px-4 py-3 text-sm leading-6 text-gray-700">{answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <ContactForm
        source="Đồng phục Yoga - Nhận tư vấn"
        isModal
        isOpen={isQuoteFormOpen}
        onClose={() => setIsQuoteFormOpen(false)}
      />
    </div>
  );
}
