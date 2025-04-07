import { GameMode } from './types.js';

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

export const defaultBallSpeed = 1;
export const defaultPaddleSpeed = 1.5;
export const defaultPointsToWin = 5;
export const defaultGameMode = GameMode.ONE_VS_ONE;
