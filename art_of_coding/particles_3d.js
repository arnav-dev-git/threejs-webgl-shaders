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

float Line(vec2 p, vec2 a, vec2 b)
{
  float d = DistLine(p, a, b);
  float m = S(0.02, 0.008, d);
  float d2 = length(a - b);
  m *= S(1.2, 0.8, d2) * 0.5 + S(0.05, 0.03, abs(d2 - 0.75));
  return m;
}

float Layer(vec2 uv)
{
  float m = 0.0;

  vec2 gv = fract(uv) - .5;
  vec2 id = floor(uv);

  vec2 p[9];

  int i = 0;
  for(float y=-1.0; y<=1.0; y++)
  {
    for(float x=-1.0; x<=1.0; x++)
    {
      p[i] = GetPos(id, vec2(x, y));     
      i++;
    }
  }

  float t = u_time * 10.0;

  for(i = 0; i < 9; i++){
    m += Line(gv, p[4], p[i]);

    vec2 j = (p[i]- gv) * 15.0;
    float sparkel = 1.0/dot(j, j);

    m += sparkel * sin(sin(t + fract(p[i].x) * 10.0) * 0.5 + 0.5);
  }
  m += Line(gv, p[1], p[3]);
  m += Line(gv, p[1], p[5]);
  m += Line(gv, p[7], p[3]);
  m += Line(gv, p[7], p[5]);

  return m;
}

void main() {
  vec2  uv = (gl_FragCoord.xy - .5 * u_resolution.xy)/u_resolution.y;
  vec2 mouse = (u_mouse.xy / u_resolution.xy) - 0.5;

  // float m = Layer(uv * 5.0);
  float m = 0.0;

  float t = u_time * 0.1;

  float gradient = uv.y;

  //!rotate uv
  float s = sin(t);
  float c = cos(t);
  mat2 rotationMatrix = mat2(c, -s, s, c);

  uv *= rotationMatrix;
  mouse *= rotationMatrix;

  for(float i = 0.; i < 1.; i += 1./4.)
  {
    float z = fract(i + t);
    float size = mix(10.0, 0.5, z);
    float fade = S(0., .5, z) * S(1., .8, z);
    m += Layer(uv * size + i * 20. - mouse) * fade;
  }

  vec3 base_color = sin(t * 7.0 * vec3(0.234, 0.378, 0.649)) * 0.4 + 0.6;

  vec3 col = vec3(m) * base_color;

  col -= gradient * base_color * abs(sin(u_time) * 0.5);

  // if(gv.x > .48 || gv.y > .48) col = vec3(1.0, 0.0, 0.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });

const canvas = document.createElement("canvas");
let context;

context = canvas.getContext("webgl2", { antialias: false });
// context = canvas.getContext("webgl", { antialias: false });

const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });

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
