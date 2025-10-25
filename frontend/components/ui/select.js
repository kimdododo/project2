import React from 'react';

export const Select = ({ children, value, onValueChange, ...props }) => (
  <div className="relative" {...props}>
    {children}
  </div>
);

export const SelectTrigger = ({ className = '', children, ...props }) => (
  <button
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SelectValue = ({ placeholder, ...props }) => (
  <span className="text-muted-foreground" {...props}>
    {placeholder}
  </span>
);

export const SelectContent = ({ className = '', children, ...props }) => (
  <div className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`} {...props}>
    {children}
  </div>
);

export const SelectItem = ({ className = '', children, value, ...props }) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    data-value={value}
    {...props}
  >
    {children}
  </div>
);
