// ============================================================================
//  Hero background: WebGL2 stable-fluid sim (advection, vorticity, pressure)
//  whose dye is rendered as a glossy liquid with a thin-film rim, floating over
//  a procedural Vice-sunset scene (sky, striped sun, skyline, sea).
//  Everything is code. No textures, no images.
// ============================================================================
import { T } from '../lib/clock.js'
import { DISPLAY_FS } from './display.glsl.js'

const VS = `#version 300 es
precision highp float;
in vec2 aPos; out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texel;
void main(){ vUv=aPos*.5+.5; vL=vUv-vec2(texel.x,0.); vR=vUv+vec2(texel.x,0.); vT=vUv+vec2(0.,texel.y); vB=vUv-vec2(0.,texel.y); gl_Position=vec4(aPos,0.,1.); }`

const H = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB; out vec4 o;
`
const SPLAT = H + `uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){ vec2 p=vUv-point; p.x*=aspect; vec3 s=exp(-dot(p,p)/radius)*color; o=vec4(texture(uTarget,vUv).xyz+s,1.); }`
const ADVECT = H + `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texel; uniform float dt; uniform float dissipation;
void main(){ vec2 c=vUv-dt*texture(uVelocity,vUv).xy*texel; o=texture(uSource,c)/(1.+dissipation*dt); }`
const DIVERGENCE = H + `uniform sampler2D uVelocity;
void main(){ float L=texture(uVelocity,vL).x, R=texture(uVelocity,vR).x, Tt=texture(uVelocity,vT).y, B=texture(uVelocity,vB).y;
 vec2 C=texture(uVelocity,vUv).xy; if(vL.x<0.)L=-C.x; if(vR.x>1.)R=-C.x; if(vT.y>1.)Tt=-C.y; if(vB.y<0.)B=-C.y;
 o=vec4(.5*(R-L+Tt-B),0.,0.,1.); }`
const CURL = H + `uniform sampler2D uVelocity;
void main(){ float L=texture(uVelocity,vL).y, R=texture(uVelocity,vR).y, Tt=texture(uVelocity,vT).x, B=texture(uVelocity,vB).x; o=vec4(.5*(R-L-Tt+B),0.,0.,1.); }`
const VORTICITY = H + `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main(){ float L=texture(uCurl,vL).x, R=texture(uCurl,vR).x, Tt=texture(uCurl,vT).x, B=texture(uCurl,vB).x, C=texture(uCurl,vUv).x;
 vec2 f=.5*vec2(abs(Tt)-abs(B),abs(R)-abs(L)); f/=length(f)+1e-4; f*=curl*C; f.y*=-1.;
 vec2 v=texture(uVelocity,vUv).xy+f*dt; o=vec4(clamp(v,-1000.,1000.),0.,1.); }`
const PRESSURE = H + `uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main(){ float L=texture(uPressure,vL).x, R=texture(uPressure,vR).x, Tt=texture(uPressure,vT).x, B=texture(uPressure,vB).x, d=texture(uDivergence,vUv).x; o=vec4((L+R+B+Tt-d)*.25,0.,0.,1.); }`
const GRADSUB = H + `uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main(){ float L=texture(uPressure,vL).x, R=texture(uPressure,vR).x, Tt=texture(uPressure,vT).x, B=texture(uPressure,vB).x;
 vec2 v=texture(uVelocity,vUv).xy-vec2(R-L,Tt-B); o=vec4(v,0.,1.); }`
const CLEAR = H + `uniform sampler2D uTexture; uniform float value; void main(){ o=value*texture(uTexture,vUv); }`

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

const BG = (() => { const v = new URLSearchParams(location.search).get('bg'); return ({ a: 1, b: 2, c: 3, d: 4 })[v] ?? Number(v || 0) })()

export function createFluid(canvas, { intro = true } = {}) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' })
  if (!gl) return null
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null
  gl.getExtension('OES_texture_float_linear')

  // ---- programs
  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s), src.split('\n').map((l, i) => i + 1 + ': ' + l).join('\n')); throw new Error('shader') }
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, VS)
  function program(fs) {
    const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
    gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name) }
    return { p, u }
  }
  const P = {
    splat: program(SPLAT), advect: program(ADVECT), div: program(DIVERGENCE), curl: program(CURL),
    vort: program(VORTICITY), pres: program(PRESSURE), grad: program(GRADSUB), clear: program(CLEAR), display: program(DISPLAY_FS),
  }

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  // ---- render targets
  function fbo(w, h, internal, format, filter) {
    gl.activeTexture(gl.TEXTURE0)
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null)
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT)
    return { tex, fb, w, h, tx: 1 / w, ty: 1 / h, attach(i) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex); return i } }
  }
  function dbl(w, h, i, f, filt) {
    let a = fbo(w, h, i, f, filt), b = fbo(w, h, i, f, filt)
    return { get read() { return a }, get write() { return b }, swap() { [a, b] = [b, a] }, w, h, tx: 1 / w, ty: 1 / h }
  }
  let vel, dye, div, curlT, pres
  let simW, simH, dyeW, dyeH
  function sizeFor(res) {
    const a = canvas.width / canvas.height
    return a > 1 ? [Math.round(res * a), res] : [res, Math.round(res / a)]
  }
  function initTargets() {
    ;[simW, simH] = sizeFor(128); [dyeW, dyeH] = sizeFor(Math.min(720, Math.max(canvas.height, canvas.width) > 1600 ? 720 : 512))
    vel = dbl(simW, simH, gl.RG16F, gl.RG, gl.LINEAR)
    dye = dbl(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR)
    div = fbo(simW, simH, gl.R16F, gl.RED, gl.NEAREST)
    curlT = fbo(simW, simH, gl.R16F, gl.RED, gl.NEAREST)
    pres = dbl(simW, simH, gl.R16F, gl.RED, gl.NEAREST)
  }

  function blit(target) {
    if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb) }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null) }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  const use = (prog) => { gl.useProgram(prog.p); return prog.u }

  // ---- resize
  const dprCap = 1.5
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, dprCap)
    const w = Math.max(2, Math.floor(canvas.clientWidth * dpr)), h = Math.max(2, Math.floor(canvas.clientHeight * dpr))
    if (w === canvas.width && h === canvas.height && vel) return
    canvas.width = w; canvas.height = h
    initTargets()
  }

  // ---- sim
  const cfg = { curl: 4, velDiss: 0.9, pressureIters: 18 }
  let dyeDiss = 1.1
  function splat(x, y, dx, dy, amount, radius = 0.0022, hue = 0.5) {
    const a = canvas.width / canvas.height
    let u = use(P.splat)
    gl.uniform1i(u.uTarget, vel.read.attach(0)); gl.uniform1f(u.aspect, a); gl.uniform2f(u.point, x, y)
    gl.uniform3f(u.color, dx, dy, 0); gl.uniform1f(u.radius, radius * (a > 1 ? 1 : a * a * 1.3))
    gl.uniform2f(u.texel, vel.tx, vel.ty); blit(vel.write); vel.swap()
    gl.uniform1i(u.uTarget, dye.read.attach(0)); gl.uniform3f(u.color, amount, amount * hue, amount * 0.6)
    gl.uniform2f(u.texel, dye.tx, dye.ty); blit(dye.write); dye.swap()
  }
  function step(dt) {
    let u = use(P.curl); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(curlT)
    u = use(P.vort); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uCurl, curlT.attach(1)); gl.uniform1f(u.curl, cfg.curl); gl.uniform1f(u.dt, dt); blit(vel.write); vel.swap()
    u = use(P.div); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(div)
    u = use(P.clear); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uTexture, pres.read.attach(0)); gl.uniform1f(u.value, 0.8); blit(pres.write); pres.swap()
    u = use(P.pres); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uDivergence, div.attach(0))
    for (let i = 0; i < cfg.pressureIters; i++) { gl.uniform1i(u.uPressure, pres.read.attach(1)); blit(pres.write); pres.swap() }
    u = use(P.grad); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uPressure, pres.read.attach(0)); gl.uniform1i(u.uVelocity, vel.read.attach(1)); blit(vel.write); vel.swap()
    u = use(P.advect); gl.uniform2f(u.texel, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, vel.read.attach(0)); gl.uniform1f(u.dt, dt); gl.uniform1f(u.dissipation, cfg.velDiss); blit(vel.write); vel.swap()
    gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, dye.read.attach(1)); gl.uniform1f(u.dissipation, dyeDiss); blit(dye.write); dye.swap()
  }

  // ---- intro choreography (deterministic: seeded RNG, fixed by time)
  const introOn = intro
  function introParams(t) {
    if (!introOn) return { reveal: 1, ripple: 1 }
    return { reveal: smooth(T.revealStart, T.revealEnd, t), ripple: smooth(T.rippleStart, T.revealStart, t) }
  }
  let rng = mulberry32(7)
  function introSplats(t, dt) {
    if (!introOn) return
    if (t < T.rippleStart || t > T.revealStart + 500) { dyeDiss = t > T.revealStart ? 2.6 : 0.6; return }
    dyeDiss = t > T.revealStart ? 2.6 : 0.35
    const k = (t - T.rippleStart) / (T.revealStart + 500 - T.rippleStart)
    if (rng() > 0.8) return
    const n = 2
    for (let i = 0; i < n; i++) {
      const ang = rng() * Math.PI * 2
      const r = 0.04 + 0.55 * k * (0.6 + 0.4 * rng())
      const a = canvas.width / canvas.height
      const x = 0.5 + (Math.cos(ang) * r) / Math.max(a, 1) * (a > 1 ? 1.2 : 1)
      const y = 0.5 + Math.sin(ang) * r * (a > 1 ? 1 : 0.7)
      const sp = 120 + 200 * rng()
      const tang = (rng() - 0.5) * 2
      const vx = Math.cos(ang) * sp - Math.sin(ang) * sp * tang
      const vy = Math.sin(ang) * sp + Math.cos(ang) * sp * tang
      splat(x, y, vx, vy, 0.30 + 0.25 * (1 - k), 0.004 + 0.008 * rng(), rng())
    }
  }

  // ---- pointer + ghost cursor
  const ptr = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, last: -1e9 }
  function onMove(e) {
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height
    if (!ptr.init) { ptr.px = x; ptr.py = y; ptr.init = true }  // only the very first event
    ptr.x = x; ptr.y = y; ptr.moved = true; ptr.last = performance.now()
  }
  let hueClock = 0
  function pointerSplats(dt) {
    hueClock += dt * 0.15
    if (!ptr.moved) return
    const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py
    ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false
    const d = Math.hypot(dx, dy); if (d < 1e-5) return
    const steps = Math.min(8, Math.ceil(d / 0.01))
    for (let i = 1; i <= steps; i++) {
      const f = i / steps
      splat(ptr.x - dx * (1 - f), ptr.y - dy * (1 - f), dx * 1800 / steps, dy * 1800 / steps, Math.min(0.32, 0.14 + d * 3), 0.0022, hueClock % 1)
    }
  }
  // gentle wandering "ghost cursor" so phones and idle desktops still see the liquid move
  let ghost = { px: null, py: null }
  function ghostSplats(t) {
    const s = t / 1000
    const a = canvas.width / canvas.height
    const ang = s * 1.5 + Math.sin(s * 0.31) * 0.6
    const rx = a > 1 ? 0.36 + 0.05 * Math.sin(s * 0.9) : 0.40
    const ry = a > 1 ? 0.36 + 0.06 * Math.cos(s * 0.7) : 0.30 + 0.04 * Math.cos(s * 0.7)
    const x = 0.5 + rx * Math.cos(ang)
    const y = (a > 1 ? 0.5 : 0.46) + ry * Math.sin(ang)
    if (ghost.px != null) {
      const dx = x - ghost.px, dy = y - ghost.py
      splat(x, y, dx * 1400, dy * 1400, 0.075, 0.0048, (s * 0.07) % 1)
    }
    ghost.px = x; ghost.py = y
  }

  // ---- render
  let scroll = 0
  let clear = [0, 0, 0, 0]
  function render(t) {
    const ip = introParams(t)
    const u = use(P.display)
    gl.uniform1i(u.uDye, dye.read.attach(0))
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform2f(u.dyeTexel, dye.tx, dye.ty)
    gl.uniform1f(u.uTime, t / 1000)
    gl.uniform1f(u.uReveal, ip.reveal)
    gl.uniform1f(u.uRipple, ip.ripple)
    gl.uniform1f(u.uScroll, scroll)
    gl.uniform1f(u.uBg, BG)
    gl.uniform4f(u.uClear, clear[0], clear[1], clear[2], clear[3])
    gl.uniform2f(u.texel, 1 / canvas.width, 1 / canvas.height)
    blit(null)
  }

  // ---- loop
  let raf = 0, last = 0, simT = 0, running = false, getT = null
  const hiddenStop = () => { if (document.hidden) cancelAnimationFrame(raf); else if (running) { last = performance.now(); raf = requestAnimationFrame(frame) } }
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60); last = now
    const t = getT()
    introSplats(t, dt)
    if (t > T.revealEnd - 200 || !introOn) {
      if (t > T.done || !introOn) dyeDiss = 1.1
      if (performance.now() - ptr.last > 2500) ghostSplats(t)
    }
    pointerSplats(dt)
    step(dt)
    render(t)
    raf = requestAnimationFrame(frame)
  }

  resize()
  return {
    start(clock) {
      getT = clock; running = true; last = performance.now()
      addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('visibilitychange', hiddenStop)
      raf = requestAnimationFrame(frame)
    },
    // deterministic: simulate from 0 to tMs at 60fps, optionally with a scripted cursor path, then draw one frame
    renderAt(tMs, { trail = false } = {}) {
      const dt = 1 / 60
      for (let t = 0; t <= tMs; t += 1000 / 60) {
        introSplats(t, dt)
        if (t > T.revealEnd - 200 || !introOn) {
          if (t > T.done || !introOn) dyeDiss = 1.0
          ghostSplats(t)
          if (trail && t > tMs - 1400) {
            const k = (t - (tMs - 1400)) / 1400
            ptr.x = 0.18 + 0.62 * k; ptr.y = 0.3 + 0.18 * Math.sin(k * 5.0); ptr.moved = true
            if (ptr.px === 0.5 && ptr.py === 0.5) { ptr.px = ptr.x; ptr.py = ptr.y }
            pointerSplats(dt)
          }
        }
        step(dt)
      }
      render(tMs)
    },
    setScroll(v) { scroll = v },
    setClear(r) { clear = r },
    resize,
    destroy() {
      running = false; cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', hiddenStop)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
