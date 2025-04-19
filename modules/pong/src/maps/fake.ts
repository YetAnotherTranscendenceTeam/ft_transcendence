import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";
import * as K from "../core/constants.js";
import { IPongMap, MapID } from "../core/types.js";
import Ball from "../core/Ball.js";
import Paddle from "../core/Paddle.js";
import Goal from "../core/Goal.js";
import Wall from "../core/Wall.js";

export const playGround = {
	widht: 14,
	height: 8,
}

// walls
export const wallSize: Vec2 = new Vec2(playGround.widht, K.wallThickness);
export const wallTopPosition: Vec2 = new Vec2(0, playGround.height / 2 + K.wallThickness / 2);
export const wallBottomPosition: Vec2 = new Vec2(0, -(playGround.height / 2 + K.wallThickness / 2));

// goals
export const goalSize: Vec2 = new Vec2(K.wallThickness, playGround.height + K.wallThickness * 2);
export const goalLeftPosition: Vec2 = new Vec2(-playGround.widht / 2 - K.wallThickness / 2, 0);
export const goalRightPosition: Vec2 = new Vec2(playGround.widht / 2 + K.wallThickness / 2, 0);

// paddles
export const paddleLeftPosition: Vec2 = new Vec2(-playGround.widht / 2 + K.wallThickness / 2 + 1, 0);
export const paddleRightPosition: Vec2 = new Vec2(playGround.widht / 2 - K.wallThickness / 2 - 1, 0);

// shapes
export const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(wallSize[0] / 2, wallSize[1] / 2);

export const map: IPongMap = {
	mapId: MapID.FAKE,
	wallTop: new Wall(wallShape, wallTopPosition),
	wallBottom: new Wall(wallShape, wallBottomPosition),
	goalLeft: null,
	goalRight: null,
	paddleLeftBack: null,
	paddleLeftFront: null,
	paddleRightBack: null,
	paddleRightFront: null,
	obstacles: []
}
