// components/resume/forms/utils/styling.ts
export const getFieldClasses = (hasError: boolean, isSaving: boolean) => {
  const baseClasses = "flex items-center rounded-lg border-2 transition-all duration-200 group";
  const normalClasses = "border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400";
  const errorClasses = "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20";
  const disabledClasses = isSaving ? "opacity-60 cursor-not-allowed" : "";

  return `${baseClasses} ${hasError ? errorClasses : normalClasses} ${disabledClasses}`;
};

export const getInputClasses = () =>
  "border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3";

export const getIconClasses = () =>
  "w-4 h-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400";
