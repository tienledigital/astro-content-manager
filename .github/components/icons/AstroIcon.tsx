import React from 'react';

export const AstroIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    {...props}
  >
    <circle cx="12" cy="12" r="8" />
    <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-30 12 12)" />
  </svg>
);
