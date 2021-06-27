//vertex shader
const vShader = `
  varying vec2 v_uv;
  varying float v_size_factor;
  varying vec3 v_position;

  uniform float u_time;

  void main(){
    v_uv = uv;
    v_position = position;
    v_size_factor = 1.0;
    // v_size_factor = 0.4;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * v_size_factor, 1.0);
  }
`;

//fragment shader

const fShader = `

#define S(a, b, t) smoothstep(a, b, t)
#define PI 3.141592653589793
#define PI2 6.28318530718

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

varying vec3 v_position;

vec2 p[9];


float DistLine(vec2 p, vec2 a, vec2 b)
{
  vec2 pa = p - a;
  vec2 ba = b - a;
  float t = clamp(dot(pa, ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa - ba*t);
}

float N21(vec2 p)
{
  p = fract(p*vec2(233.84, 815.73));
  p += dot(p, p+23.45);
  return fract(p.x * p.y);
}

float N21(vec2 p, float seed)
{
  p = fract(p*vec2(233.84, 815.73) + seed);
  p += dot(p, p+23.45);
  return fract(p.x * p.y);
}

vec2 N22(vec2 p)
{
  float n = N21(p);
  return vec2(n, N21(p + n));
}

vec2 N22(vec2 p, float seed)
{
  float n = N21(p, seed);
  return vec2(n, N21(p + n, seed));
}

vec2 GetPos(vec2 id, vec2 offset)
{
  vec2 n = N22(id + offset) * u_time;
  return offset + sin(n) * 0.37;
}

void main() {
  vec2  uv = (gl_FragCoord.xy - .5 * u_resolution.xy)/u_resolution.y;
  
  // float d = DistLine(uv, vec2(0.0), vec2(0.6));
  // float m = S(0.1, 0.05, d);

  // m = N22(uv).y;

  uv *= 5.0;

  vec2 gv = fract(uv) - .5;
  vec2 id = floor(uv);

  // vec2 p = GetPos(id, vec2(0.01, 0.01));

  // float d = length(gv - p);
  // float m = S(.1, .05, d);

  int i = 0;
  for(float y=-1.0; y<=1.0; y++)
  {
    for(float x=-1.0; x<=1.0; x++)
    {
      p[i] = GetPos(id, vec2(x, y));     
      i++;
    }
  }

  vec3 col = vec3(1.);

  if(gv.x > .48 || gv.y > .48) col = vec3(1.0, 0.0, 0.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

class WEBGL {
  static isWebGLAvailable() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  static isWebGL2Available() {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch (e) {
      return false;
    }
  }

  static getWebGLErrorMessage() {
    return this.getErrorMessage(1);
  }

  static getWebGL2ErrorMessage() {
    return this.getErrorMessage(2);
  }

  static getErrorMessage(version) {
    const names = {
      1: "WebGL",
      2: "WebGL 2",
    };
    const contexts = {
      1: window.WebGLRenderingContext,
      2: window.WebGL2RenderingContext,
    };
    let message =
      'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';
    const element = document.createElement("div");
    element.id = "webglmessage";
    element.style.fontFamily = "monospace";
    element.style.fontSize = "13px";
    element.style.fontWeight = "normal";
    element.style.textAlign = "center";
    element.style.background = "#fff";
    element.style.color = "#000";
    element.style.padding = "1.5em";
    element.style.width = "400px";
    element.style.margin = "5em auto 0";

    if (contexts[version]) {
      message = message.replace("$0", "graphics card");
    } else {
      message = message.replace("$0", "browser");
    }

    message = message.replace("$1", names[version]);
    element.innerHTML = message;
    return element;
  }
}
THREE.WEBGL = WEBGL;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });

const canvas = document.createElement("canvas");
let context;

if (WEBGL.isWebGL2Available()) {
  context = canvas.getContext("webgl2", { antialias: false }); // disable AA if using post-processing
} else {
  context = canvas.getContext("webgl", { antialias: false });
}

const renderer = new WebGLRenderer({ canvas, context });

const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2, 100, 100);
// const geometry = new THREE.TorusKnotGeometry(0.4, 0.2, 200, 64);

const uniform = {
  u_color: { value: new THREE.Color(0x00ff00) },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0.0, y: 0.0 } },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms: uniform,
  opacity: true,
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
animate();

//End of your code
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  onWindowResize();

  // plane.rotation.y += 0.01;
  uniform.u_time.value = clock.getElapsedTime();
}

//set mouse coordinates
function move(e) {
  uniform.u_mouse.value.x = e.touches ? e.touches[0].clientX : e.clientX;
  uniform.u_mouse.value.y = e.touches ? e.touches[0].clientY : e.clientY;
}

if ("ontouchStart" in window) {
  document.addEventListener("touchmove", move);
} else {
  document.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", move);
}

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;

  if (uniform.u_resolution !== undefined) {
    uniform.u_resolution.value.x = window.innerWidth;
    uniform.u_resolution.value.y = window.innerHeight;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
