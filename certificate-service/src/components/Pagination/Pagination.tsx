import React from 'react';

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20];

function getPages(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
}

const navBtn = (
    active: boolean,
    disabled: boolean,
    onClick: () => void,
    children: React.ReactNode,
    title?: string,
): React.ReactElement => (
    <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        style={{
            minWidth: '36px',
            height: '36px',
            padding: '0 10px',
            borderRadius: '8px',
            border: active ? '2px solid #1976D2' : '1px solid #E5E7EB',
            background: active ? '#EFF6FF' : disabled ? '#F9FAFB' : '#fff',
            color: active ? '#1976D2' : disabled ? '#D1D5DB' : '#374151',
            fontWeight: active ? 700 : 400,
            fontSize: '14px',
            cursor: disabled ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background .15s, border-color .15s',
            lineHeight: 1,
        }}
    >
        {children}
    </button>
);

export const Pagination: React.FC<Props> = ({ page, pageSize, total, onChange, onPageSizeChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, total);

    const pages = getPages(page, totalPages);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            flexWrap: 'wrap',
            gap: '8px',
        }}>
            {/* Левая сторона: счётчик + выбор размера */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {total === 0 ? 'Нет записей' : `Показано ${from}–${to} из ${total}`}
                </span>

                {onPageSizeChange && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>по</span>
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <button
                                key={size}
                                onClick={() => { onPageSizeChange(size); onChange(1); }}
                                style={{
                                    height: '28px',
                                    minWidth: '36px',
                                    padding: '0 8px',
                                    borderRadius: '6px',
                                    border: size === pageSize ? '2px solid #1976D2' : '1px solid #E5E7EB',
                                    background: size === pageSize ? '#EFF6FF' : '#fff',
                                    color: size === pageSize ? '#1976D2' : '#6B7280',
                                    fontWeight: size === pageSize ? 700 : 400,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Правая сторона: кнопки навигации */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {navBtn(false, page === 1, () => onChange(page - 1), '←', 'Предыдущая страница')}

                    {pages.map((p, i) =>
                        p === '...'
                            ? <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#9CA3AF', fontSize: '14px', alignSelf: 'center' }}>…</span>
                            : navBtn(p === page, false, () => onChange(p as number), p)
                    )}

                    {navBtn(false, page === totalPages, () => onChange(page + 1), '→', 'Следующая страница')}
                </div>
            )}
        </div>
    );
};
