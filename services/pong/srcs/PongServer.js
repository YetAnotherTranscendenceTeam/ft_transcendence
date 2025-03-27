import { Pong } from "pong";
import { WsCloseError } from "yatt-ws";

export class PongServer extends Pong {

	constructor(match_id, gamemode, teams) {
		const players = teams.flatMap(team => team.players);
		super(match_id, gamemode, players);
	}

	getPlayer(account_id) {
		return this.players.find(player => player.account_id === account_id);
	}

	join(socket, account_id) {
		const player = this.getPlayer(account_id);
		if (!player) {
			throw new Error("Player not part of this game");
		}
		if (player.socket) {
			WsCloseError.OtherLocation.close(player.socket);
		}
		player.socket = socket;
	}

	removeSocket(account_id) {
		const player = this.getPlayer(account_id);
		if (player) {
			player.socket = null;
		}
	}

	broadcast(message) {
		const messageString = JSON.stringify(message);
		for (const client of this.clients) {
			client.socket?.send(messageString);
		}
	}
}