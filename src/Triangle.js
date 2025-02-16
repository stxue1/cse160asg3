
function drawTriangle(vertices) {
    var n = 3;
    var vertexBuffer = gl.createBuffer();

    if (!vertexBuffer) {
        console.log("Failed to create buffer object");
        return -1;
    }

    // bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return -1;
    }
    
    // assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null;
var g_uvBuffer = null;

function initTriangle3d(vertices) {
    if (g_vertexBuffer == null) {
        g_vertexBuffer = gl.createBuffer();        
    }

    if (!g_vertexBuffer) {
        console.log("Failed to create buffer object");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
}

function initUV3d(uvs) {
    if (g_uvBuffer == null) {
        g_uvBuffer = gl.createBuffer();
    }
    if (!g_uvBuffer) {
        console.log("failed to create uv buffer object");
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.DYNAMIC_DRAW);
}

function drawTriangle3D(vertices) {
    var n = vertices.length / 3;

    if (g_vertexBuffer == null) {
        initTriangle3d();
    }
    
    // write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangleWithColor(vertices, rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle(vertices);
}

function drawTriangle3DUVMultiple(vertices, uvs) {
    const numVertices = vertices.length / 3; // Total number of vertices
    initTriangle3d(vertices);
    // if (g_vertexBuffer == null) {
    // }

    // if (g_uvBuffer == null) {
    //     initUV3d(uvs);
    // }
    initUV3d(uvs);

    // gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);


    // gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    // gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_UV);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, uvs);

    gl.drawArrays(gl.TRIANGLES, 0, numVertices); // Single drawArrays call

    // g_vertexBuffer = null;
    // g_uvBuffer = null
}
function drawTriangle3DUV(vertices, uv) {
    var n = vertices.length / 3;
    var vertexBuffer = gl.createBuffer();

    if (!vertexBuffer) {
        console.log("Failed to create buffer object");
        return -1;
    }

    // bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // create buffer obj for uv
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
        console.log("failed to create buffer obj");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    g_vertexBuffer = null;
}


class Triangle{
    constructor() {
        this.type= "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size=  5.0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // gl.vertexAttrib3b(a_Position, xy[0], xy[1], 0.0);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniform1f(u_Size,size);

        var d = this.size/200.0;
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
    }
}