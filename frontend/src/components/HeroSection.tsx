type Props = {
  title: string;
  content?: string;
  heroBgFrom: string;
  heroBgTo: string;
};

export default function HeroSection({
  title,
  content,
  heroBgFrom,
  heroBgTo,
}: Props) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${heroBgFrom} 0%, ${heroBgTo} 100%)`,
        padding: "5rem 1.5rem",
        color: "white",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h1>
        {content && (
          <p
            style={{
              fontSize: "1.15rem",
              opacity: 0.88,
              lineHeight: 1.7,
              marginBottom: "2rem",
              whiteSpace: "pre-line",
            }}
          >
            {content}
          </p>
        )}
        <a
          href="/tickets"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.75rem",
            border: "2px solid rgba(255,255,255,0.75)",
            borderRadius: 8,
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(4px)",
          }}
        >
          Xem vé ngay →
        </a>
      </div>
    </section>
  );
}
