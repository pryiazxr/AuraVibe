import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type DateRangeOption =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom';

type AnalyticsChartsProps = {
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
};

export function AnalyticsCharts({ dateRange, setDateRange, compareMode, setCompareMode }: AnalyticsChartsProps) {
  const [chartType, setChartType] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Simulated revenue timeline dataset
  const monthlyData = [
    { label: 'فروردین', current: 8500000, previous: 7200000, orders: 42 },
    { label: 'اردیبهشت', current: 10200000, previous: 8900000, orders: 58 },
    { label: 'خرداد', current: 9400000, previous: 9100000, orders: 49 },
    { label: 'تیر', current: 11800000, previous: 9800000, orders: 64 },
    { label: 'مرداد', current: 13500000, previous: 10500000, orders: 78 },
    { label: 'شهریور', current: 12450000, previous: 11100000, orders: 71 },
    { label: 'مهر', current: 14200000, previous: 12000000, orders: 85 },
    { label: 'آبان', current: 15800000, previous: 13200000, orders: 92 },
    { label: 'آذر', current: 16900000, previous: 14100000, orders: 99 },
    { label: 'دی', current: 18200000, previous: 15000000, orders: 110 },
    { label: 'بهمن', current: 19500000, previous: 16200000, orders: 124 },
    { label: 'اسفند', current: 22000000, previous: 18500000, orders: 145 }
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.current));

  return (
    <div className="space-y-6">
      {/* Date Range & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#37192c]/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={18} className="text-[#37192C]" />
          <span className="text-xs font-bold text-[#37192C]">بازه زمانی:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            className="rounded-xl border border-[#37192c]/20 bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#37192C] outline-none"
          >
            <option value="today">امروز</option>
            <option value="yesterday">دیروز</option>
            <option value="last7days">۷ روز اخیر</option>
            <option value="last30days">۳۰ روز اخیر</option>
            <option value="thisMonth">این ماه</option>
            <option value="lastMonth">ماه قبل</option>
            <option value="thisYear">امسال</option>
          </select>

          <label className="ms-3 flex items-center gap-2 text-xs font-bold text-[#37192C] cursor-pointer">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="accent-[#37192C] size-4 rounded"
            />
            <span>مقایسه با دوره قبل</span>
          </label>
        </div>

        {/* Group By Selector */}
        <div className="flex items-center rounded-xl bg-[#fffaf0] p-1 border border-[#37192c]/10">
          {(['day', 'week', 'month', 'year'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={'rounded-lg px-3 py-1 text-[11px] font-bold transition ' + (chartType === type ? 'bg-[#37192C] text-[#FFF3C5]' : 'text-[#37192C]/70 hover:text-[#37192C]')}
            >
              {type === 'day' ? 'روزانه' : type === 'week' ? 'هفتگی' : type === 'month' ? 'ماهانه' : 'سالانه'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Bar Chart */}
      <div className="rounded-2xl border border-[#37192c]/10 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#8b627e]">روند درآمد فروش (Revenue Over Time)</span>
            <h3 className="text-xl font-black text-[#37192C] mt-0.5">۱۲,۴۵۰,۰۰۰ تومان (شهریور)</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ArrowUpRight size={16} /> +۱۲.۱٪ رشد فروش
          </div>
        </div>

        {/* SVG Dynamic Bar Visualization */}
        <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-6 border-b border-[#37192c]/10 pb-2">
          {monthlyData.map((item, index) => {
            const currentPct = (item.current / maxVal) * 100;
            const prevPct = (item.previous / maxVal) * 100;

            return (
              <div key={index} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-10 bg-[#37192C] text-[#FFF3C5] p-2 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-xl">
                  <div>فروش: {item.current.toLocaleString('fa-IR')} تومان</div>
                  <div>سفارشات: {item.orders} عدد</div>
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* Current Period Bar */}
                  <div
                    className="w-full max-w-[18px] rounded-t-lg bg-[#37192C] group-hover:bg-[#5a2548] transition-all duration-300"
                    style={{ height: `${currentPct}%` }}
                  />

                  {/* Previous Period Bar (if Compare Mode enabled) */}
                  {compareMode && (
                    <div
                      className="w-full max-w-[18px] rounded-t-lg bg-[#FFF3C5] border border-[#37192c]/30 transition-all duration-300"
                      style={{ height: `${prevPct}%` }}
                    />
                  )}
                </div>

                {/* X Axis Label */}
                <span className="mt-2 text-[10px] font-bold text-[#37192C]/70 truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#37192C]" />
            <span className="text-[#37192C]">دوره فعلی (شهریور)</span>
          </div>
          {compareMode && (
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#FFF3C5] border border-[#37192c]/30" />
              <span className="text-[#37192C]">دوره گذشته (مرداد)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
