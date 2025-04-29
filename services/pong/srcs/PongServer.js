import { K, Pong, PongState } from "pong";
import YATT from "yatt-utils";

PongState.RESERVED.tickCallback = function (dt, pong) {
	if (pong.players.some(player => !player.socket)) {
		return true;
	}
	return false;
}

export class PongServer extends Pong {
	collisions = [];
	team_names = [];

	constructor(match_id, gamemode, teams, manager) {
		super();
		this._running = 0;
		this.manager = manager;
		this._time = 0;
		this._lastUpdate = 0;
		this.team_names = teams.map((team) => team.name);
		this.onlineSetup(match_id, gamemode, teams.map((team) => team.players).flat(), PongState.RESERVED.clone());
		for (let ball of this._balls) {
			ball.addEventListener("collision", (event) => {
				this.collisions.push(event.detail);
			});
		}

	}

	destroy() {
		this.manager.unregisterGame(this._matchId);
	}

	toJSON() {
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode,
			state: this._state,
			score: this._score,
			paddles: this.getPaddlePositions(),
			balls: this._balls,
			tick: this.tick,
		};
	}

	async cancel() {
		this.destroy();
		await YATT.fetch(`http://matchmaking:3000/matches/${this._matchId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.manager.fastify.tokens.get("match_management")}`,
			},
			body: JSON.stringify({
				state: 3,
				score_0: this._score[0],
				score_1: this._score[1],
			}),
		}).catch((err) => {
			console.error("Error updating match:", err);
		});
		console.log("Cancelled match", this._matchId);
	}

	roundStart() {
		super.roundStart();
		YATT.fetch(`http://matchmaking:3000/matches/${this._matchId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.manager.fastify.tokens.get("match_management")}`,
			},
			body: JSON.stringify({
				score_0: this._score[0],
				score_1: this._score[1],
				state: this._winner ? 2 : 1
			}),
		}).catch((err) => {
			console.error("Error updating match:", err);
		});
	}

	getPaddlePositions() {
		const paddle_positions = {};
		for (let player of this._players) {
			const paddle = this._paddles.get(player.paddleId);
			paddle_positions[player.paddleId] = {
				id: player.paddleId,
				y: paddle.position.y,
				movement: player.movement
			};
		}
		return paddle_positions;
	}

	getPlayer(account_id) {
		return this._players.find(player => player.account_id === account_id);
	}

	removeSocket(account_id) {
		const player = this.getPlayer(account_id);
		if (player) {
			player.socket = null;
		}
	}

	broadcast(message) {
		const messageString = JSON.stringify(message);
		for (const player of this._players) {
			player.socket?.send(messageString);
		}
	}

	start() {
		super.start();
	}

	setState(state) {
		if (this._state.endCallback) {
			this._state.endCallback(this, state);
		}
		this._state = state;
		this.broadcast({
			event: "state",
			data: {state: this._state}
		});
	}

	update() {
		let dt = (Date.now() - this._lastUpdate) / 1000;
		if (this._state.tick(dt, this)) {
			this._lastUpdate = Date.now();
			return;
		}
		if (this._state.getNext()) {
			this.setState(this._state.getNext().clone());
			if (this._state.tick(dt, this)) {
				this._lastUpdate = Date.now();
				return;
			}
		}
		this._time += dt;
		dt = this.physicsUpdate(dt);
		if (this.scoreUpdate()) {
			if (this._winner !== undefined) {
				this.setState(PongState.ENDED.clone());
				this.destroy();
			}
			else
				this.setState(PongState.FREEZE.clone());
		}
		this.broadcast({
			event: "step",
			data: {
				collisions: this.collisions.length,
				balls: this._balls,
				paddles: this.getPaddlePositions(),
				tick: this.tick,
			}
		});
		this.collisions.length = 0;
		this._lastUpdate = Date.now();
	}
}