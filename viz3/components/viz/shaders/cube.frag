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

varying vec3 _position;
varying float _displacement;

void main() {

	vec3 normd = vec3(1.0, 1.0, 1.0) - (normalize(_position) + vec3(1.0, 1.0, 1.0)) / 2.0;
	//gl_FragColor = vec4(normd, 1.0);
	
	float max_displacement = 300.0;
	float norm_displacement = clamp((1.0 + (-1.0 * _displacement / max_displacement))/2.0, 0.0, 1.0); 

	if(ticks - color_change_tick < color_transition_time) {
		float ipl = (ticks - color_change_tick)/color_transition_time;
		gl_FragColor = norm_displacement * (ipl * _color +  (1.0 - ipl) * _prev_color);
	} else {
		gl_FragColor = norm_displacement * _color;
	}

}
