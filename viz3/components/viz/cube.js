import THREE from 'three';
import cubevert from './shaders/cube.vert'
import cubefrag from './shaders/cube.frag'

let renderer;
let mesh;
export let container = new THREE.Object3D();

export const create = (_renderer, _camera) => {

	const geometry = new THREE.BoxGeometry (2000, 2000, 2000, 10, 10, 10);

	const material = new THREE.ShaderMaterial({
		vertexShader: cubevert,
		fragmentShader: cubefrag,
		side: THREE.DoubleSide
	})

	console.log(geometry);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;

	container.add(mesh);

}
