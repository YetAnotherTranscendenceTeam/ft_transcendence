import * as BABYLON from "@babylonjs/core";

export const createShieldMaterial = () => {

	const nodeMaterial = new BABYLON.NodeMaterial("node");
	nodeMaterial.mode = BABYLON.NodeMaterialModes.Material;

	// InputBlock
	const position = new BABYLON.InputBlock("position");
	position.visibleInInspector = false;
	position.visibleOnFrame = false;
	position.target = 1;
	position.setAsAttribute("position");

	// TransformBlock
	const WorldPos = new BABYLON.TransformBlock("WorldPos");
	WorldPos.visibleInInspector = false;
	WorldPos.visibleOnFrame = false;
	WorldPos.target = 1;
	WorldPos.complementZ = 0;
	WorldPos.complementW = 1;

	// InputBlock
	const World = new BABYLON.InputBlock("World");
	World.visibleInInspector = false;
	World.visibleOnFrame = false;
	World.target = 1;
	World.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

	// TransformBlock
	const Worldnormal = new BABYLON.TransformBlock("World normal");
	Worldnormal.visibleInInspector = false;
	Worldnormal.visibleOnFrame = false;
	Worldnormal.target = 1;
	Worldnormal.complementZ = 0;
	Worldnormal.complementW = 0;

	// InputBlock
	const normal = new BABYLON.InputBlock("normal");
	normal.visibleInInspector = false;
	normal.visibleOnFrame = false;
	normal.target = 1;
	normal.setAsAttribute("normal");

	// FresnelBlock
	const Fresnel = new BABYLON.FresnelBlock("Fresnel");
	Fresnel.visibleInInspector = false;
	Fresnel.visibleOnFrame = false;
	Fresnel.target = 4;

	// ViewDirectionBlock
	const Viewdirection = new BABYLON.ViewDirectionBlock("View direction");
	Viewdirection.visibleInInspector = false;
	Viewdirection.visibleOnFrame = false;
	Viewdirection.target = 4;

	// InputBlock
	const cameraPosition = new BABYLON.InputBlock("cameraPosition");
	cameraPosition.visibleInInspector = false;
	cameraPosition.visibleOnFrame = false;
	cameraPosition.target = 1;
	cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

	// InputBlock
	const bias = new BABYLON.InputBlock("bias");
	bias.visibleInInspector = false;
	bias.visibleOnFrame = false;
	bias.target = 1;
	bias.value = 0;
	bias.min = 0;
	bias.max = 1;
	bias.isBoolean = false;
	bias.matrixMode = 0;
	bias.animationType = BABYLON.AnimatedInputBlockTypes.None;
	bias.isConstant = false;

	// InputBlock
	const power = new BABYLON.InputBlock("power");
	power.visibleInInspector = false;
	power.visibleOnFrame = false;
	power.target = 1;
	power.value = 1;
	power.min = 0;
	power.max = 1;
	power.isBoolean = false;
	power.matrixMode = 0;
	power.animationType = BABYLON.AnimatedInputBlockTypes.None;
	power.isConstant = false;

	// OneMinusBlock
	const Oneminus = new BABYLON.OneMinusBlock("One minus");
	Oneminus.visibleInInspector = false;
	Oneminus.visibleOnFrame = false;
	Oneminus.target = 4;

	// MultiplyBlock
	const Multiply = new BABYLON.MultiplyBlock("Multiply");
	Multiply.visibleInInspector = false;
	Multiply.visibleOnFrame = false;
	Multiply.target = 4;

	// MultiplyBlock
	const Multiply1 = new BABYLON.MultiplyBlock("Multiply");
	Multiply1.visibleInInspector = false;
	Multiply1.visibleOnFrame = false;
	Multiply1.target = 4;

	// OneMinusBlock
	const Oneminus1 = new BABYLON.OneMinusBlock("One minus");
	Oneminus1.visibleInInspector = false;
	Oneminus1.visibleOnFrame = false;
	Oneminus1.target = 4;

	// MultiplyBlock
	const Multiply2 = new BABYLON.MultiplyBlock("Multiply");
	Multiply2.visibleInInspector = false;
	Multiply2.visibleOnFrame = false;
	Multiply2.target = 4;

	// CustomBlock
	const Hexagon = new BABYLON.CustomBlock("Hexagon");
	Hexagon.visibleInInspector = false;
	Hexagon.visibleOnFrame = false;
	Hexagon.target = 4;
	Hexagon.options = {"name":"Hexagon","comments":"Create hexagon shapes","target":"Neutral","inParameters":[{"name":"uv","type":"Vector2"}],"outParameters":[{"name":"output","type":"Float"}],"functionName":"hexagon","code":["#define S(r,v) smoothstep(9./iResolution.y,0.,abs(v-(r)))","const vec2 s = vec2(1, 1.7320508); // 1.7320508 = sqrt(3)","const float borderThickness = 0.05;","float calcHexDistance(vec2 p)","{","    p = abs(p);","    return max(dot(p, s * .5), p.x);","}","float random(vec2 co)","{","    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);","}","vec4 calcHexInfo(vec2 uv)","{","    vec4 hexCenter = round(vec4(uv, uv - vec2(.5, 1.)) / s.xyxy);","    vec4 offset = vec4(uv - hexCenter.xy * s, uv - (hexCenter.zw + .5) * s);","    return dot(offset.xy, offset.xy) < dot(offset.zw, offset.zw) ? vec4(offset.xy, hexCenter.xy) : vec4(offset.zw, hexCenter.zw);","}","void hexagon(in vec2 uv, out float result )","{","    vec4 hexInfo = calcHexInfo(uv);","    float totalDist = calcHexDistance(hexInfo.xy) + borderThickness;","    result = (","        smoothstep(.51, .51 - 0.01, totalDist) ","        //pow(1. - max(0., .5 - totalDist), 20.) * 1.","    );","}"]};

	// MultiplyBlock
	const Multiply3 = new BABYLON.MultiplyBlock("Multiply");
	Multiply3.visibleInInspector = false;
	Multiply3.visibleOnFrame = false;
	Multiply3.target = 4;

	// InputBlock
	const uv = new BABYLON.InputBlock("uv");
	uv.visibleInInspector = false;
	uv.visibleOnFrame = false;
	uv.target = 1;
	uv.setAsAttribute("uv");

	// InputBlock
	const hexagonSize = new BABYLON.InputBlock("hexagonSize");
	hexagonSize.visibleInInspector = false;
	hexagonSize.visibleOnFrame = false;
	hexagonSize.target = 1;
	hexagonSize.value = new BABYLON.Vector2(10, 10);
	hexagonSize.isConstant = false;

	// CustomBlock
	const Hexagon1 = new BABYLON.CustomBlock("Hexagon");
	Hexagon1.visibleInInspector = false;
	Hexagon1.visibleOnFrame = false;
	Hexagon1.target = 4;
	Hexagon1.options = {"name":"Hexagon","comments":"Create hexagon shapes","target":"Neutral","inParameters":[{"name":"u","type":"Vector2"}],"outParameters":[{"name":"result","type":"Float"}],"functionName":"hexagon","code":["void hexagon( in vec2 u, out float result ){","    vec2 s = vec2(1., 1.732);","    vec2 a = s-2.*mod(u,s);","    vec2 b = s-2.*mod(u+s*vec2(0.5,0.5),s);","    result = (0.7+0.2*sin(1.1)-0.5*min(dot(a,a),dot(b,b)));","}"]};

	// InputBlock
	const hexagonStrengh = new BABYLON.InputBlock("hexagonStrengh");
	hexagonStrengh.visibleInInspector = false;
	hexagonStrengh.visibleOnFrame = false;
	hexagonStrengh.target = 1;
	hexagonStrengh.value = 1;
	hexagonStrengh.min = 0;
	hexagonStrengh.max = 1;
	hexagonStrengh.isBoolean = false;
	hexagonStrengh.matrixMode = 0;
	hexagonStrengh.animationType = BABYLON.AnimatedInputBlockTypes.None;
	hexagonStrengh.isConstant = false;

	// InputBlock
	const InputBlock_39 = new BABYLON.InputBlock("");
	InputBlock_39.visibleInInspector = false;
	InputBlock_39.visibleOnFrame = false;
	InputBlock_39.target = 1;
	InputBlock_39.value = 1;
	InputBlock_39.min = 0;
	InputBlock_39.max = 0;
	InputBlock_39.isBoolean = false;
	InputBlock_39.matrixMode = 0;
	InputBlock_39.animationType = BABYLON.AnimatedInputBlockTypes.None;
	InputBlock_39.isConstant = false;

	// MultiplyBlock
	const Multiply4 = new BABYLON.MultiplyBlock("Multiply");
	Multiply4.visibleInInspector = false;
	Multiply4.visibleOnFrame = false;
	Multiply4.target = 4;

	// VectorSplitterBlock
	const VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
	VectorSplitter.visibleInInspector = false;
	VectorSplitter.visibleOnFrame = false;
	VectorSplitter.target = 4;

	// CustomBlock
	const WaveNoise = new BABYLON.CustomBlock("WaveNoise");
	WaveNoise.visibleInInspector = false;
	WaveNoise.visibleOnFrame = false;
	WaveNoise.target = 4;
	WaveNoise.options = {"name":"WaveNoise","comments":"Create a type of wave noise","target":"Neutral","inParameters":[{"name":"p","type":"Vector3"},{"name":"t","type":"Float"}],"outParameters":[{"name":"output","type":"Vector3"}],"functionName":"waveNoise","code":["uint hash(uint x)","{","    x = ((x >> 16u) ^ x) * 0x45d9f3bu;","    x = ((x >> 16u) ^ x) * 0x45d9f3bu;","    x = (x >> 16u) ^ x;","    return x;","}","uint combine(uint v, uint seed)","{","    return seed ^ (v + 0x9e3779b9u + (seed << 6) + (seed >> 2));","}","float uniformFloat(uint h)","{","    return uintBitsToFloat(h & 0x007FFFFFu | 0x3F800000u) - 1.0;","}","vec3 normal(vec3 p, uint seed)","{","    uvec3 u = floatBitsToUint(p);","    seed = combine(hash(u.x), seed);","    seed = combine(hash(u.y), seed);","    seed = combine(hash(u.z), seed);","    float a = uniformFloat(seed);","    seed = combine(0x6d04955du, seed);","    float z = uniformFloat(seed) * 2.0 - 1.0;","    float s = sqrt(1.0 - z * z);","    return vec3(s * cos(a * 6.2831853 + vec2(0.0, -1.570796)), z);","}","vec3 ss(vec3 x)","{","    return x * x * (3.0 - 2.0 * x);","}","float gnoise(vec3 p, uint seed)","{","    vec3 i = floor(p);","    vec3 f = fract(p);","    vec3 a = ss(f);","    float n000 = dot(normal(i, seed), f);","    float n100 = dot(normal(i + vec3(1.0, 0.0, 0.0), seed), f - vec3(1.0, 0.0, 0.0));","    float n010 = dot(normal(i + vec3(0.0, 1.0, 0.0), seed), f - vec3(0.0, 1.0, 0.0));","    float n110 = dot(normal(i + vec3(1.0, 1.0, 0.0), seed), f - vec3(1.0, 1.0, 0.0));","    float n001 = dot(normal(i + vec3(0.0, 0.0, 1.0), seed), f - vec3(0.0, 0.0, 1.0));","    float n101 = dot(normal(i + vec3(1.0, 0.0, 1.0), seed), f - vec3(1.0, 0.0, 1.0));","    float n011 = dot(normal(i + vec3(0.0, 1.0, 1.0), seed), f - vec3(0.0, 1.0, 1.0));","    float n111 = dot(normal(i + vec3(1.0, 1.0, 1.0), seed), f - vec3(1.0, 1.0, 1.0));","    return mix(","        mix(mix(n000, n100, a.x), mix(n010, n110, a.x), a.y),","        mix(mix(n001, n101, a.x), mix(n011, n111, a.x), a.y), a.z);","}","vec3 gnoise3(vec3 p, uvec3 seed)","{","    return vec3(gnoise(p, seed.x), gnoise(p, seed.y), gnoise(p, seed.z));","}","vec3 n(vec3 p, uvec3 seed)","{ ","    return max(1.0 - abs(gnoise3(p, seed) * 1.5), vec3(0.0));","}","vec3 q(vec3 v)","{","    return pow(v, vec3(1.0, 1.0, 3.5));","}","vec3 r(vec3 n)","{","    return pow(n, vec3(6.0, 9.0, 9.0));","}","void waveNoise(vec3 p, float t, out vec3 result)","{","    vec3 n0 = n(p * 1.0 + t, uvec3(0xa7886e74u, 0x4433f369u, 0x5842edddu));","    vec3 n1 = n(p * 2.0 + t, uvec3(0x41a2b27au, 0x14dede03u, 0x509a02aau));","    vec3 n2 = n(p * 4.0 + t, uvec3(0xd5bf21b3u, 0x1d6adb70u, 0xc47ed64cu));","    vec3 n3 = n(p * 8.0 + t, uvec3(0x7279fef1u, 0x120a704eu, 0x845b7178u));","    vec3 n4 = n(p * 16.0 + t, uvec3(0xace62131u, 0x7e861b25u, 0x9f51d60cu));","    result = (","        n1 * r(n0) * 0.25 +","        q(n0) * r(n1) * vec3(0.25, 0.25, 0.5) +","        q(n0 * n1) * r(n2) * vec3(0.125, 0.125, 0.5) +","        q(n0 * n1 * n2) * r(n3) * vec3(0.0625, 0.0625, 0.5) +","        q(n0 * n1 * n2 * n3) * r(n4) * vec3(0.03125, 0.03125, 0.5)","    ) * 0.5;","}"]};

	// MultiplyBlock
	const Multiply5 = new BABYLON.MultiplyBlock("Multiply");
	Multiply5.visibleInInspector = false;
	Multiply5.visibleOnFrame = false;
	Multiply5.target = 4;

	// InputBlock
	const Time = new BABYLON.InputBlock("Time");
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
	const speed = new BABYLON.InputBlock("speed");
	speed.visibleInInspector = false;
	speed.visibleOnFrame = false;
	speed.target = 1;
	speed.value = 1;
	speed.min = 0;
	speed.max = 0;
	speed.isBoolean = false;
	speed.matrixMode = 0;
	speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
	speed.isConstant = false;

	// TrigonometryBlock
	const Sin = new BABYLON.TrigonometryBlock("Sin");
	Sin.visibleInInspector = false;
	Sin.visibleOnFrame = false;
	Sin.target = 4;
	Sin.operation = BABYLON.TrigonometryBlockOperations.Sin;

	// AddBlock
	const Add = new BABYLON.AddBlock("Add");
	Add.visibleInInspector = false;
	Add.visibleOnFrame = false;
	Add.target = 4;

	// AddBlock
	const Add1 = new BABYLON.AddBlock("Add");
	Add1.visibleInInspector = false;
	Add1.visibleOnFrame = false;
	Add1.target = 4;

	// InputBlock
	const treshold = new BABYLON.InputBlock("treshold");
	treshold.visibleInInspector = false;
	treshold.visibleOnFrame = false;
	treshold.target = 1;
	treshold.value = 0;
	treshold.min = 0;
	treshold.max = 0;
	treshold.isBoolean = false;
	treshold.matrixMode = 0;
	treshold.animationType = BABYLON.AnimatedInputBlockTypes.None;
	treshold.isConstant = false;

	// InputBlock
	const Float = new BABYLON.InputBlock("Float");
	Float.visibleInInspector = false;
	Float.visibleOnFrame = false;
	Float.target = 1;
	Float.value = 1;
	Float.min = 0;
	Float.max = 0;
	Float.isBoolean = false;
	Float.matrixMode = 0;
	Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
	Float.isConstant = false;

	// DivideBlock
	const Divide = new BABYLON.DivideBlock("Divide");
	Divide.visibleInInspector = false;
	Divide.visibleOnFrame = false;
	Divide.target = 4;

	// InputBlock
	const Float1 = new BABYLON.InputBlock("Float");
	Float1.visibleInInspector = false;
	Float1.visibleOnFrame = false;
	Float1.target = 1;
	Float1.value = 2;
	Float1.min = 0;
	Float1.max = 0;
	Float1.isBoolean = false;
	Float1.matrixMode = 0;
	Float1.animationType = BABYLON.AnimatedInputBlockTypes.None;
	Float1.isConstant = false;

	// MultiplyBlock
	const Multiply6 = new BABYLON.MultiplyBlock("Multiply");
	Multiply6.visibleInInspector = false;
	Multiply6.visibleOnFrame = false;
	Multiply6.target = 4;

	// InputBlock
	const endMultiplier = new BABYLON.InputBlock("endMultiplier");
	endMultiplier.visibleInInspector = false;
	endMultiplier.visibleOnFrame = false;
	endMultiplier.target = 1;
	endMultiplier.value = 10;
	endMultiplier.min = 1;
	endMultiplier.max = 50;
	endMultiplier.isBoolean = false;
	endMultiplier.matrixMode = 0;
	endMultiplier.animationType = BABYLON.AnimatedInputBlockTypes.None;
	endMultiplier.isConstant = false;

	// FragmentOutputBlock
	const FragmentOutput = new BABYLON.FragmentOutputBlock("FragmentOutput");
	FragmentOutput.visibleInInspector = false;
	FragmentOutput.visibleOnFrame = false;
	FragmentOutput.target = 2;
	FragmentOutput.convertToGammaSpace = false;
	FragmentOutput.convertToLinearSpace = false;
	FragmentOutput.useLogarithmicDepth = false;

	// MultiplyBlock
	const Multiply7 = new BABYLON.MultiplyBlock("Multiply");
	Multiply7.visibleInInspector = false;
	Multiply7.visibleOnFrame = false;
	Multiply7.target = 4;

	// PowBlock
	const Pow = new BABYLON.PowBlock("Pow");
	Pow.visibleInInspector = false;
	Pow.visibleOnFrame = false;
	Pow.target = 4;

	// // InputBlock
	// const baseColor = new BABYLON.InputBlock("baseColor");
	// baseColor.visibleInInspector = false;
	// baseColor.visibleOnFrame = false;
	// baseColor.target = 1;
	// baseColor.value = new BABYLON.Color3(0.06274509803921569, 0.396078431372549, 0.9725490196078431);
	// baseColor.isConstant = false;

	// GradientBlock
	const Gradient = new BABYLON.GradientBlock("Gradient");
	Gradient.visibleInInspector = false;
	Gradient.visibleOnFrame = false;
	Gradient.target = 4;
	Gradient.colorSteps = [];
	Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.06274509803921569, 0.396078431372549, 0.9725490196078431)));
	Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(1, 0, 0)));

	// InputBlock
	const colorBlend = new BABYLON.InputBlock("colorBlend");
	colorBlend.visibleInInspector = false;
	colorBlend.visibleOnFrame = false;
	colorBlend.target = 1;
	colorBlend.value = 0;
	colorBlend.min = 0;
	colorBlend.max = 1;
	colorBlend.isBoolean = false;
	colorBlend.matrixMode = 0;
	colorBlend.animationType = BABYLON.AnimatedInputBlockTypes.None;
	colorBlend.isConstant = false;

	// ScaleBlock
	const Scale = new BABYLON.ScaleBlock("Scale");
	Scale.visibleInInspector = false;
	Scale.visibleOnFrame = false;
	Scale.target = 4;

	// InputBlock
	const emisiveStrength = new BABYLON.InputBlock("emisiveStrength");
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
	const Lerp = new BABYLON.LerpBlock("Lerp");
	Lerp.visibleInInspector = false;
	Lerp.visibleOnFrame = false;
	Lerp.target = 4;

	// InputBlock
	const glowColor = new BABYLON.InputBlock("glowColor");
	glowColor.visibleInInspector = false;
	glowColor.visibleOnFrame = false;
	glowColor.target = 1;
	glowColor.value = new BABYLON.Color3(1, 1, 1);
	glowColor.isConstant = true;

	// StepBlock
	const Step = new BABYLON.StepBlock("Step");
	Step.visibleInInspector = false;
	Step.visibleOnFrame = false;
	Step.target = 4;

	// OneMinusBlock
	const Oneminus2 = new BABYLON.OneMinusBlock("One minus");
	Oneminus2.visibleInInspector = false;
	Oneminus2.visibleOnFrame = false;
	Oneminus2.target = 4;

	// InputBlock
	const glowMask = new BABYLON.InputBlock("glowMask");
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
	const Float2 = new BABYLON.InputBlock("Float");
	Float2.visibleInInspector = false;
	Float2.visibleOnFrame = false;
	Float2.target = 1;
	Float2.value = 1;
	Float2.min = 0;
	Float2.max = 0;
	Float2.isBoolean = false;
	Float2.matrixMode = 0;
	Float2.animationType = BABYLON.AnimatedInputBlockTypes.None;
	Float2.isConstant = true;

	// VectorMergerBlock
	const VectorMerger = new BABYLON.VectorMergerBlock("VectorMerger");
	VectorMerger.visibleInInspector = false;
	VectorMerger.visibleOnFrame = false;
	VectorMerger.target = 4;
	VectorMerger.xSwizzle = "x";
	VectorMerger.ySwizzle = "y";
	VectorMerger.zSwizzle = "z";
	VectorMerger.wSwizzle = "w";

	// InputBlock
	const baseColorStrength = new BABYLON.InputBlock("baseColorStrength");
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
	const WorldPosViewProjectionTransform = new BABYLON.TransformBlock("WorldPos * ViewProjectionTransform");
	WorldPosViewProjectionTransform.visibleInInspector = false;
	WorldPosViewProjectionTransform.visibleOnFrame = false;
	WorldPosViewProjectionTransform.target = 1;
	WorldPosViewProjectionTransform.complementZ = 0;
	WorldPosViewProjectionTransform.complementW = 1;

	// InputBlock
	const ViewProjection = new BABYLON.InputBlock("ViewProjection");
	ViewProjection.visibleInInspector = false;
	ViewProjection.visibleOnFrame = false;
	ViewProjection.target = 1;
	ViewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

	// VertexOutputBlock
	const VertexOutput = new BABYLON.VertexOutputBlock("VertexOutput");
	VertexOutput.visibleInInspector = false;
	VertexOutput.visibleOnFrame = false;
	VertexOutput.target = 1;

	// Connections
	position.output.connectTo(WorldPos.vector);
	World.output.connectTo(WorldPos.transform);
	WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
	ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
	WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
	colorBlend.output.connectTo(Gradient.gradient);
	Gradient.output.connectTo(Pow.value);
	// baseColor.output.connectTo(Pow.value);
	baseColorStrength.output.connectTo(VectorMerger.x);
	baseColorStrength.output.connectTo(VectorMerger.y);
	baseColorStrength.output.connectTo(VectorMerger.z);
	VectorMerger.xyz.connectTo(Pow.power);
	Pow.output.connectTo(Multiply7.left);
	// baseColor.output.connectTo(Scale.input);
	Gradient.output.connectTo(Scale.input);
	emisiveStrength.output.connectTo(Scale.factor);
	Scale.output.connectTo(Lerp.left);
	glowColor.output.connectTo(Lerp.right);
	glowMask.output.connectTo(Oneminus2.input);
	Oneminus2.output.connectTo(Step.value);
	Float2.output.connectTo(Step.edge);
	Step.output.connectTo(Lerp.gradient);
	Lerp.output.connectTo(Multiply7.right);
	Multiply7.output.connectTo(FragmentOutput.rgb);
	WorldPos.xyz.connectTo(WaveNoise.inputs[0]); // p (position)
	Time.output.connectTo(Multiply5.left);
	speed.output.connectTo(Multiply5.right);
	Multiply5.output.connectTo(WaveNoise.inputs[1]); // t (time)
	WaveNoise.outputs[0].connectTo(VectorSplitter.xyzIn);
	// VectorSplitter.z.connectTo(Multiply4.left);
	VectorSplitter.z.connectTo(Add1.left);
	treshold.output.connectTo(Add1.right);
	Add1.output.connectTo(Multiply4.left);
	uv.output.connectTo(Multiply3.left);
	hexagonSize.output.connectTo(Multiply3.right);
	Multiply3.output.connectTo(Hexagon.inputs[0]); // uv
	Hexagon.outputs[0].connectTo(Multiply2.left);
	hexagonStrengh.output.connectTo(Multiply2.right);
	Multiply2.output.connectTo(Oneminus1.input);
	Oneminus1.output.connectTo(Multiply1.left);
	InputBlock_39.output.connectTo(Multiply1.right);
	// Multiply1.output.connectTo(Multiply.left);
	normal.output.connectTo(Worldnormal.vector);
	World.output.connectTo(Worldnormal.transform);
	Worldnormal.output.connectTo(Fresnel.worldNormal);
	WorldPos.output.connectTo(Viewdirection.worldPosition);
	cameraPosition.output.connectTo(Viewdirection.cameraPosition);
	Viewdirection.output.connectTo(Fresnel.viewDirection);
	bias.output.connectTo(Fresnel.bias);
	power.output.connectTo(Fresnel.power);
	Fresnel.fresnel.connectTo(Oneminus.input);
	// Oneminus.output.connectTo(Multiply.right);
	// Multiply.output.connectTo(Multiply4.right);
	Multiply1.output.connectTo(Multiply4.right);
	Multiply4.output.connectTo(Multiply6.left);
	endMultiplier.output.connectTo(Multiply6.right);
	Multiply6.output.connectTo(FragmentOutput.a);

	// Output nodes
	nodeMaterial.addOutputNode(VertexOutput);
	nodeMaterial.addOutputNode(FragmentOutput);
	nodeMaterial.build();

	return nodeMaterial;
}
