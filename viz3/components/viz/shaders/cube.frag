/* these are already supplied ...

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

*/

varying vec3 _position;

void main() {

	vec3 normd = vec3(1.0, 1.0, 1.0) - (normalize(_position) + vec3(1.0, 1.0, 1.0)) / 2.0;
	gl_FragColor = vec4(normd, 1.0);

}
