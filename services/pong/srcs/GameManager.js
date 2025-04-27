import { PongServer } from './PongServer.js';
import { K } from "pong"
import { GameMode, GameModeType } from 'yatt-lobbies';

export class GameManager {

  /**
   * @type {Map<number, PongServer>}
   */
  pongs = new Map();

  timeout;

  constructor() {
    this.pongs.set(0, new PongServer(0, new GameMode("unranked_2v2", {
      type: GameModeType.UNRANKED,
      team_size: 2,
      team_count: 2,
      match_parameters: {}
    }), [[{account_id: 1}, {account_id: 2}], [{account_id: 3}, {account_id: 4}]]));
    setInterval(() => {
      this.pongs.forEach((pong, match_id) => {
        pong.update();
      });
    }, K.DT * 1000);
  }

  destroy() {
    this.pongs.forEach((pong) => {
      pong.destroy();
    });
    this.pongs.clear();
    clearInterval(this.timeout);
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
