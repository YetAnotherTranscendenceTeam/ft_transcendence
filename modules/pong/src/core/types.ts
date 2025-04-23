
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";

export enum MapSide {
	LEFT = 0,
	RIGHT = 1
}

export enum PaddleID {
	LEFT_BACK = 0,
	LEFT_FRONT = 1,
	RIGHT_BACK = 2,
	RIGHT_FRONT = 3
}

export enum MapID {
	SMALL = 0,
	BIG = 1,
	FAKE = 2
}
export interface IPongMap {
	mapId: MapID;

	wallTop: Wall;
	wallBottom: Wall;

	goalLeft: Goal;
	goalRight: Goal;

	paddleLeftBack: Paddle;
	paddleLeftFront: Paddle;
	paddleRightBack: Paddle;
	paddleRightFront: Paddle;

	obstacles: Wall[];
}
