// apps/admin/src/components/form/FormCheckbox.tsx

interface FormCheckboxProps {
  checked?: boolean;
  disabled?: boolean;
}

export function FormCheckbox({ checked = false, disabled = false }: FormCheckboxProps) {
  return (
    <div
      className={`w-4 h-4 border-2 border-black flex items-center justify-center flex-shrink-0 ${
        disabled ? "bg-gray-100" : "bg-white"
      }`}
      style={{
        printColorAdjust: "exact",
      }}
    >
      {checked && (
        <span className="text-black text-xs font-bold leading-none">✓</span>
      )}
    </div>
  );
}
