import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Message, Search, Button } from 'urfu-ui-kit-react';
import { Title } from '~/components/Title/Title';
import { Card } from '~/components/Card/Card';
import { Table } from '~/components/Table/Table';
import { Status } from '~/components/Status/Status';
import { Pagination } from '~/components/Pagination/Pagination';
import { CertificateDetailModal } from '../CertificateDetailModal/CertificateDetailModal';
import { useGetAllCertificatesQuery } from '~/http/certificates';
import { useAppSelector } from '~/hooks/store';
import { formatDate } from '~/helpers/dateFormat';
import { getShortFioByUserId, getFioByUserId, toShortFio, getPositionByUserId } from '~/services/auth.service';
import type { CertificateRequest } from '~/models/certificates';
import type { TableColumn } from '~/components/Table/Table.types';

type Row = CertificateRequest & { number: number };
type SortDir = 'asc' | 'desc';
type SortField = 'userId' | 'certificateType' | 'status' | 'createdAt' | 'position' | undefined;

const TODAY = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
});

const STATUS_OPTIONS = [
    { label: 'Новая',        value: 'Новая' },
    { label: 'В работе',     value: 'В работе' },
    { label: 'На доработке', value: 'На доработке' },
    { label: 'Готова',       value: 'Готова' },
    { label: 'Выдана',       value: 'Выдана' },
    { label: 'Отклонена',    value: 'Отклонена' },
];

/* ---------- стиль кнопки "Подробнее" ---------- */

const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    transition: 'opacity .15s',
    fontSize: 'inherit',
};

/* ---------- xlsx-экспорт ---------- */

function exportToXlsx(rows: Row[]) {
    const wsData = [
        ['ФИО', 'Должность', 'Тип справки', 'Статус', 'Дата подачи'],
        ...rows.map(r => [
            getFioByUserId(r.userId),
            getPositionByUserId(r.userId),
            r.certificateType,
            r.status,
            formatDate(r.createdAt),
        ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 28 }, { wch: 24 }, { wch: 36 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Справки');
    XLSX.writeFile(wb, `certificates_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

const filterInputStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid #D3D3D3',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    cursor: 'pointer',
    outline: 'none',
    background: '#fff',
    flex: 1,
    minWidth: 0,
};

/* ---------- компонент ---------- */

const CertificatesAdmin = () => {
    const { data, isLoading, error } = useGetAllCertificatesQuery();
    const authUser = useAppSelector(s => s.auth.user);
    const isSystemAdmin = authUser?.role === 'SYSTEM_ADMIN';

    const [search, setSearch]           = useState('');
    const [statusFilter, setStatus]     = useState('');
    const [dateFrom, setDateFrom]       = useState('');
    const [dateTo, setDateTo]           = useState('');
    const [sortField, setSortField]     = useState<SortField>(undefined);
    const [sortDir, setSortDir]         = useState<SortDir>('desc');
    const [page, setPage]               = useState(1);
    const [pageSize, setPageSize]       = useState(10);
    const [selected, setSelected]       = useState<CertificateRequest | null>(null);

    const resetPage = () => setPage(1);

    const handleSort = (field?: string, dir?: SortDir) => {
        // Когда Table передаёт (undefined, undefined) — пользователь сбрасывает сортировку.
        // Сохраняем undefined чтобы Table видел «нет активного поля» и следующий
        // клик корректно начинал цикл заново с 'asc', а не попадал в ветку «убрать».
        setSortField(field ? (field as SortField) : undefined);
        setSortDir(dir ?? 'desc');
        resetPage();
    };

    /* фильтрация + сортировка */
    const filteredData = useMemo<Row[]>(() => {
        let result = data ?? [];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(r => {
                const fullFio   = getFioByUserId(r.userId).toLowerCase();
                const shortFio  = toShortFio(getFioByUserId(r.userId)).toLowerCase();
                const userId    = r.userId.toLowerCase();
                return fullFio.includes(q) || shortFio.includes(q) || userId.includes(q);
            });
        }

        if (statusFilter)
            result = result.filter(r => r.status === statusFilter);

        if (dateFrom) {
            const from = new Date(dateFrom).setHours(0, 0, 0, 0);
            result = result.filter(r => new Date(r.createdAt).getTime() >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo).setHours(23, 59, 59, 999);
            result = result.filter(r => new Date(r.createdAt).getTime() <= to);
        }

        // При sortField=undefined сортируем по умолчанию (новые сверху)
        const field = sortField ?? 'createdAt';
        const dir   = sortField ? sortDir : 'desc';
        return [...result]
            .sort((a, b) => {
                let cmp = 0;
                if (field === 'createdAt') {
                    cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                } else if (field === 'position') {
                    cmp = getPositionByUserId(a.userId).localeCompare(
                        getPositionByUserId(b.userId), 'ru');
                } else {
                    cmp = String(a[field as keyof CertificateRequest]).localeCompare(
                        String(b[field as keyof CertificateRequest]), 'ru');
                }
                return dir === 'desc' ? -cmp : cmp;
            })
            .map((item, index) => ({ ...item, number: index + 1 }));
    }, [data, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

    /* пагинация — срез текущей страницы */
    const processedData = useMemo<Row[]>(
        () => filteredData.slice((page - 1) * pageSize, page * pageSize),
        [filteredData, page, pageSize],
    );

    const columns: TableColumn<Row>[] = [
        {
            title: '№',
            field: 'number',
            thStyle: { width: '48px' },
            render: (row) => <span style={{ fontWeight: 500 }}>{row.number}</span>,
        },
        {
            title: 'Сотрудник',
            field: 'userId',
            sortOn: true,
            render: (row) => (
                <span
                    title={getFioByUserId(row.userId)}
                    style={{ whiteSpace: 'nowrap', cursor: 'default' }}
                >
                    {getShortFioByUserId(row.userId)}
                </span>
            ),
        },
        {
            title: 'Должность',
            field: 'position',
            sortOn: true,
            render: (row) => (
                <span style={{ whiteSpace: 'nowrap' }}>
                    {getPositionByUserId(row.userId)}
                </span>
            ),
        },
        {
            title: 'Тип справки',
            field: 'certificateType',
            sortOn: true,
            render: (row) => <span>{row.certificateType}</span>,
        },
        {
            title: 'Статус',
            field: 'status',
            sortOn: true,
            render: (row) => <Status section="certificates">{row.status}</Status>,
        },
        {
            title: 'Дата подачи',
            field: 'createdAt',
            sortOn: true,
            render: (row) => (
                <span style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(row.createdAt)}
                </span>
            ),
        },
        {
            title: 'Действия',
            field: 'actions',
            render: (row) => (
                <button
                    style={{ ...btnBase, background: '#EFF6FF', color: '#1976D2', border: '1px solid #BFDBFE' }}
                    title="Открыть детали и управление"
                    onClick={() => setSelected(row)}
                >
                    Подробнее
                </button>
            ),
        },
    ];

    const hasFilters = !!(search || statusFilter || dateFrom || dateTo);

    /* При закрытии модалки после смены статуса RTK Query сам обновит кеш,
       но selected ссылается на старый объект — сбрасываем. */
    const handleModalClose = () => setSelected(null);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <Title>
                    {isSystemAdmin ? 'Панель администратора: Реестр заявок' : 'Реестр заявок'}
                </Title>
                <span style={{ fontSize: '13px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    Сегодня: {TODAY}
                </span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px', marginTop: 0 }}>
                Управление всеми заявками на справки сотрудников
            </p>

            {isLoading && <Preloader variant="large-primary" />}
            {error && (
                <Message variant="fail">
                    Ошибка при загрузке заявок. Попробуйте обновить страницу.
                </Message>
            )}

            {!isLoading && !error && (
                <Card style={{ display: 'flex', flexDirection: 'column', rowGap: '16px' }}>

                    {/* ── Панель фильтров ─────────────────────────────── */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        gap: '12px',
                        marginBottom: '24px',
                    }}>
                        {/* Поиск */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Search
                                placeholder="Введите ФИО"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSearch(e.target.value);
                                    resetPage();
                                }}
                            />
                        </div>

                        {/* Статус — нативный select для надёжного управляемого состояния */}
                        <select
                            value={statusFilter}
                            onChange={e => { setStatus(e.target.value); resetPage(); }}
                            style={{ ...filterInputStyle, color: statusFilter ? '#222' : '#9CA3AF' }}
                        >
                            <option value="">Все статусы</option>
                            {STATUS_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        {/* Дата: от */}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); resetPage(); }}
                            title="Дата начала (от)"
                            style={{ ...filterInputStyle, color: dateFrom ? '#222' : '#9CA3AF' }}
                        />

                        {/* Дата: до */}
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => { setDateTo(e.target.value); resetPage(); }}
                            title="Дата окончания (до)"
                            style={{ ...filterInputStyle, color: dateTo ? '#222' : '#9CA3AF' }}
                        />

                        {/* Кнопка экспорта — выгружает все отфильтрованные записи, не только текущую страницу */}
                        <div style={{ flexShrink: 0 }}>
                            <Button
                                icon="download"
                                onClick={() => exportToXlsx(filteredData)}
                                disabled={filteredData.length === 0}
                            >
                                Выгрузить в Excel
                            </Button>
                        </div>
                    </div>

                    {/* счётчик результатов */}
                    <span style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
                        Найдено: {filteredData.length}
                    </span>

                    <Table<Row>
                        data={processedData}
                        columns={columns}
                        cellStyle={{ fontSize: '13px' }}
                        sort={sortField}
                        sortDir={sortDir}
                        onSortChange={handleSort}
                        messageForEmptyTable={
                            hasFilters
                                ? 'По заданным фильтрам ничего не найдено.'
                                : 'Заявок пока нет.'
                        }
                    />

                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={filteredData.length}
                        onChange={setPage}
                        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                    />
                </Card>
            )}

            {selected && (
                <CertificateDetailModal
                    certificate={selected}
                    onClose={handleModalClose}
                    isAdmin
                />
            )}
        </div>
    );
};

export default CertificatesAdmin;
