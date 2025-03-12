import { GameMode, GameModeType } from "yatt-lobbies";
export { GameMode };

/**
 * @type {[key: string]: GameMode}
 */
export const GameModes = {
  ...[
    new GameMode("unranked_2v2", { team_size: 2, team_count: 2, type: GameModeType.UNRANKED }),
    new GameMode("unranked_1v1", { team_size: 1, team_count: 2, type: GameModeType.UNRANKED }),
    new GameMode("ranked_2v2", { team_size: 2, team_count: 2, type: GameModeType.RANKED }),
    new GameMode("ranked_1v1", { team_size: 1, team_count: 2, type: GameModeType.RANKED }),
    new GameMode("tournament_2v2", { team_size: 2, team_count: 16, type: GameModeType.TOURNAMENT }),
    new GameMode("tournament_1v1", { team_size: 1, team_count: 16, type: GameModeType.TOURNAMENT }),
  ].reduce((prev, curr) => ({ ...prev, [curr.name]: curr }), {}),
  equals(other) {
    for (let key in this) {
      if (typeof this[key] === "function") continue;
      if (!other[key]) return false;
      if (this[key].name !== other[key].name) return false;
      if (this[key].team_size !== other[key].team_size) return false;
      if (this[key].team_count !== other[key].team_count) return false;
      if (this[key].type !== other[key].type) return false;
    }
    return true;
  },
};
