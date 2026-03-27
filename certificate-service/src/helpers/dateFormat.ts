export const formatDate = (dateString: string, showTime: boolean = false, forFilter: boolean = false): string => {
  const date = new Date(dateString);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if(forFilter) {
    return `${year}-${month}-${day}`
  }
  
  if (!showTime) {
    return `${day}.${month}.${year}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}; 

export const formatDateForPeriods = (date: string | Date): string => {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return date.slice(0, 10);
  }
  return '';
}; 

export const humanFormatedDate = (dateInput: string | Date, showYear: boolean = true): string => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return showYear ? `${day} ${month} ${year}` : `${day} ${month}`;
}; 

export function formatDateToLocal(dateStr: string): string {
  const date = new Date(dateStr);

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}.${mm}.${yyyy} ${hh}:${min}:${ss}`;
}