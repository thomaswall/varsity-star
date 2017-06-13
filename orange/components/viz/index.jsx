// Three.js + Postprocessing
import THREE from 'three';
var EffectComposer = require('three-effectcomposer')(THREE);
import RGBShiftShader from '../../shaders/RGBShiftShader.js';
import Film from '../../shaders/Film.js'
import FXAA from '../../shaders/FXAA.js';

import React, { Component } from 'react';
import Link from 'react-router';

import Disc from '../../images/disc_thick.png';

var start_time = new Date().getTime() / 1000;

export default class AppComponent extends Component {

	constructor = () => {
		this.mesh;
		this.renderer;
		this.scene;

		this.composer;
		this.grayscale;

		this.hue;

		// Camera scrim
		this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;
		this.camera;

		// Particles
		this.counter;
		this.particleGroups;
		this.sprite;

		this.ambientLight;
	}

	init = () => {

			const white = 0xffffff;
			this.hue = 218/360;

			this.sprite = new THREE.TextureLoader().load( Disc );

			this.particleGroups = [];

// Scene and fog
			this.scene = new THREE.Scene();
			this.scene.fog = new THREE.FogExp2(white, 0.05 );

// Camera
			this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 30 );
			this.camera.position.z = 7;
			this.camera.position.y = 0;

// Lighting
			this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
			let pointLight = new THREE.PointLight(0xffffff, 0.8);
			pointLight.position.set(5, 5, -5);

			pointLight.castShadow = true;
			this.scene.add(pointLight, this.ambientLight);

// Rendering
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			// this.renderer.setClearColor( 0xfff1e7 );
			this.renderer.setClearColor( 0xC3D8FB);

			window.addEventListener( 'resize', this.onWindowResize, false );
			document.getElementById('index').appendChild( this.renderer.domElement );

	//Postprocessing
			this.initPostprocessing();

		}


	animate = () => {

		let time = new Date().getTime() / 1000;
		let grimeLevel = 0.4 - (time - start_time)/0.5*0.4;
		this.addGrimeLevel(grimeLevel < 0 ? 0 : grimeLevel);

		// let bump = 255;
		// let grimeLevel = -(0.85 - bump/255);
		// grimeLevel = grimeLevel < 0 ? 0 : grimeLevel;


		this.composer.passes[1].uniforms['time'].value += 1/60;
		if (this.grayscale && this.composer.passes[1].uniforms['grayscaleIntensity'].value < 1.1){
			this.composer.passes[1].uniforms['grayscaleIntensity'].value += 0.005;
		}
		else if (!this.grayscale && this.composer.passes[1].uniforms['grayscaleIntensity'].value > 0){
			this.composer.passes[1].uniforms['grayscaleIntensity'].value -= 0.005;
		}

		if (this.particleGroups.length > 50){
			this.scene.remove(this.particleGroups[0].particles)
			this.particleGroups.shift();
		}
		for (var i = 0; i < this.particleGroups.length; i++){
			var particleExplosion = this.particleGroups[i];
			particleExplosion.counter += 1;
			let xPosition = particleExplosion.particles.position.x;
			let yPosition = particleExplosion.particles.position.y;
			let zPosition = particleExplosion.particles.position.z;

			let xRotation = particleExplosion.particles.rotation.x;
			let yRotation = particleExplosion.particles.rotation.y;

			for ( let i = 0; i < 1000; i++ ) {
				// X Position
				particleExplosion.vertices[ i*3 + 0 ] = particleExplosion.vertices[ i*3 + 0 ] + 4*particleExplosion.particleDirections[ i*3 + 0]/particleExplosion.counter;
				// Y Position
				particleExplosion.vertices[ i*3 + 1 ] = particleExplosion.vertices[ i*3 + 1 ] + 4*particleExplosion.particleDirections[ i*3 + 1]/particleExplosion.counter;
				// Z position
				particleExplosion.vertices[ i*3 + 2 ] = particleExplosion.vertices[ i*3 + 2 ] + 4*particleExplosion.particleDirections[ i*3 + 2]/particleExplosion.counter;
			}

			particleExplosion.particles.position.x = xPosition - 0.0015;
			particleExplosion.particles.position.y = yPosition - 0.0015;
			particleExplosion.particles.position.z = zPosition + 0.0015;

			particleExplosion.particles.rotation.y = yRotation + 0.0006;
			particleExplosion.particles.rotation.x = xRotation - 0.0006;


			let pColor = particleExplosion.particleMaterial.color.getHSL();
			let cColor = this.renderer.getClearColor().getHSL();

			if (pColor.h > this.hue) {
					pColor.h -= 1/360;
			}
			else if (pColor.h < this.hue) {
				pColor.h += 1/360;
			}

			if (cColor.h > this.hue) {
				cColor.h -= 1/360;
			}
			else if (cColor.h < this.hue) {
				cColor.h += 1/360;
			}

			let clear = new THREE.Color();
			clear.setHSL(cColor.h, cColor.s, cColor.l);

			this.renderer.setClearColor(clear);
			particleExplosion.particleMaterial.color.setHSL(pColor.h, pColor.s, pColor.l);


			particleExplosion.particleGeometry.attributes.position.needsUpdate = true;

		}



		if (this.ambientLight.intensity < 0.34){
			this.ambientLight.intensity += 0.001;
		}

		// this.renderer.render(this.scene, this.camera);
		this.composer.render(this.scene, this.camera);
		requestAnimationFrame( this.animate, this.renderer.domElement );

	}

	componentDidMount = () => {
		this.init();
		this.animate();
		var initParticles = this.initParticles;
		// var socket = new WebSocket("ws://0.0.0.0:1337");
		var socket = new WebSocket("ws://192.168.0.9:1337");
		socket.onmessage = (event) => {
			let new_d = parseInt(event.data);
			console.log(new_d)
				if (new_d == "Bump")
					start_time = new Date().getTime() / 1000;
				if (new_d == "Particles")
					this.initParticles();
				if (new_d == 1) {
					this.grayscale = false;
					this.hue = 26/360;
				}
				if (new_d == 2) {
					this.grayscale = false;
					this.hue = 218/360;
				}
				if (new_d == 3) {
					this.grayscale = false;
					this.hue = 130/360;
				}
				if (new_d == 4)
					this.grayscale = true;
		}

	}

	clickPing = (event) => {
		let mouseX = event.pageX/window.innerWidth;
		let mouseY = 1 - event.pageY/window.innerHeight;
		this.initParticles(mouseX, mouseY);
	}

	initParticles = (x, y) => {

			var randomZDepth;
			if (!x || !y){
				x = Math.random();
				y = Math.random();
				randomZDepth = Math.random();
			}
			else{
				randomZDepth = 0.2;
			}

			if (this.pingsOn){
				let xChoice = Math.floor(x * 4);
				let yChoice = Math.floor(y* 3);
			}

		//Particle shit
			var particleExplosion = {}
			particleExplosion.counter = 0;
			particleExplosion.particleGeometry = new THREE.BufferGeometry();

			let aspectRatio = window.innerWidth/window.innerHeight

			const particleCount = 100;
			var xRange = 4 * aspectRatio;
			const yRange = 5;
			const zRange = 20;

			particleExplosion.vertices = new Float32Array( particleCount * 3 );

			particleExplosion.particleDirections = [];

			for ( let i = 0; i < particleCount; i++ ) {

				// X Position
				particleExplosion.vertices[ i*3 + 0 ] = 0;
				// Y Position
				particleExplosion.vertices[ i*3 + 1 ] = 0;
				// Z Position
				particleExplosion.vertices[ i*3 + 2 ] = 0;



				particleExplosion.particleDirections[ i*3 + 0 ] = (Math.random() - 0.5)/5;
				particleExplosion.particleDirections[ i*3 + 1 ] = (Math.random() - 0.5)/5;
				particleExplosion.particleDirections[ i*3 + 2 ] = (Math.random() - 0.5)/5;
			}

			// // itemSize = 3 because there are 3 values (components) per vertex

			particleExplosion.particleMaterial = new THREE.PointsMaterial( { size: 0.65, sizeAttenuation: true, map: this.sprite, alphaTest: 0.3, transparent: true } );
			particleExplosion.particleMaterial.color.setHSL(this.hue, 0.9, (Math.random()/2+0.5) );

			particleExplosion.particleGeometry.addAttribute( 'position', new THREE.BufferAttribute( particleExplosion.vertices, 3 , false) );


			particleExplosion.particles = new THREE.Points( particleExplosion.particleGeometry, particleExplosion.particleMaterial );
			particleExplosion.frustumCulled = false;

			particleExplosion.particles.position.x = xRange * 2 * (x - 0.5) + (x - 0.5) * 40 * randomZDepth * (xRange)/40;
			particleExplosion.particles.position.y = yRange * 2 * (y - 0.5) + (y - 0.5) * randomZDepth * 0.3^y;
			particleExplosion.particles.position.z = -zRange * randomZDepth;

			this.particleGroups.push(particleExplosion);
			this.scene.add(this.particleGroups[this.particleGroups.length-1].particles);
	}

	addGrimeLevel = (level) => {
		if (!isNaN(level) && this.composer.passes[2].uniforms.amount.value != undefined){
			this.composer.passes[2].uniforms['amount'].value = level/50 + 0.0015;
			this.composer.passes[1].uniforms['noiseIntensity'].value = level/3 + 0.3;
			this.composer.passes[1].uniforms['scanlineIntensity'].value = level/4 + 0.05;
		}
	}

	onWindowResize = () => {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.initPostprocessing();
	}

	initPostprocessing = () => {
		var amount = 0.0;
		var grayscaleIntensity = 0.0
		if (this.composer) {
			amount = this.composer.passes[2].uniforms.amount.value;
			grayscaleIntensity = this.composer.passes[1].uniforms['grayscaleIntensity'].value;

		}
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new EffectComposer.RenderPass(this.scene, this.camera));

		let film = new EffectComposer.ShaderPass( THREE.Film );

		film.uniforms['noiseIntensity'].value = 0.5;
		film.uniforms['grayscaleIntensity'].value = grayscaleIntensity;

		film.uniforms['scanlineIntensity'].value = 0.0;
		film.uniforms['scanlineCount'].value = window.innerHeight*8.5;

		this.composer.addPass( film );

		let effect = new EffectComposer.ShaderPass( THREE.RGBShiftShader );
		effect.uniforms['amount'].value = amount;
		this.composer.addPass( effect );


		let dpr = 1;
		if (window.devicePixelRatio !== undefined) {
		  dpr = window.devicePixelRatio;
		}

		let fxaa = new EffectComposer.ShaderPass( THREE.FXAAShader );
		fxaa.uniforms.resolution.value = new THREE.Vector2(1/(window.innerWidth*dpr), 1/(window.innerHeight*dpr));
		fxaa.renderToScreen = true;
		this.composer.addPass( fxaa );
		// this.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
	}

	setGrayscale = (grayscale) => {
		this.grayscale = grayscale;
	}


	render = () => {
    return (
      <div onClick={this.clickPing} className="index" id="index">
      </div>
    );
  }

}
