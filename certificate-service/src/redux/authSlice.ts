import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** Три роли системы */
export type UserRole = 'USER' | 'HR' | 'SYSTEM_ADMIN';

export interface AuthUser {
    id: string;
    fio: string;
    username: string;
    role: UserRole;
    department: string;
    position: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        clearAuth(state) {
            state.user = null;
            state.token = null;
        },
    },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
