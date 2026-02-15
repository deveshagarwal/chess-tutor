export interface EngineOptions {
  depth?: number;
  moveTime?: number;
  skillLevel?: number;
  threads?: number;
}

export interface Evaluation {
  type: 'cp' | 'mate';
  value: number;
  depth: number;
  nodes?: number;
  time?: number;
  pv?: string[];
  bestMove?: string;
}

export interface EngineMessage {
  type: 'init' | 'position' | 'go' | 'stop' | 'quit';
  data?: any;
}

export interface EngineResponse {
  type: 'ready' | 'evaluation' | 'bestmove' | 'info' | 'error';
  data?: any;
}

export interface DifficultySettings {
  depth: number;
  moveTime: number;
  skillLevel: number;
  errorRate: number;
}

export interface AnalysisJob {
  id: string;
  fen: string;
  depth: number;
  priority: number;
  resolve: (value: Evaluation) => void;
  reject: (error: Error) => void;
}
