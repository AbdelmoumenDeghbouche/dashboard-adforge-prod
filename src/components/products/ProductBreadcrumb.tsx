import React from 'react';

interface BreadcrumbProps {
  paths: string[];
}

const ProductBreadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
  return (
    <div className="flex items-center gap-2 px-2.5 h-5">
      {/* Unified Company Logo - 20x20px */}
      <div className="w-5 h-5 flex items-center justify-center">
        <img src="/icons/Pulsor Inc.svg" alt="Pulsor Logo" className="w-full h-full" />
      </div>

      {/* Path Segments */}
      {paths.map((path, index) => (
        <React.Fragment key={index}>
          <span className="font-medium text-[12px] leading-4 tracking-[-0.007em] text-[#0A0A0A]">
            {path}
          </span>
          {index < paths.length - 1 && (
            <span className="text-[#0A0A0A]/35 text-[12px]">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProductBreadcrumb;
