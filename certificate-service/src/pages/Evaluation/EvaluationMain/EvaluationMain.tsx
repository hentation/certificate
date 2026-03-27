import { Card } from "~/components/Card/Card";
import { Title } from "~/components/Title/Title";
import { ApplicationsTable } from '~/components/BackButton/ApplicationsTable/ApplicationsTable';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Search } from 'urfu-ui-kit-react';
import styles from './EvaluationMain.styles.module.less';
import { evaluationMainTableColumns } from './EvaluationMainTableColumns';
import { useGetExpertiseQuery } from "~/http/expertise";
import { useSelector } from 'react-redux';
import { setEvaluationSearch } from '~/redux/filtersSlice';
import type { RootState } from '~/redux/store';
import { useTableFilters } from '~/hooks/useTableFilters';
import { TablePagination } from '~/components/Table/Table';
import InstructionButton from '~/components/InstructionButton/InstructionButton';

const EvaluationMain = () => {
  // Получаем значения из Redux
  const { search } = useSelector((state: RootState) => state.filters.evaluation);

  const {
    currentPage,
    pageSize,
    localFilters,
    queryParams,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = useTableFilters({
    initialFilters: {
      search
    },
    reduxActions: {
      search: setEvaluationSearch
    }
  });

  const {data, isLoading} = useGetExpertiseQuery({
    page: currentPage,
    pageSize,
    ...queryParams
  });

  const changedData = data ? {
    ...data,
    items: data.items.map((item, index) => ({
      ...item,
      number: (currentPage - 1) * pageSize + index + 1
    }))
  } : undefined;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: '16px' }}>
        <Title>Реестр заявок</Title>
        <div className="umb24"><InstructionButton type="expert" /></div>
      </div>
      <Card>
        <Search 
          placeholder="Введите ФИО" 
          value={localFilters.search} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
          className={styles.searchStyle}
        />
        <ApplicationsTable 
          data={changedData ? changedData.items : undefined}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sort={localFilters.sort}
          sortDir={localFilters['sort-dir'] as 'asc' | 'desc' | undefined}
          onSortChange={handleSortChange}
          columns={evaluationMainTableColumns}
          totalItems={changedData?.total}
        />
      </Card>
      <TablePagination
        totalItems={changedData?.total || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        dataLength={changedData?.items?.length || 0}
      />
    </>
  )
};

export default EvaluationMain;
