
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, InputBlock } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import createDefaultScene from "./DefaultScene";
import GameScene from "./GameScene";
// import * as GLMATH from "gl-matrix";
// import createGroundScene from "./GroundScene";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { Pong } from "pong";

export default class PongClient extends Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	// private _gameScene: Scene;
	private _gameScene: GameScene;

	public constructor() {
		super();
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		
		// this._gameScene = createGameScene(this._canvas, this._engine);
		this._gameScene = new GameScene(this._canvas, this._engine);

		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);
		
		this._engine.runRenderLoop(this.loop);

		this._websocket = new WebSocket("ws://localhost:4124");

		this._websocket.onmessage = (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.event === "state") {
				console.log({counter: msg.data.counter});
				// this.counter = msg.data.counter;
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
		this._gameScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
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
		// if (ev.key === "1") {
		// 	this._gameScene.activeCamera = this._gameScene.cameras[0];
		// } else if (ev.key === "2") {
		// 	this._gameScene.activeCamera = this._gameScene.cameras[1];
		// } else if (ev.key === "3") {
		// 	this._gameScene.activeCamera = this._gameScene.cameras[2];
		// }

		if (ev.key === "ArrowUp") {
			// this.incrementCounter();
		}

		if (ev.key === "ArrowDown") {
			// this.decrementCounter();
		}
	}

	public destroy() {
		// this._gameScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
	}
}