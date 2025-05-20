import * as PH2D from "physics-engine";
import * as PONG from "pong";
import * as BABYLON from "@babylonjs/core";
import AObject from "./Objects/AObject";
import { ClientMap, GraphicsQuality, IServerStep, PaddleSyncs } from "./types";
import ClientBall from "./Objects/ClientBall";
import ClientPaddle from "./Objects/ClientPaddle";
import ClientWall from "./Objects/ClientWall";
import ClientObstacle from "./Objects/ClientObstacle";
import ClientGoal from "./Objects/ClientGoal";
import ClientEventBox from "./Objects/ClientEventBox";
import DirectionalLightHelper from "./DirectionalLightHelper";
import PongClient from "./PongClient";
import { createShieldMaterial } from "./Materials/createShieldMaterial";
import { addGlow, updateInputBlock } from "./Materials/utils";
import { PongEventType } from "yatt-lobbies";


const spinTo = function (camera: BABYLON.ArcRotateCamera, whichprop: string, targetval: number, speed: number) {
	console.log("spinTo", whichprop, targetval, speed);
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	BABYLON.Animation.CreateAndStartAnimation(
		'at4',
		camera,
		whichprop,
		60,
		speed,
		camera[whichprop],
		targetval,
		BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
		ease
	);
}

export default class PongScene {
	private _canvas: HTMLCanvasElement;
	private _engine: BABYLON.Engine;
	private _scene: BABYLON.Scene;
	private _pong: PONG.Pong; // Ref to Pong instance

	public skybox: BABYLON.Mesh;
	public camera: BABYLON.ArcRotateCamera;
	private cameraInertia: number;
	public stadiumLights: BABYLON.DirectionalLight[]; // 4 lights
	// public lightGizmo: BABYLON.LightGizmo;

	// public meshMap: Map<PONG.MapID, Array<AObject>>;
	public meshMap: Map<PONG.MapID, ClientMap>;
	// public shadowGenerator: BABYLON.ShadowGenerator;
	public stadiumShadowGenerator: BABYLON.ShadowGenerator[];

	public ballInstances: Array<ClientBall>;
	private _ballUsed: number;
	public paddleInstance: Map<number, ClientPaddle>;

	public constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine, pong: PONG.Pong, quality: GraphicsQuality) {
		this._canvas = canvas;
		this._engine = engine;
		this._pong = pong;
		this.meshMap = new Map<PONG.MapID, ClientMap>();
		this.ballInstances = [];
		this.paddleInstance = new Map<number, ClientPaddle>();
		this._ballUsed = 0;
		this.cameraInertia = 0;
		this.stadiumShadowGenerator = [];
		this.stadiumLights = [];

		console.log("GRAPHICS");
		const gl = canvas.getContext("webgl2");
		console.log("gl:", gl);
		if (gl) {
			const info = gl.getExtension('WEBGL_debug_renderer_info');
			console.log('Vendor:  ', gl.getParameter(info.UNMASKED_VENDOR_WEBGL));
			console.log('Renderer:', gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
		}

		this._scene = new BABYLON.Scene(this._engine);
		// Optimize for performance
		this._scene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		this._scene.collisionsEnabled = false;
		this._scene.autoClear = false;

		this.camera = new BABYLON.ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, BABYLON.Vector3.Zero(), this._scene);
		this.camera.inputs.clear();
		this.camera.inputs.addMouseWheel();
		this.camera.inputs.addPointers();
		// this.camera.inputs.attached.pointers.buttons = [0, 1];
		this.camera.attachControl(this._canvas, true);
		this.camera.lowerRadiusLimit = 1.5;
		this.camera.upperRadiusLimit = 300;
		this.camera.wheelPrecision = 50;
		this.camera.minZ = 0.1;

		const hdrTexture = new BABYLON.CubeTexture(
			"/assets/images/disco_4k.env",
			this._scene,
			null,
			false,
			null
		);

		// Skybox
		this.skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 500.0, sideOrientation: BABYLON.Mesh.BACKSIDE }, this._scene);
		this.skybox.infiniteDistance = true;

		// Skybox material
		const skyboxMaterial = new BABYLON.PBRMaterial('skyBox', this._scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.disableLighting = true;
		skyboxMaterial.reflectionTexture = hdrTexture.clone();
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.roughness = 0.075;

		this.skybox.material = skyboxMaterial;

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

			// const lightGizmo = new BABYLON.LightGizmo();
			// lightGizmo.light = light;

			// dlh.push(new DirectionalLightHelper(light, lightGizmo));
		}

		// const testLight = new BABYLON.PointLight("testLight", new BABYLON.Vector3(0, 0.5, -3), this._scene);
		// testLight.intensity = 1;
		// testLight.diffuse = new BABYLON.Color3(1, 0, 0);
		// testLight.specular = new BABYLON.Color3(1, 0, 0);
		
		pong.maps.forEach((map: PONG.IPongMap, mapId: PONG.MapID) => {
			const mapObject: Array<AObject> = [];
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
					mapObject.push(clientObject);
				}
				counter++;
			});


			const ratio = 3;
			const gX = map.width;
			const gZ = (map.height + PONG.K.wallThickness);
			const gY = 0.1;
			const faceUVs = [
				new BABYLON.Vector4(0, 0, gX / ratio, gY / ratio), // Rear
				new BABYLON.Vector4(0, 0, gX / ratio, gY / ratio), // Front
				new BABYLON.Vector4(0, 0, gZ / ratio, gY / ratio), // Right
				new BABYLON.Vector4(0, 0, gZ / ratio, gY / ratio), // Left
				new BABYLON.Vector4(0, 0, gX / ratio, gZ / ratio), // Top
				new BABYLON.Vector4(0, 0, gX / ratio, gZ / ratio), // Bottom
			];
			// const ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground" + mapId, { width: gX, height: gZ}, this._scene);
			const ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox(
				"ground" + mapId,
				{
					width: gX,
					height: gY,
					depth: gZ + PONG.K.wallThickness,
					faceUV: faceUVs,
					wrap: true,
				},
				this._scene
			);
			ground.position.y = -0.05;
			const groundMaterial = new BABYLON.PBRMaterial("groundMaterial" + mapId, this._scene);
			groundMaterial.albedoTexture = new BABYLON.Texture("/assets/images/asphalt/asphalt_diff.png", this._scene);
			groundMaterial.bumpTexture = new BABYLON.Texture("/assets/images/asphalt/asphalt_nor_dx.png", this._scene);
			groundMaterial.metallicTexture = new BABYLON.Texture("/assets/images/asphalt/asphalt_arm.png", this._scene);
			groundMaterial.useAmbientOcclusionFromMetallicTextureRed = true;
			groundMaterial.useRoughnessFromMetallicTextureGreen = true;
			groundMaterial.useMetallnessFromMetallicTextureBlue = true;

			ground.material = groundMaterial;
			ground.setEnabled(false);

			const iceLeft: BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("iceLeft" + mapId, { width: map.width / 2, height: map.height }, this._scene);
			const iceRight: BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("iceRight" + mapId, { width: map.width / 2, height: map.height }, this._scene);
			iceLeft.position.x = -map.width / 4;
			iceRight.position.x = map.width / 4;
			iceLeft.position.y = 0.01;
			iceRight.position.y = 0.01;

			const iceMaterial = new BABYLON.PBRMaterial("iceLeftMaterial", this._scene);
			iceMaterial.metallic = 0;
			iceMaterial.roughness = 0.2;
			iceMaterial.albedoColor = BABYLON.Color3.FromHexString("#9deef2");
			// iceMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
			iceMaterial.alpha = 0.2;
			// iceMaterial.subSurface.isTranslucencyEnabled = true;
			iceLeft.material = iceMaterial;
			iceRight.material = iceMaterial.clone("iceRightMaterial");
			iceLeft.receiveShadows = true;
			iceRight.receiveShadows = true;

			iceLeft.setEnabled(false);
			iceRight.setEnabled(false);
			
			this.meshMap.set(mapId, {
				mapId: mapId,
				objects: mapObject,
				ground: ground,
				iceRink: {
					left: iceLeft,
					right: iceRight,
				}
			});
		});

		// // // Test Cube
		// const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 1 }, this._scene);
		// cube.position = new BABYLON.Vector3(0, 3, 0);
		// cube.rotation = new BABYLON.Vector3(1, 2, 3);

		// const pbr = new BABYLON.PBRMaterial("pbr", this._scene);
		// pbr.albedoColor = new BABYLON.BABYLON.Color3(0.7, 0.8, 0.3);
		// pbr.metallic = 0.0;
		// pbr.roughness = 1.0;
		// cube.material = pbr;
		// cube.receiveShadows = true;


		// // // Test Sphere
		// const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
		// sphere.position = new BABYLON.Vector3(0, 1, 0);

		// const pbr = new BABYLON.PBRMaterial("pbr", this._scene);
		// pbr.albedoColor = new BABYLON.Color3(0.7, 0.8, 0.3);
		// pbr.metallic = 0.0;
		// pbr.roughness = 1.0;
		// sphere.material = pbr;
		// sphere.receiveShadows = true;

		// Shadow
		if (quality >= GraphicsQuality.HIGH) {
			this.meshMap.forEach((map: ClientMap, mapID: PONG.MapID) => {
				map.objects.forEach((object: AObject) => {
					this.stadiumShadowGenerator.forEach((shadowGenerator: BABYLON.ShadowGenerator) => {
						shadowGenerator.getShadowMap().renderList.push(object.mesh);
					});
					object.mesh.receiveShadows = true;
				});
				if (map.ground !== null) {
					map.ground.receiveShadows = true;
				}
			});
		}

		// Preload the ball (PONG.K.maxBallAmount)
		for (let i = 0; i < PONG.K.maxBallAmount; i++) {
			const ball = new ClientBall(this._scene, "ball" + i, undefined);
			// ball.disable();
			ball.enable();


			// shadow
			if (quality >= GraphicsQuality.HIGH) {
				this.stadiumShadowGenerator.forEach((shadowGenerator: BABYLON.ShadowGenerator) => {
					shadowGenerator.getShadowMap().renderList.push(ball.mesh);
				});
				ball.mesh.receiveShadows = true;
			}

			// reflection
			if (quality >= GraphicsQuality.HIGH) {
				this.meshMap.forEach((map: ClientMap, mapID: PONG.MapID) => {
					ball.addToProbe(map.objects);
					if (map.ground !== null) {
						ball.addToProbe(map.ground);
					}
				});
				this.ballInstances.forEach((clientBall: ClientBall) => {
					clientBall.addToProbe(ball);
					ball.addToProbe(clientBall.meshes());
				});
				// ball.addToProbe(this.ground);
				ball.addToProbe(this.skybox);
			}

			this.ballInstances.push(ball);
		}

		console.log("All ClientBall instances", this.ballInstances);

		// window.setTimeout(() => {
		// 	this._scene.onAfterRenderObservable.add(() => dlh.forEach((dlh: DirectionalLightHelper) => {
		// 		dlh.buildLightHelper();
		// 	}));
		// }, 500);

		// this._scene.registerBeforeRender(() => {
		// 	// console.log("light shadow", light.shadowMinZ, light.shadowMaxZ);
		// 	if (this.ballInstances.length > 0) {
		// 		testLight.position = this.ballInstances[0].mesh.position;
		// 	}
		// });

		this._scene.materials.forEach((material: BABYLON.Material) => {
			if (material instanceof BABYLON.PBRMaterial) {
				console.log("PBRMaterial", material.name);
				material.maxSimultaneousLights = 8;
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
		const clientBall: ClientBall = this.ballInstances[this._ballUsed];
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

	public updateMeshes(dt:number, ball_interp: number = 1, interpolation: number = 1) {
		this.ballInstances.forEach((ball: ClientBall) => {
			ball.update(dt, ball_interp);
		});
		this.meshMap.get(this._pong.currentMap.mapId)?.objects.forEach((object: AObject) => {
			object.update(dt, interpolation);
		});
		let iceLeft = false;
		let iceRight = false;
		this._pong.activeEvents.forEach((event: PONG.PongEvent) => {
			if (event.type === PongEventType.ICE) {
				const side = event.playerId <= 1 ? PONG.MapSide.LEFT : PONG.MapSide.RIGHT;
				if (side === PONG.MapSide.LEFT) {
					iceLeft = true;
				} else if (side === PONG.MapSide.RIGHT) {
					iceRight = true;
				}
			}
		});
		this.meshMap.get(this._pong.currentMap.mapId)?.iceRink.left.setEnabled(iceLeft);
		this.meshMap.get(this._pong.currentMap.mapId)?.iceRink.right.setEnabled(iceRight);
	}

	public disableMap(mapId: PONG.MapID): void {
		if (mapId === undefined) {
			return;
		}
		this.meshMap.get(mapId)?.objects.forEach((object: AObject) => {
			object.disable();
		});
		if (this.meshMap.get(mapId)?.ground !== null) {
			this.meshMap.get(mapId)?.ground.setEnabled(false);
		}
		this.meshMap.get(mapId)?.iceRink.left.setEnabled(false);
		this.meshMap.get(mapId)?.iceRink.right.setEnabled(false);
	}

	public enableMap(mapId: PONG.MapID): void {
		if (mapId === undefined) {
			return;
		}
		this.meshMap.get(mapId)?.objects.forEach((object: AObject) => {
			object.enable();
		});
		if (this.meshMap.get(mapId)?.ground !== null) {
			this.meshMap.get(mapId)?.ground.setEnabled(true);
		}
	}

	public switchCamera(): void {
		const client: PongClient = this._pong as PongClient;
		if (this._pong.currentMap.mapId === PONG.MapID.FAKE) {
			console.log("Fake map");
			spinTo(this.camera, "beta", Math.PI / 3, 90);
			spinTo(this.camera, "radius", 15, 90);
		} else if (this._pong.currentMap.mapId === PONG.MapID.SMALL) {
			console.log("Small map");
			if (client.player === undefined) {
				spinTo(this.camera, "alpha", -Math.PI / 2, 90);
				spinTo(this.camera, "beta", 0, 90);
			} else if (client.player.playerId <= 1) {
				spinTo(this.camera, "alpha", -Math.PI, 90);
				spinTo(this.camera, "beta", Math.PI / 4, 90);
			} else {
				spinTo(this.camera, "alpha", 0, 90);
				spinTo(this.camera, "beta", Math.PI / 4, 90);
			}
			spinTo(this.camera, "radius", 20, 90);
		} else if (this._pong.currentMap.mapId === PONG.MapID.BIG) {
			console.log("Big map");
			if (client.player === undefined) {
				spinTo(this.camera, "alpha", -Math.PI / 2, 90);
				spinTo(this.camera, "beta", 0, 90);
			} else if (client.player.playerId <= 1) {
				spinTo(this.camera, "alpha", -Math.PI, 90);
				spinTo(this.camera, "beta", Math.PI / 4, 90);
			} else {
				spinTo(this.camera, "alpha", 0, 90);
				spinTo(this.camera, "beta", Math.PI / 4, 90);
			}
			spinTo(this.camera, "radius", 25, 90);
		}
	}

	public updateCamera(dt: number): void {
		if (this._pong.currentMap == undefined) {
			return;
		}
		if (this._pong.currentMap.mapId === PONG.MapID.FAKE) { // Camera rotation
			if (this.cameraInertia < 2) {
				this.cameraInertia += dt;
			}
			const tmp = this.cameraInertia / 6;
			this.camera.alpha += dt * (tmp * tmp);
			if (this.camera.alpha > Math.PI / 2) {
				this.camera.alpha -= Math.PI * 2;
			}
		} else {
			this.cameraInertia = 0;
		}
	}

	public get scene(): BABYLON.Scene {
		return this._scene;
	}

	public dispose(): void {
		this._scene.dispose();
		this._engine.dispose();
		this._canvas.remove();
		this._canvas = null as unknown as HTMLCanvasElement;
		this._engine = null as unknown as BABYLON.Engine;
		this._scene = null as unknown as BABYLON.Scene;
		this._pong = null as unknown as PONG.Pong;
		this.meshMap.clear();
		this.ballInstances.length = 0;
		this.paddleInstance.clear();
		console.log("PongScene disposed");
		this.skybox.dispose();
		this.stadiumLights.forEach((light: BABYLON.DirectionalLight) => {
			light.dispose();
		});
		this.stadiumLights.length = 0;
		this.stadiumShadowGenerator.forEach((shadowGenerator: BABYLON.ShadowGenerator) => {
			shadowGenerator.getShadowMap()?.dispose();
			shadowGenerator.dispose();
		});
		this.stadiumShadowGenerator.length = 0;
	}
}
