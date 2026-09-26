import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RefreshCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { CropData } from '../services/db';

type ImageCropperProps = {
  imageUrl: string;
  initialCropData?: CropData;
  onCropComplete: (croppedDataUrl: string, cropData: CropData) => void;
  onCancel: () => void;
};

export function ImageCropper({ imageUrl, initialCropData, onCropComplete, onCancel }: ImageCropperProps) {
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | 'custom'>(initialCropData?.aspectRatio || '1:1');
  const [zoom, setZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: initialCropData?.x || 10, y: initialCropData?.y || 10 });
  const [cropSize, setCropSize] = useState({ width: initialCropData?.width || 80, height: initialCropData?.height || 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate crop height based on aspect ratio
  useEffect(() => {
    if (aspectRatio === '1:1') {
      setCropSize((prev) => ({ ...prev, height: prev.width }));
    } else if (aspectRatio === '4:5') {
      setCropSize((prev) => ({ ...prev, height: Math.min(100, Math.round(prev.width * (5 / 4))) }));
    } else if (aspectRatio === '16:9') {
      setCropSize((prev) => ({ ...prev, height: Math.max(10, Math.round(prev.width * (9 / 16))) }));
    }
  }, [aspectRatio, cropSize.width]);

  // Generate real-time live preview canvas
  useEffect(() => {
    generateCroppedPreview();
  }, [imageUrl, cropPos, cropSize, zoom]);

  const generateCroppedPreview = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalWidth = img.naturalWidth || 600;
    const naturalHeight = img.naturalHeight || 600;

    // Convert percentages to actual pixel values
    const cropX = (cropPos.x / 100) * naturalWidth;
    const cropY = (cropPos.y / 100) * naturalHeight;
    const cropW = (cropSize.width / 100) * naturalWidth;
    const cropH = (cropSize.height / 100) * naturalHeight;

    canvas.width = Math.max(100, cropW);
    canvas.height = Math.max(100, cropH);

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setDragStart({ x: e.clientX, y: e.clientY });

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = (deltaX / rect.width) * 100;
      const pctY = (deltaY / rect.height) * 100;

      setCropPos((prev) => ({
        x: Math.max(0, Math.min(100 - cropSize.width, prev.x + pctX)),
        y: Math.max(0, Math.min(100 - cropSize.height, prev.y + pctY))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirm = () => {
    const finalCropData: CropData = {
      x: cropPos.x,
      y: cropPos.y,
      width: cropSize.width,
      height: cropSize.height,
      aspectRatio
    };
    onCropComplete(previewUrl || imageUrl, finalCropData);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#37192C]/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-[2.5rem] border border-[#37192c]/20 bg-[#fffaf0] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#37192c]/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-[#37192C]">ویرایش و برش (Crop) حرفه‌ای تصویر</h3>
            <p className="text-xs text-[#8b627e]">برش تعاملی پیشرفته با پیش‌نمایش لحظه‌ای</p>
          </div>
          <button onClick={onCancel} className="grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C]">
            <X size={18} />
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Interactive Canvas View (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative h-80 w-full overflow-hidden rounded-2xl bg-[#37192C] select-none cursor-move border-2 border-dashed border-[#FFF3C5]/40"
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="برای برش"
                onLoad={generateCroppedPreview}
                className="size-full object-contain pointer-events-none transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />

              {/* Crop Selection Box */}
              <div
                className="absolute border-2 border-[#FFF3C5] bg-[#FFF3C5]/20 shadow-[0_0_0_9999px_rgba(55,25,44,0.65)] pointer-events-none"
                style={{
                  left: `${cropPos.x}%`,
                  top: `${cropPos.y}%`,
                  width: `${cropSize.width}%`,
                  height: `${cropSize.height}%`
                }}
              >
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/30 pointer-events-none">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                </div>
                <div className="absolute -top-2 -left-2 size-3 bg-[#FFF3C5] rounded-full" />
                <div className="absolute -top-2 -right-2 size-3 bg-[#FFF3C5] rounded-full" />
                <div className="absolute -bottom-2 -left-2 size-3 bg-[#FFF3C5] rounded-full" />
                <div className="absolute -bottom-2 -right-2 size-3 bg-[#FFF3C5] rounded-full" />
              </div>
            </div>

            {/* Crop Size & Zoom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 border border-[#37192c]/10 text-xs font-bold text-[#37192C]">
              <div className="flex items-center gap-2">
                <ZoomOut size={16} className="text-[#37192C]/60" />
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-24 accent-[#37192C]"
                />
                <ZoomIn size={16} className="text-[#37192C]/60" />
              </div>

              <div className="flex items-center gap-2">
                <span>اندازه کادر:</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={cropSize.width}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCropSize((prev) => ({ ...prev, width: val }));
                  }}
                  className="w-24 accent-[#37192C]"
                />
              </div>
            </div>
          </div>

          {/* Controls & Realtime Preview (1 col) */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-[#37192C] mb-2">نسبت تصویر (Aspect Ratio):</p>
              <div className="grid grid-cols-2 gap-2">
                {(['1:1', '4:5', '16:9', 'custom'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={'rounded-xl py-2 text-xs font-bold transition border ' + (aspectRatio === ratio ? 'bg-[#37192C] text-[#FFF3C5] border-[#37192C]' : 'bg-white text-[#37192C] border-[#37192c]/10 hover:bg-[#FFF3C5]')}
                  >
                    {ratio === '1:1' ? 'مربع ۱:۱' : ratio === '4:5' ? 'پرتره ۴:۵' : ratio === '16:9' ? 'عریض ۱۶:۹' : 'دستی'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="rounded-2xl border border-[#37192c]/10 bg-white p-3 text-center">
              <p className="text-[11px] font-bold text-[#37192C]/60 mb-2">پیش‌نمایش خروجی کراپ شده:</p>
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#FFF3C5]/30 flex items-center justify-center border">
                {previewUrl ? (
                  <img src={previewUrl} alt="پیش‌نمایش" className="size-full object-contain" />
                ) : (
                  <span className="text-[10px] text-[#37192C]/40">در حال تولید...</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#37192C] py-3 text-xs font-bold text-[#FFF3C5] hover:bg-[#5a2548] transition shadow-md"
              >
                <Check size={16} /> اعمال برش و ذخیره
              </button>
              <button
                onClick={onCancel}
                className="rounded-full bg-[#fffaf0] border border-[#37192c]/20 px-4 py-3 text-xs font-bold text-[#37192C] hover:bg-[#FFF3C5]"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
