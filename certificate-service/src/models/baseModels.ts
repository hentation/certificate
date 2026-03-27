import type Keycloak from 'keycloak-js';

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    keycloak: Keycloak;
  }

  let __webpack_public_path__: string | undefined;
}

export interface AppContext {
  isAuthenticated: () => boolean;
  auth: () => Record<string, string>;
  keycloak: Keycloak | null;
}