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
    new THREE.Vector4(0.0, 0.77647, 1.0, 1.0),
    new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    new THREE.Vector4(144.0/255.0, 107.0/255.0, 181.0/255.0, 1.0)
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