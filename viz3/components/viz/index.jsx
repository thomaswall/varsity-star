import React, { Component } from 'react';
import THREE from 'three'
import simulate from './simulate.js'
import particles from './particles.js'
import * as cube from './cube'
import OrbitControls from './controls.js';
import constants from './constants.js';

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
    //camera.position.set(300, 60, 300).normalize().multiplyScalar(1000);
    camera.position.set(0, 0, 700);
    console.log(camera.position);


    for(let i = 0; i < 10; i++) {
      simulate.create(renderer);
      particles.create(renderer, camera);
    }
    cube.create(renderer, camera);

    scene.add(particles.container);
    scene.add(cube.container);

    control = new OrbitControls( camera, renderer.domElement );
    control.target.y = 50;
    control.maxDistance = 1000;
    control.minPolarAngle = 0.3;
    control.maxPolarAngle = Math.PI / 2 - 0.1;
    control.noPan = true;
    console.log(camera.position)
    
    control.update();
}

  animate = () => {
    dt = Date.now() - last_time;
    last_time = Date.now();

    renderer.setClearColor("#343434");
    camera.updateMatrixWorld();
    simulate.update(dt);
    particles.update(dt);
    cube.update(dt);

    renderer.render( scene, camera );
    requestAnimationFrame( this.animate );
  }

  componentWillMount = () => {
    document.addEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = event => {
    let key = event.keyCode;
    console.log(key);

    if(key == 13) // enter
      constants.particleRestart = Date.now();

    if(key == 77) { // m for MELT
      cube.toggle_melt();
    } 
  }


  render() {
    return <div></div>;
  }
}
