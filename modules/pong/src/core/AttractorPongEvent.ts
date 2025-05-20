import { PongEventType } from 'yatt-lobbies'
import { Pong } from './Pong.js';
import PongEvent, { PongEventScope } from './PongEvent.js';
import Ball from './Ball.js';
import Goal from './Goal.js';
import { Vec2 } from "gl-matrix";
import { PlayerID, IPongPlayer } from './types.js';
import * as PH2D from "physics-engine";

const ATTRACTION_FORCE = 2;
const ATTRACTION_RADIUS = 10;
const ATTRACTION_TIME = 20;

export default class AttractorPongEvent extends PongEvent {
	private _target: PH2D.Body;

	constructor() {
		super(PongEventType.ATTRACTOR, PongEventScope.POSITIVE);
	}

	public override activate(game: Pong, playerId: PlayerID): boolean {
		super.activate(game, playerId, ATTRACTION_TIME);
		this._target = game.paddles.get(playerId);
		if (!this._target) {
			throw new Error('Player not found');
		}
		return true;
	}

	public override deactivate(game: Pong): void {
		super.deactivate(game);
	}

	public override update(game: Pong): void {
		super.update(game);
		game.balls.forEach((ball: Ball) => {
			// Check if the ball is within the attraction radius
			const distance: number = Vec2.distance(ball.position, this._target.position);
			if (distance >= ATTRACTION_RADIUS) {
				return;
			}
			// Check if the ball is moving towards the target
			const ballDirection: Vec2 = Vec2.normalize(Vec2.create(), ball.velocity) as Vec2;
			const targetDirection: Vec2 = Vec2.normalize(Vec2.create(), Vec2.sub(Vec2.create(), this._target.position, ball.position)) as Vec2;
			const dotProduct: number = Vec2.dot(ballDirection, targetDirection);
			if (dotProduct <= 0) {
				return;
			}

			// Apply a force towards the target
			// const force = Vec2.sub(Vec2.create(), this._target.position, ball.position);
			// Vec2.normalize(force, force);
			// // Vec2.scale(force, force, ATTRACTION_FORCE * (ATTRACTION_RADIUS - distance));
			// Vec2.scale(force, force, ATTRACTION_FORCE);
			// // Vec2.add(ball.velocity, ball.velocity, force);
			// ball.applyForce(force as Vec2);

			// // Reorient the ball's velocity towards the target
			// const newVelocity: Vec2 = Vec2.normalize(Vec2.create(), Vec2.sub(Vec2.create(), this._target.position, ball.position)) as Vec2;
			// Vec2.scale(newVelocity, newVelocity, ball.velocity.magnitude);
			// ball.velocity = newVelocity;

			// Slightly reorient the ball's velocity towards the target
			const prevMagnitude = ball.velocity.magnitude;
			const newVelocity: Vec2 = Vec2.normalize(Vec2.create(), Vec2.sub(Vec2.create(), this._target.position, ball.position)) as Vec2;
			Vec2.scale(newVelocity, newVelocity, ball.velocity.magnitude);
			Vec2.scaleAndAdd(ball.velocity, ball.velocity, newVelocity, 0.1);
			Vec2.normalize(ball.velocity, ball.velocity);
			Vec2.scale(ball.velocity, ball.velocity, prevMagnitude);
		});
	}

	public override isGlobal(): boolean {
		return false;
	}
}
