import React, { Component } from 'react';
import brownstone from './brownstone.jpg'
import waterNormal from './waternormals.jpg';
import sky from './sky.png';
import THREE from 'three'
var EffectComposer = require('three-effectcomposer')(THREE)
import Film from './film.js';
import Pixelate from './pixelate.js';
import './mirror.js';
import './water.js';
import './plyloader.js';
import roman from './roman.png';
import michel from './michelangelo.png';
import vhs from './vhs.png';
import windows from './windows.png';

var dolphin;
var dolphinLoaded = false;


var scene, camera, renderer;
var geometry, material;
var meshes = [];
var busts = [];
var bust_xs = [];

var water;
var start_time = new Date().getTime() / 1000;
var transition_times = [96, 105,16];//[96,105,16];
var step = 0;

var last_sound = start_time;
var last_rotate = start_time - 1.4;
var last_bump_time = start_time;
var backgroundScene, backgroundCamera;
var ma_geo;
var box_geo;
var uniforms;

export default class Viz extends Component {

  constructor(props) {
      super(props);
      this.init();
      this.animate();

      this.composer;

      var socket = new WebSocket("ws://192.168.0.9:1337");
      socket.onmessage = (event) => {
          console.log(event.data);
          let new_d = parseInt(event.data);
          if(!isNaN(new_d)) {
              if(new_d == 82)
                last_sound = new Date().getTime() / 1000;
              if(new_d == 80 || new_d == 73 || new_d == 76 || new_d ==68)
                last_rotate = new Date().getTime() / 1000;
              if(new_d == 60) {
                last_bump_time = new Date().getTime() / 1000;
                if(step == 2) {
                    uniforms.pixelCount.value -= uniforms.pixelCount.value / 10;
                }
              }
          }
      }

    //   setInterval(() => {
    //     last_bump_time = new Date().getTime() / 1000;
    //     if(step == 2) {
    //         uniforms.pixelCount.value /= 2;
    //         console.log(uniforms.pixelCount.value);
    //     }
    // }, 2000);
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

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 50000 );
    camera.position.set( 0, 0, 0 );
    scene.background = new THREE.Color( 0.93, 0.82, 0.93 );

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
      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 1600 - 800;
      mesh.position.y = Math.random() * 800 - 400;
      mesh.position.z = -Math.random() * 80000;
      meshes.push(mesh);
      scene.add( mesh );
    }

    renderer = new THREE.WebGLRenderer();
    renderer.sortObjects = false;
    renderer.setSize( window.innerWidth, window.innerHeight );

    //water

    scene.add( new THREE.AmbientLight( 0x444444 ) );
		var light = new THREE.DirectionalLight( 0xffffbb, 1 );
		light.position.set( - 1, 1, - 1 );
		scene.add( light );

    var waterNormals = new THREE.TextureLoader().load( waterNormal );
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    water = new THREE.Water( renderer, camera, scene, {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: waterNormals,
		alpha: 	1.0,
		sunDirection: light.position.clone().normalize(),
		sunColor: 0xffffff,
		waterColor: 0x001e0f,
		distortionScale: 50.0,
	} );

    var mirrorMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 200 * 500, 200 * 550 ),
		water.material
	);

    mirrorMesh.position.y = -150;
    mirrorMesh.position.z = -140000;

    mirrorMesh.add( water );

	mirrorMesh.rotation.x = - Math.PI * 0.5;
	scene.add( mirrorMesh );

    var cubeMap = new THREE.CubeTexture( [] );
	cubeMap.format = THREE.RGBFormat;
	var loader = new THREE.ImageLoader();
	loader.load( sky, function ( image ) {
		var getSide = function ( x, y ) {
			var size = 1024;
			var canvas = document.createElement( 'canvas' );
			canvas.width = size;
			canvas.height = size;
			var context = canvas.getContext( '2d' );
			context.drawImage( image, - x * size, - y * size );
			return canvas;
		};
		cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
		cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
		cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
		cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
		cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
		cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
		cubeMap.needsUpdate = true;
	} );
	var cubeShader = THREE.ShaderLib[ 'cube' ];
	cubeShader.uniforms[ 'tCube' ].value = cubeMap;
	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: cubeShader.fragmentShader,
		vertexShader: cubeShader.vertexShader,
		uniforms: cubeShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} );
	var skyBox = new THREE.Mesh(
		new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
		skyBoxMaterial
	);
	scene.add( skyBox );

    //dolpins
    var loader = new THREE.PLYLoader();
    loader.load( "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/ply/ascii/dolphins.ply", function ( geometry ) {
		geometry.computeVertexNormals();
		var material = new THREE.MeshStandardMaterial( { color: 0xff69b4} );
		dolphin = new THREE.Mesh( geometry, material );
		dolphin.position.y = 100;
		dolphin.position.z =  -92000;
		dolphin.position.x = 0;
        dolphin.rotation.x = - Math.PI / 2;
        dolphin.rotation.z =  - Math.PI / 2;
		dolphin.scale.multiplyScalar( 1 );
		dolphin.castShadow = true;
		//mesh.receiveShadow = true;
		scene.add( dolphin );
        dolphinLoaded = true;
	} );

    let roman_texture = texture_loader.load(roman);
    let bust_plane = new THREE.PlaneGeometry(400, 540);
    THREE.Pixelate.uniforms.Texture = {type: 't', value: roman_texture};
    THREE.Pixelate.uniforms.pixelCount.value = 1024.0;
    let bust_material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: THREE.Pixelate.uniforms,
        vertexShader: THREE.Pixelate.vertexShader,
        fragmentShader: THREE.Pixelate.fragmentShader,
        depthWrite: false
    });

    for(let i = 0; i < 1000; i ++) {
        let bust_geo = new THREE.Mesh(bust_plane, bust_material);
        bust_geo.position.z = -93000 - Math.random()*100000;
        bust_geo.position.y = Math.random() * 1000;
        bust_geo.position.x = -10000 * (1 - i / 100);
        bust_xs.push(bust_geo.position.x);
        bust_geo.rotation.y = Math.PI / 2;
        busts.push(bust_geo);
        scene.add(bust_geo);
    }

    //michelangelo
    let ma = texture_loader.load(michel);
    uniforms = {...THREE.Pixelate.uniforms};
    uniforms.Texture = {type: 't', value: ma};
    uniforms.pixelCount.value = 5000.0;
    let ma_plane = new THREE.PlaneGeometry(400, 1000);
    let ma_material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: uniforms,
        vertexShader: THREE.Pixelate.vertexShader,
        fragmentShader: THREE.Pixelate.fragmentShader,
        depthWrite: false
    });

    ma_geo = new THREE.Mesh(ma_plane, ma_material);
    ma_geo.position.z = -191500;
    ma_geo.position.y = 100;
    ma_geo.position.x = 2000;
    scene.add(ma_geo);

    let windows_tex = texture_loader.load(windows);
    let box_it = new THREE.BoxGeometry(150, 300, 300);
    let box_materials = [];
    for(var i =0;i < 6;i++) {
      box_materials.push(new THREE.MeshBasicMaterial( {color: 0x806580} ));
    }

    THREE.CThru.uniforms = {"color": { type: "c", value: new THREE.Color( 0x806580 ) }, "texture": {type: "t", value: windows_tex}};
    box_materials[0] = new THREE.ShaderMaterial( {
        uniforms: THREE.CThru.uniforms,
        vertexShader: THREE.CThru.vertexShader,
        fragmentShader: THREE.CThru.fragmentShader,
    });
    box_materials[1] = new THREE.ShaderMaterial( {
        uniforms: THREE.CThru.uniforms,
        vertexShader: THREE.CThru.vertexShader,
        fragmentShader: THREE.CThru.fragmentShader,
    });
    let box_material = new THREE.MultiMaterial(box_materials);
    box_geo = new THREE.Mesh(box_it, box_material);
    box_geo.position.z = ma_geo.position.z - 200;
    box_geo.position.y = 0;
    box_geo.position.x = 2025;
    box_geo.scale.x = 0;
    box_geo.scale.y = 0;
    box_geo.scale.z = 0;
    scene.add(box_geo);

    renderer.setClearColor( 0xffffff, 0);
    document.body.appendChild( renderer.domElement );

    var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 0),
        new THREE.MeshBasicMaterial({
            map: windows_tex
    }));

    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;

    // Create your background scene
    backgroundScene = new THREE.Scene();
    backgroundCamera = new THREE.Camera();
    backgroundScene .add(backgroundCamera );
    backgroundScene .add(backgroundMesh );

    this.initPostprocessing();
  }

  rotateBuildings = (time) => {
      for(var i = 0; i < 1000; i ++ ) {
        meshes[i].rotation.y -= 0.1;
        meshes[i].rotation.x -= 0.1;
        meshes[i].rotation.z -= 0.1;
      }
  }

  bumpBusts = (time) => {
      let bass = 1;
      if(time - last_bump_time > 0.2)
        bass = 0;
      let change = Math.sin((time - last_bump_time)/0.2 * Math.PI) * bass;
      for(let i = 0; i < 1000; i ++) {
          busts[i].scale.x = 1 + 0.5*change;
          busts[i].scale.y = 1 + 0.5*change;
      }

  }

  initPostprocessing = () => {
      var amount = 0.0;
      var grayscaleIntensity = 0.0
      if (this.composer) {
          amount = this.composer.passes[2].uniforms.amount.value;
          grayscaleIntensity = this.composer.passes[1].uniforms['grayscaleIntensity'].value;
      }
      this.composer = new EffectComposer(renderer);
      this.composer.addPass(new EffectComposer.RenderPass(scene, camera));

      let film = new EffectComposer.ShaderPass( THREE.Film );

      film.uniforms['noiseIntensity'].value = 0.7;
      film.uniforms['grayscaleIntensity'].value = grayscaleIntensity;

      film.uniforms['scanlineIntensity'].value = 0.5;
      film.uniforms['scanlineCount'].value = window.innerHeight*11.5;

      film.renderToScreen = true;

      this.composer.addPass( film );
  }

  animate = () => {
    var time = new Date().getTime() / 1000;
    var dolphin_fly = (time - last_sound) < Math.PI/1.5 ? (time - last_sound) : 0;
    dolphin_fly *= 2;


    if(time - last_rotate < 1.3) {
        this.rotateBuildings();
    }
    this.bumpBusts(time);

    if(step == 0) {
        camera.position.z = -92000*(time - start_time)/transition_times[0];
        if(time - start_time > transition_times[0]) {
            step += 1;
            start_time = time;
        }
    }
    else if(step == 1){

        camera.position.x = 2000 * (time - start_time) / 5;
        camera.position.z = -90000 - 100000*(time - start_time)/transition_times[1];
        if(camera.position.x > 2000) {
            camera.position.x = 2000;
        }
        if(dolphinLoaded) {
            dolphin.position.y = -580 + 400*Math.sin(4 * Math.PI / 2 + dolphin_fly);
            dolphin.position.z = -90000 - 100000*(time - start_time)/transition_times[1];
            dolphin.rotation.x = 3 * Math.PI / 2 + Math.sin(dolphin_fly) / 3.5 + Math.cos(dolphin_fly);
            camera.lookAt(new THREE.Vector3(0, 0, dolphin.position.z));
        }

        if(time - start_time > transition_times[1]) {
            step += 1;
            start_time = time;
        }

    }
    else if(step == 2){
        let new_x = ma_geo.position.x*(time - start_time) / 3;
        if(new_x > ma_geo.position.x) {
            new_x = ma_geo.position.x;
        }
        camera.lookAt(new THREE.Vector3(new_x, ma_geo.position.y, ma_geo.position.z));

        if(uniforms.pixelCount.value < 20){
            step += 1;
            start_time = time;
        }
    }
    else if(step == 3) {
        let color_trans = (time - start_time)/10;
        if(color_trans > 1) {
            color_trans = 1;
        }
        scene.background = new THREE.Color( 0.93 - 0.7*color_trans, 0.82 - 0.6*color_trans, 0.93 - 0.7*color_trans );

        box_geo.scale.x = 1;
        box_geo.scale.y = 1;
        box_geo.scale.z = 1;
        box_geo.position.z -= 10;
        box_geo.rotation.y -= 0.02;
        camera.position.z -= 10;
    }


    water.material.uniforms.time.value += 1.0 / 60.0;
    water.render();

    this.composer.passes[1].uniforms['time'].value += 1/60;
    if (this.grayscale && this.composer.passes[1].uniforms['grayscaleIntensity'].value < 1.1){
        this.composer.passes[1].uniforms['grayscaleIntensity'].value += 0.005;
    }
    else if (!this.grayscale && this.composer.passes[1].uniforms['grayscaleIntensity'].value > 0){
        this.composer.passes[1].uniforms['grayscaleIntensity'].value -= 0.005;
    }

    this.composer.render(backgroundScene, backgroundCamera);
    this.composer.render( scene, camera );
    requestAnimationFrame( this.animate );
  }


  render() {
    return <div></div>;
  }
}
