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

  varying vec2 v_uv;
  varying vec3 v_position;
  uniform vec2 u_resolution;
  uniform float u_time;

  #define PI 3.141592653589793

  float line(float a , float b, float line_width, float edge_thickness){
    float half_line_width = line_width * 0.5;
    return smoothstep(a - half_line_width - edge_thickness, a - half_line_width, b) - 
                     smoothstep(a + half_line_width, a + half_line_width + edge_thickness, b);
  }

  void main()
  {
    //~ using v_position -> stright line
    // vec3 color = vec3(1.0, 1.0, 0.0) * line(v_position.x, v_position.y, 0.01, 0.001);
    //~ using gl_FragCoord
    // vec2 uv = gl_FragCoord.xy;
    // vec3 color = vec3(1.0, 1.0, 0.0) * line(uv.x, uv.y, 10., 0.001);

    //~ sine wave line
    // vec3 color = vec3(1.0, 1.0, 0.0) * line(v_position.y, sin(v_position.x * PI), 0.05, 0.01);
    //~ previous line is getting out of the screen so lets make the y range smaller
    vec3 color = vec3(1.0, 1.0, 0.0) * line(v_position.y, mix(-0.8, 0.8, (sin(v_position.x * PI) + 1.0)/2.0), 0.05, 0.02);

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
