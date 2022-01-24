import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large' | 'fit';
  type?: 'solid' | 'border' | 'ghost';
  style?: React.CSSProperties;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

const Button: React.FC<ButtonProps> = ({
  text, onClick, color = 'primary', type = 'solid', size = 'medium', style, Icon,
}) => {
  const getColorClass = () => {
    // Ghost cancels out the color class
    if (type === 'ghost') return 'bg-transparent hover:bg-gray-100 text-gray-700';

    if (color === 'primary' && type === 'solid') return 'bg-primary hover:bg-primary-dark';
    if (color === 'primary' && type === 'border') return 'border-primary hover:bg-primary border-2 text-primary hover:text-white';
    if (color === 'secondary' && type === 'solid') return 'bg-secondary hover:bg-secondary-dark';
    if (color === 'secondary' && type === 'border') return 'border-secondary hover:bg-secondary border-2 text-secondary hover:text-white';

    return '';
  };

  const getSizeClass = () => {
    if (size === 'small') return 'w-max h-8';
    if (size === 'medium') return 'w-max h-12';
    if (size === 'large') return 'w-max h-16';

    return 'w-max h-auto';
  };

  return (
    <button
      className={`flex items-center justify-between text-md text-white px-6 py-2 font-bold rounded-lg cursor-pointer transition ${getColorClass()} ${getSizeClass()}`}
      style={style}
      onClick={onClick}
    >
      {text}
      {Icon && <Icon className="h-10 w-10 ml-4 text-gray-1 fill-current" />}
    </button>
  );
};

export default Button;
