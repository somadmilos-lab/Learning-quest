import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  xp: number;
  level: number;
  health: number;
  maxHealth: number;
  name: string;
  avatar: string;
  addXp: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      health: 100,
      maxHealth: 100,
      name: "Scholar",
      avatar: "Shield",
      addXp: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        const requiredXp = state.level * 100;
        if (newXp >= requiredXp) {
          newLevel += 1;
          newXp -= requiredXp;
          return { xp: newXp, level: newLevel, health: state.maxHealth };
        }
        return { xp: newXp };
      }),
      takeDamage: (amount) => set((state) => ({
        health: Math.max(0, state.health - amount)
      })),
      heal: (amount) => set((state) => ({
        health: Math.min(state.maxHealth, state.health + amount)
      })),
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar })
    }),
    {
      name: 'player-storage',
    }
  )
);
