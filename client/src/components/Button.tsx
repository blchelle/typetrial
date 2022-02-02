import React, { useState } from 'react';

interface ButtonProps {
  text: string;
  isAsync?: boolean;
  isDisabled?: boolean;
  onClick: (callback?: () => void) => void;
  color?: 'primary' | 'secondary';
  type?: 'solid' | 'border' | 'ghost';
  style?: React.CSSProperties;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

const Button: React.FC<ButtonProps> = ({
  color = 'primary',
  Icon,
  isAsync = false,
  isDisabled = false,
  onClick,
  style,
  text,
  type = 'solid',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const dynamicButtonStyles = () => {
    const classes = [];
    if (isDisabled || isLoading) classes.push('cursor-auto');

    if (type === 'border') classes.push('border-2');
    if (type === 'solid') classes.push('text-white');

    if (isDisabled && (type === 'border' || type === 'ghost')) classes.push('text-gray-400');
    if (!isDisabled && (type === 'border' || type === 'ghost')) classes.push(`text-${color}`);
    if (!isDisabled && !isLoading && (type === 'border' || type === 'ghost')) classes.push(`hover:bg-${color}-transparent`);

    if (isDisabled && type === 'border') classes.push('border-gray-400');
    if (!isDisabled && type === 'border') classes.push(`border-${color}`);

    if (isDisabled && type === 'solid') classes.push('bg-gray-400');
    if (!isDisabled && type === 'solid') classes.push(`bg-${color}`, `hover:bg-${color}`);

    return classes.join(' ');
  };

  const dynamicLoadingStyles = () => {
    if (type === 'solid') return `loader-${color}`;
    return `loader-${color}-transparent`;
  };

  const handleClick = async () => {
    if (isDisabled || isLoading) return;

    if (isAsync) {
      setIsLoading(true);
      onClick(() => setIsLoading(false));
    } else {
      onClick();
    }
  };

  return (
    <button
      className={`relative flex items-center justify-between w-fit h-fit px-4 py-2 font-bold rounded-lg transition overflow-hidden ${dynamicButtonStyles()}`}
      style={style}
      onClick={handleClick}
      disabled={isDisabled}
    >
      { isLoading && <div className={`absolute top-0 left-0 w-3/2 h-full animate-load z-10 ${dynamicLoadingStyles()}`} />}
      <p className="z-10">{text}</p>
      {Icon && <Icon className="z-10 h-fit w-6 ml-2 text-gray-1 fill-current" />}
    </button>
  );
};

export default Button;
