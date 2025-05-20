import * as BABYLON from '@babylonjs/core';

export default function createEventBoxMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const material = new BABYLON.PBRMaterial(name, scene);
	material.metallic = 0;
	material.roughness = 0.5;
	material.albedoColor = BABYLON.Color3.White();
	material.alpha = 0.5;
	material.emissiveColor = BABYLON.Color3.White();
	material.emissiveIntensity = 0;
	return material;
};
