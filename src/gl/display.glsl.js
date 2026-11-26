// Final composite: procedural Vice-sunset scene + glossy liquid from the dye field.
export const DISPLAY_FS = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; out vec4 o;
uniform sampler2D uDye; uniform vec2 uRes; uniform vec2 dyeTexel;
uniform float uTime, uReveal, uRipple, uScroll;
uniform vec4 uClear; // title rect in uv (x0,y0,x1,y1); liquid fades there
uniform float uBg;   // background variant: 0 current, 1 cinematic sunset, 2 liquid gradient, 3 neon rain night, 4 golden-hour ocean

float hash(float n){ return fract(sin(n*127.1)*43758.5453); }
// integer hash: exact on every GPU (the sin() hash gave blocky seams on some drivers)
float hash2(vec2 p){ uvec2 q = uvec2(ivec2(floor(p)) + 32768) * uvec2(1597334673u, 3812015801u); uint n = (q.x ^ q.y) * 1597334673u; n ^= n >> 16; return float(n) * (1.0/4294967295.0); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x), mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }

// palette
const vec3 GOLD  = vec3(1.00,.80,.42);
const vec3 ORANGE= vec3(1.00,.47,.22);
const vec3 ROSE  = vec3(.93,.25,.45);
const vec3 PLUM  = vec3(.46,.11,.42);
const vec3 DUSK  = vec3(.15,.055,.27);
const vec3 INK   = vec3(.043,.024,.078);
const vec3 TEAL  = vec3(0.,.76,.78);
const vec3 PINK  = vec3(1.,.24,.55);

vec3 skyCol(float h){ // h: 0 at horizon -> 1 top of screen
  vec3 c = mix(GOLD, ORANGE, smoothstep(0.,.12,h));
  c = mix(c, ROSE, smoothstep(.08,.30,h));
  c = mix(c, PLUM, smoothstep(.26,.58,h));
  c = mix(c, DUSK, smoothstep(.55,1.,h));
  return c;
}

// p: centered coords, y up, units of screen height. returns scene colour.
vec3 scene(vec2 p, float aspect){
  float t = uTime;
  bool portrait = aspect < 1.;
  float hor = portrait ? -0.06 : -0.16;            // horizon height
  float top = 0.5;
  vec2 sc = vec2(0., portrait ? 0.10 : -0.02);     // sun centre
  float sr = portrait ? 0.36*aspect : 0.25;        // sun radius
  vec3 col;
  if (p.y > hor) {
    float h = (p.y-hor)/(top-hor);
    col = skyCol(h);
    // soft clouds banding near horizon
    float cl = fbm(vec2(p.x*1.6 + t*.01, p.y*7.))*smoothstep(.55,.0,h)*smoothstep(.0,.08,h);
    col = mix(col, mix(ROSE, GOLD, .4), cl*.28);
    // stars
    vec2 sg = floor(p*vec2(140.)); float st = hash2(sg);
    col += vec3(1.,.92,.85) * step(.9965, st) * smoothstep(.45,.9,h) * (.5+.5*sin(t*2.+st*60.));
    // sun
    vec2 d = p - sc; float r = length(d);
    vec3 sunC = mix(vec3(1.,.93,.62), mix(ORANGE, PINK, .55), smoothstep(sr*.9,-sr*.9,d.y));
    float disc = smoothstep(sr+.002, sr-.002, r);
    // synth stripes, wider toward the bottom
    float yy = (sc.y + sr*.25 - p.y)/(sr*1.25);
    float band = fract(yy*6.);
    float gap = clamp(yy,0.,1.)*0.45;
    float cut = (yy>0.) ? step(band, gap) : 0.;
    disc *= 1.-cut;
    col = mix(col, sunC, disc);
    col += mix(ORANGE,PINK,.4) * exp(-max(r-sr,0.)*7.) * .35;          // halo
    col += GOLD * exp(-abs(p.y-hor)*28.) * .25 * exp(-abs(p.x)*1.4);  // horizon glow
    // skyline: far layer (hazy) and near layer (dark with windows)
    for (int L=0; L<2; L++){
      float fl = float(L);
      float sx = p.x * (fl<.5 ? 26. : 15.) + (fl<.5 ? 3.1 : 11.7);
      float id = floor(sx);
      float hh = hash(id + fl*31.);
      float hgt = (fl<.5 ? .05 : .025) + pow(hh, 3.) * (fl<.5 ? .17 : .23);
      // keep the middle lower so the sun reads
      hgt *= mix(.35, 1., smoothstep(.12, .62, abs(p.x)/max(aspect*.5,.5)));
      float bw = .62 + .3*hash(id*3.1+fl);                     // building width within cell
      float fx = fract(sx);
      float inB = step(abs(fx-.5), bw*.5) * step(p.y, hor + hgt);
      // antenna on tall ones
      inB = max(inB, step(.86, hh) * step(abs(fx-.5), .03) * step(p.y, hor + hgt + .03));
      vec3 bc = fl<.5 ? mix(PLUM, ROSE, .28)*.9 : mix(DUSK, INK, .35);
      bc = mix(bc, skyCol(0.)*.55, (1.-fl)*.25*smoothstep(.0,.2,p.y-hor));
      if (fl>.5) { // windows
        vec2 wg = vec2(fx*7., (p.y-hor)*120.);
        float on = step(.62, hash2(floor(wg)+id*9.)) * step(.25, fract(wg.x)) * step(.3, fract(wg.y));
        bc += mix(GOLD, PINK, hash2(floor(wg)+3.)) * on * .55 * (0.75+.25*sin(t*.7+hash(id)*20.));
      }
      col = mix(col, bc, inB);
    }
  } else {
    // sea
    float dpt = (hor - p.y)/(hor + .5);                       // 0 at horizon -> 1 bottom
    col = mix(mix(PLUM, ROSE, .25), INK, smoothstep(0.,.9,dpt));
    col = mix(col, TEAL*.35, smoothstep(.15,.9,dpt)*.35);
    // sun reflection streaks
    float w = sr*(1.1 + dpt*1.4);
    float wob = sin(p.y*260./(.25+dpt) + t*1.6 + noise(vec2(p.y*40.,t))*3.)*.5+.5;
    float streak = smoothstep(w, w*.2, abs(p.x + (noise(vec2(p.y*30.,t*.5))-.5)*.06)) * smoothstep(.35,.9,wob);
    col += mix(GOLD, PINK, smoothstep(0.,.6,dpt)) * streak * (1.-smoothstep(0.,.85,dpt)) * .9;
    // teal glints
    float g = step(.985, hash2(floor(vec2(p.x*90., p.y*320.)) + floor(t*2.)));
    col += TEAL * g * (1.-dpt) * .5;
    col += GOLD * exp(-abs(p.y-hor)*60.) * .35;
  }
  return col;
}


// ============================ background variants ===========================
// shared: rich sunset sky with volumetric clouds, soft sun, god rays
vec3 richSky(vec2 p, vec2 sc, float sr, float hor){
  float t = uTime;
  float h = clamp((p.y - hor) / (.5 - hor), 0., 1.);
  vec3 c = skyCol(h);
  vec2 d = p - sc; float r = length(d);
  // god rays
  float ang = atan(d.y, d.x);
  float rays = noise(vec2(ang * 9., t * .05)) * .6 + noise(vec2(ang * 23., -t * .03)) * .4;
  c += mix(ORANGE, GOLD, .5) * pow(rays, 3.) * exp(-r * 2.4) * .55 * step(hor, p.y);
  // two cloud layers, lit from below by the sun
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    vec2 cp = vec2(p.x * (1.2 + fl * .8) + t * (.008 + fl * .006), (p.y - hor) * (5. - fl * 2.));
    float cl = fbm(cp * vec2(1.4, 2.2) + fl * 7.3);
    cl = smoothstep(.48 - fl * .05, .78, cl) * smoothstep(.0, .06, p.y - hor) * (1. - smoothstep(.35, .6, p.y - hor + fl * .1));
    vec3 lit = mix(mix(PLUM, ROSE, .6), GOLD, exp(-r * (2.5 - fl)) * .9);
    vec3 shade = mix(DUSK, PLUM, .5);
    float under = smoothstep(.0, .5, fbm(cp * 2.1 + 3.));
    c = mix(c, mix(lit, shade, under * .55), cl * (.85 - fl * .25));
  }
  // soft glowing sun (no stripes)
  vec3 sunC = mix(vec3(1., .96, .78), mix(GOLD, ORANGE, .5), smoothstep(0., sr, r));
  c = mix(c, sunC * 1.15, smoothstep(sr + .004, sr - .004, r));
  c += mix(ORANGE, PINK, .3) * exp(-max(r - sr, 0.) * 5.) * .55;
  c += GOLD * exp(-abs(p.y - hor) * 22.) * .35 * exp(-abs(p.x - sc.x) * 1.2);
  return c;
}
// skyline layers with atmospheric perspective
vec3 skylineLayers(vec2 p, float hor, vec3 c, bool night){
  for (int L = 0; L < 3; L++) {
    float fl = float(L);
    float sx = p.x * (34. - fl * 9.) + fl * 17.3;
    float id = floor(sx), fx = fract(sx);
    float hh = hash(id + fl * 31.);
    float hgt = (.02 + fl * .012) + pow(hh, 2.5) * (.09 + fl * .05);
    hgt *= mix(.45, 1., smoothstep(.05, .5, abs(p.x)));
    // set-backs: stepped tops
    float step2 = step(.5, hash(id * 7.7)) * step(abs(fx - .5), .22) * .025;
    float bw = .7 + .25 * hash(id * 3.1 + fl);
    float inB = step(abs(fx - .5), bw * .5) * step(p.y, hor + hgt + step2);
    inB = max(inB, step(.85, hh) * step(abs(fx - .5), .025) * step(p.y, hor + hgt + .04));
    vec3 haze = night ? mix(DUSK, PLUM, .5) : mix(ROSE, GOLD, .25);
    vec3 bc = mix(haze * (night ? .9 : .75), mix(DUSK, INK, .5), fl / 2.);
    if (fl > 1.5 || night) {
      vec2 wg = vec2(fx * 8., (p.y - hor) * 150.);
      float on = step(night ? .55 : .7, hash2(floor(wg) + id * 9. + fl * 50.)) * step(.3, fract(wg.x)) * step(.35, fract(wg.y));
      bc += mix(GOLD, night ? (hash2(floor(wg) + 5.) > .5 ? PINK : TEAL) : PINK, hash2(floor(wg) + 3.)) * on * (night ? .8 : .45) * (1. - fl * .15);
    }
    c = mix(c, bc, inB);
  }
  return c;
}
vec3 sceneCinematic(vec2 p, float aspect){
  bool portrait = aspect < 1.;
  float hor = portrait ? -.06 : -.14;
  vec2 sc = vec2(portrait ? .02 : .08, portrait ? .1 : .0);
  float sr = portrait ? .1 : .085;
  if (p.y > hor) return skylineLayers(p, hor, richSky(p, sc, sr, hor), false);
  // reflective ocean in perspective
  float dz = hor - p.y; float z = .12 / max(dz, .002);
  vec2 wp = vec2(p.x * z, z);
  float w = noise(wp * vec2(1.2, .7) + vec2(0., -uTime * .5)) + .5 * noise(wp * vec2(3.1, 2.) + vec2(uTime * .2, -uTime * .8));
  float dist = (w - .75) * .035 * min(1., dz * 6.);
  vec2 rp = vec2(p.x + dist * .6, hor + dz * .9 + dist);
  vec3 refl = skylineLayers(rp, hor, richSky(rp, sc, sr, hor), false);
  float fres = .35 + .65 * pow(1. - min(1., dz * 2.2), 3.);
  vec3 c = mix(mix(INK, PLUM, .35), refl, fres * .8);
  float col = exp(-pow((p.x - sc.x) / (.03 + dz * .55), 2.));
  float spark = smoothstep(.72, .95, noise(wp * vec2(2.5, 6.) + vec2(0., -uTime * 1.3)));
  c += mix(vec3(1., .9, .7), PINK, smoothstep(0., .4, dz)) * col * spark * 1.4;
  return c;
}
vec3 sceneMesh(vec2 p, float aspect){
  float t = uTime * .12;
  vec3 c = mix(DUSK, INK, .3);
  vec2 b1 = vec2(sin(t * 1.1) * .45, cos(t * .9) * .25 + .05);
  vec2 b2 = vec2(cos(t * .7 + 2.) * .5, sin(t * 1.3) * .3 - .1);
  vec2 b3 = vec2(sin(t * .8 + 4.) * .55, cos(t * .6 + 1.) * .3 + .15);
  vec2 b4 = vec2(cos(t * 1.2 + 5.) * .4, sin(t * .5 + 3.) * .35 - .2);
  vec2 q = p + .06 * vec2(fbm(p * 2. + t), fbm(p * 2. - t));
  c = mix(c, PINK, exp(-dot(q - b1, q - b1) * 6.) * .95);
  c = mix(c, ORANGE, exp(-dot(q - b2, q - b2) * 7.) * .9);
  c = mix(c, PLUM, exp(-dot(q - b3, q - b3) * 5.) * .8);
  c = mix(c, TEAL * .8, exp(-dot(q - b4, q - b4) * 8.) * .7);
  c = mix(c, GOLD, exp(-dot(q - b2 * .6, q - b2 * .6) * 22.) * .55);
  // fine topographic contour lines for a modern editorial feel
  float lum = dot(c, vec3(.3, .5, .2));
  float lines = smoothstep(.04, .0, abs(fract(lum * 9. + fbm(p * 3.) * .3) - .5) - .45);
  c += vec3(1., .9, .95) * lines * .05;
  return c * 1.05;
}
vec3 sceneNight(vec2 p, float aspect){
  bool portrait = aspect < 1.;
  float hor = portrait ? -.1 : -.18;
  float h = clamp((p.y - hor) / (.5 - hor), 0., 1.);
  vec3 c = mix(mix(PLUM, ROSE, .35) * .9, mix(DUSK, INK, .4), smoothstep(0., .55, h));
  c += PINK * exp(-abs(p.y - hor) * 9.) * .25;
  float st = step(.997, hash2(floor(p * 160.))) * smoothstep(.4, .8, h);
  c += vec3(1.) * st * .7;
  if (p.y > hor) {
    c = skylineLayers(p, hor, c, true);
    // neon signs on buildings
    vec2 sg = vec2(p.x * 7., (p.y - hor) * 18.);
    float sid = hash2(floor(sg) + 3.);
    float sgnl = step(.93, sid) * step(.15, fract(sg.x)) * step(fract(sg.x), .85) * step(.35, fract(sg.y)) * step(fract(sg.y), .65) * step(p.y, hor + .14);
    c += mix(PINK, TEAL, step(.965, sid)) * sgnl * 1.6;
  } else {
    // wet street: mirrored, rippled, streaked reflections
    float dz = hor - p.y;
    float rip = (noise(vec2(p.x * 3., dz * 60. - uTime * 2.)) - .5) * .012;
    vec2 rp = vec2(p.x + rip, hor + dz * .7);
    vec3 refl = skylineLayers(rp, hor, mix(PLUM, ROSE, .3) * .6, true);
    vec2 sg = vec2(rp.x * 7., (rp.y - hor) * 18.); float sid = hash2(floor(sg) + 3.);
    refl += mix(PINK, TEAL, step(.965, sid)) * step(.93, sid) * 1.2 * step(rp.y, hor + .14);
    c = mix(INK, refl, .55 * exp(-dz * 2.2));
    // headlight streaks along the road
    float lane = exp(-pow((dz - .12) * 40., 2.)) + exp(-pow((dz - .2) * 30., 2.));
    c += mix(vec3(1., .3, .4), vec3(1., .85, .6), step(0., sin(p.x * 40. + uTime * 3.))) * lane * smoothstep(.6, .9, noise(vec2(p.x * 12. - uTime * 2., dz))) * .8;
  }
  // rain
  vec2 rp2 = vec2(p.x + p.y * .18, p.y);
  float rain = step(.985, hash2(floor(vec2(rp2.x * 140., rp2.y * 5. + uTime * 26.))));
  c += vec3(.8, .8, 1.) * rain * .18;
  return c;
}
vec3 sceneOcean(vec2 p, float aspect){
  bool portrait = aspect < 1.;
  float hor = portrait ? -.02 : -.08;
  vec2 sc = vec2(0., hor + (portrait ? .07 : .06));
  float sr = portrait ? .14 : .12;
  if (p.y > hor) return richSky(p, sc, sr, hor);
  float dz = hor - p.y; float z = .1 / max(dz, .002);
  vec2 wp = vec2(p.x * z, z);
  float sw = sin(wp.y * 2.2 - uTime * 1.4 + noise(wp * .6) * 3.) * .5 + .5;
  float w = sw * .6 + noise(wp * vec2(1.5, .9) + vec2(0., -uTime * .6)) * .6;
  float dist = (w - .6) * .04 * min(1., dz * 5.);
  vec2 rp = vec2(p.x + dist * .5, hor + dz * .8 + dist);
  vec3 refl = richSky(rp, sc, sr, hor);
  vec3 c = mix(mix(INK, DUSK, .5), refl, .35 + .55 * pow(1. - min(1., dz * 2.), 2.));
  c += mix(PLUM, ROSE, .5) * smoothstep(.75, 1., sw) * .18 * (1. - min(1., dz * 2.));
  float col = exp(-pow((p.x - sc.x) / (.05 + dz * .7), 2.));
  float spark = smoothstep(.7, .95, noise(wp * vec2(3., 7.) + vec2(0., -uTime * 1.6)));
  c += vec3(1., .88, .66) * col * spark * 1.6;
  return c;
}
vec3 pickScene(vec2 p, float aspect){
  if (uBg < .5) return scene(p, aspect);
  if (uBg < 1.5) return sceneCinematic(p, aspect);
  if (uBg < 2.5) return sceneMesh(p, aspect);
  if (uBg < 3.5) return sceneNight(p, aspect);
  return sceneOcean(p, aspect);
}

vec3 darkBg(vec2 p){
  // the loader's near-black violet with a faint flowing texture
  float f = fbm(p*2.2 + vec2(uTime*.03, -uTime*.02) + fbm(p*3. - uTime*.02));
  vec3 c = INK + vec3(.05,.016,.07) * smoothstep(.4,.85,f);
  c += mix(PLUM, ROSE, .4) * .05 * exp(-length((p - vec2(0., -.55)) * vec2(.6, 1.6)) * 2.2); // faint dusk glow from below
  return c;
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x/uRes.y;
  vec2 p = (uv - .5) * vec2(aspect, 1.);

  // liquid height from dye
  // the liquid surface is a soft plateau over the dye: flat inside, bevelled at
  // the edge, so it reads as one glossy blob instead of marbled smoke
  vec2 o2 = dyeTexel*2.5;
  float d  = texture(uDye, uv).r;
  // plateau + carved contour ridges (the folded, terrain-like relief of the reference)
  #define HF(x) (smoothstep(.03, .30, x) + .055*(1.-.8*uReveal)*sin(x*46.)*smoothstep(.12,.4,x))
  float dl0 = texture(uDye, uv - vec2(o2.x,0.)).r, dr0 = texture(uDye, uv + vec2(o2.x,0.)).r;
  float db0 = texture(uDye, uv - vec2(0.,o2.y)).r, dt0 = texture(uDye, uv + vec2(0.,o2.y)).r;
  float hl = HF(dl0), hr = HF(dr0), hb = HF(db0), ht = HF(dt0);
  float hue = texture(uDye, uv).g / max(d, 1e-3);
  float h = HF(d);
  // fine ripple detail on the surface (subtle, like V01's wrinkled chrome)
  float rip = (noise(uv*uRes/9. + uTime*.6) - .5) * .05 * h;
  vec3 n = normalize(vec3((hl-hr)*1.6 + rip, (hb-ht)*1.6 + rip, .22));
  float body = smoothstep(.06, .20, d);                // inside the liquid
  float rim  = smoothstep(.012,.05,d) * (1.-smoothstep(.05,.13,d));

  // refraction: scene seen through the liquid bends
  vec2 rp = p + n.xy * .05 * (1.-body*.5) * smoothstep(0.,.5,h);
  vec3 sc = pickScene(rp, aspect);

  // reveal mask for the intro (noisy growing hole from the centre)
  float edge = length(p*vec2(1.,1.25)) + (fbm(p*2.6 + uTime*.2)-.5)*.5;
  float R = uReveal*2.3 - .1;
  float m = smoothstep(R-.10, R-.05, edge);       // 1 = still dark
  m = 1. - (1.-m) * uReveal;                   // fully revealed at uReveal = 1
  m = uReveal >= 1. ? 0. : m;
  vec3 base = mix(sc, darkBg(p), m);

  // liquid shading
  vec3 L = normalize(vec3(-.4,.6,.7));
  float spec = pow(max(dot(reflect(-L,n), vec3(0,0,1)), 0.), 38.);
  float fres = pow(1.-max(n.z,0.), 2.);
  vec3 env = skyCol(clamp(.55 + n.y*.8, 0., 1.));                  // reflects the sunset
  vec3 bodyC = mix(vec3(.06,.018,.085), skyCol(clamp(uv.y*1.1,0.,1.))*.42, .32);
  vec3 liquid = mix(bodyC, env*.85, fres);
  liquid += mix(PLUM, ROSE, .3) * .18 * smoothstep(.2,.8,n.y*.5+.5);  // magenta sheen from the sky
  liquid += mix(vec3(1.,.86,.7), vec3(1.,.93,.86), m) * spec * mix(.75, 1.1, m);
  // thin-film iridescence on the rim: pink, gold, teal
  float ph = d*9. + n.x*1.2 + n.y*.8 + hue*1.5 + uTime*.12;
  vec3 film = .5 + .5*cos(6.2831*(ph + vec3(0., .33, .67)));
  film = mix(mix(PINK, GOLD, film.r), TEAL, film.b*.7);
  // in the dark (before reveal) the liquid is black chrome; after, it floats over the sunset
  float dark = m;
  vec2 cc = clamp(uv, uClear.xy, uClear.zw);
  float clearM = (1. - smoothstep(0., .07, length((uv - cc) * vec2(aspect, 1.)))) * (1. - dark) * step(.001, uClear.z - uClear.x);
  body *= 1. - clearM * .9; rim *= 1. - clearM * .8;
  vec3 col = base;
  col = mix(col, liquid, body * mix(.92, .97, dark));
  col += film * rim * mix(.55, .55, dark) * (1.-body*.6);
  col += vec3(1.,.9,.85) * spec * body * .4 * dark;
  // oil-slick rim on the edge of the reveal hole
  float eb = smoothstep(R-.16, R-.07, edge) * (1. - smoothstep(R-.07, R+.01, edge)) * step(.001, uReveal) * (1. - step(1., uReveal));
  vec3 film2 = .5 + .5*cos(6.2831*(edge*3. + uTime*.3 + vec3(0., .33, .67)));
  film2 = mix(mix(PINK, GOLD, film2.r), TEAL, film2.b*.8);
  col = mix(col, film2, eb * .75);

  // scroll dim so page sections read well; vignette and grain
  col *= 1. - uScroll*.55;
  float vg = smoothstep(1.25, .35, length((uv-.5)*vec2(aspect*.8,1.)));
  col *= mix(.72, 1., vg);
  col += (hash2(uv*uRes + fract(uTime)*91.) - .5) * .035;
  o = vec4(max(col, 0.), 1.);
}`
