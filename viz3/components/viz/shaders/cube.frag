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
uniform sampler2D box_tex;

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
		//gl_FragColor = norm_displacement * (ipl * vec4(_prev_color) + (1.0 - ipl) * _color);
		
		float m_x = (_uv.x * 10.0) - floor(_uv.x * 10.0);
		float m_y = (_uv.y * 10.0) - floor(_uv.y * 10.0);
        
		vec4 cartoon = texture2D(box_tex, vec2(m_x, m_y));
		if(cartoon.r + cartoon.g + cartoon.b >= 2.0) {
			cartoon = activeColor;
		}
		else {
			cartoon = _prev_color;
		}
		gl_FragColor = cartoon;
		
	}

	if(tex_mode == 1) {
		vec4 raw_color = texture2D(dat_tex, vec2(_uv.x, 1.0 - _uv.y));

		vec4 nc = normalize(raw_color);
		float bw_color = (raw_color.r + raw_color.g + raw_color.b) / 3.0;
        
		raw_color = bw_color * activeColor + (1.0 - bw_color) * _prev_color;
		/*
		if(bw_color >= 2.0/3.0) {
			raw_color = activeColor;
		}
		else {
			raw_color = _prev_color;
		}
		*/

		gl_FragColor = norm_displacement * raw_color;
	}


}
