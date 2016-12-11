import THREE from 'three';
THREE.Pixelate = {
  uniforms: {
    "pixelCount": { type: "t", value: 128.0 }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
		"uniform float pixelCount;",
		"varying vec2 vUv;",
		"uniform sampler2D Texture;",
		"void main()",
		"{",
		        "float dx = 15.0 * (1.0 / pixelCount);",
		        "float dy = 10.0 * (1.0 / pixelCount);",
		        "vec2 Coord = vec2(dx * floor(vUv.x / dx),",
		                          "dy * floor(vUv.y / dy));",
		        "gl_FragColor = texture2D(Texture, Coord);",
		"}"
  ].join("\n")
};

THREE.CThru = {
	uniforms: {
    },
    vertexShader: [
      "varying vec2 vUv;",
      "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join("\n"),
    fragmentShader: [
		"uniform vec3 color;",
		"uniform sampler2D texture;",
		"varying vec2 vUv;",
		"void main() {",
		    "vec4 tColor = texture2D( texture, vUv );",
		    "gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );",
		"}"
    ].join("\n")
}
