import { K, Pong, PongState } from "pong";
import YATT from "yatt-utils";

PongState.RESERVED.tickCallback = function (dt, pong) {
	if (pong.players.some(player => !player.socket)) {
		return true;
	}
	return false;
}

PongState.RESERVED.frozen_until = 30;

export class PongServer extends Pong {
	collisions = [];
	team_names = [];

	spectator_socket = null;

	close_timeout;

	constructor(match_id, gamemode, teams, match_parameters, manager) {
		super();
		this.manager = manager;
		this._time = 0;
		this._lastUpdate = Date.now();
		this.team_names = teams.map((team) => team.name);
		this.onlineSetup(match_id, gamemode, teams.map((team) => team.players).flat(), match_parameters, PongState.RESERVED.clone());
		for (let ball of this._balls) {
			ball.addEventListener("collision", (event) => {
				this.collisions.push(event.detail);
			});
		}
	}

	destroy() {
		if (!this.close_timeout)
			this.scheduleClose();
		this.manager.unregisterGame(this._matchId);
	}

	toJSON() {
		return {
			players: this._players,
			team_names: this.team_names,
			match_id: this._matchId,
			gamemode: this._gameMode,
			lastSide: this._stats.lastSideToScore,
			state: this._state,
			score: this._stats.score,
			goals: this.getGoals(),
			event_boxes: this.getEventBoxes(),
			paddles: this.getPaddlePositions(),
			balls: this._balls,
			tick: this.tick,
			matchParameters: this._matchParameters,
			activeEvents: this._activeEvents,
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
				score_0: this._stats.score[0],
				score_1: this._stats.score[1],
			}),
		}).catch((err) => {
			console.error("Error updating match:", err);
		});
		console.log("Cancelled match", this._matchId);
	}

	roundStart() {
		super.roundStart();
		const back_state = this._stats.winner !== undefined ? 2 : 1;
		const oldStateName = this._state.name;
		YATT.fetch(`http://matchmaking:3000/matches/${this._matchId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.manager.fastify.tokens.get("match_management")}`,
			},
			body: JSON.stringify({
				score_0: this._stats.score[0],
				score_1: this._stats.score[1],
				state: oldStateName === "RESERVED" || back_state == 2 ? back_state : undefined
			}),
		}).catch((err) => {
			console.error("Error updating match:", err);
		}).then((res) => {
		});
		if (back_state == 2)
			this.destroy();
	}

	getPaddlePositions() {
		const paddle_positions = {};
		for (let player of this._players) {
			const paddle = this._paddles.get(player.playerId);
			paddle_positions[player.playerId] = {
				id: player.playerId,
				y: paddle.position.y,
				movement: player.movement
			};
		}
		return paddle_positions;
	}

	getGoals() {
		const goals = {};
		this._goals.forEach((goal, index) => {
			goals[index] = {
				health: goal.health,
			};
		});
		return goals;
	}

	getPlayer(account_id) {
		return this._players.find(player => player.account_id === account_id);
	}

	setSpectator(socket) {
		this.spectator_socket = socket;
		console.log(`Spectator ${socket ? "joined" : "left"} ${this._matchId}`);
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
		this.spectator_socket?.send(messageString);
	}

	start() {
		super.start();
	}

	scheduleClose() {
		this.close_timeout = setTimeout(() => {
			for (let player of this._players) {
				if (player.socket) {
					player.socket.close(1000, "ENDED");
					player.socket = null;
				}
			}
			this.spectator_socket?.close(1000, "ENDED");
		}, 30000);
	}

	setState(state) {
		if (this._state.endCallback) {
			this._state.endCallback(this, state);
		}
		this._state = state;
		if (this._state.name === "ENDED" || this._state.name === "FREEZE") {
			this._state.score = this._stats.score;
			this._state.side = this._stats.lastSideToScore;
		}
		this.broadcast({
			event: "state",
			data: {state: this._state}
		});
	}

	getEventBoxes() {
		const event_boxes = this._currentMap.getEventBoxes().map((box) => {
			return {
				active: box.active,
				eventType: box.eventType,
			}
		});
		return event_boxes;
	}

	update() {
		let dt = (Date.now() - this._lastUpdate) / 1000;
		if (this._state.tick(dt, this)) {
			this._lastUpdate = Date.now();
			this.broadcast({
				event: "state",
				data: {state: this._state}
			});
			return;
		}
		if (this._state.getNext()) {
			this.setState(this._state.getNext().clone());
			if (this._state.tick(0, this)) {
				this._lastUpdate = Date.now();
				return;
			}
		}
		this._time += dt;
		for (let player of this._players) {
			const paddle = this._paddles.get(player.playerId);
			paddle.move(player.movement, dt);
		}
		dt = this.physicsUpdate(dt);
		if (this.scoreUpdate()) {
			let newstate = PongState.FREEZE;
			if (this._stats.winner !== undefined) {
				newstate = PongState.ENDED;
				this.scheduleClose();
			}
			this.setState(newstate.clone());
		}
		this.broadcast({
			event: "step",
			data: {
				event_boxes: this.getEventBoxes(),
				collisions: this.collisions.length,
				balls: this._balls,
				paddles: this.getPaddlePositions(),
				goals: this.getGoals(),
				activeEvents: this._activeEvents,
				tick: this.tick,
			}
		});
		this.collisions.length = 0;
		this._lastUpdate = Date.now();
	}
}