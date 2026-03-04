import type { APIRoute } from "astro";

const API_URL = import.meta.env.PAYLOAD_API_URL;

function generateOrderCode(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${datePart}-${randPart}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      ticketId,
      tenantId,
      quantity,
      totalAmount,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentMethod,
    } = body;

    if (
      !ticketId ||
      !tenantId ||
      !buyerName ||
      !buyerEmail ||
      !buyerPhone ||
      !quantity
    ) {
      return new Response(
        JSON.stringify({ error: "Thiếu thông tin bắt buộc" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const orderCode = generateOrderCode();

    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderCode,
        tenant: tenantId,
        ticket: ticketId,
        quantity,
        totalAmount,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod: paymentMethod || "cash",
        status: "pending",
        paymentStatus: "unpaid",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(
        JSON.stringify({
          error: err?.errors?.[0]?.message ?? "Lỗi tạo đơn hàng",
        }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const order = await res.json();
    return new Response(
      JSON.stringify({
        success: true,
        orderCode: order.doc?.orderCode ?? orderCode,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
