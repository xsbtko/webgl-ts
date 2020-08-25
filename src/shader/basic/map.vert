uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;
uniform float u_zoom;

attribute vec2 a_position;
uniform vec2 u_resolution;
varying vec4 v_color;

void main() {
  vec4 real_poistion = vec4((a_position / u_resolution * 2.0 - 1.0) * vec2(1,-1) * vec2(pow(0.5,-u_zoom)), 0, 1);
  
  gl_Position = real_poistion * u_worldViewProjection;
  v_color = vec4(1, 0, 0.5, 1);
}