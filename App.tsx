import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Fish, Food, Bubble, Starfish, Shell } from './types';

// --- CONSTANTS ---
const FISH_COUNT = 8;
const BUBBLE_COUNT = 20;
const STARFISH_COUNT = 5;
const SHELL_COUNT = 7;

const AQUARIUM_WIDTH = 100;
const AQUARIUM_HEIGHT = 100;

const FISH_SPEED = 0.1;
const FISH_HUNGRY_SPEED = 0.25;
const HUNGER_INTERVAL = 10000;
const HAPPY_DURATION = 3000;
const FOOD_SINK_SPEED = 0.1;

const FISH_COLORS = ['#ff5733', '#33ff57', '#3357ff', '#ff33a1', '#a133ff', '#33fff0', '#ffc733'];
const STARFISH_COLORS = ['#ff7f50', '#ff6347', '#ff4500'];
const SHELL_COLORS = ['#fff5ee', '#f5f5dc', '#ffe4e1'];

// --- HELPER FUNCTIONS ---
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// --- UI COMPONENTS ---

const FishComponent: React.FC<{ fish: Fish }> = ({ fish }) => (
  <div
    className="absolute transition-transform duration-500"
    style={{
      left: `${fish.x}%`,
      top: `${fish.y}%`,
      width: `${fish.size}px`,
      height: `${fish.size * 0.6}px`,
      transform: `translate(-50%, -50%) ${fish.isFlipped ? 'scaleX(-1)' : 'scaleX(1)'}`,
      zIndex: 10,
    }}
  >
    <svg viewBox="0 0 120 60">
      <ellipse cx="50" cy="30" rx="48" ry="28" fill={fish.color} />
      <path d="M 98 30 L 115 10 L 115 50 Z" fill={fish.color} />
      <circle cx="20" cy="25" r="5" fill="white" />
      <circle cx="20" cy="25" r="2" fill="black" />
      {fish.isHappy && <path d="M 35 40 Q 50 50 65 40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </svg>
  </div>
);

const FoodParticle: React.FC<{ food: Food }> = ({ food }) => (
  <div
    className="absolute bg-yellow-900 rounded-full"
    style={{ left: `${food.x}%`, top: `${food.y}%`, width: '8px', height: '8px', transform: 'translate(-50%, -50%)', zIndex: 5 }}
  />
);

const BubbleComponent: React.FC<{ bubble: Bubble }> = ({ bubble }) => (
    <div
      className="absolute bg-blue-300 rounded-full opacity-50 border-2 border-blue-200"
      style={{ left: `${bubble.x}%`, bottom: `${bubble.y}%`, width: `${bubble.size}px`, height: `${bubble.size}px`, transform: 'translate(-50%, 50%)', zIndex: 1 }}
    />
);

const StarfishComponent: React.FC<{ starfish: Starfish }> = React.memo(({ starfish }) => (
    <div
        className="absolute bottom-2"
        style={{ left: `${starfish.x}%`, width: `${starfish.size}px`, height: `${starfish.size}px`, transform: `translate(-50%, 0) rotate(${starfish.rotation}deg)`, zIndex: 2 }}
    >
        <svg viewBox="0 0 100 100" fill={starfish.color}>
            <path d="M50 0 L61.8 38.2 L100 38.2 L69.1 61.8 L80.9 100 L50 76.4 L19.1 100 L30.9 61.8 L0 38.2 L38.2 38.2 Z" />
        </svg>
    </div>
));

const ShellComponent: React.FC<{ shell: Shell }> = React.memo(({ shell }) => (
    <div
        className="absolute bottom-1"
        style={{ left: `${shell.x}%`, width: `${shell.size}px`, height: `${shell.size}px`, transform: `translate(-50%, 0) rotate(${shell.rotation}deg)`, zIndex: 2 }}
    >
        <svg viewBox="0 0 100 100" fill={shell.color}>
            <path d="M50 90 C10 90 10 50 20 30 C30 10 70 10 80 30 C90 50 90 90 50 90 Z M20 30 C 25 40 30 50 50 50 C 70 50 75 40 80 30 M 50 90 V 50" stroke="#d2b48c" strokeWidth="3"/>
        </svg>
    </div>
));

// --- MAIN APP COMPONENT ---

export default function App() {
  const [starfishList, setStarfishList] = useState<Starfish[]>([]);
  const [shellList, setShellList] = useState<Shell[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const aquariumRef = useRef<HTMLDivElement>(null);
  
  // Refs for animated elements
  const fishListRef = useRef<Fish[]>([]);
  const foodListRef = useRef<Food[]>([]);
  const bubbleListRef = useRef<Bubble[]>([]);
  
  // State to force re-renders for the animation loop
  const [, setForceUpdate] = useState(0);

  const createInitialFish = useCallback(() => Array.from({ length: FISH_COUNT }, (_, i) => ({ id: i, x: random(10, AQUARIUM_WIDTH - 10), y: random(10, AQUARIUM_HEIGHT - 10), vx: random(-FISH_SPEED, FISH_SPEED), vy: random(-FISH_SPEED, FISH_SPEED), size: random(40, 70), color: FISH_COLORS[i % FISH_COLORS.length], isHungry: true, lastEaten: Date.now() - random(0, HUNGER_INTERVAL), isFlipped: false, isHappy: false, happyUntil: 0 })), []);
  const createInitialBubbles = useCallback(() => Array.from({ length: BUBBLE_COUNT }, (_, i) => ({ id: i, x: random(0, 100), y: random(-10, 90), size: random(5, 25), speed: random(0.1, 0.3) })), []);
  
  const createInitialDecorations = useCallback(() => {
      setStarfishList(Array.from({ length: STARFISH_COUNT }, (_, i) => ({ id: i, x: random(5, 95), size: random(20, 40), rotation: random(-30, 30), color: STARFISH_COLORS[i % STARFISH_COLORS.length] })));
      setShellList(Array.from({ length: SHELL_COUNT }, (_, i) => ({ id: i, x: random(5, 95), size: random(15, 30), rotation: random(-45, 45), color: SHELL_COLORS[i % SHELL_COLORS.length] })));
  }, []);

  const handleFeed = useCallback(() => {
      foodListRef.current.push({ id: Date.now(), x: random(10, 90), y: 5, vy: FOOD_SINK_SPEED });
  }, []);

  const handleAquariumClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!aquariumRef.current) return;
    const rect = aquariumRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (y > 95) return;
    foodListRef.current.push({ id: Date.now(), x, y, vy: FOOD_SINK_SPEED });
  }, []);

  useEffect(() => {
    fishListRef.current = createInitialFish();
    bubbleListRef.current = createInitialBubbles();
    createInitialDecorations();
    setIsInitialized(true);
  }, [createInitialFish, createInitialBubbles, createInitialDecorations]);

  useEffect(() => {
    if (!isInitialized) return;

    let animationFrameId: number;
    const gameLoop = () => {
      const now = Date.now();
      
      bubbleListRef.current.forEach(b => {
          b.y += b.speed;
          if(b.y > 100) {
              b.y = -10;
              b.x = random(0, 100);
          }
      });
      
      foodListRef.current = foodListRef.current
        .map(f => ({ ...f, y: f.y + f.vy }))
        .filter(f => f.y < 98);

      const eatenFoodIds = new Set<number>();

      fishListRef.current.forEach(fish => {
        if (!fish.isHungry && now - fish.lastEaten > HUNGER_INTERVAL) fish.isHungry = true;
        if (fish.isHappy && now > fish.happyUntil) fish.isHappy = false;
        
        const foodToTarget = foodListRef.current.filter(f => !eatenFoodIds.has(f.id));
        if (fish.isHungry && foodToTarget.length > 0) {
            let closestFood = foodToTarget[0];
            let minDistance = Infinity;
            foodToTarget.forEach(food => {
                const dist = Math.hypot(food.x - fish.x, food.y - fish.y);
                if (dist < minDistance) { minDistance = dist; closestFood = food; }
            });
            const angle = Math.atan2(closestFood.y - fish.y, closestFood.x - fish.x);
            fish.vx = Math.cos(angle) * FISH_HUNGRY_SPEED;
            fish.vy = Math.sin(angle) * FISH_HUNGRY_SPEED;
            if (minDistance < 2) {
                eatenFoodIds.add(closestFood.id);
                fish.isHungry = false;
                fish.lastEaten = now;
                fish.isHappy = true;
                fish.happyUntil = now + HAPPY_DURATION;
            }
        } else {
            fish.vx += random(-0.01, 0.01);
            fish.vy += random(-0.01, 0.01);
            fish.vx = Math.max(-FISH_SPEED, Math.min(FISH_SPEED, fish.vx));
            fish.vy = Math.max(-FISH_SPEED, Math.min(FISH_SPEED, fish.vy));
        }
        fish.x += fish.vx;
        fish.y += fish.vy;
        if (fish.x < 5 || fish.x > AQUARIUM_WIDTH - 5) fish.vx *= -1;
        if (fish.y < 5 || fish.y > AQUARIUM_HEIGHT - 10) fish.vy *= -1;
        fish.isFlipped = fish.vx < 0;
      });

      if (eatenFoodIds.size > 0) {
          foodListRef.current = foodListRef.current.filter(f => !eatenFoodIds.has(f.id));
      }

      setForceUpdate(c => c + 1);
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInitialized]);

  return (
    <main className="relative w-screen h-screen bg-gray-900 flex items-center justify-center overflow-hidden font-sans">
        <div className="absolute top-4 text-center z-30">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Aquarium Friends</h1>
        </div>
        <div className="absolute left-0 bottom-0 z-20 w-32 md:w-48 lg:w-64"><img src="https://picsum.photos/seed/child1/400/600?grayscale&b=10" alt="Child 1" className="w-full" /></div>
        <div className="absolute right-0 bottom-0 z-20 w-32 md:w-48 lg:w-64 transform scale-x-[-1]"><img src="https://picsum.photos/seed/child2/400/600?grayscale&b=10" alt="Child 2" className="w-full" /></div>

        <div ref={aquariumRef} onClick={handleAquariumClick} title="Click to feed the fish!" className="relative w-full h-full max-w-7xl max-h-[80vh] border-8 border-gray-700 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-blue-400 to-blue-600 cursor-pointer">
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-yellow-200 to-yellow-100 z-0" /><div className="absolute bottom-0 left-0 w-full h-12 bg-yellow-200 rounded-t-full opacity-50" />
            {starfishList.map(s => <StarfishComponent key={s.id} starfish={s} />)}
            {shellList.map(s => <ShellComponent key={s.id} shell={s} />)}
            {bubbleListRef.current.map(b => <BubbleComponent key={b.id} bubble={b} />)}
            {foodListRef.current.map(f => <FoodParticle key={f.id} food={f} />)}
            {fishListRef.current.map(f => <FishComponent key={f.id} fish={f} />)}
        </div>
        
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg flex justify-center">
            <button onClick={handleFeed} className="bg-pink-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-300">Feed Fish</button>
        </div>
    </main>
  );
}