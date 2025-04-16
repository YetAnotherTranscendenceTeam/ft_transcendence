import { PongServer } from './PongServer.js';

export class GameManager {

  /**
   * @type {Map<number, PongServer>}
   */
  pongs = new Map();

  constructor() {
  }

  registerGame(match_id, gamemode, teams) {
    if (this.pongs.has(match_id)) {
      throw new Error(`Match ${match_id} already exists`);
    }
    const pong = new PongServer(match_id, gamemode, teams);
    this.pongs.set(match_id, pong);
    return pong;
  }

  getGame(match_id) {
    return this.pongs.get(match_id);
  }
}
