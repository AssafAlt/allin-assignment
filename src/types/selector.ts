export interface BaseSelectorProps<T> {
  label: string;
  placeholder: string;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  items: T[];
  loading: boolean;
  hasMore: boolean;
  onClear: () => void;
  onSelect: (item: T) => void;
  displayKeys: { name: keyof T; symbol: keyof T };
  loadMoreRef: (node: HTMLElement | null) => void;
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent, onSelect: (item: T) => void) => void;
  disabled?: boolean;
}
