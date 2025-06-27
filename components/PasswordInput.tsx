"use client";

import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`pr-10 ${className}`.trim()}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <HiEyeOff /> : <HiEye />}
      </button>
    </div>
  );
}
