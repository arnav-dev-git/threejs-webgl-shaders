//Enter your code here

//shaders
//vertex shader
const vShader = `
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0, 1.0);
  }
`;
//fragment shader

const fShader = `
  uniform vec3 u_color;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  void main(){
      
  vec2 uv = gl_FragCoord.xy/u_resolution;
  vec3 color = mix(vec3(1.0,0.0,0.0),vec3(1.0,1.0,0.0),uv.y);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

const uniform = {
  u_color: { value: new THREE.Color(0x00ff00) },
  utime: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0.0, y: 0.0 } },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms: uniform,
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
