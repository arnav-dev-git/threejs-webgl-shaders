//Enter your code here

//shaders
//vertex shader
const vShader = `
  varying vec3 v_position;
  varying vec2 v_uv;
  uniform float u_time;

  void main(){
    v_position = position;
    v_uv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.4 , 1.0);
  }
`;
//fragment shader

const fShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

varying vec3 v_position;
varying vec2 v_uv;

#define t_flow sin(u_time)
#define PI 3.141592653589793

uniform sampler2D u_texture;

vec2 rotate(vec2 pt, float theta, float aspect)
{
  float s = sin(theta);
  float c = cos(theta);
  mat2 mat = mat2(c, s, -s, c);
  pt.y /= aspect;
  pt = mat * pt;
  pt.y *= aspect;
  return pt;
}

float inRect(vec2 pt, vec2 bottomLeft, vec2 topRight)
{
  vec2 s = step(bottomLeft, pt) - step(topRight, pt);
  return s.x * s.y;
}

void main(){
  // vec2 center = vec2(0.5);
  // vec2 uv = rotate(v_uv - center, PI/2., 2.0/1.5) + center;
  vec3 color = texture2D(u_texture, v_uv).rgb;

  gl_FragColor = vec4(color, 1.0); 
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const geometry = new THREE.PlaneGeometry(2, 2, 100, 100);
// const geometry = new THREE.TorusGeometry(0.5, 0.25, 64, 400);

const uniforms = {
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } },
  u_texture: {
    value: new THREE.TextureLoader().setPath("./assets/").load("img1.jpg"),
  },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms: uniforms,
});
const plane = new THREE.Mesh(geometry, material);
plane.material.side = THREE.DoubleSide;
scene.add(plane);

camera.position.z = 1;

onWindowResize();
animate();

//End of your code
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // plane.rotation.y += 0.01;
  onWindowResize();
  uniforms.u_time.value = clock.getElapsedTime();
}

//set mouse coordinates
function move(e) {
  uniforms.u_mouse.value.x = e.touches ? e.touches[0].clientX : e.clientX;
  uniforms.u_mouse.value.y = e.touches ? e.touches[0].clientY : e.clientY;
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

  if (uniforms.u_resolution !== undefined) {
    uniforms.u_resolution.value.x = window.innerWidth;
    uniforms.u_resolution.value.y = window.innerHeight;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
