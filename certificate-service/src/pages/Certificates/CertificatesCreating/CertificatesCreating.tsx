import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Select, Preloader } from 'urfu-ui-kit-react';
import { Title } from '~/components/Title/Title';
import { Card } from '~/components/Card/Card';
import { BackButton } from '~/components/BackButton/BackButton';
import { useCreateCertificateMutation, useUploadCertificateFileMutation } from '~/http/certificates';
import { useNotificationService } from '~/hooks/notificationService';
import { useAppSelector } from '~/hooks/store';
import { logAction } from '~/services/auditService';
import { CERTIFICATE_TYPES } from '~/models/certificates';
import type { CertificateType } from '~/models/certificates';
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

const CertificatesCreating = () => {
    const navigate = useNavigate();
    const { showMessage } = useNotificationService();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authUser = useAppSelector(s => s.auth.user);

    const [createCertificate, { isLoading }] = useCreateCertificateMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadCertificateFileMutation();

    const [certificateType, setCertificateType] = useState<{ label: string; value: string } | undefined>();
    const [purpose, setPurpose]     = useState('По месту требования');
    const [copies, setCopies]       = useState(1);
    const [userComment, setComment] = useState('');
    const [files, setFiles]         = useState<File[]>([]);
    const [isDragOver, setDragOver] = useState(false);

    const addFiles = useCallback((incoming: File[]) => {
        const valid: File[] = [];
        for (const file of incoming) {
            const err = validateFile(file);
            if (err) { showMessage(err, 'fail'); continue; }
            valid.push(file);
        }
        setFiles(prev => {
            const combined = [...prev, ...valid];
            if (combined.length > MAX_FILES) {
                showMessage(`Максимум ${MAX_FILES} файлов`, 'fail');
                return combined.slice(0, MAX_FILES);
            }
            return combined;
        });
    }, [showMessage]);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files ?? []));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (files.length >= MAX_FILES) return;
        addFiles(Array.from(e.dataTransfer.files));
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
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
            // Сначала загружаем все файлы на сервер
            const uploadedFiles = await Promise.all(
                files.map((file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return uploadFile(fd).unwrap();
                }),
            );

            const created = await createCertificate({
                certificateType: certificateType.value as CertificateType,
                purpose: purpose.trim() || 'По месту требования',
                copies,
                files: uploadedFiles,
                userComment: userComment.trim() || undefined,
            }).unwrap();

            logAction(
                authUser?.id ?? 'unknown',
                authUser?.fio ?? 'Неизвестный',
                authUser?.position ?? '—',
                'Создание заявки',
                created.id,
                `${certificateType.value}, ${copies} экз.${userComment.trim() ? '. Комментарий: ' + userComment.trim() : ''}`,
            );

            if (uploadedFiles.length > 0) {
                logAction(
                    authUser?.id ?? 'unknown',
                    authUser?.fio ?? 'Неизвестный',
                    authUser?.position ?? '—',
                    'Загрузка файла',
                    created.id,
                    `Прикреплено файлов: ${uploadedFiles.length} (${uploadedFiles.map(f => f.name).join(', ')})`,
                );
            }

            showMessage('Заявка успешно создана!');
            navigate(paths.certificates.main);
        } catch {
            showMessage('Не удалось создать заявку', 'fail');
        }
    };

    if (isLoading || isUploading) return <Preloader variant="large-primary" />;

    return (
        <div style={{ position: 'relative' }}>
            <BackButton to={paths.certificates.main}>Мои заявки на справки</BackButton>
            <Title>Заказать справку</Title>

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

                    {/* ── Комментарий заявителя ── */}
                    <div>
                        <div style={labelStyle}>Комментарий к заявке</div>
                        <textarea
                            value={userComment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Укажите любые дополнительные сведения..."
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

                    {/* ── Прикрепить файлы ── */}
                    <div>
                        <div style={labelStyle}>
                            Прикрепить документы
                            <span style={{ color: '#9CA3AF', fontSize: '12px', marginLeft: '8px' }}>
                                (до {MAX_FILES} файлов)
                            </span>
                        </div>

                        {/* Зона выбора + перетаскивания */}
                        <div
                            onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); if (files.length < MAX_FILES) setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragOver ? '#1976D2' : '#D3D3D3'}`,
                                borderRadius: '10px',
                                padding: '24px 20px',
                                textAlign: 'center',
                                cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer',
                                color: isDragOver ? '#1976D2' : '#748AB9',
                                fontSize: '14px',
                                background: isDragOver ? '#EFF6FF' : files.length >= MAX_FILES ? '#F9FAFB' : '#fff',
                                transition: 'border-color .15s, background .15s, color .15s',
                                userSelect: 'none',
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '6px' }}>
                                {isDragOver ? '📂' : '📎'}
                            </div>
                            {files.length >= MAX_FILES
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
                            disabled={files.length >= MAX_FILES}
                        />

                        {/* Список выбранных файлов */}
                        {files.length > 0 && (
                            <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {files.map((file, i) => (
                                    <li key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px 12px',
                                        background: '#F3F4F6',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                    }}>
                                        <span style={{ fontSize: '16px' }}>📄</span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </span>
                                        <span style={{ color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            {(file.size / 1024).toFixed(0)} КБ
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#C62828',
                                                fontSize: '16px',
                                                lineHeight: 1,
                                                padding: '0 2px',
                                            }}
                                            title="Удалить файл"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                        <Button variant="simple" onClick={() => navigate(paths.certificates.main)}>
                            Отмена
                        </Button>
                        <Button onClick={handleSubmit}>
                            Отправить заявку
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CertificatesCreating;
