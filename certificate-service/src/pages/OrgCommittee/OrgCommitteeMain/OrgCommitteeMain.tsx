import { Card } from "~/components/Card/Card";
import { Title } from "~/components/Title/Title";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Search, Select, Icon, Tooltip } from 'urfu-ui-kit-react';
import styles from './OrgCommitteeMain.styles.module.less';
import { getOrgCommitteeMainTableColumns } from './OrgCommitteeMainTableColumns';
import { useGetDirectionsQuery } from '~/http/Direction';
import { useSelector } from 'react-redux';
import { setOrgCommitteeSearch, setOrgCommitteeDirection, setOrgCommitteeStatus } from '~/redux/filtersSlice';
import type { RootState } from '~/redux/store';
import { useTableFilters } from '~/hooks/useTableFilters';
import { colors } from "~/styles/colors";
import { useNavigate } from 'react-router-dom';
import paths from '~/routing/paths';
import { useGetOrgCommitteeQuery, useGetQuantitiesQuery, useSetIntramuralStageMutation, useLazyDownloadApplicationsExcelQuery } from "~/http/Applications";
import { useGetStatusesQuery } from "~/http/statuses";
import { useEffect, useRef, useState } from 'react';
import { ApplicationsTable } from '~/components/BackButton/ApplicationsTable/ApplicationsTable';
import { TablePagination } from '~/components/Table/Table';
import { useNotificationService } from '~/hooks/notificationService';
import { downloadBlobFile } from '~/helpers/fileHelpers';
import { formatDate } from '~/helpers/dateFormat';
import { ModalAllowance } from "./ModalAllowance";
import { useGetActualContestQuery } from "~/http/contests";
import InstructionButton from '~/components/InstructionButton/InstructionButton';

const OrgCommitteeMain = () => {
  // Получаем значения из Redux
  const { direction, status, search } = useSelector((state: RootState) => state.filters.orgCommittee);

  const navigate = useNavigate();
  
  const [isShowAllowanceModal, setIsShowAllowanceModal] = useState(false);

  const countForAllowed = 33; // значение определяющее количество допущенных к конкурсу, может меняться каждый год

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
      search: setOrgCommitteeSearch,
      direction: setOrgCommitteeDirection,
      status: setOrgCommitteeStatus
    }
  });

  const { data, isLoading, isFetching } = useGetOrgCommitteeQuery({
    page: currentPage,
    pageSize,
    ...queryParams,
  });

  const { data: quantities } = useGetQuantitiesQuery()
  const { data: directions } = useGetDirectionsQuery();
  const { data: statuses } = useGetStatusesQuery();
  const { data: actualContest } = useGetActualContestQuery();

  // Состояние выбранных id
  const [setIntramuralStageWithOptions] = useSetIntramuralStageMutation();

  const { showMessage } = useNotificationService();

  const [triggerDownload, { data: excelBlob, error: excelError, isFetching: excelIsFetching, isUninitialized }] = useLazyDownloadApplicationsExcelQuery();
  const wasDownloaded = useRef(false);

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

  const handleCheckboxChange = async (id: string, value: boolean) => {
    await setIntramuralStageWithOptions({ applicationId: id, value });
  };

  const handleDownload = () => {
    triggerDownload();
    wasDownloaded.current = false;
  };

  return (
    <>
      <div className={styles.titleWrapper}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: '16px', justifyContent: 'space-between', width: '100%' }}>
          <Title>Реестр заявок</Title>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: '16px' }}>
            <div className="umb24"><InstructionButton type="org-committee" /></div>
            <div
              className={styles.titleLinkWrapper}
              onClick={() => navigate(paths.orgCommittee.periods)}
              style={{ cursor: 'pointer' }}
            >
              <p className="bt clr-blue-60">Управление периодами</p>
              <Icon className="clr-blue-60" name="calendar" />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.statusList}>
        <div className={`${styles.status} ${styles.statusMod}`}><Icon color={colors.orange} size="16px" name="clock"/>
          <div className={styles.statusText}><p className="ds">На модерации</p><h4>{quantities?.onReview}</h4></div>
        </div>
        <div className={`${styles.status} ${styles.statusEva}`}><Icon color={colors.greenBlue} size="16px" name="star"/>
          <div className={styles.statusText}><p className="ds">На оценивании</p><h4>{quantities?.onScoring}</h4></div>
        </div>
        <div className={`${styles.status} ${styles.statusRej}`}><Icon color={colors.mainDanger} size="16px" name="submenu"/>
          <div className={styles.statusText}><p className="ds">Отклонено</p><h4>{quantities?.rejected}</h4></div>
        </div>
        <div className={`${styles.status} ${styles.statusAll}`}><Icon color={colors.mainGreen} size="20px" name="check"/>
          <div className={styles.statusText}><p className="ds">Выбрано к очному этапу</p><h4>{quantities?.intramuralStage}</h4></div>
        </div>
      </div>
      <Card className={styles.orgCommitteeCardContainer}>
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
          <Tooltip tooltipText="Выгрузить в Excel">
            <Button variant="icon" iconSize="20px" icon="download-line" onClick={handleDownload} disabled={excelIsFetching}></Button>
          </Tooltip>
          {quantities?.intramuralStage !== countForAllowed || actualContest?.completed
          ? <Tooltip tooltipText={actualContest?.completed ? 'Конкурс завершён' : `Выберите ${countForAllowed} участников`}>
            <Button className={styles.buttonTooltip} disabled>Допустить к участию</Button>
          </Tooltip>
          : <Button onClick={() => setIsShowAllowanceModal(true)} >Допустить к участию</Button>}
        </div>
        <ApplicationsTable 
          data={data ? data.items.map((item, index) => ({
            ...item,
            number: (currentPage - 1) * pageSize + index + 1
          })) : undefined}
          isLoading={isLoading || isFetching}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sort={localFilters.sort}
          sortDir={localFilters['sort-dir'] as 'asc' | 'desc' | undefined}
          onSortChange={handleSortChange}
          columns={getOrgCommitteeMainTableColumns(handleCheckboxChange, actualContest?.completed)}
          totalItems={data?.total}
          thStyle={{fontSize: 13}}
        />
      </Card>
      <TablePagination
        totalItems={data?.total || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        dataLength={data?.items?.length || 0}
      />
      {isShowAllowanceModal && <ModalAllowance hideModal={() => setIsShowAllowanceModal(false)}/>}
    </>
  )
};

export default OrgCommitteeMain;
