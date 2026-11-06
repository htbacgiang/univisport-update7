import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '../../header/ContactForm';
import { PRODUCTS as ROUND_PRODUCTS } from '../UniformStylesComponent';
import { ROUND_ZIP_PRODUCTS, COLLAR_ZIP_PRODUCTS } from '../UniformStylesZippedComponent';
import { POLO_PRODUCTS } from '../UniformStylesPoloComponent';

/*
 * Gộp mockup từ 3 component UniformStyles* (cổ tròn không khoá, cổ có khoá, cổ polo) cho trang pillar Gym.
 * Dùng lại dữ liệu + giao diện lưới/popup của 3 component gốc, nhưng KHÔNG có ảnh bìa, H1 "KIỂU DÁNG ÁO UNIVI"
 * và thanh thông tin liên hệ. Ba trang /mau-ao-gym-co-* vẫn dùng component gốc, không thay đổi.
 */

const GROUPS = [
  {
    id: 'mockup-co-tron-khong-khoa',
    title: 'Cổ tròn không khoá',
    href: '/mau-ao-gym-co-tron-khong-khoa',
    items: ROUND_PRODUCTS,
    cols: 'sm:grid-cols-4',
  },
  {
    id: 'mockup-co-tron-co-khoa',
    title: 'Cổ tròn có khoá',
    href: '/mau-ao-gym-co-co-khoa',
    items: ROUND_ZIP_PRODUCTS,
    cols: 'sm:grid-cols-4',
  },
  {
    id: 'mockup-co-tru-co-khoa',
    title: 'Cổ trụ có khoá',
    href: '/mau-ao-gym-co-co-khoa',
    items: COLLAR_ZIP_PRODUCTS,
    cols: 'sm:grid-cols-4',
  },
  {
    id: 'mockup-co-polo',
    title: 'Cổ polo',
    href: '/mau-ao-gym-co-polo',
    items: POLO_PRODUCTS,
    cols: 'sm:grid-cols-3',
  },
];

// Tên thương mại chưa được xác nhận (27-can-xac-minh #20) — không hiển thị trên pillar.
const cleanText = (text = '') => text.replace(/\s*Powerzip/gi, '').trim();

export default function GymMockupCollection() {
  const [selected, setSelected] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSource, setContactSource] = useState('Đồng phục Gym - Mockup áo tập Gym');

  const openConsult = (item) => {
    setSelected(null);
    setContactSource(`Đồng phục Gym - Yêu cầu thiết kế mã mẫu ${item.code}`);
    setContactOpen(true);
  };

  return (
    <div className="font-sans text-slate-800">
      {GROUPS.map((group) => (
        <div key={group.id} id={group.id} className="scroll-mt-24 mb-8 sm:mb-10">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 sm:mb-4">
            <h3 className="text-base font-bold tracking-wide text-slate-800 sm:text-xl">
              {group.title}{' '}
              <span className="text-sm font-medium normal-case text-slate-400">· {group.items.length} mẫu</span>
            </h3>
            <Link href={group.href} className="text-sm font-semibold text-[#105d97] hover:underline">
              Xem trang mẫu {group.title.toLowerCase()}
            </Link>
          </div>
          <ul className={`grid grid-cols-2 ${group.cols} gap-3 sm:gap-6`}>
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group flex w-full flex-col items-center rounded-xl bg-white p-2 transition-all duration-300 hover:-translate-y-1 sm:p-3"
                  aria-label={`Xem nhanh mẫu ${item.code}: ${cleanText(item.name)}`}
                >
                  <span className="relative mb-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={cleanText(item.name)}
                      fill
                      sizes="(max-width: 640px) 50vw, 220px"
                      className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="text-center text-xs font-extrabold uppercase tracking-wider text-slate-700 group-hover:text-[#105d97] sm:text-sm">
                    {item.code}
                  </span>
                  {item.subTitle && (
                    <span className="mt-0.5 text-center text-[10px] font-medium uppercase tracking-tight text-slate-400 sm:text-xs">
                      {item.subTitle}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-700 sm:space-y-3 sm:text-sm">
        <p>
          <span className="mr-1.5 font-extrabold uppercase tracking-wide text-[#105d97]">*Tuỳ chọn phối màu cổ &amp; tay</span>
          Dễ dàng tuỳ chỉnh theo màu sắc trong bộ nhận diện, giúp đồng phục trở thành một phần thống nhất của hình ảnh thương hiệu.
        </p>
        <p>
          <span className="mr-1.5 font-extrabold uppercase tracking-wide text-[#105d97]">*Logo in/thêu sắc nét</span>
          Linh hoạt lựa chọn nhiều vị trí thể hiện, giúp tăng khả năng nhận diện và tạo dấu ấn riêng cho từng thương hiệu.
        </p>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Mẫu ${selected.code}`}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#105d97] to-[#0e4a7a] p-4 text-white">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Mã mẫu</span>
                <p className="text-xl font-black uppercase text-white">{selected.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-white/10 p-1.5 text-white/80 transition hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image src={selected.image} alt={cleanText(selected.name)} fill sizes="500px" className="object-contain p-2" />
              </div>
              <div>
                <p className="mb-1 text-base font-bold text-slate-900">{cleanText(selected.name)}</p>
                <p className="text-sm leading-relaxed text-slate-600">{cleanText(selected.description)}</p>
              </div>
              <button
                type="button"
                onClick={() => openConsult(selected)}
                className="w-full rounded-xl bg-[#105d97] py-3 text-sm font-bold text-white shadow transition hover:bg-[#0d4a7a]"
              >
                Yêu cầu thiết kế mã {selected.code}
              </button>
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <ContactForm isModal isOpen={contactOpen} onClose={() => setContactOpen(false)} source={contactSource} />
      )}
    </div>
  );
}
