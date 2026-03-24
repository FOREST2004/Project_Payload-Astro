import s from "./ProductCard.module.css";

export type Product = {
  id: string | number;
  name: string;
  description?: string;
  defaultPrice: number;
};

type Props = {
  product: Product;
  primaryColor: string;
  selected?: boolean;
  onToggle?: (product: Product) => void;
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function ProductCard({ product, primaryColor, selected = false, onToggle }: Props) {
  const cssVars = { "--primary": primaryColor } as React.CSSProperties;

  return (
    <article
      className={`${s.card} ${selected ? s.selected : ""}`}
      style={cssVars}
      onClick={() => onToggle?.(product)}
    >
      <div className={s.checkRow}>
        <div className={`${s.checkbox} ${selected ? s.checked : ""}`}>
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className={s.name}>{product.name}</div>
      </div>
      {product.description && (
        <div className={s.desc} dangerouslySetInnerHTML={{ __html: product.description }} />
      )}
      <div className={s.footer}>
        <span className={s.price}>{formatPrice(product.defaultPrice)}</span>
      </div>
    </article>
  );
}
