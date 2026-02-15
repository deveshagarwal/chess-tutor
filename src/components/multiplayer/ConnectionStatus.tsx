'use client';

interface ConnectionStatusProps {
  connected: boolean;
  playerColor?: 'white' | 'black';
  opponentColor?: 'white' | 'black';
}

export function ConnectionStatus({ connected, playerColor, opponentColor }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
        }`}
      />
      <div className="text-sm">
        {connected ? (
          <span className="text-green-400">
            Opponent connected {opponentColor && `(${opponentColor})`}
          </span>
        ) : (
          <span className="text-yellow-400">Waiting for opponent...</span>
        )}
      </div>
    </div>
  );
}
