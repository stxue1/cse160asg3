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
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);    
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1.0, .6, .6, 1.0); // error put redish
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
let u_Sampler1;



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

  g_camera = new Camera();
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

  // get storage location of u_sampler0
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
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

let controls;
let pointerLocked = false;
function addActionsForHtmlUI() {
  document.getElementById("mouseSensitivity").addEventListener("mousemove", function() { controls.mouseSensitivity = this.value; });
  document.getElementById("moveSensitivity").addEventListener("mousemove", function() { controls.moveSensitivity = this.value; });
  document.getElementById("goFullScreen").onclick = function() {goFullscreen();};
  document.getElementById("checkWaldo").onclick = function() {checkWaldo();};


  document.addEventListener('fullscreenchange', fullscreenChange); // Modern browsers
  document.addEventListener('mozfullscreenchange', fullscreenChange); // Firefox
  document.addEventListener('webkitfullscreenchange', fullscreenChange); // Safari and Chrome
  document.addEventListener('msfullscreenchange', fullscreenChange); // IE/Edge
}


function testFirefox() {
  const firefox = navigator.userAgent.toLowerCase().indexOf("firefox");
  if (firefox > -1) {
    alert("Firefox is not supported. Please use Chrome.")
  }
}
function main() {
  testFirefox();
  setupWebGL();

  connectVariablesToGLSL();  
  // set up actions fpr html elements
  addActionsForHtmlUI();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  controls = new RotateControls(g_camera);

  // canvas.onmousedown = function(ev) {g_mouseDown = true};
  // canvas.onmouseup = function(ev) {g_mouseDown = false};
  // canvas.onmousemove = function(ev) { if (ev.buttons == 1) {rotateScene(ev);}};


  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  setupCoordinates();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // renderScene();
  requestAnimationFrame(tick);
}

function keydown(ev) {
  controls.keydown[ev.keyCode] = true;
}

function keyup(ev) {
  controls.keydown[ev.keyCode] = false;
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0-g_startTime;
let g_last = performance.now();
function tick() {
  g_seconds = performance.now() / 1000.0-g_startTime;
  updateAnimationAngles();
  const g_now = performance.now();
  controls.update((g_now - g_last) / 1000.0);
  renderAllShapes();
  requestAnimationFrame(tick);
  g_last = g_now;
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45 * Math.sin(g_seconds)) / 10;
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45 * Math.sin(3*g_seconds)) / 10;
  }

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
    sendTextureToGLSL(image, 0);
  };
  image.src = "test.png";

  var skyImage = new Image();
  skyImage.onload = function() {
    sendTextureToGLSL(skyImage, 1);
  }
  skyImage.src = "sky.jpg";
  return true;
}

let textures = {};

function sendTextureToGLSL(image, textureUnit) {
  var texture = gl.createTexture();
  // if (textures[textureUnit] == null) {
  //   textures[textureUnit] = gl.createTexture();
  // }
  // if (!textures[textureUnit]) {
  //   console.log("Failed to create the texture object");
  //   return false;
  // }

  function bindTexture(texture, image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image y axis
  // enable texture unit0
  if (textureUnit == 1) {
    gl.activeTexture(gl.TEXTURE1);
    bindTexture(texture, image);
    gl.uniform1i(u_Sampler1, 1);
} else if (textureUnit == 2) {
    gl.activeTexture(gl.TEXTURE2);
  } else {
    gl.activeTexture(gl.TEXTURE0);
    bindTexture(texture, image);
    gl.uniform1i(u_Sampler0, 0);
  }

  console.log("finished loadTexture");
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
];
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function setupCoordinates() {
  let x, y, z;
  x = getRandomInt(- ((width - 1) / 2), (width - 1) / 2);
  y = 0;
  z = getRandomInt(- ((width - 1) / 2), (width - 1) / 2);
  waldoCoords = [x, y, z];


  x = getRandomInt(- ((width - 1) / 2), (width - 1) / 2);
  y = 0;
  z = getRandomInt(- ((width - 1) / 2), (width - 1) / 2);
  pierCoords = [x, y, z];

  if (waldoCoords[0] == pierCoords[0] && waldoCoords[2] == pierCoords[2]) {
    setupCoordinates();
  }
}


extra_blocks = {};

const waveHeight = 0.5;
const waveFrequency = 0.2;
const waveSpeed = 0.1;
const width = 50;

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
  const time = Date.now() * 0.001;
  for (x = 0;  x < width; x++ ) {
    for (y = 0; y < width; y++) {
      if (true) {
        var body = new Cube();
        body.loadTexture2();
        body.color = [0.8, 1.0, 1.0, 1.0];
        body.textureNum = 0;
        body.matrix.translate(0, -2, 0);
        // body.matrix.scale(0.5, 0.5, 0.5);

        const zOffset = waveHeight * Math.sin(waveFrequency * (x + y) + waveSpeed * time);
        body.matrix.translate(x-width /2, zOffset, y-width/2);
        body.renderfast();
      }
    }
  }
}
// var g_eye = [0, 0, 3];
// var g_at = [0,0,-100];
// var g_up=[0,1,0];

// debugger;

let waldoCoords = [3, 0, 0];
let pierCoords = [-3, 0, 0];
let g_camera;

let doHighlight = true; 
function renderAllShapes() {
  var startTime = performance.now();

  let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 100);
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

  // //draw the floor
  // var body = new Cube();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.textureNum = 0;
  // body.matrix.translate(0, -0.75, 0.0);
  // body.matrix.scale(10, 0, 10);
  // body.matrix.translate(-0.5, 0, -0.5);
  // body.renderfast();

  // draw sky
  var sky = new Cube();
  sky.loadSkyTexture();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 1;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderfast();

  drawMap();
  // draw body cube
  // var body = new Cube();
  // body.loadTexture1();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.textureNum = 0;
  // // body.matrix.rotate(90, 1, 0, 0);
  // body.matrix.translate(-0.25, -0.25, -0.25);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.renderfast();


  for (const key in extra_blocks) {
    const extra_block = extra_blocks[key];
    var test_ray = new Cube();
    test_ray.loadTexture3();
    test_ray.color = [1.0, 0.0, 0.0, 1.0];
    test_ray.textureNum = 0;
    // test_ray.matrix.rotate(90, 1, 0, 0);
    // test_ray.matrix.scale(0.5, 0.5, 0.5);
    test_ray.matrix.translate(extra_block[0], extra_block[1], extra_block[2]);
    test_ray.renderfast();
    
  }

  const [x, y, z] = controls.getLookingAt();
  const time = Date.now() * 0.001;
  const offset = 0.005 * Math.sin(10 * time);
  const size = 1.001 + offset;

  if (doHighlight) {

    var highlighted = new Cube();
    highlighted.loadTexture1();
    highlighted.color = [1.0, 0.0, 0.0, 1.0];
    highlighted.textureNum = -10;
    // highlighted.matrix.rotate(90, 1, 0, 0);
    highlighted.matrix.translate(x - 0.5 * offset, y - 0.25 * offset, z - 0.25 * offset);
    highlighted.matrix.scale(size, size, size);
    highlighted.renderfast();
  }


  var waldo = new Cube();
  const waldox = waldoCoords[0];
  const waldoy = waldoCoords[1];
  const waldoz= waldoCoords[2];
  waldo.loadTexture4();
  waldo.color = [1.0, 0.0, 0.0, 1.0];
  waldo.textureNum = 0;
  // waldo.matrix.rotate(90, 1, 0, 0);
  waldo.matrix.translate(waldox, waldoy, waldoz);
  waldo.renderfast();

  var pier = new Cube();
  const pierx = pierCoords[0];
  const piery = pierCoords[1];
  const pierz= pierCoords[2];
  pier.loadTexture4();
  pier.color = [0.25, 0.9, 0.25, 1.0];
  pier.textureNum = -2;
  // pier.matrix.rotate(90, 1, 0, 0);
  pier.matrix.translate(pierx, piery, pierz);
  pier.renderfast();


  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function checkWaldo() {
  let [wx, wy, wz] = waldoCoords;
  wy -= 1;

  let [px, py, pz] = pierCoords;
  py -= 1;
  const pathExists = findPath([wx, wy, wz], [px, py, pz]);

  if (pathExists == true) {
    alert("Congratulations! You beat the game!");
  } else {
    alert("Try again");
  }
}
function findPath(startCoord, endCoord) {
  const [startX, startY, startZ] = startCoord;
  const [endX, endY, endZ] = endCoord;

  if (startY !== endY) {
    return false;
  }

  const visited = new Set();
  const queue = [[startX, startY, startZ]];

  while (queue.length > 0) {
    const [currentX, currentY, currentZ] = queue.shift();

    const currentCoordStr = `${currentX},${currentY},${currentZ}`;
    if (!extra_blocks.hasOwnProperty(currentCoordStr)) continue;

    if (currentX === endX && currentY === endY && currentZ === endZ) {
      return true;
    }

    visited.add(currentCoordStr);

    const adjacentCoords = [
      [currentX + 1, currentY, currentZ],
      [currentX - 1, currentY, currentZ],
      [currentX, currentY, currentZ + 1],
      [currentX, currentY, currentZ - 1],
    ];

    for (const [nextX, nextY, nextZ] of adjacentCoords) {
      const nextCoordStr = `${nextX},${nextY},${nextZ}`;
      if (
        nextY === startY &&
        extra_blocks.hasOwnProperty(nextCoordStr) &&
        !visited.has(nextCoordStr)
      ) {
        queue.push([nextX, nextY, nextZ]);
      }
    }
  }

  return false;
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}