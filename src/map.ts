import * as twgl from 'twgl.js'
import {m4, Mat4} from 'twgl.js'
import GeoViewport from '@mapbox/geo-viewport'
import GeojsonExtent from '@mapbox/geojson-extent'
import GeojsonCoords from '@mapbox/geojson-coords'
import WebMercatorViewport from 'viewport-mercator-project'
import basic from './shader/basic/basic'
import GeoData from './data/china.json'
window.oncontextmenu = function () {
  return
}
const canvas = <HTMLCanvasElement>document.getElementById('canvas')
const gl = <WebGL2RenderingContext>canvas.getContext('webgl2')
const programInfo = twgl.createProgramInfo(gl, [basic.mapvs, basic.mapfs])
const Bounds: number[] = GeojsonExtent(GeoData)
type ViewportObject = {
  zoom: number
  center: number[]
}
const Canvas = {
  width: Number(
    window
      .getComputedStyle(<Element>canvas)
      .getPropertyValue('width')
      .slice(0, -2)
  ),
  height: Number(
    window
      .getComputedStyle(<Element>canvas)
      .getPropertyValue('height')
      .slice(0, -2)
  )
}
const Viewport: ViewportObject = GeoViewport.viewport(Bounds, [Canvas.width, Canvas.height])
const AllCoords: Array<Array<number>> = GeojsonCoords(GeoData)

let MercatorViewport: WebMercatorViewport = new WebMercatorViewport({
  width: Canvas.width,
  height: Canvas.height,
  longitude: Viewport.center[0],
  latitude: Viewport.center[1],
  zoom: 0
})

let pxCoords: number[] = []
AllCoords.forEach((coord: number[]): void => {
  let pxCoord = [...MercatorViewport.project(<[number, number]>coord)]
  pxCoords = pxCoords.concat(...pxCoord)
})

let arrays = {
  a_position: {numComponents: 2, data:new Float32Array(pxCoords)}
}
let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
interface Uniforms {
  u_resolution?: number[]
  u_viewInverse?: Mat4
  u_world?: Mat4
  u_worldInverseTranspose?: Mat4
  u_worldViewProjection?: Mat4,
  u_zoom?: number
}
const uniforms:Uniforms = {
  u_resolution: [Canvas.width, Canvas.height],
  u_zoom:2
}
window.onwheel = (e:WheelEvent) => {
    let base = Math.sqrt(Math.abs(e.deltaY))/10
    uniforms.u_zoom += e.deltaY>0 ? -base : base
}
function render(time: number) {
  twgl.resizeCanvasToDisplaySize(canvas)
  gl.viewport(0, 0, Canvas.width, Canvas.height)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const projection = m4.perspective(
    (25 * Math.PI) / 180,
    gl.canvas.width / gl.canvas.height,
    0.5,
    10
  )
  const eye = [0, 0, 4]
  const target = [0, 0, 0]
  const up = [0, 1, 0]

  const camera = m4.lookAt(eye, target, up)
  const view = m4.inverse(camera)
  const viewProjection = m4.multiply(projection, view)
  const world = m4.rotationX(Math.PI/4)

  uniforms.u_viewInverse = camera
  uniforms.u_world = world
  uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world))
  uniforms.u_worldViewProjection = m4.multiply(viewProjection, world)
  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, uniforms)
  gl.drawArrays(gl.LINE_STRIP, 0, pxCoords.length / 2)

  // gl.drawElements(gl.LINES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(render)
}
requestAnimationFrame(render)
