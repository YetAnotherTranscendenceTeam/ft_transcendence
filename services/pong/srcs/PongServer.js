import { Pong, PongState } from "pong";

PongState.RESERVED.tickCallback = function (dt, pong) {
	if (pong.players.some(player => !player.socket)) {
		return true;
	}
	return false;
}

export class PongServer extends Pong {
	collisions = [];

	constructor(match_id, gamemode, teams) {
		super();
		this._running = 0;
		this._time = 0;
		this._lastUpdate = 0;
		this.onlineSetup(match_id, gamemode, teams.flat(), PongState.RESERVED.clone());
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
			paddles,
			balls: this._balls,
			tick: this.tick,
		};
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
		this._state = state;
		this.broadcast({
			event: "state",
			data: {state: this._state}
		});
	}

	update() {
		const now = Date.now();
		let dt = (now - this._lastUpdate) / 1000;
		this._lastUpdate = now;
		if (this._state.tick(dt, this)) {
			return;
		}
		if (this._state.getNext()) {
			console.log("State changed", this._state.getNext());
			if (this._state.endCallback) {
				this._state.endCallback(this);
			}
			this.setState(this._state.getNext().clone());
			if (this._state.tick(dt, this)) {
				return;
			}
		}
		this._time += dt;
		this.physicsUpdate(dt);
		const paddle_positions = {};
		for (let player of this._players) {
			const paddle = this._paddles.get(player.paddleId);
			paddle_positions[player.paddleId] = {
				id: player.paddleId,
				y: paddle.position.y,
				movement: player.movement
			};
		}
		this.broadcast({
			event: "step",
			data: {
				collisions: this.collisions,
				balls: this._balls,
				paddles: paddle_positions,
				tick: this.tick,
			}
		});
		if (this.scoreUpdate()) {
			if (this._winner !== undefined) {
				this.setState(PongState.ENDED.clone());
			}
			else
				this.setState(PongState.FREEZE.clone());
		}
		this.collisions.length = 0;
	}
}