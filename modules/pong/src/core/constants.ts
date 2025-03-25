import { GameMode } from './types.js';

export const DT = 1 / 60;

export const bounceMaterial = {
	density: 1,
	restitution: 1,
	staticFriction: 0,
	dynamicFriction: 0
};

export const defaultBallSpeed = 1;
export const defaultPaddleSpeed = 1;
export const defaultPointsToWin = 5;
export const defaultGameMode = GameMode.ONE_VS_ONE;

export const ballSpeedMin = 0.5;
export const ballSpeedMax = 2;
