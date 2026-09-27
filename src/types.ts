import type { CSSProperties, ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortState = { key: string; direction: SortDirection } | null;
export type RowId = string | number;
export type DataGridDensity = 'compact' | 'comfortable' | 'spacious';

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
  className?: string;
  headerClassName?: string;
  cellClassName?: string | ((value: unknown, row: Row, rowIndex: number) => string | undefined);
}

export interface DataGridPagination {
  page: number;
  pageSize: number;
  totalRows?: number;
}

export interface DataGridLabels<Row> {
  filter?: string;
  rows?: (count: number) => ReactNode;
  selectAllRows?: string;
  selectRow?: (row: Row, rowIndex: number) => string;
  pagination?: string;
  pageStatus?: (page: number, pageCount: number, totalRows: number) => ReactNode;
  previousPage?: string;
  nextPage?: string;
  actions?: ReactNode;
  loading?: string;
}

export interface DataGridProps<Row> {
  rows: readonly Row[];
  columns: readonly DataGridColumn<Row>[];
  getRowId: (row: Row) => RowId;
  caption?: ReactNode;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
  density?: DataGridDensity;
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
  rowActions?: (row: Row, rowIndex: number) => ReactNode;
  rowActionsHeader?: ReactNode;
  labels?: DataGridLabels<Row>;
}
