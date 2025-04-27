import { K, Pong, PongState } from "pong";

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
				this.collisions.push(event.detail);
			});
		}

	}

	destroy() {
		
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
			this._state.endCallback(this);
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
			}
			else
				this.setState(PongState.FREEZE.clone());
		}
		console.log("paddles", this.getPaddlePositions())
		this.broadcast({
			event: "step",
			data: {
				collisions: this.collisions,
				balls: this._balls,
				paddles: this.getPaddlePositions(),
				tick: this.tick,
			}
		});
		this.collisions.length = 0;
		this._lastUpdate = Date.now();
	}
}