import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import Markdown from 'react-markdown';
import { answerQuestion } from '../lib/ai';
import { Swords, Send, User, Bot, ArrowLeft, BookOpen, ScrollText } from 'lucide-react';

export function Course() {
  const { id } = useParams();
  const courseId = Number(id);
  const course = useLiveQuery(() => db.courses.get(courseId), [courseId]);
  
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [asking, setAsking] = useState(false);

  if (course === undefined) return <div className="p-12 font-rpg text-xl text-center">Opening the Tome...</div>;
  if (course === null) return <div className="p-12 font-rpg text-xl text-center">Quest not found.</div>;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const q = question;
    setQuestion('');
    setChat(prev => [...prev, { role: 'user', text: q }]);
    setAsking(true);

    try {
      const answer = await answerQuestion(course.fileData, course.mimeType, q);
      setChat(prev => [...prev, { role: 'bot', text: answer }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'bot', text: "The connection to the arcane was disrupted. Cannot answer right now." }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full h-[calc(100vh-160px)]">
      
      {/* Scroll of Knowledge (Left Panel) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden rpg-panel bg-[#1a1c23]/80 backdrop-blur-sm relative">
        <div className="p-4 border-b-4 border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] flex justify-between items-center z-10 shrink-0">
          <h2 className="font-rpg text-3xl text-[var(--color-rpg-accent)] flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> {course.title}
          </h2>
          <Link to="/" className="rpg-btn px-3 py-1 flex items-center gap-1 text-sm bg-gray-700">
            <ArrowLeft className="w-4 h-4" /> Return
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="markdown-body text-gray-300">
            <Markdown>{course.summary}</Markdown>
          </div>
        </div>
      </div>

      {/* Action / Q&A Panel (Right Panel) */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 h-full">

        {/* Enter Quiz Battle */}
        <div className="rpg-panel p-6 bg-red-900/20 border-red-500/50 flex flex-col items-center justify-center text-center gap-4 shrink-0">
          <h3 className="font-rpg text-2xl text-[var(--color-rpg-accent)] flex items-center gap-2">
            <Swords className="w-6 h-6 text-red-500" /> Trial of Knowledge
          </h3>
          <p className="text-sm opacity-80">Test your wits against the dungeon generated from this text.</p>
          <Link to={`/course/${course.id}/quiz`} className="rpg-btn px-6 py-3 w-full text-center text-red-400 border-red-900 bg-red-950/50 hover:bg-red-900">
            Enter the Dungeon
          </Link>
        </div>

        {/* Archmage Chat */}
        <div className="rpg-panel flex flex-col h-full min-h-[300px] overflow-hidden">
          <div className="p-3 border-b-4 border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)]">
            <h3 className="font-rpg text-xl text-[var(--color-rpg-mana)] flex items-center gap-2">
              <ScrollText className="w-5 h-5" /> Consult the Archmage
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.length === 0 ? (
              <p className="text-sm opacity-50 text-center italic mt-10">Ask a question about the text.</p>
            ) : (
              chat.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded border-2 shrink-0 flex items-center justify-center
                    ${msg.role === 'user' ? 'border-green-500 bg-green-900/50' : 'border-blue-500 bg-blue-900/50'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-green-300" /> : <Bot className="w-4 h-4 text-blue-300" />}
                  </div>
                  <div className={`p-3 text-sm rounded ${msg.role === 'user' ? 'bg-[#2b2d35] border border-green-900' : 'bg-[#1a1c23] border border-blue-900'}`}>
                    <div className="markdown-body !text-sm">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {asking && (
              <div className="flex gap-3 flex-row">
                 <div className="w-8 h-8 rounded border-2 border-blue-500 bg-blue-900/50 shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-300 animate-pulse" />
                  </div>
                  <div className="p-3 text-sm rounded bg-[#1a1c23] border border-blue-900">
                    <span className="italic opacity-50">Sifting through the ancient scrolls...</span>
                  </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="p-3 border-t-4 border-[var(--color-rpg-border)] bg-[#1a1c23] flex gap-2">
            <input 
              type="text" 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-[var(--color-rpg-panel)] border-2 border-[var(--color-rpg-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-rpg-accent)]"
              disabled={asking}
            />
            <button type="submit" disabled={asking || !question.trim()} className="rpg-btn px-4 bg-[var(--color-rpg-mana)] text-black border-blue-800 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
