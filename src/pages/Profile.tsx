import { useState } from 'react';
import { usePlayerStore } from '../lib/store';
import { AVATARS, AVATAR_NAMES } from '../lib/icons';
import { Save, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { name, avatar, setName, setAvatar } = usePlayerStore();
  const [editName, setEditName] = useState(name);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      setName(editName.trim());
    }
    setAvatar(selectedAvatar);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="rpg-panel p-6 border-l-8 border-l-[var(--color-rpg-accent)]">
        <h2 className="font-rpg text-3xl text-[var(--color-rpg-accent)] mb-2 flex items-center gap-2">
          <UserCircle className="w-8 h-8" />
          Adventurer Profile
        </h2>
        <p className="opacity-80">Customize your identity in the realm of knowledge.</p>
      </div>

      <form onSubmit={handleSave} className="rpg-panel p-6 space-y-8 bg-[#2b2d35]">
        
        {/* Name Input */}
        <div className="space-y-4">
          <label className="font-rpg text-2xl text-[var(--color-rpg-mana)] block">
            Known Alias
          </label>
          <input 
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-[#1a1c23] border-2 border-[var(--color-rpg-border)] px-4 py-3 text-lg focus:outline-none focus:border-[var(--color-rpg-accent)] font-rpg"
            placeholder="Enter your hero's name"
            maxLength={20}
          />
        </div>

        {/* Avatar Selection */}
        <div className="space-y-4">
          <label className="font-rpg text-2xl text-[var(--color-rpg-mana)] block">
            Choose Your Crest
          </label>
          <div className="grid grid-cols-4 gap-4">
            {AVATAR_NAMES.map((avatarName) => {
              const Icon = AVATARS[avatarName];
              const isSelected = selectedAvatar === avatarName;
              return (
                <button
                  type="button"
                  key={avatarName}
                  onClick={() => setSelectedAvatar(avatarName)}
                  className={`flex flex-col items-center justify-center p-4 border-4 transition-all ${
                    isSelected 
                      ? 'border-[var(--color-rpg-accent)] bg-[#3b3f4a] transform -translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' 
                      : 'border-[var(--color-rpg-border)] bg-[#1a1c23] opacity-70 hover:opacity-100 hover:bg-[#2b2d35]'
                  }`}
                >
                  <Icon className={`w-10 h-10 mb-2 ${isSelected ? 'text-[var(--color-rpg-accent)]' : 'text-gray-400'}`} />
                  <span className="font-rpg text-sm">{avatarName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-4 border-t-2 border-[var(--color-rpg-border)] flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="rpg-btn px-6 py-2 bg-gray-700 text-white border-gray-500"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="rpg-btn px-6 py-2 bg-[var(--color-rpg-accent)] text-black border-yellow-700 flex items-center gap-2 font-bold"
          >
            <Save className="w-5 h-5" />
            Save Identity
          </button>
        </div>

      </form>
    </div>
  );
}
