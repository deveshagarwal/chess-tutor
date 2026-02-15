'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-2xl">♔</div>
              <span className="text-lg font-semibold text-slate-100 tracking-tight">Chess Mentor</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">How it Works</a>
              <a href="#trust" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Privacy</a>
              <Link
                href="/play"
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-all"
              >
                Play vs AI
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-slate-800 py-4 space-y-3">
              <a href="#features" className="block text-sm text-slate-400 hover:text-slate-200">Features</a>
              <a href="#how-it-works" className="block text-sm text-slate-400 hover:text-slate-200">How it Works</a>
              <a href="#trust" className="block text-sm text-slate-400 hover:text-slate-200">Privacy</a>
              <Link href="/play" className="block w-full text-center px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg">
                Play vs AI
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

        {/* Gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-6 tracking-tight leading-tight">
                Get coached while you play chess.
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                AI feedback on every move. Adaptive opponents. Learn from your mistakes in real-time.
              </p>

              {/* CTAs - All buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                <Link
                  href="/play"
                  className="group px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    ♟️ Play vs AI
                  </span>
                </Link>

                <Link
                  href="/train"
                  className="group px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 text-center"
                >
                  🎓 Train with AI
                </Link>

                <Link
                  href="/import"
                  className="px-5 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 font-medium rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 text-center"
                >
                  📥 Import Games
                </Link>

                <Link
                  href="/analysis"
                  className="px-5 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 font-medium rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 text-center"
                >
                  📊 Deep Analysis
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span>Powered by Stockfish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span>Lichess & Chess.com import</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span>Instant feedback</span>
                </div>
              </div>
            </div>

            {/* Right: Demo Card with Real Chess Board */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400">LIVE ANALYSIS</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                </div>

                {/* Real Chess Board */}
                <div className="mb-4 rounded-lg overflow-hidden">
                  <ChessBoard
                    fen="r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
                    orientation="white"
                    viewOnly={true}
                    coordinates={false}
                    lastMove={['g1', 'f3']}
                  />
                </div>

                {/* Evaluation bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Evaluation</span>
                    <span className="text-slate-300 font-mono">+0.3</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-violet-500 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>

                {/* Coaching callout */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <div>
                      <div className="text-sm font-medium text-green-400 mb-0.5">Good move!</div>
                      <div className="text-xs text-slate-400">You developed your knight and control the center.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Everything you need to improve</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Combining real-time coaching, game analysis, and adaptive play.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">♟️</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Play vs AI</h3>
            <p className="text-sm text-slate-400 mb-3">Face opponents that adapt to your skill level—from beginner to master.</p>
            <Link href="/play" className="text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
              Start playing
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Train with AI</h3>
            <p className="text-sm text-slate-400 mb-3">Get instant feedback after every move. Spot mistakes before they cost you games.</p>
            <Link href="/train" className="text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
              Start training
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">📥</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Import Games</h3>
            <p className="text-sm text-slate-400 mb-3">Fetch your games from Lichess or Chess.com. No login required.</p>
            <Link href="/import" className="text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
              Import now
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Deep Analysis</h3>
            <p className="text-sm text-slate-400 mb-3">Blunder detection, rating estimation, and opening insights powered by Stockfish.</p>
            <Link href="/analysis" className="text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
              Analyze games
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Play vs Friend</h3>
            <p className="text-sm text-slate-400 mb-3">Share a link and play real-time. No accounts needed.</p>
            <span className="text-xs font-medium text-slate-500 inline-flex items-center gap-1">
              Coming soon
            </span>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Rating Estimate</h3>
            <p className="text-sm text-slate-400 mb-3">See your estimated Elo based on move quality and patterns.</p>
            <Link href="/analysis" className="text-xs font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
              Check rating
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">How it works</h2>
          <p className="text-slate-400">Three simple steps to better chess.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Play or import</h3>
              <p className="text-sm text-slate-400">Start a new game against AI or import from Lichess/Chess.com.</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Get move-by-move coaching</h3>
              <p className="text-sm text-slate-400">See what went wrong and what to do better—instantly.</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Review insights</h3>
              <p className="text-sm text-slate-400">Track your progress and spot patterns in your play.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div id="trust" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Your data stays yours</h2>
            <p className="text-slate-400">We take privacy seriously. Here's what we do—and don't do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-950/50 border border-slate-800/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Read-only import</h3>
              <p className="text-xs text-slate-400">We never post on your behalf. Just read your games.</p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">You can delete data</h3>
              <p className="text-xs text-slate-400">Clear your history anytime from settings.</p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/30 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Runs in your browser</h3>
              <p className="text-xs text-slate-400">Stockfish analysis happens locally. No server uploads.</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-950/50 border border-slate-800/30 rounded-lg">
            <p className="text-sm text-slate-400 text-center">
              <strong className="text-slate-300">About AI coaching:</strong> We use Stockfish (the world's strongest open-source chess engine) to analyze positions. Feedback is generated based on tactical patterns—not magic.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
            Play. Blunder less. Improve faster.
          </h2>
          <p className="text-slate-400 mb-8">No credit card. Start playing in 10 seconds.</p>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
          >
            Start Playing Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">♔</div>
                <span className="text-lg font-semibold text-slate-100">Chess Mentor</span>
              </div>
              <p className="text-sm text-slate-500">
                Your personal chess trainer, powered by AI analysis.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/play" className="hover:text-slate-300 transition-colors">Play vs AI</Link></li>
                <li><Link href="/train" className="hover:text-slate-300 transition-colors">Train with AI</Link></li>
                <li><Link href="/import" className="hover:text-slate-300 transition-colors">Import Games</Link></li>
                <li><Link href="/analysis" className="hover:text-slate-300 transition-colors">Deep Analysis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-slate-300 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-slate-300 transition-colors">How it Works</a></li>
                <li><a href="#trust" className="hover:text-slate-300 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>Powered by Stockfish · Built with Next.js</p>
              <p>
                Built by{' '}
                <a
                  href="https://verydevesh.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  @verydevesh
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
