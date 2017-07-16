/* these are already supplied ...

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

*/

varying vec3 _position;
varying float _displacement;

void main() {

	vec3 normd = vec3(1.0, 1.0, 1.0) - (normalize(_position) + vec3(1.0, 1.0, 1.0)) / 2.0;
	//gl_FragColor = vec4(normd, 1.0);
	
	float max_displacement = 200.0;
	float norm_displacement = (1.0 + (-1.0 * _displacement / max_displacement))/2.0; 

	gl_FragColor = norm_displacement * vec4(0, 198.0/255.0, 1.0, 1.0);

	//gl_FragColor = vec4(_color, 1.0);

}
