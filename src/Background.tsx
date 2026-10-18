import { useEffect, useRef } from "react";
import { scroll } from "./scroll";

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS =
  "precision mediump float;uniform vec2 r,m;uniform float t,s;" +
  "void main(){vec2 q=(gl_FragCoord.xy/r-.5)*vec2(r.x/r.y,1.);vec2 mm=(m-.5)*vec2(r.x/r.y,1.);float d=length(q-mm);" +
  "float w=sin(q.x*3.+t*.5+s*2.)*.5+sin(q.y*4.-t*.4+s*3.)*.5+sin((q.x+q.y)*5.+t*.3)*.3;w+=.35*sin(d*12.-t*1.5)*exp(-d*3.);" +
  "float l=smoothstep(-1.,1.,w);vec3 col=mix(vec3(.02,.07,.62),vec3(.04,.16,1.),l);col=mix(col,vec3(.25,.42,1.),smoothstep(.75,1.,l)*.45);" +
  "for(int i=0;i<3;i++){float k=float(i);vec2 c=vec2(sin(t*.25+k*2.1+s)*.8,cos(t*.2+k*1.7-s*.5)*.45);col+=vec3(.2,.35,1.)*.05/(length(q-c)+.12);}" +
  "vec2 g=fract((q+vec2(0.,s*.1))*16.)-.5;col+=smoothstep(.07,.0,length(g))*(.08+.35*exp(-d*3.5));" +
  "col+=vec3(.2,.35,1.)*.18*exp(-d*4.);gl_FragColor=vec4(col,1.);}";

export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext("webgl");
    if (!gl) return;
    const sh = (type: number, src: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const ur = U("r"), ut = U("t"), us = U("s"), um = U("m");
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, raf = 0;
    const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; };
    const onScroll = () => { scroll.y = scrollY; };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5);
      cv.width = innerWidth * d; cv.height = innerHeight * d;
      gl.viewport(0, 0, cv.width, cv.height);
    };
    addEventListener("pointermove", onMove); addEventListener("resize", size);
    addEventListener("scroll", onScroll, { passive: true });
    size(); onScroll();
    const frame = (ms: number) => {
      scroll.smooth += (scroll.y - scroll.smooth) * 0.08;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      gl.uniform2f(ur, cv.width, cv.height);
      gl.uniform1f(ut, still ? 0 : ms / 1000);
      gl.uniform1f(us, scroll.smooth / innerHeight);
      gl.uniform2f(um, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      document.documentElement.style.setProperty("--s", scroll.smooth.toFixed(1));
      const bar = document.getElementById("bar");
      if (bar) bar.style.transform = `scaleX(${scroll.y / Math.max(1, document.body.scrollHeight - innerHeight)})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove); removeEventListener("resize", size); removeEventListener("scroll", onScroll);
    };
  }, []);
  return <canvas id="gl" ref={ref} />;
}
