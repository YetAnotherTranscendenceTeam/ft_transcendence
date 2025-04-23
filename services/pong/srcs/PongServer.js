import { Pong, PongState } from "pong";
import { WsCloseError } from "yatt-ws";

export class PongServer extends Pong {
	collisions = [];

	constructor(match_id, gamemode, teams) {
		super();
		this._running = 0;
		this._time = 0;
		this._lastUpdate = 0;
		this.onlineSetup(match_id, gamemode, teams, PongState.RESERVED);
		for (let ball of this._balls) {
			ball.addEventListener("collision", (event) => {
				console.log("Ball collision", event);
				this.collisions.push(event.detail);
			});
		}
	}

	destroy() {
		
	}

	toJSON() {
		const paddles = new Array(this._paddles.length);
		for (let [id, paddle] of this._paddles) {
			paddles[id] = {
				id: id,
				position: paddle.position,
			}
		}
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode,
			state: this._state,
			score: this._score,
			paddles: this._paddles,
			balls: this._balls,
			tick: this.tick,
		};
	}

	getPlayer(account_id) {
		return this._players.find(player => player.account_id === account_id);
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

	start() {
		super.start();
	}

	update() {
		const now = Date.now();
		let dt = now - this._lastUpdate;
		this._lastUpdate = now;
		if (this._state.tick()) {
			this.broadcast({
				event: "state",
				state: this._state,
			})
			return;
		}
		if (this._state.getNext())
			this._state = this._state.getNext().clone();
		this._time += dt;
		this.physicsUpdate(dt);
		const paddle_positions = new Array(this._paddles.length);
		for (let [id, paddle] of this._paddles) {
			paddle_positions[paddle_index] = {
				id: id,
				y: paddle.position.y,
				movement: this._players[id].movement
			};
			paddle_index++;
		}
		this.broadcast({
			event: "step",
			collisions: this.collisions,
			paddles: paddle_positions,
			tick: this.tick,
			state: this._state,
		});
		this.collisions.length = 0;
	}
}