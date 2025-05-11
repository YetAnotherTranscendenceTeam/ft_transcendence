class LobbyMessage {
  constructor(name, data) {
    this.event = name;
    this.data = data;
  }
}

export class LobbyCopyMessage extends LobbyMessage {
  constructor(lobby) {
    super("lobby", {lobby: lobby});
  }
}

export class LobbyJoinMessage extends LobbyMessage {
  constructor(player) {
    super("player_join", {player: player});
  }
}

export class LobbyLeaveMessage extends LobbyMessage {
  constructor(player) {
    super("player_leave", {player: player});
  }
}

export class LobbyStateMessage extends LobbyMessage {
  constructor(state) {
    super("state_change", {state});
  }
}

export class LobbyModeMessage extends LobbyMessage {
	constructor(mode) {
    super("mode_change", {mode});
  }
}

export class LobbyErrorMessage extends LobbyMessage {
	constructor(txt) {
		super("error", {message: txt});
	}
}

export class SwapPlayersMessage extends LobbyMessage {
	constructor(account_ids) {
		super("swap_players", {account_ids});
	}
}

export class LobbyLeaderMessage extends LobbyMessage {
  constructor(account_id) {
    super("leader_change", {leader_account_id: account_id});
  }
}

export class TeamNameMessage extends LobbyMessage {
  constructor(team_index, name) {
    super("team_name", {team_index, name});
  }
}

export class MatchParametersMessage extends LobbyMessage {
  constructor(match_parameters) {
    super("match_parameters", {match_parameters});
  }
}
