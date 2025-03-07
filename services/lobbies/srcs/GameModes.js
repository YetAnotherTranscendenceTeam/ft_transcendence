export let GameModes = {};

export async function fetchGameModes() {
  let response = await fetch("http://matchmaking:3000/gamemodes");
  if (!response.ok)
    throw new Error("Failed to fetch game modes");
  GameModes = await response.json();
  console.log("Game modes fetched");
  for (let mode in GameModes) {
    console.log(`- ${mode}`);
  }
}