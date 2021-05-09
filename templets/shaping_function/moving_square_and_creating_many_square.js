//Enter your code here

//shaders

//vertex shader
const vShader = `
  varying vec3 v_position;
  void main(){
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.4, 1.0);
  }
`;

//fragment shader

//draw a circle out of a plane
const fShader = `

  varying vec3 v_position;
  uniform vec2 u_resolution;
  uniform float u_time;

  float rect(vec2 pt, vec2 size, vec2 center)  
  {
    vec2 p = pt - center;

    vec2 halfSize = size * 0.5;

    float horz = step(-halfSize.x, p.x) - step(halfSize.x, p.x);
    float vert = step(-halfSize.y, p.y) - step(halfSize.y, p.y);

    return horz * vert;
  }
 
  void main()
  {
    // vec2 value_with_time = vec2(sin(u_time) , cos(u_time));
    // float inRect = rect(v_position.xy, vec2(1.0), vec2(-0.5,0.0));

    float inRect_left = rect(v_position.xy, vec2(0.3), vec2(-0.5,0.0));
    float inRect_right = rect(v_position.xy, vec2(0.4), vec2(0.5,0.0));
    
    vec3 color_yellow = vec3(1.,1.,0.) * inRect_left;
    vec3 color_green = vec3(0.,1.,0.) * inRect_right;

    // vec3 color = vec3(1.,1.,0.) * inRect;
    gl_FragColor = vec4(color_yellow + color_green, 1.0);
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
