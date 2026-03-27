import { Table } from '../../Table/Table';
import type { TableColumn } from '../../Table/Table.types';

interface ApplicationsTableProps<T> {
  data: T[] | undefined;
  columns: TableColumn<T>[];
  isLoading: boolean;
  sort?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (field?: string, dir?: 'asc' | 'desc') => void;
  [key: string]: unknown;
}

export function ApplicationsTable<T>({
  data,
  columns,
  isLoading,
  sort,
  sortDir,
  onSortChange,
  ...rest
}: ApplicationsTableProps<T>) {
  return (
    <Table
      data={data || []}
      columns={columns}
      sort={sort}
      sortDir={sortDir}
      onSortChange={onSortChange}
      {...rest}
      isLoading={isLoading}
      isLoadingPreloader={isLoading}
    />
  );
} 