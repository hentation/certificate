import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { RootState } from '~/redux/store';

export const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_PATH,
    // RTK Query передаёт getState вторым аргументом — используем его вместо
    // прямого импорта store, чтобы избежать циклической зависимости.
    prepareHeaders: (headers, { getState }) => {
        const token = (window as Window).keycloak?.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // Передаём userId залогиненного пользователя через заголовок.
        // Бэкенд при USE_MOCK_AUTH=1 использует его вместо MOCK_USER_ID.
        const authUser = (getState() as RootState).auth?.user;
        if (authUser?.id) {
            headers.set('x-user-id', authUser.id);
        }
        return headers;
    },
})