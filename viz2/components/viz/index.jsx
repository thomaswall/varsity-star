import React, { Component } from 'react';
import disc from './disc.png'
import THREE from 'three'

import osc from 'osc-min';


var scene, camera, renderer;
var geometry, material;
var meshes = [];
var angle = Math.PI / 2;
var lags = [];
var mesh1;
var particle_num = 100;

var bass = 0;
var change = 0;
var start_time = new Date().getTime() / 1000;
var end_time = start_time + Math.PI;

var new_pos = [];
for(var i = 0; i < particle_num * 3; i += 1){
  new_pos.push(0);
}

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

      var socket = new WebSocket("ws://127.0.0.1:1337");
      socket.onmessage = function (event) {
          console.log(event.data)
          let new_d = parseInt(event.data);
          if(!isNaN(new_d)) {
              bass = new_d;
              start_time = new Date().getTime() / 1000;
              end_time = start_time + Math.PI;
          }
      }

      setInterval(() => {
        for(var i = 0; i < geometry.attributes.position.array.length; i += 1){
          new_pos[i] = Math.random()*10 - 5;
        }
        //console.log(new_pos)
        bass = 2;
        start_time = new Date().getTime() / 1000;
        end_time = start_time + Math.PI;
      }, 1000);
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
    //var lightSphere = new THREE.SphereGeometry(0.5, 16, 8);
    var light1 = new THREE.PointLight( 0x9975B9, 100, 0 );
    light1.position.set( 800, 0, -500 );
    var light2 = new THREE.PointLight( 0x551A8B, 100, 0 );
    light2.position.set( -800, 0, -500 );
    // var light3 = new THREE.PointLight( 0x00ff00, 100, 0 );
    // light3.position.set( 0, 0, -200 );
    //light.add(new THREE.Mesh(lightSphere), new THREE.MeshBasicMaterial({color:0xff0040 }));
    light1.power = 20;
    light2.power = 20;
    //light3.power = 20;

    scene.add( light1);
    scene.add(light2);
    //scene.add(light3);

    var lite  = THREE.AmbientLight(0xffffff, 1.0);
    scene.add(lite);

    //fog
    //scene.fog = new THREE.FogExp2(0xff0040, 2);


    var geometry1 = new THREE.DodecahedronGeometry( 100, 0 );
    var material1 = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0x111111, shininess: 50, shading: THREE.FlatShading });

    mesh1 = new THREE.Mesh( geometry1, material1 );
    mesh1.position.z = -500;
    scene.add( mesh1 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

  }

  animate = () => {

    var time = new Date().getTime() / 1000;
    if(time - start_time > (end_time - start_time)/5) {
      bass = 0;
    }

    change = Math.sin(((time - start_time) * 5) % Math.PI) * bass;
    console.log(change)


    angle += Math.PI / 128;
    geometry.attributes.position.array[0] = -10000;
    geometry.attributes.position.array[1] = -10000;
    var leader = {x: geometry.attributes.position.array[0], y: geometry.attributes.position.array[1]};

    var j = 1;
    for(var i = 3; i < geometry.attributes.position.array.length; i += 3){
      // geometry.attributes.position.array[i] = Math.cos(angle - lags[j-1].lag1) * (20 + Math.cos(time * lags[j-1].lag2) + change);
      // geometry.attributes.position.array[i + 1] = Math.sin(angle - lags[j-1].lag1) * (20 + change);
      geometry.attributes.position.array[i] = Math.cos(angle - lags[j-1].lag1) * (20 + Math.cos(time * lags[j-1].lag2) + new_pos[i] * change);
      geometry.attributes.position.array[i + 1] = Math.sin(angle - lags[j-1].lag1) * (20 + new_pos[i + 1] * change);
      geometry.attributes.position.array[i + 2] = change != 0 ? -50 + new_pos[i + 2] * change : -50;

      j += 1;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;



      requestAnimationFrame( this.animate );

    mesh1.rotation.x += 0.01;
    mesh1.rotation.y += 0.02;

    renderer.render( scene, camera );
  }


  render() {
    return <div></div>;
  }
}
