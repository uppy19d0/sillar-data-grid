<h1 align="center">Sillar Data Grid</h1>

<p align="center">An accessible, typed React data grid for real product interfaces.</p>

<p align="center"><strong>Made with love in the Dominican Republic by <a href="https://github.com/uppy19d0">@uppy19d0</a>.</strong></p>

[![CI](https://github.com/uppy19d0/sillar-data-grid/actions/workflows/ci.yml/badge.svg)](https://github.com/uppy19d0/sillar-data-grid/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/sillar-data-grid.svg)](https://www.npmjs.com/package/sillar-data-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Why

Sillar Data Grid sits between headless table engines and large enterprise suites. It provides polished defaults, semantic table markup, keyboard navigation, responsive layouts, and controlled APIs while remaining independent from a component runtime.

## Install

```bash
npm install sillar-data-grid
```

Import the stylesheet once:

```tsx
import 'sillar-data-grid/styles.css';
```

## Quick start

```tsx
import { useState } from 'react';
import { DataGrid, type DataGridColumn } from 'sillar-data-grid';

type Customer = { id: number; name: string; country: string; balance: number };

const columns: DataGridColumn<Customer>[] = [
  { key: 'name', header: 'Customer', accessor: 'name', sortable: true },
  { key: 'country', header: 'Country', accessor: 'country', sortable: true },
  {
    key: 'balance',
    header: 'Balance',
    accessor: 'balance',
    sortable: true,
    align: 'end',
    cell: (value) => new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(value)),
  },
];

export function CustomerGrid({ customers }: { customers: Customer[] }) {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);

  return (
    <DataGrid
      aria-label="Customers"
      rows={customers}
      columns={columns}
      getRowId={(customer) => customer.id}
      filter={filter}
      onFilterChange={setFilter}
      filterPlaceholder="Search customers"
      selectable
      pagination={{ page, pageSize: 25 }}
      onPageChange={setPage}
    />
  );
}
```

## Accessibility contract

- Uses a native `table`, headings, rows, and cells.
- Exposes `aria-sort` on the active sortable column.
- Supports arrow-key navigation between header and body cells.
- Preserves native checkbox semantics for selection.
- Announces filter result counts and loading state.
- Keeps visible focus in light and dark themes.
- Respects `prefers-reduced-motion`.

Automated checks improve coverage but do not replace testing with screen readers and disabled users.

## Production readiness

- CI runs TypeScript, build output generation, accessibility-focused tests, and npm package previews.
- Releases publish from version tags with npm provenance.
- Public security, contribution, and code of conduct policies are included in the repository and npm package.
- The grid is SSR-friendly and uses peer React dependencies instead of bundling React.

## Controlled and server-side usage

Pass `sort` with `onSortChange`, `selectedRows` with `onSelectedRowsChange`, or `pagination` with `onPageChange` to control state. Set `serverSide` when rows already represent the current server response; `totalRows` then controls the page count.

## Enterprise interface features

The grid now includes small but important production hooks for real applications:

- `density="compact | comfortable | spacious"` for dashboards, backoffices, and content-heavy pages.
- `labels` for localization of filters, result counts, selection, pagination, loading, and row actions.
- `rowActions` and `rowActionsHeader` for view/edit/export menus without custom table plumbing.
- `className`, `headerClassName`, and `cellClassName` per column for status chips, numeric cells, risk states, and product-specific formatting.
- Responsive card layout on small screens while preserving semantic table markup on larger screens.

```tsx
<DataGrid
  aria-label="Invoices"
  density="compact"
  rows={invoices}
  columns={columns}
  getRowId={(invoice) => invoice.id}
  rowActions={(invoice) => <button type="button">Open {invoice.number}</button>}
  labels={{
    filter: 'Search invoices',
    rows: (count) => `${count} invoices`,
    actions: 'Actions',
    previousPage: 'Previous',
    nextPage: 'Next',
  }}
/>
```

## Theming

Override semantic tokens on `:root`, `.dark`, `[data-theme="dark"]`, or a product wrapper:

```css
.my-product {
  --sdg-brand: #2563eb;
  --sdg-radius: 1rem;
  --sdg-bg: #ffffff;
  --sdg-border: #dbe3ee;
}
```

## Public API

- `DataGrid<Row>(props)`
- `DataGridColumn<Row>`
- `DataGridPagination`
- `DataGridLabels<Row>`
- `DataGridDensity`
- `SortState`, `SortDirection`, and `RowId`

## Roadmap

- Column visibility, resizing, ordering, and pinning
- Virtualized rows and columns
- Grouping, aggregation, and expandable rows
- CSV/JSON export
- Editable cells with validation
- Framework adapters and documentation site

## License

MIT
