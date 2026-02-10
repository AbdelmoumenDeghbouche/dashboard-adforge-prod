import React from 'react';

interface PageHeaderProps {
  title: string;
  badge?: string;
  description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, badge, description }) => {
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-7">
      <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3">
        {/* Title with Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center">
          <h1 className="font-semibold text-[22px] sm:text-[26px] md:text-[32px] leading-[28px] sm:leading-[32px] md:leading-9 tracking-[-0.025em] text-[#0A0A0A]">
            {title}
          </h1>
          {badge && (
            <div className="flex items-center justify-center px-2 sm:px-2.5 py-0.5 bg-[#06E8DC]/[0.06] rounded-full">
              <span className="font-medium text-[13px] sm:text-[14px] md:text-base leading-[20px] sm:leading-[22px] md:leading-[26px] tracking-[-0.007em] text-[#06E8DC]">
                {badge}
              </span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="font-medium text-[13px] sm:text-[14px] md:text-[16px] leading-[20px] sm:leading-[22px] md:leading-[26px] tracking-[-0.012em] text-[#0A0A0A]/40 text-center max-w-[90vw] sm:max-w-[600px] px-4">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
