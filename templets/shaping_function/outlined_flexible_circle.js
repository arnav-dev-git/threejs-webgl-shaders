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

  varying float v_size_factor;

  //& rotation matrix coordinates function
  mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
  }

  float circle(vec2 pt, vec2 center, float radius){
    vec2 p = pt - center;
    return 1.0 - step(radius, length(p));
  }

  float circle(vec2 pt, vec2 center, float radius, bool soften){
    vec2 p = pt - center;
    float softVal = radius < 0.3 ? 0.02 : 0.01;
    if(radius < 0.1){
      softVal = 0.045;
    }
    float edge = soften ? radius * softVal : 0.0;
    return 1.0 - smoothstep(radius - edge, radius + edge, length(p));
  }
 
  //~ circle with stroke

  float circle(vec2 pt, vec2 center, float radius,  float line_width)
  {
    vec2 p = pt - center;
    float len = length(p);
    float half_strock_width = line_width / 2.0;
    
    return step(radius - half_strock_width, len) - step(radius + half_strock_width, len);
  }

  //~ smoothEdge
  float circle(vec2 pt, vec2 center, float radius,  float line_width, bool soften)
  {
    vec2 p = pt - center;
    float len = length(p);
    float half_strock_width = line_width / 2.0;

    float softVal = radius < 0.3 ? 0.02 : 0.007;
    float edge = soften ? softVal : 0.0;
    
    return smoothstep(radius - half_strock_width - edge, radius - half_strock_width, len) - smoothstep(radius + half_strock_width, radius + half_strock_width + edge, len);
  }

  void main()
  {
    vec2 center = vec2(0.0, 0.0);

    // vec3 color = vec3(1.0, 1.0, 0.0) * circle(v_position.xy, center, 0.5, true);
    vec3 color = vec3(1.0, 1.0, 0.0) * circle(v_position.xy, center, 0.5, 0.1, true);
    
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
