
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { GameMode, GameModeType, IGameMode, IPlayer, IMatchParameters, PongEventType } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientGoal, ClientEventBox, ClientObstacle } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { KeyState, GameScene, KeyName, ScoredEvent, IServerStep, PaddleSync, PaddleSyncs } from "./types";
import * as PONG from "pong";
import AObject from "./Objects/AObject";
import config from "../../config";
import Keyboard from "./Keyboard";

export interface IPongOverlay {
	scores: number[],
	teams: {
		players: PONG.IPongPlayer[],
		name: string,
	}[],
	localPlayer: PONG.IPongPlayer,
	time: number,
	countDown: number,
	lastWinner: number,
	gameStatus: PONG.PongState,
	local: boolean,
	gamemode: GameMode,
	pointsToWin: number,
	activeEvents: {
		type: PongEventType,
		time: number,
		isGlobal: boolean,
		playerId?: number,
	}[],
	goals: {
		[key: number]: {
			health: number
		}
	}
}

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket?: WebSocket;
	private _engine: Engine;
	private _keyboard: Keyboard;
	private _babylonScene: Scene;
	private _gameScene: GameScene;

	private _skybox: Mesh;
	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _meshMap: Map<PONG.MapID, Array<AObject>>;

	private _ballSteps: Array<IServerStep>;
	private _paddleSteps: Array<PaddleSyncs>;

	private _ballInstances: Array<ClientBall>;
	private _paddleInstance: Map<number, ClientPaddle>;

	private _time: number;
	private _interpolation: number;

	private _player: PONG.IPongPlayer;

	// public scoreUpdateCallback: (score: ScoredEvent) => void;
	public callbacks: {
		onConnectionError?: (this: WebSocket, error: CloseEvent) => void,
		updateOverlay: (params: IPongOverlay) => void,
	};

	public constructor(callbacks: {
		onConnectionError?: (this: WebSocket, error: CloseEvent) => void,
		updateOverlay: (params: IPongOverlay) => void,
	}) {
		super();
		this.callbacks = callbacks;
		this._time = 0;
		this._interpolation = 0;
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._meshMap = new Map<PONG.MapID, Array<AObject>>();
		this._keyboard = new Keyboard();

		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		
		this._babylonScene = new Scene(this._engine);
		// Optimize for performance
		this._babylonScene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		// this._babylonScene.collisionsEnabled = false;
		// this._babylonScene.autoClear = true;
		// this._babylonScene.autoClearDepthAndStencil = false;
		
		this.sceneSetup();
		
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("resize", this.resize);
		
		this._ballSteps = [];
		this._paddleSteps = [];
		this._engine.runRenderLoop(this.loop);

		this._state = PONG.PongState.RESERVED.clone();
		
		//this.setGameScene(GameScene.ONLINE);
	}

	private updateOverlay() {
		this.callbacks.updateOverlay(this.generateOverlay());
	}

	private generateOverlay(): IPongOverlay {
		const teams = this._teamNames.map((team: string, team_index: number) => {
			let players = this._players.filter((player: PONG.IPongPlayer, player_index: number) => Math.floor(player_index / this._gameMode.team_size) === team_index);
			if (team_index === 1)
				players.reverse();
			return {
				name: team,
				players,
			}
		});
		return {
			gamemode: this._gameMode,
			local: this._gameScene !== GameScene.ONLINE,
			scores: this._stats ? this._stats.score : [0, 0],
			teams,
			localPlayer: this._player,
			time: this._tick * PONG.K.DT,
			countDown: this._state.frozen_until,
			lastWinner: (this._state.name === "FREEZE" && this._stats) ? this._stats.lastSideToScore : null,
			gameStatus: this._state,
			pointsToWin: this._matchParameters.point_to_win,
			activeEvents: this._activeEvents?.filter((event: PONG.PongEvent) => (!this._player || event.playerId === this._player.playerId || event.isGlobal())).map((event: PONG.PongEvent) => {
				return {
					type: event.type,
					time: event.time,
					isGlobal: event.isGlobal(),
					playerId: event.playerId,
				}
			}) ?? [],
			goals: {
				[PONG.MapSide.LEFT]: {
					health: this._goals.get(PONG.MapSide.LEFT)?.health ?? 0,
				},
				[PONG.MapSide.RIGHT]: {
					health: this._goals.get(PONG.MapSide.RIGHT)?.health ?? 0,
				}
			}
		}
	}

	public setGameScene(scene: GameScene) {
		if (this._gameScene === scene) {
			return;
		}
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.dispose();
		});
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		// disable active map
		if (this._currentMap) {
			this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
				map.disable();
			});
		}
		this._gameScene = scene;
		if (this._gameScene === GameScene.MENU) {
			this.menuScene();
		} else if (this._gameScene === GameScene.LOCAL) {
			this.localScene();
		}
		if (this._gameScene !== GameScene.ONLINE && this._websocket) {
			this._websocket.onclose = undefined;
			this._websocket.close();
			this._websocket = undefined;
		}
	}

	public startGame() {
		this._state = PONG.PongState.FREEZE.clone();
		this.start();
		this._time = 0;
		this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.57, 0.67, 0.41));
	}

	public restartGame() {
		this._state = PONG.PongState.FREEZE.clone();
		this._stats = new PONG.Stats(0, PONG.K.defaultPointsToWin);
		this.start();
		this._time = 0;
	}

	public connect(match_id: number) {
		if (this._websocket) {
			this._websocket.onclose = undefined;
			this._websocket.close();
		}
		this._websocket = new WebSocket(`${config.WS_URL}/pong/join?match_id=${match_id}&access_token=${localStorage.getItem("access_token")}`);
		
		this._websocket.onmessage = (ev) => { // step, state, sync
			const msg = JSON.parse(ev.data);
			if (msg.event === "step") {
				// this.counter = msg.data.counter;
				const serverStep = msg.data as IServerStep;
				if (this._state.isFrozen())  {
					this.ballSync(serverStep.balls, this._tick - serverStep.tick, 0);
					this._tick = serverStep.tick;
					this.paddleSync(serverStep.paddles);
					return ;
				}
				this._ballSteps.push(serverStep);
				this._paddleSteps.push(serverStep.paddles);
				this.eventBoxSync(msg.data.event_boxes as PONG.IEventBoxSync[]);
				this.eventSync(msg.data.activeEvents as PONG.IEventSync[]);
			}
			else if (msg.event === "sync") {
				console.log("sync", msg.data);
				this._tick = msg.data.tick;
				this.setGameScene(GameScene.ONLINE);
				this.onlineScene(msg.data.match.match_id as number, 
					new GameMode(msg.data.match.gamemode as IGameMode),
					msg.data.match.players as IPlayer[],
					msg.data.match.matchParameters as IMatchParameters,
					PONG.PongState[msg.data.match.state.name].clone()
				);
				this._teamNames = msg.data.match.team_names as string[];
				this._stats.score = msg.data.match.score as number[];
				this._tick = msg.data.match.tick as number;
				this._stats.lastSideToScore = msg.data.match.lastSide as number;
				this.ballSync(msg.data.match.balls as PONG.IBall[], 0, 0);
				this._player = this._players.find((player: PONG.IPongPlayer) => player.account_id === msg.data.player.account_id) as PONG.IPongPlayer;
				this.eventBoxSync(msg.data.match.event_boxes as PONG.IEventBoxSync[]);
				this.eventSync(msg.data.match.activeEvents as PONG.IEventSync[]);
				console.log("matchPrams", this._matchParameters);
				this.updateOverlay();
			}
			else if (msg.event === "state") {
				const state = PONG.PongState[msg.data.state.name].clone();
				const oldState = this._state;
				this._state = state;
				Object.assign(this._state, msg.data.state);
				if (msg.data.state.score && msg.data.state.score.length > 0) {
					this._stats.score = msg.data.state.score;
					this._stats.lastSideToScore = msg.data.state.side;
				}
				this._ballSteps = [];
				for (let i = 0; i < this._balls.length; i++) {
					this._balls[i].previousPosition = Vec2.clone(this._balls[i].position);
				}
				if (this._state.name !== oldState.name
					|| (this._state.frozen_until !== oldState.frozen_until
						&& Math.floor(this._state.frozen_until) !== Math.floor(oldState.frozen_until)
					)
				) {
					this.updateOverlay();
				}
			}
		}
		this._websocket.onopen = (ev) => {
			console.log(ev);
		}
		this._websocket.onclose = this.callbacks.onConnectionError;
	}

	public nextRound() {
		this.setState(PONG.PongState.FREEZE.clone());
	}

	public pauseGame() {
		this._state = PONG.PongState.PAUSED.clone();
		this.updateOverlay();
	}

	public resumeGame() {
		this.setState(PONG.PongState.FREEZE.clone());
	}

	private sceneSetup() {
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, Vector3.Zero(), this._babylonScene);
		camera.inputs.clear();
		camera.inputs.addMouseWheel();
		camera.inputs.addPointers();
		// camera.inputs.attached.pointers.buttons = [0, 1];
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 300;
		camera.wheelPrecision = 50;

		const hdrTexture = new BABYLON.CubeTexture(
			"/assets/images/disco_4k.env",
			this._babylonScene,
			null,
			false,
			null
		);

		// Environment texture
		this._babylonScene.environmentTexture = hdrTexture;


		// Skybox
		this._skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 500.0, sideOrientation: BABYLON.Mesh.BACKSIDE }, this._babylonScene);
		// this._skybox.infiniteDistance = true;
		// this._skybox.position.y = 0;
		this._skybox.receiveShadows = true;

		// Skybox material
		// const skyboxMaterial = new BABYLON.PBRMaterial('skyBox', this._babylonScene);
		// skyboxMaterial.backFaceCulling = false;
		// skyboxMaterial.disableLighting = true;
		// skyboxMaterial.disableLighting = true;
		// skyboxMaterial.reflectionTexture = hdrTexture.clone();
		// skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		// skyboxMaterial.roughness = 0.075;

		// Skydome material
		const skydomeMaterial = new BABYLON.BackgroundMaterial('skydome', this._babylonScene);
		skydomeMaterial.enableGroundProjection = true;
		skydomeMaterial.projectedGroundRadius = 50;
		skydomeMaterial.projectedGroundHeight = 15;
		skydomeMaterial.reflectionTexture = hdrTexture.clone();
		// skydomeMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		// skydomeMaterial.roughness = 0.075;

		this._skybox.material = skydomeMaterial;
		
		const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);
		light.intensity = 0.7;
		light.diffuse = new Color3(1, 1, 1);
		light.specular = new Color3(1, 1, 1);


		const ballMaterial = new BABYLON.PBRMaterial("ballMaterial", this._babylonScene);
		ballMaterial.metallic = 1;
		ballMaterial.roughness = 1;
		ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", this._babylonScene);
		ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", this._babylonScene);
		ballMaterial.reflectionTexture = hdrTexture;
		ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
		ClientBall.template = ballMaterial;

		const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this._babylonScene);
		wallMaterial.metallic = 0;
		wallMaterial.roughness = 0.5;
		wallMaterial.albedoColor = new Color3(0.25, 0.5, 0.62);
		ClientWall.template = wallMaterial;

		const obstacleMaterial = new BABYLON.PBRMaterial("obstacleMaterial", this._babylonScene);
		obstacleMaterial.metallic = 0;
		obstacleMaterial.roughness = 0.5;
		obstacleMaterial.albedoColor = new Color3(0.25, 0.5, 0.62);
		obstacleMaterial.alpha = 0.5;
		ClientObstacle.template = obstacleMaterial;

		const paddleMaterial = new BABYLON.PBRMaterial("paddleMaterial", this._babylonScene);
		paddleMaterial.metallic = 0;
		paddleMaterial.roughness = 0.5;
		paddleMaterial.albedoColor = Color3.White();
		ClientPaddle.template = paddleMaterial;

		const goalMaterial = new BABYLON.PBRMaterial("goalMaterial", this._babylonScene);
		goalMaterial.metallic = 0;
		goalMaterial.roughness = 0.5;
		goalMaterial.albedoColor = Color3.Red();
		goalMaterial.alpha = 0.5;
		ClientGoal.template = goalMaterial;

		const eventBoxMaterial = new BABYLON.PBRMaterial("eventBoxMaterial", this._babylonScene);
		eventBoxMaterial.metallic = 0;
		eventBoxMaterial.roughness = 0.5;
		eventBoxMaterial.albedoColor = Color3.Green();
		eventBoxMaterial.alpha = 0.5;
		ClientEventBox.template = eventBoxMaterial;
		
		PONG.Pong._map.forEach((map: PONG.IPongMap, mapId: PONG.MapID) => {
			const mapMesh: Array<AObject> = [];
			let counter: number = 0;

			const objects: PH2D.Body[] = map.getObjects();
			objects.forEach((object: PH2D.Body) => {
				let clientObject: AObject | undefined;
				if (object instanceof PONG.Wall) {
					clientObject = new ClientWall(this._babylonScene, ("wall" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Goal) {
					clientObject = new ClientGoal(this._babylonScene, ("goal" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Paddle) {
					clientObject = new ClientPaddle(this._babylonScene, ("paddle" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.Obstacle) {
					clientObject = new ClientObstacle(this._babylonScene, ("obstacle" + map.mapId.toString() + counter.toPrecision(2)), object);
				} else if (object instanceof PONG.EventBox) {
					clientObject = new ClientEventBox(this._babylonScene, ("eventbox" + map.mapId.toString() + counter.toPrecision(2)), object);
				}
				if (clientObject !== undefined) {
					clientObject.disable();
					mapMesh.push(clientObject);
				}
				counter++;
			});
			
			this._meshMap.set(mapId, mapMesh);
		});

		// // for each map, add every object to every other object probe
		// this._meshMap.forEach((map: Array<AObject>) => {
		// 	map.forEach((object: AObject) => {
		// 		map.forEach((otherObject: AObject) => {
		// 			if (object !== otherObject) {
		// 				console.log("adding to probe: " + object.mesh.name + " -> " + otherObject.mesh.name);
		// 				object.addToProbe(otherObject);
		// 			}
		// 		});
		// 		// add skybox to probe
		// 		object.addToProbe(this._skybox);
		// 	});
		// });
	}

	public cleanUp(): void {
		super.cleanUp();
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.dispose();
		});
		this._ballInstances = [];
		// this.updateOverlay();
	}
	
	protected switchMap(mapId: PONG.MapID) {
		super.switchMap(mapId);
		const objects: PH2D.Body[] = this._currentMap.getObjects();
		this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject, index: number) => {
			object.updateBodyReference(objects[index]);
			object.enable();
			if (object instanceof ClientEventBox) {
				object.disable();
			}
			if (object instanceof ClientObstacle && !this._matchParameters.obstacles) {
				object.disable();
			}
		});
		
	}

	private menuScene() {
		this.menuSetup();

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});

		this.loadBalls();
		this.bindPaddles();
		this.updateMeshes();
	}
	
	private localScene() {
		this.localSetup();

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});
		
		this.loadBalls();
		this.bindPaddles();
		this.updateMeshes();
		this.updateOverlay();
	}
	
	private onlineScene(match_id: number, gamemode: GameMode, players: IPlayer[], matchParameters: IMatchParameters, state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, matchParameters, state);

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});
	
		this.loadBalls();
		this.bindPaddles();
		this._physicsScene.removeBody(this._ballInstances[0].physicsBody);
		this.updateMeshes();
	}	
	
	private loadBalls() {
		this._balls.forEach((ball: PH2D.Body) => {
			const ballInstance: ClientBall = new ClientBall(this._babylonScene, ball);
			this._ballInstances.push(ballInstance);
			// add ball to all objects probe and objects to ball probe
			this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject) => {
				// object.addToProbe(ballInstance);
				ballInstance.addToProbe(object);
			}
			);
		});
		// add ball to all balls probe
		this._ballInstances.forEach((ball: ClientBall) => {
			this._ballInstances.forEach((otherBall: ClientBall) => {
				if (ball !== otherBall) {
					ball.addToProbe(otherBall);
				}
			});
			// add skybox to probe
			ball.addToProbe(this._skybox);
		}
		);
	}
	
	private bindPaddles() {
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: ClientPaddle | undefined = this._meshMap.get(this._currentMap.mapId)?.find((object: AObject) => {
				if (object instanceof ClientPaddle) {
					return object.physicsBody === paddle;
				}
				return false;
			}
			) as ClientPaddle;
			if (paddleInstance) {
				this._paddleInstance.set(playerId, paddleInstance);
				paddleInstance.update(1);
			}
		});
	}

	private loop = () => {
		this._keyboard.update();
		if (this._gameScene) {
			if (this._gameScene === GameScene.ONLINE) {
				this.updateOnline();
			} else {
				this.updateLocal();
			}
		}
		// this.update();
		this._babylonScene.render();
	}

	private resize = () => {
		this._engine.resize();
	}

	setState(state: PONG.PongState) {
		if (this._state.endCallback) {
			this._state.endCallback(this, state);
		}
		this._state = state;
		if (!this._state.isFrozen())
			this.updateOverlay();
	}

	private updateLocal() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		const oldFreeze = this._state.frozen_until;
		if (this._state.tick(dt, this)) {
			if (this._state.frozen_until != -1 && Math.floor(this._state.frozen_until) !== Math.floor(oldFreeze))
				this.updateOverlay();
			return;
		}

		if (this._state.getNext()) {
			const next = this._state.getNext().clone();
			this.setState(next);
			if (this._state.tick(0, this)) {
				return;
			}
		}

		this._time += dt;
		const oldTick = this._tick;
		this.playerUpdateLocal();
		dt = this.physicsUpdate(dt);
		this.updateMeshes(dt, dt);
		if (this.scoreUpdate()) {
			console.log("score: " + this._stats.score[0] + "-" + this._stats.score[1]);
			if (this._stats.winner !== undefined) {
				this.setState(PONG.PongState.ENDED.clone());
				this.updateOverlay();
			} else {
				this.setState(PONG.PongState.FREEZE.clone());
			}
			return ;
		}
		if (this._tick % PONG.K.TICK_PER_SECOND === 0 && this._tick !== oldTick) {
			this.updateOverlay();
		}
	}

	private updateOnline() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		let ball_interp = dt / PONG.K.DT;
		let interpolation = 1;

		if (!this._state.isFrozen()) {
			const oldTick = this._tick;
			this.playerUpdateOnline();
			interpolation = this.physicsUpdate(dt);
			for (let i = 0; i < this._balls.length; i++) {
				this._balls[i].previousPosition = this._balls[i].interpolatePosition(ball_interp);
			}
			let lastStep: IServerStep | undefined;
			while (this._ballSteps.length > 0
				&& this._tick > oldTick
				&& this._ballSteps[0].tick <= this._tick) {
				const step = this._ballSteps.at(0);
				this.serverStep(step, interpolation, step.collisions > 0);
				this._ballSteps = this._ballSteps.slice(1);
				lastStep = step;
			}
			this._tick = lastStep ? lastStep.tick : this._tick; 
			for (let paddleStep of this._paddleSteps) {
				this.paddleSync(paddleStep);
			}
			this._paddleSteps = [];
			if (this._tick % PONG.K.TICK_PER_SECOND === 0 && this._tick !== oldTick) {
				this.updateOverlay();
			}
		}
		else {
			interpolation = 1;
			ball_interp = 1;
		}

		this.updateMeshes(ball_interp, interpolation);
	}

	private updateMeshes(ball_interp: number = 1, interpolation: number = 1) {
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.update(ball_interp);
		});
		this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject) => {
			object.update(interpolation);
		});
	}

	private serverStep(data: IServerStep, dt: number, forced: boolean = false) {
		this.ballSync(data.balls, this._tick - data.tick, dt);
	}

	private paddleSync(paddles: PaddleSyncs) {
		for (let paddlesync of Object.values(paddles)) {
			const paddle = this._paddleInstance.get(paddlesync.id);
			paddle.sync(paddlesync);
		}
	}

	private eventBoxSync(eventBoxes: PONG.IEventBoxSync[]) {
		for (let i = 0; i < eventBoxes.length; i++) {
			const eventBoxSync = eventBoxes[i];
			const eventBox = this._currentMap.eventboxes[i];
			eventBox.sync(eventBoxSync);
		}
	}

	private eventSync(eventSyncs: PONG.IEventSync[]) {
		for (let i = this._activeEvents.length - 1; i >= 0; i--) {
			const event = this._activeEvents[i];
			if (!eventSyncs.some((eventSync: PONG.IEventSync) => eventSync.id === event.id)) {
				if (event.activationSide === PONG.PongEventActivationSide.BOTH) {
					event.deactivate(this);
				}
				else
					this._activeEvents.splice(i, 1);
			}
		}
		for (let i = 0; i < eventSyncs.length; i++) {
			const eventSync = eventSyncs[i];
			let event = this._activeEvents.find((event: PONG.PongEvent) => event.id === eventSync.id);
			if (!event) {
				event = PONG.EventBox.pongEvents[eventSync.type].clone();
				if (event.activationSide === PONG.PongEventActivationSide.BOTH)
					event.activate(this, eventSync.playerId);
			}
			event.sync(eventSync);
		}
	}

	public addBall(ball: PONG.Ball) {
		if (this._gameScene !== GameScene.ONLINE) {
			this._physicsScene.addBody(ball);
			ball.addEventListener("collision", PONG.ballCollision.bind(this));
		}
		this._balls.push(ball);
		const ballInstance: ClientBall = new ClientBall(this._babylonScene, ball);
		this._ballInstances.push(ballInstance);
	}

	public removeBall(ball: PONG.Ball) {
		super.removeBall(ball);
		const ballInstance: ClientBall | undefined = this._ballInstances.find((b: ClientBall) => b.physicsBody === ball);
		if (ballInstance) {
			ballInstance.dispose();
			this._ballInstances = this._ballInstances.filter((b: ClientBall) => b !== ballInstance);
		}
	}

	private playerUpdateLocal() {
		let paddle: ClientPaddle | undefined = this._paddleInstance.get(PONG.PlayerID.RIGHT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.ArrowUp)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.ArrowDown)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}

		paddle = this._paddleInstance.get(PONG.PlayerID.LEFT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.W)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.S)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}
	}

	private playerUpdateOnline() {

		const paddle: ClientPaddle | undefined = this._paddleInstance.get(this._player.playerId);
		if (paddle) {
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.ArrowUp)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.ArrowDown)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
			if (moveDirection !== this._player.movement) {
				this._websocket.send(JSON.stringify({
					event: "movement",
					data: {
						tick: this._tick,
						movement: moveDirection,
					}
				}))
			}
			this._player.movement = moveDirection;
		}
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		// Shift+Ctrl+Alt+I
		// if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
		// 	if (this._babylonScene.debugLayer.isVisible()) {
		// 		this._babylonScene.debugLayer.hide();
		// 	} else {
		// 		this._babylonScene.debugLayer.show();
		// 	}
		// }

		this._keyboard.keyDown(ev.key);
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		this._keyboard.keyUp(ev.key);
	}

	public destroy() {
		// this._babylonScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("keyup", this.handleKeyUp);
		window.removeEventListener("resize", this.resize);
		this._websocket.close();
		this._websocket = undefined as unknown as WebSocket;
	}

	get player() {
		return this._player;
	}

	public override isServer(): boolean {
		return this._websocket === undefined;
	}
}