/// <reference lib="webworker" />

import { EngineMessage, EngineResponse } from '@/types/engine';

declare const self: DedicatedWorkerGlobalScope;

let stockfishInstance: any = null;
let isReady = false;
let messageQueue: string[] = [];

/**
 * Initialize Stockfish engine
 */
async function initStockfish() {
  try {
    // Load Stockfish from public directory
    const response = await fetch('/stockfish.js');
    const code = await response.text();

    // Evaluate the code to get STOCKFISH function
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction(code + '; return STOCKFISH;');
    const STOCKFISH = await fn();

    if (typeof STOCKFISH === 'function') {
      stockfishInstance = STOCKFISH();

      stockfishInstance.onmessage = (event: MessageEvent) => {
        handleStockfishMessage(event.data);
      };

      // Send UCI command to initialize
      sendToStockfish('uci');
    } else {
      postError('Stockfish not available');
    }
  } catch (error) {
    postError(`Failed to initialize Stockfish: ${error}`);
  }
}

/**
 * Handle messages from Stockfish engine
 */
function handleStockfishMessage(message: string) {
  // Send all engine output to main thread
  const response: EngineResponse = {
    type: 'info',
    data: message,
  };

  // Check for specific messages
  if (message.startsWith('uciok')) {
    isReady = true;
    response.type = 'ready';

    // Process queued messages
    while (messageQueue.length > 0) {
      const queued = messageQueue.shift();
      if (queued) sendToStockfish(queued);
    }
  } else if (message.startsWith('bestmove')) {
    const parts = message.split(' ');
    response.type = 'bestmove';
    response.data = {
      bestMove: parts[1],
      ponder: parts[3] || null,
    };
  } else if (message.startsWith('info')) {
    // Parse evaluation info
    const evaluation = parseInfo(message);
    if (evaluation) {
      response.type = 'evaluation';
      response.data = evaluation;
    }
  }

  self.postMessage(response);
}

/**
 * Parse UCI info line for evaluation
 */
function parseInfo(info: string): any | null {
  const depthMatch = info.match(/depth (\d+)/);
  const scoreMatch = info.match(/score (cp|mate) (-?\d+)/);
  const nodesMatch = info.match(/nodes (\d+)/);
  const timeMatch = info.match(/time (\d+)/);
  const pvMatch = info.match(/pv (.+)$/);

  if (!depthMatch || !scoreMatch) return null;

  const depth = parseInt(depthMatch[1]);
  const scoreType = scoreMatch[1];
  const scoreValue = parseInt(scoreMatch[2]);

  return {
    type: scoreType,
    value: scoreValue,
    depth: depth,
    nodes: nodesMatch ? parseInt(nodesMatch[1]) : undefined,
    time: timeMatch ? parseInt(timeMatch[1]) : undefined,
    pv: pvMatch ? pvMatch[1].split(' ') : undefined,
  };
}

/**
 * Send command to Stockfish
 */
function sendToStockfish(command: string) {
  if (!stockfishInstance) {
    postError('Stockfish not initialized');
    return;
  }

  if (!isReady && !command.startsWith('uci')) {
    // Queue commands until engine is ready
    messageQueue.push(command);
    return;
  }

  try {
    stockfishInstance.postMessage(command);
  } catch (error) {
    postError(`Failed to send command: ${error}`);
  }
}

/**
 * Post error to main thread
 */
function postError(error: string) {
  const response: EngineResponse = {
    type: 'error',
    data: error,
  };
  self.postMessage(response);
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event: MessageEvent<EngineMessage>) => {
  const { type, data } = event.data;

  switch (type) {
    case 'init':
      initStockfish();
      break;

    case 'position':
      if (data.fen) {
        sendToStockfish(`position fen ${data.fen}`);
      } else if (data.moves) {
        sendToStockfish(`position startpos moves ${data.moves.join(' ')}`);
      } else {
        sendToStockfish('position startpos');
      }
      break;

    case 'go':
      let goCommand = 'go';

      if (data.depth) {
        goCommand += ` depth ${data.depth}`;
      }

      if (data.moveTime) {
        goCommand += ` movetime ${data.moveTime}`;
      }

      if (data.nodes) {
        goCommand += ` nodes ${data.nodes}`;
      }

      if (data.infinite) {
        goCommand = 'go infinite';
      }

      sendToStockfish(goCommand);
      break;

    case 'stop':
      sendToStockfish('stop');
      break;

    case 'quit':
      sendToStockfish('quit');
      if (stockfishInstance) {
        stockfishInstance.terminate();
        stockfishInstance = null;
      }
      break;

    default:
      // Send raw UCI command
      if (data && typeof data === 'string') {
        sendToStockfish(data);
      }
  }
});

// Export worker type (for TypeScript)
export {};
