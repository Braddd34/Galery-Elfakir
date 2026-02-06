"use client"

import { ReactNode } from "react"

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
  required?: boolean
  hint?: string
}

export default function FormField({ 
  label, 
  error, 
  children, 
  required = false,
  hint 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-wider text-neutral-500">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-neutral-600 text-xs">{hint}</p>
      )}
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// Composant Input avec styles intégrés
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-black border px-4 py-3 text-white focus:outline-none transition-colors ${
        error 
          ? "border-red-500 focus:border-red-400" 
          : "border-neutral-700 focus:border-white"
      } ${className}`}
      {...props}
    />
  )
}

// Composant Textarea avec styles intégrés
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full bg-black border px-4 py-3 text-white focus:outline-none transition-colors resize-none ${
        error 
          ? "border-red-500 focus:border-red-400" 
          : "border-neutral-700 focus:border-white"
      } ${className}`}
      {...props}
    />
  )
}

// Composant Select avec styles intégrés
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full bg-black border px-4 py-3 text-white focus:outline-none transition-colors appearance-none cursor-pointer ${
        error 
          ? "border-red-500 focus:border-red-400" 
          : "border-neutral-700 focus:border-white"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
