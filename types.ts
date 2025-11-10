
export interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  isHungry: boolean;
  isHappy: boolean;
  happyUntil: number;
  lastEaten: number;
  isFlipped: boolean;
}

export interface Food {
  id: number;
  x: number;
  y: number;
  vy: number;
}

export interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface Starfish {
    id: number;
    x: number;
    size: number;
    rotation: number;
    color: string;
}

export interface Shell {
    id: number;
    x: number;
    size: number;
    rotation: number;
    color: string;
}
