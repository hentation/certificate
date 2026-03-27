import React, { useState, useEffect, useRef } from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, Search, Button } from 'urfu-ui-kit-react';
import styles from './ExpertsAppointment.styles.module.less';
import { Title } from '~/components/Title/Title';
import { useGetEmployeesQuery } from '~/http/employees';
import type { Employee } from '~/models/employees';
import { colors } from '~/styles/colors';
import { debounce } from '~/helpers/debounce';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import type { ListRowProps } from 'react-virtualized';
import type { List as ListType } from 'react-virtualized';

interface ModalExpertProps {
  hideModal: () => void;
  onSave: (expert: Employee) => void;
  initialValue?: string;
  mode: 'add' | 'edit';
  label: string;
  number?: number;
  selectedIds?: string[];
}

const labelToGenitive = (label: string): string => {
  switch (label.toLowerCase()) {
    case 'научный эксперт':
      return 'научного эксперта';
    case 'эксперт-популяризатор':
      return 'эксперта-популяризатора';
    default:
      return label;
  }
};

const getTitle = (mode: 'add' | 'edit', label: string, number?: number): string => {
  const genitiveLabel = labelToGenitive(label);
  if (mode === 'edit') return `Редактировать ${genitiveLabel}`;
  if (genitiveLabel === 'научного эксперта') {
    if (number === 1) return 'Добавить первого научного эксперта';
    if (number === 2) return 'Добавить второго научного эксперта';
    return `Добавить научного эксперта`;
  }
  if (genitiveLabel === 'эксперта-популяризатора') {
    return 'Добавить эксперта-популяризатора';
  }
  return `Добавить ${genitiveLabel}`;
};

export const ModalExpert = ({ hideModal, onSave, initialValue = '', mode, label, number, selectedIds = [] }: ModalExpertProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Employee | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filterReady, setFilterReady] = useState(false);

  const { data: employees, isLoading } = useGetEmployeesQuery();
  const employeesArray: Employee[] = Array.isArray(employees) ? employees : [];

  // Виртуализация
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 80,
    })
  ).current;
  // Исправленный debounce: фильтрация только после паузы
  const debouncedFilter = useRef(
    debounce((value: string, employees: Employee[], setResult: (arr: Employee[]) => void) => {
      if (value.trim()) {
        setResult(
          employees.filter(e =>
            e.fullName.toLowerCase().includes(value.trim().toLowerCase())
          )
        );
      } else {
        setResult(employees);
      }
    }, 300)
  ).current;

  const listRef = useRef<ListType>(null);

  useEffect(() => {
    if (inputValue === '' || employeesArray.length === 0) {
      // Фильтруем сразу, без debounce
      setFilteredEmployees(employeesArray);
      setFilterReady(true);
    } else {
      // Фильтруем с debounce
      setFilterReady(false);
      debouncedFilter(inputValue, employeesArray, (arr) => {
        setFilteredEmployees(arr);
        setFilterReady(true);
      });
    }
  }, [inputValue, employeesArray, debouncedFilter]);

  // Сброс кэша высот и обновление грида при изменении фильтра
  useEffect(() => {
    cache.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [inputValue, cache]);

  useEffect(() => {
    // Если initialValue не задан, ничего не делаем
    if (!initialValue) return;

    // Если сотрудников нет, сбрасываем selectedExpert только если он не null
    if (!employeesArray.length) {
      if (selectedExpert !== null) {
        setSelectedExpert(null);
      }
      return;
    }

    // Если initialValue задан, ищем сотрудника
    const found = employeesArray.find(e => e.id === initialValue);
    if (found && (!selectedExpert || selectedExpert.id !== found.id)) {
      setSelectedExpert(found);
    }
  }, [initialValue, employeesArray]);

  const title = getTitle(mode, label, number);

  const rowRenderer = ({ index, key, parent, style }: ListRowProps) => {
    const employee = filteredEmployees[index];
    const isSelected = selectedExpert?.id === employee.id;
    const isBlocked = selectedIds.includes(employee.id) && !isSelected;
    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div
          style={{
            ...style,
            cursor: isBlocked ? 'not-allowed' : 'pointer',
            background: isSelected
              ? colors.blue12
              : isBlocked
                ? colors.mainLight
                : undefined,
            borderBottom: `1px solid ${colors.secondaryQuiet}`,
            boxSizing: 'border-box',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            rowGap: 4
          }}
          onClick={() => {
            if (!isBlocked) setSelectedExpert(employee);
          }}
          title={isBlocked ? 'Пользователь уже назначен другим экспертом' : undefined}
        >
          <div className='tt clr-black-main'>{employee.fullName}</div>
          <div className='tt clr-black-main'>{employee.divisionTitle}, {employee.jobTitle}</div>
        </div>
      </CellMeasurer>
    );
  };

  return (
    <Modal onCancel={hideModal} active={true}>
      <Title type='h3'>{title}</Title>
      <Search
        className={styles.search}
        placeholder="Поиск по ФИО"
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
      />
      <div
        className={styles.employeesList}
        style={{
          overflowY: isLoading || !filterReady ? 'hidden' : 'auto',
          maxHeight: 360,
          minHeight: 0,
        }}
      >
        {(isLoading || !filterReady) && (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ height: 16, width: '60%', background: '#f0f0f0', borderRadius: 4, marginBottom: 4, animation: 'pulse 1.2s infinite' }} />
                <div style={{ height: 12, width: '40%', background: '#f0f0f0', borderRadius: 4, animation: 'pulse 1.2s infinite' }} />
                <div style={{ height: 12, width: '30%', background: '#f0f0f0', borderRadius: 4, animation: 'pulse 1.2s infinite' }} />
              </div>
            ))}
          </>
        )}
        {!isLoading && filterReady && filteredEmployees && filteredEmployees.length === 0 && <div style={{ padding: 16 }}>Нет экспертов</div>}
        {!isLoading && filterReady && filteredEmployees && filteredEmployees.length > 0 && (
          <AutoSizer disableHeight>
            {({ width }: { width: number }) => (
              <List
                ref={listRef}
                width={width}
                height={360}
                rowCount={filteredEmployees.length}
                rowHeight={cache.rowHeight}
                deferredMeasurementCache={cache}
                rowRenderer={rowRenderer}
                overscanRowCount={5}
              />
            )}
          </AutoSizer>
        )}
      </div>
      <div className={styles.modalButtons}>
        <Button onClick={hideModal} variant="simple">Отмена</Button>
        <Button
          onClick={() => { if (selectedExpert) { onSave(selectedExpert); hideModal(); } }}
          variant="primary"
          type="button"
          disabled={!selectedExpert}
        >
          Сохранить
        </Button>
      </div>
    </Modal>
  );
}; 