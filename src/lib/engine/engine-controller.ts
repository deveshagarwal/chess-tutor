import { Evaluation, EngineOptions, AnalysisJob } from '@/types/engine';

export class EngineController {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private jobQueue: AnalysisJob[] = [];
  private currentJob: AnalysisJob | null = null;
  private currentEvaluation: Partial<Evaluation> | null = null;
  private readyPromise: Promise<void> | null = null;
  private readyResolve: (() => void) | null = null;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  /**
   * Initialize the engine
   */
  async init(): Promise<void> {
    if (this.worker) {
      return this.readyPromise!;
    }

    try {
      // Create stockfish worker directly
      this.worker = new Worker('/stockfish.js');

      // Set up message handler
      this.worker.onmessage = (event: MessageEvent) => {
        this.handleStockfishMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      // Send UCI init command
      this.worker.postMessage('uci');

      return this.readyPromise!;
    } catch (error) {
      console.error('Failed to initialize engine:', error);
      throw error;
    }
  }

  /**
   * Handle messages from Stockfish
   */
  private handleStockfishMessage(message: string) {
    // UCI ready message
    if (message.startsWith('uciok')) {
      this.isReady = true;
      if (this.readyResolve) {
        this.readyResolve();
        this.readyResolve = null;
      }
      return;
    }

    // Best move found
    if (message.startsWith('bestmove')) {
      if (this.currentJob && this.currentEvaluation) {
        const parts = message.split(' ');
        const bestMove = parts[1];

        const evaluation: Evaluation = {
          type: this.currentEvaluation.type || 'cp',
          value: this.currentEvaluation.value || 0,
          depth: this.currentEvaluation.depth || 0,
          nodes: this.currentEvaluation.nodes,
          time: this.currentEvaluation.time,
          pv: this.currentEvaluation.pv,
          bestMove: bestMove,
        };

        this.currentJob.resolve(evaluation);
        this.currentJob = null;
        this.currentEvaluation = null;

        // Process next job
        this.processNextJob();
      }
      return;
    }

    // Info lines with evaluation
    if (message.startsWith('info') && message.includes('depth')) {
      const evaluation = this.parseInfo(message);
      if (evaluation) {
        this.currentEvaluation = evaluation;
      }
    }
  }

  /**
   * Parse UCI info line
   */
  private parseInfo(info: string): Partial<Evaluation> | null {
    const depthMatch = info.match(/depth (\d+)/);
    const scoreMatch = info.match(/score (cp|mate) (-?\d+)/);
    const nodesMatch = info.match(/nodes (\d+)/);
    const timeMatch = info.match(/time (\d+)/);
    const pvMatch = info.match(/pv (.+)$/);

    if (!depthMatch || !scoreMatch) return null;

    return {
      type: scoreMatch[1] as 'cp' | 'mate',
      value: parseInt(scoreMatch[2]),
      depth: parseInt(depthMatch[1]),
      nodes: nodesMatch ? parseInt(nodesMatch[1]) : undefined,
      time: timeMatch ? parseInt(timeMatch[1]) : undefined,
      pv: pvMatch ? pvMatch[1].split(' ') : undefined,
    };
  }

  /**
   * Evaluate a position
   */
  async evaluate(fen: string, options: EngineOptions = {}): Promise<Evaluation> {
    await this.readyPromise;

    return new Promise((resolve, reject) => {
      const job: AnalysisJob = {
        id: Math.random().toString(36).substring(7),
        fen,
        depth: options.depth || 15,
        priority: 0,
        resolve,
        reject,
      };

      this.jobQueue.push(job);

      if (!this.currentJob) {
        this.processNextJob();
      }
    });
  }

  /**
   * Get best move for a position
   */
  async getBestMove(fen: string, options: EngineOptions = {}): Promise<string> {
    const evaluation = await this.evaluate(fen, options);
    return evaluation.bestMove || '';
  }

  /**
   * Process next job in queue
   */
  private processNextJob() {
    if (this.currentJob || this.jobQueue.length === 0 || !this.worker) {
      return;
    }

    // Sort by priority (higher first)
    this.jobQueue.sort((a, b) => b.priority - a.priority);

    this.currentJob = this.jobQueue.shift()!;
    this.currentEvaluation = {};

    // Set position
    this.worker.postMessage(`position fen ${this.currentJob.fen}`);

    // Start analysis
    const depth = this.currentJob.depth || 15;
    this.worker.postMessage(`go depth ${depth}`);
  }

  /**
   * Stop current analysis
   */
  async stop(): Promise<void> {
    if (this.currentJob && this.worker) {
      this.worker.postMessage('stop');
    }
  }

  /**
   * Set engine option
   */
  async setOption(name: string, value: string | number): Promise<void> {
    await this.readyPromise;
    if (this.worker) {
      this.worker.postMessage(`setoption name ${name} value ${value}`);
    }
  }

  /**
   * Set skill level (0-20)
   */
  async setSkillLevel(level: number): Promise<void> {
    const clampedLevel = Math.max(0, Math.min(20, level));
    await this.setOption('Skill Level', clampedLevel);
  }

  /**
   * Destroy the engine
   */
  destroy(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending jobs
    if (this.currentJob) {
      this.currentJob.reject(new Error('Engine destroyed'));
      this.currentJob = null;
    }

    this.jobQueue.forEach(job => {
      job.reject(new Error('Engine destroyed'));
    });

    this.jobQueue = [];
    this.isReady = false;
  }

  /**
   * Check if engine is ready
   */
  ready(): boolean {
    return this.isReady;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.jobQueue.length + (this.currentJob ? 1 : 0);
  }
}
