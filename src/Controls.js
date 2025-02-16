class RotateControls {
  constructor(object) {
    this.camera = object;

    this.mouse = new Vector3([0, 0, 0]); // will use as a vector2
    this.setHandlers();
    this.keydown = {};
    this.moveSensitivity = 10;
    this.mouseSensitivity = 50;
  }

  handleMouseMove(e) {
    const deltaX = e.movementX;
    const deltaY = e.movementY;


    if (pointerLocked) {
      this.mouse = this.mouse.set(new Vector3([deltaX, deltaY, 0]));
    }
  }

  getLookingAt() {

    const f = new Vector3();
    f.set(this.camera.at);
    f.sub(this.camera.eye);
    f.normalize().mul(3);

    f.add(this.camera.at);

    const x = Math.floor(f.elements[0]);
    const y = Math.floor(f.elements[1]);
    const z = Math.floor(f.elements[2]);
    
    return [x, y, z];
  }

  handleMouseClick(e) {
    // console.log(this.camera.eye.elements, this.camera.at.elements);

    // console.log(f.elements);
    const [x, y, z] = this.getLookingAt();

    if (x == waldoCoords[0] && y == waldoCoords[1] && z == waldoCoords[2]) {
      return;
    }

    if (x == pierCoords[0] && y == pierCoords[1] && z == pierCoords[2]) {
      return;
    }

    const key = [x + "," + y + "," + z];
    if (e.button == 0) {
      if (extra_blocks[key]) {
        delete extra_blocks[key];
      }
    }
    if (e.button == 2) {
      extra_blocks[key] = [x, y, z];
    }

    if (e.button == 1) {
      doHighlight = !doHighlight;
    }

  }
  setHandlers() {
    canvas.addEventListener('click', () => {
      if (!pointerLocked) {
        canvas.requestPointerLock().catch(error => {
          console.warn("Pointer lock request failed:", error); // Log the error
          // if(error.message.includes("The user has exited the lock before this request was completed")){
          // }
      });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key == "Escape" && pointerLocked) {
        document.exitPointerLock();
      }
    });
    
    canvas.addEventListener('mousemove', (e) => {
      pointerLocked = document.pointerLockElement === canvas;
      if (pointerLocked) {
      this.handleMouseMove(e);}});
    canvas.addEventListener('click', (e) => {
      pointerLocked = document.pointerLockElement === canvas;
      if (pointerLocked) {this.handleMouseClick(e);}})
  }

  update(deltaTime) {
    deltaTime = 0.016;
    const mouseDelta = deltaTime * this.mouseSensitivity;
    const moveDelta = deltaTime * this.moveSensitivity;
    let x = this.mouse.elements[0] * mouseDelta;
    let y = this.mouse.elements[1] * mouseDelta;

    function repeatPan(func, x) {
        for (let i = x; i > 0;) {
          const degrees = i % 90;
          func(degrees);
          i -= 90;
        }
    }
    if (x < 0) {
      repeatPan(this.camera.panLeft.bind(this.camera), Math.abs(x));
    }
    if (x > 0) {
      repeatPan(this.camera.panRight.bind(this.camera), Math.abs(x));
    }
    if (y > 0) {
      repeatPan(this.camera.panDown.bind(this.camera), Math.abs(y));
    }
    if (y < 0) {
      repeatPan(this.camera.panUp.bind(this.camera), Math.abs(y));
    }
    this.clear();

    if (this.keydown[68]) {
      //right
    // console.log(this.camera.at.elements, this.camera.eye.elements);
    g_camera.right(moveDelta);
    }
    if (this.keydown[65]) {
      g_camera.left(moveDelta);
    }
    if (this.keydown[87]) {
      //forward
      g_camera.forward(moveDelta);
    }
    if (this.keydown[83]) {
      //back
      g_camera.back(moveDelta);
    }

    if (this.keydown[81]) {
      g_camera.panLeft(3);
    }

    if (this.keydown[69]) {
      g_camera.panRight(3);
    }

    if (this.keydown[90]) {
      g_camera.panDown(3);
    }

    if (this.keydown[88]) {
      g_camera.panUp(3);
    }
    renderAllShapes();
  }



  clear() {
    this.mouse.elements[0] = 0;
    this.mouse.elements[1] = 0;
  }
}