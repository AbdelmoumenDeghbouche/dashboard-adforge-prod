import React, { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isYou?: boolean;
  avatar: string;
}

const MembersSettings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const members: Member[] = [
    {
      id: '1',
      name: 'Theodrcn',
      email: 'theodrcn@pulsor.agency',
      role: 'Workspace Owner',
      isYou: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    },
    {
      id: '2',
      name: 'Clem',
      email: 'clem@pxperfect.studio',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    },
    {
      id: '3',
      name: 'John Doe',
      email: 'johndoe@pulsor.agency',
      role: 'Invitation pending',
      avatar: ''
    }
  ];

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#0A0A0A]" style={{ fontFamily: 'Geist, sans-serif' }}>
          Members
        </h1>
        <div className="flex flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-[240px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A0A0A]/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-transparent border border-[#0A0A0A]/[0.1] rounded-[12px] text-[14px] focus:outline-none focus:border-[#0A0A0A]/20 transition-all font-medium"
            />
          </div>
          
          {/* Invite Button */}
          <button className="h-10 px-5 bg-black rounded-full text-white text-[14px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
            Invite a member
          </button>
        </div>
      </div>

      {/* Members List Container */}
      <div className="w-full bg-white rounded-[40px] border border-[#0A0A0A]/[0.04] overflow-hidden">
        {filteredMembers.map((member, idx) => (
          <div 
            key={member.id}
            className={`flex flex-row items-center justify-between p-6 ${idx !== filteredMembers.length - 1 ? 'border-b border-[#0A0A0A]/[0.04]' : ''}`}
          >
            <div className="flex flex-row items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden shrink-0 border border-[#0A0A0A]/[0.05]">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#0A0A0A" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="#0A0A0A" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-1.5">
                  <span className="font-bold text-[15px] text-[#0A0A0A]">{member.name}</span>
                  {member.isYou && (
                    <span className="text-[15px] text-[#0A0A0A]/30 font-medium">(You)</span>
                  )}
                </div>
                <span className="text-[14px] text-[#0A0A0A]/40 font-medium">{member.email}</span>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              {/* Role Badge */}
              <div className={`px-4 py-1.5 rounded-full ${member.role === 'Invitation pending' ? 'bg-[#F9F9F9]' : 'bg-[#F2F2F2]'} border border-[#0A0A0A]/[0.02]`}>
                <span className="text-[14px] font-medium text-[#0A0A0A]">{member.role}</span>
              </div>

              {/* More Options */}
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6C10.5523 6 11 5.55228 11 5C11 4.44772 10.5523 4 10 4C9.44772 4 9 4.44772 9 5C9 5.55228 9.44772 6 10 6Z" fill="#0A0A0A" fillOpacity="0.6" stroke="#0A0A0A" strokeOpacity="0.6" strokeWidth="0.5"/>
                  <path d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z" fill="#0A0A0A" fillOpacity="0.6" stroke="#0A0A0A" strokeOpacity="0.6" strokeWidth="0.5"/>
                  <path d="M10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16Z" fill="#0A0A0A" fillOpacity="0.6" stroke="#0A0A0A" strokeOpacity="0.6" strokeWidth="0.5"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersSettings;
