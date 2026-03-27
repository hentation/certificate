import { Link } from 'react-router-dom';
import { Status } from '~/components/Status/Status';
import paths from '~/routing/paths';
import type { CertificateRequest } from '~/models/certificates';
import { formatDate } from '~/helpers/dateFormat';
import type { TableColumn } from '~/components/Table/Table.types';

type Row = CertificateRequest & { number: number };

export const makeCertificatesTableColumns = (
    onDelete: (id: string) => void,
    onDetails: (row: CertificateRequest) => void,
): TableColumn<Row>[] => [
    {
        title: '№',
        field: 'number',
        render: (row) => <div className="tt">{row.number}</div>,
    },
    {
        title: 'Вид справки',
        field: 'certificateType',
        render: (row) => <div className="tt">{row.certificateType}</div>,
    },
    {
        title: 'Цель',
        field: 'purpose',
        render: (row) => <div className="tt">{row.purpose}</div>,
    },
    {
        title: 'Экз.',
        field: 'copies',
        render: (row) => <div className="tt">{row.copies}</div>,
    },
    {
        title: 'Статус',
        field: 'status',
        render: (row) => <Status section="certificates">{row.status}</Status>,
    },
    {
        title: 'Дата заказа',
        field: 'createdAt',
        render: (row) => <div className="tt">{formatDate(row.createdAt)}</div>,
    },
    {
        title: 'Действия',
        field: 'actions',
        render: (row) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => onDetails(row)}
                    style={{
                        width: '100px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: '5px 0', borderRadius: '6px', border: '1px solid #BFDBFE',
                        background: '#EFF6FF', color: '#1976D2',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        whiteSpace: 'nowrap', lineHeight: '1.4',
                    }}
                    title="Посмотреть детали заявки"
                >
                    Подробнее
                </button>

                {row.status === 'На доработке' && (
                    <Link
                        to={paths.certificates.edit(row.id)}
                        style={{
                            width: '100px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '5px 0', borderRadius: '6px', border: '1px solid #FEF08A',
                            background: '#FEFCE8', color: '#A16207',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            whiteSpace: 'nowrap', lineHeight: '1.4', textDecoration: 'none',
                        }}
                    >
                        Исправить
                    </Link>
                )}

                {row.status === 'Новая' && (
                    <button
                        onClick={() => onDelete(row.id)}
                        style={{
                            width: '100px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '5px 0', borderRadius: '6px', border: '1px solid #FECACA',
                            background: '#FEF2F2', color: '#C62828',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            whiteSpace: 'nowrap', lineHeight: '1.4',
                        }}
                        title="Отменить заявку"
                    >
                        Отменить
                    </button>
                )}
            </div>
        ),
    },
];
