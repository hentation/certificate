import packageJson from '../../package.json';
export const PROJECT_NAME = packageJson.name;
export const isDev = import.meta.env.DEV;
