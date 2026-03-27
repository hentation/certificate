export function downloadBlobFile(blob: Blob, filename: string) {
  try {
    // Проверяем, что blob валиден
    if (!blob || blob.size === 0) {
      throw new Error('Получен пустой или невалидный файл');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none'; // Скрываем элемент
    
    document.body.appendChild(a);
    a.click();
    
    // Очищаем DOM
    document.body.removeChild(a);
    
    // Освобождаем память с небольшой задержкой
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    throw new Error(`Не удалось загрузить файл: ${errorMessage}`);
  }
}

 