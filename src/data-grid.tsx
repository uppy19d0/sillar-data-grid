import * as React from 'react';
import type { DataGridColumn, DataGridProps, RowId, SortState } from './types';

function getValue<Row>(row: Row, column: DataGridColumn<Row>): unknown {
  if (typeof column.accessor === 'function') return column.accessor(row);
  if (column.accessor != null) return row[column.accessor];
  return (row as Record<string, unknown>)[column.key];
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
}

function cx(...values: Array<string | undefined | false>) { return values.filter(Boolean).join(' '); }

export function DataGrid<Row>({
  rows, columns, getRowId, caption, className, style, loading = false, emptyMessage = 'No results found.',
  filter, filterPlaceholder = 'Filter rows…', onFilterChange, sort: controlledSort, defaultSort = null, onSortChange,
  selectedRows, defaultSelectedRows, onSelectedRowsChange, selectable = false, pagination, onPageChange,
  serverSide = false, rowLabel, 'aria-label': ariaLabel,
}: DataGridProps<Row>) {
  const [internalSort, setInternalSort] = React.useState<SortState>(defaultSort);
  const [internalSelected, setInternalSelected] = React.useState<Set<RowId>>(() => new Set(defaultSelectedRows));
  const sort = controlledSort === undefined ? internalSort : controlledSort;
  const selected = selectedRows ?? internalSelected;
  const visibleColumns = React.useMemo(() => columns.filter((column) => !column.hidden), [columns]);

  const processedRows = React.useMemo(() => {
    if (serverSide) return [...rows];
    const normalizedFilter = filter?.trim().toLocaleLowerCase();
    const filtered = normalizedFilter
      ? rows.filter((row) => visibleColumns.some((column) => String(getValue(row, column) ?? '').toLocaleLowerCase().includes(normalizedFilter)))
      : [...rows];
    if (sort) {
      const column = visibleColumns.find((candidate) => candidate.key === sort.key);
      if (column) filtered.sort((left, right) => (column.compare?.(left, right) ?? compareValues(getValue(left, column), getValue(right, column))) * (sort.direction === 'asc' ? 1 : -1));
    }
    if (!pagination) return filtered;
    const start = pagination.page * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filter, pagination, rows, serverSide, sort, visibleColumns]);

  const totalRows = pagination?.totalRows ?? (serverSide ? pagination?.totalRows ?? rows.length : (filter?.trim() ? rows.filter((row) => visibleColumns.some((column) => String(getValue(row, column) ?? '').toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()))).length : rows.length));
  const pageCount = pagination ? Math.max(1, Math.ceil(totalRows / pagination.pageSize)) : 1;
  const visibleIds = processedRows.map(getRowId);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const updateSort = (key: string) => {
    const next: SortState = sort?.key !== key ? { key, direction: 'asc' } : sort.direction === 'asc' ? { key, direction: 'desc' } : null;
    setInternalSort(next);
    onSortChange?.(next);
  };

  const updateSelection = (next: Set<RowId>) => {
    setInternalSelected(next);
    onSelectedRowsChange?.(new Set(next));
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-sdg-cell]');
    if (!target) return;
    const row = Number(target.dataset.row); const column = Number(target.dataset.column);
    const rowCount = processedRows.length + 1; const columnCount = visibleColumns.length + (selectable ? 1 : 0);
    let nextRow = row; let nextColumn = column;
    if (event.key === 'ArrowLeft') nextColumn = Math.max(0, column - 1);
    if (event.key === 'ArrowRight') nextColumn = Math.min(columnCount - 1, column + 1);
    if (event.key === 'ArrowUp') nextRow = Math.max(0, row - 1);
    if (event.key === 'ArrowDown') nextRow = Math.min(rowCount - 1, row + 1);
    if (event.key === 'Home') nextColumn = 0;
    if (event.key === 'End') nextColumn = columnCount - 1;
    if (nextRow === row && nextColumn === column) return;
    event.preventDefault();
    event.currentTarget.querySelector<HTMLElement>(`[data-row="${nextRow}"][data-column="${nextColumn}"]`)?.focus();
  };

  return <div className={cx('sdg-root', className)} style={style} onKeyDown={onGridKeyDown}>
    {onFilterChange ? <div className="sdg-toolbar"><label><span className="sdg-visually-hidden">{filterPlaceholder}</span><input type="search" value={filter ?? ''} onChange={(event) => onFilterChange(event.target.value)} placeholder={filterPlaceholder} /></label><output aria-live="polite">{totalRows} rows</output></div> : null}
    <div className="sdg-scroller" aria-busy={loading || undefined}>
      <table className="sdg-table" aria-label={ariaLabel}>
        {caption ? <caption>{caption}</caption> : null}
        <thead><tr>
          {selectable ? <th className="sdg-selection" scope="col" data-sdg-cell data-row="0" data-column="0" tabIndex={0}><input type="checkbox" aria-label="Select all visible rows" checked={allVisibleSelected} onChange={() => { const next = new Set(selected); visibleIds.forEach((id) => allVisibleSelected ? next.delete(id) : next.add(id)); updateSelection(next); }} /></th> : null}
          {visibleColumns.map((column, columnIndex) => <th key={column.key} scope="col" aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined} style={{ width: column.width, minWidth: column.minWidth, textAlign: column.align }} data-sdg-cell data-row="0" data-column={columnIndex + (selectable ? 1 : 0)} tabIndex={0}>{column.sortable ? <button type="button" className="sdg-sort" onClick={() => updateSort(column.key)}>{column.header}<span aria-hidden="true">{sort?.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span></button> : column.header}</th>)}
        </tr></thead>
        <tbody>{loading ? <LoadingRows columns={visibleColumns.length + (selectable ? 1 : 0)} /> : processedRows.length === 0 ? <tr><td className="sdg-empty" colSpan={visibleColumns.length + (selectable ? 1 : 0)}>{emptyMessage}</td></tr> : processedRows.map((row, rowIndex) => {
          const id = getRowId(row); const checked = selected.has(id);
          return <tr key={id} data-selected={checked || undefined} aria-label={rowLabel?.(row)}>
            {selectable ? <td className="sdg-selection" data-label="Select" data-sdg-cell data-row={rowIndex + 1} data-column="0" tabIndex={-1}><input type="checkbox" aria-label={`Select row ${rowIndex + 1}`} checked={checked} onChange={() => { const next = new Set(selected); checked ? next.delete(id) : next.add(id); updateSelection(next); }} /></td> : null}
            {visibleColumns.map((column, columnIndex) => { const value = getValue(row, column); return <td key={column.key} data-label={typeof column.header === 'string' ? column.header : column.key} data-sdg-cell data-row={rowIndex + 1} data-column={columnIndex + (selectable ? 1 : 0)} tabIndex={-1} style={{ textAlign: column.align }}>{column.cell ? column.cell(value, row, rowIndex) : String(value ?? '')}</td>; })}
          </tr>;
        })}</tbody>
      </table>
    </div>
    {pagination ? <nav className="sdg-pagination" aria-label="Data grid pagination"><span>Page {pagination.page + 1} of {pageCount}</span><div><button type="button" disabled={pagination.page <= 0} onClick={() => onPageChange?.(pagination.page - 1)}>Previous</button><button type="button" disabled={pagination.page >= pageCount - 1} onClick={() => onPageChange?.(pagination.page + 1)}>Next</button></div></nav> : null}
  </div>;
}

function LoadingRows({ columns }: { columns: number }) {
  return <>{[0, 1, 2].map((row) => <tr key={row} aria-hidden="true">{Array.from({ length: columns }, (_, column) => <td key={column}><span className="sdg-skeleton" /></td>)}</tr>)}</>;
}
