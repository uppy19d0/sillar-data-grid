import * as React from 'react';
import type { DataGridColumn, DataGridLabels, DataGridProps, RowId, SortState } from './types';

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

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function getDefaultLabels<Row>(): Required<DataGridLabels<Row>> {
  return {
    filter: 'Filter rows',
    rows: (count) => `${count} ${count === 1 ? 'row' : 'rows'}`,
    selectAllRows: 'Select all visible rows',
    selectRow: (_row, rowIndex) => `Select row ${rowIndex + 1}`,
    pagination: 'Data grid pagination',
    pageStatus: (page, pageCount) => `Page ${page + 1} of ${pageCount}`,
    previousPage: 'Previous',
    nextPage: 'Next',
    actions: 'Actions',
    loading: 'Loading rows',
  };
}

function getCellClassName<Row>(column: DataGridColumn<Row>, value: unknown, row: Row, rowIndex: number) {
  const resolved = typeof column.cellClassName === 'function'
    ? column.cellClassName(value, row, rowIndex)
    : column.cellClassName;
  return cx(column.className, resolved);
}

export function DataGrid<Row>({
  rows,
  columns,
  getRowId,
  caption,
  className,
  style,
  density = 'comfortable',
  loading = false,
  emptyMessage = 'No results found.',
  filter,
  filterPlaceholder = 'Filter rows…',
  onFilterChange,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectedRows,
  defaultSelectedRows,
  onSelectedRowsChange,
  selectable = false,
  pagination,
  onPageChange,
  serverSide = false,
  rowLabel,
  rowActions,
  rowActionsHeader,
  labels,
  'aria-label': ariaLabel,
}: DataGridProps<Row>) {
  const [internalSort, setInternalSort] = React.useState<SortState>(defaultSort);
  const [internalSelected, setInternalSelected] = React.useState<Set<RowId>>(() => new Set(defaultSelectedRows));
  const sort = controlledSort === undefined ? internalSort : controlledSort;
  const selected = selectedRows ?? internalSelected;
  const mergedLabels = React.useMemo(() => ({ ...getDefaultLabels<Row>(), ...labels }), [labels]);
  const visibleColumns = React.useMemo(() => columns.filter((column) => !column.hidden), [columns]);
  const normalizedFilter = filter?.trim().toLocaleLowerCase() ?? '';

  const clientRows = React.useMemo(() => {
    if (serverSide) return [...rows];

    const filtered = normalizedFilter
      ? rows.filter((row) => visibleColumns.some((column) => String(getValue(row, column) ?? '').toLocaleLowerCase().includes(normalizedFilter)))
      : [...rows];

    if (!sort) return filtered;

    const column = visibleColumns.find((candidate) => candidate.key === sort.key);
    if (!column) return filtered;

    return [...filtered].sort((left, right) => (
      column.compare?.(left, right) ?? compareValues(getValue(left, column), getValue(right, column))
    ) * (sort.direction === 'asc' ? 1 : -1));
  }, [normalizedFilter, rows, serverSide, sort, visibleColumns]);

  const processedRows = React.useMemo(() => {
    if (serverSide || !pagination) return clientRows;
    const start = pagination.page * pagination.pageSize;
    return clientRows.slice(start, start + pagination.pageSize);
  }, [clientRows, pagination, serverSide]);

  const totalRows = pagination?.totalRows ?? (serverSide ? rows.length : clientRows.length);
  const pageCount = pagination ? Math.max(1, Math.ceil(totalRows / pagination.pageSize)) : 1;
  const visibleIds = React.useMemo(() => processedRows.map(getRowId), [getRowId, processedRows]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const hasRowActions = typeof rowActions === 'function';
  const selectionOffset = selectable ? 1 : 0;
  const dataColumnCount = visibleColumns.length + selectionOffset;
  const tableColumnCount = dataColumnCount + (hasRowActions ? 1 : 0);
  const actionLabel = typeof rowActionsHeader === 'string'
    ? rowActionsHeader
    : typeof mergedLabels.actions === 'string'
      ? mergedLabels.actions
      : 'Actions';

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
    const row = Number(target.dataset.row);
    const column = Number(target.dataset.column);
    const rowCount = processedRows.length + 1;
    const columnCount = tableColumnCount;
    let nextRow = row;
    let nextColumn = column;

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

  return (
    <div className={cx('sdg-root', `sdg-density-${density}`, className)} data-density={density} style={style} onKeyDown={onGridKeyDown}>
      {onFilterChange ? (
        <div className="sdg-toolbar">
          <label>
            <span className="sdg-visually-hidden">{mergedLabels.filter}</span>
            <input
              type="search"
              value={filter ?? ''}
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder={filterPlaceholder}
            />
          </label>
          <output aria-live="polite">{mergedLabels.rows(totalRows)}</output>
        </div>
      ) : null}

      <div className="sdg-scroller" aria-busy={loading || undefined} aria-label={loading ? mergedLabels.loading : undefined}>
        <table className="sdg-table" aria-label={ariaLabel}>
          {caption ? <caption>{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th className="sdg-selection" scope="col" data-sdg-cell data-row="0" data-column="0" tabIndex={0}>
                  <input
                    type="checkbox"
                    aria-label={mergedLabels.selectAllRows}
                    checked={allVisibleSelected}
                    onChange={() => {
                      const next = new Set(selected);
                      visibleIds.forEach((id) => (allVisibleSelected ? next.delete(id) : next.add(id)));
                      updateSelection(next);
                    }}
                  />
                </th>
              ) : null}

              {visibleColumns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cx(column.className, column.headerClassName)}
                  style={{ width: column.width, minWidth: column.minWidth, textAlign: column.align }}
                  data-sdg-cell
                  data-row="0"
                  data-column={columnIndex + selectionOffset}
                  tabIndex={0}
                >
                  {column.sortable ? (
                    <button type="button" className="sdg-sort" onClick={() => updateSort(column.key)}>
                      {column.header}
                      <span aria-hidden="true">{sort?.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  ) : column.header}
                </th>
              ))}

              {hasRowActions ? (
                <th className="sdg-actions" scope="col" data-sdg-cell data-row="0" data-column={dataColumnCount} tabIndex={0}>
                  {rowActionsHeader ?? mergedLabels.actions}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRows columns={tableColumnCount} />
            ) : processedRows.length === 0 ? (
              <tr>
                <td className="sdg-empty" colSpan={tableColumnCount}>{emptyMessage}</td>
              </tr>
            ) : processedRows.map((row, rowIndex) => {
              const id = getRowId(row);
              const checked = selected.has(id);

              return (
                <tr key={id} data-selected={checked || undefined} aria-label={rowLabel?.(row)}>
                  {selectable ? (
                    <td className="sdg-selection" data-label="Select" data-sdg-cell data-row={rowIndex + 1} data-column="0" tabIndex={-1}>
                      <input
                        type="checkbox"
                        aria-label={mergedLabels.selectRow(row, rowIndex)}
                        checked={checked}
                        onChange={() => {
                          const next = new Set(selected);
                          checked ? next.delete(id) : next.add(id);
                          updateSelection(next);
                        }}
                      />
                    </td>
                  ) : null}

                  {visibleColumns.map((column, columnIndex) => {
                    const value = getValue(row, column);
                    return (
                      <td
                        key={column.key}
                        className={getCellClassName(column, value, row, rowIndex)}
                        data-label={typeof column.header === 'string' ? column.header : column.key}
                        data-sdg-cell
                        data-row={rowIndex + 1}
                        data-column={columnIndex + selectionOffset}
                        tabIndex={-1}
                        style={{ textAlign: column.align }}
                      >
                        {column.cell ? column.cell(value, row, rowIndex) : String(value ?? '')}
                      </td>
                    );
                  })}

                  {hasRowActions ? (
                    <td className="sdg-actions" data-label={actionLabel} data-sdg-cell data-row={rowIndex + 1} data-column={dataColumnCount} tabIndex={-1}>
                      {rowActions(row, rowIndex)}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <nav className="sdg-pagination" aria-label={mergedLabels.pagination}>
          <span>{mergedLabels.pageStatus(pagination.page, pageCount, totalRows)}</span>
          <div>
            <button type="button" disabled={pagination.page <= 0} onClick={() => onPageChange?.(pagination.page - 1)}>
              {mergedLabels.previousPage}
            </button>
            <button type="button" disabled={pagination.page >= pageCount - 1} onClick={() => onPageChange?.(pagination.page + 1)}>
              {mergedLabels.nextPage}
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {[0, 1, 2].map((row) => (
        <tr key={row} aria-hidden="true">
          {Array.from({ length: columns }, (_, column) => (
            <td key={column}><span className="sdg-skeleton" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}
