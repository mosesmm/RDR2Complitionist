

import React from 'react';
import { cn } from './utils';

export function isUrl(str: string): boolean {
    if (typeof str !== 'string') return false;
    try {
        new URL(str);
        return str.startsWith('http') || str.startsWith('data:');
    } catch (_) {
        return false;
    }
};

export const SvgIcon = ({ paths, className, size = 24 }: { paths: string[], className?: string, size?: number }) => {
    if (!paths || paths.length === 0) return null;
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 1024 1024" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("fill-current", className)}
      >
        {paths.map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
};
