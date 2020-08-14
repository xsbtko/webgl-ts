import * as twgl from 'twgl.js'
import {m4, Mat4} from 'twgl.js'

import WebMercatorViewport from 'viewport-mercator-project'

const DEGREES_TO_RADIANS: number = Math.PI / 180
window.oncontextmenu = function () {
  return
}

function getViewMatrix({pitch, bearing, altitude}) {
  const m: Mat4 = m4.identity()
  m4.translate(m, [0, 0, -altitude], m)
  m4.rotateX(m, -pitch * DEGREES_TO_RADIANS, m)
  m4.rotateZ(m, bearing * DEGREES_TO_RADIANS, m)
  return m
}

