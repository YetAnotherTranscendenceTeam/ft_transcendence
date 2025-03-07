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
