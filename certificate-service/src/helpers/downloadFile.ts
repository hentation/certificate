/** Скачивает файл через fetch + Blob URL.
 *  Корректно работает для кросс-доменных запросов (фронт 8080 → бэк 3000). */
export async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch {
        alert('Не удалось скачать файл. Убедитесь, что сервер запущен.');
    }
}
