export type ModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** `back` = chevron para volver un paso dentro del sheet. */
  closeVariant?: "close" | "back";
  closeAccessibilityLabel?: string;
};
