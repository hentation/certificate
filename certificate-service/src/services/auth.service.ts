// TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.

import type { AuthUser, UserRole } from '~/redux/authSlice';
import type { UserRoles } from '~/models/user';

/* ─── Локальные тестовые учётные записи (только для разработки) ─── */

interface LocalCredential {
    password: string;
    user: AuthUser;
}

const LOCAL_CREDENTIALS: Record<string, LocalCredential> = {
    user: {
        password: 'user',
        user: {
            id: 'gainullin-ka',
            fio: 'Иванов Петр Александрович',
            username: 'user',
            role: 'USER',
            department: 'Институт информационных технологий',
            position: 'Старший преподаватель',
        },
    },
    hr: {
        password: 'hr',
        user: {
            id: 'petrova-yu',
            fio: 'Петрова Юлия Сергеевна',
            username: 'hr',
            role: 'HR',
            department: 'Управление кадров',
            position: 'Специалист по кадрам',
        },
    },
    root: {
        password: 'root',
        user: {
            id: 'antonov-sm',
            fio: 'Антонов Сергей Максимович',
            username: 'root',
            role: 'SYSTEM_ADMIN',
            department: 'Отдел информационных технологий',
            position: 'Ведущий разработчик',
        },
    },
};

/* ─── Ключи localStorage ─── */

export const AUTH_TOKEN_KEY = 'certificate_service_auth_token';
export const AUTH_USER_KEY  = 'certificate_service_auth_user';

/* ─── Локальный вход ─── */

/**
 * Проверяет логин/пароль по локальной таблице.
 * При успехе возвращает объект пользователя, при ошибке — null.
 *
 * TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.
 */
export function loginLocal(username: string, password: string): AuthUser | null {
    const entry = LOCAL_CREDENTIALS[username.toLowerCase().trim()];
    if (!entry || entry.password !== password) return null;
    return entry.user;
}

/* ─── Токен (mock) ─── */

export function generateMockToken(user: AuthUser): string {
    return `mock_${user.role}_${user.id}_${Date.now()}`;
}

/* ─── localStorage ─── */

export function saveAuthToStorage(user: AuthUser, token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function loadAuthFromStorage(): { user: AuthUser; token: string } | null {
    try {
        const token   = localStorage.getItem(AUTH_TOKEN_KEY);
        const userStr = localStorage.getItem(AUTH_USER_KEY);
        if (!token || !userStr) return null;
        const user = JSON.parse(userStr) as AuthUser;
        // Миграция: у старых сессий нет поля position — подставляем из справочника
        if (!user.position) {
            user.position = USER_POSITIONS[user.id] ?? '—';
        }
        return { user, token };
    } catch {
        return null;
    }
}

export function clearAuthFromStorage(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

/* ─── Маппинг роли в UserRoles (для RTK Query cache) ─── */

export function getRolesFromAuthUser(user: AuthUser): UserRoles {
    const base: UserRoles = {
        isParticipant:     false,
        isModerator:       false,
        isExpert:          false,
        isOrganizer:       false,
        isAuditor:         false,
        isCertificateUser: true,
        isSystemAdmin:     false,
    };

    switch (user.role) {
        case 'HR':
            return { ...base, isModerator: true };
        case 'SYSTEM_ADMIN':
            return { ...base, isModerator: true, isSystemAdmin: true };
        default: // USER
            return base;
    }
}

/* ─── Заглушки под интеграцию с УрФУ SSO ─── */

/**
 * TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.
 */
export async function loginViaUrfuSSO(): Promise<AuthUser | null> {
    throw new Error('SSO-авторизация УрФУ ещё не подключена. Используйте локальный вход.');
}

/**
 * TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.
 */
export async function validateUrfuToken(token: string): Promise<boolean> {
    return token.startsWith('mock_');
}

/* ─── Отображаемые имена ролей ─── */

export const ROLE_LABELS: Record<UserRole, string> = {
    USER:         'Сотрудник',
    HR:           'Сотрудник отдела кадров',
    SYSTEM_ADMIN: 'Администратор сервиса',
};

/* ─── Утилиты для ФИО ─── */

/**
 * Преобразует полное ФИО в формат «Фамилия И.О.»
 * «Иванов Петр Александрович» → «Иванов П.А.»
 */
export function toShortFio(fullFio: string): string {
    const parts = fullFio.trim().split(/\s+/);
    if (parts.length === 0) return fullFio;
    const [last, first, patronymic] = parts;
    let short = last;
    if (first)      short += ` ${first[0].toUpperCase()}.`;
    if (patronymic) short += `${patronymic[0].toUpperCase()}.`;
    return short;
}

/**
 * Справочник userId → полное ФИО.
 * TODO: Заменить на запрос к API профилей УрФУ при деплое в продакшн.
 */
export const USER_DIRECTORY: Record<string, string> = {
    'gainullin-ka': 'Иванов Петр Александрович',
    'petrova-yu':   'Петрова Юлия Сергеевна',
    'antonov-sm':   'Антонов Сергей Максимович',
};

/** Справочник userId → должность */
export const USER_POSITIONS: Record<string, string> = {
    'gainullin-ka': 'Старший преподаватель',
    'petrova-yu':   'Специалист по кадрам',
    'antonov-sm':   'Ведущий разработчик',
};

export function getFioByUserId(userId: string): string {
    return USER_DIRECTORY[userId] ?? userId;
}

export function getShortFioByUserId(userId: string): string {
    const fio = getFioByUserId(userId);
    return fio === userId ? userId : toShortFio(fio);
}

export function getPositionByUserId(userId: string): string {
    return USER_POSITIONS[userId] ?? '—';
}
