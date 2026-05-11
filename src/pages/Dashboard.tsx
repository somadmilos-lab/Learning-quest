import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Link } from 'react-router-dom';
import { Scroll, Users, Play } from 'lucide-react';

export function Dashboard() {
  const courses = useLiveQuery(() => db.courses.reverse().toArray());

  return (
    <div className="space-y-6">
      <div className="rpg-panel p-6 border-l-8 border-l-[var(--color-rpg-accent)]">
        <h2 className="font-rpg text-3xl text-[var(--color-rpg-accent)] mb-2">Quest Log</h2>
        <p className="opacity-80">Welcome to your learning dashboard. Here you will find your uploaded lore and quests. Select a quest to begin your study session.</p>
      </div>

      {!courses ? (
        <div className="text-center font-rpg p-8">Loading Grimoire...</div>
      ) : courses.length === 0 ? (
        <div className="rpg-panel-inset p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Scroll className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="font-rpg text-2xl text-gray-400 mb-4">Your quest log is empty</h3>
          <Link to="/upload" className="rpg-btn px-6 py-3 text-lg text-green-400">
            Commence your first quest
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="rpg-panel p-4 flex flex-col hover:border-[var(--color-rpg-accent)] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-rpg text-2xl truncate pr-4 text-[var(--color-rpg-accent)]">{course.title}</h3>
                <Scroll className="w-6 h-6 shrink-0 opacity-50" />
              </div>
              <p className="text-sm opacity-70 mb-4 flex-1">{course.summary.slice(0, 120)}...</p>
              
              <div className="mt-auto flex gap-2">
                <Link to={`/course/${course.id}`} className="rpg-btn px-3 py-2 flex-1 text-center flex items-center justify-center gap-2 text-sm">
                  <Play className="w-4 h-4" /> Study
                </Link>
                <Link to={`/collab/${course.id}`} className="rpg-btn px-3 py-2 flex items-center justify-center gap-2 text-sm bg-blue-900 border-blue-400" title="Co-op Study">
                  <Users className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
