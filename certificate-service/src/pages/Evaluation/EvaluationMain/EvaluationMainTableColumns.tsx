import type { TableColumn } from "~/components/Table/Table.types";
import type { ExpertiseApplication } from "~/models/expertise";
import { Link } from "react-router-dom";
import paths from "~/routing/paths";
export const evaluationMainTableColumns: TableColumn<ExpertiseApplication>[] = [
    { 
        title: '№',
        field: 'number',
        render: (rowData) => <div className='tt'>{rowData.number}</div>
    },
    {
        title: 'ФИО',
        field: 'fullName',
        key: 'fullName',
        sortOn: true,
        render: (rowData) => <Link to={`${paths.evaluation.application}/${rowData.id}`} className='u-link tt'>{rowData.fullName}</Link>
    },
    {
        title: 'Оценивание',
        field: 'hasScore',
        key: 'hasScore',
        sortOn: true,
        render: (rowData) => <div className='tt'>{rowData.hasScore ? "Да" : "Нет"}</div>
    },
    {
        title: 'Общий балл за эссе',
        field: '',
        key: '',
        sortOn: true,
        render: (rowData) => <div className='tt'>{rowData.essayScore ? rowData.essayScore : "Не сформирован"}</div>
    }
];