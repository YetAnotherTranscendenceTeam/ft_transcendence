import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";

export const DT = 1 / 30;
export const substeps = 2;

export const bounceMaterial = {
	density: 1,
	restitution: 1,
	staticFriction: 0,
	dynamicFriction: 0
};

export const wallThickness = 0.3;

// paddles
export const paddleSize: Vec2 = new Vec2(0.2, 1.5);

// ball
export const ballRadius = 0.2;

export const defaultBallSpeed = 5;
export const maxBallSpeed = 10;
export const ballAcceleration = 0.5; // 0.5 m/s added avery side change
export const ballMaxAngle = Math.PI / 3; // 60 degrees
export const launchAngle = 20 * Math.PI / 180; // 20 degrees
export const paddleSpeed = 4;
export const defaultPointsToWin = 5;
export const eventboxRadius = 0.3;

export const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballRadius);
export const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleSize[0] / 2, paddleSize[1] / 2);
