import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { usePlayerStore } from '../lib/store';
import { Shield, Swords, Skull, Trophy, ArrowRight, Zap } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Basic 3D Player Character Placeholder
function PlayerModel({ action }: { action: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (action === 'attack') {
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 2, 0.1);
      } else {
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, -2, 0.1);
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[-2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#00f0ff" emissive="#004455" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
}

// Basic 3D Enemy Placeholder
function EnemyModel({ hit }: { hit: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (hit) {
        material.color.setHex(0xff0000);
        meshRef.current.position.x = 2 + Math.random() * 0.2 - 0.1;
      } else {
        material.color.setHex(0xff0055);
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 2, 0.1);
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[2, 0, 0]} castShadow>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial color="#ff0055" emissive="#550011" emissiveIntensity={0.5} roughness={0.4} metalness={0.6} />
      </mesh>
    </Float>
  );
}

export function Quiz() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();
  
  const { takeDamage, addXp, health } = usePlayerStore();

  const quizRecord = useLiveQuery(() => db.quizzes.where({ courseId }).first(), [courseId]);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [battleState, setBattleState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Animation states
  const [screenShake, setScreenShake] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [playerAction, setPlayerAction] = useState('idle');

  useEffect(() => {
    if (health <= 0 && battleState === 'playing') {
      setBattleState('lost');
    }
  }, [health, battleState]);

  if (quizRecord === undefined) return <div className="p-12 font-rpg text-xl text-center text-cyan-400">Loading Combat Data...</div>;
  if (quizRecord === null || !quizRecord.questions || quizRecord.questions.length === 0) {
    return <div className="p-12 font-rpg text-xl text-center">No enemies detected in this sector.</div>;
  }

  const questions = quizRecord.questions;
  const currentQuestion = questions[currentQuestionIdx];
  const monsterHpMax = questions.length;
  const monsterHp = questions.length - currentQuestionIdx;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    
    const correct = idx === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    setShowExplanation(true);
    setPlayerAction('attack');

    setTimeout(() => setPlayerAction('idle'), 1000);

    if (correct) {
      setFlashGreen(true);
      setTimeout(() => setFlashGreen(false), 500);
      addXp(20);
    } else {
      setFlashRed(true);
      setScreenShake(true);
      setTimeout(() => {
        setFlashRed(false);
        setScreenShake(false);
      }, 500);
      takeDamage(20);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finished
      db.quizzes.update(quizRecord.id!, { completed: true });
      addXp(100); // Boss kill bonus
      setBattleState('won');
    }
  };

  if (battleState === 'won') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-black/60 backdrop-blur-md border border-cyan-500/50 p-12 text-center flex flex-col items-center rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <Trophy className="w-24 h-24 text-cyan-400 mb-6" />
        <h2 className="font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4 tracking-wider">COMBAT CLEARED</h2>
        <p className="mb-8 text-cyan-100/80">Target eliminated. Experience points successfully extracted.</p>
        <button onClick={() => navigate(`/course/${courseId}`)} className="px-8 py-3 bg-cyan-900/50 border border-cyan-400 text-cyan-50 hover:bg-cyan-800/80 transition-all uppercase tracking-widest text-sm">
          Return to Hub
        </button>
      </div>
    );
  }

  if (battleState === 'lost') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-black/80 backdrop-blur-md border border-red-500/50 p-12 text-center flex flex-col items-center rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        <Skull className="w-24 h-24 text-red-500 mb-6" />
        <h2 className="font-bold text-4xl text-red-500 mb-4 tracking-widest">TEAM DEFEATED</h2>
        <p className="mb-8 opacity-80 text-red-200">Critical damage sustained. Withdrawal recommended.</p>
        <button onClick={() => {
          setBattleState('playing');
          setCurrentQuestionIdx(0);
          setSelectedOption(null);
          setShowExplanation(false);
          usePlayerStore.getState().heal(100); // Revive
        }} className="px-8 py-3 bg-red-900/50 border border-red-500 text-red-50 hover:bg-red-800/80 transition-all uppercase tracking-widest text-sm">
          Revive & Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden shadow-2xl transition-transform ${screenShake ? 'translate-x-[-10px] sm:translate-x-[10px]' : ''}`}>
      
      {/* 3D Background & Battle Scene */}
      <div className="absolute inset-0 bg-black">
        <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#00ffff" />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#0a0a1a" roughness={0.8} />
            <gridHelper args={[100, 100, '#00ffff', '#003344']} position={[0, 0.01, 0]} />
          </mesh>

          <PlayerModel action={playerAction} />
          <EnemyModel hit={flashGreen && playerAction === 'attack'} />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
          <Environment preset="city" />
        </Canvas>
        
        {/* Color Tints */}
        <div className={`absolute inset-0 pointer-events-none mix-blend-overlay transition-colors duration-300 ${flashRed ? 'bg-red-500/30' : flashGreen ? 'bg-green-500/30' : 'bg-transparent'}`} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* UI Overlay (Honkai Star Rail Inspired) */}
      <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start pointer-events-none">
        {/* Player Status */}
        <div className="bg-black/40 backdrop-blur-md border-l-4 border-cyan-400 p-4 w-64 skew-x-[-10deg] shadow-lg pointer-events-auto">
          <div className="skew-x-[10deg]">
            <h3 className="text-cyan-400 font-bold tracking-widest text-sm mb-1 uppercase">Ally Status</h3>
            <div className="h-2 bg-gray-900 border border-gray-700 w-full mb-1">
              <div className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_#00ffff]" style={{ width: `${(health / usePlayerStore.getState().maxHealth) * 100}%` }} />
            </div>
            <div className="text-xs text-cyan-200 text-right">{health} / {usePlayerStore.getState().maxHealth} HP</div>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-black/40 backdrop-blur-md border-r-4 border-red-500 p-4 w-64 skew-x-[10deg] shadow-lg pointer-events-auto">
          <div className="skew-x-[-10deg] text-right">
            <h3 className="text-red-400 font-bold tracking-widest text-sm mb-1 uppercase">Enemy Target</h3>
            <div className="h-2 bg-gray-900 border border-gray-700 w-full mb-1 flex justify-end">
              <div className="h-full bg-red-500 transition-all duration-300 shadow-[0_0_10px_#ff0000]" style={{ width: `${(monsterHp / monsterHpMax) * 100}%` }} />
            </div>
            <div className="text-xs text-red-200 text-left invisible">Shield</div>
          </div>
        </div>
      </div>

      {/* Command Menu (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-end">
          
          {/* Question / Dialogue Box */}
          <div className="flex-1 bg-black/60 backdrop-blur-lg border border-white/10 p-6 rounded-tr-3xl rounded-bl-3xl shadow-2xl pointer-events-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-1 bg-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-1 bg-cyan-400" />
            
            <h4 className="text-sm font-mono text-cyan-400 mb-2 tracking-widest uppercase">Combat Phase // Encounter {currentQuestionIdx + 1}</h4>
            <p className="text-lg text-gray-100 leading-relaxed font-medium">
              {currentQuestion.question}
            </p>

            {showExplanation && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className={`text-sm tracking-widest uppercase mb-1 font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'SUCCESSFUL STRIKE' : 'ATTACK MISSED'}
                </h4>
                <p className="text-sm text-gray-300">{currentQuestion.explanation}</p>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="px-6 py-2 bg-white text-black font-bold tracking-widest uppercase hover:bg-cyan-400 transition-colors flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Commands */}
          <div className="w-full md:w-80 flex flex-col gap-3 pointer-events-auto">
            {currentQuestion.options.map((opt, i) => {
              let btnClass = "relative overflow-hidden group w-full text-left p-4 bg-black/50 backdrop-blur-md border border-white/20 hover:border-cyan-400 transition-all skew-x-[-10deg]";
              
              if (showExplanation) {
                if (i === currentQuestion.correctAnswerIndex) {
                  btnClass = "relative overflow-hidden w-full text-left p-4 bg-green-900/50 backdrop-blur-md border-l-4 border-green-400 text-green-100 skew-x-[-10deg]";
                } else if (i === selectedOption) {
                  btnClass = "relative overflow-hidden w-full text-left p-4 bg-red-900/50 backdrop-blur-md border-l-4 border-red-500 text-red-100 skew-x-[-10deg]";
                } else {
                  btnClass = "relative overflow-hidden w-full text-left p-4 bg-black/50 backdrop-blur-md border border-gray-700 opacity-50 skew-x-[-10deg] cursor-not-allowed";
                }
              }

              return (
                <button 
                  key={i} 
                  className={btnClass}
                  onClick={() => handleSelect(i)}
                  disabled={showExplanation}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-300" />
                  <div className="skew-x-[10deg] flex items-center gap-3 relative z-10 w-full">
                    <span className="font-mono text-cyan-500 opacity-50 font-bold">0{i + 1}</span> 
                    <span className="text-sm font-medium text-white truncate flex-1">{opt}</span>
                    {!showExplanation && <Zap className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
