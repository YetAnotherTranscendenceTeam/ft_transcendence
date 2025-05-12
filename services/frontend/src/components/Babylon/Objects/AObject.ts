import { Mesh, Scene} from "@babylonjs/core";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

export default abstract class AObject {
	protected _scene: Scene;
	protected _mesh: Mesh;
	protected _physicsBody: PH2D.Body;
	protected _isEnabled: boolean;

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		this._scene = scene;
		this._physicsBody = physicsBody;
		this._isEnabled = true;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const wallPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = wallPos.x;
		this._mesh.position.z = wallPos.y;
		this._mesh.rotation.y = this._physicsBody.orientation;
	}

	public disable(): void {
		this._mesh?.setEnabled(false);
		this._isEnabled = false;
		this._physicsBody.filter = 1;
	}

	public enable(): void {
		this._mesh?.setEnabled(true);
		this._isEnabled = true;
		this._physicsBody.filter = 0;
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

	public updateBodyReference(physicsBody: PH2D.Body) {
		this._physicsBody = physicsBody;
	}
};