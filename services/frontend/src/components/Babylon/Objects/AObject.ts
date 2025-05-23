import { Mesh, Scene, PBRMaterial, ReflectionProbe } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

export default abstract class AObject {
	protected _scene: Scene;
	protected _mesh: Mesh;
	protected _material: PBRMaterial | BABYLON.NodeMaterial;
	protected _probe: ReflectionProbe;
	protected _physicsBody: PH2D.Body;
	protected _isEnabled: boolean;

	// public static template: BABYLON.Material;

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		this._scene = scene;
		this._physicsBody = physicsBody;
		this._isEnabled = true;
	}

	public update(dt: number, interpolation: number): void {
		if (!this._isEnabled) return;
		const pos = this._physicsBody.interpolatePosition(interpolation) as Vec2;
		this._mesh.position.x = pos.x;
		this._mesh.position.z = pos.y;
		this._mesh.rotation.y = this._physicsBody.orientation;
	}

	private generateProbe(): void {
		if (!this._mesh || this._probe || !this._mesh.material || !(this._mesh.material instanceof PBRMaterial)) {
			return;
		}

		this._probe = new ReflectionProbe("probe" + this._mesh.name, 256, this._scene);
		(this._material as PBRMaterial).reflectionTexture = this._probe.cubeTexture;
		this._probe.attachToMesh(this._mesh);
	}

	public addToProbe(object: AObject | Mesh | AObject[] | Mesh[]): void {
		if (!this._mesh || !(this._mesh.material instanceof PBRMaterial)) {
			return;
		}
		if (!this._probe) {
			this.generateProbe();
		}
		if (object instanceof AObject) {
			this._probe.renderList.push(object.mesh);
		} else if (object instanceof Mesh) {
			this._probe.renderList.push(object);
		} else if (Array.isArray(object)) {
			if (object.length <= 0) {
				return;
			}
			if (object[0] instanceof AObject) {
				for (const obj of object) {
					this._probe.renderList.push((obj as AObject).mesh);
				}
			} else if (object[0] instanceof Mesh) {
				for (const obj of object) {
					this._probe.renderList.push(obj as Mesh);
				}
			}
		}
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

	public get probe(): ReflectionProbe {
		return this._probe;
	}

	public get material(): PBRMaterial | BABYLON.NodeMaterial {
		return this._material;
	}

	public dispose() {
		this._mesh?.dispose();
	}

	public updateBodyReference(physicsBody: PH2D.Body) {
		this._physicsBody = physicsBody;
	}

	public probeRender() {
		if (this._probe) {
			this._probe.cubeTexture.render();
		}
	}
};