import { Card } from "~/components/Card/Card";
import { Title } from "~/components/Title/Title";
import { ApplicationsTable } from '~/components/BackButton/ApplicationsTable/ApplicationsTable';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Search, Select } from 'urfu-ui-kit-react';
import styles from './ModerationMain.styles.module.less';
import { moderationMainTableColumns } from './ModerationMainTableColumns';
import { useGetModerationQuery, useGetModerationStatusesQuery } from "~/http/moderation";
import { useGetDirectionsQuery } from '~/http/Direction';
import { useSelector } from 'react-redux';
import { setModerationSearch, setModerationDirection, setModerationStatus } from '~/redux/filtersSlice';
import type { RootState } from '~/redux/store';
import { useTableFilters } from '~/hooks/useTableFilters';
import { TablePagination } from '~/components/Table/Table';
import { useLazyDownloadApplicationsExcelQuery } from '~/http/Applications';
import { downloadBlobFile } from '~/helpers/fileHelpers';
import { formatDate } from '~/helpers/dateFormat';
import { useRef, useEffect } from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button } from 'urfu-ui-kit-react';
import { useNotificationService } from '~/hooks/notificationService';
import InstructionButton from '~/components/InstructionButton/InstructionButton';

const ModerationMain = () => {
  // Получаем значения из Redux
  const { direction, status, search } = useSelector((state: RootState) => state.filters.moderation);

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
      search,
      direction,
      status
    },
    reduxActions: {
      search: setModerationSearch,
      direction: setModerationDirection,
      status: setModerationStatus
    }
  });

  const {data, isLoading, isFetching} = useGetModerationQuery({
    page: currentPage,
    pageSize,
    ...queryParams,
  });

  const {data: directions} = useGetDirectionsQuery();
  const {data: statuses} = useGetModerationStatusesQuery();

  const [triggerDownload, { data: excelBlob, error: excelError, isFetching: excelIsFetching, isUninitialized }] = useLazyDownloadApplicationsExcelQuery();
  const wasDownloaded = useRef(false);
  const { showMessage } = useNotificationService();

  useEffect(() => {
    if (excelError) {
      if (excelError instanceof Error && excelError.message === '413') {
        showMessage('Превышен размер файла', 'fail');
      } else {
        showMessage('Ошибка при скачивании файла', 'fail');
      }
      wasDownloaded.current = false;
    } else if (excelBlob && !wasDownloaded.current) {
      const today = formatDate(new Date().toISOString());
      downloadBlobFile(excelBlob, `Реестр заявок ${today}.xlsx`);
      showMessage('Скачивание успешно завершено', 'success');
      wasDownloaded.current = true;
    }
    if (isUninitialized) {
      wasDownloaded.current = false;
    }
  }, [excelBlob, excelError, showMessage, isUninitialized]);

  const handleDownload = () => {
    triggerDownload();
  };

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
        <div className="umb24"><InstructionButton type="moderator" /></div>
      </div>
      <Card className={styles.moderationCardContainer}>
        <div className={styles.filterContainerStyle}>
          <Search 
            placeholder="Введите ФИО" 
            value={localFilters.search} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
          />
          <Select
            className={styles.select}
            onChange={(option: {label: string, value: string}) => handleFilterChange('status', option.value)}
            options={statuses?.map(item => ({label: item.title, value: item.id})) || []}
            value={localFilters.status ? { 
              label: statuses?.find(item => item.id === localFilters.status)?.title || 'Статус',
              value: localFilters.status
            } : undefined}
            placeholder="Статус"
            isClearable
          />
          <Select
            className={styles.select}
            onChange={(option: {label: string, value: string}) => handleFilterChange('direction', option.value)}
            options={directions?.map(item => ({label: item.title, value: item.id})) || []}
            value={localFilters.direction ? { 
              label: directions?.find(item => item.id === localFilters.direction)?.title || 'Направление',
              value: localFilters.direction
            } : undefined}
            placeholder="Направление"
            isClearable
          />
          <Button icon="download" onClick={handleDownload} disabled={excelIsFetching}>Выгрузить в Excel</Button>
        </div>
        <ApplicationsTable 
          data={changedData ? changedData.items : undefined}
          isLoading={isLoading || isFetching}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sort={localFilters.sort}
          sortDir={localFilters['sort-dir'] as 'asc' | 'desc' | undefined}
          onSortChange={handleSortChange}
          columns={moderationMainTableColumns}
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

export default ModerationMain;