import React, { ReactNode } from "react";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const LegalModal = ({ open, onClose, title, children }: LegalModalProps) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#222",
          borderRadius: 12,
          padding: 32,
          maxWidth: 600,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
          lineHeight: 1.7,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 16,
            color: "#4B3FA7"
          }}
        >
          {title}
        </h2>
        <div style={{ fontSize: 16 }}>{children}</div>
        <button
          onClick={onClose}
          style={{
            marginTop: 28,
            background: "#6C63A6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(76, 68, 182, 0.08)",
            transition: "background 0.2s"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LegalModal;
