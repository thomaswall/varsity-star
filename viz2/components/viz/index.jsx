import React, { Component } from 'react';
import disc from './disc.png'
import THREE from 'three'

import osc from 'osc-min';


var scene, camera, renderer;
var light1, light2;
var lightIntensity = 0;
var geometry, material;
var meshes = [];
var angle = Math.PI / 2;
var lags = [];
var mesh1;
var fourguys = [];
var particle_num = 500;

var bass = 0;
var change = 0;
var start_time = new Date().getTime() / 1000;
var end_time = start_time + Math.PI;

var last_bump_time = start_time;

var new_pos = [];
var final_pos = [];
for(var i = 0; i < particle_num * 3; i += 1){
  new_pos.push(0);
  final_pos.push(0);
}

var last_seen = new Array(particle_num * 3);
for(let i = 0; i < last_seen.length; i++) {
    last_seen[i] = 0;
}

var step = 0;

var vs = ["attribute float size;",
  "attribute vec3 customColor;",
  "varying vec3 vColor;",
  "void main() {",
    "vColor = customColor;",
    "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "gl_PointSize = size * ( 300.0 / -mvPosition.z );",
    "gl_Position = projectionMatrix * mvPosition;",
  "}"].join("\n");

var fs = ["uniform vec3 color;",
  "uniform sampler2D texture;",
  "varying vec3 vColor;",
  "void main() {",
    "gl_FragColor = vec4( color * vColor, 1.0 );",
    "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
    "if ( gl_FragColor.a < ALPHATEST ) discard;",
  "}"].join("\n");

export default class Viz extends Component {

  constructor(props) {
      super(props);
      this.init();
      this.animate();

      var socket = new WebSocket("ws://localhost:1337");
      socket.onmessage = (event) => {
          console.log(event.data)
          let new_d = parseInt(event.data);
          if(!isNaN(new_d)) {
              if(event.data == "Boom" && step != 2)
                this.movePoints();
              else if(new_d == 2) {
                  step = 1;
                  start_time = new Date().getTime() / 1000;
                  for(var i = 0; i < geometry.attributes.position.array.length; i++) {
                      last_seen[i] = geometry.attributes.position.array[i];
                  }
              }
              else if(new_d == 1) {
                  step = 0;
                  start_time = new Date().getTime() / 1000;
                  for(var i = 0; i < geometry.attributes.position.array.length; i++) {
                      last_seen[i] = geometry.attributes.position.array[i];
                  }
              }
              else if(new_d == 3) {
                  step = 2;
                  start_time = new Date().getTime() / 1000;
                  for(var i = 0; i < geometry.attributes.position.array.length; i++) {
                      last_seen[i] = geometry.attributes.position.array[i];
                  }
              }
              else if(event.data == "Scatter")
                this.bridgeMove();
              else if(new_d == 4) {
                  this.fadePos();
                  step = 3;
                  start_time = new Date().getTime() / 1000;
                  for(var i = 0; i < geometry.attributes.position.array.length; i++) {
                      last_seen[i] = geometry.attributes.position.array[i];
                  }
              }

          }
      }

    //   setInterval(() => {
    //     if(step != 2)
    //         this.movePoints();
    //     else
    //         this.bridgeMove()
    // }, 5000);

    //   setInterval(() => {
    //       step += 1;
    //       start_time = new Date().getTime() / 1000;
    //       for(var i = 0; i < geometry.attributes.position.array.length; i++) {
    //           last_seen[i] = geometry.attributes.position.array[i];
    //       }
    //       this.fadePos();
    //   }, 10000);
  }

  movePoints = () => {
    for(var i = 0; i < geometry.attributes.position.array.length; i += 1){
      new_pos[i] = Math.random()*10 - 5;
    }
    bass = 2;
    last_bump_time = new Date().getTime() / 1000;
    end_time = last_bump_time + Math.PI;
  }

  bridgeMove = () => {
      for(var i = 0; i < geometry.attributes.position.array.length; i += 1){
        new_pos[i] = Math.random()*50 - 25;
      }
      bass = 1;
      last_bump_time = new Date().getTime() / 1000;
      end_time = last_bump_time + Math.PI;
  }

  fadePos = () => {
      let pos = 1;
      for(var i = 0; i < geometry.attributes.position.array.length; i += 1){
        pos = (Math.random() < 0.5 ? -1 : 1);
        final_pos[i] = pos*100 + pos*Math.random()*10;
      }
  }

  init = () => {

    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0xffffff );

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 0, 0);
    //camera.lookAt(new THREE.Vector3(0, 0, 100));

    var positions = new Float32Array( particle_num * 3 );
    var colors = new Float32Array( particle_num * 3 );
    var sizes = new Float32Array( particle_num * 3 );

    for(var i = 0; i < particle_num; i ++ ) {
      lags.push({lag1: Math.random(), lag2: Math.random()});
    }

    var vertex;
    var color = new THREE.Color();

    for ( var i = 0, l = particle_num; i < l; i ++ ) {
      vertex = new THREE.Vector3(0, 0, -50);
      vertex.toArray( positions, i * 3 );
      color.setHSL( 0.9, 1.0, 0.75 )
      color.toArray( colors, i * 3 );
      sizes[ i ] = 1.5;
    }

    geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

    material = new THREE.ShaderMaterial( {
      uniforms: {
        color:   { value: new THREE.Color( 0xffffff ) },
        texture: { value: new THREE.TextureLoader().load( disc ) }
      },
      vertexShader: vs,
      fragmentShader: fs,
      alphaTest: 0.9,
    } );

    var particles = new THREE.Points( geometry, material );
    scene.add( particles );

    //lights
    light1 = new THREE.PointLight( 0x9975B9, 100, 0 );
    light1.position.set( 800, 0, -500 );
    light2 = new THREE.PointLight( 0x551A8B, 100, 0 );
    light2.position.set( -800, 0, -500 );
    light1.power = 20;
    light2.power = 20;

    scene.add(light1);
    scene.add(light2);

    var geometry1 = new THREE.DodecahedronGeometry( 100, 0 );
    var material1 = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0x111111, shininess: 50, shading: THREE.FlatShading });

    var four_geometry = new THREE.TetrahedronGeometry( 25, 0 );
    var four_material = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0x111111, shininess: 50, shading: THREE.FlatShading });

    for(var i = 0; i < 4; i++) {
        fourguys.push(new THREE.Mesh( four_geometry, four_material));
        fourguys[i].position.z = -500;
        scene.add(fourguys[i]);
    }


    mesh1 = new THREE.Mesh( geometry1, material1 );
    mesh1.position.z = -500;
    scene.add( mesh1 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

  }

  phase1 = (time) => {
      mesh1.position.z = -500;
      if(time - last_bump_time > (end_time - last_bump_time)/5) {
        bass = 0;
      }

      change = Math.sin(((time - last_bump_time) * 5) % Math.PI) * bass;


      angle += Math.PI / 128;
      geometry.attributes.position.array[0] = -10000;
      geometry.attributes.position.array[1] = -10000;
      var leader = {x: geometry.attributes.position.array[0], y: geometry.attributes.position.array[1]};

      var j = 1;
      for(var i = 3; i < geometry.attributes.position.array.length; i += 3){
        geometry.attributes.position.array[i] = Math.cos(angle - lags[j-1].lag1) * (20 + Math.cos(time * lags[j-1].lag2) + new_pos[i] * change);
        geometry.attributes.position.array[i + 1] = Math.sin(angle - lags[j-1].lag1) * (20 + new_pos[i + 1] * change);
        geometry.attributes.position.array[i + 2] = change != 0 ? -50 + new_pos[i + 2] * change : -50;

        j += 1;
      }

      for(var i = 0; i < geometry.attributes.position.array.length; i++) {
          last_seen[i] = geometry.attributes.position.array[i];
      }


  }

  phase2 = (time) => {

      if(time - last_bump_time > (end_time - last_bump_time)/5) {
        bass = 0;
      }
      change = Math.sin(((time - last_bump_time) * 5) % Math.PI) * bass;


      var transition = (time - start_time) / 3;
      if(transition > 1) {
          transition = 1;
      }

      var j = 1;
      var k = 0;
      for(var i = 0; i < geometry.attributes.position.array.length; i += 3){

        let wave = Math.sin((time + k * 2 / particle_num) % (Math.PI*1)) * 3;
        geometry.attributes.position.array[i] = (-30 + (k % (particle_num / 5) * (60 / particle_num * 5)) - last_seen[i]) * transition + last_seen[i];
        geometry.attributes.position.array[i + 1] = ((-15 + (j - 1) / 4 * 30) - last_seen[i + 1]) * transition + last_seen[i + 1] + wave;
        geometry.attributes.position.array[i + 2] = -50;

        k += 1;
        if(k >=  particle_num / 5 * j) {
            j += 1;
        }
      }

      for(var i = 0; i < 4; i++) {
          fourguys[i].position.x = (i % 2 == 0 ? -200: 200) * transition;
          fourguys[i].position.y = (i < 2 ? -100  : 100) * transition;
          fourguys[i].position.z = -500 + 50*change;
      }
  }

  phase3 = (time) => {
      let transition = (time - start_time) / 3;
      if(transition > 1) {
          transition = 1;
      }

      if(time - last_bump_time > 4) {
        bass = 0;
      }

      change = Math.sin((time - last_bump_time)/4 * Math.PI) * bass;

      var j = 1;
      var k = 0;
      for(var i = 0; i < geometry.attributes.position.array.length; i += 3){

        let wave = Math.sin((time + k * 2 / particle_num) % (Math.PI*1)) * 6;
        geometry.attributes.position.array[i] = ((-30 + (j - 1) / 4 * 60) - last_seen[i]) * transition + last_seen[i] + new_pos[i] * change;
        geometry.attributes.position.array[i + 1] = (-40 + (k % (particle_num / 5) * (80 / particle_num * 5)) - last_seen[i + 1]) * transition + last_seen[i + 1]  + wave + new_pos[i+1] * change;
        geometry.attributes.position.array[i + 2] = -50;

        k += 1;
        if(k >=  particle_num / 5 * j) {
            j += 1;
        }
      }

      for(var i = 0; i < 4; i++) {
          fourguys[i].position.x = (i % 2 == 0 ? -200: 200) + transition*400;
          fourguys[i].position.y = (i < 2 ? -100  : 100) + transition*400;
          fourguys[i].position.z = -500 + 50*change;
      }
  }

  fadePhase = (time) => {
      let transition = (time - start_time) / 100;
      if(transition > 1) {
          transition = 1;
      }

      for(var i = 0; i < geometry.attributes.position.array.length; i += 3){
        geometry.attributes.position.array[i] = last_seen[i] + final_pos[i] * transition + new_pos[i];
        geometry.attributes.position.array[i + 1] = last_seen[i + 1]  + final_pos[i+1] * transition + new_pos[i+1];
        geometry.attributes.position.array[i + 2] = -50;
      }
  }

  animate = () => {
    var time = new Date().getTime() / 1000;

    if(step == 0) {
        this.phase1(time);
    }
    else if(step == 1){
        this.phase2(time);
        mesh1.position.z = -500 + (time - start_time) * 500;
    }
    else if(step == 2){
        this.phase3(time);
    }
    else if(step == 3){
        this.fadePhase(time);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;


    requestAnimationFrame( this.animate );

    mesh1.rotation.x += 0.01;
    mesh1.rotation.y += 0.02;

    for(var guy of fourguys) {
        guy.rotation.x += 0.01;
        guy.rotation.y += 0.02;
    }

    renderer.render( scene, camera );
  }


  render() {
    return <div></div>;
  }
}
