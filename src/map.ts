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

const MercatorViewport: WebMercatorViewport = new WebMercatorViewport({
  width: Canvas.width,
  height: Canvas.height,
  longitude: Viewport.center[0],
  latitude: Viewport.center[1],
  zoom: 3
})

let pxCoords: number[] = []

AllCoords.forEach((coord: number[]): void => {
  let pxCoord = [...MercatorViewport.project(<[number, number]>coord)]
  pxCoords = pxCoords.concat(...pxCoord)
})

const arrays = {
  a_position: {numComponents: 2, data: pxCoords}
}
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
const uniforms = {
  u_resolution: [Canvas.width, Canvas.height]
}
function render(time: number) {
  twgl.resizeCanvasToDisplaySize(canvas)
  gl.viewport(0, 0, Canvas.width, Canvas.height)

  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, uniforms)
  gl.drawArrays(gl.LINE_STRIP, 0, pxCoords.length / 2)

  // gl.drawElements(gl.LINES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(render)
}
requestAnimationFrame(render)
