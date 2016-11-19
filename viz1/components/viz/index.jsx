import React, { Component } from 'react';
import brownstone from './brownstone.jpg'
import THREE from 'three'


var scene, camera, renderer;
var geometry, material;
var meshes = [];

export default class Viz extends Component {

  constructor(props) {
      super(props);
      this.init();
      this.animate();

      var socket = new WebSocket("ws://127.0.0.1:1337");
      socket.onmessage = function (event) {
        //   let new_d = parseInt(event.data);
        //   if(!isNaN(new_d)) {
        //       bass = new_d;
        //   }
        console.log(event.data);
      }
  }

  generateTexture = () => {
    var canvas = document.createElement( 'canvas' );
    canvas.width = 512;
    canvas.height = 512;
    var context = canvas.getContext( '2d' );
    for ( var i = 0; i < 20000; i ++ ) {
      context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 500 ) + '%)';
      context.beginPath();
      context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
      context.fill();
    }
    context.globalAlpha = 0.075;
    context.globalCompositeOperation = 'lighter';
    return canvas;
  }

  init = () => {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 10000 );
    camera.position.set( 0, 0, -4000 );
    //camera.lookAt(new THREE.Vector3(0, 0, -4000));

    var texture = new THREE.CanvasTexture( this.generateTexture() );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 160, 160 );

      for(var i = 0; i < 30; i++) {

        var material = new THREE.MeshBasicMaterial( {
            color: new THREE.Color().setHSL( 0.3, 0.75, ( i / 30 ) * 0.4 + 0.1 ),
            map: texture,
            transparent: true
          } );

        var plane = new THREE.PlaneBufferGeometry( 100000, 100000, 10, 10 );
        var plane_mesh = new THREE.Mesh(plane, material);
        //plane_mesh.position.x = 1000;
        plane_mesh.position.y = -150 + i * 0.5;
        plane_mesh.rotation.x = -1.57;
        plane_mesh.position.z = -40000;
        scene.add(plane_mesh);
      }

    var texture_loader = new THREE.TextureLoader;
    texture_loader.crossOrigin = '';
    var building_texture = texture_loader.load(brownstone);
    var materials = [];
    for(var i =0;i < 6;i++) {
      materials.push(new THREE.MeshBasicMaterial( {map: building_texture} ));
    }
    materials[2] = new THREE.MeshBasicMaterial( {color: 0x000000} );
    materials[3] = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var material = new THREE.MultiMaterial(materials);
    var geometry = new THREE.BoxGeometry( 100, 200, 100 );

    for(var i = 0; i < 1000; i ++ ) {
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 800 - 400;
      mesh.position.y = Math.random() * 800 - 400;
      mesh.position.z = -Math.random() * 80000;
      meshes.push(mesh);
      scene.add( mesh );
    }

    renderer = new THREE.WebGLRenderer();
    renderer.sortObjects = false;
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

  }

  animate = () => {
    requestAnimationFrame( this.animate );

    for(let i = 0; i < 1000; i ++ ) {
      meshes[i].rotation.x += Math.random()/100;
      meshes[i].rotation.y += Math.random()/100;
      meshes[i].rotation.z += Math.random()/100;
    }
    camera.position.z -= 10;


    renderer.render( scene, camera );
  }


  render() {
    return <div></div>;
  }
}
