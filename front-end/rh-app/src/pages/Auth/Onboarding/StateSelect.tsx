"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Puducherry",
  "Delhi",
  "Ladakh",
  "Jammu and Kashmir",
]

interface StateSelectProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  disabled?: boolean
}

export default function StateSelect({
  id,
  label,
  value,
  onChange,
  placeholder = "Select a state",
  disabled,
}: StateSelectProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="font-medium">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "mt-2 w-full px-3 py-2 rounded-md border border-input bg-transparent text-foreground",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "dark:focus:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <option className="dark:bg-background" value="">{placeholder}</option>
        {INDIAN_STATES.map((state) => (
          <option className="dark:bg-background" key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </div>
  )
}
