import { PongEventType } from 'yatt-lobbies'
import { Pong } from './Pong.js';
import PongEvent, { PongEventScope } from './PongEvent.js';
import Ball from './Ball.js';
import Goal from './Goal.js';
import { Vec2 } from "gl-matrix";
import { PlayerID, IPongPlayer, PongEventActivationSide } from './types.js';
import * as PH2D from "physics-engine";
import Paddle from './Paddle.js';

const ICE_TIME = 15;
const ICE_INERTIA_PREV = 0.95;
const ICE_INERTIA = 0.3;

export default class IcePongEvent extends PongEvent {
	private _moveBackup: ((direction: number) => void)[];

	constructor() {
		super(PongEventType.ICE, PongEventScope.NEGATIVE, PongEventActivationSide.BOTH);
		this._moveBackup = [];
	}

	public override activate(game: Pong, playerId: PlayerID): boolean {
		let target = playerId;
		if (game.isServer()) {
			if (target < PlayerID.RIGHT_BACK)
				target = PlayerID.RIGHT_BACK;
			else
				target = PlayerID.LEFT_BACK;
		}
		const target_team = Math.floor(target / 2);
		if (!super.activate(game, target_team + 1, ICE_TIME))
			return false;
		game.paddles.forEach((paddle: Paddle, idx: number) => {
			if (Math.floor(idx / 2) !== target_team) {
				return;
			}
			this._moveBackup.push(paddle.move);
			// paddle.changeType(PH2D.PhysicsType.DYNAMIC);
			paddle.move = (direction: number): void => {
				// paddle.velocity = new Vec2(0, direction * paddle.speed);
				let yVelocity = paddle.previousVelocity[1];
				if (direction === 0) {
					paddle.velocity = new Vec2(0, yVelocity * ICE_INERTIA_PREV);
				} else {
					paddle.velocity = new Vec2(0, yVelocity * ICE_INERTIA_PREV + direction * paddle.speed * ICE_INERTIA);
				}
				if (Math.abs(paddle.velocity[1]) < 0.1) {
					paddle.velocity[1] = 0;
				}
				if (paddle.velocity[1] > paddle.speed) {
					paddle.velocity[1] = paddle.speed;
				}
				if (paddle.velocity[1] < -paddle.speed) {
					paddle.velocity[1] = -paddle.speed;
				}
			}
		});
		return true;
	}

	public override deactivate(game: Pong): void {
		super.deactivate(game);
		const target_team = this._playerId - 1;
		game.paddles.forEach((paddle: Paddle, idx) => {
			if (Math.floor(idx / 2) !== target_team) {
				return;
			}
			paddle.move = this._moveBackup.shift();
			if (paddle.move === undefined) {
				console.error('move function is undefined');
				paddle.move = (direction: number): void => {
					paddle.velocity = new Vec2(0, direction * paddle.speed);
				}
			}
			paddle.changeType(PH2D.PhysicsType.KINEMATIC);
		});
	}

	public override isGlobal(): boolean {
		return false;
	}
}
