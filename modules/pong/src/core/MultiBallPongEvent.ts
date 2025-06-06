import { PongEventType } from 'yatt-lobbies'
import { Pong } from './Pong.js';
import PongEvent, { PongEventScope } from './PongEvent.js';
import Ball from './Ball.js';
import Goal from './Goal.js';
import { Vec2 } from "gl-matrix";
import { PlayerID, PongEventActivationSide } from './types.js';
import * as K from './constants.js';

export default class MultiBallPongEvent extends PongEvent {
	constructor() {
		super(PongEventType.MULTIBALL, PongEventScope.GLOBAL, PongEventActivationSide.SERVER, 100);	
	}

	public override activate(game: Pong, playerId: PlayerID): boolean {
		const isFirstMultiBall = game.activeEvents.find((event) => event instanceof MultiBallPongEvent) === undefined;
		const ball = game.balls[0];
		ball.enableDamage();
		for (let i = 0; i < K.ballAmountMax - 1; i++) {
			// const ball = game.balls[Math.floor(Math.random() * game.balls.length)];
			const newBall: Ball = new Ball(
				ball.position,
				Vec2.rotate(
					Vec2.create(),
					Vec2.rotate(Vec2.create(), ball.velocity, Vec2.create(), Math.PI / 2 * i),
					Vec2.create(),
					Math.PI / 2
				) as Vec2,
				ball.speed
			);
			newBall.enableDamage();
			game.addBall(newBall);
		}
		super.activate(game, playerId);
		if (isFirstMultiBall) {
			game.goals.forEach((goal: Goal) => {
				goal.heal();
			});
		}
		return true;
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

	public override shouldSpawn(game: Pong): boolean {
		return !game.activeEvents.some((event) => event instanceof MultiBallPongEvent);
	}
}
