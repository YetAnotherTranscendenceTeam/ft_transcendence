import * as BABYLON from "@babylonjs/core";

export default function createWallMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const wallMaterial = new BABYLON.PBRMaterial(name, scene);
	wallMaterial.metallic = 0;
	wallMaterial.roughness = 0.5;
	wallMaterial.albedoColor = new BABYLON.Color3(0.25, 0.5, 0.62);
	return wallMaterial;
}
