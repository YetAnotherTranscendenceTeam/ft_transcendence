
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4 } from "@babylonjs/core";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import createDefaultScene from "./DefaultScene";

let oldPos: Vec2 = undefined;
export default class TestPhysics {
	private readonly _canvas: HTMLCanvasElement;
	private _engine: Engine;

	private _scene: Scene; // pour un background sombre

	private _physicsScene: PH2D.Scene; // temporary
	private _accumulator: number = 0; // temporary

	private _updateFlag: boolean = false; // temporary

	private _physicalBall: PH2D.Body;

	public constructor() {
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);

		this._scene = createDefaultScene(this._canvas, this._engine);

		// event listeners
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);
		
		this._physicsScene = new PH2D.Scene(Vec2.create(), 1 / 10);
		
		// test physics

		const bounceMaterial: PH2D.Material = {
			density: 1,
			restitution: 1,
			staticFriction: 0,
			dynamicFriction: 0
		};

		const circle: PH2D.CircleShape = new PH2D.CircleShape(0.1);
		console.log(circle);

		this._physicalBall = new PH2D.Body(
			PH2D.PhysicsType.DYNAMIC,
			circle,
			bounceMaterial,
			Vec2.create(),
			new Vec2(-1, 0),
		);
		console.log(this._physicalBall);

		const rectangle: PH2D.PolygonShape = new PH2D.PolygonShape(1, 5);
		console.log(rectangle);

		const physicalWall: PH2D.Body = new PH2D.Body(
			PH2D.PhysicsType.STATIC,
			rectangle,
			bounceMaterial,
			new Vec2(-10, 0),
			Vec2.create(),
		);
		console.log(physicalWall);

		this._physicsScene.addBody(this._physicalBall);
		this._physicsScene.addBody(physicalWall);

		physicalWall.filter = 1;
		this._physicalBall.filter = 1;

		console.log(this._physicsScene);

		// end test physics

		this._engine.runRenderLoop(this.loop);
		
	}

	private loop = () => {
		if (this._updateFlag) {
			console.log("o pos", oldPos);
			console.log("o vel", this._physicalBall.velocity);
		}
		const dt = this._engine.getDeltaTime() / 1000;
		this._accumulator += dt;
		if (this._accumulator > 0.2) {
			this._accumulator = 0.2;
		}
		while (this._accumulator >= 1 / 10) {
			if (this._updateFlag) {
				this._physicsScene.step();
			}
			this._accumulator -= 1 / 10;
		}
		if (this._updateFlag) {
			oldPos = this._physicalBall.interpolatePosition(this._accumulator / (1 / 10)) as Vec2;
			console.log("n pos", oldPos);
			console.log("n vel", this._physicalBall.velocity);
			console.log("");
		}
		this._scene.render();
	}

	private resize = () => {
		this._engine.resize();
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		if (ev.key === "f") {
			this._updateFlag = !this._updateFlag;
		}
	}

	public destroy() {
		this._engine.stopRenderLoop();
		this._engine.dispose();
	}
}