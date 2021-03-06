const vshader = `

#include <noise>

varying vec2 vUv;
varying float v_noise;

uniform float u_time;

void main() {	
  vUv = uv;

  v_noise = 10.0 * -0.1 * turbulence(0.5 * normal + u_time);
  float b = 5.0 * pnoise(0.05 * position, vec3(100.0));
  float displacement = b - 10.0 * v_noise;
  vec3 pos = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`;
const fshader = `
#define PI 3.141592653589
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;

//https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/

varying float v_noise;

void main (void)
{
  vec3 color = vec3(vUv * (1.0 - 2.0 * v_noise), 0.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const geometry = new THREE.IcosahedronGeometry(20, 5);
const uniforms = {
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } },
  u_color: { value: new THREE.Color(0xb7ff00) },
};

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
  // wireframe: true,
});

const ball = new THREE.Mesh(geometry, material);
scene.add(ball);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
window.addEventListener("resize", onWindowResize, false);

animate();

function onWindowResize(event) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value += clock.getDelta();
  renderer.render(scene, camera);
}
