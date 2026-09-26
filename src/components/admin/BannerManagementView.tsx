import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Crop,
  Image as ImageIcon,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Power
} from 'lucide-react';
import { satinImage, jewelryImage } from '../../data';
import { Banner, db, CropData, AdminUser } from '../../services/db';
import { ImageCropper } from '../ImageCropper';

type BannerManagementViewProps = {
  currentAdmin: AdminUser;
};

export function BannerManagementView({ currentAdmin }: BannerManagementViewProps) {
  const [banners, setBanners] = useState<Banner[]>(() => db.getBanners());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form Fields
  const [bInternalName, setBInternalName] = useState('');
  const [bEyebrow, setBEyebrow] = useState('');
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bActive, setBActive] = useState(true);

  // Crop Editor
  const [cropperOpen, setCropperOpen] = useState(false);
  const [activeCropData, setActiveCropData] = useState<CropData | undefined>();

  const refreshList = () => {
    setBanners(db.getBanners());
  };

  const openForm = (banner: Banner | null = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBInternalName(banner.internalName);
      setBEyebrow(banner.eyebrow);
      setBTitle(banner.title);
      setBSubtitle(banner.subtitle);
      setBImage(banner.image);
      setBActive(banner.active);
      setActiveCropData(banner.cropData);
    } else {
      setEditingBanner(null);
      setBInternalName('کمپین زمستانه آورا');
      setBEyebrow('NEW DROP');
      setBTitle('عنوان بنر جذاب');
      setBSubtitle('توضیحات کوتاه بنر برای نمایش در اسلایدر اصلی.');
      setBImage(satinImage);
      setBActive(true);
      setActiveCropData(undefined);
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bInternalName) return;

    db.saveBanner(
      {
        id: editingBanner ? editingBanner.id : undefined,
        internalName: bInternalName,
        eyebrow: bEyebrow,
        title: bTitle,
        subtitle: bSubtitle,
        image: bImage,
        active: bActive,
        cropData: activeCropData
      },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );

    refreshList();
    setModalOpen(false);
  };

  const handleToggleActive = (banner: Banner) => {
    db.saveBanner(
      { id: banner.id, active: !banner.active },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    refreshList();
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این بنر از اسلایدر اصلی اطمینان دارید؟')) {
      db.deleteBanner(id, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
      refreshList();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...banners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    db.reorderBanners(list, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
    refreshList();
  };

  const handleCropComplete = (croppedUrl: string, cropData: CropData) => {
    setBImage(croppedUrl);
    setActiveCropData(cropData);
    setCropperOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت بنرهای اسلایدر اصلی (Banner Management)</h2>
          <p className="text-xs text-[#8b627e]">مدیریت بنرهای تصویری، کراپ تعاملی، فعال/غیرفعال‌سازی و تغییر ترتیب نمایش</p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
        >
          <Plus size={16} /> افزودن بنر جدید
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={'relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm space-y-4 transition ' + (banner.active ? 'border-[#37192c]/10' : 'border-rose-300 opacity-60')}
          >
            {/* Image Preview & Hover Tooltip */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#37192C]">
              <img src={banner.image} alt={banner.title} className="size-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-[#FFF3C5]">{banner.eyebrow}</span>
                <h3 className="text-base font-black">{banner.title}</h3>
                <p className="text-xs text-white/80 truncate">{banner.subtitle}</p>
              </div>

              {/* Internal Name Tooltip */}
              <div className="absolute top-3 right-3 rounded-full bg-[#37192C]/80 px-3 py-1 text-[10px] font-bold text-[#FFF3C5] backdrop-blur-xs">
                نام داخلی: {banner.internalName}
              </div>
            </div>

            {/* Actions & Ordering Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#37192c]/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={'flex items-center gap-1.5 rounded-full px-3 py-1 font-bold transition ' + (banner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}
                >
                  <Power size={14} />
                  <span>{banner.active ? 'فعال' : 'غیرفعال'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="grid size-8 place-items-center rounded-lg bg-[#fffaf0] text-[#37192C] border hover:bg-[#FFF3C5] disabled:opacity-30"
                  title="انتقال به بالا"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === banners.length - 1}
                  className="grid size-8 place-items-center rounded-lg bg-[#fffaf0] text-[#37192C] border hover:bg-[#FFF3C5] disabled:opacity-30"
                  title="انتقال به پایین"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => openForm(banner)}
                  className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a]"
                  title="ویرایش"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">
              {editingBanner ? 'ویرایش بنر اسلایدر' : 'افزودن بنر تصویری جدید'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">نام مدیریت داخلی (Internal Name - صرفاً جهت ادمین)</label>
                <input
                  type="text"
                  required
                  value={bInternalName}
                  onChange={(e) => setBInternalName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  placeholder="مثال: Winter Campaign 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">برچسب یا روتیتر (Eyebrow)</label>
                  <input
                    type="text"
                    value={bEyebrow}
                    onChange={(e) => setBEyebrow(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                    placeholder="NEW DROP"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">عنوان بنر</label>
                  <input
                    type="text"
                    required
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#37192C]">زیرعنوان / زیرمتن</label>
                <input
                  type="text"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                />
              </div>

              {/* Banner Image & Crop Button */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 space-y-3">
                <p className="font-bold text-[#37192C]">تصویر بنر و برش غیرمخرب (Crop Editor):</p>
                <div className="relative h-36 w-full overflow-hidden rounded-xl border">
                  <img src={bImage} alt="تصویر بنر" className="size-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCropperOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#37192C] py-2.5 text-xs font-bold text-[#FFF3C5]"
                  >
                    <Crop size={16} /> برش تعاملی تصویر (Crop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBImage(bImage === satinImage ? jewelryImage : satinImage)}
                    className="rounded-xl bg-[#FFF3C5] px-4 py-2.5 text-xs font-bold text-[#37192C]"
                  >
                    تغییر عکس نمونه
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={bActive}
                  onChange={(e) => setBActive(e.target.checked)}
                  className="accent-[#37192C] size-4"
                />
                <label htmlFor="activeToggle" className="font-bold text-[#37192C] cursor-pointer">
                  بنر فعال باشد و در صفحه اصلی نمایش داده شود
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#37192C] py-3.5 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition mt-4"
              >
                ذخیره بنر
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {cropperOpen && (
        <ImageCropper
          imageUrl={bImage}
          initialCropData={activeCropData}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperOpen(false)}
        />
      )}
    </div>
  );
}
