import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ContactForm from '../../header/ContactForm';
import ProcessSteps from '../ProcessSteps';
import BangMauHero from '../bang-mau/BangMauHero';

export const pilatesFaqs = [
  [
    'Đồng phục, áo tập Pilates khác đồ tập Yoga thế nào?',
    'Hai loại có thể dùng chung một số kiểu, nhưng Pilates đòi hỏi HLV nhìn rõ trục vai, hông, cột sống và đầu gối, và người mặc còn phải tập trên máy. Vì vậy nên ưu tiên form ổn định, che phủ tốt và ít chi tiết gây vướng.'
  ],
  [
    'Áo tập Pilates nên chọn form ôm hay rộng?',
    'Ôm vừa đủ. Đủ sát để thấy rõ căn chỉnh, nhưng vẫn co giãn để không gò bó khi cúi, xoay, nằm hay giơ tay. Áo quá rộng dễ tốc lên khi cuộn người hoặc nằm trên máy, và che mất đường vai, lưng mà HLV cần quan sát.'
  ],
  [
    'Chất liệu nào phù hợp đồng phục Pilates?',
    'Hãy tìm chất liệu mềm, mịn, co giãn và hồi form tốt. UNI SUPERCOOL (89% Polyamide – 11% Elastane, 180 GSM) kết hợp công nghệ UNI DRY là một lựa chọn bạn có thể trao đổi với Univi. Dù vậy, vẫn nên xem mẫu và mặc thử.'
  ],
  [
    'Tập Reformer nên chọn đồng phục thế nào?',
    'Ưu tiên form không xô lệch, che phủ ổn định, không có chi tiết cứng hay dây thừa dễ cấn. HLV nên thử trực tiếp các động tác nằm, trượt, đẩy và đổi tư thế trên máy trước khi chốt.'
  ],
  [
    'Áo tập Pilates nữ cần lưu ý gì về độ che phủ?',
    'Khi cúi, giơ tay hay nằm trên máy, áo dễ bị kéo lên hoặc lộ ở nách, eo và gấu áo. Nên chọn áo có độ dài và độ ôm giữ được vị trí khi vận động. Nếu chọn croptop, hãy phối với legging cạp cao để phần eo không hở quá nhiều. Cách kiểm tra chắc nhất vẫn là mặc thử và tập vài động tác thật.'
  ],
  [
    'Nên chọn áo tập Pilates ngắn tay hay dài tay?',
    'Áo ngắn tay và croptop gọn, thoáng, giúp HLV dễ quan sát vai và cánh tay khi thị phạm. Áo dài tay như mẫu PLT03 hợp khi phòng tập lạnh hoặc studio muốn hình ảnh kín đáo, thanh lịch hơn. Studio có thể chọn cả hai trong cùng hệ màu để HLV đổi theo lịch dạy.'
  ],
  [
    'HLV nam nên mặc áo tập Pilates kiểu nào?',
    'Nguyên tắc giống HLV nữ: áo ôm vừa, co giãn, không quá rộng ở thân để học viên nhìn rõ trục vai và lưng khi thị phạm. Áo thun ôm vừa hoặc polo thể thao là hai hướng có thể cân nhắc. Các mẫu Pilates trên trang hiện chủ yếu là mẫu nữ, vì vậy với HLV nam, studio nên trao đổi trực tiếp để Univi tư vấn kiểu dáng và chất liệu.'
  ],
  [
    'Studio Pilates nên may đồng phục cho những vị trí nào?',
    'Có thể bắt đầu với HLV. Khi muốn hình ảnh đồng bộ hơn, studio bổ sung lễ tân, quản lý, rồi đến học viên hoặc nhóm sự kiện theo mô hình Staff Uniform và Member Uniform.'
  ],
  [
    'Có thiết kế theo nhận diện studio không?',
    'Có. Univi tư vấn theo logo, màu chủ đạo, vị trí logo, form và vai trò người mặc. Mockup nên được duyệt cùng mẫu vải thật và mẫu mặc thử.'
  ],
  [
    'Có mặc thử, xem mẫu trước khi đặt không?',
    'Có. Quy trình có bước may mẫu và kiểm tra form, đường may, màu, logo trước khi sản xuất toàn bộ. HLV nên vận động thật khi thử, kể cả trên máy.'
  ],
  [
    'Đặt thêm khi tuyển HLV mới có đúng màu, đúng form không?',
    'Univi lưu thông số rập, màu và logo để hỗ trợ đặt lại đồng bộ. Studio cũng nên tự giữ mẫu chuẩn, mã màu, file logo và bảng size để đối chiếu.'
  ],
  [
    'Số lượng tối thiểu là bao nhiêu?',
    'Tùy mẫu và dòng vải. Univi nhận đặt theo số lượng phù hợp với từng cấu hình; bạn liên hệ để được tư vấn con số cụ thể.'
  ],
  [
    'Giáo viên Pilates nên mặc polo hay áo thun?',
    'Tùy vai trò và môi trường. Polo hợp với vị trí cần vẻ lịch sự như lễ tân, quản lý. Áo thun ôm vừa hợp khi HLV phải thị phạm nhiều. Không có quy định cứng; quan trọng là HLV mặc thử và thấy thoải mái.'
  ]
];

const tocItems = [
  { id: 'tong-quan-ve-dong-phuc-pilates', title: '1. Tổng quan về đồng phục Pilates' },
  { id: 'dong-phuc-pilates-danh-cho-nhung-ai', title: '2. Đồng phục Pilates dành cho những ai?' },
  { id: 'dong-phuc-pilates-gom-nhung-san-pham-nao', title: '3. Đồng phục Pilates gồm những loại áo, quần nào?' },
  { id: 'tieu-chuan-lua-chon-dong-phuc-pilates', title: '4. Tiêu chí chọn áo tập Pilates và đồng phục' },
  { id: 'thiet-ke-dong-phuc-pilates-theo-nhan-dien-thuong-hieu', title: '5. Đồng phục Pilates trong nhận diện thương hiệu studio' },
  { id: 'cac-mau-dong-phuc-pilates', title: '6. Các mẫu áo tập và đồng phục Pilates' },
  { id: 'bang-mau-dong-phuc-pilates', title: '7. Bảng màu đồng phục Pilates' },
  { id: 'quy-trinh-dat-may-dong-phuc-pilates', title: '8. Quy trình đặt may đồng phục Pilates' },
  { id: 'so-luong-toi-thieu-va-thoi-gian-san-xuat', title: '9. Số lượng tối thiểu và thời gian sản xuất' },
  { id: 'bao-gia-dong-phuc-pilates', title: '10. Báo giá đồng phục Pilates' },
  { id: 'kinh-nghiem-dat-dong-phuc-pilates-cho-studio', title: '11. Kinh nghiệm đặt đồng phục Pilates cho studio' },
  { id: 'cau-hoi-thuong-gap', title: '12. Câu hỏi thường gặp' },
  { id: 'giai-phap-dong-phuc-pilates-cua-univi', title: '13. Giải pháp đồng phục Pilates của Univi' },
  { id: 'ket-luan', title: '14. Kết luận' },
];

const pilatesModels = [
  {
    code: 'AG29',
    name: 'Áo Đồng Phục Pilates AG29',
    desc: 'Áo tập Pilates nữ dáng ôm gọn, cổ cao, khóa kéo ngắn, tay ngắn',
    colors: 7,
    isNew: true,
    fit: '7 màu (đỏ thẫm, xanh ngọc, đen, vàng, xanh mint, hồng nhạt, cam). Dành cho HLV và nhân sự studio Pilates.',
    href: '/san-pham/ao-dong-phuc-pilates-ag29',
    alt: 'Áo tập Pilates nữ AG29 tay ngắn, cổ cao khóa kéo - đồng phục Pilates Univi',
    img: 'https://live.staticflickr.com/65535/55564396724_02804ebf61_b.jpg'
  },
  {
    code: 'PL15',
    name: 'Đồng Phục Pilates PL15',
    desc: 'Polo thể thao cổ bẻ, khóa kéo 1/4, phối màu hai bên sườn',
    colors: 4,
    fit: 'Áo polo đồng phục Pilates dành cho lễ tân, quản lý và HLV studio Pilates.',
    href: '/san-pham/dong-phuc-pilates-pl15',
    alt: 'Áo polo đồng phục Pilates PL15 cổ bẻ, khóa kéo 1/4 cho lễ tân và HLV',
    img: 'https://live.staticflickr.com/65535/55342975852_735caef9ab_b.jpg'
  },
  {
    code: 'ACT1',
    name: 'Đồng phục Pilates ACT1',
    desc: 'Set áo tập ôm gọn đi cùng legging cạp cao, thiết kế tối giản',
    colors: 5,
    fit: 'Thiết kế tối giản, tập trung vào chuyển động; 5 màu dễ chọn theo không gian và nhận diện studio.',
    href: '/san-pham/dong-phuc-yoga-act1',
    alt: 'Set áo tập Pilates ACT1 ôm gọn và legging cạp cao',
    img: 'https://live.staticflickr.com/65535/54898282848_92c3b05acc_b.jpg'
  },
  {
    code: 'ACT7',
    name: 'Đồng phục Pilates ACT7',
    desc: 'Crop tee tay ngắn, cổ tròn, ôm gọn, vải gân nhỏ',
    colors: 7,
    fit: 'Kín vai hơn bra, dễ phối legging cạp cao cho HLV và học viên.',
    href: '/san-pham/dong-phuc-pilates-act7',
    alt: 'Áo crop tee tập Pilates ACT7 tay ngắn, cổ tròn, vải gân',
    img: 'https://live.staticflickr.com/65535/55338905720_f595a69e42_b.jpg'
  },
  {
    code: 'APL1',
    name: 'Đồng Phục Pilates APL1',
    desc: 'Áo croptop cổ polo không tay, vải gân mềm co giãn, phối với legging hoặc quần ống loe',
    colors: 6,
    fit: 'Croptop cổ polo không tay thanh lịch, vải gân mềm co giãn tốt, phối với legging hoặc quần ống loe.',
    href: '/san-pham/dong-phuc-pilates-apl1',
    alt: 'Áo croptop tập Pilates APL1 cổ polo không tay, vải gân',
    img: 'https://live.staticflickr.com/65535/55342001246_8139acfd74_b.jpg'
  },
  {
    code: 'BDCV',
    name: 'Đồng Phục Pilates BDCV',
    desc: 'Set áo croptop tay ngắn cổ vuông + legging cạp cao',
    colors: 4,
    fit: 'Vải trơn mịn, ôm gọn. Kín đáo hơn bra, dễ thị phạm cho HLV Pilates.',
    href: '/san-pham/dong-phuc-yoga-bdcv',
    alt: 'Set đồng phục Pilates BDCV gồm croptop cổ vuông và legging cạp cao',
    img: 'https://live.staticflickr.com/65535/55342367304_67da854335_b.jpg'
  }
];

function Section({ id, title, children, className = '' }) {
  return (
    <article id={id} className={`scroll-mt-24 bg-white py-2 md:py-3  ${className}`}>
      <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-gray-900 pb-2">
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
    <div className="border-l-4 border-[#105d97]/20 bg-gray-50/50 p-4 rounded-r-lg">
      <h3 className="mb-1.5 text-base font-semibold text-gray-900">{title}</h3>
      <div className="text-sm leading-6 text-gray-700 md:text-base">{children}</div>
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
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

function ImageBlock({ src, alt, caption, priority = false, portrait = false }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isPortrait, setIsPortrait] = useState(portrait);

  return (
    <figure
      className={`overflow-hidden rounded-xl transition-all duration-300 ${portrait || isPortrait ? 'max-w-md md:max-w-lg mx-auto w-full md:w-1/2' : 'w-full'
        }`}
    >
      <Image
        src={imgSrc}
        alt={alt}
        width={portrait || isPortrait ? 600 : 1200}
        height={portrait || isPortrait ? 900 : 675}
        className="h-auto w-full object-cover transition-all duration-300"
        sizes={portrait || isPortrait ? '(max-width: 768px) 100vw, 500px' : '(max-width: 1024px) 100vw, 900px'}
        priority={priority}
        onError={() => setImgSrc('/pilates/dong-phuc-pilates-08.jpg')}
        onLoad={(e) => {
          if (!portrait && e.currentTarget?.naturalHeight > e.currentTarget?.naturalWidth) {
            setIsPortrait(true);
          }
        }}
      />
      {caption && (
        <figcaption className="px-4 py-3 text-center text-base font-medium italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function PilatesUniviPage() {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="text-gray-700 container mx-auto">
      {/* Hero Section */}
      <section className="bg-white pb-2">
        {/* H1 duy nhất của trang nằm ở CategoryPageTemplate; tiêu đề bài dùng H2, giữ nguyên class hiển thị */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-gray-900">
          Đồng phục Pilates và áo tập Pilates: giải pháp cho studio và HLV
        </h2>

        {/* Sapo */}
        <div className="mt-5 space-y-1 text-base leading-7 text-gray-700 bg-blue-50/40 p-5 rounded-2xl border border-blue-100/60">
          <p>
            Ở một Pilates Studio, đồng phục không chỉ là bộ đồ HLV mặc khi đứng lớp. Nhìn vào đồng phục, học viên biết ai là người hướng dẫn. Cũng nhờ nó mà đội ngũ trông đồng bộ, dù đang ở lớp mat, lớp Reformer, quầy lễ tân hay một buổi workshop cuối tuần.
          </p>
          <p>
            Nhưng Pilates có những đòi hỏi rất riêng. HLV phải nhìn rõ vai, hông, cột sống và đầu gối của học viên. Người mặc liên tục cúi, xoay, nằm, giơ tay, đổi tư thế. Trên máy, chỉ một chi tiết cứng hay một sợi dây thừa cũng đủ gây khó chịu.
          </p>
          <p>
            Vì vậy, chọn đồng phục Pilates hay một mẫu áo tập Pilates nên bắt đầu từ chất liệu, độ che phủ, độ co giãn và khả năng giữ form. Màu sắc và kiểu dáng để sau. Bài viết này dành cho chủ studio, chuỗi Pilates, HLV và người phụ trách mua hàng: cách đánh giá áo tập, chọn mẫu cho lớp Mat và Reformer, chuẩn bị thông tin đặt may và triển khai đồng bộ cho cả đội. Univi làm theo nguyên tắc &quot;gốc vững – diện sang&quot;: giải quyết trải nghiệm mặc và vận động trước, rồi mới hoàn thiện nhận diện thương hiệu.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsQuoteFormOpen(true)}
            className="rounded-xl border border-[#105d97] bg-[#105d97] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4f82]"
          >
            Nhận tư vấn ngay
          </button>
          <Link
            href="#cac-mau-dong-phuc-pilates"
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#105d97] hover:text-[#105d97]"
          >
            Xem mẫu Pilates
          </Link>
        </div>
      </section>

      {/* 1. Tổng quan về đồng phục Pilates */}
      <Section id="tong-quan-ve-dong-phuc-pilates" title="1. Tổng quan về đồng phục Pilates">
        <div className="space-y-4 leading-7">
          <p>
            Đồng phục Pilates là bộ trang phục được chọn hoặc thiết kế đồng bộ cho HLV, nhân viên, quản lý, và đôi khi cả học viên của studio. Trung tâm của bộ đồng phục thường là áo tập Pilates, đi cùng legging, polo hoặc áo khoác tùy vai trò. Một bộ đồng phục phù hợp giúp đội ngũ trông nhất quán, giúp HLV thị phạm dễ dàng, và không khiến người mặc phải liên tục kéo áo, chỉnh quần khi vận động.
          </p>
          <p>
            Pilates tập trung vào core, căn chỉnh tư thế và kiểm soát chuyển động. Trong giờ dạy, HLV phải quan sát vai, hông, cột sống và đầu gối của học viên. Ở lớp Reformer, người mặc còn nằm, trượt, đẩy và đổi tư thế ngay trên máy. Vì thế, ba điều cần ưu tiên là form ôm vừa đủ, độ che phủ ổn định và càng ít chi tiết gây vướng càng tốt.
          </p>
          <p className="font-semibold text-gray-900">
            So với Yoga và Gym, yêu cầu của Pilates khác ở mấy điểm sau:
          </p>
          <SimpleTable
            headers={['Góc nhìn', 'Pilates', 'Yoga', 'Gym']}
            rows={[
              ['HLV cần quan sát gì', 'Vai, hông, cột sống, đầu gối và trục chuyển động', 'Tư thế, độ mở, hơi thở và sự cân bằng', 'Biên độ, kỹ thuật và lực trong bài tập'],
              ['Trang phục cần làm được gì', 'Ôm vừa đủ, không xô lệch khi cúi, xoay, nằm hoặc tập máy', 'Co giãn tốt, mềm, thoải mái trong nhiều tư thế', 'Thoát ẩm, vận động đa hướng, hợp với cường độ'],
              ['Điểm cần kiểm tra', 'Độ che phủ, hồi form, đường may và chi tiết dễ cấn', 'Cảm giác chạm da, độ mềm và độ linh hoạt', 'Độ bền, thoát ẩm và khả năng chịu vận động'],
            ]}
          />
        </div>
        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-08.jpg"
            alt="Đội HLV mặc áo tập Pilates tay ngắn cổ khóa kéo màu hồng và legging đen cạnh máy Pilates"
            caption="Đồng phục Pilates phải theo kịp cả lớp mat lẫn lớp máy."
            priority
          />
        </div>
      </Section>

      {/* 2. Đồng phục Pilates dành cho những ai? */}
      <Section id="dong-phuc-pilates-danh-cho-nhung-ai" title="2. Đồng phục Pilates dành cho những ai?">
        <p className="mb-6 leading-7">
          Mỗi vai trò một kiểu trang phục, nhưng chung một hệ nhận diện.
        </p>
        <div className="space-y-3">
          <TextCard title="2.1. Studio Pilates">
            <p>
              Một studio có thể xây hệ đồng phục gồm: trang phục tập cho HLV, polo hoặc áo thun ôm vừa cho lễ tân, và một mẫu lịch sự hơn cho quản lý. Chia theo vai trò như vậy, học viên sẽ nhận ra ngay ai có thể hỗ trợ mình, còn studio thì giữ được hình ảnh boutique nhất quán từ lớp học, khu đón khách đến ảnh đăng mạng xã hội.
            </p>
            <p className="mt-2">
              Studio nhỏ cũng nên tính trước chuyện đặt thêm khi tuyển HLV mới. Nếu không, mỗi lần đặt lại dễ ra một màu, một form khác.
            </p>
          </TextCard>

          <TextCard title="2.2. HLV Pilates">
            <p>
              HLV và giáo viên Pilates cần trang phục ôm vừa đủ để thị phạm rõ và để học viên nhìn được căn chỉnh, nhưng không được bó gò. Áo phải che tốt ở vai, nách, eo và gấu. Quần phải đứng yên khi cúi, xoay, nằm và đổi tư thế. Nếu studio có Reformer, hãy để HLV mặc thử và tập thật trên máy trước khi chốt mẫu.
            </p>
            <p className="mt-2">
              Bài <InlineLink href="/bai-viet/dong-phuc-hlv-pilates-giai-phap-thiet-ke-rieng-cho-studio">đồng phục HLV Pilates</InlineLink> đi sâu hơn vào nhóm này.
            </p>
          </TextCard>

          <TextCard title="2.3. Chuỗi Pilates">
            <p>
              Với chuỗi, bài toán lớn là giữ màu, form, logo và quy cách giống nhau giữa các cơ sở. Khi đã có một mẫu chuẩn được lưu thông số, lần đặt sau không còn phải dựa vào trí nhớ hay một tấm ảnh chụp màn hình.
            </p>
            <p className="mt-2">
              <InlineLink href="/giai-phap-2s">Giải pháp 2S Uniform</InlineLink> của Univi, gồm Staff Uniform và Member Uniform, có thể dùng làm khung để triển khai đồng phục cho HLV, lễ tân, quản lý và học viên.
            </p>
          </TextCard>

          <TextCard title="2.4. Cộng đồng và CLB Pilates">
            <p>
              Các nhóm cộng đồng thường cần áo workshop, retreat, sự kiện hoặc áo học viên. Những mẫu này nên giữ chung hệ màu và logo với đồng phục HLV, nhưng thiết kế có thể đơn giản hơn để dễ phối theo nhóm. Đây là phần Member Uniform trong 2S Uniform, không cần giống hệt đồ HLV dùng để thị phạm.
            </p>
          </TextCard>
        </div>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-03.jpg"
            alt="HLV Pilates mặc áo polo đồng phục màu tím nhạt hướng dẫn học viên trên máy Cadillac và Reformer"
            caption="Mỗi vai trò một kiểu trang phục, nhưng chung một hệ nhận diện."
          />
        </div>
      </Section>

      {/* 3. Đồng phục Pilates gồm những sản phẩm nào? */}
      <Section id="dong-phuc-pilates-gom-nhung-san-pham-nao" title="3. Đồng phục Pilates gồm những loại áo, quần nào?">
        <p className="mb-6 leading-7">
          Một bộ đồng phục Pilates thường gồm áo tập Pilates, quần, áo khoác hoặc set liền.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <TextCard title="3.1. Áo tập Pilates">
            <p>
              Áo tập Pilates cho HLV nữ có thể là croptop, crop tee, áo ôm tay ngắn hoặc áo dài tay. Bộ sưu tập của Univi hiện có croptop cổ polo không tay (APL1), crop tee tay ngắn cổ tròn (ACT7), áo ôm tay ngắn cổ cao khóa kéo (AG29) và áo dài tay ôm gọn (PLT03). Lễ tân và quản lý thường hợp với polo như PL15, vì polo vừa lịch sự vừa dễ nhận diện; có thể cân nhắc vải UNI COOL PIQUÉ hoặc UNI ELITE tùy nhu cầu thực tế. Với HLV nam, áo thun ôm vừa hoặc polo thể thao là hướng nên trao đổi khi tư vấn. Dù là kiểu áo nào, logo nên đặt ở chỗ không cấn khi nằm hay tì lên máy.
            </p>
          </TextCard>
          <TextCard title="3.2. Quần">
            <p>
              Legging cạp cao là kiểu quần phổ biến nhất trong các set Yoga – Pilates. Khi duyệt mẫu, hãy để người mặc cúi, ngồi, nằm và xoay người, rồi xem quần có tụt cạp, có tạo nếp khó chịu, hay có bị lộ khi kéo giãn không. Co giãn tốt là cần, nhưng phải đi kèm khả năng hồi form và độ che phủ.
            </p>
          </TextCard>
          <TextCard title="3.3. Áo khoác">
            <p>
              Áo khoác dùng trước và sau giờ tập, khi HLV đi lại giữa các khu vực hoặc ra đón học viên. Nên chọn mẫu dễ khoác ngoài set tập, ít chi tiết và vẫn nằm trong hệ màu thương hiệu.
            </p>
          </TextCard>
          <TextCard title="3.4. Bộ đồng phục">
            <p>
              Set croptop hoặc bra đi cùng legging đồng màu cho hình ảnh rõ ràng, cả với HLV lẫn học viên. Nếu studio muốn một mẫu liền thân cho hình ảnh thương hiệu, workshop hay lớp chuyên đề, jumpsuit như <InlineLink href="/san-pham/jumpsuit-yoga-jump13">JUMP13</InlineLink> là một lựa chọn. Dù chọn kiểu nào, mặc thử trong bối cảnh thật vẫn đáng tin hơn nhìn mockup.
            </p>
          </TextCard>
        </div>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-04.jpg"
            alt="Áo tập Pilates tay ngắn màu đen phối viền trắng và legging khi tập trên máy Reformer"
            caption="Một bộ đồng phục Pilates thường gồm áo, quần, áo khoác hoặc set liền."
          />
        </div>
      </Section>

      {/* 4. Tiêu chuẩn lựa chọn đồng phục Pilates */}
      <Section id="tieu-chuan-lua-chon-dong-phuc-pilates" title="4. Tiêu chí chọn áo tập Pilates và đồng phục">
        <p className="mb-4 leading-7">
          Năm tiêu chí dưới đây giúp studio đánh giá một mẫu áo tập Pilates hay cả bộ đồng phục trước khi đặt số lượng.
        </p>
        <SimpleTable
          headers={['Tiêu chí', 'Vì sao quan trọng với Pilates', 'Cần kiểm tra gì', 'Gợi ý từ Univi']}
          rows={[
            ['Chất liệu', 'Vải tiếp xúc da suốt buổi; cần mềm, mịn, hợp với vận động có kiểm soát', 'Cảm giác trên da, độ thoáng, bề mặt và độ che phủ', 'UNI SUPERCOOL 89% Polyamide – 11% Elastane, 180 GSM'],
            ['Độ co giãn', 'HLV cúi, xoay, nằm và thị phạm nhiều hướng', 'Kéo thử, rồi xem vải có trở về form không', 'Đánh giá cả độ giãn lẫn độ hồi'],
            ['Thoát ẩm', 'Bớt cảm giác ẩm dính trong buổi tập', 'Mồ hôi có được dẫn ra ngoài không', 'Công nghệ UNI DRY'],
            ['Form dáng', 'Giúp quan sát tư thế, tránh xô lệch và vướng máy', 'Vai, hông, eo, gấu áo, cạp quần và đường may', 'Ôm vừa đủ, kiểm tra bằng vận động thật'],
            ['Độ bền', 'Đồng phục mặc thường xuyên, ảnh hưởng chi phí sử dụng', 'Form, màu, đường may, logo sau nhiều lần giặt', 'Đường may co giãn, máy 4 kim 6 chỉ ở một số dòng phù hợp'],
          ]}
        />

        <div className="mt-6 space-y-4 leading-7">
          <TextCard title="4.1. Chất liệu">
            <p>
              UNI SUPERCOOL có thành phần 89% Polyamide – 11% Elastane, định lượng 180 GSM. Bề mặt vải mềm, mượt, mát và mịn. Tuy vậy, cảm giác mặc không chỉ đến từ vải mà còn từ form và cách may, nên hãy đánh giá cả ba cùng lúc. Bạn có thể đọc thêm <InlineLink href="/vai-super-cool-la-gi">UNI SUPERCOOL là gì</InlineLink>.
            </p>
          </TextCard>

          <TextCard title="4.2. Độ co giãn">
            <p>
              Co giãn là vải kéo ra được bao nhiêu. Hồi form là kéo xong, vải có trở về gần như cũ không. Đồ Pilates cần cả hai. Vải mềm và kéo được thôi chưa đủ, nếu sau một thời gian cổ áo, gấu áo hay cạp quần đã bai.
            </p>
          </TextCard>

          <TextCard title="4.3. Thoát ẩm">
            <p>
              UNI DRY là công nghệ xử lý giúp dẫn mồ hôi ra ngoài và hạn chế ẩm thấm ngược lại da. Nói đơn giản: áo không giữ cảm giác ẩm dính trên người suốt buổi tập. Tốc độ khô thực tế còn tùy cường độ tập, phòng tập và cách phơi, nên Univi không đưa ra một mốc thời gian khô cố định.
            </p>
          </TextCard>

          <TextCard title="4.4. Form dáng">
            <p>
              Áo tập Pilates cần ôm để HLV nhìn rõ đường vai, eo và thân người, nhưng phải đủ co giãn để không cản động tác. Với lớp Mat, xem áo có bị tốc lên khi cuộn người, nằm ngửa hay chống tay không. Với lớp Reformer, ưu tiên áo gọn, không có dây thừa hay chi tiết cứng ở lưng và vai, vì đây là vùng tì lên máy khi nằm, trượt, đẩy; đường may cũng không nên nằm ở chỗ dễ cấn. Xem thêm <InlineLink href="/bai-viet/ao-tap-pilates-cach-chon-form-vai-va-mau-phu-hop">cách chọn áo tập Pilates theo form, vải và màu</InlineLink>.
            </p>
          </TextCard>

          <TextCard title="4.5. Độ bền">
            <p>
              Đừng chỉ nhìn giá mua. Hãy tính cả thời gian áo còn mặc tốt, tần suất phải thay mới, chi phí đặt lại và ảnh hưởng đến hình ảnh studio. Một số dòng của Univi dùng đường may cong hai bên thân bằng máy 4 kim 6 chỉ; khi chọn mẫu cụ thể, hãy hỏi rõ kỹ thuật may áp dụng cho đúng mã hàng đó.
            </p>
          </TextCard>
        </div>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-05.jpg"
            alt="Áo tập Pilates nữ dài tay màu tím nhạt khi tập trên ghế Pilates"
            caption="Chất liệu và đường may quyết định cảm giác mặc nhiều hơn kiểu dáng."
          />
        </div>
      </Section>

      {/* 5. Thiết kế đồng phục Pilates theo nhận diện thương hiệu */}
      <Section id="thiet-ke-dong-phuc-pilates-theo-nhan-dien-thuong-hieu" title="5. Đồng phục Pilates trong nhận diện thương hiệu studio">
        <div className="space-y-2 leading-7">
          <p>
            Một studio Pilates không chỉ được nhận diện qua biển hiệu, không gian tập hay hệ thống máy Reformer. HLV, lễ tân và quản lý là những người học viên gặp mỗi buổi, nên đồng phục của họ là một điểm chạm thương hiệu lặp lại hằng ngày: trong lớp học, ở quầy đón khách, trên ảnh và video của studio.
          </p>
          <p>
            Khi mỗi HLV mặc một kiểu, đội ngũ trông thiếu đồng nhất dù không gian đã được đầu tư chỉn chu. Ngược lại, đồng phục quá giống áo công sở thì mất tính chuyên môn, còn quá giống đồ tập đại trà thì mất dấu ấn riêng. Đồng phục Pilates cần nằm ở khoảng giữa: mặc được khi thị phạm, và đúng hình ảnh của studio.
          </p>
          <p className="font-semibold text-gray-900">
            Năm giá trị thương hiệu của một hệ thống đồng phục:
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <TextCard title="5.1. Thể hiện đúng định vị">
              <p>
                Màu, kiểu dáng, chất liệu và vị trí logo cho thấy studio theo hướng cao cấp, tối giản hay trẻ trung, năng động. Hai studio khác phong cách sẽ có hai cách chọn đồng phục khác nhau.
              </p>
            </TextCard>
            <TextCard title="5.2. Chuyên nghiệp, đáng tin cậy">
              <p>
                Đội ngũ mặc thống nhất trông chỉn chu hơn khi đón tiếp, hướng dẫn và chăm sóc học viên.
              </p>
            </TextCard>
            <TextCard title="5.3. Khớp hình ảnh online và offline">
              <p>
                Đồng phục xuất hiện trong lớp học, ảnh chụp, video giới thiệu và mạng xã hội. Giữ cùng màu, logo và kiểu dáng thì hình ảnh studio trên các kênh khớp với những gì học viên thấy khi đến tập.
              </p>
            </TextCard>
            <TextCard title="5.4. Dễ ghi nhớ">
              <p>
                Màu và dấu hiệu nhận diện rõ ràng giúp học viên dễ liên hệ hình ảnh đội ngũ với studio mình đang theo học.
              </p>
            </TextCard>
            <TextCard title="5.5. Gắn kết đội ngũ">
              <p>
                Trang phục thống nhất tạo cảm giác cùng thuộc về một tập thể, cùng đại diện cho một thương hiệu.
              </p>
            </TextCard>
          </div>
          <p className="font-semibold text-gray-900">
            Thiết kế bắt đầu từ định vị studio, không phải từ một mẫu áo:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Studio theo phong cách nào: cao cấp, tối giản, hiện đại hay năng động?</li>
            <li>Màu nhận diện chủ đạo là gì, đã có file logo gốc chưa?</li>
            <li>Đội ngũ gồm những vị trí nào: HLV, lễ tân, quản lý, học viên?</li>
            <li>HLV đứng lớp và thị phạm bao nhiêu giờ mỗi ngày, studio có lớp Reformer không?</li>
            <li>Có kế hoạch tuyển thêm HLV hoặc mở thêm cơ sở không?</li>
          </ul>
          <p>
            Từ đó, thiết kế đi theo thứ tự: ai mặc → mặc ở đâu → vận động thế nào → chất liệu và form → vị trí logo → màu và hoàn thiện. Logo và màu được đặt sau khi đã chốt chất liệu và form.
          </p>
          <p className="font-semibold text-gray-900">
            Một hệ đồng phục Pilates thường gồm ba nhóm:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>HLV:</strong> legging, bra, T-shirt ôm vừa hoặc polo, dùng màu chủ đạo hoặc màu trung tính của studio.</li>
            <li><strong>Lễ tân và quản lý:</strong> polo, áo thun hoặc cách phối màu thanh lịch hơn để phân vai.</li>
            <li><strong>Workshop, retreat và sự kiện:</strong> áo cho học viên và hoạt động cộng đồng, thiết kế đơn giản hơn nhưng có ít nhất một điểm chung về màu, logo hoặc đường nét.</li>
          </ul>
          <p>
            Ba nhóm có thể khác kiểu dáng, nhưng nên chung màu, logo và ngôn ngữ thiết kế để người ngoài vẫn nhận ra cùng một thương hiệu.
          </p>
          <p>
            Trên đồ ôm sát, logo cần được tính kỹ về kích thước, vị trí và kỹ thuật in hay thêu. Kỹ thuật cụ thể sẽ được tư vấn theo từng mẫu và từng nền vải. Mockup nên được duyệt cùng mẫu vải thật, vì màu trên màn hình có thể khác màu vải.
          </p>
          <p>
            Ở Univi, mỗi phương án được may mẫu thật để HLV mặc thử và vận động, kể cả trên Reformer nếu studio có, rồi điều chỉnh và duyệt mẫu chuẩn trước khi sản xuất. Với đồng phục ôm sát, mặc thật có ổn không quan trọng hơn nhìn mockup có đẹp không. Dự án <InlineLink href="/bai-viet/univi-x-home-pilates-giai-phap-dong-phuc-pilates-cao-cap">đồng phục cho Home Pilates</InlineLink> là một ví dụ thực tế về cách làm này.
          </p>
          <p>
            Studio có nhiều cơ sở nên lập một bộ tiêu chuẩn gồm: mã màu thương hiệu, phiên bản logo, mẫu chuẩn, bảng size, vị trí logo và quy cách may. Khi tuyển thêm HLV, chỉ cần đối chiếu bộ tiêu chuẩn này là đặt thêm được đồng bộ.
          </p>
        </div>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-08.jpg"
            alt="Đội HLV studio Pilates mặc đồng phục cùng màu, cùng kiểu áo để giữ nhận diện thương hiệu"
            caption="Logo và màu được đặt sau khi đã chốt chất liệu và form."
          />
        </div>
      </Section>

      {/* 6. Các mẫu đồng phục Pilates */}
      <Section id="cac-mau-dong-phuc-pilates" title="6. Các mẫu áo tập và đồng phục Pilates">
        <p className="mb-4 leading-7">
          Các mẫu áo tập Pilates và set đồng phục dưới đây thuộc bộ sưu tập Yoga – Pilates của Univi, dùng cho HLV, nhân sự và học viên tùy theo thiết kế và form dáng. Danh sách đầy đủ, gồm cả PLT02 và PLT03, nằm ở phần sản phẩm đầu trang. Studio nên cho HLV mặc thử, nhất là khi có lớp Reformer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {pilatesModels.map((item) => (
            <div key={item.code} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="relative aspect-[3/4] bg-gray-100">
                <Image
                  src={item.img}
                  alt={item.alt || item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                {item.isNew && (
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wide z-10">
                    Sản phẩm mới
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#105d97] uppercase tracking-wider">{item.code}</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
                  <p className="text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-gray-900">Phù hợp:</strong> {item.fit}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <InlineLink href={item.href}>Xem chi tiết </InlineLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Bảng màu đồng phục Pilates */}
      <Section id="bang-mau-dong-phuc-pilates" title="7. Bảng màu đồng phục Pilates">
        <div className="space-y-2 leading-7">
          <p className="font-semibold text-gray-900">
            Studio có thể bắt đầu từ một trong ba hướng màu:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>Trung tính:</strong> đen, ghi, be.</li>
            <li><strong>Pastel:</strong> hợp với không gian theo phong cách wellness.</li>
            <li><strong>Tông trầm:</strong> navy, xanh than, rêu, cho hình ảnh chắc chắn và dễ đồng bộ.</li>
          </ul>
          <p>
            Đừng chốt màu chỉ qua ảnh trên màn hình. Bạn có thể nhập mã HEX thương hiệu vào <InlineLink href="/bang-mau">bảng màu Univi</InlineLink> để tìm màu vải gần nhất, nhưng vẫn cần xem màu trên mẫu vải thật trước khi chốt. Nếu dùng nền đậm với logo sáng, hãy trao đổi trước về độ ổn định màu và cách xử lý logo.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl shadow-sm">
          <BangMauHero />
        </div>

      </Section>

      {/* 8. Quy trình đặt may đồng phục Pilates */}
      <Section id="quy-trinh-dat-may-dong-phuc-pilates" title="8. Quy trình đặt may đồng phục Pilates">
        <p className="mb-4 leading-7">
          Mặc thử và vận động thật là bước không nên bỏ qua.
        </p>

        <div className="my-6">
          <ProcessSteps variant="vertical" />
        </div>

        <p className="mt-4 leading-7">
          Với đồ ôm sát, câu hỏi &quot;mặc thật có ổn không&quot; quan trọng hơn &quot;mockup có đẹp không&quot;. Hãy{' '}
          <button
            type="button"
            onClick={() => setIsQuoteFormOpen(true)}
            className="font-semibold text-[#105d97] hover:underline cursor-pointer"
          >
            liên hệ Univi
          </button>{' '}
          để trao đổi rõ từng bước trước khi chốt.
        </p>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/tu-van-univi.jpg"
            alt="Tư vấn viên Univi trao đổi mẫu vải và bảng màu với khách hàng đặt may đồng phục"
          />
        </div>
      </Section>

      {/* 9. Số lượng tối thiểu và thời gian sản xuất */}
      <Section id="so-luong-toi-thieu-va-thoi-gian-san-xuat" title="9. Số lượng tối thiểu và thời gian sản xuất">
        <div className="space-y-2 leading-7">
          <p>
            Số lượng và lịch sản xuất được tư vấn theo từng mẫu cụ thể.
          </p>
          <p>
            Số lượng tối thiểu cho đồng phục Pilates phụ thuộc vào mẫu và dòng vải bạn chọn. Vì vậy, Univi tư vấn số lượng theo từng cấu hình cụ thể thay vì đưa ra một con số chung cho mọi mẫu.
          </p>
          <p>
            Thời gian sản xuất cũng vậy. Nó tùy vào việc bạn chọn mẫu có sẵn hay thiết kế riêng, chất liệu và màu có sẵn hay cần chuẩn bị thêm, số lượng bao nhiêu và đặt vào thời điểm nào. Univi sẽ báo lịch cụ thể khi chốt đơn.
          </p>
          <p>
            Studio nhỏ có thể cho các HLV dùng chung một mẫu, còn áo học viên hay áo sự kiện thì làm riêng theo kế hoạch. Như vậy vẫn giữ được một hệ nhận diện chung, mà không buộc mọi vị trí phải mặc cùng một kiểu.
          </p>
        </div>

        <div className="mt-6">
          <ImageBlock
            src="/pilates/dong-phuc-pilates-14.jpg"
            alt="HLV mặc áo polo đồng phục Pilates màu đỏ tập trên máy Reformer"
          />
        </div>
      </Section>

      {/* 10. Báo giá đồng phục Pilates */}
      <Section id="bao-gia-dong-phuc-pilates" title="10. Báo giá đồng phục Pilates">
        <div className="space-y-2 leading-7">
          <p>
            Báo giá có căn cứ khi brief đủ thông tin về sản phẩm, chất liệu và số lượng.
          </p>
          <p>
            Giá đồng phục Pilates và áo tập Pilates phụ thuộc vào nhiều yếu tố: món sản phẩm, chất liệu, số lượng, kiểu dáng, mức độ tùy biến, kỹ thuật in hoặc thêu logo, yêu cầu thiết kế theo nhận diện và bảng size. Vì vậy, thay vì hỏi giá cho một &quot;bộ đồ&quot; chung chung, studio nên gửi brief đủ thông tin để nhận báo giá sát thực tế.
          </p>
          <p className="font-semibold text-gray-900">
            Khi so sánh các báo giá, hãy nhìn vào chi phí sử dụng:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Sản phẩm có giữ được form và màu không?</li>
            <li>Có hợp với hình ảnh studio không?</li>
            <li>Có dễ đặt thêm không?</li>
            <li>Quy trình kiểm mẫu có rõ ràng không?</li>
          </ul>
          <p>
            Giá bán lẻ của từng sản phẩm trên website không phải là giá đồng phục B2B.{' '}
            <button
              type="button"
              onClick={() => setIsQuoteFormOpen(true)}
              className="font-semibold text-[#105d97] hover:underline cursor-pointer"
            >
              Liên hệ Univi
            </button>{' '}
            để được tư vấn cấu hình và báo giá theo nhu cầu của studio.
          </p>
        </div>

        {/* 2. Bảng giá phôi áo thun thể thao */}
        <div className="mt-2">
          <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">1. Bảng giá phôi áo thun thể thao</h3>
          <p className="leading-7 mb-3 text-gray-700">
            Ba dòng vải dùng cho áo thun khác nhau thế này:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4 leading-7">
            <li><strong>UNI QUICKDRY:</strong> nền Polyester kết hợp Elastane, bề mặt nhẹ, mịn, co giãn, hợp với hoạt động cần nhanh khô.</li>
            <li><strong>UNI SUPERCOOL:</strong> nền Polyamide kết hợp Elastane, bề mặt mềm, mượt, mát, cảm giác co giãn nhiều hơn khi mặc.</li>
            <li><strong>UNI AIR:</strong> nền Polyester nhẹ, có cấu trúc lỗ thoáng khí, hợp với vận động liên tục.</li>
          </ul>
          <p className="leading-7 mb-4 text-gray-700">
            Xem giải thích chi tiết tại <InlineLink href="/chat-lieu-vai">chất liệu vải thể thao Univi</InlineLink>.
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm my-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 whitespace-nowrap">Kiểu áo</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 whitespace-nowrap">Chất liệu</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">10–30</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">31–70</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">71–100</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">101–300</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">301–500</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">501–1.000</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr>
                  <td rowSpan={3} className="px-4 py-3 align-top font-semibold text-gray-900 border-r border-gray-100 bg-slate-50/50">
                    Áo trơn đường trần, cổ tròn
                  </td>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI QUICKDRY</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">150.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">145.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">140.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI SUPERCOOL</td>
                  <td className="px-3 py-3 text-center text-gray-700">215.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">210.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">205.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">200.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">195.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">190.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI AIR</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">150.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">145.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">140.000đ</td>
                </tr>
                <tr>
                  <td rowSpan={2} className="px-4 py-3 align-top font-semibold text-gray-900 border-r border-gray-100 bg-slate-50/50">
                    Áo đường trần, cổ tròn/cổ trụ, kéo khóa
                  </td>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI QUICKDRY</td>
                  <td className="px-3 py-3 text-center text-gray-700">185.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">180.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">175.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">170.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI SUPERCOOL</td>
                  <td className="px-3 py-3 text-center text-gray-700">230.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">225.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">220.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">215.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">210.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">205.000đ</td>
                </tr>
                <tr>
                  <td rowSpan={2} className="px-4 py-3 align-top font-semibold text-gray-900 border-r border-gray-100 bg-slate-50/50">
                    Áo trơn/phối màu, cổ trụ/cổ tròn, kéo khóa
                  </td>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI QUICKDRY</td>
                  <td className="px-3 py-3 text-center text-gray-700">175.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">170.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">150.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI SUPERCOOL</td>
                  <td className="px-3 py-3 text-center text-gray-700">220.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">215.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">210.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">205.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">200.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">195.000đ</td>
                </tr>
                <tr>
                  <td rowSpan={2} className="px-4 py-3 align-top font-semibold text-gray-900 border-r border-gray-100 bg-slate-50/50">
                    Áo cổ tròn basic (một màu hoặc phối màu)
                  </td>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI QUICKDRY</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">150.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">145.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">140.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#105d97]">UNI SUPERCOOL</td>
                  <td className="px-3 py-3 text-center text-gray-700">205.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">200.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">195.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">190.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">185.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">180.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="leading-7 mt-4 text-gray-700">
            Nếu phòng tập cần áo nhẹ, nhanh khô cho hội viên hay sự kiện, UNI QUICKDRY và UNI AIR là hai hướng nên xem trước. Với HLV/PT vận động thường xuyên và cần bề mặt mềm mát, UNI SUPERCOOL có thể hợp hơn. Bạn có thể đối chiếu thêm theo vị trí người mặc ở trang <InlineLink href="/dong-phuc-gym">đồng phục Gym</InlineLink>.
          </p>
        </div>

        {/* 3. Bảng giá áo polo thể thao */}
        <div className="mt-2">
          <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">2. Bảng giá áo polo thể thao</h3>
          <p className="leading-7 mb-3 text-gray-700">
            Polo không chỉ để trông lịch sự. Chất liệu quyết định HLV đi lại có thoải mái không, lễ tân làm cả ca có dễ chịu không, quản lý gặp hội viên có chỉn chu không. Hai dòng vải chính cho polo:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4 leading-7">
            <li><strong>UNI COOL PIQUÉ:</strong> bề mặt piqué mềm, mát, co giãn, giữ được vẻ lịch sự của áo polo.</li>
            <li><strong>UNI ELITE:</strong> Polyester kết hợp Elastane, nhẹ, thoáng, nhanh khô, có họa tiết dệt trên bề mặt.</li>
          </ul>
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm my-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 whitespace-nowrap">Chất liệu</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">10–30</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">31–70</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">71–100</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">101–300</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">301–500</th>
                  <th className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">501–1.000</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#105d97]">UNI COOL PIQUÉ</td>
                  <td className="px-3 py-3 text-center text-gray-700">180.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">175.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">170.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#105d97]">UNI ELITE</td>
                  <td className="px-3 py-3 text-center text-gray-700">185.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">180.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">175.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">170.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#105d97]">UNI QUICKDRY</td>
                  <td className="px-3 py-3 text-center text-gray-700">180.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">175.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">170.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">165.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">160.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">155.000đ</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#105d97]">UNI SUPERCOOL</td>
                  <td className="px-3 py-3 text-center text-gray-700">220.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">215.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">210.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">205.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">200.000đ</td>
                  <td className="px-3 py-3 text-center text-gray-700">195.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="leading-7 mt-4 text-gray-700">
            Nếu cần cân bằng giữa vẻ lịch sự và khả năng vận động, hãy xem thêm <InlineLink href="/dong-phuc-polo">đồng phục polo thể thao</InlineLink>. Trước khi chốt màu và vị trí logo, bạn có thể tra <InlineLink href="/bang-mau">bảng màu Univi</InlineLink> để lần đặt bổ sung sau không bị lệch màu nhận diện.
          </p>
        </div>

      </Section>

      {/* 11. Kinh nghiệm đặt đồng phục Pilates cho studio */}
      <Section id="kinh-nghiem-dat-dong-phuc-pilates-cho-studio" title="11. Kinh nghiệm đặt đồng phục Pilates cho studio">
        <div className="space-y-2 leading-7">
          <p>
            Chuẩn bị kỹ trước khi đặt giúp tránh phải làm lại.
          </p>
          <ul className="list-decimal pl-5 space-y-2 text-gray-700">
            <li><strong>Xác định vị trí và số lượng trước:</strong> Tách riêng HLV, lễ tân, quản lý, học viên và sự kiện để chọn đúng kiểu dáng, tránh đặt dư.</li>
            <li><strong>Hỏi về chất liệu và hồi form trước khi hỏi giá:</strong> Ba câu nên hỏi: chất liệu này dùng cho môi trường nào, giặt nhiều lần thì form ra sao, màu và logo có được tư vấn cho hợp nhau không?</li>
            <li><strong>Luôn cho HLV mặc thử khi vận động:</strong> Cúi, xoay, nằm, và tập trên máy nếu studio có Reformer. Mẫu đẹp trên ảnh chưa chắc tiện khi dùng.</li>
            <li><strong>Thống nhất màu và form để đặt lại:</strong> Lưu mẫu chuẩn, mã màu, file logo, bảng size và vị trí logo cho lần tuyển người hoặc mở cơ sở sau.</li>
            <li><strong>Đừng chọn theo giá rẻ nhất:</strong> Hãy tính cả độ bền, tần suất thay mới, hình ảnh thương hiệu và chi phí đặt lại.</li>
            <li><strong>Chuẩn bị file logo gốc và mã màu thương hiệu:</strong> File rõ nét giúp mockup chính xác hơn. Mã HEX chỉ là điểm tham chiếu, vẫn cần đối chiếu mẫu vải thật.</li>
          </ul>
        </div>

      </Section>
      <div className="mt-6">
        <ImageBlock
          src="/pilates/dong-phuc-pilates-17.jpg"
          alt="Học viên mặc set bra và legging màu hồng tập Pilates, HLV hỗ trợ căn chỉnh tư thế"
        />
      </div>
      {/* 12. Câu hỏi thường gặp */}
      <Section id="cau-hoi-thuong-gap" title="12. Câu hỏi thường gặp">
        <div className="space-y-2">
          {pilatesFaqs.map(([q, a], idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 font-bold text-gray-900 bg-gray-50/70 hover:bg-gray-100/80 flex items-center justify-between text-base"
                >
                  <span>12.{idx + 1}. {q}</span>
                  <span className="text-lg font-bold text-[#105d97] ml-2">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-sm text-gray-700 leading-6 border-t border-gray-100">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* 13. Giải pháp đồng phục Pilates của Univi */}
      <Section id="giai-phap-dong-phuc-pilates-cua-univi" title="13. Giải pháp đồng phục Pilates của Univi">
        <div className="space-y-2 leading-7">
          <p>
            Từ chất liệu, may mẫu đến kiểm tra chất lượng, Univi làm trực tiếp tại xưởng.
          </p>
          <p>
            Univi bắt đầu từ người mặc, môi trường và chuyển động, rồi mới chọn chất liệu, form và kỹ thuật may. Với Pilates, studio có thể trao đổi về UNI SUPERCOOL, hệ 5 dòng vải có thông số công bố, và công nghệ UNI DRY.
          </p>
          <p>
            Univi sản xuất trực tiếp tại xưởng chính rộng 2.000m², với đủ các bộ phận cắt, may, in/thêu, hoàn thiện và kiểm tra chất lượng. Một số đường may co giãn được thực hiện bằng máy 4 kim 6 chỉ; kỹ thuật cụ thể cho từng mã hàng sẽ được xác nhận khi chọn mẫu.
          </p>
          <p>
            Giải pháp 2S Uniform gồm Staff Uniform và Student/Member Uniform. Với studio hay chuỗi, cách làm này gom đồng phục HLV, lễ tân, quản lý, học viên và áo sự kiện vào cùng một hệ nhận diện. Thông số rập, màu và logo được lưu lại để đặt thêm khi tuyển người hoặc mở cơ sở.
          </p>

          <p className="font-semibold text-gray-900 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            Đồng Phục Univi là đơn vị TIÊN PHONG cung cấp giải pháp đồng phục thể thao chuyên nghiệp cho các chuỗi phòng tập và đội nhóm tập Gym, Fitness, Pickleball, Yoga, Running, Pilates, MMA... tại Việt Nam. Với Pilates, điều chúng tôi làm là nối chất liệu, form, nhận diện và khả năng đặt lại thành một hệ thống mà studio dùng được trong vận hành hằng ngày.
          </p>
        </div>

        <div className="mt-6 w-full overflow-hidden rounded-lg border border-gray-200">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/0AABoh2a-Sk"
            title="Năng lực sản xuất đồng phục thể thao Univi"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>


      </Section>

      {/* 14. Kết luận & CTA */}
      <Section id="ket-luan" title="14. Kết luận">
        <div className="space-y-4 leading-7">
          <p>
            Một bộ đồng phục Pilates hay một mẫu áo tập Pilates phù hợp bắt đầu từ trải nghiệm vận động: mềm, đủ che phủ, co giãn, hồi form và không vướng khi HLV thị phạm hay tập trên máy. Có được nền đó rồi, studio mới hoàn thiện màu, logo, phân vai và quy trình đặt lại. Khi những tiêu chí này được chuẩn hóa, đồng phục trở thành một phần của vận hành và nhận diện thương hiệu, chứ không chỉ là bộ đồ mặc theo mùa.
          </p>

          <div className="mt-6 rounded-2xl bg-[#105d97] p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-white">Đăng ký tư vấn giải pháp đồng phục Pilates Studio</h3>
            <p className="text-sm text-blue-100 mb-4">
              Studio có thể gửi trước những thông tin sau để Univi tư vấn sát hơn:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-blue-50 mb-6">
              <li>Logo và mã màu thương hiệu.</li>
              <li>Số HLV, lễ tân, quản lý và học viên cần làm đồng phục.</li>
              <li>Studio có lớp mat, lớp máy hay cả hai.</li>
              <li>Số cơ sở hiện tại và kế hoạch đặt thêm.</li>
              <li>Mẫu tham khảo, hoặc yêu cầu về form, độ che phủ và vị trí logo.</li>
            </ul>

            <button
              type="button"
              onClick={() => setIsQuoteFormOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#105d97] hover:bg-blue-50 transition-colors shadow-md"
            >
              Yêu cầu tư vấn & Báo giá ngay
            </button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-base text-gray-600 space-y-1.5">
            <p className="font-bold text-gray-900 text-sm">UNIVI SPORTS UNIFORM - YOUR UNIFORM, YOUR BRAND!</p>
            <p><strong>Văn phòng giao dịch:</strong> Nhà D14, ngõ 180 đường Thanh Bình, phường Hà Đông, thành phố Hà Nội</p>
            <p><strong>Xưởng sản xuất:</strong> phường Chương Mỹ, Hà Nội</p>
            <p><strong>Hotline/Zalo:</strong> 0834.204.999 · 0961.567.997</p>
            <p><strong>Email:</strong> dongphucunivi@gmail.com</p>
            <p><strong>Website:</strong> <InlineLink href="/">dongphucunivi.com</InlineLink></p>
          </div>
        </div>
      </Section>

      {/* Quote Contact Form Modal */}
      {isQuoteFormOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4"
          onClick={() => setIsQuoteFormOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#105d97] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Đăng ký tư vấn Đồng phục Pilates</h3>
              <button
                type="button"
                onClick={() => setIsQuoteFormOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <ContactForm source="Trang /dong-phuc-pilates" />
          </div>
        </div>
      )}
    </div>
  );
}
