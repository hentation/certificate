import React from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal } from 'urfu-ui-kit-react';
import { Status } from '~/components/Status/Status';
import { formatDate } from '~/helpers/dateFormat';
import { downloadFile } from '~/helpers/downloadFile';
import type { CertificateRequest } from '~/models/certificates';
import { useUpdateCertificateStatusMutation, useDeleteAdminCertificateMutation } from '~/http/certificates';
import { useNotificationService } from '~/hooks/notificationService';
import { getFioByUserId, getPositionByUserId } from '~/services/auth.service';
import { useAppSelector } from '~/hooks/store';
import { logAction } from '~/services/auditService';

/* ---------- helpers ---------- */

const field = (label: string, value: React.ReactNode) => (
    <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{value}</div>
    </div>
);

const sectionTitle = (text: string) => (
    <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#1976D2',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '12px',
        paddingBottom: '6px',
        borderBottom: '1px solid #E5E7EB',
    }}>
        {text}
    </div>
);

/* ---------- стили action-кнопок ---------- */

const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, lineHeight: '1.4', whiteSpace: 'nowrap',
    transition: 'opacity .15s',
};
const btnBlue:   React.CSSProperties = { ...btnBase, background: '#1976D2', color: '#fff' };
const btnGreen:  React.CSSProperties = { ...btnBase, background: '#2E7D32', color: '#fff' };
const btnYellow: React.CSSProperties = { ...btnBase, background: '#F57C00', color: '#fff' };
const btnRed:    React.CSSProperties = { ...btnBase, background: '#C62828', color: '#fff' };
const btnGray:   React.CSSProperties = { ...btnBase, background: '#546E7A', color: '#fff' };

/* ---------- props ---------- */

interface Props {
    certificate: CertificateRequest;
    onClose: () => void;
    /** Если true — показывает кнопки управления статусом (панель кадровика) */
    isAdmin?: boolean;
}

/* ---------- компонент ---------- */

export const CertificateDetailModal: React.FC<Props> = ({ certificate, onClose, isAdmin = false }) => {
    const { showMessage } = useNotificationService();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateCertificateStatusMutation();
    const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminCertificateMutation();
    const [localCert, setLocalCert] = React.useState<CertificateRequest>(certificate);
    const authUser = useAppSelector(s => s.auth.user);
    const isSystemAdmin = authUser?.role === 'SYSTEM_ADMIN';

    const auditUser = {
        id:       authUser?.id       ?? 'unknown',
        fio:      authUser?.fio      ?? 'Неизвестный пользователь',
        position: authUser?.position ?? '—',
    };

    const handleSimple = async (status: string, label: string) => {
        const prevStatus = localCert.status;
        try {
            const updated = await updateStatus({ id: localCert.id, status }).unwrap();
            showMessage(`Статус изменён: «${label}»`);
            setLocalCert(updated);
            logAction(
                auditUser.id,
                auditUser.fio,
                auditUser.position,
                'Смена статуса',
                localCert.id,
                `${prevStatus} → ${status}`,
            );
        } catch {
            showMessage('Не удалось изменить статус', 'fail');
        }
    };

    const handleWithComment = async (status: string, label: string) => {
        const adminComment = window.prompt(`Комментарий для сотрудника (обязателен):`);
        if (adminComment === null) return;
        if (!adminComment.trim()) { showMessage('Комментарий не может быть пустым', 'fail'); return; }
        const prevStatus = localCert.status;
        try {
            const updated = await updateStatus({ id: localCert.id, status, adminComment: adminComment.trim() }).unwrap();
            showMessage(`Статус изменён: «${label}»`);
            setLocalCert(updated);
            logAction(
                auditUser.id,
                auditUser.fio,
                auditUser.position,
                'Смена статуса',
                localCert.id,
                `${prevStatus} → ${status}. Комментарий: ${adminComment.trim()}`,
            );
        } catch {
            showMessage('Не удалось изменить статус', 'fail');
        }
    };

    const apiBase = (import.meta.env.VITE_API_PATH as string) ?? '';
    const history = localCert.statusHistory ?? [];
    const files   = localCert.files ?? [];

    return (
        <Modal active onCancel={onClose} maxWidth="1000px">
            {/* Ограничиваем высоту и скроллим внутри, чтобы оверлей не съезжал */}
            <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', overflowX: 'hidden' }}>

            {/* Заголовок */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                    Заявка на справку
                </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9CA3AF' }}>
                    ID: {localCert.id}
                </p>
            </div>

            {/* Двухколоночный layout */}
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                {/* ── Левая колонка: информация + файлы ── */}
                <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    {sectionTitle('Информация о заявке')}

                    {field('Сотрудник', getFioByUserId(localCert.userId))}
                    {field('Должность', getPositionByUserId(localCert.userId))}
                    {field('Вид справки', localCert.certificateType)}
                    {field('Цель получения', localCert.purpose || '—')}
                    {field('Количество экземпляров', localCert.copies)}
                    {field('Статус', <Status section="certificates">{localCert.status}</Status>)}
                    {localCert.userComment && field('Комментарий заявителя',
                        <span style={{ whiteSpace: 'pre-wrap' }}>{localCert.userComment}</span>
                    )}
                    {localCert.adminComment && field('Комментарий сотрудника отдела кадров',
                        <span style={{ color: '#C62828', whiteSpace: 'pre-wrap' }}>{localCert.adminComment}</span>
                    )}
                    {field('Дата создания', formatDate(localCert.createdAt))}
                    {field('Последнее обновление', formatDate(localCert.updatedAt))}

                    {/* Файлы */}
                    <div style={{ marginTop: '20px' }}>
                        {sectionTitle('Прикреплённые документы')}
                        {files.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Файлы не прикреплены</p>
                        ) : (
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {files.map((f, i) => {
                                    const attachment = typeof f === 'string'
                                        ? { name: f, stored: '' }
                                        : f;
                                    const downloadUrl = attachment.stored
                                        ? `${apiBase}/certificates/files/${attachment.stored}`
                                        : null;
                                    return (
                                        <li key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '7px 12px', background: '#F3F4F6',
                                            borderRadius: '6px', fontSize: '13px',
                                        }}>
                                            <span style={{ fontSize: '16px' }}>📄</span>
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {attachment.name}
                                            </span>
                                            {downloadUrl ? (
                                                <button
                                                    onClick={() => {
                                                        downloadFile(downloadUrl, attachment.name);
                                                        logAction(
                                                            authUser?.id ?? 'unknown',
                                                            authUser?.fio ?? 'Неизвестный',
                                                            authUser?.position ?? '—',
                                                            'Скачивание файла',
                                                            localCert.id,
                                                            `Файл: ${attachment.name}`,
                                                        );
                                                    }}
                                                    style={{
                                                        flexShrink: 0,
                                                        fontSize: '12px',
                                                        color: '#1976D2',
                                                        fontWeight: 600,
                                                        padding: '3px 10px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #BFDBFE',
                                                        background: '#EFF6FF',
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ↓ Скачать
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', flexShrink: 0 }}>
                                                    недоступно
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── Правая колонка: кнопки (вверху) + история ── */}
                <div style={{ flex: '1 1 0', minWidth: 0 }}>

                    {/* Кнопки управления статусом — в самом верху, всегда видны */}
                    {isAdmin && (
                        <div style={{ marginBottom: '24px' }}>
                            {sectionTitle('Управление статусом')}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {localCert.status === 'Новая' && (
                                    <button style={btnBlue} disabled={isUpdating}
                                        onClick={() => handleSimple('В работе', 'В работу')}>
                                        ▶ В работу
                                    </button>
                                )}
                                {localCert.status === 'В работе' && (
                                    <>
                                        <button style={btnGreen} disabled={isUpdating}
                                            onClick={() => handleSimple('Готова', 'Готова')}>
                                            ✓ Готова
                                        </button>
                                        <button style={btnYellow} disabled={isUpdating}
                                            onClick={() => handleWithComment('На доработке', 'На доработку')}>
                                            ↩ На доработку
                                        </button>
                                        <button style={btnRed} disabled={isUpdating}
                                            onClick={() => handleWithComment('Отклонена', 'Отклонить')}>
                                            ✕ Отклонить
                                        </button>
                                    </>
                                )}
                                {localCert.status === 'Готова' && (
                                    <button style={btnGray} disabled={isUpdating}
                                        onClick={() => handleSimple('Выдана', 'Выдана')}>
                                        ✓ Выдана
                                    </button>
                                )}
                                {(localCert.status === 'Выдана' || localCert.status === 'Отклонена') && (
                                    <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', alignSelf: 'center' }}>
                                        Заявка завершена
                                    </span>
                                )}
                                {localCert.status === 'На доработке' && (
                                    <span style={{ fontSize: '13px', color: '#F57C00', fontStyle: 'italic', alignSelf: 'center' }}>
                                        Ожидание ответа от сотрудника
                                    </span>
                                )}
                            </div>

                            {/* Удалить — только для SYSTEM_ADMIN, отделено разделителем */}
                            {isSystemAdmin && (
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #FEE2E2' }}>
                                    <button
                                        style={{ ...btnRed, background: 'transparent', color: '#C62828', border: '1px solid #FECACA' }}
                                        disabled={isDeleting}
                                        onClick={async () => {
                                            const reason = window.prompt(
                                                'Причина удаления (обязательно):',
                                            );
                                            if (reason === null) return;
                                            if (!reason.trim()) {
                                                showMessage('Укажите причину удаления', 'fail');
                                                return;
                                            }
                                            try {
                                                await deleteAdmin(localCert.id).unwrap();
                                                logAction(
                                                    authUser?.id ?? 'unknown',
                                                    authUser?.fio ?? 'Неизвестный',
                                                    authUser?.position ?? '—',
                                                    'Удаление заявки',
                                                    localCert.id,
                                                    `Причина: ${reason.trim()}. Сотрудник: ${getFioByUserId(localCert.userId)}, тип: ${localCert.certificateType}`,
                                                );
                                                showMessage('Заявка удалена');
                                                onClose();
                                            } catch {
                                                showMessage('Не удалось удалить заявку', 'fail');
                                            }
                                        }}
                                    >
                                        🗑 Удалить заявку
                                    </button>
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#EF4444' }}>
                                        Только для системного администратора. Действие необратимо.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {sectionTitle('История изменений')}

                    {history.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>История пуста</p>
                    ) : (
                        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {history.map((entry, i) => {
                                const isLast = i === history.length - 1;
                                return (
                                    <li key={i} style={{ display: 'flex', gap: '12px' }}>
                                        {/* Вертикальная линия */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                                            <div style={{
                                                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                                                background: isLast ? '#1976D2' : '#D1D5DB',
                                                border: isLast ? '2px solid #1976D2' : '2px solid #D1D5DB',
                                                marginTop: '3px',
                                            }} />
                                            {!isLast && (
                                                <div style={{ flex: 1, width: '2px', background: '#E5E7EB', minHeight: '24px' }} />
                                            )}
                                        </div>
                                        {/* Содержимое */}
                                        <div style={{ paddingBottom: '16px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <Status section="certificates">{entry.status}</Status>
                                                <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                                                    {formatDate(entry.date)}
                                                </span>
                                            </div>
                                            {entry.comment && (
                                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>
                                                    {entry.comment}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>
            </div>

            </div>{/* /scroll-wrapper */}
        </Modal>
    );
};
