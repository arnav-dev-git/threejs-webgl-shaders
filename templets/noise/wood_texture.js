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
#include <noise>

uniform vec3 u_LightColor;
uniform vec3 u_DarkColor;
uniform float u_Frequency;
uniform float u_NoiseScale;
uniform float u_RingScale;
uniform float u_Contrast;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

varying vec3 v_position;

void main(){
    float n = snoise(v_position); 
    float ring = fract(u_NoiseScale * n);
    ring *= u_Contrast * (1.0 - ring);
    float lerp = pow(ring, u_RingScale) + n;
    // float lerp = pow(ring, u_RingScale*sin(tan(u_time)) * 10.0) + n; // cool flash effect
    vec3 color = mix(u_DarkColor, u_LightColor, lerp);
  
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

const uniforms = {};
uniforms.u_time = { value: 0.0 };
uniforms.u_mouse = { value: { x: 0.0, y: 0.0 } };
uniforms.u_resolution = { value: new THREE.Vector2() };
uniforms.u_LightColor = { value: new THREE.Color(0xbb905d) };
uniforms.u_DarkColor = { value: new THREE.Color(0x7d490b) };
uniforms.u_Frequency = { value: 2.0 };
uniforms.u_NoiseScale = { value: 6.0 };
uniforms.u_RingScale = { value: 0.6 };
uniforms.u_Contrast = { value: 4.0 };

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
