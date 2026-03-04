import { useState, useEffect } from "react";
import s from "./TicketCard.module.css";

type Ticket = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

type Props = {
  ticket: Ticket;
  tenantId: string;
  primaryColor: string;
};

type Step = "idle" | "form" | "submitting" | "success" | "error";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank-transfer", label: "Chuyển khoản" },
  { value: "vnpay", label: "VNPay" },
  { value: "momo", label: "MoMo" },
  { value: "zalopay", label: "ZaloPay" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TicketCard({ ticket, tenantId, primaryColor }: Props) {
  useEffect(() => {
    console.log(
      `🦀[TicketCard] hydrated (client:visible) - ${ticket.name} @ ${Date.now() % 1000}ms`,
    );
  }, []);
  const [step, setStep] = useState<Step>("idle");
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    payment: "cash",
  });
  const [orderCode, setOrderCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const cssVars = { "--primary": primaryColor } as React.CSSProperties;
  const total = ticket.price * qty;

  function reset() {
    setStep("idle");
    setQty(1);
    setForm({ name: "", email: "", phone: "", payment: "cash" });
    setOrderCode("");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          tenantId,
          quantity: qty,
          totalAmount: total,
          buyerName: form.name,
          buyerEmail: form.email,
          buyerPhone: form.phone,
          paymentMethod: form.payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đặt vé thất bại");
      setOrderCode(data.orderCode);
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStep("error");
    }
  }

  return (
    <>
      <article className={s.card} style={cssVars}>
        <div className={s.name}>{ticket.name}</div>
        {ticket.description && (
          <div className={s.desc}>{ticket.description}</div>
        )}
        <div className={s.footer}>
          <span className={s.price}>{formatPrice(ticket.price)}</span>
          <button
            type="button"
            className={s.buyBtn}
            onClick={() => setStep("form")}
          >
            Mua ngay
          </button>
        </div>
      </article>

      {step !== "idle" && (
        <div
          className={s.overlay}
          style={cssVars}
          onClick={step !== "submitting" ? reset : undefined}
          role="dialog"
          aria-modal="true"
          aria-label="Đặt vé"
        >
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            {step === "success" && (
              <div className={s.center}>
                <div className={s.icon}>✅</div>
                <div className={s.successTitle}>Đặt vé thành công!</div>
                <div className={s.orderNote}>Mã đơn hàng của bạn:</div>
                <div className={s.orderCode}>{orderCode}</div>
                <div className={s.hint}>
                  Chúng tôi sẽ liên hệ qua email để xác nhận đơn hàng.
                </div>
                <button type="button" className={s.primaryBtn} onClick={reset}>
                  Đóng
                </button>
              </div>
            )}

            {step === "error" && (
              <div className={s.center}>
                <div className={s.icon}>❌</div>
                <div className={s.errorTitle}>Đặt vé thất bại</div>
                <div className={s.errorMsg}>{errorMsg}</div>
                <button
                  type="button"
                  className={s.primaryBtn}
                  onClick={() => setStep("form")}
                >
                  Thử lại
                </button>
              </div>
            )}

            {(step === "form" || step === "submitting") && (
              <form onSubmit={handleSubmit}>
                <div className={s.ticketTitle}>{ticket.name}</div>
                <div className={s.ticketPrice}>
                  {formatPrice(ticket.price)} / vé
                </div>

                <div className={s.field}>
                  <label className={s.label}>Số lượng</label>
                  <div className={s.qtyRow}>
                    <button
                      type="button"
                      className={s.qtyBtn}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className={s.qtyNum}>{qty}</span>
                    <button
                      type="button"
                      className={s.qtyBtn}
                      onClick={() => setQty((q) => q + 1)}
                    >
                      +
                    </button>
                    <span className={s.totalRight}>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="buyer-name">
                    Họ tên *
                  </label>
                  <input
                    id="buyer-name"
                    required
                    className={s.input}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label} htmlFor="buyer-email">
                    Email *
                  </label>
                  <input
                    id="buyer-email"
                    required
                    type="email"
                    className={s.input}
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label} htmlFor="buyer-phone">
                    Số điện thoại *
                  </label>
                  <input
                    id="buyer-phone"
                    required
                    className={s.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="0901234567"
                  />
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="payment-method">
                    Phương thức thanh toán
                  </label>
                  <select
                    id="payment-method"
                    title="Phương thức thanh toán"
                    className={s.select}
                    value={form.payment}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, payment: e.target.value }))
                    }
                  >
                    {PAYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={s.actions}>
                  <button
                    type="button"
                    className={s.cancelBtn}
                    onClick={reset}
                    disabled={step === "submitting"}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className={s.submitBtn}
                    disabled={step === "submitting"}
                  >
                    {step === "submitting"
                      ? "Đang xử lý..."
                      : "Xác nhận đặt vé"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
