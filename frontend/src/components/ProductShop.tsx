import { useState } from "react";
import ProductCard, { formatPrice, type Product } from "./ProductCard";
import DiscountCard, { type Discount } from "./DiscountCard";
import s from "./ProductShop.module.css";

type Props = {
  products: Product[];
  discounts: Discount[];
  primaryColor: string;
};

export default function ProductShop({ products, discounts, primaryColor }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  const activeDiscounts = discounts.filter((d) => d.active);

  function toggleProduct(product: Product) {
    setSelectedProduct((prev) => (prev?.id === product.id ? null : product));
    setSelectedDiscount(null);
  }

  function toggleDiscount(discount: Discount) {
    setSelectedDiscount((prev) => (prev?.id === discount.id ? null : discount));
  }

  const subtotal = selectedProduct?.defaultPrice ?? 0;
  const discountPercent = selectedDiscount?.benefitDiscountMatchingPercent ?? 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  return (
    <div className={s.root} data-primary={primaryColor}>
      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🎟️</div>
          <p>Chưa có sản phẩm nào đang mở bán.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              primaryColor={primaryColor}
              selected={selectedProduct?.id === product.id}
              onToggle={toggleProduct}
            />
          ))}
        </div>
      )}

      {/* Voucher */}
      {activeDiscounts.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Chọn voucher</h2>
          <div className={s.discountGrid}>
            {activeDiscounts.map((d) => (
              <DiscountCard
                key={d.id}
                discount={d}
                primaryColor={primaryColor}
                selected={selectedDiscount?.id === d.id}
                onSelect={toggleDiscount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tổng tiền */}
      {selectedProduct && (
        <div className={s.summary}>
          <h2 className={s.summaryTitle}>Chi tiết đơn hàng</h2>
          <div className={s.summaryRows}>
            <div className={s.summaryRow}>
              <span className={s.summaryLabel}>{selectedProduct.name}</span>
              <span>{formatPrice(selectedProduct.defaultPrice)}</span>
            </div>
            {selectedDiscount && (
              <div className={`${s.summaryRow} ${s.discountRow}`}>
                <span>Voucher ({selectedDiscount.internalName}, -{discountPercent}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className={`${s.summaryRow} ${s.totalRow}`}>
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
