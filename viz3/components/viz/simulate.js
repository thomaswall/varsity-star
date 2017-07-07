import THREE from "three";
import glslify from 'glslify';
import shaderParse from './parse.js';
import nullShade from './shaders/null.vert';
import nullFrag from './shaders/null.frag';
import positionShade from './shaders/position.frag';

let copyShader;
let positionShader;
let textureDefaultPosition;
let positionRenderTarget;
let positionRenderTarget2;

let renderer;
let mesh;
let scene;
let camera;


let amountDim = 1024;

let followPoint;
let followPointTime = 0;
let initAnimation = 0;


let init = _renderer => {
	renderer = _renderer;
	followPoint = new THREE.Vector3();

	let rawShaderPrefix = 'precision ' + renderer.capabilities.precision + ' float;\n';

	scene = new THREE.Scene();
	camera = new THREE.Camera();
	camera.position.z = 1;
	copyShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: { type: 'v2', value: new THREE.Vector2(amountDim, amountDim )},
			texture: { type: 't', value: undefined}
		},
		vertexShader: rawShaderPrefix + shaderParse(glslify(nullShade)),
        fragmentShader: rawShaderPrefix + shaderParse(glslify(nullFrag))
    });

	positionShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: {type: 'v2', value: new THREE.Vector2(amountDim, amountDim)},
			texturePosition: {type: 't', value: undefined},
			textureDefaultPosition: {type: 't', value: undefined},
			mouse3d: { type: 'v3', value: new THREE.Vector3 },
			speed: { type: 'f', value: 1 },
            dieSpeed: { type: 'f', value: 0.015 },
            radius: { type: 'f', value: 1 },
            curlSize: { type: 'f', value: 0.02 },
            attraction: { type: 'f', value: 1 },
            time: { type: 'f', value: 5 },
            initAnimation: { type: 'f', value: 0 }
		},
		vertexShader: rawShaderPrefix + shaderParse(nullShade),
		fragmentShader: rawShaderPrefix + shaderParse(positionShade),
		blending: THREE.NoBlending,
		transparent: false,
		depthWrite: false,
		depthTest: false
	});

	mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), copyShader);
	scene.add(mesh);

	positionRenderTarget = new THREE.WebGLRenderTarget(amountDim, amountDim, {
		wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
	});

	positionRenderTarget2 = positionRenderTarget.clone();
	copyTexture(createPositionTexture(), positionRenderTarget);
	copyTexture(positionRenderTarget, positionRenderTarget2);
}

let createPositionTexture = () => {
	let positions = new Float32Array(amountDim * amountDim * 4);
	let index, r, phi, theta;
	for(let i = 0; i < amountDim * amountDim; i++) {
		index = i * 4;
		r = (0.5 + Math.random() * 0.5) * 50;
		phi = (Math.random() - 0.5) * Math.PI;
		theta = Math.random() * Math.PI * 2;
		positions[index + 0] = r * Math.cos(theta) * Math.cos(phi);
        positions[index + 1] = r * Math.sin(phi);
        positions[index + 2] = r * Math.sin(theta) * Math.cos(phi);
        positions[index + 3] = Math.random();
	}

	let texture = new THREE.DataTexture(positions, amountDim, amountDim, THREE.RGBAFormat, THREE.FloatType);
	texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
	textureDefaultPosition = texture;
	return texture;
}

let copyTexture = (input, output) => {
	mesh.material = copyShader;
	copyShader.uniforms.texture.value = input.texture;
	renderer.render(scene, camera, output);
}

let updatePosition = dt => {
	let tmp = positionRenderTarget;
	positionRenderTarget = positionRenderTarget2;
	positionRenderTarget2 = tmp;

	mesh.material = positionShader;
	positionShader.uniforms.textureDefaultPosition.value = textureDefaultPosition.texture;
	positionShader.uniforms.texturePosition.value = positionRenderTarget2.texture;
	positionShader.uniforms.time.value += dt * 0.001;
	renderer.render(scene, camera, positionRenderTarget);
}

let update = dt => {

	let r = 200;
	let h = 60;

	let autoClearColor = renderer.autoClearColor;
	let clearColor = renderer.getClearColor().getHex();
    let clearAlpha = renderer.getClearAlpha();

    renderer.autoClearColor = false;

	let deltaRatio = dt / 16.6667;

	initAnimation = Math.min(initAnimation + dt * 0.00025, 1);
	positionShader.uniforms.initAnimation.value = initAnimation;

	positionShader.uniforms.speed.value = 1 * deltaRatio;
	// positionShader.uniforms.dieSpeed.value

	followPointTime += parseFloat(dt * 0.001 * 1);
	followPoint.set(
        Math.cos(followPointTime) * r,
        Math.cos(followPointTime * 4.0) * h,
        Math.sin(followPointTime * 2.0) * r
    );

	positionShader.uniforms.mouse3d.value.lerp(followPoint, 0.2);
	updatePosition(dt);

	renderer.autoClearColor = autoClearColor;

	exports.positionRenderTarget = positionRenderTarget;
	exports.prevPositionRenderTarget = positionRenderTarget2;
}

exports.positionRenderTarget2 = undefined;
exports.positionRenderTarget = undefined;
exports.init = init;
exports.update = update;
