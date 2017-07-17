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

uniform int ticks;
uniform float melt;
attribute float displacement;
varying float _displacement;

varying vec3 _position;

void main() {

	_position = position;
	_displacement = displacement;
	vec3 perturbed = position + (normal * displacement);
	gl_Position = projectionMatrix * modelViewMatrix * vec4( perturbed, 1.0 );

}