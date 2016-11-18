import React, { Component } from 'react';
import disc from './disc.png'
import THREE from 'three'


var scene, camera, renderer;
var geometry, material;
var meshes = [];
var angle = Math.PI / 2;
var lags = [];

var PORT = 2346;
var HOST = '192.168.0.2';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
console.log(remote);
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);

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
  }

  init = () => {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 10000 );
    camera.position.set( 0, 0, 20 );
    //camera.lookAt(new THREE.Vector3(0, 0, 100));

    var particle_num = 100;
    var positions = new Float32Array( particle_num * 3 );
    var colors = new Float32Array( particle_num * 3 );
    var sizes = new Float32Array( particle_num * 3 );

    for(var i = 0; i < particle_num; i ++ ) {
      lags.push({lag1: Math.random(), lag2: Math.random()});
    }

    var vertex;
    var color = new THREE.Color();

    for ( var i = 0, l = particle_num; i < l; i ++ ) {
      if(i < 20)
        vertex = new THREE.Vector3(-30, 10 - i%20, -50);
      else if(i < 40)
        vertex = new THREE.Vector3(-20, 20 - i%20, -50);
      else if(i < 60)
        vertex = new THREE.Vector3(0, 10 - i%20, -50);
      else if(i < 80)
        vertex = new THREE.Vector3(20, 40 - i%20, -50);
      else
        vertex = new THREE.Vector3(30, 10 - i%20, -50);

      vertex.toArray( positions, i * 3 );
      color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 )
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

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

  }

  animate = () => {
    angle += Math.PI / 128;
    geometry.attributes.position.array[0] = Math.cos(angle)* 20;
    geometry.attributes.position.array[1] = Math.sin(angle) * 20;
    var leader = {x: geometry.attributes.position.array[0], y: geometry.attributes.position.array[1]};
    var time = new Date().getTime() / 1000;

    var j = 1;
    for(var i = 3; i < geometry.attributes.position.array.length; i += 3){
      geometry.attributes.position.array[i] = Math.cos(angle - lags[j-1].lag1) * (20 + Math.cos(time * lags[j-1].lag2));
      geometry.attributes.position.array[i + 1] = Math.sin(angle - lags[j-1].lag1) * (20);// + Math.cos(time * lags[j-1].lag2));

      j += 1;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;


      renderer.render( scene, camera );
      requestAnimationFrame( this.animate );
  }


  render() {
    return <div></div>;
  }
}
