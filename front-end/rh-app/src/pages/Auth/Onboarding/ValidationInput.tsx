"use client";

import type React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ValidationInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "decimal";
  validator?: (val: string) => boolean;
  helperText?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

export default function ValidationInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  validator,
  helperText,
  readOnly,
  disabled,
}: ValidationInputProps) {
  // Show validation status only if field has content
  const isValid =
    (value?.length ?? 0) > 0 && validator ? validator(value) : null;
  const isEmpty = (value?.length ?? 0) === 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        {!isEmpty && isValid === true && (
          <Check className="h-4 w-4 text-emerald-600" aria-label="Valid" />
        )}
        {!isEmpty && isValid === false && (
          <X className="h-4 w-4 text-red-600" aria-label="Invalid" />
        )}
      </div>

      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={cn(
          "mt-2",
          !isEmpty &&
            isValid === true &&
            "border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-100",
          !isEmpty &&
            isValid === false &&
            "border-red-500 dark:border-red-400 text-red-900 dark:text-red-100"
        )}
      />

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {!isEmpty && isValid === false && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{`Invalid ${label.toLowerCase()}`}</p>
      )}
    </div>
  );
}
