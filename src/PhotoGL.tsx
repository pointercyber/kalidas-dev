import { useEffect, useRef } from "react";
import { scroll } from "./scroll";
import me from "./assets/me.png";

const VS = "attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const FS =
  "precision mediump float;varying vec2 u;uniform sampler2D T;uniform vec2 m;uniform float t,v,a;void main(){vec2 q=vec2(u.x,1.-u.y);vec2 d=q-m;float r=length(d*vec2(.6,1.));" +
  "float rip=sin(r*40.-t*4.)*exp(-r*6.)*.016*a;vec2 w=vec2(sin(q.y*9.+t*1.5),cos(q.x*7.+t*1.2))*.0025*(1.+v*6.);vec2 o=normalize(d+1e-4)*rip+w;float ab=.003+v*.02+a*.007;" +
  "vec4 cr=texture2D(T,q+o+vec2(ab,0.));vec4 cg=texture2D(T,q+o);vec4 cb=texture2D(T,q+o-vec2(ab,0.));float al=max(cg.a,max(cr.a,cb.a));" +
  "vec3 col=vec3(cr.r,cg.g,cb.b)+vec3(.05,.1,.35)*a*exp(-r*5.)*cg.a;gl_FragColor=vec4(col,al);}";

/** Your photo drawn through a WebGL shader: cursor ripple, RGB split on scroll, idle wave. */
export default function PhotoGL({ className, alt = "" }: { className?: string; alt?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    const sh = (type: number, src: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const um = U("m"), ut = U("t"), uv = U("v"), ua = U("a");
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.clearColor(0, 0, 0, 0);
    const tex = gl.createTexture();
    let ready = false;
    const im = new Image();
    im.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    };
    im.src = me;
    let mx = 0.5, my = 0.35, tx = 0.5, ty = 0.35, act = 0, vel = 0, last = scroll.y, raf = 0, visible = true;
    const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const onMove = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width; ty = (e.clientY - b.top) / b.height;
      if (tx > -0.2 && tx < 1.2 && ty > -0.2 && ty < 1.2) act = 1;
    };
    addEventListener("pointermove", onMove);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    gl.viewport(0, 0, cv.width, cv.height);
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready || !visible) return;
      vel += (Math.min(Math.abs(scroll.y - last) / 50, 1) - vel) * 0.12; last = scroll.y;
      act *= 0.97; mx += (tx - mx) * 0.15; my += (ty - my) * 0.15;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(um, mx, my); gl.uniform1f(ut, still ? 0 : ms / 1000);
      gl.uniform1f(uv, vel); gl.uniform1f(ua, still ? 0 : Math.max(act, 0.25));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className={className} width={466} height={802} role="img" aria-label={alt} />;
}
