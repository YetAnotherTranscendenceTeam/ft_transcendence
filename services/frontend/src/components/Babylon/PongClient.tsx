
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, InputBlock } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import createDefaultScene from "./DefaultScene";
import createGameScene from "./GameScene";
// import * as GLMATH from "gl-matrix";
// import createGroundScene from "./GroundScene";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { Pong } from "pong";

enum SceneState {
	MENU,
	PLAYING,
	GAME_OVER,
	TEST,
	GROUND_DEV
}


export default class PongClient extends Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	// private _scene: Array<Scene>;
	private _gameScene: { scene: Scene, sphere: Ball };
	private _activeScene: SceneState;

	private _physicsScene: PH2D.Scene; // temporary
	private _accumulator: number = 0; // temporary

	private _updateFlag: boolean = false; // temporary

	public constructor() {
		super();
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);

		// event listeners
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);
		
		this._physicsScene = new PH2D.Scene(Vec2.create(), 1 / 60);
		
		// this._scene = Array<Scene>();
		// this._scene[SceneState.MENU] = createDefaultScene(this._canvas, this._engine);
		// this._scene[SceneState.PLAYING] = createDefaultScene(this._canvas, this._engine);
		// this._scene[SceneState.GAME_OVER] = createDefaultScene(this._canvas, this._engine);
		// this._scene[SceneState.TEST] = createGameScene(this._canvas, this._engine, this._physicsScene);
		// this._scene[SceneState.GROUND_DEV] = createDefaultScene(this._canvas, this._engine);
		this._gameScene = createGameScene(this._canvas, this._engine, this._physicsScene);
		
		this._activeScene = SceneState.TEST;
		
		// test physics
		
		const bounceMaterial: PH2D.Material = {
			density: 1,
			restitution: 1,
			staticFriction: 0,
			dynamicFriction: 0
		};

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
		
		this._physicsScene.addBody(physicalWall);
		
		// end test physics
		
		this._engine.runRenderLoop(this.loop);
		this._websocket = new WebSocket("ws://localhost:4124");
		this._websocket.onmessage = (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.event === "state") {
				console.log({counter: msg.data.counter});
				this.counter = msg.data.counter;
			}
		}
		this._websocket.onopen = (ev) => {
			console.log(ev);
		}
		this._websocket.onclose = (ev) => {
			console.log(ev);
		}
		
	}

	private loop = () => {
		const dt = this._engine.getDeltaTime() / 1000;
		this._accumulator += dt;
		if (this._accumulator > 0.2) {
			this._accumulator = 0.2;
		}
		while (this._accumulator >= 1 / 60) {
			if (this._updateFlag) {
				this._physicsScene.step();
			}
			this._accumulator -= 1 / 60;
		}
		// console.log(this._physicsScene);
		if (this._updateFlag) {
			this._gameScene.sphere.update();
		}
		this._gameScene.scene.render();
		console.log(this.counter);
	}

	private resize = () => {
		this._engine.resize();
	}

	public incrementCounter() {
		super.incrementCounter();
		this._websocket.send(JSON.stringify({event: "increment"}));
	}

	public decrementCounter() {
		super.decrementCounter();
		this._websocket.send(JSON.stringify({event: "decrement"}));
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		console.log(ev);
		// Shift+Ctrl+Alt+I
		// if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
		// 	if (this._scene[this._activeScene].debugLayer.isVisible()) {
		// 		this._scene[this._activeScene].debugLayer.hide();
		// 	} else {
		// 		this._scene[this._activeScene].debugLayer.show();
		// 	}
		// }
		if (this._activeScene === SceneState.TEST) {
			if (ev.key === "1") {
				this._gameScene.scene.activeCamera = this._gameScene.scene.cameras[0];
			} else if (ev.key === "2") {
				this._gameScene.scene.activeCamera = this._gameScene.scene.cameras[1];
			} else if (ev.key === "3") {
				this._gameScene.scene.activeCamera = this._gameScene.scene.cameras[2];
			}
		}

		if (ev.key === "t" || ev.key === "T") {
			this._activeScene = SceneState.TEST;
		} else if (ev.key === "g" || ev.key === "G") {
			this._activeScene = SceneState.GROUND_DEV;
		}

		if (ev.key === "f" || ev.key === "F") {
			this._updateFlag = !this._updateFlag;
		}

		if (ev.key === "ArrowUp") {
			this.incrementCounter();
		}

		if (ev.key === "ArrowDown") {
			this.decrementCounter();
		}
	}

	public destroy() {
		// this._scene.dispose();
		// for (let i = 0; i < this._scene.length; i++) {
		// 	this._scene[i].dispose();
		// }
		this._gameScene.scene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
	}
}