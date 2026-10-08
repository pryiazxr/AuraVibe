import React from 'react';
import { Product } from '../services/db';

export type ProductThumbnailProps = {
  product?: Product | null;
  productId?: number;
  image?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  showBadge?: boolean;
  allProducts?: Product[];
  onOpenProduct?: (product: Product) => void;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
};

export function ProductThumbnail({
  product,
  productId,
  image,
  alt,
  className = "size-12 rounded-xl object-cover border",
  containerClassName = "relative inline-block cursor-pointer group",
  showBadge = false,
  allProducts = [],
  onOpenProduct,
  onClick,
  children
}: ProductThumbnailProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation (Requirement 12)

    if (onClick) {
      onClick(e);
      return;
    }

    // Resolve product object
    let targetProduct = product;
    if (!targetProduct && productId && allProducts.length > 0) {
      targetProduct = allProducts.find((p) => p.id === productId) || null;
    }

    if (targetProduct && onOpenProduct) {
      onOpenProduct(targetProduct);
    } else if (targetProduct) {
      window.dispatchEvent(
        new CustomEvent('auravibe:open-product', { detail: { product: targetProduct } })
      );
    } else if (productId) {
      window.dispatchEvent(
        new CustomEvent('auravibe:open-product-id', { detail: { productId } })
      );
    } else {
      alert('اطلاعات این محصول یافت نشد یا محصول از دیتابیس حذف شده است.');
    }
  };

  const src = image || product?.images?.[0] || '';
  const imageAlt = alt || product?.name || 'تصویر محصول';

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95 ${containerClassName}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      title={product ? `مشاهده جزئیات ${product.name}` : 'مشاهده جزئیات محصول'}
    >
      <img src={src} alt={imageAlt} className={className} />
      {showBadge && product?.badge && (
        <span className="absolute end-2 top-2 rounded-full bg-[#FFF3C5] px-2 py-0.5 text-[10px] font-bold text-[#37192C]">
          {product.badge}
        </span>
      )}
      {children}
    </div>
  );
}
