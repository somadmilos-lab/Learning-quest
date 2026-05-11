import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { generateLearningMaterial, generateQuiz } from '../lib/ai';
import { Upload as UploadIcon, Loader2, FileText, FileVideo, ShieldAlert } from 'lucide-react';

export function Upload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Warning about large files primarily due to client side + GenAI API limits inline 
    // Gemini 2.5/3.1 flash/pro handle up to 20MB inline, but we want to be safe in browser memory
    if (file.size > 8 * 1024 * 1024) {
      setError('File is too large for the client-side prototype. Please use a file smaller than 8MB.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      setStatus('Extracting arcane properties...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        
        try {
          setStatus('Deciphering texts (Generating Summary)...');
          const summary = await generateLearningMaterial(base64Data, file.type, file.name);
          
          setStatus('Forging trials (Generating Quiz)...');
          const questions = await generateQuiz(base64Data, file.type);
          
          setStatus('Binding artifact to Grimoire... (Saving)');
          
          const courseId = await db.courses.add({
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileData: base64Data,
            mimeType: file.type,
            summary,
            createdAt: new Date()
          });

          await db.quizzes.add({
            courseId: Number(courseId),
            questions,
            completed: false,
            score: 0
          });

          navigate(`/course/${courseId}`);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'The artifact was too chaotic to decode. Check console.');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read artifact.');
        setLoading(false);
      }
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Initialization failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h2 className="font-rpg text-4xl text-[var(--color-rpg-accent)]">Artifact Identification</h2>
        <p className="opacity-80">Upload a PDF, Text, or Document. The Archmage AI will extract the knowledge into a digestible curriculum.</p>
      </div>

      <div className="rpg-panel p-8 text-center relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="w-12 h-12 text-[var(--color-rpg-accent)] animate-spin" />
            <h3 className="font-rpg text-2xl text-[var(--color-rpg-accent)] animate-pulse">
              {status}
            </h3>
            <div className="w-full h-2 bg-gray-900 border border-[var(--color-rpg-border)] relative overflow-hidden mt-4">
              <div className="absolute inset-0 bg-[var(--color-rpg-mana)] animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center space-y-4 py-12 cursor-pointer group">
            <div className="bg-[#1a1c23] p-4 rounded-full border-2 border-[var(--color-rpg-border)] group-hover:bg-[var(--color-rpg-accent)] group-hover:text-black transition-colors">
              <UploadIcon className="w-12 h-12" />
            </div>
            <h3 className="font-rpg text-2xl group-hover:text-[var(--color-rpg-accent)] transition-colors">Click to Upload Relic</h3>
            <p className="text-sm opacity-60">PDF, TXT, image (max 8MB)</p>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt,image/*" 
              onChange={handleFileUpload} 
              disabled={loading}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="rpg-panel bg-red-900/50 border-red-500 p-4 flex gap-4 text-red-200 items-start">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold mb-1">Upload Failed</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
