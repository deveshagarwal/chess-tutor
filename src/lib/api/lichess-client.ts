import { Game, GameMetadata } from '@/types/chess';
import { PGNParser } from '@/lib/chess/pgn-parser';
import { RateLimiter } from './rate-limiter';

export class LichessClient {
  private static rateLimiter = new RateLimiter(15); // 15 requests per minute
  private static baseUrl = 'https://lichess.org';

  /**
   * Fetch games for a user
   */
  static async fetchUserGames(
    username: string,
    options: {
      max?: number;
      rated?: boolean;
      perfType?: string;
      since?: number;
      until?: number;
      onProgress?: (loaded: number, total?: number) => void;
    } = {}
  ): Promise<Game[]> {
    const {
      max = 100,
      rated,
      perfType,
      since,
      until,
      onProgress,
    } = options;

    try {
      const games: Game[] = [];

      // Build query parameters
      const params = new URLSearchParams();
      params.append('max', max.toString());
      if (rated !== undefined) params.append('rated', rated.toString());
      if (perfType) params.append('perfType', perfType);
      if (since) params.append('since', since.toString());
      if (until) params.append('until', until.toString());
      params.append('pgnInJson', 'true');
      params.append('clocks', 'false');
      params.append('evals', 'false');
      params.append('opening', 'true');

      const url = `${this.baseUrl}/api/games/user/${username}?${params.toString()}`;

      const response = await this.rateLimiter.request(() =>
        fetch(url, {
          headers: {
            'Accept': 'application/x-ndjson',
          },
        })
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const text = await response.text();
      const lines = text.trim().split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const gameData = JSON.parse(line);
          const game = this.parseGameData(gameData);
          if (game) {
            games.push(game);
            if (onProgress) {
              onProgress(games.length, max);
            }
          }
        } catch (error) {
          console.error('Failed to parse game:', error);
        }
      }

      return games;
    } catch (error) {
      console.error('Error fetching Lichess games:', error);
      throw error;
    }
  }

  /**
   * Parse Lichess game data to our Game format
   */
  private static parseGameData(data: any): Game | null {
    try {
      const pgn = data.pgn;
      if (!pgn) return null;

      const game = PGNParser.toGame(pgn, 'lichess');
      if (!game) return null;

      // Override metadata with Lichess-specific data
      game.metadata = {
        ...game.metadata,
        id: data.id || game.metadata.id,
        white: data.players?.white?.user?.name || game.metadata.white,
        black: data.players?.black?.user?.name || game.metadata.black,
        result: this.parseResult(data.winner, data.status),
        whiteRating: data.players?.white?.rating,
        blackRating: data.players?.black?.rating,
        date: new Date(data.createdAt || Date.now()).toISOString().split('T')[0],
        timeControl: this.parseTimeControl(data.clock),
        opening: data.opening?.name,
        source: 'lichess',
      };

      return game;
    } catch (error) {
      console.error('Failed to parse Lichess game data:', error);
      return null;
    }
  }

  /**
   * Parse game result
   */
  private static parseResult(winner: string | undefined, status: string): string {
    if (!winner) {
      return status === 'draw' || status === 'stalemate' ? '1/2-1/2' : '*';
    }
    return winner === 'white' ? '1-0' : '0-1';
  }

  /**
   * Parse time control
   */
  private static parseTimeControl(clock: any): string | undefined {
    if (!clock) return undefined;
    const { initial, increment } = clock;
    return `${initial}+${increment}`;
  }

  /**
   * Fetch a single game by ID
   */
  static async fetchGame(gameId: string): Promise<Game | null> {
    try {
      const url = `${this.baseUrl}/game/export/${gameId}`;

      const response = await this.rateLimiter.request(() =>
        fetch(url, {
          headers: {
            'Accept': 'application/x-chess-pgn',
          },
        })
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.statusText}`);
      }

      const pgn = await response.text();
      return PGNParser.toGame(pgn, 'lichess');
    } catch (error) {
      console.error('Error fetching Lichess game:', error);
      return null;
    }
  }

  /**
   * Verify if a username exists
   */
  static async verifyUsername(username: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/api/user/${username}`;

      const response = await this.rateLimiter.request(() => fetch(url));

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
