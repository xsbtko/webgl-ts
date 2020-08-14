attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewProjectionMatrix;

uniform float u_ProjectScale; // zoom level
uniform vec3 u_PixelsPerMeter;
uniform mat4 u_ModelMatrix;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
varying vec4 v_Color;
vec2 project_mercator_(vec2 lnglat) {
    float x = lnglat.x;
    return vec2(
        radians(x) + PI,
        PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))
    );
}

vec4 project_position(vec4 position) {
    return u_ModelMatrix * vec4(
        project_mercator_(position.xy) * WORLD_SCALE * u_ProjectScale,
        project_scale(position.z),
        position.w
    );
}


vec4 project_to_clipspace(vec4 position) { 
    return u_ViewProjectionMatrix * position;
}      

void main() {
    v_Color = a_Color;

    vec4 worldPosition = project_position(a_Position);
    gl_Position = project_to_clipspace(worldPosition);
}