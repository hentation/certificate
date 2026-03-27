import { Link } from 'react-router-dom';
import { Status } from '~/components/Status/Status';
import paths from '~/routing/paths';
import { formatDate } from '~/helpers/dateFormat';
import type { ModerationApplication } from '~/models/moderation';

export const moderationMainTableColumns = [
    { 
        title: '№',
        field: 'number',
        render: (rowData: ModerationApplication) => <div className='tt'>{rowData.number}</div>,
    },
    { 
        title: 'ФИО',
        field: 'fullName',
        sortOn: true,
        render: (rowData: ModerationApplication) => <Link to={`${paths.moderation.application}/${rowData.id}`} className='u-link tt'>{rowData.fullName}</Link>
    },
    { 
        title: 'Статус',
        field: 'status',
        sortOn: true,
        render: (rowData: ModerationApplication) => <Status section='moderation'>{rowData.status}</Status>,
    },
    { 
        title: 'Направление',
        field: 'directionTitle',
        sortOn: true,
        render: (rowData: ModerationApplication) => <div className='tt'>{rowData.directionTitle}</div>,
    },
    { 
        title: 'Дата подачи',
        field: 'sentAt',
        sortOn: true,
        render: (rowData: ModerationApplication) => <div className='tt'>{formatDate(rowData.sentAt)}</div>,
    },
];