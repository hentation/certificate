import { Link } from 'react-router-dom';
import { formatDateToLocal } from '~/helpers/dateFormat';
import type { AuditionApplication } from '~/models/audition';
import paths from '~/routing/paths';



export const auditionMainTableColumns = [
    { 
        title: '№',
        field: 'number',
        render: (rowData: AuditionApplication) => <div className='tt'>{rowData.number}</div>,
        width: 80
    },
    { 
        title: 'Время',
        field: 'createdAt',
        sortOn: true,
        render: (rowData: AuditionApplication) => <div className='tt'>{formatDateToLocal(rowData.createdAt)}</div>,
        width: 160
    },
    { 
        title: 'Пользователь',
        field: 'username',
        sortOn: true,
        render: (rowData: AuditionApplication) => <div className='tt'>{rowData.username || '-'}</div>,
        width: 155
    },
    { 
        title: 'IP',
        field: 'ipAddress',
        sortOn: true,
        render: (rowData: AuditionApplication) => <div className='tt'>{rowData.ipAddress || '-'}</div>,
        width: 120
    },
    { 
        title: 'Действия',
        field: 'source',
        sortOn: true,
        render: (rowData: AuditionApplication) => <div className='tt' style={{overflowWrap: 'break-word'}}>{rowData.source}</div>,
        width: 233
    },
    { 
        title: 'Описание',
        field: 'message',
        sortOn: false,
        render: (rowData: AuditionApplication) => <div className='tt'>{rowData.message}</div>,
        width: 233
    },
    { 
        title: 'Доп. Информация',
        field: 'info',
        sortOn: false,
        render: (rowData: AuditionApplication) => rowData.parameters?.applicationId ? <Link to={`${paths.orgCommittee.application}/${rowData.parameters?.applicationId}`} className='u-link tt'>{rowData.parameters?.applicationId}</Link> : <div className='tt'>-</div>,
        width: 155
    },
];