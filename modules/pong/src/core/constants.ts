import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";

export const TICK_PER_SECOND = 30;
export const DT = 1 / TICK_PER_SECOND;

export const substeps = 4;

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

export const ballSpeedDefault = 5; // m/s
export const ballSpeedControl = 10; // m/s
export const ballSpeedMax = 12; // m/s
export const ballSpeedMin = 0.5; // m/s
export const ballAcceleration = 0.1; // m/s added avery side change
export const paddleBounceAngleMax = Math.PI / 4; // 45 degrees
export const launchAngle = 20 * Math.PI / 180; // 20 degrees
export const paddleSpeed = 4; // m/s
export const defaultPointsToWin = 5;
export const eventboxRadius = 0.3;
export const ballAmountMax = 4;
export const goalHealthMax = 50;
export const ballDamageMax = 10;
export const ballBounceMax = 10;
export const ballBounceStuckAngle = 5 * Math.PI / 180; // 4 degrees
export const ballBounceStuckLimit = 3; // bounces

export const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballRadius);
export const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleSize[0] / 2, paddleSize[1] / 2);
