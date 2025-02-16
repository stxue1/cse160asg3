
function resizeCanvas() {
    gl.viewport(0, 0, canvas.width, canvas.height);
  
    // Recalculate projection matrix (important!)
    const projectionMatrix = new Matrix4(); // Or your matrix library
    projectionMatrix.setPerspective(30, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);
  }
  
  function fullscreenChange() {
    const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    if (fullscreenElement) {
      canvas.width = fullscreenElement.offsetWidth;
      canvas.height = fullscreenElement.offsetHeight;
    } else {
      canvas.width = 1280;
      canvas.height = 800;
    }
    resizeCanvas();
  }
  function goFullscreen() {
    if(canvas.requestFullScreen) {
      canvas.requestFullScreen();
    }
    else if(canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    }
    else if(canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen();
    }
    fullscreenChange();
  }
  class Camera {
    constructor() {
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,0]);
        this.up = new Vector3([0,1,0]);
        this.alpha = 90;
    }
  
    forward(delta) {
  
        const f = new Vector3([this.at.elements[0], this.at.elements[1], this.at.elements[2]]);
        f.sub(this.eye);
        f.div(f.magnitude()).mul(delta);
        this.at.add(f);
        this.eye.add(f);
      }
  
    back(delta) {
        const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
        f.sub(this.at);
        f.div(f.magnitude()).mul(delta);
        this.at.add(f);
        this.eye.add(f);
    }
    left(delta) {
      const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
        f.sub(this.at);
        f.div(f.magnitude());
        const s = Vector3.cross(f, this.up);
        s.div(s.magnitude()).mul(delta);
        this.at.add(s);
        this.eye.add(s);
    }
    right(delta) {
      const f = new Vector3([this.eye.elements[0], this.eye.elements[1], this.eye.elements[2]]);
        f.sub(this.at);
        f.div(f.magnitude());
        const s = Vector3.cross(f, this.up);
        s.div(s.magnitude()).mul(delta);
        this.at.sub(s);
        this.eye.sub(s);
    }
    panLeft(delta) {
        const f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
    
        // let alpha = delta; // Use delta for alpha
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(delta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);; // Rotate around up
        const f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.normalize();
    
        this.at.set(this.eye);
        this.at.add(f_prime);
    }
  
    panRight(delta) {
      const f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);

      const rotMat = new Matrix4().setRotate(-delta, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      const f_prime = rotMat.multiplyVector3(f);
      f_prime.normalize();
      
      this.at.set(this.eye)
      this.at.add(f_prime);
    }

    panUp(delta) {
      const f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      const s = Vector3.cross(f, this.up)

      const rotMat = new Matrix4().setRotate(this.outofbounds(delta, f, "up"), s.elements[0], s.elements[1], s.elements[2]);
      
      const f_prime = rotMat.multiplyVector3(f);
      f_prime.normalize();
      this.at.set(this.eye);
      this.at.add(f_prime);
    }

    outofbounds(alpha, f, direction) {
      const THETA = ((Math.acos(Vector3.dot(this.up, f) / (this.up.magnitude() * f.magnitude()))) * 180) / Math.PI;
      const EPSILON = 0.001;

      let newTheta = (direction == "up") ? THETA - alpha : THETA + alpha;

      if(newTheta > (180 - EPSILON) || newTheta < EPSILON) {
        return 0;
      } else {
        return alpha;
      }
    }

    panDown(delta) {
        const f = new Vector3();
        f.set(this.at)
        f.sub(this.eye);
        const s = Vector3.cross(f, this.up)
  

    // Find the current angle between the 'up' and 'forward' vectors

        const rotMat = new Matrix4().setRotate(-this.outofbounds(delta, f, "down"), s.elements[0], s.elements[1], s.elements[2]);
        
        const f_prime = rotMat.multiplyVector3(f);
        f_prime.normalize();
        this.at.set(this.eye);
        this.at.add(f_prime);
    }
  }
