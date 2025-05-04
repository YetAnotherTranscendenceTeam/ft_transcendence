import db from "./app/database.js";

export class MatchTeam {
  static insert_match_teams = db.prepare(
    `
		INSERT INTO match_teams (match_id, team_index, name)
		VALUES (@match_id, @team_index, @name)
		`
  );

  static insert_match_players = db.prepare(
    `
		INSERT INTO match_players (match_id, account_id, team_index, player_index, win_probability, begin_rating)
		VALUES (@match_id, @account_id, @team_index, @player_index, @win_probability, @begin_rating)
		`
  );

  static insert = db.transaction((team) => {
    MatchTeam.insert_match_teams.run({...team});
    for (const player of team.players) {
      MatchTeam.insert_match_players.run({
        match_id: team.match_id,
        account_id: player.account_id,
        team_index: team.team_index,
        player_index: player.player_index,
        win_probability: player.win_probability,
        begin_rating: player.matchmaking_user?.rating
      });
    }
  });

  constructor(match_id, team_index, players, name = null) {
    this.match_id = match_id;
    this.team_index = team_index;
    this.players = players;
    this.score = 0;
    this.name = name;
  }


  insert() {
    MatchTeam.insert(this);
  }
}
