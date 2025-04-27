import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";

export const DT = 1 / 20;
export const substeps = 5;

export const bounceMaterial = {
	density: 1,
	restitution: 1,
	staticFriction: 0,
	dynamicFriction: 0
};

// 1v1
export const mapData1v1 = {
	playGround: {
		widht: 16,
		height: 10,
	}
};

// 2v2
export const mapData2v2 = {
	playGround: {
		widht: 20,
		height: 13,
	}
};

export const wallThickness = 0.3;

// paddles
export const paddleSize: Vec2 = new Vec2(0.2, 1.5);

// ball
export const ballRadius = 0.2;

export const defaultBallSpeed = 3;
export const maxBallSpeed = 10;
export const ballMaxAngle = Math.PI / 3; // 60 degrees
export const paddleSpeed = 3;
export const defaultPointsToWin = 500;

export const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballRadius);
export const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleSize[0] / 2, paddleSize[1] / 2);
