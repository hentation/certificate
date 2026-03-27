import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Select, Preloader, Message } from 'urfu-ui-kit-react';
import { Title } from '~/components/Title/Title';
import { Card } from '~/components/Card/Card';
import { BackButton } from '~/components/BackButton/BackButton';
import {
    useGetCertificateByIdQuery,
    useUpdateCertificateMutation,
    useUploadCertificateFileMutation,
} from '~/http/certificates';
import { useNotificationService } from '~/hooks/notificationService';
import { useAppSelector } from '~/hooks/store';
import { downloadFile } from '~/helpers/downloadFile';
import { logAction } from '~/services/auditService';
import { CERTIFICATE_TYPES } from '~/models/certificates';
import type { CertificateType, FileAttachment } from '~/models/certificates';
import paths from '~/routing/paths';

const CERTIFICATE_TYPE_OPTIONS = CERTIFICATE_TYPES.map((t) => ({ label: t, value: t }));
const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return `«${file.name}» — недопустимый формат. Разрешены: PDF, JPG, PNG`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return `«${file.name}» превышает ${MAX_FILE_SIZE_MB} МБ`;
    }
    return null;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D0D0D0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    marginBottom: '6px',
    fontSize: '14px',
    color: '#222222',
};

const CertificatesEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showMessage } = useNotificationService();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authUser = useAppSelector(s => s.auth.user);

    const { data: certificate, isLoading: isLoadingData } = useGetCertificateByIdQuery(id!);
    const [updateCertificate, { isLoading: isUpdating }] = useUpdateCertificateMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadCertificateFileMutation();

    const [certificateType, setCertificateType] = useState<{ label: string; value: string } | undefined>();
    const [purpose, setPurpose]     = useState('');
    const [copies, setCopies]       = useState(1);
    const [userComment, setComment] = useState('');

    /* Файлы, уже прикреплённые к заявке (можно только удалить или скачать) */
    const [keepFiles, setKeepFiles] = useState<FileAttachment[]>([]);

    /* Новые файлы, выбранные пользователем (ещё не загружены на сервер) */
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isDragOver, setDragOver] = useState(false);

    const apiBase = (import.meta.env.VITE_API_PATH as string) ?? '';

    // Заполняем форму данными из загруженной заявки
    useEffect(() => {
        if (certificate) {
            setCertificateType({ label: certificate.certificateType, value: certificate.certificateType });
            setPurpose(certificate.purpose);
            setCopies(certificate.copies);
            setComment('');
            // Загружаем только файлы с полем stored (загруженные через новый механизм)
            const uploaded = (certificate.files ?? []).filter(
                (f): f is FileAttachment => typeof f === 'object' && !!f.stored,
            );
            setKeepFiles(uploaded);
        }
    }, [certificate]);

    // Если заявка не «На доработке» — перенаправляем на список
    useEffect(() => {
        if (certificate && certificate.status !== 'На доработке') {
            showMessage('Редактировать можно только заявку со статусом «На доработке»', 'fail');
            navigate(paths.certificates.main);
        }
    }, [certificate, navigate, showMessage]);

    const totalFiles = keepFiles.length + newFiles.length;

    const addFiles = useCallback((incoming: File[]) => {
        const valid: File[] = [];
        for (const file of incoming) {
            const err = validateFile(file);
            if (err) { showMessage(err, 'fail'); continue; }
            valid.push(file);
        }
        setNewFiles(prev => {
            const combined = [...prev, ...valid];
            const slots = MAX_FILES - keepFiles.length;
            if (combined.length > slots) {
                showMessage(`Максимум ${MAX_FILES} файлов`, 'fail');
                return combined.slice(0, slots);
            }
            return combined;
        });
    }, [showMessage, keepFiles.length]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files ?? []));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (totalFiles >= MAX_FILES) return;
        addFiles(Array.from(e.dataTransfer.files));
    };

    const removeKeepFile = (index: number) => {
        setKeepFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!certificateType) {
            showMessage('Выберите вид справки', 'fail');
            return;
        }
        if (copies < 1 || copies > 10) {
            showMessage('Количество экземпляров должно быть от 1 до 10', 'fail');
            return;
        }
        try {
            // Загружаем новые файлы на сервер
            const uploaded = await Promise.all(
                newFiles.map((file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return uploadFile(fd).unwrap();
                }),
            );

            await updateCertificate({
                id: id!,
                body: {
                    certificateType: certificateType.value as CertificateType,
                    purpose: purpose.trim() || 'По месту требования',
                    copies,
                    files: [...keepFiles, ...uploaded],
                    userComment: userComment.trim() || undefined,
                },
            }).unwrap();

            logAction(
                authUser?.id ?? 'unknown',
                authUser?.fio ?? 'Неизвестный',
                authUser?.position ?? '—',
                'Редактирование заявки',
                id!,
                `${certificateType.value}, ${copies} экз.${userComment.trim() ? '. Комментарий: ' + userComment.trim() : ''}`,
            );

            if (uploaded.length > 0) {
                logAction(
                    authUser?.id ?? 'unknown',
                    authUser?.fio ?? 'Неизвестный',
                    authUser?.position ?? '—',
                    'Загрузка файла',
                    id!,
                    `Новых файлов: ${uploaded.length} (${uploaded.map(f => f.name).join(', ')})`,
                );
            }

            showMessage('Заявка обновлена и отправлена на повторное рассмотрение');
            navigate(paths.certificates.main);
        } catch {
            showMessage('Не удалось обновить заявку', 'fail');
        }
    };

    if (isLoadingData || isUpdating || isUploading) return <Preloader variant="large-primary" />;

    return (
        <div style={{ position: 'relative' }}>
            <BackButton to={paths.certificates.main}>Мои заявки на справки</BackButton>
            <Title>Исправить заявку</Title>

            {certificate?.adminComment && (
                <Message style={{ marginBottom: '20px' }}>
                    <strong>Комментарий сотрудника отдела кадров:</strong> {certificate.adminComment}
                </Message>
            )}

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>

                    <Select
                        onChange={(option: { label: string; value: string }) => setCertificateType(option)}
                        options={CERTIFICATE_TYPE_OPTIONS}
                        required
                        title="Вид справки"
                        value={certificateType}
                        placeholder="Выберите вид справки"
                    />

                    <div>
                        <div style={labelStyle}>Цель получения</div>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="По месту требования"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <div style={labelStyle}>
                            Количество экземпляров <span style={{ color: 'red' }}>*</span>
                        </div>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={copies}
                            onChange={(e) => setCopies(Number(e.target.value))}
                            style={{ ...inputStyle, width: '100px' }}
                        />
                    </div>

                    {/* ── Предыдущий комментарий (только просмотр) ── */}
                    {certificate?.userComment && (
                        <div>
                            <div style={{ ...labelStyle, color: '#6B7280' }}>
                                Ваш предыдущий комментарий
                            </div>
                            <div style={{
                                padding: '10px 12px',
                                background: '#F9FAFB',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#6B7280',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap',
                            }}>
                                {certificate.userComment}
                            </div>
                        </div>
                    )}

                    {/* ── Новый комментарий ── */}
                    <div>
                        <div style={labelStyle}>
                            {certificate?.userComment ? 'Новый комментарий' : 'Комментарий к заявке'}
                        </div>
                        <textarea
                            value={userComment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Укажите, что было исправлено или добавьте пояснения..."
                            maxLength={1000}
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: '1.5',
                            }}
                        />
                    </div>

                    {/* ── Управление файлами ── */}
                    <div>
                        <div style={labelStyle}>
                            Прикреплённые документы
                            <span style={{ color: '#9CA3AF', fontSize: '12px', marginLeft: '8px' }}>
                                (до {MAX_FILES} файлов)
                            </span>
                        </div>

                        {/* Существующие файлы */}
                        {keepFiles.length > 0 && (
                            <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {keepFiles.map((f, i) => {
                                    const downloadUrl = `${apiBase}/certificates/files/${f.stored}`;
                                    return (
                                        <li key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '8px 12px', background: '#F0FDF4',
                                            borderRadius: '6px', fontSize: '13px',
                                            border: '1px solid #BBF7D0',
                                        }}>
                                            <span style={{ fontSize: '16px' }}>📄</span>
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#166534' }}>
                                                {f.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => downloadFile(downloadUrl, f.name)}
                                                title="Скачать файл"
                                                style={{
                                                    background: 'none', border: '1px solid #BBF7D0',
                                                    borderRadius: '5px', cursor: 'pointer',
                                                    color: '#16A34A', fontSize: '12px', fontWeight: 600,
                                                    padding: '2px 10px', whiteSpace: 'nowrap',
                                                }}
                                            >
                                                ↓ Скачать
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeKeepFile(i)}
                                                title="Удалить файл из заявки"
                                                style={{
                                                    background: 'none', border: 'none',
                                                    cursor: 'pointer', color: '#C62828',
                                                    fontSize: '16px', lineHeight: 1, padding: '0 2px',
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Новые файлы (ещё не загружены) */}
                        {newFiles.length > 0 && (
                            <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {newFiles.map((file, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '8px 12px', background: '#F3F4F6',
                                        borderRadius: '6px', fontSize: '13px',
                                    }}>
                                        <span style={{ fontSize: '16px' }}>📎</span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </span>
                                        <span style={{ color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            {(file.size / 1024).toFixed(0)} КБ · новый
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(i)}
                                            title="Убрать из списка"
                                            style={{
                                                background: 'none', border: 'none',
                                                cursor: 'pointer', color: '#C62828',
                                                fontSize: '16px', lineHeight: 1, padding: '0 2px',
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Зона добавления + перетаскивания */}
                        <div
                            onClick={() => totalFiles < MAX_FILES && fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); if (totalFiles < MAX_FILES) setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragOver ? '#1976D2' : '#D3D3D3'}`,
                                borderRadius: '10px',
                                padding: '20px 16px',
                                textAlign: 'center',
                                cursor: totalFiles >= MAX_FILES ? 'not-allowed' : 'pointer',
                                color: isDragOver ? '#1976D2' : '#748AB9',
                                fontSize: '14px',
                                background: isDragOver ? '#EFF6FF' : totalFiles >= MAX_FILES ? '#F9FAFB' : '#fff',
                                transition: 'border-color .15s, background .15s, color .15s',
                                userSelect: 'none',
                            }}
                        >
                            <div style={{ fontSize: '22px', marginBottom: '4px' }}>
                                {isDragOver ? '📂' : '📎'}
                            </div>
                            {totalFiles >= MAX_FILES
                                ? `Достигнут лимит: ${MAX_FILES} файлов`
                                : isDragOver
                                    ? 'Отпустите, чтобы прикрепить'
                                    : 'Перетащите файлы сюда или нажмите для выбора'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                            Разрешённые форматы: <strong>PDF, JPG, PNG</strong> · Размер не более <strong>{MAX_FILE_SIZE_MB} МБ</strong>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ALLOWED_EXT.join(',')}
                            style={{ display: 'none' }}
                            onChange={handleFilesChange}
                            disabled={totalFiles >= MAX_FILES}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                        <Button variant="simple" onClick={() => navigate(paths.certificates.main)}>
                            Отмена
                        </Button>
                        <Button onClick={handleSubmit}>
                            Сохранить и отправить
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CertificatesEdit;
