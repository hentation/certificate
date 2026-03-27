import React from 'react';
import InputMask from 'react-input-mask';
import styles from './PhoneInput.styles.module.less'

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  disabled: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required = false, label, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {label && (
      <label className={styles.label}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
    )}
    <InputMask
      mask="+7 999 999 99 99"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder="Введите номер в формате +7"
      className={styles.input}
      type="tel"
    />
  </div>
);


