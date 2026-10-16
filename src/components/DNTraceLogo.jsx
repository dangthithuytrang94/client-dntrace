import React, { useState } from 'react';

export default function DNTraceLogo({ className = "h-9", isWhite = false }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imageError ? (
        <img
          src="/assets/dntrace_logo_header.png"
          alt="dntrace.com"
          className="h-8 sm:h-10 md:h-12 w-auto max-w-[145px] sm:max-w-[220px] object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#84CC16] text-[#0f2d22] font-black flex items-center justify-center text-sm shadow-sm">
            DN
          </div>
          <span className={`text-xl font-black tracking-tight ${isWhite ? 'text-white' : 'text-[#0f2d22]'}`}>
            dn<span className="text-[#84CC16]">trace</span>
            <span className={`text-xs font-semibold ${isWhite ? 'text-[#DFCA9B]' : 'text-stone-500'}`}>.com</span>
          </span>
        </div>
      )}
    </div>
  );
}
