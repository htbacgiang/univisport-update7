import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ContactForm from '../../header/ContactForm';
import ArticleImageGallery from '../../common/ArticleImageGallery';
import FabricCatalogView from '../chat-lieu-vai/FabricCatalogView';
import UniviOrderProcess from '../order-process/UniviOrderProcess';
import GymMockupCollection from '../gym/GymMockupCollection';

/*
 * Pillar landing /dong-phuc-gym.
 * File này export 3 phần được CategoryPageTemplate ghép theo thứ tự:
 *   GymHero (H1 duy nhất)  →  lưới sản phẩm mặc định (ProductGridSection, anchor #bo-suu-tap-gym)  →  GymUniviPage (nội dung pillar)
 *
 * Nguồn nội dung: docs/knowledge (05, 10, 11, 19, 04). Không dùng UNI BLENDED / UNI POWERZIP,
 * địa chỉ xưởng, email, MOQ, tiến độ dạng con số vì còn [CẦN XÁC MINH] trong 27-can-xac-minh.md.
 */

const BRAND = '#105d97';
const linkClass = 'font-semibold text-[#105d97] hover:underline';


// Mẫu áo hiển thị trong section Nam / Nữ — CHỈ điền slug sản phẩm sau khi Univi xác nhận
// ảnh và mã đúng phiên bản nam/nữ. Mảng rỗng → section chỉ hiển thị nội dung tư vấn, không hiển thị sản phẩm.
const GENDER_SHOWCASE = {
  nam: [],
  nu: [],
};

// Gallery cuối section Nam / Nữ — dùng chung component ArticleImageGallery (giống Gallery chèn từ Toolbar Editor).
// Thêm ảnh: { src, altText, width, height } — width/height chỉ là tỉ lệ dự phòng, component tự đọc kích thước thật.
// Mảng rỗng → không hiển thị gallery.
const GENDER_GALLERY = {
  nam: {
    title: 'Hình ảnh áo tập Gym cho nam',
    images: [
      { src: 'https://live.staticflickr.com/65535/55380945263_10ec0cab13_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55264459937_28e7b233bb_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 6, height: 4 },
      { src: 'https://live.staticflickr.com/65535/55344321100_52c7e53de9_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55266084938_7b79b79100_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55566121184_6ef1e98895_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55265622715_f30258d608_b.jpg', altText: 'Áo tập Gym cho nam ...', width: 4, height: 6 },

    ],
  },
  nu: {
    title: 'Hình ảnh áo tập Gym cho nữ',
    images: [
      { src: 'https://live.staticflickr.com/65535/55565725111_d49f099ba1_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55380999219_86dc9f2d37_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/54903524904_6435ef5990_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55344054408_c3aa34465e_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55564700402_9d21f092ae_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },
      { src: 'https://live.staticflickr.com/65535/55381212595_52005bc82f_b.jpg', altText: 'Áo tập Gym cho nữ ...', width: 4, height: 6 },

    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers dữ liệu sản phẩm (chỉ đọc dữ liệu có cấu trúc, không dùng description trong DB)
// ─────────────────────────────────────────────────────────────────────────────

function getImageUrl(path) {
  if (!path) return '/images/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
  return `/${path}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────

function Section({ id, title, children, className = '' }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 py-2 md:py-3 ${className}`}>
      <h2 id={`${id}-title`} className="mb-4 text-xl md:text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function H3({ children, id }) {
  return (
    <h3 id={id} className="mb-2 text-lg font-semibold text-gray-900">
      {children}
    </h3>
  );
}

function TextCard({ title, children }) {
  return (
    <div className="border-l-4 border-[#105d97]/25 py-1 pl-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>
      <div className="text-sm leading-6 text-gray-700 md:text-base">{children}</div>
    </div>
  );
}

function Figure({ src, alt, caption, width = 1200, height = 800, sizes = '(max-width: 1024px) 100vw, 860px' }) {
  return (
    <figure className="overflow-hidden rounded-lg ">
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="h-auto w-full object-cover" />
      {caption && <figcaption className="px-4 py-3 text-center text-base text-gray-500">{caption}</figcaption>}
    </figure>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#105d97] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e4f82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#105d97]"
    >
      {children}
    </button>
  );
}

function SecondaryLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#105d97] hover:text-[#105d97]"
    >
      {children}
    </Link>
  );
}

/** Bảng trên desktop, danh sách thẻ trên mobile để tránh cuộn ngang. */
function ResponsiveTable({ caption, headers, rows }) {
  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-[#105d97]/5">
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-left font-semibold text-gray-900">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-4 py-3 text-left align-top font-semibold text-gray-900">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-4 py-3 align-top text-gray-700">
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={row[0]} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-2 font-semibold text-gray-900">{row[0]}</p>
            <dl className="space-y-1 text-sm">
              {row.slice(1).map((cell, i) => (
                <div key={i}>
                  <dt className="inline font-medium text-gray-500">{headers[i + 1]}: </dt>
                  <dd className="inline text-gray-700">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 01. HERO
// ─────────────────────────────────────────────────────────────────────────────

export function GymHero() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="gym-h1" className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="p-4 md:p-6">
        <div className="container">
          <h1 id="gym-h1" className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Đồng Phục Gym, Áo Tập Gym Cho Phòng Tập Và Fitness Center
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-700 hidden md:block">
            Univi thiết kế và sản xuất đồng phục Gym, áo tập Gym theo màu và logo riêng cho phòng Gym, Fitness Center,
            PT Studio, CLB thể thao, đội ngũ HLV, PT và nhân viên phòng tập. Khi HLV mặc áo bí, lễ tân mặc một kiểu, PT mặc một kiểu, hội viên khó nhận ra ai đang hỗ trợ mình và
            hình ảnh phòng tập trên ảnh, video cũng thiếu nhất quán. Đồng phục Gym đúng cách giải quyết cả hai việc:
            đội ngũ thoải mái khi vận động và phòng tập có một bộ nhận diện rõ ràng.
          </p>
          <div className="mt-3 space-y-3 text-base leading-7 text-gray-700">

            <p>
              Đồng Phục Univi là đơn vị TIÊN PHONG cung cấp giải pháp đồng phục thể thao chuyên nghiệp cho các chuỗi
              phòng tập và các đội nhóm tập Gym, Fitness tại Việt Nam.
            </p>
          </div>
          <div className="mt-3 flex  gap-3 sm:flex-row">
            <PrimaryButton onClick={() => setOpen(true)}>Nhận tư vấn</PrimaryButton>
            <SecondaryLink href="#bo-suu-tap-gym">Xem bộ sưu tập</SecondaryLink>
          </div>
        </div>
      </div>
      <ContactForm source="Đồng phục Gym - Hero - Nhận tư vấn" isModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu nội dung
// ─────────────────────────────────────────────────────────────────────────────

const tocItems = [
  ['giai-phap-phong-tap', 'Giải pháp cho phòng tập Gym và Fitness'],
  ['ao-tap-gym-nam', 'Áo tập Gym cho nam'],
  ['ao-tap-gym-nu', 'Áo tập Gym cho nữ'],
  ['mau-mockup-ao-tap-gym', 'Các mẫu mockup áo tập Gym'],
  ['dong-phuc-hlv-pt-nhan-vien', 'Đồng phục HLV, PT và nhân viên'],
  ['chat-lieu', 'Chất liệu và công nghệ vải'],
  ['kinh-nghiem-chon-ao', 'Kinh nghiệm chọn áo đồng phục Gym'],
  ['du-an', 'Dự án đồng phục Gym và Fitness'],
  ['giai-phap-2s', 'Giải pháp 2S Uniform'],
  ['quy-trinh', 'Quy trình đặt may'],
  ['bai-viet-lien-quan', 'Bài viết liên quan'],
  ['faq', 'Câu hỏi thường gặp'],
];


// Section 4 — mỗi vị trí 1 ảnh minh họa (w-full). image: null → chưa có ảnh, chỉ hiển thị nội dung.
// Ảnh 1024×683 trừ lễ tân (1024×1024); khai báo đúng kích thước để không lệch bố cục (CLS).
const staffRoles = [
  {
    id: 'dong-phuc-hlv-gym',
    title: 'Đồng phục huấn luyện viên Gym',
    text: 'HLV sàn và HLV lớp nhóm vận động nhiều nhất trong ca: nâng tay, xoay vai, thị phạm liên tục. Cần áo co giãn, thoát ẩm, form gọn và dễ nhận diện từ xa. Áo thun Fit Body phù hợp môi trường năng động; polo thể thao dành cho phòng tập muốn hình ảnh chỉn chu hơn.',
    image: {
      src: 'https://live.staticflickr.com/65535/55545804128_66629d6247_b.jpg',
      alt: 'Đồng phục huấn luyện viên Gym – áo thun thể thao co giãn',
      caption: 'Áo thun thể thao co giãn cho huấn luyện viên Gym.',
      width: 1024,
      height: 683,
    },
  },
  {
    id: 'dong-phuc-pt-gym',
    title: 'Đồng phục PT',
    text: (
      <>
        PT tiếp xúc hội viên nhiều nhất, từ buổi đánh giá thể trạng đến tư vấn gói tập, nên hình ảnh ảnh hưởng trực tiếp
        tới niềm tin. Áo cần hỗ trợ vận động nhưng vẫn truyền tải sự chuyên nghiệp: áo thun Fit Body cổ trụ hoặc polo thể
        thao. Xem riêng giải pháp{' '}
        <Link href="/dong-phuc-pt" className={linkClass}>
          đồng phục PT
        </Link>
        .
      </>
    ),
    image: {
      src: 'https://live.staticflickr.com/65535/55361569106_a2e591a93f_b.jpg',
      alt: 'Áo đồng phục PT dạng polo thể thao co giãn',
      caption: 'Polo thể thao cho PT: chỉn chu khi tư vấn, thoải mái khi hướng dẫn.',
      width: 1024,
      height: 683,
    },
  },
  {
    id: 'dong-phuc-le-tan-gym',
    title: 'Đồng phục lễ tân và tư vấn viên',
    text: (
      <>
        Lễ tân và tư vấn viên là điểm chạm đầu tiên với khách mới: đón khách, check-in, tư vấn gói tập và dẫn khách
        tham quan sàn tập. Hai vị trí ít vận động mạnh nhưng đi lại nhiều trong ca, nên ưu tiên polo thể thao đứng form,
        ít nhăn, màu ổn định theo nhận diện thương hiệu, vừa lịch sự vừa thoải mái. Tham khảo thêm{' '}
        <Link href="/bai-viet/dong-phuc-le-tan-phong-gym" className={linkClass}>
          đồng phục lễ tân phòng Gym
        </Link>
        .
      </>
    ),
    image: {
      src: '/images/gym/dong-phuc-le-tan.jpg',
      alt: 'Đồng phục lễ tân và tư vấn viên phòng Gym – áo polo đứng form',
      caption: 'Polo đứng form, lịch sự cho lễ tân và tư vấn viên phòng Gym.',
      width: 1024,
      height: 1024,
    },
  },
  {
    id: 'dong-phuc-quan-ly-gym',
    title: 'Đồng phục quản lý và nhân viên vận hành',
    text: 'Quản lý hòa vào hệ nhận diện chung nhưng có dấu hiệu phân cấp vừa đủ: màu trung tính, viền màu thương hiệu hoặc tag vai trò; polo thể thao hoặc polo dài tay là phương án dễ triển khai. Nhân viên kỹ thuật, vệ sinh, vận hành cần áo bền, dễ giặt, không cản trở thao tác. Không nên tạo quá nhiều mẫu: 2–3 biến thể theo vai trò là dễ quản lý size và đơn bổ sung.',
    image: {
      src: '/images/gym/dong-phuc-quan-ly.jpg',
      alt: 'Đồng phục quản lý và nhân viên vận hành phòng Gym',
      caption: 'Đồng phục quản lý và vận hành: cùng hệ nhận diện, phân cấp vừa đủ.',
      width: 1024,
      height: 683,
    },
  },
  {
    id: 'dong-phuc-su-kien-cong-dong-gym',
    title: 'Đồng phục nhóm sự kiện và cộng đồng',
    text: 'Áo thử thách, workshop, CLB hội viên: giữ màu thương hiệu nhưng khác Staff Uniform ở phối màu hoặc vị trí logo, để hội viên vẫn nhận ra nhân sự trên sàn tập.',
    image: {
      src: 'https://live.staticflickr.com/65535/55577023382_63a9c45ec6_b.jpg',
      alt: 'Áo thun thể thao cổ tròn cho sự kiện và thử thách hội viên phòng Gym',
      caption: 'Áo cổ tròn cho sự kiện, thử thách và cộng đồng hội viên.',
      width: 1024,
      height: 683,
    },
  },
  {
    id: 'ao-tap-hoc-vien-hoi-vien-gym',
    title: 'Áo tập cho học viên, hội viên',
    text: (
      <>
        Áo tập in logo phòng tập giúp học viên, hội viên có trang phục phù hợp khi tập và tạo cảm giác thuộc về một cộng
        đồng. Hội viên mặc áo khi tập và khi ra ngoài, nên mỗi chiếc áo trở thành một điểm nhận diện thương hiệu. Áo tập
        cho hội viên nên dùng form Regular Fit dễ mặc, bảng size rộng và chất liệu nhẹ, nhanh khô như UNI QUICKDRY; thiết
        kế khác Staff Uniform để không nhầm với nhân sự. Đây là một phần của Member Uniform trong{' '}
        <Link href="/giai-phap-2s" className={linkClass}>
          giải pháp 2S Uniform
        </Link>
        .
      </>
    ),
    image: {
      src: 'https://live.staticflickr.com/65535/55593401433_e6b6c2e62a_b.jpg',
      alt: 'Học viên, hội viên mặc áo tập màu đen in logo phòng tập tại sự kiện cộng đồng',
      caption: 'Áo tập đồng bộ giúp học viên, hội viên cảm thấy là một phần của cộng đồng phòng tập.',
      width: 1024,
      height: 683,
    },
  },
];

const projects = [
  {
    name: 'Goldmark Fitness',
    image: '/images/gym/dong-phuc-hlv-goldmark-fitness-univi.jpg',
    alt: 'Đội ngũ HLV Goldmark Fitness mặc đồng phục Gym Univi',
    text: 'Đồng phục cho đội ngũ HLV phải giữ form gọn khi squat, thị phạm và hỗ trợ hội viên trong cả ca làm việc. Goldmark Fitness nằm trong danh sách khách hàng đã đặt mẫu AG18.',
    feedback: '/feedback/feedback-goldmark-fitness',
    article: '/bai-viet/dong-phuc-hlv-goldmark-fitness',
  },
  {
    name: 'The One KickFit',
    image: '/images/gym/univi-dong-hanh-cung-the-one-kickfit-3.jpg',
    alt: 'Huấn luyện viên The One KickFit mặc áo tập Gym Univi',
    text: 'Môi trường Boxing, Kickfit cường độ cao. HLV và PT tại đây phản hồi áo nhẹ, thoáng, co giãn và giúp hội viên nhận ra HLV ngay trên sàn tập.',
    feedback: '/feedback/feedback-the-one-kickfit',
    article: '/bai-viet/feedback-the-one-kickfit-ao-gym-pt-thoang-nhe-univi',
  },
  {
    name: 'AhaGym',
    image: '/images/gym/univi-dong-hanh-cung-ahagym-1.jpg',
    alt: 'Đồng phục HLV AhaGym may bằng vải UNI SUPERCOOL',
    text: 'Bài toán cân bằng giữa form đứng, chuyên nghiệp và sự thoải mái khi coaching. Đồng phục HLV dùng vải UNI SUPERCOOL.',
    feedback: '/feedback/feedback-dong-phuc-ahagym',
    article: '/bai-viet/feedback-ahagym',
  },
  {
    name: 'FitCaree',
    image: '/images/gym/univi-dong-hanh-cung-fitcaree-2.jpg',
    alt: 'Chuỗi phòng tập FitCaree với đồng phục đội ngũ đồng bộ',
    text: 'Chuỗi phòng tập cần đồng phục xuất hiện nhất quán ở sàn tập, ảnh đội ngũ, mạng xã hội và hoạt động cộng đồng.',
    feedback: '/feedback/feedback-fitcaree',
    article: '/bai-viet/univi-dong-hanh-cung-fitcaree',
  },
  {
    name: 'A100 GYM Dabaco Từ Sơn',
    image: 'https://live.staticflickr.com/65535/55593291116_bacb817a21_b.jpg',
    alt: 'Đội ngũ HLV, PT và nhân sự A100 GYM Dabaco Từ Sơn mặc đồng phục Gym đồng bộ',
    text: 'Toàn đội ngũ HLV, PT và nhân sự cùng mặc một hệ đồng phục. Hai mẫu được triển khai là áo Gym AG1 và AG29.',
    feedback: '/feedback/feeback-a100-tu-son',
    article: '/bai-viet/feedback-dong-phuc-a100-gym-dabaco-tu-son',
  },
  {
    name: 'One Coach Fitness Bắc Ninh',
    image: 'https://live.staticflickr.com/65535/55593292807_01aea1a06f_b.jpg',
    alt: 'PT One Coach Fitness Bắc Ninh mặc đồng phục polo thể thao tại phòng tập',
    imagePosition: 'object-[50%_40%]',
    text: 'Đồng phục chọn theo nhận diện của phòng tập, sử dụng mẫu polo thể thao AGPL17.',
    feedback: '/feedback/feedback-one-coach-fitnnes-bac-ninh',
    article: '/bai-viet/feedback-dong-phuc-one-coach-fitness-bac-ninh-or-univi',
  },
  {
    name: 'Welly Fitness',
    image: 'https://live.staticflickr.com/65535/55225938034_6cf39d08ee_b.jpg',
    alt: 'PT chuỗi phòng tập Welly Fitness mặc đồng phục Gym phối màu tím theo nhận diện',
    text: 'Chuỗi phòng tập cần đồng phục PT đồng bộ giữa các cơ sở, phối màu theo bộ nhận diện của thương hiệu.',
    feedback: '/feedback/chuoi-phong-tap-welly-fitness',
    article: '/bai-viet/welly-fitness-chon-univi-dong-phuc-5-sao',
  },
  {
    name: 'Mysterise Fitness',
    image: 'https://live.staticflickr.com/65535/55226107445_2106f30576_b.jpg',
    alt: 'HLV, PT chuỗi phòng tập Mysterise Fitness mặc đồng phục Gym màu đen',
    text: 'HLV và PT phản hồi áo nhẹ, thoáng, co giãn và giữ form sau nhiều lần giặt. Mysterise Fitness cũng nằm trong danh sách khách hàng đã đặt mẫu AG18.',
    feedback: '/feedback/chuoi-phong-tap-mysterise-fitness',
  },
];

const rolloutScenarios = [
  ['Phòng Gym nhỏ, PT Studio', 'Bắt đầu từ đồng phục HLV và PT, sau đó mở rộng sang áo hội viên hoặc áo sự kiện.'],
  ['Fitness Center', 'Triển khai theo vai trò: lễ tân, tư vấn viên, PT, HLV, quản lý và hội viên.'],
  ['Chuỗi phòng tập', 'Chốt bộ quy chuẩn: màu, form, chất liệu, vị trí logo, bảng size để các cơ sở không lệch nhau.'],
  ['Nhượng quyền', 'Đưa đồng phục vào bộ nhận diện thương hiệu kèm quy trình đặt bổ sung cho cơ sở mới.'],
];

const relatedArticles = [
  ['Áo tập Gym đường trần Univi', '/bai-viet/ao-tap-gym-duong-tran-unvi', 'Đường may trần và cảm giác mặc khi vận động.'],
  ['20+ mẫu áo Gym đẹp cho phòng tập và PT Studio', '/bai-viet/20-mau-ao-gym-dep-cho-phong-tap-2026', 'Tổng hợp mẫu áo theo kiểu dáng và vai trò.'],
  ['3 mẫu áo Gym được ưa chuộng tại Univi', '/bai-viet/3-mau-ao-gym-duoc-ua-chuong-tai-univi', 'Các mẫu được phòng tập chọn nhiều.'],
  ['Đồng phục Personal Trainer: chọn áo phù hợp cho PT', '/bai-viet/dong-phuc-personal-trainer-chon-ao-phu-hop-cho-pt', 'Cách chọn áo theo hình ảnh và công việc của PT.'],
  ['Áo Gym dài tay: 8 mẫu và cách chọn', '/bai-viet/ao-gym-dai-tay-8-mau-and-cach-chon-cho-phong-tap', 'Khi nào phòng tập nên dùng áo dài tay.'],
  ['Polo hay áo thun thể thao cho phòng tập?', '/bai-viet/polo-hay-ao-thun-the-thao-phong-tap-univi', 'So sánh hai kiểu áo theo vị trí nhân sự.'],
  ['Đồng phục lễ tân phòng Gym', '/bai-viet/dong-phuc-le-tan-phong-gym', 'Gợi ý cho quầy lễ tân và tư vấn viên.'],
  ['Chất liệu vải đồng phục thể thao', '/chat-lieu-vai', 'Thông số 5 dòng vải và bảng màu Univi.'],
];

export const gymFaqs = [
  [
    'Nên chọn áo đồng phục nào cho phòng Gym?',
    'Nên chọn theo vị trí thay vì một mẫu cho tất cả. HLV và PT thường dùng áo thun Fit Body hoặc polo thể thao co giãn; lễ tân, tư vấn viên và quản lý hợp với polo thể thao đứng form; hội viên và sự kiện dùng áo thun Regular Fit nhanh khô. Các nhóm nên giữ chung màu chủ đạo và vị trí logo.',
  ],
  [
    'Áo tập Gym cho nam và nữ có gì khác nhau?',
    'Khác biệt chủ yếu nằm ở form và cách áo ôm theo vóc dáng. Nhóm nam và nhóm nữ nên thử áo mẫu riêng, kiểm tra khi giơ tay, cúi người và thị phạm. Màu, logo và chi tiết phối nên giữ giống nhau để đội ngũ vẫn đồng bộ.',
  ],
  [
    'Nên chọn chất liệu nào cho đồng phục Fitness?',
    'HLV và PT vận động nhiều giờ hợp với UNI SUPERCOOL (mềm, mát, co giãn cao). Áo hội viên và áo sự kiện số lượng lớn hợp với UNI QUICKDRY hoặc UNI AIR (nhẹ, nhanh khô). Polo cho lễ tân, quản lý nên dùng UNI COOL PIQUÉ hoặc UNI ELITE.',
  ],
  [
    'Phòng tập có thể đặt đồng phục theo nhận diện thương hiệu không?',
    'Có. Univi may theo màu thương hiệu, logo, vị trí in/thêu và có thể in tên riêng từng người. Phòng tập được duyệt mockup trước khi sản xuất; dịch vụ thiết kế và tư vấn concept miễn phí.',
  ],
  [
    'Nên chọn áo nào cho HLV và PT?',
    'Tùy định vị phòng tập. Polo thể thao cho hình ảnh lịch sự, phù hợp PT tư vấn trực tiếp; áo thun Fit Body cho môi trường năng động, thiên về vận động. Nếu chọn polo, nên dùng vải thể thao như UNI COOL PIQUÉ hoặc UNI ELITE thay vì polo văn phòng dày.',
  ],
  [
    'Univi có thể tư vấn thiết kế đồng phục cho chuỗi phòng tập không?',
    'Có. Univi hỗ trợ chuỗi phòng tập nhiều cơ sở theo giải pháp 2S Uniform (Staff Uniform cho nhân sự và Member Uniform cho hội viên), đồng thời lưu thông số mẫu chuẩn để các cơ sở đặt bổ sung không bị lệch màu, lệch form.',
  ],
  [
    'Đồng phục Gym có cần co giãn 4 chiều không?',
    'Nên có, vì HLV và PT thị phạm động tác đa hướng liên tục như squat, plank, chống đẩy, giơ tay qua đầu. Vải thiếu co giãn sẽ kéo căng ở vai, nách và làm logo biến dạng.',
  ],
  [
    'Phòng tập ít nhân sự có đặt đồng phục được không?',
    'Được. Phòng tập nhỏ có thể bắt đầu với nhóm HLV và PT rồi mở rộng sang lễ tân hoặc áo hội viên. Số lượng tối thiểu được tư vấn theo mẫu và chất liệu cụ thể.',
  ],
];

function GenderShowcase({ slugs = [], products = [] }) {
  if (!slugs.length) return null;
  const items = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <li key={p.slug} className="rounded-lg border border-gray-100 p-2">
          <Link href={`/san-pham/${p.slug}`} className="block">
            <Image src={getImageUrl(p.image)} alt={p.name} width={600} height={800} sizes="(max-width: 640px) 46vw, 200px" className="aspect-[3/4] h-auto w-full rounded-md bg-gray-50 object-contain" />
            <span className="mt-2 block text-sm font-semibold text-gray-900">{p.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NỘI DUNG PILLAR (section 03 → 14)
// ─────────────────────────────────────────────────────────────────────────────

export default function GymUniviPage({ products = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-gray-700 ">
      <nav aria-label="Mục lục" className="rounded-xl hidden md:block border border-gray-100 bg-[#105d97]/[0.03] p-4 md:p-5">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#105d97]">Nội dung chính</p>
        <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {tocItems.map(([id, label], i) => (
            <li key={id}>
              <a href={`#${id}`} className="text-gray-700 hover:text-[#105d97] hover:underline">
                {i < 11 ? `${i + 1}. ` : ''}
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 03 */}
      <Section id="giai-phap-phong-tap" title="1. Giải pháp đồng phục cho phòng tập Gym và Fitness">
        <div className="space-y-3 leading-7">
          <p>
            Hội viên đánh giá phòng tập qua không gian, nhân sự và hình ảnh trước khi đánh giá máy móc hay giáo án. Đồng
            phục xuất hiện ở mọi điểm chạm đó: quầy lễ tân, sàn tập, buổi tư vấn gói tập, ảnh đội ngũ trên mạng xã hội.
            Mỗi mô hình kinh doanh lại cần một cách triển khai đồng phục cho phòng tập khác nhau.
          </p>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextCard title="Chuỗi phòng Gym">
            <p>
              Cần chuẩn hóa màu, form, chất liệu, vị trí logo và file thiết kế ngay từ đơn đầu tiên, để mỗi cơ sở mới đặt
              bổ sung vẫn ra đúng hình ảnh. Xem thêm cách triển khai{' '}
              <Link href="/bai-viet/dong-phuc-chuoi-phong-tap" className={linkClass}>
                đồng phục cho chuỗi phòng tập
              </Link>
              .
            </p>
          </TextCard>
          <TextCard title="Fitness Center">
            <p>
              Nhiều điểm chạm và nhiều vai trò: lễ tân, tư vấn viên, PT, HLV lớp nhóm, quản lý, hội viên. Nên triển khai
              theo hệ thống thay vì từng mẫu rời; chi tiết tại trang{' '}
              <Link href="/dong-phuc-fitness-center" className={linkClass}>
                đồng phục trung tâm Fitness
              </Link>
              .
            </p>
          </TextCard>
          <TextCard title="PT Studio">
            <p>
              Đội ngũ nhỏ, hình ảnh PT quyết định niềm tin của khách. Có thể bắt đầu với đồng phục PT rồi mở rộng sau; tham
              khảo{' '}
              <Link href="/bai-viet/phong-gym-private-duoi-10-nhan-su-nen-mac-gi-cho-dung-nhat" className={linkClass}>
                phòng Gym dưới 10 nhân sự nên mặc gì
              </Link>
              .
            </p>
          </TextCard>
          <TextCard title="CLB thể thao">
            <p>
              Ưu tiên áo hội viên, áo thử thách và áo sự kiện: dễ mặc, nhanh khô, bảng size rộng, chi phí hợp lý khi đặt số
              lượng lớn.
            </p>
          </TextCard>
          <TextCard title="Đội ngũ HLV và PT">
            <p>
              Là nhóm vận động nhiều nhất và tiếp xúc hội viên nhiều nhất, nên cần áo co giãn, thoát ẩm và form gọn. Cách
              chọn theo từng vai trò ở mục 5.
            </p>
          </TextCard>
        </div>
        <div className="mt-6 rounded-lg bg-gray-50 p-4 md:p-5">
          <p className="mb-2 font-semibold text-gray-900">Điểm chung khi đặt đồng phục phòng Gym</p>
          <ul className="list-disc space-y-1 pl-5 leading-7">
            <li><strong>Đồng bộ hình ảnh:</strong> cùng màu chủ đạo, cùng ngôn ngữ phối màu cho toàn đội ngũ.</li>
            <li><strong>Nhận diện thương hiệu:</strong> logo đặt ở vị trí rõ, không nằm ở vùng vải bị kéo căng.</li>
            <li><strong>Phân biệt vị trí:</strong> hội viên nhận ra ngay ai là PT, ai là lễ tân, ai là quản lý.</li>
            <li><strong>Phù hợp môi trường:</strong> sàn tập cần vải thoát ẩm, quầy lễ tân cần áo đứng form.</li>
            <li><strong>Đặt bổ sung theo đợt:</strong> lưu file thiết kế, mã màu, chất liệu và bảng size để đơn sau không lệch đơn đầu.</li>
          </ul>
        </div>
        <div className="mt-6 w-full">
          <Figure
            src="https://live.staticflickr.com/65535/55545803713_233c663a96_b.jpg"
            alt="Đội ngũ HLV nam và nữ mặc đồng phục Gym Univi đồng bộ màu sắc tại phòng tập"
            caption="Đồng phục đồng bộ giúp hội viên nhận ra đội ngũ ngay trên sàn tập."
            width={1024}
            height={683}
          />
        </div>
      </Section>

      {/* 04 */}
      <Section id="ao-tap-gym-nam" title="2. Áo tập Gym cho nam">
        <p className="leading-7">
          Với HLV và PT nam, áo tập Gym cần cho phép giơ tay qua đầu, xoay vai, squat và hướng dẫn máy mà không kéo căng
          vùng nách hay làm logo biến dạng. Các tiêu chí nên cân nhắc:
        </p>
        <dl className="mt-4 grid gap-4 grid-cols-2">
          {[
            ['Kiểu dáng', 'Áo thun Fit Body cho sàn tập; polo thể thao cho PT tư vấn và quản lý; áo sát nách có thể dùng ở phòng tập sức mạnh.'],
            ['Form áo', 'Athletic Fit hoặc Slim Fit vừa phải cho HLV, PT: ôm gọn nhưng không bó. Regular Fit cho nhân viên và hội viên.'],
            ['Cổ áo', 'Cổ tròn gọn và năng động; cổ trụ chỉn chu hơn; polo cho hình ảnh dịch vụ.'],
            ['Tay áo', 'Tay raglan (đường ráp chéo từ cổ xuống nách) giúp vai linh hoạt hơn; áo dài tay cho phòng máy lạnh hoặc mùa lạnh.'],
            ['Chất liệu', 'UNI SUPERCOOL cho HLV, PT mặc nhiều giờ; UNI QUICKDRY cho áo hội viên, sự kiện.'],
            ['Khả năng vận động', 'Khi duyệt áo mẫu, cho người mặc squat, plank, chống đẩy và giơ tay để kiểm tra vai, nách, gấu áo.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border border-gray-100 p-4">
              <dt className="font-semibold text-gray-900">{t}</dt>
              <dd className="mt-1 text-sm leading-6 md:text-base">{d}</dd>
            </div>
          ))}
        </dl>
        <GenderShowcase slugs={GENDER_SHOWCASE.nam} products={products} />
        <p className="mt-4 leading-7">
          Phân tích chi tiết hơn về kiểu dáng và form tại bài{' '}
          <Link href="/bai-viet/ao-tap-gym-cho-nam-chon-kieu-form-va-chat-lieu-phu-hop" className={linkClass}>
            áo tập Gym cho nam: chọn kiểu, form và chất liệu
          </Link>
          .
        </p>
        {GENDER_GALLERY.nam.images.length > 0 && (
          <div className="mt-6">
            <ArticleImageGallery images={GENDER_GALLERY.nam.images} title={GENDER_GALLERY.nam.title} />
          </div>
        )}
      </Section>

      {/* 05 */}
      <Section id="ao-tap-gym-nu" title="3. Áo tập Gym cho nữ ">
        <p className="leading-7">
          HLV nữ đứng lớp, PT nữ và nhân viên nữ trong phòng tập vừa cần vận động thoải mái, vừa cần hình ảnh chỉn chu khi
          làm việc với hội viên. Áo tập Gym cho nữ nên được chọn theo các tiêu chí sau:
        </p>
        <dl className="mt-4 grid gap-4 grid-cols-2">
          {[
            ['Kiểu dáng', 'Áo thun Fit Body cho HLV, PT; polo thể thao cho lễ tân, tư vấn viên và quản lý.'],
            ['Form áo', 'Ôm vừa phải, gọn ở thân nhưng không bó; chiều dài áo đủ để không bị kéo lên khi giơ tay.'],
            ['Độ ôm và độ che phủ', 'Kiểm tra khi cúi người, gập người và giơ tay: vải không quá mỏng khi căng, gấu áo không cuộn.'],
            ['Chất liệu', 'UNI SUPERCOOL mềm, mượt, mát và có độ rủ, phù hợp áo mặc sát người nhiều giờ.'],
            ['Thoải mái khi vận động', 'Đường may vùng vai, nách, sườn cần phẳng để giảm cọ xát khi động tác lặp lại.'],
            ['Đồng bộ với đội nam', 'Cùng màu, cùng vị trí logo và chi tiết phối; chỉ khác form để cả đội vẫn thống nhất.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border border-gray-100 p-4">
              <dt className="font-semibold text-gray-900">{t}</dt>
              <dd className="mt-1 text-sm leading-6 md:text-base">{d}</dd>
            </div>
          ))}
        </dl>
        <GenderShowcase slugs={GENDER_SHOWCASE.nu} products={products} />
        <p className="mt-4 leading-7">
          Với đội ngũ có cả nam và nữ, nên để mỗi nhóm thử áo mẫu riêng trước khi chốt size và sản xuất toàn bộ đơn.
        </p>
        {GENDER_GALLERY.nu.images.length > 0 && (
          <div className="mt-6">
            <ArticleImageGallery images={GENDER_GALLERY.nu.images} title={GENDER_GALLERY.nu.title} />
          </div>
        )}
      </Section>

      <Section id="mau-mockup-ao-tap-gym" title="4. Các mẫu áo tập Gym tại Univi">
        <p className="mb-6 leading-7">
          Các mẫu dưới đây chia theo kiểu cổ: cổ tròn không khoá, cổ tròn có khoá, cổ trụ có khoá và cổ polo. Chọn
          một mã mẫu để xem nhanh, sau đó gửi yêu cầu để Univi phối lại theo màu và logo của phòng tập.
        </p>
        <GymMockupCollection />
      </Section>

      {/* 06 */}
      <Section id="dong-phuc-hlv-pt-nhan-vien" title="5. Đồng phục HLV, PT và nhân viên phòng Gym">
        <p className="mb-5 leading-7">
          Sai lầm thường gặp là dùng một loại vải và một form cho mọi vị trí. Mỗi nhóm nhân sự có cường độ vận động và yêu
          cầu hình ảnh khác nhau:
        </p>
        <div className="space-y-4">
          {staffRoles.map((role, i) => (
            <div key={role.id} id={role.id} className="scroll-mt-24">
              <H3>{`5.${i + 1} ${role.title}`}</H3>
              <p className="leading-7">{role.text}</p>
              {role.image && (
                <div className="mt-2 w-full">
                  <Figure
                    src={role.image.src}
                    alt={role.image.alt}
                    caption={role.image.caption}
                    width={role.image.width}
                    height={role.image.height}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 07 */}
      <Section id="chat-lieu" title="6. Chất liệu và công nghệ vải cho áo tập Gym">
        <div className="space-y-3 leading-7">
          <p>
            Chất liệu quyết định đồng phục có được đội ngũ mặc lâu dài hay không. Univi dùng hệ 5 dòng vải có thông số công
            bố, chọn theo vị trí và cường độ vận động thay vì một loại vải cho mọi người.
          </p>
          <p>
            <Link href="/cong-nghe-uni-dry" className={linkClass}>
              Công nghệ UNI DRY
            </Link>{' '}
            là công nghệ xử lý thoát ẩm Univi ứng dụng trên các dòng vải thể thao (không phải tên một loại vải): kiểm soát
            chuyển động một chiều của hơi ẩm từ bề mặt da ra lớp ngoài vải rồi bay hơi, hạn chế ẩm thấm ngược vào da.
          </p>
        </div>

        <div className="mt-6">
          <FabricCatalogView defaultTab="UNIA02" titleAs="h3" />
        </div>
      </Section>

      {/* 08 */}
      <Section id="kinh-nghiem-chon-ao" title="7. Kinh nghiệm lựa chọn áo đồng phục Gym phù hợp">
        <div className="grid gap-5 md:grid-cols-2">
          <TextCard title="Chọn form áo">
            <p>Athletic Fit vừa phải cho HLV, PT; Regular Fit cho nhân viên và hội viên. Quá rộng mất vẻ gọn, quá bó gây khó chịu khi thị phạm.</p>
          </TextCard>
          <TextCard title="Chọn kiểu cổ">
            <p>Cổ tròn cho sàn tập năng động, cổ trụ cho vẻ chỉn chu, polo cho vị trí tư vấn và quầy lễ tân.</p>
          </TextCard>
          <TextCard title="Chọn chất liệu">
            <p>Theo vị trí và cường độ vận động (bảng ở mục 6). Không dùng polo văn phòng dày cho HLV vì nóng và giữ ẩm.</p>
          </TextCard>
          <TextCard title="Chọn màu sắc">
            <p>
              Giữ màu chủ đạo của thương hiệu, phân vai bằng màu phối hoặc chi tiết nhỏ. Chọn màu trực tiếp trên{' '}
              <Link href="/bang-mau" className={linkClass}>bảng màu</Link> để đơn sau không lệch tông.
            </p>
          </TextCard>
          <TextCard title="Thiết kế logo">
            <p>Logo ngực trái, lưng hoặc tay áo, có thứ bậc rõ; tránh đặt logo lớn ở vùng vải thường xuyên bị kéo căng.</p>
          </TextCard>
          <TextCard title="Đường may và hoàn thiện">
            <p>
              Kiểm tra đường may ở vai, nách, cổ và sườn vì đây là điểm dễ ma sát khi tập lặp lại. Xem ví dụ{' '}
              <Link href="/bai-viet/ao-tap-gym-duong-tran-unvi" className={linkClass}>áo tập Gym đường trần</Link>.
            </p>
          </TextCard>
          <TextCard title="Thử mẫu trước khi sản xuất">
            <p>Áo đẹp trên catalogue chưa chắc đẹp trên người. Nhận áo mẫu, cho người mặc vận động thật rồi mới duyệt sản xuất toàn bộ đơn.</p>
          </TextCard>
          <TextCard title="Không chọn theo giá mua rẻ nhất">
            <p>Áo nhanh giãn, bạc màu sẽ phải đặt lại sớm. Nên so sánh theo chi phí sử dụng trong suốt thời gian đội ngũ mặc áo.</p>
          </TextCard>
        </div>
        <div className="mt-6">
          <Figure
            src="/images/gym/thiet-ke-dong-phuc-gym-dep.jpg"
            alt="Nhóm huấn luyện viên mặc mẫu áo đồng phục Gym đồng bộ màu sắc"
            width={1200}
            height={1200}
          />
        </div>
      </Section>

      {/* 09 */}
      <Section id="du-an" title="8. Dự án đồng phục Gym và Fitness">
        <p className="mb-5 leading-7">
          Một số phòng tập và chuỗi Fitness đã triển khai đồng phục cùng Univi. Nội dung chi tiết, hình ảnh và phản hồi nằm
          ở trang feedback của từng dự án.
        </p>
        <ul className="grid gap-5 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.name} className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              <Image src={p.image} alt={p.alt} width={1200} height={800} sizes="(max-width: 768px) 100vw, 420px" className={`aspect-[3/2] h-auto w-full object-cover ${p.imagePosition || ''}`} />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                <p className="mt-1 text-sm leading-6 md:text-base">{p.text}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <Link href={p.feedback} className={linkClass}>Feedback {p.name}</Link>
                  {p.article && (
                    <Link href={p.article} className="font-medium text-gray-700 hover:text-[#105d97] hover:underline">Đọc bài dự án</Link>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-5">
          <div className="space-y-3 leading-7">
            <p>
              Univi sản xuất khép kín từ thiết kế, rập, cắt, may, in/thêu đến kiểm tra chất lượng, với xưởng 2.000m² và công
              suất 100.000 sản phẩm/tháng. Chủ đầu tư có thể đối chiếu{' '}
              <Link href="/ho-so-nang-luc" className={linkClass}>hồ sơ năng lực</Link> và{' '}
              <Link href="/xuong-may-dong-phuc-univi" className={linkClass}>xưởng may đồng phục Gym</Link> trước khi triển khai.
            </p>
            <p>
              Xem thêm{' '}
              <Link href="/feedback" className={linkClass}>các dự án và feedback khác</Link>.
            </p>
          </div>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200">
            <iframe
              className="aspect-video w-full"
              src="https://www.youtube.com/embed/0AABoh2a-Sk"
              title="Năng lực sản xuất đồng phục thể thao Univi"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* 10 */}
      <Section id="giai-phap-2s" title="9. Giải pháp 2S Uniform cho phòng tập">
        <p className="leading-7">
          Với phòng tập có nhiều nhóm người mặc, đặt từng mẫu riêng lẻ dễ tạo ra hệ thống rời rạc.{' '}
          <Link href="/giai-phap-2s" className={linkClass}>Giải pháp 2S Uniform</Link> của Univi chia bài toán thành hai phần
          dùng chung một ngôn ngữ thương hiệu:
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#105d97]/20 bg-[#105d97]/5 p-5">
            <h3 className="text-lg font-semibold text-[#0b3f66]">Staff Uniform</h3>
            <p className="mt-1 text-sm font-medium text-gray-600">Lễ tân, HLV, PT, quản lý, tư vấn viên</p>
            <p className="mt-2 leading-7">Đồng bộ hình ảnh, chuyên nghiệp hóa dịch vụ và tăng nhận diện thương hiệu tại mọi điểm chạm.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Member Uniform</h3>
            <p className="mt-1 text-sm font-medium text-gray-600">Áo tập, áo sự kiện, áo thử thách, áo CLB, bộ sưu tập riêng</p>
            <p className="mt-2 leading-7">Tăng gắn kết cộng đồng, tạo doanh thu bổ sung và biến hội viên thành người lan tỏa thương hiệu.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {rolloutScenarios.map(([t, d]) => (
            <TextCard key={t} title={t}>
              <p>{d}</p>
            </TextCard>
          ))}
        </div>
      </Section>

      {/* 11 */}
      <Section id="quy-trinh" title="10. Quy trình đặt may đồng phục Gym">
        <UniviOrderProcess />
        <p className="mt-5 leading-7">
          Mẫu có sẵn được giao nhanh; đơn thiết kế riêng có tiến độ theo số lượng và thời điểm, Univi báo lịch cụ thể khi
          chốt đơn. Xem{' '}
          <Link href="/huong-dan-dat-hang" className={linkClass}>hướng dẫn đặt hàng</Link> và kinh nghiệm{' '}
          <Link href="/bai-viet/dat-may-dong-phuc-gym-so-luong-lon" className={linkClass}>đặt may đồng phục Gym số lượng lớn</Link>.
        </p>
      </Section>

      {/* 12 */}
      <Section id="bai-viet-lien-quan" title="11. Bài viết kiến thức liên quan">
        <ul className="grid gap-3 md:grid-cols-2">
          {relatedArticles.map(([label, href, note]) => (
            <li key={href}>
              <Link href={href} className="block rounded-lg border border-gray-100 p-4 transition hover:border-[#105d97]">
                <span className="font-semibold text-[#105d97]">{label}</span>
                <span className="mt-1 block text-sm text-gray-600">{note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 13 */}
      <Section id="faq" title="Câu hỏi thường gặp về đồng phục Gym">
        <div className="space-y-3">
          {gymFaqs.map(([q, a]) => (
            <details key={q} className="group rounded-lg border border-gray-200 bg-white">
              <summary className="flex min-h-[44px] cursor-pointer items-center px-4 py-3 font-semibold text-gray-900">{q}</summary>
              <p className="border-t border-gray-100 px-4 py-3 text-sm leading-6 text-gray-700 md:text-base">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* 14 */}
      <section aria-labelledby="gym-cta-title" className="mt-4 rounded-xl p-5 text-white md:p-8" style={{ backgroundColor: BRAND }}>
        <p className="text-base font-semibold uppercase tracking-[0.15em] text-blue-100">Your uniform, your brand!</p>
        <h2 id="gym-cta-title" className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">
          Xây dựng hình ảnh phòng tập chuyên nghiệp cùng đồng phục Univi
        </h2>
        <p className="mt-3 leading-7 text-blue-50">
          Một hệ đồng phục Gym đúng bắt đầu từ việc phân vai đội ngũ, chọn chất liệu theo cường độ vận động và lưu chuẩn để
          đặt bổ sung về sau. Gửi Univi logo, màu thương hiệu, các vị trí nhân sự, số lượng dự kiến và thời điểm cần hàng để
          nhận tư vấn chất liệu, mockup và phương án 2S Uniform.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#105d97] hover:bg-blue-50"
          >
            Nhận tư vấn
          </button>

          <a href="#bo-suu-tap-gym" className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            Xem bộ sưu tập
          </a>
        </div>
        <div className="mt-5 grid gap-1 text-sm text-blue-50">
          <p><span className="font-semibold">Văn phòng:</span> Nhà D14, ngõ 180 đường Thanh Bình, phường Hà Đông, thành phố Hà Nội · giao hàng toàn quốc</p>
          <p><span className="font-semibold">Hotline/Zalo:</span> 0834.204.999 · 0961.567.997</p>
        </div>
      </section>

      <ContactForm source="Đồng phục Gym - Nhận tư vấn" isModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
