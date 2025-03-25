import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, ballSpeedMin, bounceMaterial } from "./constants.js";
import { GameMode } from "yatt-lobbies";

export class Pong {
	private _scene: PH2D.Scene;
	private _balls: PH2D.Body[] = [];
	private _paddles: PH2D.Body[] = [];
	private _gameMode: GameMode;

	private _counter: number = 0;

	public constructor() {
		this._scene = new PH2D.Scene(Vec2.create(), DT);
	}

	private setupGame(gameMode: GameMode): void {
		this._scene.clear();
		this._gameMode = gameMode;
		// setup all
		if (gameMode.team_size === 1) {
			this.setup1v1();
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
	}

	private incrementCounter(): void {
		this._counter++;
	}

	private decrementCounter(): void {
		this._counter--;
	}

	private get counter(): number {
		return this._counter;
	}

	private set counter(value: number) {	// imagine this setter has some validation logic
		this._counter = value;
	}
}
