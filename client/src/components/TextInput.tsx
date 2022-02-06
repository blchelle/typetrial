import React, { ChangeEvent, HTMLInputTypeAttribute, useState } from 'react';

interface TextInputProps {
    label: string;
    name: string;
    onChange: (text: string) => void;
    isValid?: boolean
    type?: HTMLInputTypeAttribute
    color?: 'primary' | 'secondary';
    note?: string
}

const primaryColorClasses = {
  text: 'text-primary',
  border: 'border-primary',
};

const secondaryColorClasses = {
  text: 'text-secondary',
  border: 'border-secondary',
};

const errorColorClasses = {
  text: 'text-error',
  border: 'border-error',
};

const TextInput: React.FC<TextInputProps> = ({
  color = 'primary',
  isValid = true,
  label,
  name,
  note,
  onChange,
  type = 'text',
}) => {
  const [value, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = event.target;

    setValue(newValue);
    onChange(newValue);
  };

  const colorClasses = color === 'primary' ? primaryColorClasses : secondaryColorClasses;

  const getLabelClasses = () => (value.length === 0 ? (
    'top-1/2 left-4 text-lg text-gray-300'
  ) : (
    `top-0 left-2 text-xs px-1 ${isValid ? colorClasses.text : errorColorClasses.text}`
  ));

  const getInputClasses = () => {
    if (value.length === 0) return 'border-gray-200';
    if (isValid) return colorClasses.border;
    return errorColorClasses.border;
  };

  return (
    <div className="w-full">
      <div className="relative">
        <label
          className={`absolute ${getLabelClasses()} -translate-y-1/2 translate-x-1 left-4 transition-all cursor-text font-light bg-white`}
          htmlFor={name}
        >
          {label}
        </label>
        <input
          className={`px-4 py-2 rounded-md border-2 w-full ${getInputClasses()} bg-transparent`}
          onChange={handleChange}
          type={type}
          id={name}
        />
      </div>
      { note && <p className="mt-1 pl-2 text-xs text-gray-400 uppercase font-light">{note}</p>}
    </div>
  );
};
export default TextInput;
