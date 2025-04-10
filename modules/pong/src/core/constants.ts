import * as PH2D from 'physics-engine';

export const DT = 1 / 20;

export const bounceMaterial = {
	density: 1,
	restitution: 1,
	staticFriction: 0,
	dynamicFriction: 0
};

export const ballSpeedMin = 0.5;
export const ballSpeedMax = 2;
export const ballSize = 0.15;
export const paddleHalfSize = [0.1, 0.5];

export const defaultBallSpeed = 2;
export const defaultPaddleSpeed = 1.5;
export const defaultPointsToWin = 5;

export const defaultBallShape: PH2D.CircleShape = new PH2D.CircleShape(ballSize);
export const defaultPaddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleHalfSize[0], paddleHalfSize[1]);
