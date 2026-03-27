import type { CSSProperties, ReactNode } from 'react';

export interface TableColumn<T> {
  title?: string;
  field: string;
  sortOn?: boolean;
  renderHeader?: () => ReactNode;
  render?: (row: T) => ReactNode;
  tdStyle?: CSSProperties;
  thStyle?: CSSProperties;
  headerIcon?: ReactNode;
  headerTooltip?: string | ReactNode;
  [key: string]: unknown;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  cellStyle?: CSSProperties;
  tdContentStyle?: CSSProperties;
  tdStyle?: CSSProperties;
  thStyle?: CSSProperties;
  striped?: boolean;
  borders?: string;
  messageForEmptyTable?: string;
  pagination?: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sort?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (field?: string, dir?: 'asc' | 'desc') => void;
  isLoading?: boolean;
  isLoadingPreloader?: boolean;
  [key: string]: unknown;
} 