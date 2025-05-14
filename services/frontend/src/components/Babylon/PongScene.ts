import * as PH2D from "physics-engine";
import * as PONG from "pong";
import * as BABYLON from "@babylonjs/core";
import AObject from "./Objects/AObject";
import { IServerStep, PaddleSyncs } from "./types";
import ClientBall from "./Objects/ClientBall";
import ClientPaddle from "./Objects/ClientPaddle";
import ClientWall from "./Objects/ClientWall";
import ClientObstacle from "./Objects/ClientObstacle";
import ClientGoal from "./Objects/ClientGoal";
import ClientEventBox from "./Objects/ClientEventBox";
import DirectionalLightHelper from "./DirectionalLightHelper";

export default class PongScene {
	private _canvas: HTMLCanvasElement;
	private _engine: BABYLON.Engine;
	private _scene: BABYLON.Scene;
	private _pong: PONG.Pong; // Ref to Pong instance

	public skybox: BABYLON.Mesh;
	public camera: BABYLON.ArcRotateCamera;
	public stadiumLights: BABYLON.DirectionalLight[]; // 4 lights
	public lightGizmo: BABYLON.LightGizmo;

	public meshMap: Map<PONG.MapID, Array<AObject>>;
	// public shadowGenerator: BABYLON.ShadowGenerator;
	public stadiumShadowGenerator: BABYLON.ShadowGenerator[];
	public ground: BABYLON.Mesh; // TEST

	public ballInstances: Array<ClientBall>;
	private _ballUsed: number;
	public paddleInstance: Map<number, ClientPaddle>;

	public constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine, pong: PONG.Pong) {
		this._canvas = canvas;
		this._engine = engine;
		this._pong = pong;
		this.meshMap = new Map<PONG.MapID, Array<AObject>>();
		this.ballInstances = [];
		this.paddleInstance = new Map<number, ClientPaddle>();
		this._ballUsed = 0;
		this.stadiumShadowGenerator = [];
		this.stadiumLights = [];

		this._scene = new BABYLON.Scene(this._engine);
		// Optimize for performance
		this._scene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		// this._scene.collisionsEnabled = false;
		this._scene.autoClear = true;
		this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

		const camera = new BABYLON.ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, BABYLON.Vector3.Zero(), this._scene);
		camera.inputs.clear();
		camera.inputs.addMouseWheel();
		camera.inputs.addPointers();
		// camera.inputs.attached.pointers.buttons = [0, 1];
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 300;
		camera.wheelPrecision = 50;
		camera.minZ = 0.1;

		const hdrTexture = new BABYLON.CubeTexture(
			"/assets/images/disco_4k.env",
			this._scene,
			null,
			false,
			null
		);

		// Environment texture
		// this._scene.environmentTexture = hdrTexture;


		// // Skybox
		// this._skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 500.0, sideOrientation: BABYLON.Mesh.BACKSIDE }, this._scene);
		// // this._skybox.infiniteDistance = true;
		// this._skybox.position.y = 250;
		// this._skybox.receiveShadows = true;

		// // // Skybox material
		// // // const skyboxMaterial = new BABYLON.PBRMaterial('skyBox', this._scene);
		// // // skyboxMaterial.backFaceCulling = false;
		// // // skyboxMaterial.disableLighting = true;
		// // // skyboxMaterial.reflectionTexture = hdrTexture.clone();
		// // // skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		// // // skyboxMaterial.roughness = 0.075;

		// // Skydome material
		// const skydomeMaterial = new BABYLON.BackgroundMaterial('skydome', this._scene);
		// skydomeMaterial.enableGroundProjection = true;
		// skydomeMaterial.projectedGroundRadius = 50;
		// skydomeMaterial.projectedGroundHeight = 15;
		// skydomeMaterial.reflectionTexture = hdrTexture.clone();
		// skydomeMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		// // skydomeMaterial.roughness = 0.075;

		// this._skybox.material = skydomeMaterial;

		// const dlh: DirectionalLightHelper[] = [];

		for (let i = 0; i < 4; i++) { // direction: (1, -2, 1) (-1, -2, 1) (-1, -2, -1) (1, -2, -1)
			const light = new BABYLON.DirectionalLight("stadiumLight" + i, new BABYLON.Vector3(
				(i % 2 === 0 ? 1 : -1),
				-2,
				(i < 2 ? 1 : -1)
			), this._scene);
			light.intensity = 0.5;
			light.diffuse = new BABYLON.Color3(1, 1, 1);
			light.specular = new BABYLON.Color3(1, 1, 1);
			light.shadowMinZ = -5;
			light.shadowMaxZ = 9.5;
			light.autoCalcShadowZBounds = true;
			
			this.stadiumLights.push(light);
			this.stadiumShadowGenerator.push(new BABYLON.ShadowGenerator(2048, light));
			this.stadiumShadowGenerator[i].useContactHardeningShadow = true;
			this.stadiumShadowGenerator[i].bias = 0.003;
			this.stadiumShadowGenerator[i].normalBias = 0.01;
			this.stadiumShadowGenerator[i].filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM;
			this.stadiumShadowGenerator[i].contactHardeningLightSizeUVRatio = 0.03;
			this.stadiumShadowGenerator[i].setDarkness(0.25);
			this.stadiumShadowGenerator[i].useKernelBlur = true;
			this.stadiumShadowGenerator[i].blurKernel = 32;
			// this.stadiumShadowGenerator[i].getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;

			const lightGizmo = new BABYLON.LightGizmo();
			lightGizmo.light = light;

			// dlh.push(new DirectionalLightHelper(light, lightGizmo));
		}

		const testLight = new BABYLON.PointLight("testLight", new BABYLON.Vector3(0, 0.5, -3), this._scene);
		testLight.intensity = 1;
		testLight.diffuse = new BABYLON.Color3(1, 0, 0);
		testLight.specular = new BABYLON.Color3(1, 0, 0);



		const ballMaterial = new BABYLON.PBRMaterial("ballMaterial", this._scene);
		ballMaterial.metallic = 1;
		ballMaterial.roughness = 1;
		ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._scene);
		ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._scene);
		ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", this._scene);
		ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", this._scene);
		// ballMaterial.reflectionTexture = hdrTexture;
		// ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
		ClientBall.template = ballMaterial;

		const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this._scene);
		wallMaterial.metallic = 0;
		wallMaterial.roughness = 0.5;
		wallMaterial.albedoColor = new BABYLON.Color3(0.25, 0.5, 0.62);
		ClientWall.template = wallMaterial;

		const obstacleMaterial = new BABYLON.PBRMaterial("obstacleMaterial", this._scene);
		obstacleMaterial.metallic = 0;
		obstacleMaterial.roughness = 0.5;
		obstacleMaterial.albedoColor = new BABYLON.Color3(0.25, 0.5, 0.62);
		// obstacleMaterial.alpha = 0.5;
		ClientObstacle.template = obstacleMaterial;

		const paddleMaterial = new BABYLON.PBRMaterial("paddleMaterial", this._scene);
		paddleMaterial.metallic = 0;
		paddleMaterial.roughness = 0.5;
		paddleMaterial.albedoColor = BABYLON.Color3.White();
		ClientPaddle.template = paddleMaterial;

		const goalMaterial = new BABYLON.PBRMaterial("goalMaterial", this._scene);
		goalMaterial.metallic = 0;
		goalMaterial.roughness = 0.5;
		goalMaterial.albedoColor = BABYLON.Color3.Red();
		goalMaterial.alpha = 0.5;
		ClientGoal.template = goalMaterial;

		const eventBoxMaterial = new BABYLON.PBRMaterial("eventBoxMaterial", this._scene);
		eventBoxMaterial.metallic = 0;
		eventBoxMaterial.roughness = 0.5;
		eventBoxMaterial.albedoColor = BABYLON.Color3.Green();
		eventBoxMaterial.alpha = 0.5;
		ClientEventBox.template = eventBoxMaterial;
		
		pong.maps.forEach((map: PONG.IPongMap, mapId: PONG.MapID) => {
			const mapMesh: Array<AObject> = [];
			let counter: number = 0;

			const objects: PH2D.Body[] = map.getObjects();
			objects.forEach((object: PH2D.Body) => {
				let clientObject: AObject | undefined;
				if (object instanceof PONG.Wall) {
					clientObject = new ClientWall(this._scene, ("wall" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Goal) {
					clientObject = new ClientGoal(this._scene, ("goal" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Paddle) {
					clientObject = new ClientPaddle(this._scene, ("paddle" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Obstacle) {
					clientObject = new ClientObstacle(this._scene, ("obstacle" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.EventBox) {
					clientObject = new ClientEventBox(this._scene, ("eventbox" + map.mapId.toString() + counter.toPrecision(2)), object);
				}
				if (clientObject !== undefined) {
					clientObject.disable();
					mapMesh.push(clientObject);
				}
				counter++;
			});
			
			this.meshMap.set(mapId, mapMesh);
		});

		// // Test Cube
		// const cube = MeshBuilder.CreateBox("cube", { size: 1 }, this._scene);
		// cube.position = new BABYLON.Vector3(0, 3, 0);
		// cube.rotation = new BABYLON.Vector3(1, 2, 3);

		// const pbr = new BABYLON.PBRMaterial("pbr", this._scene);
		// pbr.albedoColor = new BABYLON.BABYLON.Color3(0.7, 0.8, 0.3);
		// pbr.metallic = 0.0;
		// pbr.roughness = 1.0;
		// cube.material = pbr;
		// cube.receiveShadows = true;

		// // // Test Sphere
		// const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
		// sphere.position = new BABYLON.Vector3(0, 1, 0);

		// const pbr = new BABYLON.PBRMaterial("pbr", this._scene);
		// pbr.albedoColor = new BABYLON.BABYLON.Color3(0.7, 0.8, 0.3);
		// pbr.metallic = 0.0;
		// pbr.roughness = 1.0;
		// sphere.material = pbr;
		// sphere.receiveShadows = true;

		// Shadow
		this.meshMap.forEach((map: Array<AObject>, mapID: PONG.MapID) => {
			map.forEach((object: AObject) => {
				this.stadiumShadowGenerator.forEach((shadowGenerator: BABYLON.ShadowGenerator) => {
					shadowGenerator.getShadowMap().renderList.push(object.mesh);
				});
				object.mesh.receiveShadows = true;
			});
		});

		this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 30, subdivisions: 50 }, this._scene);
		const groundMaterial = new BABYLON.PBRMaterial("groundMaterial", this._scene);
		groundMaterial.metallic = 0;
		groundMaterial.roughness = 0.5;
		groundMaterial.albedoColor = new BABYLON.Color3(0.7, 0.55, 0.3);
		groundMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
		this.ground.material = groundMaterial;
		this.ground.receiveShadows = true;




		// Preload the ball (PONG.K.maxBallAmount)
		for (let i = 0; i < PONG.K.maxBallAmount; i++) {
			const ball = new ClientBall(this._scene, "ball" + i, undefined);
			ball.disable();
			this.ballInstances.push(ball);
			this.stadiumShadowGenerator.forEach((shadowGenerator: BABYLON.ShadowGenerator) => {
				shadowGenerator.getShadowMap().renderList.push(ball.mesh);
			});
			ball.mesh.receiveShadows = true;
		}

		console.log("All ClientBall instances", this.ballInstances);

		// window.setTimeout(() => {
		// 	this._scene.onAfterRenderObservable.add(() => dlh.forEach((dlh: DirectionalLightHelper) => {
		// 		dlh.buildLightHelper();
		// 	}));
		// }, 500);

		this._scene.registerBeforeRender(() => {
			// console.log("light shadow", light.shadowMinZ, light.shadowMaxZ);
			if (this.ballInstances.length > 0) {
				testLight.position = this.ballInstances[0].mesh.position;
			}
		});

		console.log("PongScene created");
	}

	public render(): void {
		this._scene.render();
	}

	public toogleDebug(): void {
		this._scene.debugLayer.isVisible() ? this._scene.debugLayer.hide() : this._scene.debugLayer.show();
	}

	/*
	 * When a physical ball is created, we need to link it to one of the client balls.
	 * 
	 */
	public addBall(ball: PONG.Ball): void {
		if (this._ballUsed >= PONG.K.maxBallAmount) {
			throw new Error("No more balls available");
		}
		console.log("addBall", this._ballUsed);
		const clientBall: ClientBall = this.ballInstances[this._ballUsed];
		console.log("All ClientBall instances again", this.ballInstances);
		console.log("clientBall", clientBall);
		clientBall.updateBodyReference(ball);
		clientBall.enable();
		this._ballUsed++;
	}

	public removeBall(ball: PONG.Ball): void {
		const clientBall: ClientBall = this.ballInstances.find((clientBall: ClientBall) => clientBall.physicsBody === ball) as ClientBall;
		clientBall.disable();
		clientBall.updateBodyReference(undefined);
		this._ballUsed--;
	}

	public removeAllBalls(): void {
		this.ballInstances.forEach((clientBall: ClientBall) => {
			clientBall.disable();
			clientBall.updateBodyReference(undefined);
		});
		this._ballUsed = 0;
	}

	public updateMeshes(ball_interp: number = 1, interpolation: number = 1) {
		this.ballInstances.forEach((ball: ClientBall) => {
			ball.update(ball_interp);
		});
		this.meshMap.get(this._pong.currentMap.mapId)?.forEach((object: AObject) => {
			object.update(interpolation);
		});
	}

	public disableMap(mapId: PONG.MapID): void {
		if (mapId === undefined) {
			return;
		}
		this.meshMap.get(mapId)?.forEach((object: AObject) => {
			object.disable();
		});
	}

	public enableMap(mapId: PONG.MapID): void {
		if (mapId === undefined) {
			return;
		}
		this.meshMap.get(mapId)?.forEach((object: AObject) => {
			object.enable();
		});
	}

	public get scene(): BABYLON.Scene {
		return this._scene;
	}
}
