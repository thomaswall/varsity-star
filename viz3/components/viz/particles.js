import THREE from 'three';
import glslify from 'glslify';
import simulate from './simulate.js';
import shaderParse from './parse.js';
import MeshMotionMaterial from './postprocessing/MeshMotionMaterial';

import trianglesMotion from './shaders/trianglesMotion.vert';
import triangles from './shaders/triangles.vert';
import trianglesFrag from './shaders/triangles.frag';
import trianglesDistance from './shaders/trianglesDistance.vert';
import trianglesDistanceFrag from './shaders/trianglesDistance.frag';

let amountDim = 1024;

let renderer;
let container;
let mesh;

let color1;
let color2;

let init = (_renderer, _camera) => {
	renderer = _renderer;

	container = exports.container = new THREE.Object3D();

	color1 = new THREE.Color('#ffffff');
	color2 = new THREE.Color('#ffffff');

	mesh = createTriangleMesh(_camera);
}

let createTriangleMesh = (_camera) => {
	let position = new Float32Array(amountDim * amountDim * 3 * 3);
	let positionFlip = new Float32Array(amountDim * amountDim * 3 * 3);
	let fboUV = new Float32Array(amountDim * amountDim * 2 * 3);

 	let PI = Math.PI;
    let angle = PI * 2 / 3;
    let angles = [
        Math.sin(angle * 2 + PI),
        Math.cos(angle * 2 + PI),
        Math.sin(angle + PI),
        Math.cos(angle + PI),
        Math.sin(angle * 3 + PI),
        Math.cos(angle * 3 + PI),
        Math.sin(angle * 2),
        Math.cos(angle * 2),
        Math.sin(angle),
        Math.cos(angle),
        Math.sin(angle * 3),
        Math.cos(angle * 3)
    ]
    let i6, i9;
    for(let i = 0; i < amountDim * amountDim; i++ ) {
        i6 = i * 6;
        i9 = i * 9;
        if(i % 2) {
            position[ i9 + 0] = angles[0];
            position[ i9 + 1] = angles[1];
            position[ i9 + 3] = angles[2];
            position[ i9 + 4] = angles[3];
            position[ i9 + 6] = angles[4];
            position[ i9 + 7] = angles[5];

            positionFlip[ i9 + 0] = angles[6];
            positionFlip[ i9 + 1] = angles[7];
            positionFlip[ i9 + 3] = angles[8];
            positionFlip[ i9 + 4] = angles[9];
            positionFlip[ i9 + 6] = angles[10];
            positionFlip[ i9 + 7] = angles[11];
        } else {
            positionFlip[ i9 + 0] = angles[0];
            positionFlip[ i9 + 1] = angles[1];
            positionFlip[ i9 + 3] = angles[2];
            positionFlip[ i9 + 4] = angles[3];
            positionFlip[ i9 + 6] = angles[4];
            positionFlip[ i9 + 7] = angles[5];

            position[ i9 + 0] = angles[6];
            position[ i9 + 1] = angles[7];
            position[ i9 + 3] = angles[8];
            position[ i9 + 4] = angles[9];
            position[ i9 + 6] = angles[10];
            position[ i9 + 7] = angles[11];
        }

		fboUV[ i6 + 0] = fboUV[ i6 + 2] = fboUV[ i6 + 4] = (i % amountDim) / amountDim;
        fboUV[ i6 + 1 ] = fboUV[ i6 + 3 ] = fboUV[ i6 + 5 ] = ~~(i / amountDim) / amountDim;
	}

	let geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ));
    geometry.addAttribute( 'positionFlip', new THREE.BufferAttribute( positionFlip, 3 ));
    geometry.addAttribute( 'fboUV', new THREE.BufferAttribute( fboUV, 2 ));

	let material = new THREE.ShaderMaterial({
		uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.shadowmap,
            {
                texturePosition: { type: 't', value: undefined },
                flipRatio: { type: 'f', value: 0 },
                color1: { type: 'c', value: undefined },
                color2: { type: 'c', value: undefined },
                cameraMatrix: { type: 'm4', value: undefined }
            }
        ]),
		vertexShader: shaderParse(triangles),
	    fragmentShader: shaderParse(trianglesFrag),
	    blending: THREE.NoBlending
	});

	material.uniforms.color1.value = color1;
	material.uniforms.color2.value = color2;
	material.uniforms.cameraMatrix.value = _camera.matrixWorld;

	let _mesh = new THREE.Mesh(geometry, material);
	_mesh.customDistanceMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            lightPos: { type: 'v3', value: new THREE.Vector3( 0, 0, 0 ) },
            texturePosition: { type: 't', value: undefined },
            flipRatio: { type: 'f', value: 0 }
        },
        vertexShader: shaderParse(trianglesDistance),
        fragmentShader: shaderParse(trianglesDistanceFrag),
        depthTest: true,
        depthWrite: true,
        side: THREE.BackSide,
        blending: THREE.NoBlending
    });

	_mesh.motionMaterial = new MeshMotionMaterial({
		uniforms: {
            texturePosition: { type: 't', value: undefined },
            texturePrevPosition: { type: 't', value: undefined },
            flipRatio: { type: 'f', value: 0 }
        },
        vertexShader: shaderParse(trianglesMotion),
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending
	});

	_mesh.castShadow = true;
    _mesh.receiveShadow = true;
    container.add(_mesh);

    return _mesh;

}

let update = dt => {
    mesh.material.uniforms.texturePosition.value = simulate.positionRenderTarget.texture;
    mesh.customDistanceMaterial.uniforms.texturePosition.value = simulate.positionRenderTarget.texture;
    mesh.motionMaterial.uniforms.texturePrevPosition.value = simulate.prevPositionRenderTarget.texture;
    if(mesh.material.uniforms.flipRatio ) {
        mesh.material.uniforms.flipRatio.value ^= 1;
        mesh.customDistanceMaterial.uniforms.flipRatio.value ^= 1;
        mesh.motionMaterial.uniforms.flipRatio.value ^= 1;
    }
}

exports.container = container;
exports.init = init;
exports.update = update;
