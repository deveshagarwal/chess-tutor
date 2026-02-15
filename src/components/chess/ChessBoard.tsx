'use client';

import { useEffect, useRef } from 'react';
import { Chessground as ChessgroundApi } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { Color, Key } from 'chessground/types';

// Import chessground styles
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

export interface ChessBoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  movable?: {
    free?: boolean;
    color?: 'white' | 'black' | 'both';
    dests?: Map<Key, Key[]>;
    showDests?: boolean;
  };
  onMove?: (from: string, to: string, capturedPiece?: string) => void;
  lastMove?: [string, string];
  check?: boolean | Color;
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  coordinates?: boolean;
  drawable?: boolean;
  viewOnly?: boolean;
  disableContextMenu?: boolean;
  highlight?: {
    lastMove?: boolean;
    check?: boolean;
  };
}

export function ChessBoard({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  orientation = 'white',
  movable = {},
  onMove,
  lastMove,
  check,
  animation = { enabled: true, duration: 300 },
  coordinates = true,
  drawable = true,
  viewOnly = false,
  disableContextMenu = true,
  highlight = { lastMove: true, check: true },
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);

  // Initialize chessground
  useEffect(() => {
    if (!boardRef.current) return;

    const config: Config = {
      fen,
      orientation: orientation as Color,
      movable: {
        free: movable.free ?? false,
        color: movable.color as Color | 'both' | undefined,
        dests: movable.dests,
        showDests: movable.showDests ?? true,
        events: {
          after: (orig: Key, dest: Key, metadata) => {
            if (onMove) {
              onMove(orig, dest, metadata.captured?.role);
            }
          },
        },
      },
      animation: {
        enabled: animation.enabled ?? true,
        duration: animation.duration ?? 300,
      },
      coordinates,
      drawable: {
        enabled: drawable,
      },
      viewOnly,
      disableContextMenu,
      highlight: {
        lastMove: highlight.lastMove ?? true,
        check: highlight.check ?? true,
      },
    };

    apiRef.current = ChessgroundApi(boardRef.current, config);

    return () => {
      apiRef.current?.destroy();
    };
  }, []); // Only initialize once

  // Update FEN when it changes
  useEffect(() => {
    if (apiRef.current && fen) {
      apiRef.current.set({ fen });
    }
  }, [fen]);

  // Update orientation
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.set({ orientation: orientation as Color });
    }
  }, [orientation]);

  // Update movable destinations
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.set({
        movable: {
          free: movable.free ?? false,
          color: movable.color as Color | 'both' | undefined,
          dests: movable.dests,
          showDests: movable.showDests ?? true,
        },
      });
    }
  }, [movable.free, movable.color, movable.dests, movable.showDests]);

  // Update last move highlight
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.set({
        lastMove: lastMove ? (lastMove as [Key, Key]) : undefined,
      });
    }
  }, [lastMove]);

  // Update check highlight
  useEffect(() => {
    if (apiRef.current && check !== undefined) {
      apiRef.current.set({
        check: check as boolean | Color,
      });
    }
  }, [check]);

  // Update view only mode
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.set({ viewOnly });
    }
  }, [viewOnly]);

  return (
    <div className="chessboard-wrapper">
      <div
        ref={boardRef}
        className="chessboard"
        style={{
          width: '100%',
          maxWidth: '600px',
          aspectRatio: '1/1',
        }}
      />
    </div>
  );
}
