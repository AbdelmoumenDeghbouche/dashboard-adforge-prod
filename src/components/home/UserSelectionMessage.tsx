import React from 'react';

interface UserSelectionMessageProps {
  label: string;
  value: string;
}

const UserSelectionMessage: React.FC<UserSelectionMessageProps> = ({ label, value }) => {
  return (
    <div className="flex justify-end w-full">
      <div className="px-4 py-3.5 bg-[#0A0A0A]/[0.04] rounded-[20px_20px_8px_20px] max-w-[560px]">
        <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">
          {label}: "{value}"
        </p>
      </div>
    </div>
  );
};

export default UserSelectionMessage;
