import { useState, useEffect, useRef } from 'react';
import { UserCircle, Upload } from 'lucide-react';

const TEAM_MEMBERS = [
  { id: '12403769', name: 'Aditya Kumar Sharma', role: 'Team Leader & Project Lead' },
  { id: '12415691', name: 'Sparsh Gupta', role: 'AI/ML & Risk Intelligence Lead' },
  { id: '12408450', name: 'Lakshya Pandey', role: 'GIS & Geospatial Systems Engineer' },
  { id: '12409999', name: 'Him Sinha', role: 'Computer Vision & Field Verification Engineer' },
  { id: '12409799', name: 'Shagun Singh', role: 'Frontend & UI/UX Engineer' },
  { id: '12411277', name: 'Aaryansh Deval', role: 'Backend & Data Systems Engineer' }
];

const TeamMemberCard = ({ member }: { member: any }) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`team_avatar_${member.id}`);
    if (stored) {
      setAvatar(stored);
    }
  }, [member.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem(`team_avatar_${member.id}`, base64String);
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-sanket-white p-6 rounded-lg border border-sanket-olive shadow-sm flex flex-col items-center text-center">
      <div 
        className="relative mb-4 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sanket-bg shadow-sm bg-gray-50 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={48} className="text-gray-400" />
          )}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload size={20} className="text-white mb-1" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Click to upload</span>
        </div>
      </div>
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageChange}
      />
      <h3 className="font-bold text-lg text-sanket-charcoal">{member.name}</h3>
      <p className="text-sm text-sanket-sage font-medium mt-1">{member.role}</p>
      <div className="mt-3 bg-sanket-bg px-3 py-1 rounded border border-sanket-olive inline-block">
        <span className="text-xs font-mono text-gray-600 font-bold">ID: {member.id}</span>
      </div>
    </div>
  );
};

const Team = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6 border-b border-sanket-olive pb-4">
        <h2 className="text-2xl font-bold text-sanket-charcoal uppercase tracking-widest">SANKET Project Team</h2>
        <p className="text-sm text-gray-500 mt-1">North Eastern Region Early Warning Systems Division</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default Team;
