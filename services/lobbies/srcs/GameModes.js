
import { GameMode } from "yatt-lobbies";
export { GameMode };

/**
 * @type {{[key: string]: GameMode}}
 */
export let GameModes = {};

export async function fetchGameModes() {
  try {
    let response = await fetch("http://matchmaking:3000/gamemodes");
    if (!response.ok)
      return GameModes = {};
    GameModes = await response.json();
  }
  catch (e) {
    console.error(e);
    GameModes = {};
    return ;
  }
  console.log("Game modes fetched");
  for (let key in GameModes) {
    GameModes[key] = new GameMode(GameModes[key]);
    console.log(`- ${key}`);
  }
}
