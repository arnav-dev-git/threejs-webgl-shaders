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
    v_size_factor = 1.;
    // v_size_factor = 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * v_size_factor, 1.0);
  }
`;

//fragment shader

//draw a circle out of a plane
const fShader = `

  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;

  varying vec3 v_position;

  //veriable global
  #define NUMS_PARTICLE 100.0
  #define NUMS_EXPLOSION 4.0
  #define PI 3.14159265359
  #define PI2 6.28318530718

  //&cartesian coordinates -> square explosion
  vec2 hash12(float t){

    float x = fract(sin(t * 674.3) * 453.2);
    float y = fract(sin((t+x) * 714.3) * 263.2);
    
    return vec2(x, y);
  }

  //&polar coordinates -> circular explosion
  vec2 hash12_polar(float t){

    float a = fract(sin(t * 674.3) * 453.2) * PI2;
    float d = fract(sin((t+a) * 714.3) * 263.2);
    
    return vec2(sin(a), cos(a))*d;
  }

  float Explosion(vec2 uv, float t)
  {
    float sparkels = 0.0;
    for(float i = 0.0; i < NUMS_PARTICLE; i+= 1.){
      
      // vec2 dir = hash12(i + 1.0) - 0.5;
      vec2 dir = hash12_polar(i + 1.0)*0.5;
      // float t = fract(u_time);
      float d = length(uv - dir*t);
      
      float brightness = mix(0.0005, 0.002, smoothstep(0.1, 0.0, t));

      brightness *= sin(t*20. + i)*.5 + .5;
      brightness *= smoothstep(1.0, 0.75, t);
      
      sparkels += brightness/d;
    }
    return sparkels;
  }

  void main(){
    vec2  uv = (gl_FragCoord.xy - .5 * u_resolution.xy)/u_resolution.y;
    vec3 col = vec3(0.0);    

    for(float i = 0.0; i < NUMS_EXPLOSION; i++)
    {
      float t = u_time + i/NUMS_EXPLOSION;
      float ft = floor(t);
      vec3 color = sin(4.0 * vec3(0.34, 0.54, 0.43) * ft)*.25+.75;
      
      vec2 offs = hash12(i + 1.0 + ft) - 0.5;
      offs *= vec2(1.77, 1.);

      // col += 0.001/length(uv - offs);
      // col *= 2.0;
      col += Explosion(uv - offs, fract(t)) * color;
    }
   
    gl_FragColor = vec4(col, 1.0);
  }
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });

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
