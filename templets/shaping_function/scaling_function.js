//Enter your code here

//shaders

//vertex shader
const vShader = `
  varying vec3 v_position;
  void main(){
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0, 1.0);
  }
`;

//fragment shader

//draw a circle out of a plane
const fShader = `

  varying vec3 v_position;
  uniform vec2 u_resolution;
  uniform float u_time;

  //& getting th points to make a rectangle
  float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center, float smooth)  
  {
    vec2 p = pt - center;

    vec2 halfSize = size * 0.5;

    // float smooth = 0.005;

    float horz = smoothstep(-halfSize.x -anchor.x, -halfSize.x - anchor.x + smooth, p.x) - smoothstep(halfSize.x - anchor.x, halfSize.x - anchor.x + smooth, p.x);
    float vert = smoothstep(-halfSize.y - anchor.y, -halfSize.y - anchor.y + smooth, p.y) - smoothstep(halfSize.y - anchor.y, halfSize.y - anchor.y + smooth, p.y);

    return horz * vert;
  }

  //& rotation matrix coordinates function
  mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
  }

  //& scaling function
  mat2 getScaleMatrix(float scale){
    return mat2(scale, 0.0, 0.0, scale);
  }
 

  void main()
  {
    float radius = 0.5;

    float speed = 5.0;

    float smoothEdge = 0.005 * sin(u_time * 0.7);

    vec2 center = vec2(0.0, 0.0);

    //! getting the rotation coordinates
    mat2 matr = getRotationMatrix(u_time);

    //!scaling the square
    // mat2 mats = getScaleMatrix(2.);

    //!animated scaling
    mat2 mats = getScaleMatrix((sin(u_time)+1.0)/3.0 + 0.7);

    //! in this way center can be changed while rotating
    vec2 pt = (mats * matr * (v_position.xy - center)) + center;

    
    float inRect = rect(pt, vec2(0.25), vec2(0.5), center, smoothEdge);

    vec3 color = vec3(0.,1.,0.) * inRect;
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
