import * as React from "react"

import { cn } from "../utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "form-textarea",
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
Textarea.displayName = "Textarea"

export { Textarea }