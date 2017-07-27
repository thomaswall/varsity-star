/* these are already supplied ...

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;	

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec2 uv2;
*/

uniform vec4 _color;
uniform vec4 _prev_color;

uniform float ticks;
uniform float melt;
uniform float melt_off_tick;
uniform float melt_transition_time;
uniform int wave_mode;
uniform float wave_tick;

const float PI = 3.1415926535897932384626433832795;
const float PI_2 = 1.57079632679489661923;
const float PI_4 = 0.785398163397448309616;

attribute float displacement;
varying float _displacement;
varying vec2 _uv;

varying vec3 _position;

void main() {

	_position = position;
	_uv = uv;

	float d = displacement;
	if(melt_off_tick > 0.0 && ticks - melt_off_tick < melt_transition_time) {
		d = displacement - displacement*(ticks - melt_off_tick)/melt_transition_time;
	}
	else if(melt == 0.0) {
		d = 0.0;
	}

	float wave_propagation_ticks = 10.0;
	if(wave_mode == 1) {
		vec2 center = vec2(5.0, 5.0);
		float dist = distance(center, _uv * 10.0);
		float wt = ticks - wave_tick;
		float wt_o = dist / 7.1 * wave_propagation_ticks + wave_tick;
		// max distance is sqrt(5^2 + 5^2) =~ 7.1;

		float modifier = 0.0;
		if(wt/wave_propagation_ticks >= 1.0) {
			modifier = 1.0;
		}

		if((dist/7.1) <= wt/wave_propagation_ticks) {

			// need inside of eq to start at 0 and then increase by wt.
			d += -100.0 * cos((ticks - wt_o) * 0.1 + clamp(wt/wave_propagation_ticks, 0.0, PI/2.0) * dist );
			//d += -100.0 * cos((ticks - wt_o) * (ticks - wt_o) * 0.1);
			//d += -100.0 * cos(dist + wt * 0.1);
		}

	}
	_displacement = d;

	vec3 perturbed = position + (normal * d);
	gl_Position = projectionMatrix * modelViewMatrix * vec4( perturbed, 1.0 );

}