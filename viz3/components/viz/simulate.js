import THREE from "three";
import uuid from 'uuid';
import glslify from 'glslify';
import shaderParse from './parse.js';
import nullShade from './shaders/null.vert';
import nullFrag from './shaders/null.frag';
import positionShade from './shaders/position.frag';
import constants from './constants.js';


let textureDefaultPosition;

let renderer;
let copyShader;


let amountDim = constants.amount;

let MAX_SIMULATIONS = 30;

let followPoint;
let followPointTime = 0;

let simulations = [];
let locs = [];

let camera = new THREE.Camera();


let create = _renderer => {
	renderer = _renderer;
	let followPoint = new THREE.Vector3();

	let rawShaderPrefix = 'precision ' + renderer.capabilities.precision + ' float;\n';

	let scene = new THREE.Scene();
	camera.position.z = 1;
	copyShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: { type: 'v2', value: new THREE.Vector2(amountDim, amountDim )},
			texture: { type: 't', value: undefined}
		},
		vertexShader: rawShaderPrefix + shaderParse(glslify(nullShade)),
        fragmentShader: rawShaderPrefix + shaderParse(glslify(nullFrag))
    });

	let positionShader = new THREE.RawShaderMaterial({
		uniforms: {
			resolution: {type: 'v2', value: new THREE.Vector2(amountDim, amountDim)},
			texturePosition: {type: 't', value: undefined},
			textureDefaultPosition: {type: 't', value: undefined},
			mouse3d: { type: 'v3', value: new THREE.Vector3 },
			speed: { type: 'f', value: constants.settings.speed },
            dieSpeed: { type: 'f', value: constants.settings.dieSpeed },
            radius: { type: 'f', value: constants.settings.radius },
            curlSize: { type: 'f', value: constants.settings.curlSize },
            attraction: { type: 'f', value: constants.settings.attraction },
			fire: {type: 'f', value: constants.settings.fire },
            time: { type: 'f', value: 5 },
            initAnimation: { type: 'f', value: 0 },
			otherSims: { type: 'v3v', value: locs}
		},
		vertexShader: rawShaderPrefix + shaderParse(nullShade),
		fragmentShader: rawShaderPrefix + shaderParse(positionShade),
		blending: THREE.NoBlending,
		transparent: false,
		depthWrite: false,
		depthTest: false
	});

	let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), copyShader);
	scene.add(mesh);

	let positionRenderTarget = new THREE.WebGLRenderTarget(amountDim, amountDim, {
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

	let positionRenderTarget2 = positionRenderTarget.clone();
	copyTexture(mesh, scene, createPositionTexture(), positionRenderTarget);
	copyTexture(mesh, scene, positionRenderTarget, positionRenderTarget2);

	let simulation = {
		mesh,
		positionRenderTarget,
		positionRenderTarget2,
		scene,
		positionShader,
		followPoint,
		initAnimation: 0,
		last_x: 0,
		yPos: 0,
		offset: Math.random()*300,
		id: uuid()
	};

	simulations.push(simulation);
}

let deleteIt = () => {
	simulations.shift();
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
    texture.needsUpdate = true;
	textureDefaultPosition = texture;
	return texture;
}

let copyTexture = (mesh, scene, input, output) => {
	mesh.material = copyShader;
	copyShader.uniforms.texture.value = input.texture;
	renderer.render(scene, camera, output);
}

let updatePosition = (dt, simulation) => {
	let tmp = simulation.positionRenderTarget;
	simulation.positionRenderTarget = simulation.positionRenderTarget2;
	simulation.positionRenderTarget2 = tmp;

	simulation.mesh.material = simulation.positionShader;
	simulation.positionShader.uniforms.textureDefaultPosition.value = textureDefaultPosition;
	simulation.positionShader.uniforms.texturePosition.value = simulation.positionRenderTarget2.texture;
	simulation.positionShader.uniforms.time.value += dt * 0.001;
	simulation.positionShader.uniforms.otherSims.value = locs;
	renderer.render(simulation.scene, camera, simulation.positionRenderTarget);
}

let update = dt => {

	followPointTime += parseFloat(dt * 0.001 * 1);
	locs = simulations.reduce((total, sim) => total.concat(sim.followPoint), []);
	for(let i = 0; i < MAX_SIMULATIONS - simulations.length; i++) {
		locs.push(new THREE.Vector3(0,0,0));
	}

	for(let simulation of simulations) {
		
		let r = 520;
		let h = 300;

		let autoClearColor = renderer.autoClearColor;
		let clearColor = renderer.getClearColor().getHex();
		let clearAlpha = renderer.getClearAlpha();

		renderer.autoClearColor = false;

		let deltaRatio = dt / 16.6667;

		simulation.initAnimation = Math.min(simulation.initAnimation + dt * 0.00025, 1);
		simulation.positionShader.uniforms.initAnimation.value = simulation.initAnimation;

		simulation.positionShader.uniforms.speed.value = constants.settings.speed * deltaRatio;
		simulation.positionShader.uniforms.dieSpeed.value = constants.settings.dieSpeed * deltaRatio;
		simulation.positionShader.uniforms.radius.value = constants.settings.radius;
		simulation.positionShader.uniforms.curlSize.value = constants.settings.curlSize;
		simulation.positionShader.uniforms.attraction.value = constants.settings.attraction;
		simulation.positionShader.uniforms.fire.value = constants.settings.fire;

		let sinceRestart = (Date.now() - constants.particleRestart) * 0.001;

		let total_time = constants.settings.total_time;
		let newPos = new THREE.Vector3(-r + sinceRestart / total_time * r *2 - simulation.offset, simulation.yPos, 0);
		simulation.followPoint.set(
			newPos.x,
			newPos.y,
			newPos.z
		);

		if(newPos.x < simulation.last_x) {
			simulation.positionShader.uniforms.mouse3d.value.lerp(simulation.followPoint, 0.2);
			simulation.yPos = Math.random() * h * 2 - h;
		}
		else {
			simulation.positionShader.uniforms.mouse3d.value = simulation.followPoint;
		}
		simulation.last_x = newPos.x;
		updatePosition(dt, simulation);

		renderer.autoClearColor = autoClearColor;
	}
}

exports.simulations = simulations;
exports.create = create;
exports.deleteIt = deleteIt;
exports.update = update;
