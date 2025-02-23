
// import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3 } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";

export default class PongClient {
	private readonly _canvas: HTMLCanvasElement;
	private _engine: Engine;
	private _scene: Scene;

    public constructor() {
        this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
		this.createScene();
		
    }

	public run() {
		this._engine.runRenderLoop(() => {
			this._scene.render();
		});
	}

	private createScene = () => {
        this._scene = new Scene(this._engine);

        const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), this._scene);
        const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), this._scene);
        const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), this._scene);
        cameraTopDown.attachControl(this._canvas, true);
        cameraTopDown.lowerRadiusLimit = 1.5;
        cameraTopDown.upperRadiusLimit = 10;
        cameraTopDown.wheelPrecision = 50;
        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);

		// console.log("Scene cameras", this._scene.cameras);
	
        const sphere: Ball = new Ball(this._scene);
        // const sphere2: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 0.115 }, this._scene);

        const wall1: Wall = new Wall(this._scene, "wall1", new Vector2(0, 1.5), new Vector2(4, 0.1));
        const wall2: Wall = new Wall(this._scene, "wall2", new Vector2(0, -1.5), new Vector2(4, 0.1));

        // event listeners
        window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);
	}

	private resize = () => {
		this._engine.resize();
	}

    private handleKeyDown = (ev: KeyboardEvent) => {
        console.log(ev);
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
            if (this._scene.debugLayer.isVisible()) {
                this._scene.debugLayer.hide();
            } else {
                this._scene.debugLayer.show();
            }
        }
		if (ev.key === "1") {
			this._scene.activeCamera = this._scene.cameras[0];
		} else if (ev.key === "2") {
			this._scene.activeCamera = this._scene.cameras[1];
		} else if (ev.key === "3") {
			this._scene.activeCamera = this._scene.cameras[2];
		}
    }

    public destroy() {
        this._scene.dispose();
        window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
    }
}