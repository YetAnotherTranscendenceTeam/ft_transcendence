import "@babylonjs/inspector";
import { Engine, Scene, Camera, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Color3, Color4 } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import { CellMaterial } from "@babylonjs/materials";
// import { CircleShape, Body } from "physics-engine";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

export default function createGameScene(canvas: HTMLCanvasElement, engine: Engine) : {scene : Scene, sphere: Ball} {
	const scene: Scene = new Scene(engine);

	const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), scene);
	const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), scene);
	const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), scene);
	cameraTopDown.attachControl(canvas, true);
	cameraTopDown.lowerRadiusLimit = 1.5;
	cameraTopDown.upperRadiusLimit = 10;
	cameraTopDown.wheelPrecision = 50;
	// cameraTopDown.mode = Camera.ORTHOGRAPHIC_CAMERA;
	// const width = 3 * 1.5;

	// cameraTopDown.orthoLeft = (-1.2 * width) / 2;
	// cameraTopDown.orthoRight = -cameraTopDown.orthoLeft;
	// const ratio = canvas.height / canvas.width;
	// if (cameraTopDown.orthoLeft && cameraTopDown.orthoRight) {
	// 	cameraTopDown.orthoTop = cameraTopDown.orthoRight * ratio;
	// 	cameraTopDown.orthoBottom = cameraTopDown.orthoLeft * ratio;
	// }


	// const bounceMaterial: PH2D.Material = {
	// 	density: 1,
	// 	restitution: 1,
	// 	staticFriction: 0,
	// 	dynamicFriction: 0
	// };

	// const circle: PH2D.CircleShape = new PH2D.CircleShape(0.1);
	// console.log(circle);

	// const physicalBall: PH2D.Body = new PH2D.Body(
	// 	PH2D.PhysicsType.DYNAMIC,
	// 	circle,
	// 	bounceMaterial,
	// 	Vec2.create(),
	// 	new Vec2(-1, 0),
	// );
	// console.log(physicalBall);

	// const rectangle: PH2D.PolygonShape = new PH2D.PolygonShape(1, 5);
	// console.log(rectangle);

	// const physicalWall: PH2D.Body = new PH2D.Body(
	// 	PH2D.PhysicsType.STATIC,
	// 	rectangle,
	// 	bounceMaterial,
	// 	new Vec2(-5, 0),
	// 	Vec2.create(),
	// );
	// console.log(physicalWall);

	// physicsScene.addBody(physicalBall);
	// // physicsScene.addBody(physicalWall);

	// physicalBall.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
	// 	const { emitter, other, manifold } = event.detail;
	// 	console.log(emitter, other, manifold);
	// });


	// const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

	// const sphere: Ball = new Ball(scene, physicalBall);
	const sphere: Ball = undefined;

	// const wall1: Wall = new Wall(scene, "wall1", new Vector2(0, 1.5), new Vector2(4, 0.1));
	// const wall2: Wall = new Wall(scene, "wall2", new Vector2(0, -1.5), new Vector2(4, 0.1));

	// scene.autoClear = false;
	// scene.clearColor = Color4.FromColor3(Color3.Black());
	return {scene, sphere};
}
