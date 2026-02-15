'use client';

import { useState } from 'react';

export interface ImportFormProps {
  onImport: (source: 'lichess' | 'chesscom', username: string, maxGames: number) => void;
  isLoading: boolean;
}

export function ImportForm({ onImport, isLoading }: ImportFormProps) {
  const [source, setSource] = useState<'lichess' | 'chesscom'>('lichess');
  const [username, setUsername] = useState('');
  const [maxGames, setMaxGames] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onImport(source, username.trim(), maxGames);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Platform
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSource('lichess')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              source === 'lichess'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">Lichess</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">lichess.org</div>
          </button>
          <button
            type="button"
            onClick={() => setSource('chesscom')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              source === 'chesscom'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">Chess.com</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">chess.com</div>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={`Enter your ${source === 'lichess' ? 'Lichess' : 'Chess.com'} username`}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="maxGames" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Games (max {maxGames})
        </label>
        <input
          type="range"
          id="maxGames"
          min="10"
          max="100"
          step="10"
          value={maxGames}
          onChange={(e) => setMaxGames(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>10</span>
          <span className="font-semibold text-gray-900 dark:text-white">{maxGames}</span>
          <span>100</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !username.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {isLoading ? 'Importing...' : 'Import Games'}
      </button>
    </form>
  );
}
