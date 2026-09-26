<h1 align="center">Sillar Data Grid</h1>

<p align="center">An accessible, typed React data grid for real product interfaces.</p>

<p align="center"><strong>Made with love in the Dominican Republic by <a href="https://github.com/uppy19d0">@uppy19d0</a>.</strong></p>

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

## Controlled and server-side usage

Pass `sort` with `onSortChange`, `selectedRows` with `onSelectedRowsChange`, or `pagination` with `onPageChange` to control state. Set `serverSide` when rows already represent the current server response; `totalRows` then controls the page count.

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

## Roadmap

- Column visibility, resizing, ordering, and pinning
- Virtualized rows and columns
- Grouping, aggregation, and expandable rows
- CSV/JSON export
- Editable cells with validation
- Framework adapters and documentation site

## License

MIT
