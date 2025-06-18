export const getContainerClasses = (disabled: boolean, isLoading: boolean, className: string) => {
  return `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
    disabled || isLoading ? 'opacity-50 pointer-events-none' : ''
  } ${className}`.trim();
};