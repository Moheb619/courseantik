import React from "react";
import { cls } from "../../utils/cls";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      className = "",
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-brand hover:shadow-lg",
      secondary:
        "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500",
      outline:
        "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-brand-500",
      ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-brand-500",
      danger: "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500",
      success:
        "bg-success-500 text-white hover:bg-success-600 focus:ring-success-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const animationClasses = prefersReducedMotion
      ? ""
      : "hover:scale-105 active:scale-95";

    const classes = cls(
      baseClasses,
      variants[variant],
      sizes[size],
      animationClasses,
      fullWidth && "w-full",
      className
    );

    const handleClick = (e) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
