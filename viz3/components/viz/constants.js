let amount = 512;
let particleRestart = 0;
let timeStart = Date.now();

let settings = {
    speed: 2.0,
    dieSpeed: 0.015,
    radius: 0.7,
    curlSize: 0.04,
    attraction: 1.0,
    fire: -1.0,
    total_time: 3.0
}

exports.amount = amount;
exports.particleRestart = particleRestart;
exports.timeStart = timeStart;
exports.settings = settings;