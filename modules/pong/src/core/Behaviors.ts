import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { paddleSize } from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";

export const ballCollision = (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
	const { emitter, other, manifold } = event.detail;
	console.log("collision " + emitter.id + "-" + other.id);
	// console.log(emitter);
	// console.log(other);

	const ballEmitter: Ball = emitter as Ball;

	if (other instanceof Paddle) { // control direction of the ball
		const speed: number = ballEmitter.velocity.magnitude;
		let relativePositionY: number = ballEmitter.position[1] - other.position[1];
		relativePositionY /= (paddleSize[1] / 2);
		let clampedPosition: number = Math.max(-1, Math.min(1, relativePositionY));
		const angle: number = Math.PI / 3 * clampedPosition; // angle between -60 and 60 degrees
		const y: number = Math.sin(angle); // vertical component of the ball's velocity
		let relativePositionX: number = ballEmitter.position[0] - other.position[0];
		relativePositionX /= (paddleSize[0] / 2);
		const x: number = relativePositionX < 0 ? -1 : 1; // direction of the ball
		const paddleVelocity: Vec2 = new Vec2(x, y);
		Vec2.normalize(paddleVelocity, paddleVelocity);
		Vec2.scale(paddleVelocity, paddleVelocity, speed);
		// ballEmitter.velocity = paddleVelocity;
		if (relativePositionY < 1 && relativePositionY > -1) {
			// blend the ball's velocity with the paddle's velocity
			Vec2.add(ballEmitter.velocity, ballEmitter.velocity, paddleVelocity);
			Vec2.normalize(ballEmitter.velocity, ballEmitter.velocity);
			Vec2.scale(ballEmitter.velocity, ballEmitter.velocity, speed);
			console.log("in velocity: " + ballEmitter.velocity[0] + ", " + ballEmitter.velocity[1]);
			console.log("in mag: " + ballEmitter.velocity.magnitude);
		} else {
			// set the ball's velocity to the paddle's velocity
			ballEmitter.velocity = Vec2.clone(paddleVelocity);
			Vec2.normalize(ballEmitter.velocity, ballEmitter.velocity);
			Vec2.scale(ballEmitter.velocity, ballEmitter.velocity, speed);
			console.log("out velocity: " + ballEmitter.velocity[0] + ", " + ballEmitter.velocity[1]);
			console.log("out mag: " + ballEmitter.velocity.magnitude);
		}
		ballEmitter.correctSpeed();


		// ballEmitter.position[0] = other.position[0] + (other === paddleLeftBody ? 1 : -1) * (paddleHalfSize[0] + ballSize);
		console.log("ball velocity: " + ballEmitter.velocity[0] + ", " + ballEmitter.velocity[1]);
		console.log("ball mag: " + ballEmitter.velocity.magnitude);
	}

	// if (other === goalLeftBody) { // left goal
	// 	this._score[1]++;
	// 	console.log("goal left");
	// 	console.log("total score: " + this._score[0] + "-" + this._score[1]);
	// 	this.start();
	// } else if (other === goalRightBody) { // right goal
	// 	this._score[0]++;
	// 	console.log("goal right");
	// 	console.log("total score: " + this._score[0] + "-" + this._score[1]);
	// 	this.start();
	// }
	if (other instanceof Goal) {
		const goal: Goal = other as Goal;
		goal.incrementContact();
		if (goal.position.x < 0) { // left goal
			console.log("goal left");
		} else { // right goal
			console.log("goal right");
		}
	}
}
