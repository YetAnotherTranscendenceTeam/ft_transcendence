
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

let oldPos: Vec2 = undefined;
export default class TestPhysics {
	private readonly _canvas: HTMLCanvasElement;
	private _engine: Engine;

	private _scene: Scene; // pour un background sombre

	private _physicsScene: PH2D.Scene; // temporary
	private _accumulator: number = 0; // temporary

	private _updateFlag: boolean = false; // temporary

	private _physicalBall: PH2D.Body;
	private _physicalWall: PH2D.Body;

	private _visualBall: Mesh;
	private _visualWall: Mesh;

	public constructor() {
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);

		this._scene = new Scene(this._engine);

		// this._scene.createDefaultEnvironment()

		// const box = MeshBuilder.CreateBox("box", {}, this._scene);
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 7.5, Vector3.Zero(), this._scene);
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 10;
		camera.wheelPrecision = 50;

		const light = new HemisphericLight("light", Vector3.Up(), this._scene);
		light.intensity = 0.7;

		// event listeners
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);
		
		this._physicsScene = new PH2D.Scene(Vec2.create(), 1 / 10);
		
		const wallSize: Vec2 = new Vec2(0.2, 1);
		const wallHalfSize: Vec2 = new Vec2(wallSize.x / 2, wallSize.y / 2);
		const wallPos: Vec2 = new Vec2(-2.5, 0);

		const ballRadius: number = 0.1;
		const ballDiameter: number = ballRadius * 2;
		const ballPos: Vec2 = new Vec2(0, 0);
		const ballVel: Vec2 = new Vec2(-1, 0);

		// test physics

		const bounceMaterial: PH2D.Material = {
			density: 1,
			restitution: 1,
			staticFriction: 0,
			dynamicFriction: 0
		};

		const circle: PH2D.CircleShape = new PH2D.CircleShape(ballRadius);

		this._physicalBall = new PH2D.Body(
			PH2D.PhysicsType.DYNAMIC,
			circle,
			bounceMaterial,
			ballPos,
			ballVel,
		);

		const rectangle: PH2D.PolygonShape = new PH2D.PolygonShape(wallHalfSize.x, wallHalfSize.y);

		this._physicalWall = new PH2D.Body(
			PH2D.PhysicsType.TRIGGER,
			rectangle,
			bounceMaterial,
			wallPos,
			Vec2.create(),
		);

		this._physicsScene.addBody(this._physicalBall);
		this._physicsScene.addBody(this._physicalWall);

		this._physicalWall.filter = 1;
		this._physicalBall.filter = 1;

		this._physicalBall.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
			const { emitter, other, manifold } = event.detail;
		});

		// end test physics

		// visual
		this._visualBall = MeshBuilder.CreateSphere("ball", {diameter: ballDiameter, segments: 10}, this._scene);
		this._visualBall.position = new Vector3(ballPos.x, 0.1, ballPos.y);
		const ballMaterial = new StandardMaterial("ballMaterial", this._scene);
		ballMaterial.diffuseColor = Color3.White();
		ballMaterial.specularColor = Color3.Black();
		this._visualBall.material = ballMaterial;

		this._visualWall = MeshBuilder.CreateBox("wall", {height: 0.1, width: wallSize.x, depth: wallSize.y}, this._scene);
		this._visualWall.position = new Vector3(wallPos.x, 0.05, wallPos.y);
		const wallMaterial = new StandardMaterial("wallMaterial", this._scene);
		wallMaterial.diffuseColor = Color3.Red();
		wallMaterial.specularColor = Color3.Black();
		wallMaterial.emissiveColor = Color3.Red();
		wallMaterial.alpha = 0.5;
		this._visualWall.material = wallMaterial;

		this._engine.runRenderLoop(this.loop);
	}

	private loop = () => {
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
			this._visualBall.position.x = oldPos.x;
			this._visualBall.position.z = oldPos.y;
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
