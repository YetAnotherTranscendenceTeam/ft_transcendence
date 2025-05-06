import db from './app/database.js';
import YATT from 'yatt-utils';

const LEADERBOARD_SIZE = 20;

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
    const url = `http://profiles:3000/?filter[account_id]=${players.map(p => p.account_id).join(",")}`;
    const profiles = await YATT.fetch(url);

    // Associate each player with their profile
    const rankings = players.map(p => {
      return {
        ...p,
        profile: profiles.find(profile => profile.account_id == p.account_id) || null
      };
    });

    // Push this mode's leaderboard
    leaderboards.push({ mode, rankings });
  }

  return leaderboards;
};



