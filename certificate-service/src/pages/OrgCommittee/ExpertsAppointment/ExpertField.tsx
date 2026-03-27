import { useState } from 'react';
import styles from './ExpertsAppointment.styles.module.less';
import { colors } from '~/styles/colors';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Icon } from 'urfu-ui-kit-react';
import { ModalExpert } from './ModalExpert';
import type { Employee } from '~/models/employees';

interface ExpertFieldProps {
  number?: number;
  label: string;
  value?: string; // ФИО эксперта
  valueId?: string; // id эксперта
  onAdd: (expert: { id: string, fullName: string }) => void;
  onEdit: (expert: { id: string, fullName: string }) => void;
  selectedIds?: string[];
  isEditable?: boolean;
}

export const ExpertField = ({
  number,
  label,
  value,
  valueId,
  onAdd,
  onEdit,
  selectedIds = [],
  isEditable
}: ExpertFieldProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  const handleAdd = () => {
    setMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = (expert: Employee) => {
    if (mode === 'add') {
      onAdd({ id: expert.id, fullName: expert.fullName });
    } else {
      onEdit({ id: expert.id, fullName: expert.fullName });
    }
  };

  return (
    <div className={styles.expertField}>
      <span className='tt'>
        {number ? `${number}. ` : null}
        {label}
        <span style={{ color: colors.mainDanger }}> *</span>
      </span>
      {value ? (
        <div className={styles.expertValue}>
          <p className='th'>{value}</p>
          {isEditable && <span className={styles.editExpert} onClick={handleEdit}><Icon size="14px" name="pencil" color="inherit"/><p className='th'>Изменить</p></span>}
        </div>
      ) : (
        isEditable && <div className={styles.addExpert} onClick={handleAdd}><Icon size="14px" className={styles.iconPlus} name="plus" color="inherit"/><p className='th'>Добавить</p></div>
      )}
      {isModalOpen && (
        <ModalExpert
          hideModal={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialValue={mode === 'edit' ? valueId : ''}
          mode={mode}
          label={label}
          number={number}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}; 