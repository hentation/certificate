import { Link } from 'react-router-dom';
import { Status } from '~/components/Status/Status';
import paths from '~/routing/paths';
import type { Application } from '~/models/user';
import { formatDate } from '~/helpers/dateFormat';
import type { TableColumn } from '~/components/Table/Table.types';

export const myApplicationsTableColumns: TableColumn<Application>[] = [
    { 
        title: '№',
        field: 'number',
        render: (rowData) => <div className='tt'>{rowData.number}</div>
    },
    { 
        title: 'Год',
        field: 'year',
        render: (rowData) => <Link to={`${paths.myApplications.read}/${rowData.id}`} className='u-link tt'>{rowData.year}</Link>
    },
    { 
        title: 'Статус',
        field: 'statusTitle',
        render: (rowData) => <Status section='myApplications' >{rowData.statusTitle}</Status>
    },
    { 
        title: 'Направление',
        field: 'directionTitle',
        render: (rowData) => <div className='tt'>{rowData.directionTitle}</div>
    },
    { 
        title: 'Дата подачи',
        field: 'sentAt',
        render: (rowData) => rowData.sentAt ? <div className='tt'>{formatDate(rowData.sentAt)}</div> : ""
    },
];