import * as BABYLON from "@babylonjs/core";

export default class DirectionalLightHelper {
	private _viewMatrix: BABYLON.Matrix;
	private _oldPosition: BABYLON.Vector3;
	private _oldDirection: BABYLON.Vector3;
	private _oldAutoCalc: boolean;
	private _oldMinZ: number;
	private _oldMaxZ: number;
	private _lightHelperFrustumLines: BABYLON.AbstractMesh[];
	private scene: BABYLON.Scene;
	private light: BABYLON.DirectionalLight;
	private camera: BABYLON.Camera;

    constructor(light, camera) {
        this.scene = light.getScene();
        this.light = light;
        this.camera = camera;
        this._viewMatrix = BABYLON.Matrix.Identity();
        this._lightHelperFrustumLines = [];
    }

    getLightExtents() {
        const light = this.light;

        return {
            "min": new BABYLON.Vector3(light.orthoLeft, light.orthoBottom, light.shadowMinZ !== undefined ? light.shadowMinZ : this.camera.minZ),
            "max": new BABYLON.Vector3(light.orthoRight, light.orthoTop, light.shadowMaxZ !== undefined ? light.shadowMaxZ : this.camera.maxZ)
        };
    }

    getViewMatrix() {
        // same computation here than in the shadow generator
        BABYLON.Matrix.LookAtLHToRef(this.light.position, this.light.position.add(this.light.direction), BABYLON.Vector3.Up(), this._viewMatrix);
        return this._viewMatrix;
    }

    buildLightHelper() {
        if (this._oldPosition 
            && this._oldPosition.equals(this.light.position) 
            && this._oldDirection.equals(this.light.direction) 
            && this._oldAutoCalc === this.light.autoCalcShadowZBounds
            && this._oldMinZ === this.light.shadowMinZ
            && this._oldMaxZ === this.light.shadowMaxZ
        ) {
            return;
        }

        this._oldPosition = this.light.position;
        this._oldDirection = this.light.direction;
        this._oldAutoCalc = this.light.autoCalcShadowZBounds;
        this._oldMinZ = this.light.shadowMinZ;
        this._oldMaxZ = this.light.shadowMaxZ;

        this._lightHelperFrustumLines.forEach((mesh) => {
            mesh.dispose();
        });

        this._lightHelperFrustumLines = [];

        const lightExtents = this.getLightExtents();
        const lightView = this.getViewMatrix();

        if (!lightExtents || !lightView) {
            return;
        }

        const invLightView = BABYLON.Matrix.Invert(lightView);

        const n1 = new BABYLON.Vector3(lightExtents.max.x, lightExtents.max.y, lightExtents.min.z);
        const n2 = new BABYLON.Vector3(lightExtents.max.x, lightExtents.min.y, lightExtents.min.z);
        const n3 = new BABYLON.Vector3(lightExtents.min.x, lightExtents.min.y, lightExtents.min.z);
        const n4 = new BABYLON.Vector3(lightExtents.min.x, lightExtents.max.y, lightExtents.min.z);

        const near1 = BABYLON.Vector3.TransformCoordinates(n1, invLightView);
        const near2 = BABYLON.Vector3.TransformCoordinates(n2, invLightView);
        const near3 = BABYLON.Vector3.TransformCoordinates(n3, invLightView);
        const near4 = BABYLON.Vector3.TransformCoordinates(n4, invLightView);

        const f1 = new BABYLON.Vector3(lightExtents.max.x, lightExtents.max.y, lightExtents.max.z);
        const f2 = new BABYLON.Vector3(lightExtents.max.x, lightExtents.min.y, lightExtents.max.z);
        const f3 = new BABYLON.Vector3(lightExtents.min.x, lightExtents.min.y, lightExtents.max.z);
        const f4 = new BABYLON.Vector3(lightExtents.min.x, lightExtents.max.y, lightExtents.max.z);

        const far1 = BABYLON.Vector3.TransformCoordinates(f1, invLightView);
        const far2 = BABYLON.Vector3.TransformCoordinates(f2, invLightView);
        const far3 = BABYLON.Vector3.TransformCoordinates(f3, invLightView);
        const far4 = BABYLON.Vector3.TransformCoordinates(f4, invLightView);

        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("nearlines", { points: [near1, near2, near3, near4, near1] }, this.scene));
        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("farlines",  { points: [far1, far2, far3, far4, far1] }, this.scene));
        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("trlines", { points: [ near1, far1 ] }, this.scene));
        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("brlines", { points: [ near2, far2 ] }, this.scene));
        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("tllines", { points: [ near3, far3 ] }, this.scene));
        this._lightHelperFrustumLines.push(BABYLON.MeshBuilder.CreateLines("bllines", { points: [ near4, far4 ] }, this.scene));

        const makePlane = (name, color, positions) => {
            let plane = new BABYLON.Mesh(name + "plane", this.scene),
                mat = new BABYLON.StandardMaterial(name + "PlaneMat", this.scene);

            plane.material = mat;

            mat.emissiveColor = color;
            mat.alpha = 0.3;
            mat.backFaceCulling = false;
            mat.disableLighting = true;

            const indices = [0, 1, 2, 0, 2, 3];

            const vertexData = new BABYLON.VertexData();

            vertexData.positions = positions;
            vertexData.indices = indices;

            vertexData.applyToMesh(plane);

            this._lightHelperFrustumLines.push(plane);
        };

        makePlane("near",   new BABYLON.Color3(1, 0, 0),    [near1.x, near1.y, near1.z, near2.x, near2.y, near2.z, near3.x, near3.y, near3.z, near4.x, near4.y, near4.z ]);
        makePlane("far",    new BABYLON.Color3(0.3, 0, 0),  [far1.x, far1.y, far1.z, far2.x, far2.y, far2.z, far3.x, far3.y, far3.z, far4.x, far4.y, far4.z ]);
        makePlane("right",  new BABYLON.Color3(0, 1, 0),    [near1.x, near1.y, near1.z, far1.x, far1.y, far1.z, far2.x, far2.y, far2.z, near2.x, near2.y, near2.z ]);
        makePlane("left",   new BABYLON.Color3(0, 0.3, 0),  [near4.x, near4.y, near4.z, far4.x, far4.y, far4.z, far3.x, far3.y, far3.z, near3.x, near3.y, near3.z ]);
        makePlane("top",    new BABYLON.Color3(0, 0, 1),    [near1.x, near1.y, near1.z, far1.x, far1.y, far1.z, far4.x, far4.y, far4.z, near4.x, near4.y, near4.z ]);
        makePlane("bottom", new BABYLON.Color3(0, 0, 0.3),  [near2.x, near2.y, near2.z, far2.x, far2.y, far2.z, far3.x, far3.y, far3.z, near3.x, near3.y, near3.z ]);
    }
}
