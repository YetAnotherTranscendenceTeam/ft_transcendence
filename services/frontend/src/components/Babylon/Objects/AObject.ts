import { Mesh, Scene} from "@babylonjs/core";
import * as PH2D from "physics-engine";

export default abstract class AObject {
	protected _scene: Scene;
	protected _mesh: Mesh;
	protected _physicsBody: PH2D.Body;
	protected _isEnabled: boolean = true;

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		this._scene = scene;
		this._physicsBody = physicsBody;
	}

	public update(dt: number): void {}

	public disable(): void {
		this._mesh.setEnabled(false);
		this._isEnabled = false;
	}

	public enable(): void {
		this._mesh.setEnabled(true);
		this._isEnabled = true;
	}

	public get mesh(): Mesh {
		return this._mesh;
	}

	public get physicsBody(): PH2D.Body {
		return this._physicsBody;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};