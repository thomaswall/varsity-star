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

attribute float displacement;
varying float _displacement;
varying vec2 _uv;
//varying vec2 _uv2;

varying vec3 _position;

void main() {

	_position = position;
	_uv = uv;
	//_uv2 = uv2;

	float d = displacement;
	if(melt_off_tick > 0.0 && ticks - melt_off_tick < melt_transition_time) {
		d = displacement - displacement*(ticks - melt_off_tick)/melt_transition_time;
	}
	else if(melt == 0.0) {
		d = 0.0;
	}
	_displacement = d;

	vec3 perturbed = position + (normal * d);
	gl_Position = projectionMatrix * modelViewMatrix * vec4( perturbed, 1.0 );

}