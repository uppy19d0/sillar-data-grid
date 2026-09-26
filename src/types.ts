import type { CSSProperties, ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortState = { key: string; direction: SortDirection } | null;
export type RowId = string | number;

export interface DataGridColumn<Row> {
  key: string;
  header: ReactNode;
  accessor?: keyof Row | ((row: Row) => unknown);
  cell?: (value: unknown, row: Row, rowIndex: number) => ReactNode;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: string | number;
  minWidth?: string | number;
  hidden?: boolean;
  compare?: (left: Row, right: Row) => number;
}

export interface DataGridPagination {
  page: number;
  pageSize: number;
  totalRows?: number;
}

export interface DataGridProps<Row> {
  rows: readonly Row[];
  columns: readonly DataGridColumn<Row>[];
  getRowId: (row: Row) => RowId;
  caption?: ReactNode;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
  emptyMessage?: ReactNode;
  filter?: string;
  filterPlaceholder?: string;
  onFilterChange?: (value: string) => void;
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  selectedRows?: ReadonlySet<RowId>;
  defaultSelectedRows?: Iterable<RowId>;
  onSelectedRowsChange?: (selected: ReadonlySet<RowId>) => void;
  selectable?: boolean;
  pagination?: DataGridPagination;
  onPageChange?: (page: number) => void;
  serverSide?: boolean;
  rowLabel?: (row: Row) => string;
}
