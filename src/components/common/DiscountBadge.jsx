import React from 'react';
import { Tag } from 'lucide-react';

const DiscountBadge = ({ percentage, className = "" }) => {
  if (!percentage || percentage <= 0) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] sm:text-xs font-bold shadow-sm ${className}`}>
      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      <span>{percentage}% OFF</span>
    </div>
  );
};

export default DiscountBadge;
