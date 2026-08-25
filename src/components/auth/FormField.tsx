interface FormFieldProps {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = ({ label, icon: Icon, required = false, children }: FormFieldProps) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {label} {!required && <span className="normal-case tracking-normal font-normal">(opsiyonel)</span>}
    </label>
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
      {children}
    </div>
  </div>
);
