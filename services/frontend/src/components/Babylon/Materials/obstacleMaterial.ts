import * as BABYLON from '@babylonjs/core';

export default function createObstacleMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const obstacleMaterial = new BABYLON.PBRMaterial(name, scene);
	obstacleMaterial.metallic = 0;
	obstacleMaterial.roughness = 0.5;
	obstacleMaterial.albedoColor = new BABYLON.Color3(0.25, 0.5, 0.62);
	return obstacleMaterial;
}
