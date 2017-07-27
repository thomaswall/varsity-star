/* these are already supplied ...

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

*/

uniform float melt;

uniform vec4 _color;
uniform vec4 _prev_color;
uniform float ticks;
uniform float color_change_tick;
uniform float color_transition_time;
uniform int tex_mode;
uniform sampler2D dat_tex;

varying vec3 _position;
varying float _displacement;
varying vec2 _uv;

void main() {

	vec3 normd = vec3(1.0, 1.0, 1.0) - (normalize(_position) + vec3(1.0, 1.0, 1.0)) / 2.0;
	//gl_FragColor = vec4(normd, 1.0);
	
	float max_displacement = 300.0;
	float norm_displacement = clamp((1.0 + (-1.0 * _displacement / max_displacement))/2.0, 0.0, 1.0); 

	vec4 activeColor;
	float ipl = 1.0;
	if(ticks - color_change_tick < color_transition_time) {
		ipl = (ticks - color_change_tick)/color_transition_time;
		activeColor = norm_displacement * (ipl * _color +  (1.0 - ipl) * _prev_color);
	} else {
		activeColor = norm_displacement * _color;
	}

	if(mod(floor(_uv.x * 10.0), 2.0) == 0.0 || mod(floor(_uv.y * 10.0), 2.0) == 1.0) {
		gl_FragColor = activeColor;
	}
	else {
		gl_FragColor = norm_displacement * (ipl * vec4(_prev_color) + (1.0 - ipl) * _color);
	}

	if(tex_mode == 1) {
		vec4 raw_color = texture2D(dat_tex, vec2(_uv.x, 1.0 - _uv.y));

/*
		vec4 nc = normalize(raw_color);
		if(nc.r > 0.6) {
			raw_color = _color;
		}
		if(nc.g > 0.5) {
			raw_color = _prev_color;
		}
		*/
		gl_FragColor = norm_displacement * raw_color;
	}


}
