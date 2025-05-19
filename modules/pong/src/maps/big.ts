import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";
import * as K from "../core/constants.js";
import { IPongMap, MapID } from "../core/types.js";
import Ball from "../core/Ball.js";
import Paddle from "../core/Paddle.js";
import Goal from "../core/Goal.js";
import Wall from "../core/Wall.js";
import Obstacle from "../core/Obstacle.js";
import EventBox from "../core/EventBox.js";

export const playGround = {
	width: 20,
	height: 13,
}

// walls
export const wallSize: Vec2 = new Vec2(playGround.width, K.wallThickness);
export const wallTopPosition: Vec2 = new Vec2(0, playGround.height / 2 + K.wallThickness / 2);
export const wallBottomPosition: Vec2 = new Vec2(0, -(playGround.height / 2 + K.wallThickness / 2));

// goals
export const goalSize: Vec2 = new Vec2(K.wallThickness, playGround.height + K.wallThickness * 2);
export const goalLeftPosition: Vec2 = new Vec2(-playGround.width / 2 - K.wallThickness / 2, 0);
export const goalRightPosition: Vec2 = new Vec2(playGround.width / 2 + K.wallThickness / 2, 0);

// paddles
export const paddleLeftBackPosition: Vec2 = new Vec2(-playGround.width / 2 + K.wallThickness / 2 + 1, 0);
export const paddleRightBackPosition: Vec2 = new Vec2(playGround.width / 2 - K.wallThickness / 2 - 1, 0);
export const paddleLeftFrontPosition: Vec2 = new Vec2(-playGround.width / 2 + K.wallThickness / 2 + 4, 0);
export const paddleRightFrontPosition: Vec2 = new Vec2(playGround.width / 2 - K.wallThickness / 2 - 4, 0);

// shapes
export const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(wallSize[0] / 2, wallSize[1] / 2);
export const goalShape: PH2D.PolygonShape = new PH2D.PolygonShape(goalSize[0] / 2, goalSize[1] / 2);

export function createMap(): IPongMap {
	return {
		mapId: MapID.BIG,
		width: playGround.width,
		height: playGround.height,
		wallTop: new Wall(wallShape, wallTopPosition, wallSize),
		wallBottom: new Wall(wallShape, wallBottomPosition, wallSize),
		goalLeft: new Goal(goalShape, goalLeftPosition, goalSize),
		goalRight: new Goal(goalShape, goalRightPosition, goalSize),
		paddleLeftBack: new Paddle(paddleLeftBackPosition, K.paddleSpeed),
		paddleLeftFront: new Paddle(paddleLeftFrontPosition, K.paddleSpeed),
		paddleRightBack: new Paddle(paddleRightBackPosition, K.paddleSpeed),
		paddleRightFront: new Paddle(paddleRightFrontPosition, K.paddleSpeed),
		obstacles: [],
		eventboxes: [],
		getObjects(): PH2D.Body[] {
			return [
				this.wallTop,
				this.wallBottom,
				this.goalLeft,
				this.goalRight,
				this.paddleLeftBack,
				this.paddleLeftFront,
				this.paddleRightBack,
				this.paddleRightFront,
				...this.obstacles,
				...this.eventboxes
			];
		},
		getObstacles(): Obstacle[] {
			return this.obstacles;
		},
		getEventBoxes(): EventBox[] {
			return this.eventboxes;
		},
		clone: createMap
	}
}

