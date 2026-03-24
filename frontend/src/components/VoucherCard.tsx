import s from "./VoucherCard.module.css";
import type { Voucher } from "../lib/payload";

type Props = {
  voucher: Voucher;
  primaryColor: string;
  selected?: boolean;
  onSelect?: (voucher: Voucher) => void;
};

function formatDiscount(voucher: Voucher): string {
  const val = parseFloat(voucher.value);
  if (voucher.priceMode === "percent") return `-${val}%`;
  return `-${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)}`;
}

export default function VoucherCard({
  voucher,
  primaryColor,
  selected = false,
  onSelect,
}: Props) {
  const cssVars = { "--primary": primaryColor } as React.CSSProperties;

  return (
    <article
      className={`${s.card} ${selected ? s.selected : ""}`}
      style={cssVars}
      onClick={() => onSelect?.(voucher)}
    >
      <div className={s.left}>
        <div className={`${s.radio} ${selected ? s.radioChecked : ""}`}>
          {selected && <div className={s.radioDot} />}
        </div>
        <div className={s.info}>
          <span className={s.code}>{voucher.code}</span>
          {voucher.validUntil && (
            <span className={s.expiry}>
              HSD: {new Date(voucher.validUntil).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>
      </div>
      <span className={s.badge}>{formatDiscount(voucher)}</span>
    </article>
  );
}
