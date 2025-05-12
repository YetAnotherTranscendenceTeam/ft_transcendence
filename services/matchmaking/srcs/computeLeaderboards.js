import db from './app/database.js';
import YATT from 'yatt-utils';

const LEADERBOARD_SIZE = 50;

const rankedModes = ["ranked_1v1", "ranked_2v2"];

const selectModeRankings = db.prepare(`
  SELECT account_id, rating
  FROM matchmaking_users
  WHERE gamemode = ?
  ORDER BY rating DESC
  LIMIT ${LEADERBOARD_SIZE}
`);

export async function computeLeaderboards() {
  const leaderboards = [];

  for (const mode of rankedModes) {
    // Fetch database 
    const players = selectModeRankings.all(mode);

    // Fetch all profiles at once
    
    let profiles;
    try {
      profiles = await YATT.fetch(`http://profiles:3000/?filter[account_id]=${players.map(p => p.account_id).join(",")}`);
    } catch (err) {
      profiles = [];
    }

    // Associate each player with their username
    const rankings = players.map(player => {
      return {
        account_id: player.account_id,
        username: profiles.find(profile => profile.account_id == player.account_id)?.username || null,
        rating: Math.floor(player.rating),
      };
    }).filter(player => player.username);

    // Push this mode's leaderboard
    leaderboards.push({ mode, rankings });
  }

  return { leaderboards, update_after: Date.now() + 21000 };
};
