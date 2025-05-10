import { PongEventType } from 'yatt-lobbies'
import { Pong } from './Pong.js';
import PongEvent from './PongEvent.js';
import Ball from './Ball.js';
import Goal from './Goal.js';
import { Vec2 } from "gl-matrix";
import { PlayerID, IPongPlayer } from './types.js';
import * as PH2D from "physics-engine";
import Paddle from './Paddle.js';

const ICE_TIME = 20;
const ICE_INERTIA_PREV = 0.95;
const ICE_INERTIA = 0.3;

export default class IcePongEvent extends PongEvent {
	constructor() {
		super(PongEventType.ICE);
	}

	public override activate(game: Pong, playerId: PlayerID): void {
		console.log('ICE');
		super.activate(game, playerId, ICE_TIME);
		game.paddles.forEach((paddle: Paddle) => {
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
	}

	public override deactivate(game: Pong): void {
		console.log('ICE DEACTIVATED');
		super.deactivate(game);
		game.paddles.forEach((paddle: Paddle) => {
			paddle.changeType(PH2D.PhysicsType.KINEMATIC);
			paddle.move = (direction: number): void => {
				paddle.velocity = new Vec2(0, direction * paddle.speed);
			}
		});
	}

	public override update(game: Pong): void {
		super.update(game);
	}
}
