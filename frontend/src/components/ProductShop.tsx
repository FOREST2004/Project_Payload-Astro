import { useState, useEffect } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import ProductCard, { formatPrice, type Product } from "./ProductCard";
import VoucherCard from "./VoucherCard";
import s from "./ProductShop.module.css";
import { postSimulate, makeOrder, type Voucher } from "../lib/payload";

type Props = {
  products: Product[];
  vouchers: Voucher[];
  primaryColor: string;
  merchantSlug: string;
  storeSlug: string;
};

type OrderForm = {
  phone: string;
  email: string;
};

function ProductShopInner({
  products,
  vouchers,
  primaryColor,
  merchantSlug,
  storeSlug,
}: Props) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [step, setStep] = useState<"select" | "checkout">("select");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<OrderForm>({ phone: "", email: "" });

  const [simulatedTotal, setSimulatedTotal] = useState<number | null>(null);
  const [simulatedDiscount, setSimulatedDiscount] = useState<number | null>(
    null,
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ code: string } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  function toggleProduct(product: Product) {
    setSelectedProduct((prev) => (prev?.id === product.id ? null : product));
    setSelectedVoucher(null);
    setSimulatedTotal(null);
    setSimulatedDiscount(null);
  }

  function toggleVoucher(v: Voucher) {
    setSelectedVoucher((prev) => (prev?.id === v.id ? null : v));
  }

  function goBack() {
    setStep("select");
    setSelectedVoucher(null);
    setSimulatedTotal(null);
    setSimulatedDiscount(null);
    setOrderError(null);
  }

  useEffect(() => {
    if (step !== "checkout" || !selectedProduct) {
      setSimulatedTotal(null);
      setSimulatedDiscount(null);
      return;
    }
    setIsSimulating(true);
    const items = [
      {
        item: Number(selectedProduct.id),
        quantity: 1,
        answers: [],
        is_bundle: false,
        isAddOn: false,
        ...(selectedVoucher ? { voucher: selectedVoucher.code } : {}),
      },
    ];
    postSimulate(merchantSlug, storeSlug, items)
      .then((data) => {
        setSimulatedTotal(parseFloat(data?.total ?? "0"));
        const discount = data?.positions?.[0]?.discount;
        setSimulatedDiscount(discount ? parseFloat(discount) : null);
      })
      .catch(() => {
        setSimulatedTotal(null);
        setSimulatedDiscount(null);
      })
      .finally(() => setIsSimulating(false));
  }, [step, selectedProduct, selectedVoucher]);

  async function handleSubmit() {
    if (!selectedProduct || !form.phone || !form.email || !executeRecaptcha)
      return;
    if (!/^\+84[3|5|7|8|9]\d{8}$/.test(form.phone)) {
      setOrderError(
        "Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam.",
      );
      return;
    }
    setIsSubmitting(true);
    setOrderError(null);
    try {
      const token = await executeRecaptcha("make_order");
      const items = [
        {
          item: Number(selectedProduct.id),
          quantity: 1,
          answers: [],
          is_bundle: false,
          isAddOn: false,
          ...(selectedVoucher ? { voucher: selectedVoucher.code } : {}),
        },
      ];

      const result = await makeOrder(
        merchantSlug,
        storeSlug,
        items,
        form.email,
        form.phone,
        token,
      );

      if (result?.code) {
        if (result.payment_url) {
          window.location.href = result.payment_url;
        } else {
          console.log("orderResult:::: ", result);
          window.location.href = "/";
        }
      } else {
        setOrderError("Đặt hàng thất bại. Vui lòng thử lại..");
      }
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : "Đặt hàng thất bại. Vui lòng thử lại...",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const subtotal = selectedProduct?.defaultPrice ?? 0;
  const total = simulatedTotal ?? subtotal;
  const discountAmount = simulatedDiscount ?? subtotal - total;
  const canSubmit =
    !!form.phone && !!form.email && !isSimulating && !isSubmitting;

  const cssVars = { "--primary": primaryColor } as React.CSSProperties;

  // Màn hình 1: chọn sản phẩm
  if (step === "select") {
    return (
      <div className={s.root} style={cssVars}>
        {products.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🎟️</div>
            <p>Chưa có sản phẩm nào đang mở bán.</p>
          </div>
        ) : (
          <>
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
            <div className={s.continueBar}>
              <button
                className={s.continueBtn}
                disabled={!selectedProduct}
                onClick={() => setStep("checkout")}
                type="button"
              >
                Tiếp tục
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Màn hình 2: voucher + thanh toán
  return (
    <div className={s.root} style={cssVars}>
      <button className={s.backBtn} type="button" onClick={goBack}>
        ← Quay lại
      </button>

      {/* Voucher */}
      {vouchers.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Chọn voucher</h2>
          <div className={s.voucherGrid}>
            {vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                primaryColor={primaryColor}
                selected={selectedVoucher?.id === v.id}
                onSelect={toggleVoucher}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tổng tiền */}
      <div className={s.summary}>
        <h2 className={s.summaryTitle}>Chi tiết đơn hàng</h2>
        <div className={s.summaryRows}>
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>{selectedProduct!.name}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {selectedVoucher && discountAmount > 0 && (
            <div className={`${s.summaryRow} ${s.discountRow}`}>
              <span>Voucher ({selectedVoucher.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className={`${s.summaryRow} ${s.totalRow}`}>
            <span>Tổng cộng</span>
            <span>{isSimulating ? "..." : formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={s.orderForm}>
        <h2 className={s.sectionTitle}>Thông tin người mua</h2>
        <div className={s.formGrid}>
          <div className={s.fieldGroup}>
            <label className={s.label}>Số điện thoại</label>
            <div className={s.phoneWrap}>
              <span className={s.phonePrefix}>+84</span>
              <input
                className={s.phoneInput}
                type="tel"
                placeholder="987 654 321"
                maxLength={9}
                value={form.phone.replace(/^\+84/, "")}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setForm((f) => ({
                    ...f,
                    phone: digits ? `+84${digits}` : "",
                  }));
                }}
              />
            </div>
          </div>
          <div className={s.fieldGroup}>
            <label className={s.label}>Email</label>
            <input
              className={s.input}
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
        </div>

        {orderError && <p className={s.errorMsg}>{orderError}</p>}
        <button
          className={s.submitBtn}
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isSubmitting
            ? "Đang đặt hàng..."
            : `Đặt hàng – ${isSimulating ? "..." : formatPrice(total)}`}
        </button>
      </div>

      {orderResult && (
        <div className={s.successBox}>
          <p>Đặt hàng thành công!</p>
          <p className={s.orderCode}>
            Mã đơn hàng: <strong>{orderResult.code}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProductShop(props: Props) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <ProductShopInner {...props} />
    </GoogleReCaptchaProvider>
  );
}
