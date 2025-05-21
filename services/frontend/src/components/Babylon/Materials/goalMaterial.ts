import * as BABYLON from '@babylonjs/core';
import { createShieldMaterial } from './createShieldMaterial';
import { updateInputBlock } from './utils';

export default function createGoalMaterial(): BABYLON.NodeMaterial {
	const goalMaterial = createShieldMaterial();

	updateInputBlock(goalMaterial, {
		baseColorStrength: 0.75,
		// bias: 0,
	});

	return goalMaterial;
}
