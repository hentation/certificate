import { type FC, Suspense } from "react";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import routes from "~/routing/routes";
import { isSubApp } from "~/helpers/baseUtils";
import { PageWrapper } from "./PageWrapper";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader } from 'urfu-ui-kit-react';
import { useGetUserRolesQuery } from '~/http/user';
import styles from './PageWrapper.styles.module.less';
import { useAppDispatch, useAppSelector } from '~/hooks/store';
import { clearAuth } from '~/redux/authSlice';
import { api } from '~/http/api';
import { clearAuthFromStorage, ROLE_LABELS, toShortFio } from '~/services/auth.service';
import { Login } from '~/pages/Login/Login';

// Типизация UserRoles
import type { UserRoles } from '~/models/user';

const BASE_URL = '/';

/* ─── Кнопка выхода (рендерится внутри PageWrapper) ──────────────── */

const LogoutButton: FC = () => {
    const dispatch   = useAppDispatch();
    const authUser   = useAppSelector(s => s.auth.user);

    const handleLogout = () => {
        clearAuthFromStorage();
        dispatch(clearAuth());
        dispatch(api.util.resetApiState());
    };

    if (!authUser) return null;

    return (
        <div style={{
            position: 'fixed', bottom: '24px', left: '16px', zIndex: 100,
            display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', paddingLeft: '2px' }}>
                {ROLE_LABELS[authUser.role]}
            </span>
            {/* Короткое ФИО — полное при наведении */}
            <span
                title={authUser.fio}
                style={{
                    fontSize: '12px', fontWeight: 600, color: '#374151',
                    maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    paddingLeft: '2px', cursor: 'default',
                }}
            >
                {toShortFio(authUser.fio)}
            </span>
            <button
                onClick={handleLogout}
                style={{
                    marginTop: '4px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    background: '#fff',
                    color: '#EF302B',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                ← Выйти
            </button>
        </div>
    );
};

const getMainPathByRoles = (roles: UserRoles): string => {
  if (roles.isCertificateUser) return routes.certificates.main.path;
  if (roles.isOrganizer) return routes.orgCommittee.main.path;
  if (roles.isModerator) return routes.moderation.main.path;
  if (roles.isExpert) return routes.evaluation.main.path;
  if (roles.isParticipant) return routes.myApplications.main.path;
  if (roles.isAuditor) return routes.audition.main.path;
  return routes.notSection.noAccess.path;
};

type RoleKey = keyof UserRoles;

const ProtectedRoute: FC<{ children: React.ReactNode; requiredRole?: RoleKey; roles: UserRoles }> = ({ children, requiredRole, roles }) => {
  if (!roles) return null;
  if (requiredRole && !roles[requiredRole]) return <Navigate to={getMainPathByRoles(roles)} replace />;
  // Если requiredRole не задан, всегда разрешаем доступ (например, для /no-access)
  return <>{children}</>;
};

/* ─── Маршруты для залогиненного пользователя ───────────────────── */

const AuthenticatedRoutes: FC = () => {
  const { data: roles, isLoading, error } = useGetUserRolesQuery();
  const location = useLocation();
  const navigate = useNavigate();

  const emptyRoles: UserRoles = { isParticipant: false, isModerator: false, isExpert: false, isOrganizer: false, isAuditor: false, isSystemAdmin: false };

  // Если пользователь на странице /no-access, показываем её только если у него нет ролей
  if (location.pathname === routes.notSection.noAccess.path) {
    const hasAnyRole = roles && (roles.isParticipant || roles.isExpert || roles.isModerator || roles.isOrganizer || roles.isAuditor || roles.isCertificateUser || roles.isSystemAdmin);
    if (hasAnyRole) {
      return <Navigate to={getMainPathByRoles(roles)} replace />;
    }
    const allRoutes = Object.values(routes).flatMap(routeGroup =>
      Object.values(routeGroup).map(({ path, Component, requiredRole }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requiredRole={requiredRole as RoleKey} roles={roles || emptyRoles}>
              <Component />
            </ProtectedRoute>
          }
        />
      ))
    );
    allRoutes.push(
      <Route
        key="not-found"
        path="*"
        element={<Navigate to={routes.notSection.noAccess.path} replace />}
      />
    );
    return (
      <PageWrapper navigate={navigate} roles={roles || emptyRoles}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Preloader variant="large-primary" /></div>}>
          <Routes>
            {allRoutes}
          </Routes>
        </Suspense>
      </PageWrapper>
    );
  }

  // Обычная логика для всех остальных страниц
  if (isLoading) return <Preloader className={styles.preloader} variant="large-primary" />;
  if (error) return <div>Ошибка загрузки ролей</div>;

  console.log('DEBUG ROLES:', roles);

  if (!roles || (!roles.isParticipant && !roles.isExpert && !roles.isModerator && !roles.isOrganizer && !roles.isAuditor && !roles.isCertificateUser && !roles.isSystemAdmin)) {
    return <Navigate to={routes.notSection.noAccess.path} replace />;
  }

  // Редирект с корня
  if (location.pathname === BASE_URL) {
    return <Navigate to={getMainPathByRoles(roles)} replace />;
  }

  // Генерация всех маршрутов с ProtectedRoute
  const allRoutes = Object.values(routes).flatMap(routeGroup =>
    Object.values(routeGroup).map(({ path, Component, requiredRole }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute requiredRole={requiredRole as RoleKey} roles={roles || emptyRoles}>
            <Component />
          </ProtectedRoute>
        }
      />
    ))
  );

  // Route для несуществующих путей
  allRoutes.push(
    <Route
      key="not-found"
      path="*"
      element={<Navigate to={getMainPathByRoles(roles)} replace />}
    />
  );

  return (
    <PageWrapper navigate={navigate} roles={roles || emptyRoles}>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Preloader variant="large-primary" /></div>}>
        <Routes>
          {allRoutes}
        </Routes>
      </Suspense>
      <LogoutButton />
    </PageWrapper>
  );
};

/* ─── Auth gate: показываем Login если нет сессии ───────────────── */

const AppRoutes: FC = () => {
  const authUser = useAppSelector(s => s.auth.user);

  if (!authUser) {
    return <Login />;
  }

  return <AuthenticatedRoutes />;
};

const Router = () => {
  const RouterComponent = isSubApp() ? HashRouter : BrowserRouter;

  return (
    <RouterComponent>
      <AppRoutes />
    </RouterComponent>
  );
};

export default Router;