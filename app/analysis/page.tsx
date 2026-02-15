'use client';

import Link from 'next/link';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Game Analysis
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Analyze Your Games
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Import games from Lichess or Chess.com to get detailed AI-powered analysis of your play.
            </p>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Blunder Detection
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Find critical mistakes in your games and learn from them with engine analysis.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Accuracy Rating
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your move accuracy across games and game phases (opening, middlegame, endgame).
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Rating Estimation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get an accurate estimate of your playing strength based on move quality.
                </p>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Opening Repertoire
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyze which openings you play most and your performance in each.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/import"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Import Games to Analyze →
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Coming Soon
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">●</span>
                  <span>Comprehensive game analysis with Stockfish evaluation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">●</span>
                  <span>Move-by-move breakdown with alternatives</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">●</span>
                  <span>Visualization of blunder patterns</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">●</span>
                  <span>Strength/weakness identification</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">●</span>
                  <span>Performance trends over time</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Import games from the Import page</li>
                <li>Select games you want to analyze</li>
                <li>Wait for Stockfish to analyze each position</li>
                <li>View comprehensive analysis and insights</li>
                <li>Learn from your mistakes and improve</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-lg font-semibold mb-2">
                Powered by Stockfish
              </h3>
              <p className="text-sm text-blue-100">
                All analysis is performed using the world's strongest open-source chess engine running directly in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
