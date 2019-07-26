import * as chroma from "chroma-js";
import * as twgl from "twgl.js";
import {m4,Mat4} from "twgl.js";
import basic from "./shader/basic/basic";



const canvas=<HTMLCanvasElement>document.getElementById('canvas');
const gl=<WebGL2RenderingContext> canvas.getContext("webgl2")
const programInfo:twgl.ProgramInfo = twgl.createProgramInfo(gl, [basic.vs, basic.fs]);

const arrays = {
  position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
  normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
  texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
  indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

const tex:WebGLTexture = twgl.createTexture(gl, {
  min: gl.NEAREST,
  mag: gl.NEAREST,
  src: [
    255, 255, 255, 255,
    192, 192, 192, 255,
    192, 192, 192, 255,
    255, 255, 255, 255,
  ],
});

interface Uniforms{
  u_lightWorldPos:Mat4,
  u_lightColor: Mat4,
  u_ambient: Mat4,
  u_specular: Mat4,
  u_shininess: number,
  u_specularFactor: number,
  u_diffuse: WebGLTexture,
  u_viewInverse?:Mat4,
  u_world?:Mat4,
  u_worldInverseTranspose?:Mat4
  u_worldViewProjection?:Mat4
}
const uniforms:Uniforms = {
  u_lightWorldPos: [1, 8, -10],
  u_lightColor: [1, 0.8, 0.8, 1],
  u_ambient: [0, 0, 0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 50,
  u_specularFactor: 1,
  u_diffuse: tex,
};

function render(time:number) {
  time *= 0.001;
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fov:number = 30 * Math.PI / 180;
  const aspect:number = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.5;
  const zFar = 10;
  const projection = m4.perspective(fov, aspect, zNear, zFar);
  const eye = [1, 4, -6];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const camera:Mat4 = m4.lookAt(eye, target, up);
  const view:Mat4 = m4.inverse(camera);
  const viewProjection:Mat4 = m4.multiply(projection, view);
  const world:Mat4 = m4.rotationY(time);

  uniforms.u_viewInverse = camera;
  uniforms.u_world = world;
  uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
  uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

