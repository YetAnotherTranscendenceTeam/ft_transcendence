import "@babylonjs/inspector";
// import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, Color3, Color4, HemisphericLight, DirectionalLight, MeshBuilder, StandardMaterial, Texture, DynamicTexture } from "@babylonjs/core";
// import { FurMaterial } from "@babylonjs/materials";
import * as BABYLON from "@babylonjs/core";
import { CustomMaterial } from "@babylonjs/materials";

// export default function createGroundScene(canvas: HTMLCanvasElement, engine: Engine) : Scene {
// 	const scene: Scene = new Scene(engine);

// 	const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), scene);
// 	const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), scene);
// 	const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), scene);
// 	cameraTopDown.attachControl(canvas, true);
// 	cameraTopDown.lowerRadiusLimit = 1.5;
// 	cameraTopDown.upperRadiusLimit = 10;
// 	cameraTopDown.wheelPrecision = 50;
// 	// const light1: DirectionalLight = new DirectionalLight("light1", new Vector3(1, -1, 0), scene);
// 	var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// 	const ground = MeshBuilder.CreateGround("ground", {width: 4, height: 4}, scene);
// 	ground.position = new Vector3(0, 0, 0);
	
// 	const furMaterial = new FurMaterial("groundMaterial", scene);
// 	furMaterial.highLevelFur = false;
// 	furMaterial.furLength = 1;
// 	furMaterial.furAngle = 0;
// 	furMaterial.diffuseTexture = new Texture("https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor.png", scene);

// 	ground.material = furMaterial;

// 	return scene;
// }



export default function createGroundScene(canvas: HTMLCanvasElement, engine: BABYLON.Engine) : BABYLON.Scene {
	// const scene: Scene = new Scene(engine);

	// const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), scene);
	// const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), scene);
	// const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), scene);
	// cameraTopDown.attachControl(canvas, true);
	// cameraTopDown.lowerRadiusLimit = 1.5;
	// cameraTopDown.upperRadiusLimit = 10;
	// cameraTopDown.wheelPrecision = 50;
	// const light1: DirectionalLight = new DirectionalLight("light1", new Vector3(1, -1, 0), scene);

	// const groundMaterial = new StandardMaterial("groundMaterial", scene);
	// groundMaterial.diffuseColor = new Color3(0, 1, 0);

	// const ground = MeshBuilder.CreateGround("ground", {width: 4, height: 4}, scene);
	// ground.position = new Vector3(0, 0, 0);
	// ground.material = groundMaterial;

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);

	// This creates and positions a free camera (non-mesh)
	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

	// This targets the camera to scene origin
	camera.setTarget(BABYLON.Vector3.Zero());

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.DirectionalLight("light1", (new BABYLON.Vector3(1, -1, 1)).normalize(), scene);
	light.position = light.direction.scale(-50)

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.8;

	const shadowGen = new BABYLON.ShadowGenerator(1024, light, true)

	// Our built-in 'sphere' shape. Params: name, options, scene
	var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
	// Move the sphere upward 1/2 its height        
	sphere.position.y = 1.5;

	shadowGen.addShadowCaster(sphere)

	// const growthMask = new BABYLON.DynamicTexture('growthMap', {width:1024, height:1024}, scene)
	// const maskCtx = growthMask.getContext()
	// var grad = maskCtx.createLinearGradient(0, 512, 1024, 512);  
	// grad.addColorStop(1, 'black')     
	// grad.addColorStop(0, 'white')
	// maskCtx.fillStyle = grad
	// maskCtx.rect(0, 0, 1024, 1024)
	// maskCtx.fill()
	// maskCtx.font = '120px Arial heavy'
	// maskCtx.fillStyle = 'black'
	// maskCtx.strokeStyle = 'white';
	// (maskCtx as any).textAlign = 'center'
	// maskCtx.strokeText('42', 512, 400)
	// maskCtx.fillText('42', 512, 400)       
	// growthMask.update()
	const growthMask = new BABYLON.Texture('/assets/images/gradient.png', scene);

	const paintMask = new BABYLON.DynamicTexture('paintMask', {width:1024, height:1024}, scene)
	const paintCtx= paintMask.getContext()
	paintCtx.font = '120px Arial heavy'
	paintCtx.fillStyle = 'white'
	paintCtx.strokeStyle = 'white';
	(paintCtx as any).textAlign = 'center'
	paintCtx.lineWidth = 6
	paintCtx.strokeText('42', 512, 256)
	paintCtx.fillText('42', 512, 256)
	paintMask.update()
	// const paintMask = new BABYLON.Texture('/assets/images/growth_map.png', scene);

	const patchSize = 10
	const baseGround = BABYLON.MeshBuilder.CreateGround("ground", {width: patchSize, height: patchSize, subdivisions: 3}, scene)
	baseGround.receiveShadows = true

	const listOfBaseColorUrls = [
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_9.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_9.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerBaseColor_9.png`           
	]
	
	const listOfOpacityUrls = [
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_1.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_2.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_3.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_4.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_5.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_6.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_7.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_8.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_9.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_9.png`,
		`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/GrassLayering_LayerOpacity_9.png`      
	]

	const normalTexture = new BABYLON.Texture(`https://raw.githubusercontent.com/Pryme8/Playground_Dump/master/GrassLayers/CutGrassNormal.png`, scene)
	normalTexture.level = 0.2
	const layerMaterials: CustomMaterial[] = []
	const windPower = 0.1
	const windScale = 2
	const grassHeight = 2

	const createLayerMaterial = ()=>{
		const i = layerMaterials.length          
		const checkDone = ()=>{               
			if(baseColorTexture.isReady() && opacityTexture.isReady()){
				const mat = new CustomMaterial(`layerMat_${i}`, scene)
				// mat.bumpTexture = normalTexture                    
				mat.alphaMode = BABYLON.Constants.ALPHA_PREMULTIPLIED
				mat.transparencyMode = 1
				mat.alphaCutOff = 0.01
				mat.diffuseTexture = baseColorTexture              
				mat.opacityTexture = opacityTexture               
				mat.AddUniform('windSpeed', 'vec2', new BABYLON.Vector2(2.5, 1.5))
				mat.AddUniform('windScale', 'float', windScale)
				mat.AddUniform('time', 'float', 0)
				mat.AddUniform('growthMaskScale', 'float', 100)
				mat.AddUniform('growthMask', 'sampler2D', growthMask)
				mat.AddUniform('paintMask', 'sampler2D', paintMask)
				mat.Vertex_Definitions(`
					varying vec2 vWindSpeed;
				`)
				const layerWeight = (i +1 ) / listOfBaseColorUrls.length

				mat.Vertex_After_WorldPosComputed(
					`
					vWindSpeed = vec2(
						sin((windSpeed.x * time) + (worldPos.x * windScale)),
						cos((windSpeed.y * time) + worldPos.z * windScale)
					) * float(${layerWeight * windPower});
					worldPos.xz += vWindSpeed;                           
					`
				)
				console.log('layerWeight', layerWeight)

				mat.Fragment_Definitions(`
					varying vec2 vWindSpeed;
					#define growthMaskScaleHalf growthMaskScale * 0.5
				`)
				mat.Fragment_Before_Fog(`
					vec4 paint = texture(paintMask, ((vPositionW.xz  + growthMaskScaleHalf) / growthMaskScale) + (vWindSpeed * 0.025));
					color.rgb = mix(color.rgb, paint.rgb, float(${layerWeight * layerWeight}) * paint.a);
					color.rgb = mix(color.rgb, color.rgb * 0.5, float(${1.0 - (layerWeight * layerWeight)}) * growthV);
					//color.rgb -= float(${(layerWeight * layerWeight)});
				`)
				mat.Fragment_Custom_Alpha(`       
					float growthV =  texture(growthMask, ((vPositionW.xz  + growthMaskScaleHalf) / growthMaskScale) + (vWindSpeed * 0.025)).r;             
					alpha *= growthV;
					// alpha = (vPositionW.x  + growthMaskScaleHalf) / growthMaskScale;
				`)

				opacityTexture.getAlphaFromRGB = true
				layerMaterials.push(mat)
				if(layerMaterials.length != listOfBaseColorUrls.length){
					createLayerMaterial()
				}else{
					createLayerMeshes()
				}layerMaterials.length
			}
		}

		const baseColorTexture = new BABYLON.Texture(listOfBaseColorUrls[i], scene)   
		const opacityTexture = new BABYLON.Texture(listOfOpacityUrls[i], scene)

		baseColorTexture.onLoadObservable.addOnce(()=>{checkDone()})
		opacityTexture.onLoadObservable.addOnce(()=>{checkDone()})
	}

	const layerMeshes = []

	const createLayerMeshes = ()=>{
		const layerStep = grassHeight / layerMaterials.length
		const i = layerMeshes.length
		const mesh = baseGround.clone(`layerMesh_${i}`, baseGround, true)
		mesh.material = layerMaterials[i]
		mesh.position.y = layerStep * (i + 1)
		layerMeshes.push(mesh)
		if(layerMeshes.length < layerMaterials.length){
			createLayerMeshes()
		}else{
			mergeMeshes()
		}  
	}

	const mergeMeshes = ()=>{
		const mergedMesh: BABYLON.Mesh = BABYLON.Mesh.MergeMeshes(layerMeshes, true, false, undefined, undefined, true)            
		const count = 10
		const step =  patchSize
		const xS = ((count * -0.5) * step) + (step * 0.5)
		const zS = xS
		const matrices = []
		for(let x = 0; x < count; x++){
			for(let z = 0; z < count; z++){
				matrices.push(BABYLON.Matrix.Translation(xS + (x * step), 0, zS + (z * step)))
		
			}                 
		}           

		mergedMesh.thinInstanceAdd(matrices)
		mergedMesh.alwaysSelectAsActiveMesh = true
		mergedMesh.receiveShadows = true

		baseGround.scaling.setAll(10)
		const baseMat = new BABYLON.StandardMaterial('baseMat', scene)
		baseMat.diffuseTexture = new BABYLON.Texture(listOfBaseColorUrls[7], scene)      
		baseGround.material = baseMat   

		startTimeBinding()
	}

	

	let time = 0
	const startTimeBinding = ()=>{            
		scene.onReadyObservable.addOnce(()=>{
			console.log('layerMaterials.length', layerMaterials.length)
			scene.onBeforeRenderObservable.add(()=>{
				time += engine.getDeltaTime() * 0.001                   
				layerMaterials.forEach((mat, index)=>{
					mat.onBindObservable.addOnce(()=>{
						mat.getEffect()?.setFloat('time', time) 
						mat.getEffect()?.setTexture('growthMask', growthMask)
						mat.getEffect()?.setTexture('paintMask', paintMask)   
					})                                        
				})
			})   
		}) 
	}

	createLayerMaterial()

	return scene;
}