import { Card } from "~/components/Card/Card"
import { Title } from "~/components/Title/Title"
import styles from './AuditionMain.styles.module.less'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Search, Calendar } from 'urfu-ui-kit-react';
import { ApplicationsTable } from "~/components/BackButton/ApplicationsTable/ApplicationsTable";
import { auditionMainTableColumns } from "./AuditionMainTableColumns";
import { TablePagination } from "~/components/Table/Table";
import { useTableFilters } from "~/hooks/useTableFilters";
import { useGetLogsQuery, useLazyDownloadLogsExcelQuery } from "~/http/logs";
import { setAuditionSearchAction, setAuditionDate, setAuditionSearchUser } from '~/redux/filtersSlice';
import { useSelector } from "react-redux";
import type { RootState } from "~/redux/store";
import { formatDate } from "~/helpers/dateFormat";
import { downloadBlobFile } from "~/helpers/fileHelpers";
import { useNotificationService } from "~/hooks/notificationService";


const AuditionMain = () => {

    const { username, date, source } = useSelector((state: RootState) => state.filters.audition);
    const [trigger, { isFetching }] = useLazyDownloadLogsExcelQuery()
    const { showMessage } = useNotificationService();

    const {
        currentPage,
        pageSize,
        localFilters,
        queryParams,
        handlePageChange,
        handlePageSizeChange,
        handleFilterChange,
        handleSortChange
    } = useTableFilters({initialFilters: {
            username,
            date,
            source
        },
        reduxActions: {
            username: setAuditionSearchUser,
            date: setAuditionDate,
            source: setAuditionSearchAction,
        }});

    const {data, isLoading} = useGetLogsQuery({
    page: currentPage,
    pageSize,
    ...queryParams
  })

  const changedData = data ? {
    ...data,
    items: data.items.map((item, index) => ({
      ...item,
      number: (currentPage - 1) * pageSize + index + 1
    }))
  } : undefined;


  const handleDownload = async () => {
      const result = await trigger();

      if (result.error instanceof Error && result.error.message === '413') {
        showMessage('Превышен размер файла', 'fail');
      } else if(result.isError){
        showMessage('Ошибка при скачивании файла', 'fail');
      }
      
      if (result?.data) {
        const today = formatDate(new Date().toISOString());
        downloadBlobFile(result.data, `Журнал логов ${today}.xlsx`);
      }
    };

    return (
        <>
            <Title>Журнал логов</Title>
            <Card>
                <div className={styles.info}>
                    <Calendar
                        id="dateBegin"
                        placeholder="Введите дату"
                        selected={localFilters.date || null}
                        onChange={(date: string) =>  handleFilterChange('date', date ? formatDate(date, false ,true) : '')}
                        className={styles.filter}
                        isClearable
                    />
                    <Search 
                        placeholder="Введите пользователя"
                        value={localFilters.username} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('username', e.target.value)}
                        className={styles.filter}
                    />
                    <Search 
                        placeholder="Введите действие"
                        value={localFilters.source} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('source', e.target.value)}
                        className={styles.filter}
                    />
                    <Button onClick={handleDownload} disabled={isFetching} icon="download">Выгрузить в Excel</Button>
                </div>
                <ApplicationsTable
                    columns={auditionMainTableColumns}
                    data={changedData ? changedData.items : undefined}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    sort={localFilters.sort}
                    sortDir={localFilters['sort-dir'] as 'asc' | 'desc' | undefined}
                    onSortChange={handleSortChange}
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
}

export default AuditionMain