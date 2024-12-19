import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  Row,
} from '@tanstack/react-table';

import type {
  Table as ReactTable,
  RowPinningState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from './ui/button';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from './ui/skeleton';
import { camelToCapitalized } from '@shared';
import { useDispatch, useSelector } from 'react-redux';
import { selectDataTable } from '..';
import { setTableState } from '@/model/dataTableModel';
import { cn } from '@/lib/utils';

// Add this type declaration at the top of the file, after the imports
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    label?: string;
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  getRowId: (row: TData) => string;
  data: TData[];
  tableId: string;
  primarySearchText?: string;
  primarySearchFieldKey?: string;
  handleRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  initialColumnVisibility?: VisibilityState;
  variant?: 'default' | 'outlined';
  isRowDeactivated?: (row: TData) => boolean;
  summaryRowId?: string;
  footer?: React.ReactNode;
  primaryButton?: React.ReactNode;
  tableSkeletonRows?: number;
}

export function DataTable<TData>({
  columns,
  data,
  primarySearchText,
  tableId,
  getRowId,
  primarySearchFieldKey,
  handleRefresh,
  isLoading = false,
  className,
  initialColumnVisibility = {},
  variant = 'default',
  isRowDeactivated,
  footer,
  summaryRowId,
  primaryButton,
  tableSkeletonRows = 10,
}: DataTableProps<TData>) {
  const dispatch = useDispatch();
  const savedState = useSelector(selectDataTable)[tableId];

  const [sorting, setSorting] = useState<SortingState>(
    savedState?.sorting || [],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    savedState?.columnFilters || [],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    savedState?.columnVisibility || initialColumnVisibility,
  );

  const [rowPinning, _setRowPinning] = useState<RowPinningState>({
    top: [],
    bottom: summaryRowId ? [summaryRowId] : [],
  });

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowPinning,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnVisibility: initialColumnVisibility,
    },
  });

  const paginationState = table.getState().pagination;

  useEffect(() => {
    dispatch(
      setTableState({
        tableId,
        tableState: {
          sorting,
          columnFilters,
          columnVisibility,
          pagination: paginationState,
        },
      }),
    );
  }, [
    dispatch,
    tableId,
    sorting,
    columnFilters,
    columnVisibility,
    paginationState,
  ]);

  useEffect(() => {
    if (primarySearchFieldKey && table) {
      const column = table.getColumn(primarySearchFieldKey);
      if (column) {
        column.setFilterValue(primarySearchText);
      }
    }
  }, [primarySearchText, primarySearchFieldKey, table]);

  const totalRows = summaryRowId
    ? table.getFilteredRowModel().rows.length - 1
    : table.getFilteredRowModel().rows.length;
  const currentPage = paginationState.pageIndex + 1;
  const firstRow = (currentPage - 1) * paginationState.pageSize + 1;
  const lastRow = Math.min(currentPage * paginationState.pageSize, totalRows);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 pb-6 pt-2 md:gap-0">
        {primaryButton && primaryButton}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto text-gray-600"
            >
              Show/Hide Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className=""
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.columnDef.meta?.label ??
                      camelToCapitalized(column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {handleRefresh && (
          <Button
            variant="outline"
            className="ml-2 text-gray-600"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </div>
      <div>
        {isLoading ? (
          <TableSkeleton
            columns={Math.min(columns.length, 6)}
            variant={variant}
            rows={tableSkeletonRows ?? data.length}
          />
        ) : (
          <div className="relative">
            <div
              ref={tableContainerRef}
              className={`overflow-x-auto ${
                variant === 'outlined'
                  ? 'border-gray-150 rounded-lg border'
                  : ''
              }`}
            >
              <div className="inline-block min-w-full align-top ">
                <Table>
                  <TableHeader
                    className={` ${
                      variant === 'outlined'
                        ? 'border-b border-gray-200 bg-gray-50'
                        : 'border-b-2'
                    }`}
                  >
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                          return (
                            <TableHead
                              key={header.id}
                              className="px-3"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getTopRows().map(row => (
                      <PinnedRow
                        key={row.id}
                        row={row}
                        table={table}
                      />
                    ))}
                    {table.getCenterRows().map((row, index, array) => {
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            'hover:bg-gray-50',
                            isRowDeactivated?.(row.original) &&
                              'bg-gray-50 opacity-50',
                            summaryRowId !== undefined &&
                              index === array.length - 1 &&
                              'border-b-2',
                          )}
                        >
                          {row.getVisibleCells().map(cell => {
                            return (
                              <TableCell
                                key={cell.id}
                                className="p-3.5"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                    {table.getBottomRows().map(row => (
                      <PinnedRow
                        key={row.id}
                        row={row}
                        table={table}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
      {footer && footer}
      {/* Footer pagination */}
      <div className="flex items-center justify-between space-x-2 py-5">
        <div className="hidden sm:block">
          {totalRows > 0 ? (
            <p className="ml-4 text-sm text-gray-700">
              Showing <span className="font-semibold">{firstRow}</span> to{' '}
              <span className="font-semibold">{lastRow}</span> of{' '}
              <span className="font-semibold">{totalRows}</span> results
            </p>
          ) : (
            <p className="ml-4 text-sm text-gray-700">No results found</p>
          )}
        </div>
        <div className="flex flex-1 justify-between gap-1 sm:justify-end">
          <Button
            variant="outline"
            size="default"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-600"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-600"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({
  columns,
  rows = 10,
  variant = 'default',
}: {
  columns: number;
  rows?: number;
  variant?: 'default' | 'outlined';
}) {
  const columnWidths = Array.from({ length: columns }, () =>
    Math.floor(Math.random() * (150 - 75 + 1) + 75),
  );

  return (
    <div
      className={`${variant === 'outlined' ? 'rounded-lg border border-gray-200' : ''}`}
    >
      <Table>
        <TableHeader
          className={`${
            variant === 'outlined'
              ? 'border-b border-gray-200 bg-gray-50'
              : 'border-b-2'
          }`}
        >
          <TableRow>
            {columnWidths.map((width, index) => (
              <TableHead key={index}>
                <Skeleton
                  className="h-4"
                  style={{ width: `${width}px` }}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="hover:bg-gray-100"
            >
              {columnWidths.map((width, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className="h-3"
                    style={{ width: `${width}px` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PinnedRow({ row, table }: { row: Row<any>; table: ReactTable<any> }) {
  return (
    <TableRow
      className={cn(
        row.getIsPinned() === 'bottom' && 'border-t-4 border-gray-200',
      )}
      style={{
        position: 'sticky',
        top:
          row.getIsPinned() === 'top'
            ? `${row.getPinnedIndex() * 26 + 48}px`
            : undefined,
        bottom:
          row.getIsPinned() === 'bottom'
            ? `${
                (table.getBottomRows().length - 1 - row.getPinnedIndex()) * 26
              }px`
            : undefined,
      }}
    >
      {row.getVisibleCells().map(cell => {
        return (
          <TableCell
            key={cell.id}
            className="px-3.5 py-4"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
