import React, { ReactNode } from "react";
import Modal from "./Modal";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Long-form policy text (terms, privacy, cookies) in a scrollable pop-up
const LegalModal = ({ open, onClose, title, children }: LegalModalProps) => (
  <Modal isOpen={open} onClose={onClose} title={title} style={{ maxWidth: 680 }}>
    <div className="leading-relaxed text-ink [&_a]:font-semibold [&_a]:text-iris [&_a:hover]:underline [&_h2]:mt-6 [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2">{children}</div>
    <button onClick={onClose} className="btn-primary mt-8">Close</button>
  </Modal>
);

export default LegalModal;
