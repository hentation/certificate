import { PROJECT_NAME } from './constants/baseConstants';

// Устанавливаем ID корневого элемента до загрузки основного приложения
const rootElement = document.getElementById('root');
if (rootElement) {
    rootElement.id = PROJECT_NAME;
} 