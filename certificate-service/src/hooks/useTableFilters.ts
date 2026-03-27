import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { debounce } from '~/helpers/debounce';
import type { AnyAction } from '@reduxjs/toolkit';

interface TableFiltersProps {
  initialFilters?: {
    search?: string;
    direction?: string;
    status?: string;
    [key: string]: string | undefined;
  };
  reduxActions?: {
    setSearch?: (value: string) => AnyAction;
    setDirection?: (value: string) => AnyAction;
    setStatus?: (value: string) => AnyAction;
    [key: string]: ((value: string) => AnyAction) | undefined;
  };
  debounceTime?: number;
}

export const useTableFilters = ({ initialFilters = {}, reduxActions = {}, debounceTime = 500 }: TableFiltersProps = {}) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Состояние пагинации и сортировки
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [size, setSize] = useState(Number(searchParams.get('size')) || 10);
  
  // Локальное состояние фильтров
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(() => {
    const filters: Record<string, string> = {};
    Object.keys(initialFilters).forEach(key => {
      const value = searchParams.get(key) || initialFilters[key] || '';
      filters[key] = value;
      // Обновляем Redux если есть соответствующие actions
      if (value && reduxActions[key]) {
        dispatch(reduxActions[key]!(value));
      }
    });
    // Пагинация
    if (searchParams.get('page')) filters.page = searchParams.get('page')!;
    if (searchParams.get('size')) filters.size = searchParams.get('size')!;
    // Сортировка
    if (searchParams.get('sort')) filters.sort = searchParams.get('sort')!;
    if (searchParams.get('sort-dir')) filters['sort-dir'] = searchParams.get('sort-dir')!;
    return filters;
  });
  
  // Состояние для параметров запроса
  const [queryParams, setQueryParams] = useState<Record<string, string>>(() => {
    const filters: Record<string, string> = {};
    Object.keys(initialFilters).forEach(key => {
      const value = searchParams.get(key) || initialFilters[key] || '';
      if (value) filters[key] = value;
    });
    if (searchParams.get('sort')) filters.sort = searchParams.get('sort')!;
    if (searchParams.get('sort-dir')) filters['sort-dir'] = searchParams.get('sort-dir')!;
    if (searchParams.get('page')) filters.page = searchParams.get('page')!;
    if (searchParams.get('size')) filters.size = searchParams.get('size')!;
    return filters;
  });

  // Для хранения актуального значения search
  const searchRef = useRef<string>('');

  // Синхронизируем URL с Redux при первой загрузке
  useEffect(() => {
    const hasUrlParams = Object.keys(initialFilters).some(key => searchParams.has(key));
    if (!hasUrlParams) {
      setSearchParams((prev: URLSearchParams) => {
        Object.entries(initialFilters).forEach(([key, value]) => {
          if (value) {
            prev.set(key, value);
          }
        });
        // Сортировка
        if ('sort' in localFilters && typeof localFilters['sort'] === 'string' && localFilters['sort']) prev.set('sort', localFilters['sort']);
        if ('sort-dir' in localFilters && typeof localFilters['sort-dir'] === 'string' && localFilters['sort-dir']) prev.set('sort-dir', localFilters['sort-dir']);
        // Пагинация
        if (currentPage) prev.set('page', String(currentPage));
        if (size) prev.set('size', String(size));
        return prev;
      });
    }
  }, []);

  // Создаем debounced функцию для обновления параметров запроса
  const debouncedSetQueryParams = useCallback(
    debounce((filters: Record<string, string>) => {
      setQueryParams(prev => {
        const merged = { ...prev, ...filters };
        // Удаляем ключи с пустыми значениями
        Object.keys(merged).forEach(key => {
          if (!merged[key]) {
            delete merged[key];
          }
        });
        return merged;
      });
    }, debounceTime),
    []
  );

  // Создаем debounced функцию для обновления Redux и URL
  const debouncedUpdateFilters = useCallback(
    debounce(() => {
      const value = searchRef.current;
      setSearchParams((prev: URLSearchParams) => {
        if (value) {
          prev.set('search', value);
        } else {
          prev.delete('search');
        }
        return prev;
      });
      if (reduxActions['search']) {
        dispatch(reduxActions['search']!(value));
      }
      setCurrentPage(1);
    }, debounceTime),
    [dispatch, setSearchParams, reduxActions]
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === 'search') {
      searchRef.current = value;
      setLocalFilters(prev => ({
        ...prev,
        [key]: value
      }));
      debouncedUpdateFilters();
      debouncedSetQueryParams({ [key]: value });
    } else {
      setLocalFilters(prev => ({
        ...prev,
        [key]: value
      }));

      if (key === 'search') {
        debouncedUpdateFilters();
        debouncedSetQueryParams({ [key]: value });
      } else {
        // Для селектов и других фильтров — сразу
        setSearchParams((prev: URLSearchParams) => {
          if (value) {
            prev.set(key, value);
          } else {
            prev.delete(key);
          }
          return prev;
        });

        if (reduxActions[key]) {
          dispatch(reduxActions[key]!(value));
        }

        setCurrentPage(1);
        setQueryParams(prev => {
          const merged = { ...prev, [key]: value };
          Object.keys(merged).forEach(k => {
            if (!merged[k]) delete merged[k];
          });
          return merged;
        });
      }
    }
  }, [debouncedUpdateFilters, debouncedSetQueryParams, reduxActions, setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setLocalFilters(prev => ({ ...prev, page: String(page) }));
    setQueryParams(prev => ({ ...prev, page: String(page) }));
    setSearchParams((prev: URLSearchParams) => {
      prev.set('page', page.toString());
      return prev;
    });
  }, [setSearchParams]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    setCurrentPage(1);
    setLocalFilters(prev => ({ ...prev, size: String(newSize), page: '1' }));
    setQueryParams(prev => ({ ...prev, size: String(newSize), page: '1' }));
    setSearchParams((prev: URLSearchParams) => {
      prev.set('size', newSize.toString());
      prev.set('page', '1');
      return prev;
    });
  }, [setSearchParams]);

  // Обновление сортировки без debounce, чтобы sort и sort-dir попадали в queryParams мгновенно
  const handleSortChange = useCallback((field?: string, dir?: 'asc' | 'desc') => {
    setLocalFilters(prev => ({
      ...prev,
      sort: field || '',
      'sort-dir': dir || ''
    }));
    setQueryParams(prev => {
      const merged: Record<string, string> = { ...prev, sort: field || '', 'sort-dir': dir || '' };
      Object.keys(merged).forEach(key => {
        if (!merged[key]) delete merged[key];
      });
      return merged;
    });
    setSearchParams((prev: URLSearchParams) => {
      if (field) prev.set('sort', field); else prev.delete('sort');
      if (dir) prev.set('sort-dir', dir); else prev.delete('sort-dir');
      return prev;
    });
  }, [setSearchParams]);

  return {
    currentPage,
    pageSize: size,
    localFilters,
    queryParams,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
  };
}; 