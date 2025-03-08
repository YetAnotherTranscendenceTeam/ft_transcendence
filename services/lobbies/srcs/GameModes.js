
class GameMode {
  /**
   * 
   * @param {{name: string, team_size: number, team_count: number, ranked: boolean}} param0 
  */
 constructor({ name, team_size, team_count, ranked }) {
   this.name = name;
   this.team_size = team_size;
   this.team_count = team_count;
   this.ranked = ranked;
  }
  
  getLobbyCapacity() {
    return this.ranked ? this.team_size : this.team_size * this.team_count;
  }
}

/**
 * @type {Object<string, GameMode>}
 */
export let GameModes = {};

export async function fetchGameModes() {
  let response = await fetch("http://matchmaking:3000/gamemodes");
  if (!response.ok)
    throw new Error("Failed to fetch game modes");
  GameModes = await response.json();
  console.log("Game modes fetched");
  for (let key in GameModes) {
    GameModes[key] = new GameMode(GameModes[key]);
    console.log(`- ${key}`);
  }
}