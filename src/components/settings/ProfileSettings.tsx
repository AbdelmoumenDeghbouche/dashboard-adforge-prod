import React, { useState } from 'react';

const ProfileSettings: React.FC = () => {
  const [fullName, setFullName] = useState('Théo Dourecannou');
  const [email, setEmail] = useState('theodrcn@pulsor.agency');

  return (
    <div className="w-full max-w-[800px] flex flex-col gap-5">
      <h1 className="text-[20px] font-semibold tracking-[-0.025em] text-[#0A0A0A]" style={{ fontFamily: 'Geist, sans-serif' }}>
        Profile
      </h1>

      <div className="w-full bg-white rounded-[40px] p-6 flex flex-col gap-6 border border-[#0A0A0A]/[0.06]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-row items-center gap-5">
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 16.66 14.67 14 12 14Z" fill="#D1D1D1"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[16px] text-[#0A0A0A]">Profile picture</span>
              <span className="text-[14px] text-[#0A0A0A]/40">Min 400x400px, PNG or JPEG</span>
            </div>
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 border border-[#0A0A0A]/[0.06] rounded-full font-medium text-[14px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors">
            Import a profile picture
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#0A0A0A] px-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-[48px] px-5 bg-transparent border border-[#0A0A0A]/[0.06] rounded-[16px] font-medium text-[16px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#0A0A0A] px-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[48px] px-5 bg-transparent border border-[#0A0A0A]/[0.06] rounded-[16px] font-medium text-[16px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button className="flex-1 h-[48px] border border-[#0A0A0A]/[0.06] rounded-[16px] font-semibold text-[16px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors">
            Cancel
          </button>
          <button className="flex-1 h-[48px] bg-[#0A0A0A] rounded-[16px] font-semibold text-[16px] text-white hover:bg-[#0A0A0A]/90 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
