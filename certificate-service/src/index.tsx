import React from 'react';
import ReactDOM from 'react-dom/client';
import Keycloak from 'keycloak-js';
import './styles/reset.less';
import "urfu-ui-kit-react/dist/style.css";
import './index.less';
import App from './App';
import type { AppContext } from './models/baseModels';
import { PROJECT_NAME } from './constants/baseConstants';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { api } from './http/api';
import { setAuth } from './redux/authSlice';
import { loadAuthFromStorage, getRolesFromAuthUser } from './services/auth.service';

// Расширенный интерфейс Window для Qiankun
interface QiankunWindow extends Window {
  __POWERED_BY_QIANKUN__?: boolean;
}

// Типизация параметров монтирования
interface MountProps {
  container?: HTMLElement;
  [key: string]: unknown;
}

function runApp() {
  const rootElement = document.getElementById(PROJECT_NAME);
  if (!rootElement) throw new Error('Не удалось найти корневой элемент');
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}

let keycloakInstance: Keycloak | null = null;

function getKeycloakInstance() {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
    });
  }
  return keycloakInstance;
}

function initApp(ctx: AppContext & { keycloak?: Keycloak | null }) {
  ctx.isAuthenticated = function () {
    return Boolean(ctx.keycloak?.authenticated);
  };

  ctx.auth = function () {
    return ctx.isAuthenticated() ? ctx.keycloak?.idTokenParsed || {} : {};
  };

  const keycloak = getKeycloakInstance();
  window.keycloak = keycloak;

  keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/check-sso.html'
  })
  .then(function (authenticated) {
    if (!authenticated) {
      keycloak.login().then(function () {
        runApp();
      });
    } else {
      runApp();
      activityRequest(keycloak);
    }
  })
  .catch(function (err) {
    console.error(err, 'Ошибка инициализации');
  });
}

export async function bootstrap() {
  console.log(`[${PROJECT_NAME}] Приложение React инициализировано`);
}

export async function mount(props: MountProps = {}) {
  console.log(`[${PROJECT_NAME}] Получены параметры от основного фреймворка`, props);

  // Восстанавливаем сессию из localStorage при перезагрузке страницы.
  // Это работает и для standalone-режима, и внутри qiankun-оболочки.
  const savedAuth = loadAuthFromStorage();
  if (savedAuth) {
    store.dispatch(setAuth(savedAuth));
    store.dispatch(
      api.util.upsertQueryData('getUserRoles', undefined, getRolesFromAuthUser(savedAuth.user))
    );
  }

  // Standalone-режим (прямой запуск Vite без qiankun): используем локальную
  // авторизацию — Router покажет страницу Login, если сессии нет.
  const qiankunWindow = window as QiankunWindow;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    runApp();
    return;
  }

  // Sub-app режим внутри интеграционной платформы УрФУ: Keycloak.
  // TODO: Переключить на реальный эндпоинт авторизации УрФУ при деплое в продакшн.
  const appContext: AppContext = {
    keycloak: null,
    isAuthenticated: () => false,
    auth: () => ({}),
  };

  initApp(appContext);
}

export async function unmount(props: MountProps) {
  const { container } = props;

  if (keycloakInstance) {
    keycloakInstance = null;
  }

  const rootElement = container 
    ? container.querySelector(`#${PROJECT_NAME}`) 
    : document.getElementById(PROJECT_NAME);
    
  if (!rootElement) return;
  
  const root = ReactDOM.createRoot(rootElement);
  root.unmount();
}

const qiankunWindow = window as QiankunWindow;
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  bootstrap().then(() => mount());
}

function activityRequest(keycloak: Keycloak) {
  if (import.meta.env.VITE_KEYCLOAK_REALM === 'urfu-lk' && keycloak.token) {
    sendActivity(keycloak.token, { serviceName: PROJECT_NAME });
  }
}

/**
 * Отправляет информацию об активности в профиль пользователя
 * @param {string} token - токен keycloak пользователя
 * @param {object} info - описание (обязательно serviceName)
 * {
 *  serviceName:'service',
 *  serviceSection:'section',
 *  actionMessage: 'user enters page',
 *  orgInn: 'organization inn',
 *  orgTitle: 'organization title',
 *  orgPost: 'organization post'
 * }
 */
export function sendActivity(token: string, info: Record<string, string>) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://lk-activity-api.my1.urfu.ru/activity');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(info));
} 