
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, InputBlock } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import createDefaultScene from "./DefaultScene";
import { GameMode, GameModeType, IPlayer } from 'yatt-lobbies'
import GameScene from "./GameScene";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { keyState } from "./types";

export default class PongClient {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	private _keyboard: Map<string, keyState>;
	private _gameScene: GameScene;

	public constructor() {
		// super();
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		this._keyboard = new Map<string, keyState>();
		this._keyboard.set("ArrowUp", keyState.IDLE);
		this._keyboard.set("ArrowDown", keyState.IDLE);
		this._keyboard.set("w", keyState.IDLE);
		this._keyboard.set("s", keyState.IDLE);
		this._keyboard.set("c", keyState.IDLE);
		this._gameScene = new GameScene(this._canvas, this._engine, this._keyboard);

		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("keypress", this.handleKeyPress);
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
		this._gameScene.update();
		this._gameScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

/*

export interface IGameMode {
	name: string;
	type: GameModeType;
	team_size: number;
	team_count: number;
	match_parameters: IMatchParameters;
}

*/

	private handleKeyDown = (ev: KeyboardEvent) => {
		// console.log(ev);
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

		if (ev.key === "z") {
			this._gameScene.newGame(1, new GameMode("test", { type: GameModeType.UNRANKED, team_size: 1, team_count: 2, match_parameters: { obstacles: false, powerups: false, time_limit: 0, ball_speed: 0, point_to_win: 0 } }), [{ account_id: 1}, { account_id: 2}]);
		}

		if (ev.key === "x") {
			this._gameScene.startGame();
		}

		if (this._keyboard.has(ev.key)) {
			const keyStateProbe = this._keyboard.get(ev.key);
			if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
				this._keyboard.set(ev.key, keyState.PRESSED);
			} else if (keyStateProbe === keyState.PRESSED) {
				this._keyboard.set(ev.key, keyState.HELD);
			}
		}
		// if (ev.key === "ArrowUp") {
		// 	const keyStateProbe = this._keyboard.get(ev.key);
		// 	if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
		// 		this._keyboard.set("ArrowUp", keyState.PRESSED);
		// 	} else {
		// 		this._keyboard.set("ArrowUp", keyState.HELD);
		// 	}
		// }
		// if (ev.key === "ArrowDown") {
		// 	const keyStateProbe = this._keyboard.get(ev.key);
		// 	if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
		// 		this._keyboard.set("ArrowDown", keyState.PRESSED);
		// 	} else if (keyStateProbe === keyState.PRESSED) {
		// 		this._keyboard.set("ArrowDown", keyState.HELD);
		// 	}
		// }
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		// console.log(ev);

		if (this._keyboard.has(ev.key)) {
			const keyStateProbe = this._keyboard.get(ev.key);
			if (keyStateProbe === keyState.PRESSED || keyStateProbe === keyState.HELD) {
				this._keyboard.set(ev.key, keyState.RELEASED);
			} else if (keyStateProbe === keyState.RELEASED) {
				this._keyboard.set(ev.key, keyState.IDLE);
			}
		}
	}

	private handleKeyPress = (ev: KeyboardEvent) => {
		// console.log(ev);

		// if (ev.key === "ArrowUp") {
		// 	this._gameScene.playerUp(1);
		// }
		// if (ev.key === "ArrowDown") {
		// 	this._gameScene.playerDown(1);
		// }
	}

	public destroy() {
		// this._gameScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
	}
}