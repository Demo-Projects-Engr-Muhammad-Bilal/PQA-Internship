interface FormFieldProps {
  value?: string | number | null;
  placeholder?: string;
  unit?: string;
  fullWidth?: boolean;
  isCyan?: boolean; // NEW: Toggle cyan + bold styling for dynamic data
}

export function FormField({
  value,
  placeholder = '',
  unit = '',
  fullWidth = false,
  isCyan = false,
}: FormFieldProps) {
  const displayValue = value ? String(value).trim() : '';
  
  return (
    <div className={`flex items-center gap-1 ${fullWidth ? 'w-full' : ''}`}>
      <div
        className={`flex-1 border-b border-black pb-px text-[11px] leading-tight ${
          isCyan
            ? 'text-cyan-600 font-bold'
            : 'text-black font-normal'
        }`}
        style={{
          minHeight: '18px',
          display: 'flex',
          alignItems: 'center',
          printColorAdjust: 'exact',
        }}
      >
        <span>{displayValue || placeholder}</span>
      </div>
      {unit && <span className={`text-[11px] ml-1 ${isCyan ? 'text-cyan-600 font-bold' : 'text-black font-normal'}`}>{unit}</span>}
    </div>
  );
}