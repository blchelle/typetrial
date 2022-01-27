import React, { ChangeEvent, useState } from 'react';

interface TextInputProps {
    label: string;
    name: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    validator?: (_: string) => boolean
    color?: 'primary' | 'secondary'
}

interface TextInputState {
    isEmpty: boolean;
    isValid: boolean;
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
  label, name, color = 'primary', validator = () => true, onChange,
}) => {
  const [inputState, setInputState] = useState<TextInputState>({ isEmpty: true, isValid: true });
  const { isEmpty, isValid } = inputState;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setInputState({ isEmpty: value.length === 0, isValid: validator(value) });
    onChange(event);
  };

  const colorClasses = color === 'primary' ? primaryColorClasses : secondaryColorClasses;

  const getLabelClasses = () => (isEmpty ? (
    'top-1/2 left-4 text-lg text-gray-300'
  ) : (
    `-top-1/4 left-2 text-sm ${isValid ? colorClasses.text : errorColorClasses.text}`
  ));

  const getInputClasses = () => {
    if (isEmpty) return 'border-gray-200';
    if (isValid) return colorClasses.border;
    return errorColorClasses.border;
  };

  return (
    <div className="relative">
      <label
        className={`absolute ${getLabelClasses()} -translate-y-1/2 translate-x-1 left-4 transition-all cursor-text font-light`}
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className={`px-4 py-2 rounded-md border-2 ${getInputClasses()}`}
        onChange={handleChange}
        type="text"
        id={name}
      />
    </div>
  );
};
export default TextInput;
