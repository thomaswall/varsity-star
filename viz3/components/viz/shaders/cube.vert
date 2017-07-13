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

varying vec3 _position;

void main() {

	_position = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}