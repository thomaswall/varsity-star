import React, { Component } from 'react';
import THREE from 'three'
import simulate from './simulate.js'
import particles from './particles.js'
import * as cube from './cube'
import OrbitControls from './controls.js';
import * as constants from './constants.js';

let scene, camera, renderer, control;
let last_time = Date.now();
let dt;
let spin = false;
let last_spin;

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

    window.onresize = () => renderer.setSize(window.innerWidth, window.innerHeight);

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
    let time = Date.now();
    dt = time - last_time;
    if(spin)
      camera.up = new THREE.Vector3(Math.cos(time * 0.001), Math.sin(time * 0.001), 0);
    last_time = Date.now();

    renderer.setClearColor("#343434");
    camera.updateMatrixWorld();
    simulate.update(dt);
    particles.update(dt);
    cube.update(dt);
    control.update();

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

    if(key == 87) { // w for wireframe
      cube.toggle_wireframe();
    }

    if(key == 67) { // c for color
      constants.set_color(constants.current_index + 1)
    }

    if(key == 84) { // t for texture
      cube.toggle_tex();
    }
    
    if(key == 78) {
      simulate.create(renderer);
      particles.create(renderer, camera);
      constants.particleRestart = Date.now();
    }

    if(key == 68) {
      simulate.deleteIt();
      particles.deleteIt();
    }

    if(key == 37) { // left arrow
      constants.cube_y_rotation -= 0.001;
    }
    if(key == 38) { // up arrow
      constants.cube_x_rotation -= 0.001;
    }
    if(key == 39) { // right arrow
      constants.cube_y_rotation += 0.001;
    } 
    if(key == 40) { // down arrow
      constants.cube_x_rotation += 0.001;
    }

    if(key == 49)
      constants.phase = 0;
    if(key == 50)
      constants.phase = 1;
    
    if(key == 82)
      control.rotateLeft(-Math.PI / 4);
    
    if(key == 83) {
      last_spin = camera.up;
      spin = !spin;
    }
  }


  render() {
    return <div></div>;
  }
}
