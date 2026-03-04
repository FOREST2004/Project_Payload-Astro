import { useState } from "react";

type NavLink = { label: string; url: string };

type Props = {
  links: NavLink[];
  primaryColor: string;
  logoText: string;
};

export default function MobileNav({ links, primaryColor, logoText }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — chỉ hiển thị trên mobile */}
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "white",
              borderRadius: 2,
              transition: "transform 0.25s, opacity 0.25s",
              transform: open
                ? i === 0
                  ? "rotate(45deg) translate(5px, 5px)"
                  : i === 2
                    ? "rotate(-45deg) translate(5px, -5px)"
                    : "none"
                : "none",
              opacity: open && i === 1 ? 0 : 1,
            }}
          />
        ))}
      </button>

      {/* Drawer */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 150,
            }}
          />
          <nav
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 260,
              background: primaryColor,
              zIndex: 151,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
              }}
            >
              {logoText}
            </div>
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                onClick={() => setOpen(false)}
                style={{
                  color: "rgba(255,255,255,0.92)",
                  textDecoration: "none",
                  padding: "0.65rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "1rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
