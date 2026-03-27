import type { TableColumn } from '~/components/Table/Table.types';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Icon, Button, Tooltip } from 'urfu-ui-kit-react';
import type { Contest } from '~/models/contest';
import { formatDate } from '~/helpers/dateFormat';
import { colors } from '~/styles/colors';

export const periodsTableColumns: TableColumn<Contest & { onEdit?: (row: Contest) => void; onScore?: () => void; onDelete?: (row: Contest) => void; }>[] = [
  {
    title: 'Текущий',
    field: 'current',
    render: (rowData) => rowData.current ? <Icon className="upl22" name="ok" size="20px" color={colors.mainPrimary} /> : <></>,
    tdStyle: {lineHeight: '0px'},
  },
  {
    title: 'Год',
    field: 'year',
  },
  {
    title: 'Дата начала',
    field: 'beginning',
    render: (rowData) => formatDate(rowData.registrationPeriod.beginning),
  },
  {
    title: 'Дата окончания',
    field: 'ending',
    render: (rowData) => formatDate(rowData.registrationPeriod.ending),
  },
  {
    title: 'Действия',
    field: 'actions',
    render: (rowData) => <div className='udf ucg22'>
      {rowData.current && (
        <Button size="small" onClick={rowData.onScore}>Рассчитать баллы</Button>
      )}
      <div className='udf ucg8'>
        <Tooltip tooltipText="Редактировать" id={`${rowData.id}-edit-period`} portalOn>
          <Button
            size="small"
            variant="text-table"
            icon="pencil"
            iconOnly
            iconSize="20px"
            onClick={() => rowData.onEdit && rowData.onEdit(rowData)}
          ></Button>
        </Tooltip>
        <Tooltip tooltipText="Удалить" id={`${rowData.id}-delete-period`} portalOn>
          <Button size="small" variant="text-danger-table" icon="cross" iconOnly iconSize="20px" onClick={() => rowData.onDelete && rowData.onDelete(rowData)}></Button>
        </Tooltip>
      </div>
    </div>,
    cellStyle: {width: '268px'},
  },
]; 