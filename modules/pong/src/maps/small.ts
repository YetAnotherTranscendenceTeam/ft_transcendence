import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";
import * as K from "../core/constants.js";
import { IPongMap, MapID } from "../core/types.js";
import Ball from "../core/Ball.js";
import Paddle from "../core/Paddle.js";
import Goal from "../core/Goal.js";
import Wall from "../core/Wall.js";
import EventBox from "../core/EventBox.js";
import Obstacle from '../core/Obstacle.js';

export const playGround = {
	width: 16,
	height: 10,
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
export const paddleLeftPosition: Vec2 = new Vec2(-playGround.width / 2 + K.wallThickness / 2 + 1, 0);
export const paddleRightPosition: Vec2 = new Vec2(playGround.width / 2 - K.wallThickness / 2 - 1, 0);

// shapes
export const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(wallSize[0] / 2, wallSize[1] / 2);
export const goalShape: PH2D.PolygonShape = new PH2D.PolygonShape(goalSize[0] / 2, goalSize[1] / 2);

const eventBoxShape: Array<{pos: Vec2, shape: PH2D.CircleShape}> = [ // event boxes
	{ // top event box
		pos: new Vec2(0, playGround.height * 0.45),
		shape: new PH2D.CircleShape(K.eventboxRadius)
	},
	{ // bottom event box
		pos: new Vec2(0, -(playGround.height * 0.45)),
		shape: new PH2D.CircleShape(K.eventboxRadius)
	}
	// { // center event box
	// 	pos: new Vec2(0, 0),
	// 	shape: new PH2D.CircleShape(K.eventboxRadius)
	// }
];

const obstacleShape: Array<{pos: Vec2, shape: PH2D.PolygonShape}> = [ // non rectangular obstacles
	{ // bottom triangle
		pos: new Vec2(0, -playGround.height * 0.4), shape: new PH2D.PolygonShape([
			Vec2.fromValues(-playGround.width / 8, 0),
			Vec2.fromValues(0, playGround.height * 0.1),
			Vec2.fromValues(playGround.width / 8, 0)
		])
	},
	{ // top triangle
		pos: new Vec2(0, playGround.height * 0.4), shape: new PH2D.PolygonShape([
			Vec2.fromValues(-playGround.width / 8, 0),
			Vec2.fromValues(0, -playGround.height * 0.1),
			Vec2.fromValues(playGround.width / 8, 0)
		])
	}
];


export function createMap(): IPongMap {
	return {
		mapId: MapID.SMALL,
		wallTop: new Wall(wallShape, wallTopPosition, wallSize),
		wallBottom: new Wall(wallShape, wallBottomPosition, wallSize),
		goalLeft: new Goal(goalShape, goalLeftPosition, goalSize),
		goalRight: new Goal(goalShape, goalRightPosition, goalSize),
		paddleLeftBack: new Paddle(paddleLeftPosition, Vec2.create(), K.paddleSpeed),
		paddleLeftFront: null,
		paddleRightBack: new Paddle(paddleRightPosition, Vec2.create(), K.paddleSpeed),
		paddleRightFront: null,
		obstacles: obstacleShape.map(({pos, shape}) => {
			const wall = new Obstacle(shape, pos);
			return wall;
		}),
		// obstacles: [],
		eventboxes: eventBoxShape.map(({pos, shape}) => {
			const eventBox = new EventBox(shape, pos);
			return eventBox;
		}),
		getObjects(): PH2D.Body[] {
			return [
				this.wallTop,
				this.wallBottom,
				this.goalLeft,
				this.goalRight,
				this.paddleLeftBack,
				this.paddleRightBack,
				...this.obstacles,
				...this.eventboxes
			];
		},
		getEventBoxes(): EventBox[] {
			return this.eventboxes;
		},
		clone: createMap
	}
}
