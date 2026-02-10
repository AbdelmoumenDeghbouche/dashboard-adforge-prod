import React from 'react';

const ActionCardNew = ({ 
  title, 
  description, 
  icon, 
  topGradient,
  onClick 
}) => {
  return (
    <button 
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
    >
      {/* Top colored section */}
      <div className="p-4 sm:p-5 md:p-6 flex items-center justify-between relative" style={{ background: topGradient }}>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {icon}
          </div>
          {/* Title */}
          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold font-poppins text-left">
            {title}
          </h3>
        </div>
        
        {/* Arrow icon */}
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      
      {/* Bottom dark section */}
      <div className="bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
        <p className="text-gray-300 text-sm sm:text-base font-poppins text-left">
          {description}
        </p>
      </div>
    </button>
  );
};

export default ActionCardNew;

