//Enter your code here

//shaders

//vertex shader
const vShader = `
  varying vec2 v_uv;
  varying vec3 v_position;
  varying float v_size_factor;
  void main(){
    v_uv = uv;
    v_position = position;
    v_size_factor = 0.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * v_size_factor, 1.0);
  }
`;

//fragment shader

//draw a circle out of a plane
const fShader = `
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_uv;
varying vec3 v_position;

float circle(vec2 pt, vec2 center, float radius, bool soften, float softness){
  vec2 p = pt - center;
  float softVal = softness;
  
  float edge = soften ? radius * softVal : 0.0;
  return 1.0 - smoothstep(radius - edge, radius + edge, length(p));
}

float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  pt -= center;
  float len = length(pt);
  float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);

  return result;
}

float line(float x, float y, float line_width, float edge_thickness){
  return smoothstep(x-line_width/2.0-edge_thickness, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_thickness, y);
}

float sweep(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  vec2 d = pt - center;
  float theta = u_time * 2.0;
  vec2 p = vec2(cos(theta), -sin(theta))*radius;
  float h = clamp( dot(d,p)/dot(p,p), 0.0, 1.0 );
  //float h = dot(d,p)/dot(p,p);
  float l = length(d - p*h);

  float gradient = 0.0;
  const float gradient_angle = PI * 0.5;

  if (length(d)<radius){
    float angle = mod(theta + atan(d.y, d.x), PI2);
    gradient = clamp(gradient_angle - angle, 0.0, gradient_angle)/gradient_angle * 0.5;
  }

  return gradient + 1.0 - smoothstep(line_width, line_width+edge_thickness, l);
}


void main (void)
{
  vec3 axis_color = vec3(0.8);
  vec3 color = line(v_uv.x, 0.5, 0.002, 0.001) * axis_color;
  color += line(v_uv.y, 0.5, 0.002, 0.001) * axis_color;
  color += circle(v_uv, vec2(0.5), 0.3, 0.002, 0.003) * axis_color;
  color += circle(v_uv, vec2(0.5), 0.2, 0.002, 0.003) * axis_color;
  color += circle(v_uv, vec2(0.5), 0.1, 0.002, 0.003) * axis_color;
  color += sweep(v_uv, vec2(0.5), 0.3, 0.003, 0.002) * vec3(1.0, 0.0, 1.0);

  //~ Dots on the radar circle

  color += circle(v_uv, vec2(0.4, 0.6), 0.01, true, 0.2) * vec3(0.0, sin(u_time * 3.0), 0.0);
  color += circle(v_uv, vec2(0.6, 0.4), 0.01, true, 0.2) * vec3(0.0, cos(u_time * 3.0), 0.0);
  color += circle(v_uv, vec2(0.533, 0.561), 0.01, true, 0.2) * vec3(0.0, cos(u_time * 3.0), 0.0);
  color += circle(v_uv, vec2(0.765, 0.200), 0.01, true, 0.2) * vec3(0.0, cos(u_time * 3.0), 0.0);
  color += circle(v_uv, vec2(clamp(sin(u_time * 0.2) + cos(u_time * 0.4), 0.2, 0.7), clamp(cos(u_time * 0.2), 0.2, 0.7)), 0.01, true, 0.2) * vec3(tan(u_time * 3.0), 0.0, 0.0);
  gl_FragColor = vec4(color, 1.0); 
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer();

const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

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
scene.add(plane);

camera.position.z = 1;

onWindowResize();
animate();

//End of your code
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
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
