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
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.4, 1.0);
  }
`;
//fragment shader

const fShader = `
  varying vec3 v_position;
  varying vec2 v_uv;
  uniform float u_time;

  mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
  }

  float line(float a , float b, float line_width, float edge_thickness){
    float half_line_width = line_width * 0.5;
    return smoothstep(a - half_line_width - edge_thickness, a - half_line_width, b) - 
                     smoothstep(a + half_line_width, a + half_line_width + edge_thickness, b);
  }

  //* main brick 
  float brick(vec2 pt, float morter_height, float edge_thickness){
    float result = line(pt.y, 0.0, morter_height, edge_thickness);
    result += line(pt.y, 0.5, morter_height, edge_thickness);
    result += line(pt.y, 1.0, morter_height, edge_thickness);

    if(pt.y > 0.5) pt.x = fract(pt.x + 0.5);

    result += line(pt.x, 0.5, morter_height, edge_thickness);

    return result;
  }

  

  void main()
  {
    // vec2 uv = fract(v_uv * 10.0);
    vec2 uv = fract(v_uv * clamp(u_time * 5.0, 0.0, 10.0));
    // vec3 color = brick(uv, 0.05, 0.001) * vec3(1.0);
    vec3 color = mix(vec3(1.0, vec2(0.0)), vec3(1.0), brick(uv, 0.05, 0.001));
    gl_FragColor = vec4(color , 1.0);
  }
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const geometry = new THREE.PlaneGeometry(2, 2);
// const geometry = new THREE.TorusGeometry(0.5, 0.25, 64, 400);

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
