import Babact from "babact";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";

class App {
	private _engine: Engine;
	private _scene: Scene;

    public constructor() {
        var canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this._engine = new Engine(canvas, true);
        this._scene = new Scene(this._engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
	
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);

        // event listeners
        window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.resize);

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
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
    }

    public destroy() {
        // this._scene.dispose();
        window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
    }
}

export default function Babylon() {

    Babact.useEffect(() => {
        const app = new App();
        return () => {
            app.destroy();
        }
    }, [])

	return <canvas style="width: 100vw; height: 100vh;" id="gameCanvas">
	</canvas>
}