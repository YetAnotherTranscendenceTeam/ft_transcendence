import { PongServer } from './PongServer.js';
import { K } from "pong"
import { defaultMatchParameters, GameMode, GameModeType } from 'yatt-lobbies';

export class GameManager {

  /**
   * @type {Map<number, PongServer>}
   */
  pongs = new Map();

  timeout;

  constructor(fastify) {
    this.fastify = fastify;
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

  registerGame(match_id, gamemode, teams, match_parameters = defaultMatchParameters) {
    if (this.pongs.has(match_id)) {
      throw new Error(`Match ${match_id} already exists`);
    }
    const pong = new PongServer(match_id, gamemode, teams, match_parameters, this);
    this.pongs.set(match_id, pong);
    return pong;
  }

  unregisterGame(match_id) {
    this.pongs.delete(match_id);
  }

  getGame(match_id) {
    return this.pongs.get(match_id);
  }

  async cancel() {
    for (const [match_id, pong] of this.pongs) {
      await pong.cancel();
    }
  }
}
