import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import Markdown from 'react-markdown';
import { Users, Send, ArrowLeft, Bot, User, Edit3 } from 'lucide-react';

export function CollabRoom() {
  const { id } = useParams();
  const courseId = Number(id);
  const course = useLiveQuery(() => db.courses.get(courseId), [courseId]);
  
  const [chat, setChat] = useState<{name: string, text: string, isMe: boolean}[]>([
    { name: 'System', text: 'Welcome to the Guild Hall. You are in a simulated co-op instance since the multiplayer crystal (Firebase) is currently fractured.', isMe: false },
    { name: 'Mage_Alex', text: 'Hey! Ready to study this artifact together?', isMe: false },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Shared notepad state
  const [notes, setNotes] = useState('## Shared Party Notes\n\n- The summary focuses heavily on the first few chapters.\n- Remember to prepare for the boss quiz!');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  if (course === undefined) return <div className="p-12 font-rpg text-xl text-center">Opening Guild Hall...</div>;
  if (course === null) return <div className="p-12 font-rpg text-xl text-center">Quest not found.</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    
    setChat(prev => [...prev, { name: 'You', text: input, isMe: true }]);
    setInput('');

    // Simulate response
    setTimeout(() => {
      const responses = [
        "That's a good point! I'll add it to the shared notes.",
        "I was thinking the exact same thing.",
        "Does anyone understand the third paragraph?",
        "Make sure your HP is full before taking the quiz.",
        "Buffing intelligence with a swiftness potion..."
      ];
      const randomRes = responses[Math.floor(Math.random() * responses.length)];
      setChat(prev => [...prev, { name: 'Mage_Alex', text: randomRes, isMe: false }]);
      
      if(randomRes.includes("I'll add it")) {
         setNotes(prev => prev + `\n- ${input} (Added by Alex)`);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-160px)]">
      
      {/* Document & Shared Notes (Left Panel) */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Source Material */}
        <div className="flex-1 rpg-panel bg-[#1a1c23]/80 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b-4 border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] flex justify-between items-center z-10 shrink-0">
            <h2 className="font-rpg text-xl text-[var(--color-rpg-accent)] flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Party View: {course.title}
            </h2>
            <Link to="/" className="rpg-btn px-3 py-1 flex items-center gap-1 text-sm bg-gray-700">
              <ArrowLeft className="w-4 h-4" /> Flee
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="markdown-body opacity-80 text-sm">
              <Markdown>{course.summary}</Markdown>
            </div>
          </div>
        </div>

        {/* Co-op Notepad */}
        <div className="h-64 rpg-panel bg-[#1a1c23] flex flex-col shrink-0">
          <div className="p-2 border-b-4 border-[var(--color-rpg-border)] bg-[#2b2d35]">
            <h3 className="font-rpg text-lg text-green-400 flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Party Grimoire (Shared Notes)
            </h3>
          </div>
          <textarea 
            className="flex-1 w-full bg-transparent p-4 focus:outline-none resize-none font-mono text-sm text-green-100"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

      </div>

      {/* Guild Chat (Right Panel) */}
      <div className="w-full lg:w-[350px] rpg-panel flex flex-col shrink-0 h-full">
        <div className="p-3 border-b-4 border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)]">
          <h3 className="font-rpg text-xl text-[var(--color-rpg-mana)]">Guild Chat</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              <span className={`text-xs mb-1 opacity-70 font-rpg ${msg.name === 'System' ? 'text-yellow-500' : ''}`}>
                {msg.name}
              </span>
              <div className={`p-3 text-sm rounded max-w-[90%] ${
                msg.name === 'System' ? 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-200' :
                msg.isMe ? 'bg-[#2b2d35] border border-blue-900' : 'bg-[#1a1c23] border border-gray-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t-4 border-[var(--color-rpg-border)] bg-[#1a1c23] flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Send message..."
            className="flex-1 bg-[var(--color-rpg-panel)] border-2 border-[var(--color-rpg-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-rpg-accent)]"
          />
          <button type="submit" disabled={!input.trim()} className="rpg-btn px-4 bg-[var(--color-rpg-accent)] text-black border-yellow-700 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
