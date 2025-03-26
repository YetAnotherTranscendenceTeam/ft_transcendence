import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, ballSpeedMin, bounceMaterial } from "./constants.js";
import { GameMode } from "yatt-lobbies";

export class Pong {
	private _scene: PH2D.Scene;

	private _balls: PH2D.Body[] = [];
	private _paddles: PH2D.Body[] = [];
	private _gameMode: GameMode;

	public constructor() {
		this._scene = new PH2D.Scene(Vec2.create(), DT);
	}

	public setupGame(gameMode: GameMode): void {
		this._scene.clear();
		this._gameMode = gameMode;
		// setup all
		if (gameMode.team_size === 1) {
			this.setup1v1();
		} else {
			throw new Error("Unsupported game mode");
		}
	}

	private setup1v1(): void {
		const paddelShape = new PH2D.PolygonShape(0.1, 1);
		const paddleMaterial = bounceMaterial;
		const paddle1 = new PH2D.Body(
			PH2D.PhysicsType.KINEMATIC,
			paddelShape,
			paddleMaterial,
			new Vec2(-5, 0),
			Vec2.create()
		);
		const paddle2 = new PH2D.Body(
			PH2D.PhysicsType.KINEMATIC,
			paddelShape,
			paddleMaterial,
			new Vec2(5, 0),
			Vec2.create()
		);
		this._paddles.push(paddle1);
		this._paddles.push(paddle2);
		this._scene.addBody(paddle1);
		this._scene.addBody(paddle2);

		const ballShape = new PH2D.CircleShape(0.1);
		const ballMaterial = bounceMaterial;
		const ball1 = new PH2D.Body(
			PH2D.PhysicsType.DYNAMIC,
			ballShape,
			ballMaterial,
			Vec2.create(),
			Vec2.create(), // not moving until game starts
		);
		this._balls.push(ball1);
		this._scene.addBody(ball1);

		const wallShape = new PH2D.PolygonShape(6, 0.25);
		const wallMaterial = bounceMaterial;
		const wall1 = new PH2D.Body(
			PH2D.PhysicsType.STATIC,
			wallShape,
			wallMaterial,
			new Vec2(0, 4),
			Vec2.create()
		);
		const wall2 = new PH2D.Body(
			PH2D.PhysicsType.STATIC,
			wallShape,
			wallMaterial,
			new Vec2(0, -4),
			Vec2.create()
		);
		this._scene.addBody(wall1);
		this._scene.addBody(wall2);

		// temporary walls
		const sideWallShape = new PH2D.PolygonShape(0.25, 4);
		const sideWallMaterial = bounceMaterial;
		const sideWall1 = new PH2D.Body(
			PH2D.PhysicsType.STATIC,
			sideWallShape,
			sideWallMaterial,
			new Vec2(-6, 0),
			Vec2.create()
		);
		const sideWall2 = new PH2D.Body(
			PH2D.PhysicsType.STATIC,
			sideWallShape,
			sideWallMaterial,
			new Vec2(6, 0),
			Vec2.create()
		);
		this._scene.addBody(sideWall1);
		this._scene.addBody(sideWall2);
	}

	public startGame(): void {
		this._balls[0].velocity = Vec2.fromValues(ballSpeedMin, 0);
	}
}
