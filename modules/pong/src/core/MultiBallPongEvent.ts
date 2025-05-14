import { PongEventType } from 'yatt-lobbies'
import { Pong } from './Pong.js';
import PongEvent from './PongEvent.js';
import Ball from './Ball.js';
import Goal from './Goal.js';
import { Vec2 } from "gl-matrix";
import { PlayerID } from './types.js';
import * as K from './constants.js';

export default class MultiBallPongEvent extends PongEvent {
	constructor() {
		super(PongEventType.MULTIBALL);
	}

	public override activate(game: Pong, playerId: PlayerID): void {
		const isFirstMultiBall = game.activeEvents.find((event) => event instanceof MultiBallPongEvent) === undefined;
		for (let i = 0; i < K.maxBallAmount - 1; i++) {
			const ball = game.balls[Math.floor(Math.random() * game.balls.length)];
			const newBall: Ball = new Ball(
				ball.position,
				Vec2.rotate(
					Vec2.create(),
					ball.velocity,
					Vec2.create(),
					Math.PI / 2
				) as Vec2,
				ball.speed
			);
			newBall.enableDamage();
			game.addBall(newBall);
			ball.enableDamage();
		}
		super.activate(game, playerId);
		if (isFirstMultiBall) {
			game.goals.forEach((goal: Goal) => {
				goal.heal();
			});
		}
	}

	public override deactivate(game: Pong): void {
		super.deactivate(game);
		while (game.balls.length > 1) {
			game.removeBall(game.balls[1]);
		}
		game.balls[0].disableDamage();
		game.goals.forEach((goal: Goal) => {
			goal.destroyWall();
		});
	}

	public override isGlobal(): boolean {
		return true;
	}
}
