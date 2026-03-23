import s from "./TicketCard.module.css";

type Ticket = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

type Props = {
  ticket: Ticket;
  primaryColor: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TicketCard({ ticket, primaryColor }: Props) {
  const cssVars = { "--primary": primaryColor } as React.CSSProperties;

  return (
    <article className={s.card} style={cssVars}>
      <div className={s.name}>{ticket.name}</div>
      {ticket.description && (
        <div className={s.desc}>{ticket.description}</div>
      )}
      <div className={s.footer}>
        <span className={s.price}>{formatPrice(ticket.price)}</span>
      </div>
    </article>
  );
}
