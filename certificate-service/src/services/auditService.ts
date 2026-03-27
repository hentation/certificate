/**
 * Сервис журнала аудита.
 * Хранит записи в localStorage — данные сохраняются между сессиями и
 * доступны без изменений бэкенда.
 *
 * TODO: При деплое в продакшн заменить localStorage на POST /audit/logs,
 *       а loadAuditLogs — на GET /audit/logs.
 */

export type AuditActionType =
    | 'Создание заявки'
    | 'Смена статуса'
    | 'Редактирование заявки'
    | 'Удаление заявки'
    | 'Загрузка файла'
    | 'Скачивание файла'
    | 'Вход в систему'
    | 'Выход из системы';

export interface AuditEntry {
    id: string;
    date: string;            // ISO-string
    userId: string;
    userFio: string;
    userPosition: string;    // должность
    action: AuditActionType;
    objectId: string;        // ID заявки или '—'
    comment: string;
}

const STORAGE_KEY = 'certificate_service_audit_logs';
/** Максимальное число хранимых записей (FIFO — старые вытесняются) */
const MAX_ENTRIES = 1000;

/* ─── Генерация ID ─────────────────────────────────────────────────── */

function genId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

/* ─── Чтение ───────────────────────────────────────────────────────── */

export function loadAuditLogs(): AuditEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as AuditEntry[];
        // Обратная совместимость — старые записи без userPosition
        return parsed.map(e => ({ userPosition: '—', ...e }));
    } catch {
        return [];
    }
}

/* ─── Запись ───────────────────────────────────────────────────────── */

export function logAction(
    userId: string,
    userFio: string,
    userPosition: string,
    action: AuditActionType,
    objectId: string,
    comment: string,
): void {
    const entry: AuditEntry = {
        id:           genId(),
        date:         new Date().toISOString(),
        userId,
        userFio,
        userPosition,
        action,
        objectId,
        comment,
    };

    const existing = loadAuditLogs();
    const updated  = [entry, ...existing].slice(0, MAX_ENTRIES);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        const trimmed = [entry, ...existing.slice(0, MAX_ENTRIES / 2)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
}

/* ─── Очистка ──────────────────────────────────────────────────────── */

export function clearAuditLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
}
