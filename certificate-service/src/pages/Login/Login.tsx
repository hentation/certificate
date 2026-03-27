// TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.

import React, { useState } from 'react';
import { useAppDispatch } from '~/hooks/store';
import { setAuth } from '~/redux/authSlice';
import { api } from '~/http/api';
import {
    loginLocal,
    generateMockToken,
    saveAuthToStorage,
    getRolesFromAuthUser,
    ROLE_LABELS,
} from '~/services/auth.service';
import { colors } from '~/styles/colors';

/* ─── Стили ─────────────────────────────────────────────────────── */

const page: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F2B5E 0%, #1E4391 60%, #2C5FAB 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: '24px',
};

const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
};

const cardHeader: React.CSSProperties = {
    background: colors.mainPrimary,
    padding: '32px 36px 28px',
    textAlign: 'center',
};

const cardBody: React.CSSProperties = {
    padding: '36px',
};

const logoText: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.04em',
    margin: 0,
};

const logoSub: React.CSSProperties = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.75)',
    marginTop: '6px',
};

const label: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    height: '44px',
    padding: '0 14px',
    borderRadius: '8px',
    border: `1.5px solid ${hasError ? '#EF302B' : '#D1D5DB'}`,
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
    background: '#FAFAFA',
});

const submitBtn = (loading: boolean): React.CSSProperties => ({
    width: '100%',
    height: '46px',
    borderRadius: '10px',
    border: 'none',
    background: loading ? '#748AB9' : colors.mainPrimary,
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: loading ? 'default' : 'pointer',
    marginTop: '24px',
    transition: 'background .2s',
    letterSpacing: '0.02em',
});

const errorBox: React.CSSProperties = {
    background: '#FDEAEA',
    border: '1px solid #F58380',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#C62828',
    marginBottom: '20px',
};

const hintBox: React.CSSProperties = {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '12px',
    color: '#1E40AF',
    marginTop: '20px',
    lineHeight: '1.7',
};

/* ─── Компонент ──────────────────────────────────────────────────── */

export const Login: React.FC = () => {
    const dispatch = useAppDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Введите логин и пароль.');
            return;
        }

        setLoading(true);
        // Небольшая задержка для имитации сетевого запроса
        await new Promise(r => setTimeout(r, 400));

        // TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.
        const user = loginLocal(username, password);

        if (!user) {
            setError('Неверный логин или пароль. Проверьте данные и попробуйте снова.');
            setLoading(false);
            return;
        }

        const token = generateMockToken(user);
        saveAuthToStorage(user, token);

        // Сидируем RTK Query кеш ролями, соответствующими роли пользователя
        dispatch(api.util.upsertQueryData('getUserRoles', undefined, getRolesFromAuthUser(user)));
        dispatch(setAuth({ user, token }));
        // Router автоматически перенаправит на нужную страницу после смены состояния
    };

    return (
        <div style={page}>
            <div style={card}>

                {/* Шапка */}
                <div style={cardHeader}>
                    <p style={logoText}>УрФУ · Сервис справок</p>
                    <p style={logoSub}>Уральский федеральный университет</p>
                </div>

                {/* Форма */}
                <div style={cardBody}>
                    <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                        Вход в систему
                    </h2>

                    {error && <div style={errorBox}>{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={label} htmlFor="login-username">Логин</label>
                            <input
                                id="login-username"
                                type="text"
                                autoComplete="username"
                                placeholder="Введите логин"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={inputStyle(!!error)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label style={label} htmlFor="login-password">Пароль</label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={inputStyle(!!error)}
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" style={submitBtn(loading)} disabled={loading}>
                            {loading ? 'Выполняется вход…' : 'Войти'}
                        </button>
                    </form>

                    {/* Подсказка для разработки */}
                    <div style={hintBox}>
                        <strong>Тестовые учётные записи:</strong><br />
                        <span>👤 <b>user / user</b> — {ROLE_LABELS.USER}</span><br />
                        <span>👤 <b>hr&nbsp;&nbsp;/ hr&nbsp;&nbsp;</b> — {ROLE_LABELS.HR}</span><br />
                        <span>👤 <b>root / root</b> — {ROLE_LABELS.SYSTEM_ADMIN}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
