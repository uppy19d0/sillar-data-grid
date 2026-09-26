import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { DataGrid } from '../dist/index.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const columns = [
  { key: 'name', header: 'Customer', accessor: 'name', sortable: true },
  { key: 'balance', header: 'Balance', accessor: 'balance', sortable: true, align: 'end' },
];
const rows = [
  { id: 1, name: 'Zoë', balance: 20 },
  { id: 2, name: 'Ana', balance: 40 },
  { id: 3, name: 'Luis', balance: 10 },
];

let root;
let dom;

function render(props = {}) {
  dom = new JSDOM('<!doctype html><html lang="en"><head><title>Data grid test</title></head><body><main><div id="root"></div></main></body></html>', { pretendToBeVisual: true, url: 'http://localhost' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle });
  root = createRoot(document.getElementById('root'));
  act(() => root.render(React.createElement(DataGrid, { rows, columns, getRowId: (row) => row.id, 'aria-label': 'Customers', ...props })));
  return document;
}

afterEach(() => { if (root) act(() => root.unmount()); dom?.window.close(); root = undefined; dom = undefined; });

test('renders semantic rows and sortable headings', () => {
  const document = render();
  assert.equal(document.querySelector('table')?.getAttribute('aria-label'), 'Customers');
  assert.equal(document.querySelectorAll('tbody tr').length, 3);
  assert.equal(document.querySelectorAll('th button').length, 2);
});

test('sorts rows through the public interaction', () => {
  const document = render();
  const button = document.querySelector('th button');
  act(() => button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.deepEqual([...document.querySelectorAll('tbody tr td:first-child')].map((cell) => cell.textContent), ['Ana', 'Luis', 'Zoë']);
  assert.equal(button.closest('th').getAttribute('aria-sort'), 'ascending');
});

test('filters, selects visible rows, and paginates', () => {
  let filter = '';
  let selected = new Set();
  const document = render({ filter, onFilterChange: (value) => { filter = value; }, selectable: true, onSelectedRowsChange: (value) => { selected = value; }, pagination: { page: 0, pageSize: 2 }, onPageChange: () => {} });
  assert.equal(document.querySelectorAll('tbody tr').length, 2);
  const selectAll = document.querySelector('thead input[type="checkbox"]');
  act(() => selectAll.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.equal(selected.size, 2);
});

test('has no serious or critical automated accessibility violations', async () => {
  const document = render({ selectable: true, caption: 'Customer accounts' });
  const axe = (await import(`${import.meta.resolve('axe-core')}?dom=${Date.now()}`)).default;
  const results = await axe.run(document.getElementById('root'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } } });
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  assert.deepEqual(blocking.map(({ id, impact }) => ({ id, impact })), []);
});
