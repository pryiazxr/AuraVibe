import React, { useState } from 'react';
import { Plus, Edit, Trash2, Power, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import { Article, db, AdminUser } from '../../services/db';
import { satinImage } from '../../data';

type MagazineManagementViewProps = {
  currentAdmin: AdminUser;
};

export function MagazineManagementView({ currentAdmin }: MagazineManagementViewProps) {
  const [articles, setArticles] = useState<Article[]>(() => db.getArticles());

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Fields
  const [aTitle, setATitle] = useState('');
  const [aSubtitle, setASubtitle] = useState('');
  const [aBody, setABody] = useState('');
  const [aBanner, setABanner] = useState(satinImage);
  const [aActive, setAActive] = useState(true);

  const refreshList = () => {
    setArticles(db.getArticles());
  };

  const openForm = (art: Article | null = null) => {
    if (art) {
      setEditingArticle(art);
      setATitle(art.title);
      setASubtitle(art.subtitle || '');
      setABody(art.content);
      setABanner(art.image);
      setAActive(art.status === 'published');
    } else {
      setEditingArticle(null);
      setATitle('');
      setASubtitle('');
      setABody('');
      setABanner(satinImage);
      setAActive(true);
    }
    setModalOpen(true);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setABanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const imgTag = `\n![تصویر](${reader.result})\n`;
          setABody((prev) => prev + imgTag);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle) return;

    db.saveArticle(
      {
        id: editingArticle ? editingArticle.id : undefined,
        title: aTitle,
        subtitle: aSubtitle,
        content: aBody,
        digest: aSubtitle || aBody.slice(0, 80),
        image: aBanner,
        status: aActive ? 'published' : 'draft',
        author: `${currentAdmin.firstName} ${currentAdmin.lastName}`
      },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );

    refreshList();
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
      const updated = articles.filter((a) => a.id !== id);
      localStorage.setItem('aura_articles', JSON.stringify(updated));
      refreshList();
    }
  };

  const handleToggleStatus = (art: Article) => {
    db.saveArticle(
      { id: art.id, status: art.status === 'published' ? 'draft' : 'published' },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    refreshList();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت مجله آورا (Magazine CMS)</h2>
          <p className="text-xs text-[#8b627e]">ایجاد و ویرایش مقالات، آپلود بنر، ثبت خودکار تاریخ شمسی و ادیتور متن</p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 rounded-full bg-[#37192C] px-5 py-2.5 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
        >
          <Plus size={16} /> افزودن مقاله جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => {
          const pDate = new Date(art.publishedAt || art.createdAt).toLocaleDateString('fa-IR');
          return (
            <div key={art.id} className="rounded-2xl border border-[#37192c]/10 bg-white p-5 space-y-3 shadow-sm">
              <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[#37192C]">
                <img src={art.image} alt={art.title} className="size-full object-cover opacity-80" />
                <span className="absolute top-3 right-3 rounded-full bg-[#37192C]/80 px-3 py-1 text-[10px] font-bold text-[#FFF3C5]">
                  {pDate}
                </span>
              </div>
              <h3 className="font-black text-base text-[#37192C]">{art.title}</h3>
              <p className="text-xs text-[#37192C]/75 truncate">{art.subtitle || art.digest}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#37192c]/10 text-xs">
                <button
                  onClick={() => handleToggleStatus(art)}
                  className={
                    'flex items-center gap-1.5 rounded-full px-3 py-1 font-bold transition ' +
                    (art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                  }
                >
                  <Power size={14} />
                  <span>{art.status === 'published' ? 'فعال' : 'غیرفعال'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openForm(art)}
                    className="grid size-8 place-items-center rounded-lg bg-[#FFF3C5] text-[#37192C]"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/70 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-[#37192C] border-b pb-3">
              {editingArticle ? 'ویرایش مقاله مجله' : 'افزودن مقاله جدید به مجله آورا'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#37192C]">عنوان اصلی (Title)</label>
                <input
                  type="text"
                  required
                  value={aTitle}
                  onChange={(e) => setATitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#37192C]">زیرعنوان (Subtitle)</label>
                <input
                  type="text"
                  value={aSubtitle}
                  onChange={(e) => setASubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 font-bold outline-none"
                />
              </div>

              <div className="rounded-2xl border bg-[#fffaf0] p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#37192C]">تصویر بنر مقاله (از گالری)</span>
                  <label className="rounded-full bg-[#37192C] px-3.5 py-1.5 text-[11px] font-bold text-[#FFF3C5] cursor-pointer">
                    + انتخاب بنر
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                </div>
                <img src={aBanner} alt="بنر" className="h-32 w-full object-cover rounded-xl border" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#37192C]">متن کامل مقاله (Note Editor)</label>
                  <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-[#8b627e] hover:text-[#37192C]">
                    <Paperclip size={14} /> + افزودن تصویر داخل متن
                    <input type="file" accept="image/*" className="hidden" onChange={handleInlineImageUpload} />
                  </label>
                </div>
                <textarea
                  rows={8}
                  required
                  value={aBody}
                  onChange={(e) => setABody(e.target.value)}
                  className="w-full rounded-xl border p-3 font-semibold outline-none leading-7"
                  placeholder="متن مقاله را اینجا تایپ کنید..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeArt"
                  checked={aActive}
                  onChange={(e) => setAActive(e.target.checked)}
                  className="accent-[#37192C] size-4"
                />
                <label htmlFor="activeArt" className="font-bold text-[#37192C] cursor-pointer">
                  مقاله فعال و منتشر شده باشد
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#37192C] py-3.5 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition"
              >
                ذخیره مقاله
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
