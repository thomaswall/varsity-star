import React, { Component } from 'react';
import THREE from 'three'
import simulate from './simulate.js'
import particles from './particles.js'
import OrbitControls from './controls.js';

let scene, camera, renderer, control;
let last_time = Date.now();
let dt;

export default class Viz extends Component {

  constructor(props) {
      super(props);
      this.init();
      this.animate();
  }

  init = () => {


    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#343434");
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.001);

    camera = new THREE.PerspectiveCamera(45, 1, 10, 3000);
    camera.position.set(300, 60, 300).normalize().multiplyScalar(1000);
    console.log(camera.position);

    simulate.init(renderer);
    particles.init(renderer, camera);
    scene.add(particles.container);

    control = new OrbitControls( camera, renderer.domElement );
    control.target.y = 50;
    control.maxDistance = 1000;
    control.minPolarAngle = 0.3;
    control.maxPolarAngle = Math.PI / 2 - 0.1;
    control.noPan = true;
    control.update();
}

  animate = () => {
    dt = Date.now() - last_time;
    last_time = Date.now();

    renderer.setClearColor("#343434");
    camera.updateMatrixWorld();
    simulate.update(dt);
    particles.update(dt);

    renderer.render( scene, camera );
    requestAnimationFrame( this.animate );
  }


  render() {
    return <div></div>;
  }
}