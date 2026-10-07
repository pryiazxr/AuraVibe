import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { db, Order } from '../services/db';

export type DateRangeKey = '1day' | '7days' | '30days' | '365days' | 'custom';

type AnalyticsChartsProps = {
  dateRange: DateRangeKey;
  setDateRange: (range: DateRangeKey) => void;
  customDays: number;
  setCustomDays: (days: number) => void;
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
};

export function AnalyticsCharts({
  dateRange,
  setDateRange,
  customDays,
  setCustomDays,
  compareMode,
  setCompareMode
}: AnalyticsChartsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validOrders, setValidOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const vo = await db.getValidOrders();
        if (active) setValidOrders(vo);
      } catch (err) {
        console.error('Failed to load orders in charts:', err);
      }
    };
    load();
    const unsub = db.subscribe(() => {
      load();
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const now = new Date();

  // Determine number of days in selected period
  let periodDays = 30;
  if (dateRange === '1day') periodDays = 1;
  else if (dateRange === '7days') periodDays = 7;
  else if (dateRange === '30days') periodDays = 30;
  else if (dateRange === '365days') periodDays = 365;
  else if (dateRange === 'custom') periodDays = Math.max(1, customDays || 30);

  const currentStartTime = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousStartTime = new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000);

  // Filter current period orders
  const currentOrders = validOrders.filter((o) => {
    const oDate = new Date(o.createdAt);
    return oDate >= currentStartTime && oDate <= now;
  });

  // Filter previous period orders
  const previousOrders = validOrders.filter((o) => {
    const oDate = new Date(o.createdAt);
    return oDate >= previousStartTime && oDate < currentStartTime;
  });

  const currentTotalRevenue = currentOrders.reduce((s, o) => s + o.totalAmount, 0);
  const previousTotalRevenue = previousOrders.reduce((s, o) => s + o.totalAmount, 0);

  let pctChange = 0;
  let pctLabel = '';
  if (previousTotalRevenue === 0) {
    pctLabel = 'داده‌ای برای مقایسه وجود ندارد (دوره قبل = ۰)';
  } else {
    pctChange = Math.round(((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100);
    pctLabel = `${pctChange >= 0 ? '+' : ''}${pctChange.toLocaleString('fa-IR')}٪ ${pctChange >= 0 ? 'رشد' : 'کاهش'}`;
  }

  // Generate bins for chart visualization
  let binCount = 7;
  if (periodDays === 1) binCount = 12; // 2-hour slots
  else if (periodDays <= 7) binCount = periodDays;
  else if (periodDays <= 30) binCount = 10;
  else binCount = 12; // 12 monthly slots

  const binsCurrent = new Array(binCount).fill(0);
  const binsPrevious = new Array(binCount).fill(0);
  const binLabels: string[] = [];

  const currMs = now.getTime() - currentStartTime.getTime();
  const prevMs = currentStartTime.getTime() - previousStartTime.getTime();

  for (let i = 0; i < binCount; i++) {
    if (periodDays === 1) {
      binLabels.push(`${i * 2}:00`);
    } else if (periodDays <= 30) {
      const d = new Date(currentStartTime.getTime() + (i / binCount) * currMs);
      binLabels.push(d.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' }));
    } else {
      const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
      binLabels.push(monthNames[i % 12]);
    }
  }

  currentOrders.forEach((o) => {
    const oTime = new Date(o.createdAt).getTime();
    const ratio = (oTime - currentStartTime.getTime()) / currMs;
    const binIdx = Math.min(binCount - 1, Math.max(0, Math.floor(ratio * binCount)));
    binsCurrent[binIdx] += o.totalAmount;
  });

  previousOrders.forEach((o) => {
    const oTime = new Date(o.createdAt).getTime();
    const ratio = (oTime - previousStartTime.getTime()) / prevMs;
    const binIdx = Math.min(binCount - 1, Math.max(0, Math.floor(ratio * binCount)));
    binsPrevious[binIdx] += o.totalAmount;
  });

  const maxVal = Math.max(...binsCurrent, ...binsPrevious, 100000);

  const rangeOptions: { key: DateRangeKey; label: string }[] = [
    { key: '1day', label: 'روزانه (۱ روز گذشته)' },
    { key: '7days', label: 'هفتگی (۷ روز گذشته)' },
    { key: '30days', label: 'ماهانه (۳۰ روز گذشته)' },
    { key: '365days', label: 'سالانه (۳۶۵ روز گذشته)' },
    { key: 'custom', label: 'بازه سفارشی' }
  ];

  return (
    <div className="space-y-6">
      {/* Date Range & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#37192c]/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar size={18} className="text-[#37192C]" />
          <span className="text-xs font-bold text-[#37192C]">انتخاب بازه زمانی:</span>

          {/* Custom Aura Styled Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5] transition"
            >
              <span>{rangeOptions.find((r) => r.key === dateRange)?.label}</span>
              <span className="text-[10px]">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full start-0 mt-1 z-30 w-56 rounded-2xl border border-[#37192c]/10 bg-white p-1.5 shadow-xl space-y-1">
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setDateRange(opt.key);
                      setDropdownOpen(false);
                    }}
                    className={
                      'w-full text-right rounded-xl px-3 py-2 text-xs font-bold transition ' +
                      (dateRange === opt.key ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C] hover:bg-[#fffaf0]')
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Days Input if custom range selected */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-[#fffaf0] border border-[#37192c]/20 rounded-xl px-3 py-1 text-xs font-bold">
              <span>تعداد روز:</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value) || 1)}
                className="w-14 bg-white border border-[#37192c]/20 rounded-lg p-1 text-center font-bold text-[#37192C] outline-none"
              />
            </div>
          )}

          {/* Compare Mode Toggle */}
          <label className="ms-3 flex items-center gap-2 text-xs font-bold text-[#37192C] cursor-pointer">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="accent-[#37192C] size-4 rounded cursor-pointer"
            />
            <span>مقایسه با دوره قبل</span>
          </label>
        </div>
      </div>

      {/* Dynamic Bar Chart */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#8b627e]">روند واقعی درآمد فروش (Real Revenue Timeline)</span>
            <h3 className="text-xl font-black text-[#37192C] mt-0.5">
              {currentTotalRevenue.toLocaleString('fa-IR')} تومان ({periodDays} روز اخیر)
            </h3>
          </div>

          {compareMode && (
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                previousTotalRevenue === 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : pctChange >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {previousTotalRevenue > 0 && (pctChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
              <span>{pctLabel}</span>
            </div>
          )}
        </div>

        {/* SVG Dynamic Bar Visualization */}
        <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-6 border-b border-[#37192c]/10 pb-2">
          {binLabels.map((label, index) => {
            const currVal = binsCurrent[index] || 0;
            const prevVal = binsPrevious[index] || 0;
            const currentPct = (currVal / maxVal) * 100;
            const prevPct = (prevVal / maxVal) * 100;

            return (
              <div key={index} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-20 bg-[#37192C] text-[#FFF3C5] p-2 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-xl">
                  <div>دوره فعلی: {currVal.toLocaleString('fa-IR')} تومان</div>
                  {compareMode && <div>دوره قبل: {prevVal.toLocaleString('fa-IR')} تومان</div>}
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* Current Period Bar */}
                  <div
                    className="w-full max-w-[16px] rounded-t-lg bg-[#37192C] group-hover:bg-[#5a2548] transition-all duration-300"
                    style={{ height: `${Math.max(4, currentPct)}%` }}
                  />

                  {/* Previous Period Bar */}
                  {compareMode && (
                    <div
                      className="w-full max-w-[16px] rounded-t-lg bg-[#FFF3C5] border border-[#37192c]/30 transition-all duration-300"
                      style={{ height: `${Math.max(4, prevPct)}%` }}
                    />
                  )}
                </div>

                {/* X Axis Label */}
                <span className="mt-2 text-[10px] font-bold text-[#37192C]/70 truncate max-w-full">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#37192C]" />
            <span className="text-[#37192C]">دوره فعلی ({periodDays} روز اخیر)</span>
          </div>
          {compareMode && (
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#FFF3C5] border border-[#37192c]/30" />
              <span className="text-[#37192C]">دوره قبل ({periodDays} روز قبل از آن)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
