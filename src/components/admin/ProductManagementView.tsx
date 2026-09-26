import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Crop,
  Image as ImageIcon,
  Check,
  X,
  Filter,
  Eye,
  ArrowUpDown,
  Tag,
  Star,
  Sparkles
} from 'lucide-react';
import { categoryList, satinImage, jewelryImage, necklaceImage, watchImage } from '../../data';
import { Product, db, CropData, AdminUser } from '../../services/db';
import { ImageCropper } from '../ImageCropper';

type ProductManagementViewProps = {
  currentAdmin: AdminUser;
};

export function ProductManagementView({ currentAdmin }: ProductManagementViewProps) {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('همه');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

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

  // Crop Editor Modal
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropTargetIndex, setCropTargetIndex] = useState<number>(0);
  const [activeCropData, setActiveCropData] = useState<CropData | undefined>();

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
      setActiveCropData(prod.cropData);
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
      setActiveCropData(undefined);
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
        badge: pBadge || undefined,
        description: pDescription,
        status: pStatus,
        cropData: activeCropData
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

  // Gallery image handling
  const handleAddSampleImage = () => {
    setPImages([...pImages, jewelryImage]);
  };

  const handleRemoveImage = (index: number) => {
    if (pImages.length <= 1) return;
    const updated = pImages.filter((_, i) => i !== index);
    setPImages(updated);
    if (mainImgIdx >= updated.length) setMainImgIdx(0);
  };

  const handleStartCrop = (index: number) => {
    setCropTargetIndex(index);
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedUrl: string, cropData: CropData) => {
    const updated = [...pImages];
    updated[cropTargetIndex] = croppedUrl;
    setPImages(updated);
    setActiveCropData(cropData);
    setCropperOpen(false);
  };

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase());
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
          <p className="text-xs text-[#8b627e]">ثبت کد یکتا، کراپ تصاویر، دسته‌بندی و همگام‌سازی لحظه‌ای با سایت</p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
        >
          <Plus size={16} /> افزودن محصول جدید
        </button>
      </div>

      {/* Search & Filter Bar */}
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

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] outline-none w-full sm:w-auto"
          >
            <option value="همه">همه دسته‌بندی‌ها</option>
            {categoryList.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
            <option value="ساعت">ساعت</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#37192C] outline-none w-full sm:w-auto"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">بایگانی</option>
          </select>
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

      {/* Product Edit/Add Modal */}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#37192C]">دسته‌بندی اصلی</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                  >
                    {categoryList.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="ساعت">ساعت</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#37192C]">برچسب (Badge)</label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2.5 outline-none"
                    placeholder="جدید / تخفیف ویژه / پرفروش"
                  />
                </div>
              </div>

              {/* Gallery Images Management */}
              <div className="rounded-2xl border border-[#37192c]/10 bg-[#fffaf0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#37192C]">گالری تصاویر محصول (چندتصویری + برش و تصویر اصلی)</span>
                  <button
                    type="button"
                    onClick={handleAddSampleImage}
                    className="rounded-full bg-[#37192C] px-3 py-1 text-[11px] font-bold text-[#FFF3C5]"
                  >
                    + افزودن تصویر نمونه
                  </button>
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
                          {mainImgIdx === idx ? 'اصلی' : 'انتخاب به عنوان اصلی'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartCrop(idx)}
                          className="grid size-6 place-items-center rounded bg-[#FFF3C5] text-[#37192C]"
                          title="کراپ تصویر"
                        >
                          <Crop size={12} />
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

              <div>
                <label className="font-bold text-[#37192C]">توضیحات کامل محصول</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white px-3 py-2 outline-none"
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

      {/* Cropper Modal */}
      {cropperOpen && (
        <ImageCropper
          imageUrl={pImages[cropTargetIndex]}
          initialCropData={activeCropData}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperOpen(false)}
        />
      )}
    </div>
  );
}
