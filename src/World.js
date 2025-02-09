// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);    
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1, .2, .2, 1); // error put redish
    }
  }`

// global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_whichTexture;

let a_UV;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }


  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_Size
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }


  // get storage location of u_sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }

  const identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const LINE = 3;
const DRAW = 4;
// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedCircleSegments = 5;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;

let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_legAnimation=false;

let g_legSwingAngle = 0;
let g_legSwingSpeed = 1;
let frontLegSwing = 0;
let backLegSwing = 0;
function addActionsForHtmlUI() {
  document.getElementById("angleSlide").addEventListener("mousemove", function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById("yellowSlide").addEventListener("mousemove", function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById("magentaSlide").addEventListener("mousemove", function() { g_magentaAngle = this.value; renderAllShapes(); });
  document.getElementById("legSlide").addEventListener("mousemove", function() { frontLegSwing = this.value / 30; backLegSwing = -frontLegSwing; renderAllShapes(); });

  document.getElementById("animationYellowOffButton").onclick = function() {g_yellowAnimation=false;};
  document.getElementById("animationYellowOnButton").onclick = function() {g_yellowAnimation=true;};

  document.getElementById("animationMagentaOffButton").onclick = function() {g_magentaAnimation=false;};
  document.getElementById("animationMagentaOnButton").onclick = function() {g_magentaAnimation=true;};
  document.getElementById("animationLegOnButton").onclick = function() {g_legAnimation=true;};
  document.getElementById("animationLegOffButton").onclick = function() {g_legAnimation=false;};
}

let g_jump = false;
let g_jumpStartTime = 0;
let g_jumpDuration = 1000;
let g_jumpHeight = 0.5;
let g_jumpOffset = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();  
  // set up actions fpr html elements
  addActionsForHtmlUI();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // canvas.onmousedown = function(ev) {g_mouseDown = true};
  // canvas.onmouseup = function(ev) {g_mouseDown = false};
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) {rotateScene(ev);}};
  canvas.onmousedown = function(ev) {if (ev.shiftKey == true && !g_jump)
    {
      g_jump = true;
      g_jumpStartTime = performance.now();
      requestAnimationFrame(jump);
    }};


  document.onkeydown = keydown;

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // renderScene();
  requestAnimationFrame(tick);
}

function keydown(ev) {
  if (ev.keyCode == 68) {
    //right
    g_camera.right();
  }
  if (ev.keyCode == 65) {
    g_camera.left();
  }
  if (ev.keyCode == 87) {
    //forward
    g_camera.forward();
  }
  if (ev.keyCode == 83) {
    //back
    g_camera.back();
  }

  if (ev.keyCode == 81) {
    g_camera.panLeft();
  }

  if (ev.keyCode == 69) {
    g_camera.panRight();
  }
  renderAllShapes();
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0-g_startTime;
function tick() {
  g_seconds = performance.now() / 1000.0-g_startTime;
  // console.log(g_seconds);
  updateAnimationAngles();

  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45 * Math.sin(g_seconds)) / 10;
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45 * Math.sin(3*g_seconds)) / 10;
  }

  if (g_legAnimation) {

  // have some leg swing to simulate walking
  g_legSwingAngle += g_legSwingSpeed;
  if (g_legSwingAngle > 30 || g_legSwingAngle < -30) {
      g_legSwingSpeed = -g_legSwingSpeed;
  }

  frontLegSwing = Math.sin((g_legSwingAngle * Math.PI) / 180);
  // back legs will swing opposite to give walking effect
  backLegSwing = -frontLegSwing;
  }
}

let g_sceneRotation = [0.0, 0.0];
function rotateScene(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);
  g_sceneRotation[1] = x * 100;
  g_sceneRotation[0] = y * 100;
}
function convertCoordinatesEventToGL(ev) {

  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function initTextures() {
  var image = new Image();
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function() {
    sendTextureToGLSL(image);
  };
  image.src = "sky.jpg";
  return true;
}

function sendTextureToGLSL(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image y axis
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);

  console.log("finished loadTexture");
}

function drawCube(matrix, color) {
  var body = new Cube();
  body.color = color;
  body.matrix = matrix;
  body.render();
}

function drawCylinder(matrix, color) {
  const cylinder = new Cylinder();
  cylinder.matrix = matrix;
  cylinder.color = color;
  cylinder.render();
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
]

function drawMap() {
  // for (x = 0;  x < 8; x++ ) {
  //   for (y = 0; y < 8; y++) {
  //     if (g_map[x][y] == 1) {
  //       var body = new Cube();
  //       body.color = [1.0, 1.0, 1.0, 1.0];
  //       body.textureNum = -2;
  //       body.matrix.translate(x-4, -0.75, y-4);
  //       body.render();
  //     }
  //   }
  // }
  for (x = 0;  x < 32; x++ ) {
    for (y = 0; y < 32; y++) {
      if (x<1 || x == 31 || y == 0 || y == 31) {
        var body = new Cube();
        body.color = [0.8, 1.0, 1.0, 1.0];
        body.textureNum = -2;
        body.matrix.translate(0, -0.75, 0);
        body.matrix.scale(.4, .4, .4);
        body.matrix.translate(x-16, 0, y-16);
        body.renderfaster();
      }
    }
  }
}
// var g_eye = [0, 0, 3];
// var g_at = [0,0,-100];
// var g_up=[0,1,0];
// i do not understand for the absolutel ife of me why moving this into camera.js does not work because vscode says it is within scope and intellisense can find all the associated methods but for gods sake it does not think it is defined and i absolutely hate this
class Camera {
  constructor() {
      this.eye = new Vector3([0,0,3]);
      this.at = new Vector3([0,0,-100]);
      this.up = new Vector3([0,1,0]);
      this.alpha = 90;
  }

  forward() {

      const f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
      f.sub(this.eye);
      f.div(f.magnitude());
      this.at.add(f);
      this.eye.add(f);
    }

  back() {
      const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
      f.sub(this.at);
      f.div(f.magnitude());
      this.at.add(f);
      this.eye.add(f);
  }
  left() {
    const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
      f.sub(this.at);
      f.div(f.magnitude());
      const s = Vector3.cross(f, this.up);
      s.div(s.magnitude());
      this.at.add(s);
      this.eye.add(s);
  }
  right() {
    const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
      f.sub(this.at);
      f.div(f.magnitude());
      const s = Vector3.cross(f, this.up);
      s.div(s.magnitude());
      this.at.sub(s);
      this.eye.sub(s);
  }
  panLeft() {
    const f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
    f.sub(this.eye);
    f.div(f.magnitude());
    const rotMat = new Matrix4().setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    const f_prime = rotMat.multiplyVector3(f);
    
    const eye_f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
    eye_f.add(f_prime);
    this.at = eye_f;
  }

  panRight() {
    const f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
    f.sub(this.eye);
    f.div(f.magnitude());
    const rotMat = new Matrix4().setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    const f_prime = rotMat.multiplyVector3(f);
    
    const eye_f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
    eye_f.add(f_prime);
    this.at = eye_f;
  }
}
// Test script (separate from your WebGL code)
const v1 = new Vector3([1, 0, 0]);
const v2 = new Vector3([0, 1, 0]);

const v3 = v1.sub(v2);
console.log("v1 - v2:", v3);

v3.normalize();
console.log("Normalized:", v3);

const v4 = Vector3.cross(v1,v2);
console.log("Cross product: ", v4);

const v5 = v1.add(v2);
console.log("v1 + v2: ", v5);


// debugger;
var g_camera = new Camera();

function renderAllShapes() {
  var startTime = performance.now();

  let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  var projMat = new Matrix4();
  projMat.setPerspective(30, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  let viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1],   g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);

  // console.log(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
  //   g_camera.at.elements[0], g_camera.at.elements[1],   g_camera.at.elements[2],
  //   g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draw the floor
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // draw sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  drawMap();

  // draw body cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.translate(-0.25, -0.25, -0.25);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();
  
  // drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );
  // var body = new Matrix4();
  // let bodyColor = [1.0, 0.9, 0.5, 1.0];
  // body.translate(-0.25, -0.05, -0.1);
  // body.rotate(g_sceneRotation[0], 1, 0, 0);
  // body.rotate(g_sceneRotation[1], 0, 1, 0);
  // body.translate(0, g_jumpOffset, 0);
  // var bodyCoordinates = new Matrix4(body);
  // body.scale(0.7, 0.3, 0.5);
  // drawCube(body, bodyColor);

  // const leg1 = new Matrix4(bodyCoordinates);
  // leg1Color = [0.8, 0.5, 0.3, 1.0];
  // bodyCoordinates = new Matrix4(leg1);
  // leg1.rotate(frontLegSwing * 15, 0, 0, 1);
  // leg1.translate(0.05, -0.2, 0.05);
  // leg1.scale(0.1, 0.25, 0.1);
  // drawCube(leg1, leg1Color);


  // const leg2 = new Matrix4(bodyCoordinates);
  // leg2Color = [0.8, 0.5, 0.3, 1.0];
  // // leg2 = bodyCoordinates;
  // bodyCoordinates = new Matrix4(leg2);
  // leg2.rotate(backLegSwing * 15, 0, 0, 1);
  // leg2.translate(0.05, -0.2, 0.35);
  // leg2.scale(0.1, 0.25, 0.1);
  // drawCube(leg2, leg2Color);


  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}