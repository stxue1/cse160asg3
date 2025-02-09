
class Line{
    constructor() {
      this.type="line";
      this.position = [0.0, 0.0, 1.0, 1.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
    }

    drawLine(vertices) {
        // use buffer to pass array
        var vertexBuffer = gl.createBuffer();

        if (!vertexBuffer) {
            console.log("Failed to create buffer object");
            return -1;
        }

        // bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // write data into the buffer object
        var n = vertices.length;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.slice()), gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, "a_Position");
        if (a_Position < 0) {
            console.log("Failed to get the storage location of a_Position");
            return -1;
        }
        
        // assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        console.log(vertices);
        gl.drawArrays(gl.LINE_STRIP, 0, n / 2);
    }
    render () {
  
      var rgba = this.color;
      var size = this.size;
    //   gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // pass size
      gl.uniform1f(u_Size, size);
      // unfortunately gl.lineWidth is not supported by windows WebGL due to something with DirectX ANGLE
      // so the width will have to be 1 px 
      // Draw
      this.drawLine(this.position);
    }
  }
  