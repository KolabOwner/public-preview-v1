import * as React from "react"

import { cn } from "../utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "form-input",
            error && "border-destructive focus:ring-destructive/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
        {hint && <p className="form-hint">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }