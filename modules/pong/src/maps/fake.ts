import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";
import * as K from "../core/constants.js";
import { IPongMap, MapID } from "../core/types.js";
import Paddle from "../core/Paddle.js";
import Wall from "../core/Wall.js";
import Obstacle from "../core/Obstacle.js";
import EventBox from "../core/EventBox.js";

export const playGround = {
	width: 14,
	height: 8,
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

const obstacleShape: Array<{pos: Vec2, shape: PH2D.PolygonShape, rotation: number}> = [
	
	{ // left wall
		pos: new Vec2(playGround.width / 2 - K.wallThickness / 2, 0),
		shape: new PH2D.PolygonShape(K.wallThickness / 2, playGround.height / 2),
		rotation: 0
	},
	{ // right wall
		pos: new Vec2(-playGround.width / 2 + K.wallThickness / 2, 0),
		shape: new PH2D.PolygonShape(K.wallThickness / 2, playGround.height / 2),
		rotation: 0,
	},

	{ // bottom triangle
		pos: new Vec2(0, -playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(-playGround.width / 16, 0),
			Vec2.fromValues(0, playGround.height * 0.1),
			Vec2.fromValues(playGround.width / 16, 0)
		]),
		rotation: 0
	},
	{ // top triangle
		pos: new Vec2(0, playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(-playGround.width / 16, 0),
			Vec2.fromValues(0, -playGround.height * 0.1),
			Vec2.fromValues(playGround.width / 16, 0)
		]),
		rotation: 0
	},
	{ // left top triangle
		pos: new Vec2(-playGround.width * 0.5, playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0),
			Vec2.fromValues(0, -1.5),
			Vec2.fromValues(1.5, 0)
		]),
		rotation: 0
	},
	{ // left bottom triangle
		pos: new Vec2(-playGround.width * 0.5, -playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0),
			Vec2.fromValues(0, 1.5),
			Vec2.fromValues(1.5, 0)
		]),
		rotation: 0
	},
	{ // right top triangle
		pos: new Vec2(playGround.width * 0.5, playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0),
			Vec2.fromValues(0, -1.5),
			Vec2.fromValues(-1.5, 0)
		]),
		rotation: 0
	},
	{ // right bottom triangle
		pos: new Vec2(playGround.width * 0.5, -playGround.height * 0.5),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0),
			Vec2.fromValues(0, 1.5),
			Vec2.fromValues(-1.5, 0)
		]),
		rotation: 0
	},

	{ // right diamonddiamond
		pos: new Vec2(playGround.width * 0.25, 0),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0.8),
			Vec2.fromValues(0.8, 0),
			Vec2.fromValues(0, -0.8),
			Vec2.fromValues(-0.8, 0)
		]),
		rotation: 0
	},

	{ // left diamond
		pos: new Vec2(-playGround.width * 0.25, 0),
		shape: new PH2D.PolygonShape([
			Vec2.fromValues(0, 0.8),
			Vec2.fromValues(0.8, 0),
			Vec2.fromValues(0, -0.8),
			Vec2.fromValues(-0.8, 0)
		]),
		rotation: 0,
	},
	
];

export function createMap(): IPongMap {
	return {
		mapId: MapID.FAKE,
		width: playGround.width,
		height: playGround.height,
		wallTop: new Wall(wallShape, wallTopPosition, wallSize),
		wallBottom: new Wall(wallShape, wallBottomPosition, wallSize),
		goalLeft: null,
		goalRight: null,
		paddleLeftBack: null,
		paddleLeftFront: null,
		paddleRightBack: null,
		paddleRightFront: null,
		obstacles: obstacleShape.map(({pos, shape, rotation}) => {
			const wall = new Obstacle(shape, pos, rotation);
			return wall;
		}),
		eventboxes: [],
		getObjects(): PH2D.Body[] {
			return [
				this.wallTop,
				this.wallBottom,
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
