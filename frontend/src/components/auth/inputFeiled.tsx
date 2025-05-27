export const InputField = ({ 
  type, 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  showPasswordToggle = false,
  isPasswordVisible = false,
  onToggleVisibility = () => {}
}: {
  type: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onToggleVisibility?: () => void;
}) => {
  const inputId = `input-${name}`;
  
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type={showPasswordToggle && isPasswordVisible ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 bg-white/5 border ${
            error ? "border-red-500" : "border-white/10"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
            onClick={onToggleVisibility}
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};