import React, { useState } from "react";

interface CustomCheckboxProps {
  id: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id,
  checked = false,
  onChange,
  onLabel = "Yeah!",
  offLabel = "Nope",
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <div className="relative inline-block w-16 h-8 select-none">
      <input className="hidden" id={id} type="checkbox" checked={isChecked} onChange={handleChange} />
      <label
        className={`
          block overflow-hidden h-8 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer
          transition-colors duration-300 ease-in-out
          ${isChecked ? "bg-green-400 dark:bg-green-600" : "bg-red-400 dark:bg-red-600"}
        `}
        htmlFor={id}
      >
        <span
          className={`
            absolute top-0 left-0 flex items-center justify-center w-16 h-8 text-sm font-bold text-white
            transition-opacity duration-300 ease-in-out
            ${isChecked ? "opacity-100" : "opacity-0"}
          `}
        >
          {onLabel}
        </span>
        <span
          className={`
            absolute top-0 left-0 flex items-center justify-center w-16 h-8 text-sm font-bold text-white
            transition-opacity duration-300 ease-in-out
            ${isChecked ? "opacity-0" : "opacity-100"}
          `}
        >
          {offLabel}
        </span>
      </label>
    </div>
  );
};
