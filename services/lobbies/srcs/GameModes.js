
import { getLobbyCapacity } from "yatt-lobbies";

class GameMode {
  /**
   * 
   * @param {{name: string, team_size: number, team_count: number, type: string}} param0 
  */
 constructor({ name, team_size, team_count, type }) {
   this.name = name;
   this.team_size = team_size;
   this.team_count = team_count;
   this.type = type;
  }
  
  getLobbyCapacity() {
    return getLobbyCapacity(this);
  }
}

/**
 * @type {Object<string, GameMode>}
 */
export let GameModes = {};

export async function fetchGameModes() {
  let response = await fetch("http://matchmaking:3000/gamemodes");
  if (!response.ok)
    return GameModes = [];
  GameModes = await response.json();
  console.log("Game modes fetched");
  for (let key in GameModes) {
    GameModes[key] = new GameMode(GameModes[key]);
    console.log(`- ${key}`);
  }
}