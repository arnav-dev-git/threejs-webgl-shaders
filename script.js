//Enter your code here

//shaders

//vertex shader
const vShader = `
  varying vec2 v_uv;
  varying float v_size_factor;
  varying vec3 v_position;

  void main(){
    v_uv = uv;
    v_position = position;
    // v_size_factor = 1.;
    v_size_factor = 0.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * v_size_factor, 1.0);
  }
`;

//fragment shader

//draw a circle out of a plane
const fShader = `
#extension GL_OES_standard_derivatives : enable

  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_explosion;

  varying vec3 v_position;

#define Color1 vec3(0.0)
#define Color2 vec3(1.0)


#define Frequency 10.

void main()
{
  vec3  AvgColor = vec3(0.0, 0.0,0.0);
    vec3 color;

    vec2 TexCoord = v_position.xy;
    // Determine the width of the projection of one pixel into s-t space
    vec2 fw = fwidth(TexCoord);

    // Determine the amount of fuzziness
    // vec2 fuzz = fw * Frequency * 2.0;
    vec2 fuzz = fw * 10. * 2.0;

    float fuzzMax = max(fuzz.s, fuzz.t);

    // Determine the position in the checkerboard pattern
    vec2 checkPos = fract(TexCoord * Frequency);

    if (fuzzMax < 0.5)
    {

        // If the filter width is small enough, compute the pattern color
        vec2 p = smoothstep(vec2(0.5), fuzz + vec2(0.5), checkPos) +
                (1.0 - smoothstep(vec2(0.0), fuzz, checkPos));

        color = mix(Color1, Color2, p.x * p.y + (1.0 - p.x) * (1.0 - p.y));

        // Fade in the average color when we get close to the limit
        color = mix(color, AvgColor, smoothstep(0.125, 0.5, fuzzMax));
    }
    else
    {
        // Otherwise, use only the average color
        color = AvgColor;
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);
// const geometry = new THREE.TorusKnotGeometry(0.4, 0.2, 200, 64);

const uniform = {
  u_color: { value: new THREE.Color(0x00ff00) },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0.0, y: 0.0 } },
  u_explosion: { value: 5.0 },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms: uniform,
  opacity: true,
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 100;

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
