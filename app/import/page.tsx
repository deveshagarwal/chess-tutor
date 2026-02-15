'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ImportForm } from '@/components/import/ImportForm';
import { LichessClient } from '@/lib/api/lichess-client';
import { ChesscomClient } from '@/lib/api/chesscom-client';
import { Game } from '@/types/chess';

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (
    source: 'lichess' | 'chesscom',
    username: string,
    maxGames: number
  ) => {
    setIsLoading(true);
    setError(null);
    setGames([]);
    setProgress(0);
    setTotal(maxGames);

    try {
      let importedGames: Game[];

      if (source === 'lichess') {
        importedGames = await LichessClient.fetchUserGames(username, {
          max: maxGames,
          onProgress: (loaded, total) => {
            setProgress(loaded);
            if (total) setTotal(total);
          },
        });
      } else {
        importedGames = await ChesscomClient.fetchUserGames(username, {
          max: maxGames,
          onProgress: (loaded, total) => {
            setProgress(loaded);
            if (total) setTotal(total);
          },
        });
      }

      setGames(importedGames);
      setProgress(importedGames.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import games');
      console.error('Import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Import Games
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Import Settings
            </h2>
            <ImportForm onImport={handleImport} isLoading={isLoading} />

            {isLoading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Importing games...</span>
                  <span>{progress} / {total}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress / total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Imported Games
            </h2>

            {games.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No games imported yet. Use the form to import your games from Lichess or Chess.com.
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {games.map((game, index) => (
                  <div
                    key={game.metadata.id || index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {game.metadata.white} vs {game.metadata.black}
                      </div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {game.metadata.result}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>{game.metadata.date}</div>
                      {game.metadata.opening && (
                        <div className="mt-1">{game.metadata.opening}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {games.length > 0 && (
              <div className="mt-6">
                <Link
                  href="/analysis"
                  className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
                >
                  Analyze These Games →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to Import</h3>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
            <li>Select your platform (Lichess or Chess.com)</li>
            <li>Enter your username on that platform</li>
            <li>Choose how many recent games to import (10-100)</li>
            <li>Click "Import Games" and wait for the import to complete</li>
            <li>Once imported, you can analyze your games to get insights into your play</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
