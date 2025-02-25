
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4 } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import createDefaultScene from "./DefaultScene";
import createGameScene from "./GameScene";
// import createGroundScene from "./GroundScene";
import HavokPhysics from "@babylonjs/havok";

enum SceneState {
	MENU,
	PLAYING,
	GAME_OVER,
	TEST,
	GROUND_DEV
}

export default class PongClient {
	private readonly _canvas: HTMLCanvasElement;
	private _engine: Engine;
	private _scene: Array<Scene>;
	private _activeScene: SceneState;

	public constructor() {
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		
		this._scene = Array<Scene>();
		this._scene[SceneState.MENU] = createDefaultScene(this._canvas, this._engine);
		this._scene[SceneState.PLAYING] = createDefaultScene(this._canvas, this._engine);
		this._scene[SceneState.GAME_OVER] = createDefaultScene(this._canvas, this._engine);
		this._scene[SceneState.TEST] = createGameScene(this._canvas, this._engine);
		this._scene[SceneState.GROUND_DEV] = createDefaultScene(this._canvas, this._engine);

		this._activeScene = SceneState.TEST;

		// event listeners
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);

		this._engine.runRenderLoop(this.loop);
		
	}

	public static initializeHavoPhysics = async () => {
		globalThis.HK = await HavokPhysics();
		// const hk : HavokPlugin = new HavokPlugin();
		// this._scene.enablePhysics(new Vector3(0, 0, 0), hk);
	}

	private loop = () => {
		this._scene[this._activeScene].render();
	}

	private resize = () => {
		this._engine.resize();
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		console.log(ev);
		// Shift+Ctrl+Alt+I
		if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
			if (this._scene[this._activeScene].debugLayer.isVisible()) {
				this._scene[this._activeScene].debugLayer.hide();
			} else {
				this._scene[this._activeScene].debugLayer.show();
			}
		}
		if (this._activeScene === SceneState.TEST) {
			if (ev.key === "1") {
				this._scene[SceneState.TEST].activeCamera = this._scene[SceneState.TEST].cameras[0];
			} else if (ev.key === "2") {
				this._scene[SceneState.TEST].activeCamera = this._scene[SceneState.TEST].cameras[1];
			} else if (ev.key === "3") {
				this._scene[SceneState.TEST].activeCamera = this._scene[SceneState.TEST].cameras[2];
			}
		}

		if (ev.key === "t" || ev.key === "T") {
			this._activeScene = SceneState.TEST;
		} else if (ev.key === "g" || ev.key === "G") {
			this._activeScene = SceneState.GROUND_DEV;
		}
	}

	public destroy() {
		// this._scene.dispose();
		for (let i = 0; i < this._scene.length; i++) {
			this._scene[i].dispose();
		}
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
	}
}