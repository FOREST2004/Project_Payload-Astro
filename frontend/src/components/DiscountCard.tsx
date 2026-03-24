import s from "./DiscountCard.module.css";

export type Discount = {
  id: string | number;
  internalName: string;
  active: boolean;
  benefitDiscountMatchingPercent: number;
  [key: string]: unknown;
};

type Props = {
  discount: Discount;
  primaryColor: string;
  selected?: boolean;
  onSelect?: (discount: Discount) => void;
};

export default function DiscountCard({ discount, primaryColor, selected = false, onSelect }: Props) {
  const cssVars = { "--primary": primaryColor } as React.CSSProperties;

  return (
    <article
      className={`${s.card} ${selected ? s.selected : ""}`}
      style={cssVars}
      onClick={() => onSelect?.(discount)}
    >
      <div className={s.checkRow}>
        <div className={`${s.radio} ${selected ? s.checked : ""}`}>
          {selected && <div className={s.radioDot} />}
        </div>
        <div className={s.name}>{discount.internalName}</div>
      </div>
      <div className={s.badge}>
        -{discount.benefitDiscountMatchingPercent}%
      </div>
    </article>
  );
}
