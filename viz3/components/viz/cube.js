import THREE from 'three';
import cubevert from './shaders/cube.vert'
import cubefrag from './shaders/cube.frag'
import * as constants from './constants';

let renderer;
let mesh;
let melt = false;

const amplitude = 30;

export let container = new THREE.Object3D();

let displacement;
let noise;

export const create = (_renderer, _camera) => {

	const geometry = new THREE.BoxBufferGeometry (2000, 2000, 2000, 10, 10, 10);

	displacement = new Float32Array(geometry.attributes.position.count);
	noise        = new Float32Array(geometry.attributes.position.count);

	for(let i = 0; i < displacement.length; i++) {
		noise[i] = (.5 - Math.random()) * amplitude;
		displacement[i] = 0;
	}

	geometry.addAttribute('displacement', new THREE.BufferAttribute(displacement, 1));

	const material = new THREE.ShaderMaterial({
		vertexShader: cubevert,
		fragmentShader: cubefrag,
		side: THREE.DoubleSide,
		wireframe: false,
		vertexColors: THREE.FaceColors,
		wireframeLinewidth: 5,
		uniforms: {
			ticks: { value: constants.ticks },
			boomTick: { value: -1 },
			melt: { value: 0 },
			melt_off_tick: { value: -1 },
			melt_transition_time: { value: constants.melt_transition_time },
			color_change_tick: { value: constants.color_change_tick },
			color_transition_time: { value: constants.color_transition_time },
			_color: new THREE.Uniform(constants.colors[constants.current_index]),
			_prev_color: new THREE.Uniform(constants.colors[constants.prev_index])
		}
	})

	mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;

	console.log(material);
	console.log(geometry);
	console.log(mesh);

	container.add(mesh);

}

export const toggle_wireframe = () => {
	mesh.material.wireframe = !mesh.material.wireframe;
	mesh.material.needsUpdate = true;
}

export const toggle_melt = () => {
	if(!melt) {
		for(let i = 0; i < displacement.length; i++) {
			displacement[i] = 0;
		}
	}
	else {
		mesh.material.uniforms.melt_off_tick.value = constants.ticks;
	}

	melt = !melt;
	mesh.geometry.attributes.displacement.needsUpdate = true;

}

export const update = dt => {

	constants.tick();
	mesh.rotation.x += 0.002;
	mesh.rotation.z += .002;

	mesh.material.uniforms.ticks.value = constants.ticks;
	mesh.material.uniforms.melt.value = melt ? 1 : 0;
	mesh.material.uniforms._color = new THREE.Uniform(constants.colors[constants.current_index]);
	mesh.material.uniforms._prev_color = new THREE.Uniform(constants.colors[constants.prev_index]);
	mesh.material.uniforms.color_change_tick.value = constants.color_change_tick;

	if(melt) {
		for(let i = 0; i < displacement.length; i++) {
			// force noise to tend towards 0 if we are near max displacement
			// alternatively if we want to super melt, we can flip the subtraction to a plus....
			// lot of shit to play around with. super melt is great
			if(Math.abs(displacement[i])/(2 * amplitude) > 0.3) {
				noise[i] +=  1.0 * (Math.random() - (amplitude + noise[i])/(2 * amplitude));
			}
			else {
				noise[i] += Math.random() - 0.5;
			}
			//noise[i] += 0.5 * (0.5 - Math.random());
			noise[i] = THREE.Math.clamp ( noise[i], -5, 5);

			displacement[i] += noise[i];
		}

		mesh.geometry.attributes.displacement.needsUpdate = true;
	}
}
