import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Video,
  X,
  ChevronDown
} from 'lucide-react';
import { categoryList, satinImage, jewelryImage, necklaceImage, watchImage } from '../../data';
import { Product, db, AdminUser } from '../../services/db';

type ProductManagementViewProps = {
  currentAdmin: AdminUser;
};

export function ProductManagementView({ currentAdmin }: ProductManagementViewProps) {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('همه');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  // Custom Dropdown Open States
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [formCatOpen, setFormCatOpen] = useState(false);
  const [formBadgeOpen, setFormBadgeOpen] = useState(false);

  // Modal State for Product Editing/Creating
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pStock, setPStock] = useState('10');
  const [pCategory, setPCategory] = useState('گردنبند');
  const [pBadge, setPBadge] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pStatus, setPStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [pImages, setPImages] = useState<string[]>([]);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [pVideoUrl, setPVideoUrl] = useState<string>('');

  const refreshList = () => {
    setProducts(db.getProducts());
  };

  const openForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPCode(prod.productCode);
      setPName(prod.name);
      setPPrice(String(prod.price));
      setPOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
      setPStock(String(prod.stock));
      setPCategory(prod.category);
      setPBadge(prod.badge || '');
      setPDescription(prod.description);
      setPStatus(prod.status);
      setPImages(prod.images.length ? prod.images : [satinImage]);
      setMainImgIdx(prod.mainImageIndex || 0);
      setPVideoUrl(prod.videoUrl || '');
    } else {
      setEditingProduct(null);
      setPCode(`AUR-${Math.floor(100 + Math.random() * 899)}`);
      setPName('');
      setPPrice('');
      setPOldPrice('');
      setPStock('15');
      setPCategory('گردنبند');
      setPBadge('جدید');
      setPDescription('توضیحات کامل محصول زیورآلات و اکسسوری آورا استایل.');
      setPStatus('active');
      setPImages([necklaceImage]);
      setMainImgIdx(0);
      setPVideoUrl('');
    }
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pCode) return;

    db.saveProduct(
      {
        id: editingProduct ? editingProduct.id : undefined,
        productCode: pCode,
        name: pName,
        category: pCategory,
        price: Number(pPrice),
        oldPrice: pOldPrice ? Number(pOldPrice) : undefined,
        stock: Number(pStock),
        images: pImages,
        mainImageIndex: mainImgIdx,
        videoUrl: pVideoUrl || undefined,
        badge: pBadge || undefined,
        description: pDescription,
        status: pStatus
      },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );

    refreshList();
    setModalOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`آیا از حذف دائم محصول "${name}" اطمینان دارید؟`)) {
      db.deleteProduct(id, { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` });
      refreshList();
    }
  };

  const handleRemoveImage = (index: number) => {
    if (pImages.length <= 1) return;
    const updated = pImages.filter((_, i) => i !== index);
    setPImages(updated);
    if (mainImgIdx >= updated.length) setMainImgIdx(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setPImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setPVideoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const allCategories = [
    'ساعت',
    'تل',
    'کش',
    'اسکرانچی',
    'کلیپس',
    'گیره پینترستی',
    'گیره بچگانه',
    'کانزاشی',
    'تل توری و مجلسی',
    'زیور آلات مرواریدی',
    'دست بافت میوکی',
    'بدلیجات طرح جواهر',
    'گردنبند',
    'دستبند',
    'گوشواره',
    'انگشتر',
    'نیم ست'
  ];

  const allBadges = ['تخفیف ویژه', 'جدیدترین‌ها', 'پرفروش‌ترین‌ها', 'ساعت'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'همه' || p.category === selectedCat;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, selectedCat, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت کاتالوگ محصولات (Product Management)</h2>
          <p className="text-xs text-[#8b627e]">ثبت کد یکتا، انتخاب گالری تصاویر، آپلود ویدیو، دسته‌بندی و همگام‌سازی سایت</p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
        >
          <Plus size={16} /> افزودن محصول جدید
        </button>
      </div>

      {/* Search & Custom Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-[#37192c]/10 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#fffaf0] border border-[#37192c]/10 px-3.5 py-2.5 w-full">
            <Search size={18} className="text-[#37192C]/50 shrink-0" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام محصول یا Product Code (مثال: AUR-101)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#37192C] outline-none"
            />
          </div>

          {/* Custom Category Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setCatFilterOpen(!catFilterOpen)}
              className="flex items-center justify-between gap-2 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] w-full sm:w-48"
            >
              <span className="truncate">{selectedCat === 'همه' ? 'همه دسته‌بندی‌ها' : selectedCat}</span>
              <ChevronDown size={16} />
            </button>
            {catFilterOpen && (
              <div className="absolute z-30 mt-1 w-full sm:w-56 rounded-2xl border bg-white p-1.5 shadow-xl max-h-60 overflow-y-auto space-y-1">
                <button
                  onClick={() => {
                    setSelectedCat('همه');
                    setCatFilterOpen(false);
                  }}
                  className="w-full text-right rounded-xl px-3 py-2 text-xs font-bold text-[#37192C] hover:bg-[#fffaf0]"
                >
                  همه دسته‌بندی‌ها
                </button>
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCat(c);
                      setCatFilterOpen(false);
                    }}
                    className={
                      'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                      (selectedCat === c ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Status Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              className="flex items-center justify-between gap-2 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] w-full sm:w-40"
            >
              <span>
                {statusFilter === 'all'
                  ? 'همه وضعیت‌ها'
                  : statusFilter === 'active'
                  ? 'فعال'
                  : statusFilter === 'draft'
                  ? 'پیش‌نویس'
                  : 'بایگانی'}
              </span>
              <ChevronDown size={16} />
            </button>
            {statusFilterOpen && (
              <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl space-y-1">
                {[
                  { key: 'all', label: 'همه وضعیت‌ها' },
                  { key: 'active', label: 'فعال' },
                  { key: 'draft', label: 'پیش‌نویس' },
                  { key: 'archived', label: 'بایگانی' }
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setStatusFilter(s.key as any);
                      setStatusFilterOpen(false);
                    }}
                    className={
                      'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                      (statusFilter === s.key ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#fffaf0] border-b border-[#37192c]/10 text-[#37192C] font-black">
              <tr>
                <th className="p-4">تصویر</th>
                <th className="p-4">کد محصول</th>
                <th className="p-4">نام محصول</th>
                <th className="p-4">دسته‌بندی</th>
                <th className="p-4">قیمت اصلی</th>
                <th className="p-4">قیمت تخفیف</th>
                <th className="p-4">موجودی</th>
                <th className="p-4">ویدیو</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#37192c]/5">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#fffaf0]/60 transition">
                  <td className="p-4">
                    <img src={p.images[p.mainImageIndex || 0] || p.images[0]} alt={p.name} className="size-12 rounded-xl object-cover border" />
                  </td>
                  <td className="p-4 font-mono font-bold text-[#37192C]">{p.productCode}</td>
                  <td className="p-4 font-bold text-[#37192C]">
                    {p.name}
                    {p.badge && (
                      <span className="ms-2 rounded-full bg-[#FFF3C5] px-2 py-0.5 text-[10px] font-bold text-[#37192C]">
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-[#8b627e]">{p.category}</td>
                  <td className="p-4 font-black text-[#37192C]">{p.price.toLocaleString('fa-IR')} تومان</td>
                  <td className="p-4">{p.oldPrice ? `${p.oldPrice.toLocaleString('fa-IR')} تومان` : '-'}</td>
                  <td className="p-4 font-bold text-[#37192C]">{p.stock} عدد</td>
                  <td className="p-4">{p.videoUrl ? <span className="text-purple-700 font-bold">دارد 🎥</span> : '-'}</td>
                  <td className="p-4">
                    <span className={'rounded-full px-3 py-1 font-bold text-[10px] ' + (p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700')}>
                      {p.status === 'active' ? 'فعال' : p.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openForm(p)}
                        className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a]"
                        title="ویرایش محصول"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                        title="حذف محصول"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit/Add Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">
              {editingProduct ? `ویرایش کامل محصول ${editingProduct.productCode}` : 'ثبت محصول جدید در کاتالوگ'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">کد یکتای محصول (Product Code)</label>
                  <input
                    type="text"
                    required
                    value={pCode}
                    onChange={(e) => setPCode(e.target.value)}
                    className="mt-1 w-full font-mono font-bold rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                    placeholder="AUR-101"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">نام محصول</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                    placeholder="گردنبند مروارید مدل آورا"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">قیمت فروش (تومان)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">قیمت اصلی/قبل تخفیف</label>
                  <input
                    type="number"
                    value={pOldPrice}
                    onChange={(e) => setPOldPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">موجودی انبار</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Custom Category and Badge Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="font-bold text-[#37192C] block mb-1">دسته‌بندی اصلی (Category)</label>
                  <button
                    type="button"
                    onClick={() => setFormCatOpen(!formCatOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold text-[#37192C]"
                  >
                    <span>{pCategory}</span>
                    <ChevronDown size={16} />
                  </button>
                  {formCatOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl max-h-56 overflow-y-auto space-y-1">
                      {allCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setPCategory(c);
                            setFormCatOpen(false);
                          }}
                          className={
                            'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                            (pCategory === c ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                          }
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="font-bold text-[#37192C] block mb-1">برچسب / لیبل (Badge)</label>
                  <button
                    type="button"
                    onClick={() => setFormBadgeOpen(!formBadgeOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 font-bold text-[#37192C]"
                  >
                    <span>{pBadge || 'بدون برچسب'}</span>
                    <ChevronDown size={16} />
                  </button>
                  {formBadgeOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-2xl border bg-white p-1.5 shadow-xl space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPBadge('');
                          setFormBadgeOpen(false);
                        }}
                        className="w-full text-right rounded-xl px-3 py-2 text-xs font-bold text-[#37192C] hover:bg-[#fffaf0]"
                      >
                        بدون برچسب
                      </button>
                      {allBadges.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setPBadge(b);
                            setFormBadgeOpen(false);
                          }}
                          className={
                            'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                            (pBadge === b ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                          }
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images Management */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#37192C]">تصاویر محصول (انتخاب چندتایی)</span>
                  <label className="rounded-full bg-[#37192C] px-3 py-1.5 text-[11px] font-bold text-[#FFF3C5] cursor-pointer hover:bg-[#5a2548] transition">
                    + افزودن تصویر از فایل/گالری
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {pImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl border border-[#37192c]/20 bg-white p-2 space-y-2">
                      <img src={imgUrl} alt={`تصویر ${idx + 1}`} className="h-28 w-full rounded-lg object-cover" />

                      <div className="flex items-center justify-between text-[10px]">
                        <button
                          type="button"
                          onClick={() => setMainImgIdx(idx)}
                          className={'rounded px-2 py-0.5 font-bold ' + (mainImgIdx === idx ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700')}
                        >
                          {mainImgIdx === idx ? 'اصلی' : 'انتخاب اصلی'}
                        </button>
                        {pImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="grid size-6 place-items-center rounded bg-rose-100 text-rose-600"
                            title="حذف تصویر"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Upload Field */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#37192C]">ویدیو معرفی محصول (آپلود ویدیو)</span>
                  <label className="rounded-full bg-[#37192C] px-3 py-1.5 text-[11px] font-bold text-[#FFF3C5] cursor-pointer hover:bg-[#5a2548] transition">
                    + انتخاب ویدیو از فایل
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                </div>
                {pVideoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border">
                    <video src={pVideoUrl} controls className="max-h-48 w-full bg-black" />
                    <button
                      type="button"
                      onClick={() => setPVideoUrl('')}
                      className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8b627e] font-semibold">هنوز ویدیویی برای این محصول ثبت نشده است.</p>
                )}
              </div>

              <div>
                <label className="font-bold text-[#37192C]">توضیحات کامل محصول</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#37192C] py-3.5 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition"
              >
                ذخیره محصول و بروزرسانی دیتابیس
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
