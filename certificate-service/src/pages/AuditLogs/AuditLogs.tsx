import { useState, useMemo, useEffect, useCallback } from 'react';
import { Title } from '~/components/Title/Title';
import { Card } from '~/components/Card/Card';
import { Table } from '~/components/Table/Table';
import { Pagination } from '~/components/Pagination/Pagination';
import { formatDate } from '~/helpers/dateFormat';
import { toShortFio } from '~/services/auth.service';
import { loadAuditLogs, clearAuditLogs } from '~/services/auditService';
import type { AuditEntry, AuditActionType } from '~/services/auditService';
import type { TableColumn } from '~/components/Table/Table.types';

/* ─── Визуальные настройки действий ─────────────────────────────────── */

const ACTION_META: Record<AuditActionType, { bg: string; color: string }> = {
    'Создание заявки':       { bg: '#EFF6FF', color: '#1565C0' },
    'Смена статуса':         { bg: '#DBEAFE', color: '#1976D2' },
    'Редактирование заявки': { bg: '#F0FDF4', color: '#166534' },
    'Удаление заявки':       { bg: '#FEF2F2', color: '#C62828' },
    'Загрузка файла':        { bg: '#F5F3FF', color: '#6D28D9' },
    'Скачивание файла':      { bg: '#ECFDF5', color: '#065F46' },
    'Вход в систему':        { bg: '#F0F9FF', color: '#0369A1' },
    'Выход из системы':      { bg: '#F9FAFB', color: '#6B7280' },
};

/** Типы, скрытые из журнала (технические сессионные события) */
const HIDDEN_ACTIONS: AuditActionType[] = ['Вход в систему', 'Выход из системы'];

const VISIBLE_ACTION_TYPES = (Object.keys(ACTION_META) as AuditActionType[])
    .filter(a => !HIDDEN_ACTIONS.includes(a));

type Row = AuditEntry & { number: number };

/* ─── Модаль «Подробнее» ─────────────────────────────────────────────── */

const AuditDetailModal = ({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) => {
    const m = ACTION_META[entry.action] ?? { bg: '#F3F4F6', color: '#374151' };

    const row = (label: string, value: React.ReactNode) => (
        <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ width: '160px', flexShrink: 0, fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
                {label}
            </div>
            <div style={{ fontSize: '14px', color: '#111827', wordBreak: 'break-word' }}>
                {value}
            </div>
        </div>
    );

    return (
        /* Оверлей */
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
            }}
        >
            {/* Карточка — стоп-пропагация клика */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: '16px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                    width: '100%', maxWidth: '560px',
                    maxHeight: '90vh', overflowY: 'auto',
                    padding: '32px',
                }}
            >
                {/* Шапка */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Запись журнала</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9CA3AF', fontFamily: 'monospace' }}>
                            ID: {entry.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '20px', color: '#9CA3AF', lineHeight: 1, padding: '0 4px',
                        }}
                        title="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {/* Детали */}
                <div>
                    {row('Дата и время', formatDate(entry.date))}
                    {row('Пользователь',
                        <span>
                            <span style={{ fontWeight: 600 }}>{toShortFio(entry.userFio)}</span>
                            <span style={{ color: '#9CA3AF', fontSize: '12px', marginLeft: '8px' }}>
                                ({entry.userId})
                            </span>
                        </span>
                    )}
                    {row('Полное ФИО', entry.userFio)}
                    {row('Должность', entry.userPosition || '—')}
                    {row('Действие',
                        <span style={{
                            display: 'inline-block', padding: '3px 12px',
                            borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                            background: m.bg, color: m.color,
                        }}>
                            {entry.action}
                        </span>
                    )}
                    {row('Объект (ID)',
                        entry.objectId === '—'
                            ? <span style={{ color: '#9CA3AF' }}>—</span>
                            : <span style={{ fontFamily: 'monospace', fontSize: '13px', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>
                                {entry.objectId}
                            </span>
                    )}
                    {row('Комментарий',
                        entry.comment
                            ? <span style={{ whiteSpace: 'pre-wrap' }}>{entry.comment}</span>
                            : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Нет</span>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '24px', width: '100%', height: '42px',
                        borderRadius: '10px', border: '1px solid #E5E7EB',
                        background: '#F9FAFB', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 600, color: '#374151',
                    }}
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
};

/* ─── Основной компонент ─────────────────────────────────────────────── */

const AuditLogs = () => {
    const [logs, setLogs]               = useState<AuditEntry[]>([]);
    const [page, setPage]               = useState(1);
    const [pageSize, setPageSize]       = useState(10);
    const [actionFilter, setAction]     = useState<AuditActionType | ''>('');
    const [search, setSearch]           = useState('');
    const [selected, setSelected]       = useState<AuditEntry | null>(null);

    /* Загружаем из localStorage */
    const refresh = useCallback(() => setLogs(loadAuditLogs()), []);

    useEffect(() => {
        refresh();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'certificate_service_audit_logs') refresh();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [refresh]);

    /* Фильтрация + сортировка */
    const filtered = useMemo<Row[]>(() => {
        // Скрываем сессионные события
        let list = logs.filter(l => !HIDDEN_ACTIONS.includes(l.action));

        if (actionFilter)
            list = list.filter(l => l.action === actionFilter);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(l =>
                l.userFio.toLowerCase().includes(q) ||
                toShortFio(l.userFio).toLowerCase().includes(q) ||
                l.userId.toLowerCase().includes(q)  ||
                l.objectId.toLowerCase().includes(q)||
                l.comment.toLowerCase().includes(q),
            );
        }

        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return list.map((item, i) => ({ ...item, number: i + 1 }));
    }, [logs, actionFilter, search]);

    const pageRows = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page, pageSize],
    );

    const setFilter = (fn: () => void) => { fn(); setPage(1); };

    /* ─── Колонки ─── */

    const columns: TableColumn<Row>[] = [
        {
            title: '№',
            field: 'number',
            thStyle: { width: '52px' },
            render: (row) => (
                <span style={{ fontWeight: 500, color: '#9CA3AF', fontSize: '13px' }}>{row.number}</span>
            ),
        },
        {
            title: 'Дата и время',
            field: 'date',
            thStyle: { width: '148px' },
            render: (row) => (
                <span style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {formatDate(row.date)}
                </span>
            ),
        },
        {
            title: 'Пользователь',
            field: 'userFio',
            render: (row) => (
                <div>
                    <span title={row.userFio} style={{ fontSize: '13px', fontWeight: 500, cursor: 'default', whiteSpace: 'nowrap', display: 'block' }}>
                        {toShortFio(row.userFio)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {row.userPosition || '—'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Действие',
            field: 'action',
            render: (row) => {
                const m = ACTION_META[row.action] ?? { bg: '#F3F4F6', color: '#374151' };
                return (
                    <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 700,
                        background: m.bg, color: m.color, whiteSpace: 'nowrap',
                    }}>
                        {row.action}
                    </span>
                );
            },
        },
        {
            title: 'Объект',
            field: 'objectId',
            render: (row) => (
                <span style={{
                    fontFamily: row.objectId === '—' ? 'inherit' : 'monospace',
                    fontSize: '12px',
                    background: row.objectId === '—' ? 'transparent' : '#F3F4F6',
                    padding: row.objectId === '—' ? '0' : '2px 6px',
                    borderRadius: '4px', color: '#374151',
                }}>
                    {row.objectId === '—' ? '—' : row.objectId.slice(0, 12) + '…'}
                </span>
            ),
        },
        {
            title: 'Комментарий',
            field: 'comment',
            render: (row) => (
                <span style={{ fontSize: '13px', color: '#6B7280',
                    maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'inline-block', whiteSpace: 'nowrap',
                }}>
                    {row.comment || '—'}
                </span>
            ),
        },
        {
            title: '',
            field: 'id',
            thStyle: { width: '100px' },
            render: (row) => (
                <button
                    onClick={() => setSelected(row)}
                    style={{
                        padding: '5px 12px', borderRadius: '6px',
                        border: '1px solid #BFDBFE', background: '#EFF6FF',
                        color: '#1976D2', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                >
                    Подробнее
                </button>
            ),
        },
    ];

    /* ─── Стили ─── */

    const inputStyle: React.CSSProperties = {
        height: '44px', padding: '0 14px',
        borderRadius: '8px', border: '1px solid #D1D5DB',
        fontSize: '13px', fontFamily: 'inherit',
        outline: 'none', background: '#fff',
        boxSizing: 'border-box',
    };

    const TODAY = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const isEmpty = logs.length === 0;

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <Title>Журнал аудита</Title>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Сегодня: {TODAY}</span>
            </div>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px', marginTop: 0 }}>
                Полная история действий пользователей в системе
            </p>

            <Card style={{ display: 'flex', flexDirection: 'column', rowGap: '16px' }}>

                {/* Панель фильтров */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        placeholder="Поиск по ФИО, объекту, комментарию…"
                        value={search}
                        onChange={e => setFilter(() => setSearch(e.target.value))}
                        style={{ ...inputStyle, flex: 2, minWidth: '200px' }}
                    />
                    <select
                        value={actionFilter}
                        onChange={e => setFilter(() => setAction(e.target.value as AuditActionType | ''))}
                        style={{ ...inputStyle, flex: 1, minWidth: '180px', cursor: 'pointer' }}
                    >
                        <option value="">Все действия</option>
                        {VISIBLE_ACTION_TYPES.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    {!isEmpty && (
                        <button
                            onClick={() => {
                                if (!window.confirm('Очистить весь журнал аудита? Это действие необратимо.')) return;
                                clearAuditLogs();
                                setLogs([]);
                            }}
                            style={{
                                height: '44px', padding: '0 16px',
                                borderRadius: '8px', border: '1px solid #FECACA',
                                background: '#FEF2F2', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, color: '#C62828',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                flexShrink: 0,
                            }}
                        >
                            🗑 Очистить журнал
                        </button>
                    )}

                    <span style={{ fontSize: '13px', color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                        Записей: {filtered.length} / {logs.length}
                    </span>
                </div>

                {/* Пустое состояние */}
                {isEmpty && (
                    <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF', fontSize: '14px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Журнал пуст</div>
                        <div style={{ fontSize: '13px' }}>
                            Действия будут появляться после смены статусов заявок или их удаления
                        </div>
                    </div>
                )}

                {!isEmpty && (
                    <>
                        <Table<Row>
                            data={pageRows}
                            columns={columns}
                            messageForEmptyTable="По заданным фильтрам записей не найдено."
                        />
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={filtered.length}
                            onChange={setPage}
                            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                        />
                    </>
                )}
            </Card>

            {/* Модаль подробнее */}
            {selected && (
                <AuditDetailModal
                    entry={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
};

export default AuditLogs;
