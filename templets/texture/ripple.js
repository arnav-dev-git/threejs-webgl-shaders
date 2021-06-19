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

#define TIME(x) sin(u_time * x)
#define PI 3.141592653589793

uniform sampler2D u_texture;

float inRect(vec2 pt, vec2 bottomLeft, vec2 topRight)
{
  vec2 s = smoothstep(bottomLeft, bottomLeft + vec2(0.005), pt) -
           smoothstep(topRight, topRight + vec2(0.005), pt);
  return s.x * s.y;
}


void main(){

  vec2 p = v_position.xy;
  float len = length(p);

  vec2 ripple = v_uv + p/3.0 + cos(len*12.0 - u_time*2.0);

  // vec2 ripple = v_uv + p/tan(u_time) + cos(len*22.0 - u_time*4.0); //cool effect 1
  // vec2 ripple = v_uv + p/cos(len*1.0 - u_time*1.0) + cos(len*22.0 - u_time*4.0); //cool effect 2

  vec2 uv = mix(ripple, v_uv, 0.99);

  float t = inRect(uv, vec2(0.0), vec2(1.0));

  vec3 color = texture2D(u_texture, uv).rgb;

  // vec3 color = mix(vec3(0.5, 0.3, 0.5) , vec3(1.0, 0.5, 0.2) , uv.x + uv.y);

  gl_FragColor = vec4(mix(vec3(0.0), color, t), 1.0); 
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
    value: new THREE.TextureLoader().setPath("./assets/").load("img2.jpg"),
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
