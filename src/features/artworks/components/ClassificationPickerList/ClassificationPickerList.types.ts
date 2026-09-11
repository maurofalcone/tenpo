export type PickerRow = {
  key: string;
  label: string;
  value: string | undefined;
};

export type ClassificationPickerListProps = {
  selected?: string;
  /** Cuando es true, el paso de clasificación está visible. */
  active?: boolean;
  /** Alto máximo de la lista (p. ej. campos + barra de acciones). */
  maxHeight?: number;
  onSelect: (value: string | undefined) => void;
};
