import { Game } from '@/types/chess';
import { PGNParser } from '@/lib/chess/pgn-parser';
import { RateLimiter } from './rate-limiter';

export class ChesscomClient {
  private static rateLimiter = new RateLimiter(300); // 300 requests per minute
  private static baseUrl = 'https://api.chess.com/pub';

  /**
   * Fetch games for a user
   */
  static async fetchUserGames(
    username: string,
    options: {
      max?: number;
      year?: number;
      month?: number;
      onProgress?: (loaded: number, total?: number) => void;
    } = {}
  ): Promise<Game[]> {
    const { max = 100, year, month, onProgress } = options;

    try {
      const games: Game[] = [];

      // Get archives (monthly game archives)
      const archives = await this.getArchives(username, year, month);

      // Fetch games from each archive until we reach max
      for (const archiveUrl of archives) {
        if (games.length >= max) break;

        const archiveGames = await this.fetchArchive(archiveUrl);
        games.push(...archiveGames);

        if (onProgress) {
          onProgress(Math.min(games.length, max), max);
        }
      }

      return games.slice(0, max);
    } catch (error) {
      console.error('Error fetching Chess.com games:', error);
      throw error;
    }
  }

  /**
   * Get list of game archives for a user
   */
  private static async getArchives(
    username: string,
    year?: number,
    month?: number
  ): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/player/${username}/games/archives`;

      const response = await this.rateLimiter.request(() => fetch(url));

      if (!response.ok) {
        throw new Error(`Failed to fetch archives: ${response.statusText}`);
      }

      const data = await response.json();
      let archives: string[] = data.archives || [];

      // Filter by year/month if specified
      if (year) {
        archives = archives.filter(url => url.includes(`/${year}/`));
      }

      if (month) {
        const monthStr = month.toString().padStart(2, '0');
        archives = archives.filter(url => url.endsWith(`/${monthStr}`));
      }

      // Return most recent first
      return archives.reverse();
    } catch (error) {
      console.error('Error fetching Chess.com archives:', error);
      throw error;
    }
  }

  /**
   * Fetch games from a specific archive
   */
  private static async fetchArchive(archiveUrl: string): Promise<Game[]> {
    try {
      const response = await this.rateLimiter.request(() => fetch(archiveUrl));

      if (!response.ok) {
        throw new Error(`Failed to fetch archive: ${response.statusText}`);
      }

      const data = await response.json();
      const games: Game[] = [];

      for (const gameData of data.games || []) {
        const game = this.parseGameData(gameData);
        if (game) {
          games.push(game);
        }
      }

      return games;
    } catch (error) {
      console.error('Error fetching Chess.com archive:', error);
      return [];
    }
  }

  /**
   * Parse Chess.com game data to our Game format
   */
  private static parseGameData(data: any): Game | null {
    try {
      const pgn = data.pgn;
      if (!pgn) return null;

      const game = PGNParser.toGame(pgn, 'chesscom');
      if (!game) return null;

      // Override metadata with Chess.com-specific data
      game.metadata = {
        ...game.metadata,
        id: data.url?.split('/').pop() || game.metadata.id,
        white: data.white?.username || game.metadata.white,
        black: data.black?.username || game.metadata.black,
        result: this.parseResult(data.white?.result, data.black?.result),
        whiteRating: data.white?.rating,
        blackRating: data.black?.rating,
        date: new Date(data.end_time * 1000).toISOString().split('T')[0],
        timeControl: data.time_class || data.time_control,
        opening: undefined, // Chess.com doesn't always provide opening info
        source: 'chesscom',
      };

      return game;
    } catch (error) {
      console.error('Failed to parse Chess.com game data:', error);
      return null;
    }
  }

  /**
   * Parse game result from Chess.com format
   */
  private static parseResult(whiteResult: string, blackResult: string): string {
    if (whiteResult === 'win') return '1-0';
    if (blackResult === 'win') return '0-1';
    if (whiteResult === 'agreed' || whiteResult === 'stalemate' || whiteResult === 'repetition' ||
        whiteResult === 'insufficient' || whiteResult === '50move') {
      return '1/2-1/2';
    }
    return '*';
  }

  /**
   * Fetch a single game by ID/URL
   */
  static async fetchGame(gameId: string): Promise<Game | null> {
    try {
      // If gameId is a full URL, extract the ID
      const id = gameId.includes('chess.com') ? gameId.split('/').pop() : gameId;
      const url = `${this.baseUrl}/game/${id}`;

      const response = await this.rateLimiter.request(() => fetch(url));

      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGameData(data);
    } catch (error) {
      console.error('Error fetching Chess.com game:', error);
      return null;
    }
  }

  /**
   * Verify if a username exists
   */
  static async verifyUsername(username: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/player/${username}`;
      const response = await this.rateLimiter.request(() => fetch(url));
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get player stats
   */
  static async getPlayerStats(username: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/player/${username}/stats`;
      const response = await this.rateLimiter.request(() => fetch(url));

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Chess.com stats:', error);
      return null;
    }
  }
}
