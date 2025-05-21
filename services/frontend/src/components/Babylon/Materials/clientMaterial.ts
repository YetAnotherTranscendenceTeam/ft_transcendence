import * as BABYLON from '@babylonjs/core';

export default function createPaddleMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const paddleMaterial = new BABYLON.PBRMaterial(name, scene);
	paddleMaterial.metallic = 0;
	paddleMaterial.roughness = 0.5;
	paddleMaterial.albedoColor = BABYLON.Color3.White();
	return paddleMaterial;
}
