import * as BABYLON from '@babylonjs/core';


export default function createBallMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const ballMaterial = new BABYLON.PBRMaterial(name, scene);
	ballMaterial.metallic = 1;
	ballMaterial.roughness = 1;
	ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", scene);
	ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", scene);
	ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", scene);
	ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", scene);
	// ballMaterial.reflectionTexture = hdrTexture;
	// ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
	return ballMaterial;
}
