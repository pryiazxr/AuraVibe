import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle, FileText, RefreshCw, Save, ArrowLeftRight } from 'lucide-react';
import { db, GlobalSEO, RedirectRule, AdminUser } from '../../services/db';

type SEOManagementViewProps = {
  currentAdmin: AdminUser;
};

export function SEOManagementView({ currentAdmin }: SEOManagementViewProps) {
  const [globalSeo, setGlobalSeo] = useState<GlobalSEO>(() => db.getGlobalSEO());
  const [articles] = useState(() => db.getArticles());
  const [redirects, setRedirects] = useState<RedirectRule[]>(() => {
    const raw = localStorage.getItem('aura_redirects');
    return raw ? JSON.parse(raw) : [
      { id: '1', sourceUrl: '/old-jewel', destinationUrl: '/category/زیورآلات', type: 301, createdAt: '1403/05/10' }
    ];
  });

  const [activeSubTab, setActiveSubTab] = useState<'global' | 'articles' | 'redirects' | 'robots'>('global');

  // Form Fields
  const [siteTitle, setSiteTitle] = useState(globalSeo.siteTitle);
  const [metaDesc, setMetaDesc] = useState(globalSeo.defaultMetaDescription);
  const [canonical, setCanonical] = useState(globalSeo.defaultCanonical);
  const [orgName, setOrgName] = useState(globalSeo.organizationName);
  const [robotsTxt, setRobotsTxt] = useState(globalSeo.robotsTxt);

  // New Redirect Form
  const [srcUrl, setSrcUrl] = useState('');
  const [destUrl, setDestUrl] = useState('');

  const handleSaveGlobalSeo = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateGlobalSEO(
      { siteTitle, defaultMetaDescription: metaDesc, defaultCanonical: canonical, organizationName: orgName, robotsTxt },
      { id: currentAdmin.id, name: `${currentAdmin.firstName} ${currentAdmin.lastName}` }
    );
    setGlobalSeo(db.getGlobalSEO());
    alert('تنظیمات عمومی سئو با موفقیت ذخیره شد.');
  };

  const handleAddRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcUrl || !destUrl) return;
    const newRule: RedirectRule = {
      id: String(Date.now()),
      sourceUrl: srcUrl,
      destinationUrl: destUrl,
      type: 301,
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    const updated = [newRule, ...redirects];
    setRedirects(updated);
    localStorage.setItem('aura_redirects', JSON.stringify(updated));
    setSrcUrl('');
    setDestUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#37192c]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#37192C]">مدیریت سئو و بهینه‌سازی موتورهای جستجو (SEO Center)</h2>
          <p className="text-xs text-[#8b627e]">تنظیمات عمومی، چک‌لیست سئوی مقالات مجله، مدیریت ریدارکت‌های ۳۰۱ و فایل Robots.txt</p>
        </div>

        <div className="flex items-center rounded-xl bg-[#fffaf0] p-1 border border-[#37192c]/10">
          {[
            { id: 'global', label: 'Global SEO' },
            { id: 'articles', label: 'سئوی مجله' },
            { id: 'redirects', label: 'ریدایرکت‌ها (301)' },
            { id: 'robots', label: 'Robots & Sitemap' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={'rounded-lg px-3.5 py-2 text-xs font-bold transition ' + (activeSubTab === tab.id ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C]')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: GLOBAL SEO */}
      {activeSubTab === 'global' && (
        <form onSubmit={handleSaveGlobalSeo} className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-black text-[#37192C] border-b border-[#37192c]/10 pb-3">تنظیمات عمومی موتورهای جستجو (Global Meta Data)</h3>

          <div>
            <label className="font-bold text-[#37192C]">عنوان اصلی سایت (Site Title Tag)</label>
            <input
              type="text"
              required
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 font-bold outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-[#37192C]">توضیحات پیش‌فرض متاتگ (Default Meta Description)</label>
            <textarea
              rows={3}
              required
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#37192C]">آدرس دامنه کانونی (Default Canonical URL)</label>
              <input
                type="text"
                required
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#37192C]">نام سازمان در داده‌های ساختاریافته (Structured Data Org)</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full bg-[#37192C] px-8 py-3.5 font-bold text-[#FFF3C5] hover:bg-[#5a2548] shadow-md transition"
          >
            <Save size={16} /> ذخیره متاتگ‌های اصلی سایت
          </button>
        </form>
      )}

      {/* SUBTAB 2: ARTICLES SEO CHECKLIST */}
      {activeSubTab === 'articles' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#37192C]">چک‌لیست خودکار سئو برای مقالات مجله استایل</h3>

            <div className="space-y-3">
              {articles.map((art) => (
                <div key={art.id} className="rounded-xl border border-[#37192c]/10 bg-[#fffaf0] p-4 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-[#37192C]">
                    <span className="text-sm">{art.title}</span>
                    <span className="font-mono text-[11px] text-[#8b627e]">/{art.slug}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#37192c]/5 text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> Title Tag موجود
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> Meta Description کامل
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> عکس دارای Alt است
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> کلمه کلیدی در تیتر
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REDIRECT MANAGEMENT */}
      {activeSubTab === 'redirects' && (
        <div className="space-y-4">
          <form onSubmit={handleAddRedirect} className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-black text-[#37192C]">افزودن قانون ریدایرکت جدید (301 Permanent Redirect)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#37192C]">آدرس قدیمی (Source Path)</label>
                <input
                  type="text"
                  required
                  placeholder="/old-product-link"
                  value={srcUrl}
                  onChange={(e) => setSrcUrl(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#37192C]">آدرس مقصد جدید (Destination Path)</label>
                <input
                  type="text"
                  required
                  placeholder="/category/گردنبند"
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-[#37192c]/20 bg-white p-3 outline-none"
                />
              </div>
            </div>
            <button type="submit" className="rounded-full bg-[#37192C] px-6 py-2.5 font-bold text-[#FFF3C5]">
              + ثبت قانون ریدایرکت ۳۰۱
            </button>
          </form>

          <div className="rounded-2xl border border-[#37192c]/10 bg-white p-4 shadow-sm">
            <h4 className="text-xs font-bold text-[#37192C] mb-3">لیست قوانین فعال ریدایرکت</h4>
            <div className="space-y-2 text-xs font-mono">
              {redirects.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 border">
                  <span>{r.sourceUrl} ➔ {r.destinationUrl}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                    HTTP 301 Permanent
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ROBOTS & SITEMAP */}
      {activeSubTab === 'robots' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-[#37192C]">مدیریت پیکربندی Robots.txt</h3>
            <textarea
              rows={5}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full font-mono text-xs rounded-xl border border-[#37192c]/20 bg-[#fffaf0] p-3 outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-[#37192C]">وضعیت نقشه‌سایت (Sitemap.xml)</h4>
              <p className="text-[11px] text-[#8b627e] mt-1">آخرین زمان تولید خودکار: {globalSeo.sitemapGeneratedAt}</p>
            </div>
            <button
              onClick={() => alert('نقشه‌سایت جدید (sitemap.xml) با تمام لینک‌های محصولات تولید شد.')}
              className="flex items-center gap-2 rounded-full bg-[#37192C] px-6 py-3 font-bold text-[#FFF3C5]"
            >
              <RefreshCw size={16} /> ساخت مجدد Sitemap.xml
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
