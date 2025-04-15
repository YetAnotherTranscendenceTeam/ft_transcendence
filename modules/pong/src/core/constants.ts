import * as PH2D from 'physics-engine';
import { Vec2 } from "gl-matrix";

export const DT = 1 / 20;

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
// walls
export const smallWallSize: Vec2 = new Vec2(mapData1v1.playGround.widht, wallThickness);
export const bigWallSize: Vec2 = new Vec2(mapData2v2.playGround.widht, wallThickness);
export const smallWallTopPosition: Vec2 = new Vec2(0, mapData1v1.playGround.height / 2 + wallThickness / 2);
export const smallWallBottomPosition: Vec2 = new Vec2(0, -(mapData1v1.playGround.height / 2 + wallThickness / 2));
export const bigWallTopPosition: Vec2 = new Vec2(0, mapData2v2.playGround.height / 2 + wallThickness / 2);
export const bigWallBottomPosition: Vec2 = new Vec2(0, -(mapData2v2.playGround.height / 2 + wallThickness / 2));

// goals
export const smallGoalSize: Vec2 = new Vec2(wallThickness, mapData1v1.playGround.height + wallThickness * 2);
export const bigGoalSize: Vec2 = new Vec2(wallThickness, mapData2v2.playGround.height + wallThickness * 2);
export const smallGoalLeftPosition: Vec2 = new Vec2(-mapData1v1.playGround.widht / 2 - wallThickness / 2, 0);
export const smallGoalRightPosition: Vec2 = new Vec2(mapData1v1.playGround.widht / 2 + wallThickness / 2, 0);
export const bigGoalLeftPosition: Vec2 = new Vec2(-mapData2v2.playGround.widht / 2 - wallThickness / 2, 0);
export const bigGoalRightPosition: Vec2 = new Vec2(mapData2v2.playGround.widht / 2 + wallThickness / 2, 0);

// paddles
export const paddleSize: Vec2 = new Vec2(0.2, 1.5);
export const smallPaddleLeftPosition: Vec2 = new Vec2(-mapData1v1.playGround.widht / 2 + wallThickness / 2, 0);
export const smallPaddleRightPosition: Vec2 = new Vec2(mapData1v1.playGround.widht / 2 - wallThickness / 2, 0);
export const bigPaddleLeftPosition: Vec2 = new Vec2(-mapData2v2.playGround.widht / 2 + wallThickness / 2, 0);
export const bigPaddleRightPosition: Vec2 = new Vec2(mapData2v2.playGround.widht / 2 - wallThickness / 2, 0);


export const ballSpeedMin = 0.5;
export const ballSpeedMax = 2;
export const ballRadius = 0.2;

export const defaultBallSpeed = 6;
export const paddleSpeed = 2;
export const defaultPointsToWin = 5;

export const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballRadius);
export const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleSize[0] / 2, paddleSize[1] / 2);
export const smallWallShape: PH2D.PolygonShape = new PH2D.PolygonShape(smallWallSize[0] / 2, smallWallSize[1] / 2);
export const bigWallShape: PH2D.PolygonShape = new PH2D.PolygonShape(bigWallSize[0] / 2, bigWallSize[1] / 2);
export const smallGoalShape: PH2D.PolygonShape = new PH2D.PolygonShape(smallGoalSize[0] / 2, smallGoalSize[1] / 2);
export const bigGoalShape: PH2D.PolygonShape = new PH2D.PolygonShape(bigGoalSize[0] / 2, bigGoalSize[1] / 2);
