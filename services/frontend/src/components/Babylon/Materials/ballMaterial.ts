import * as BABYLON from '@babylonjs/core';


export default function createBallMaterial(name: string, scene: BABYLON.Scene): BABYLON.PBRMaterial {
	const ballMaterial = new BABYLON.PBRMaterial(name, scene);
	ballMaterial.metallic = 1;
	ballMaterial.roughness = 1;
	ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_albedo.png", scene);
	ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", scene);
	ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", scene);
	ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", scene);
	// ballMaterial.reflectionTexture = hdrTexture;
	// ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
	return ballMaterial;
}

export function createDamageMaterial(name: string, scene: BABYLON.Scene): BABYLON.NodeMaterial {

	var nodeMaterial = new BABYLON.NodeMaterial("node");
	nodeMaterial.mode = BABYLON.NodeMaterialModes.Material;

	// InputBlock
	var position = new BABYLON.InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

	// CustomBlock
	var WaveNoise = new BABYLON.CustomBlock("WaveNoise");
	WaveNoise.visibleInInspector = false;
	WaveNoise.visibleOnFrame = false;
	WaveNoise.target = 4;
	WaveNoise.options = {"name":"WaveNoise","comments":"Create a type of wave noise","target":"Neutral","inParameters":[{"name":"p","type":"Vector3"},{"name":"t","type":"Float"}],"outParameters":[{"name":"output","type":"Vector3"}],"functionName":"waveNoise","code":["uint hash(uint x)","{","    x = ((x >> 16u) ^ x) * 0x45d9f3bu;","    x = ((x >> 16u) ^ x) * 0x45d9f3bu;","    x = (x >> 16u) ^ x;","    return x;","}","uint combine(uint v, uint seed)","{","    return seed ^ (v + 0x9e3779b9u + (seed << 6) + (seed >> 2));","}","float uniformFloat(uint h)","{","    return uintBitsToFloat(h & 0x007FFFFFu | 0x3F800000u) - 1.0;","}","vec3 normal(vec3 p, uint seed)","{","    uvec3 u = floatBitsToUint(p);","    seed = combine(hash(u.x), seed);","    seed = combine(hash(u.y), seed);","    seed = combine(hash(u.z), seed);","    float a = uniformFloat(seed);","    seed = combine(0x6d04955du, seed);","    float z = uniformFloat(seed) * 2.0 - 1.0;","    float s = sqrt(1.0 - z * z);","    return vec3(s * cos(a * 6.2831853 + vec2(0.0, -1.570796)), z);","}","vec3 ss(vec3 x)","{","    return x * x * (3.0 - 2.0 * x);","}","float gnoise(vec3 p, uint seed)","{","    vec3 i = floor(p);","    vec3 f = fract(p);","    vec3 a = ss(f);","    float n000 = dot(normal(i, seed), f);","    float n100 = dot(normal(i + vec3(1.0, 0.0, 0.0), seed), f - vec3(1.0, 0.0, 0.0));","    float n010 = dot(normal(i + vec3(0.0, 1.0, 0.0), seed), f - vec3(0.0, 1.0, 0.0));","    float n110 = dot(normal(i + vec3(1.0, 1.0, 0.0), seed), f - vec3(1.0, 1.0, 0.0));","    float n001 = dot(normal(i + vec3(0.0, 0.0, 1.0), seed), f - vec3(0.0, 0.0, 1.0));","    float n101 = dot(normal(i + vec3(1.0, 0.0, 1.0), seed), f - vec3(1.0, 0.0, 1.0));","    float n011 = dot(normal(i + vec3(0.0, 1.0, 1.0), seed), f - vec3(0.0, 1.0, 1.0));","    float n111 = dot(normal(i + vec3(1.0, 1.0, 1.0), seed), f - vec3(1.0, 1.0, 1.0));","    return mix(","        mix(mix(n000, n100, a.x), mix(n010, n110, a.x), a.y),","        mix(mix(n001, n101, a.x), mix(n011, n111, a.x), a.y), a.z);","}","vec3 gnoise3(vec3 p, uvec3 seed)","{","    return vec3(gnoise(p, seed.x), gnoise(p, seed.y), gnoise(p, seed.z));","}","vec3 n(vec3 p, uvec3 seed)","{ ","    return max(1.0 - abs(gnoise3(p, seed) * 1.5), vec3(0.0));","}","vec3 q(vec3 v)","{","    return pow(v, vec3(1.0, 1.0, 3.5));","}","vec3 r(vec3 n)","{","    return pow(n, vec3(6.0, 9.0, 9.0));","}","void waveNoise(vec3 p, float t, out vec3 result)","{","    vec3 n0 = n(p * 1.0 + t, uvec3(0xa7886e74u, 0x4433f369u, 0x5842edddu));","    vec3 n1 = n(p * 2.0 + t, uvec3(0x41a2b27au, 0x14dede03u, 0x509a02aau));","    vec3 n2 = n(p * 4.0 + t, uvec3(0xd5bf21b3u, 0x1d6adb70u, 0xc47ed64cu));","    vec3 n3 = n(p * 8.0 + t, uvec3(0x7279fef1u, 0x120a704eu, 0x845b7178u));","    vec3 n4 = n(p * 16.0 + t, uvec3(0xace62131u, 0x7e861b25u, 0x9f51d60cu));","    result = (","        n1 * r(n0) * 0.25 +","        q(n0) * r(n1) * vec3(0.25, 0.25, 0.5) +","        q(n0 * n1) * r(n2) * vec3(0.125, 0.125, 0.5) +","        q(n0 * n1 * n2) * r(n3) * vec3(0.0625, 0.0625, 0.5) +","        q(n0 * n1 * n2 * n3) * r(n4) * vec3(0.03125, 0.03125, 0.5)","    ) * 0.5;","}"]};

	// MultiplyBlock
	var Multiply = new BABYLON.MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

	// InputBlock
	var Time = new BABYLON.InputBlock("Time");
	Time.visibleInInspector = false;
	Time.visibleOnFrame = false;
	Time.target = 1;
	Time.value = 0;
	Time.min = 0;
	Time.max = 0;
	Time.isBoolean = false;
	Time.matrixMode = 0;
	Time.animationType = BABYLON.AnimatedInputBlockTypes.Time;
	Time.isConstant = false;

	// InputBlock
	var speed = new BABYLON.InputBlock("speed");
	speed.visibleInInspector = false;
	speed.visibleOnFrame = false;
	speed.target = 1;
	speed.value = 1;
	speed.min = 0;
	speed.max = 10;
	speed.isBoolean = false;
	speed.matrixMode = 0;
	speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
	speed.isConstant = false;

	// VectorSplitterBlock
	var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// AddBlock
	var Add = new BABYLON.AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

	// InputBlock
	var treshold = new BABYLON.InputBlock("treshold");
	treshold.visibleInInspector = false;
	treshold.visibleOnFrame = false;
	treshold.target = 1;
	treshold.value = 0;
	treshold.min = -0.2;
	treshold.max = 0.1;
	treshold.isBoolean = false;
	treshold.matrixMode = 0;
	treshold.animationType = BABYLON.AnimatedInputBlockTypes.None;
	treshold.isConstant = false;

	// MultiplyBlock
	var Multiply1 = new BABYLON.MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// InputBlock
	var endMultiplier = new BABYLON.InputBlock("endMultiplier");
	endMultiplier.visibleInInspector = false;
	endMultiplier.visibleOnFrame = false;
	endMultiplier.target = 1;
	endMultiplier.value = 10;
	endMultiplier.min = 0;
	endMultiplier.max = 50;
	endMultiplier.isBoolean = false;
	endMultiplier.matrixMode = 0;
	endMultiplier.animationType = BABYLON.AnimatedInputBlockTypes.None;
	endMultiplier.isConstant = false;

	// FragmentOutputBlock
	var FragmentOutput = new BABYLON.FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// MultiplyBlock
	var Multiply2 = new BABYLON.MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

	// PowBlock
	var Pow = new BABYLON.PowBlock("Pow");
	Pow.visibleInInspector = false;
	Pow.visibleOnFrame = false;
	Pow.target = 4;

	// GradientBlock
	var Gradient = new BABYLON.GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = [];
	Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.9803921568627451, 0.6431372549019608, 0)));
	Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.34, new BABYLON.Color3(0.7411764705882353, 0.09803921568627451, 0)));

	// MultiplyBlock
	var Multiply3 = new BABYLON.MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

	// InputBlock
	var gradientControl = new BABYLON.InputBlock("gradientControl");
	gradientControl.visibleInInspector = false;
	gradientControl.visibleOnFrame = false;
	gradientControl.target = 1;
	gradientControl.value = 1;
	gradientControl.min = -5;
	gradientControl.max = 5;
	gradientControl.isBoolean = false;
	gradientControl.matrixMode = 0;
	gradientControl.animationType = BABYLON.AnimatedInputBlockTypes.None;
	gradientControl.isConstant = false;

	// ScaleBlock
	var Scale = new BABYLON.ScaleBlock("Scale");
	Scale.visibleInInspector = false;
	Scale.visibleOnFrame = false;
	Scale.target = 4;

	// InputBlock
	var emisiveStrength = new BABYLON.InputBlock("emisiveStrength");
	emisiveStrength.visibleInInspector = true;
	emisiveStrength.visibleOnFrame = false;
	emisiveStrength.target = 1;
	emisiveStrength.value = 1;
	emisiveStrength.min = 0;
	emisiveStrength.max = 0;
	emisiveStrength.isBoolean = false;
	emisiveStrength.matrixMode = 0;
	emisiveStrength.animationType = BABYLON.AnimatedInputBlockTypes.None;
	emisiveStrength.isConstant = false;

	// LerpBlock
	var Lerp = new BABYLON.LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

	// InputBlock
	var glowColor = new BABYLON.InputBlock("glowColor");
	glowColor.visibleInInspector = false;
	glowColor.visibleOnFrame = false;
	glowColor.target = 1;
	glowColor.value = new BABYLON.Color3(1, 1, 1);
	glowColor.isConstant = true;

	// StepBlock
	var Step = new BABYLON.StepBlock("Step");
	Step.visibleInInspector = false;
	Step.visibleOnFrame = false;
	Step.target = 4;

	// OneMinusBlock
	var Oneminus = new BABYLON.OneMinusBlock("One minus");
	Oneminus.visibleInInspector = false;
	Oneminus.visibleOnFrame = false;
	Oneminus.target = 4;

	// InputBlock
	var glowMask = new BABYLON.InputBlock("glowMask");
	glowMask.visibleInInspector = true;
	glowMask.visibleOnFrame = false;
	glowMask.target = 1;
	glowMask.value = 0;
	glowMask.min = 0;
	glowMask.max = 0;
	glowMask.isBoolean = false;
	glowMask.matrixMode = 0;
	glowMask.animationType = BABYLON.AnimatedInputBlockTypes.None;
	glowMask.isConstant = false;

	// InputBlock
	var Float = new BABYLON.InputBlock("Float");
	Float.visibleInInspector = false;
	Float.visibleOnFrame = false;
	Float.target = 1;
	Float.value = 1;
	Float.min = 0;
	Float.max = 0;
	Float.isBoolean = false;
	Float.matrixMode = 0;
	Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
	Float.isConstant = true;

	// VectorMergerBlock
	var VectorMerger = new BABYLON.VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

	// InputBlock
	var baseColorStrength = new BABYLON.InputBlock("baseColorStrength");
	baseColorStrength.visibleInInspector = false;
	baseColorStrength.visibleOnFrame = false;
	baseColorStrength.target = 1;
	baseColorStrength.value = 0.54;
	baseColorStrength.min = 0;
	baseColorStrength.max = 1;
	baseColorStrength.isBoolean = false;
	baseColorStrength.matrixMode = 0;
	baseColorStrength.animationType = BABYLON.AnimatedInputBlockTypes.None;
	baseColorStrength.isConstant = false;

	// TransformBlock
	var WorldPos = new BABYLON.TransformBlock("WorldPos");
	WorldPos.visibleInInspector = false;
	WorldPos.visibleOnFrame = false;
	WorldPos.target = 1;
	WorldPos.complementZ = 0;
	WorldPos.complementW = 1;

	// InputBlock
	var World = new BABYLON.InputBlock("World");
	World.visibleInInspector = false;
	World.visibleOnFrame = false;
	World.target = 1;
	World.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

	// TransformBlock
	var WorldPosViewProjectionTransform = new BABYLON.TransformBlock("WorldPos * ViewProjectionTransform");
	WorldPosViewProjectionTransform.visibleInInspector = false;
	WorldPosViewProjectionTransform.visibleOnFrame = false;
	WorldPosViewProjectionTransform.target = 1;
	WorldPosViewProjectionTransform.complementZ = 0;
	WorldPosViewProjectionTransform.complementW = 1;

	// InputBlock
	var ViewProjection = new BABYLON.InputBlock("ViewProjection");
	ViewProjection.visibleInInspector = false;
	ViewProjection.visibleOnFrame = false;
	ViewProjection.target = 1;
	ViewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

	// VertexOutputBlock
	var VertexOutput = new BABYLON.VertexOutputBlock("VertexOutput");
	VertexOutput.visibleInInspector = false;
	VertexOutput.visibleOnFrame = false;
	VertexOutput.target = 1;

	// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	position.output.connectTo(WaveNoise.inputs[0]); // p (position)
	Time.output.connectTo(Multiply.left);
	speed.output.connectTo(Multiply.right);
	Multiply.output.connectTo(WaveNoise.inputs[1]); // t (time)
	WaveNoise.outputs[0].connectTo(VectorSplitter.xyzIn);
	VectorSplitter.z.connectTo(Add.left);
	treshold.output.connectTo(Add.right);
	Add.output.connectTo(Multiply3.left);
	gradientControl.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(Gradient.gradient);
	Gradient.output.connectTo(Pow.value);
	baseColorStrength.output.connectTo(VectorMerger.x);
	baseColorStrength.output.connectTo(VectorMerger.y);
	baseColorStrength.output.connectTo(VectorMerger.z);
	VectorMerger.xyz.connectTo(Pow.power);
	Pow.output.connectTo(Multiply2.left);
	Gradient.output.connectTo(Scale.input);
	emisiveStrength.output.connectTo(Scale.factor);
	Scale.output.connectTo(Lerp.left);
	glowColor.output.connectTo(Lerp.right);
	glowMask.output.connectTo(Oneminus.input);
	Oneminus.output.connectTo(Step.value);
	Float.output.connectTo(Step.edge);
	Step.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(FragmentOutput.rgb);
	Add.output.connectTo(Multiply1.left);
	endMultiplier.output.connectTo(Multiply1.right);
	Multiply1.output.connectTo(FragmentOutput.a);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	return nodeMaterial;
}
