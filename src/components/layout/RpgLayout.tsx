import { Outlet, Link } from 'react-router-dom';
import { usePlayerStore } from '../../lib/store';
import { Heart, Star, UploadCloud, UserCircle } from 'lucide-react';
import { AVATARS } from '../../lib/icons';

export function RpgLayout() {
  const { xp, level, health, maxHealth, name, avatar } = usePlayerStore();
  
  const xpRequiredForNextLevel = level * 100;
  const xpProgress = (xp / xpRequiredForNextLevel) * 100;
  const hpProgress = (health / maxHealth) * 100;

  const AvatarIcon = AVATARS[avatar] || AVATARS['Shield'];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 max-w-5xl mx-auto">
      {/* Top HUD */}
      <header className="rpg-panel w-full p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#2b2d35]">
        
        {/* Player Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link to="/profile" className="w-16 h-16 bg-gray-800 border-2 border-[var(--color-rpg-border)] flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer" title="Edit Profile">
            <AvatarIcon className="w-10 h-10 text-[var(--color-rpg-accent)]" />
          </Link>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <Link to="/profile" className="font-rpg text-xl text-[var(--color-rpg-accent)] hover:underline">{name}</Link>
              <span className="font-rpg text-sm">LVL {level}</span>
            </div>
            {/* HP Bar */}
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-full md:w-32 h-3 bg-gray-900 border border-[var(--color-rpg-border)]">
                <div 
                  className="h-full bg-[var(--color-rpg-health)] transition-all duration-300"
                  style={{ width: `${hpProgress}%` }}
                />
              </div>
            </div>
            {/* XP Bar */}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <div className="w-full md:w-32 h-3 bg-gray-900 border border-[var(--color-rpg-border)] relative">
                <div 
                  className="h-full bg-[var(--color-rpg-xp)] transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
                <span className="font-rpg text-[10px] absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                  {xp} / {xpRequiredForNextLevel} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex gap-4">
          <Link to="/" className="rpg-btn px-4 py-2 flex items-center gap-2">
            Home Base
          </Link>
          <Link to="/upload" className="rpg-btn px-4 py-2 flex items-center gap-2 text-green-400">
            <UploadCloud className="w-4 h-4" />
            New Quest (Upload)
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      <footer className="mt-8 text-center opacity-50 font-rpg text-sm">
        <p>A Scholar's Journey - RPG Learning</p>
      </footer>
    </div>
  );
}
