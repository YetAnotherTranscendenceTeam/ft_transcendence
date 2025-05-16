import * as BABYLON from "@babylonjs/core";

export const addGlow = function(scene, mesh) {
    const glow = new BABYLON.GlowLayer("glow", scene, { 
        // mainTextureRatio: 1,
        // mainTextureFixedSize: 128, 
        // blurKernelSize: 64,
    });
    glow.intensity = .8;
    glow.referenceMeshToUseItsOwnMaterial(mesh);

    // glow.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
    //     result.set(0, 0, 1, 0.1);
    // }
}

export const updateInputBlock = function(mat, config) {
    const keys = Object.keys(config);

    keys.forEach((key) => {
    const targetBlock = mat.getInputBlockByPredicate(b => b.name === key);
    targetBlock.value = config[key];
    });
}
