import React, { useState } from 'react';

const WorkspaceSettings: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('Pulsor Inc.');

  return (
    <div className="w-full max-w-full sm:max-w-[800px] flex flex-col gap-5 sm:gap-6 px-3 sm:px-0">
      <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.025em] text-[#0A0A0A] leading-[24px] sm:leading-[27px]" style={{ fontFamily: 'Geist, sans-serif' }}>
        Workspace
      </h1>

      <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-4 sm:p-5 md:p-6 flex flex-col gap-5 sm:gap-6 border border-[#0A0A0A]/[0.06]">
        {/* Workspace Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
          <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-5 w-full sm:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center overflow-hidden shrink-0">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-8 sm:h-8">
                <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM17.11 15.01C16.81 15.65 16.27 16.14 15.62 16.42L11 18.5V11L16.5 5.5C17.42 6.42 18 7.64 18 9C18 10.36 17.65 11.59 17.11 12.61L17.11 15.01Z" fill="white"/>
                <path d="M9 11V18.5L4.38 16.42C3.73 16.14 3.19 15.65 2.89 15.01L2.89 12.61C2.35 11.59 2 10.36 2 9C2 7.64 2.58 6.42 3.5 5.5L9 11Z" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-[14px] sm:text-[15px] md:text-[16px] text-[#0A0A0A]">Workspace profile picture</span>
              <span className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0A0A0A]/40">Min 400x400px, PNG or JPEG</span>
            </div>
          </div>
          <button className="w-full sm:w-auto px-4 sm:px-5 h-[42px] sm:h-[44px] md:h-[48px] border border-[#0A0A0A]/[0.06] rounded-full font-medium text-[13px] sm:text-[14px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors whitespace-nowrap">
            Import a new image
          </button>
        </div>

        {/* Workspace Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] sm:text-[14px] font-medium text-[#0A0A0A] px-1">Name</label>
          <input 
            type="text" 
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full h-[42px] sm:h-[44px] md:h-[48px] px-4 sm:px-5 bg-transparent border border-[#0A0A0A]/[0.06] rounded-[14px] sm:rounded-[16px] font-medium text-[14px] sm:text-[15px] md:text-[16px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/20 transition-all"
          />
        </div>

        {/* Delete Workspace Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-0.5 text-center sm:text-left w-full sm:w-auto">
            <span className="font-semibold text-[14px] sm:text-[15px] md:text-[16px] text-[#0A0A0A]">Delete workspace</span>
            <span className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0A0A0A]/40">This action is irreversible and you will lose all your data.</span>
          </div>
          <button className="flex flex-row items-center justify-center gap-2 text-[#FB3748] hover:opacity-80 transition-opacity w-full sm:w-auto h-[42px] sm:h-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[18px] sm:h-[18px] shrink-0">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium text-[13px] sm:text-[14px]">Delete the workspace</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1 sm:pt-2">
          <button className="flex-1 h-[42px] sm:h-[44px] md:h-[48px] border border-[#0A0A0A]/[0.06] rounded-[14px] sm:rounded-[16px] font-semibold text-[14px] sm:text-[15px] md:text-[16px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors">
            Cancel
          </button>
          <button className="flex-1 h-[42px] sm:h-[44px] md:h-[48px] bg-[#0A0A0A]/[0.04] rounded-[14px] sm:rounded-[16px] font-semibold text-[14px] sm:text-[15px] md:text-[16px] text-[#0A0A0A]/20 cursor-not-allowed transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
