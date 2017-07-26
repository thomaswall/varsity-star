import THREE from 'three';

export let amount = 512;
export let particleRestart = 0;
export let timeStart = Date.now();
export let ticks = 0;

export let settings = {
    speed: 2.0,
    dieSpeed: 0.015,
    radius: 0.7,
    curlSize: 0.04,
    attraction: 1.0,
    fire: -1.0,
    total_time: 3.0
}

export let phase = 0;

export const colors = [
    new THREE.Vector4(143.0/255.0, 148/255.0, 145/255.0, 1),
    new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
    new THREE.Vector4(4/255.0, 42/255.0, 43/255.0, 1),
    new THREE.Vector4(1/255.0, 25/255.0, 54/255.0, 1),
    new THREE.Vector4(75/255.0, 83/255.0, 88/255.0, 1),
    new THREE.Vector4(45/255.0, 3/255.0, 32/255.0, 1),
]

export const ballColors = [
    new THREE.Vector4(166.0/255.0, 234/255.0, 228/255.0, 1),
    new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    new THREE.Vector4(71/255.0, 229/255.0, 216/255.0, 1),
    new THREE.Vector4(198/255.0, 158/255.0, 147/255.0, 1),
    new THREE.Vector4(170/255.0, 105/255.0, 87/255.0, 1),
    new THREE.Vector4(0/255.0, 0/255.0, 0/255.0, 1),
]

export let current_index = 0;
export let prev_index = 0;
export let color_change_tick = 0;
export const color_transition_time = 30; // 30 ticks
export const melt_transition_time = 10;

export let cube_x_rotation = 0.002;
export let cube_y_rotation = 0.0;
export let cube_z_rotation = 0.000;

export const tick = () => ticks += 1;
export const set_color = index => {
    index = index % colors.length;

    prev_index = current_index;
    current_index = index;
    color_change_tick = ticks;
}