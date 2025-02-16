
class Cube {
    constructor() {
        this.type= "cube";
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size=  5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = 0;
        this.cubeVerts = [
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            0, 0, 0,  1, 0, 1,  0, 0, 1,
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            1, 0, 0,  1, 1, 1,  1, 0, 1,
            1, 0, 0,  1, 1, 0,  1, 1, 1,
            0, 0, 0,  0, 0, 1,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 1, 0,
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  0, 1, 1
        ];
        this.cubeVerts32 = new Float32Array ([
            0, 0, 0, 1, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,
            0, 1, 0, 1, 1, 1, 1, 1, 0,
            0, 0, 0, 1, 0, 1, 0, 0, 1,
            0, 0, 0, 1, 0, 0, 1, 0, 1,
            1, 0, 0, 1, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 1, 1,
            0, 0, 0, 0, 0, 1, 0, 1, 1,
            0, 0, 0, 0, 1, 1, 0, 1, 0,
            0, 0, 1, 1, 0, 1, 1, 1, 1,
            0, 0, 1, 1, 1, 1, 0, 1, 1
        ]);
        // this.loadTexture1();

        this.vertexBuffer = null;
        this.uvBuffer = null;
    }
    loadSkyTexture() {
        this.uvVerts32 = new Float32Array([
            0, 0, 1, 1, 1, 0, // Front face (triangle 1)
            0, 0, 0, 1, 1, 1, // Front face (triangle 2)
            0, 0, 0, 1, 1, 1, // Top face (triangle 1)
            0, 0, 1, 1, 1, 0, // Top face (triangle 2)
            0, 1, 1, 0, 0, 0, // Bottom face (triangle 1)
            0, 1, 1, 1, 1, 0, // Bottom face (triangle 2)
            0, 0, 1, 1, 1, 0, // Right face (triangle 1)
            0, 0, 0, 1, 1, 1, // Right face (triangle 2)
            1, 0, 0, 0, 0, 1, // Left face (triangle 1)
            1, 0, 0, 1, 1, 1, // Left face (triangle 2)
            1, 0, 0, 0, 0, 1, // Back face (triangle 1)
            1, 0, 0, 1, 1, 1, // Back face (triangle 2)
        ]);
    }
    loadTexture1() {
        this.uvVerts32 = new Float32Array([
            0.125, 0, 0, 0.125, 0, 0,
            0.125, 0, 0.125, 0.125, 0, 0.125,
            0, 0.5, 0, 0.375, 0.125, 0.375,
            0, 0.5, 0.125, 0.375, 0.125, 0.5,
            0, 0.25, 0.125, 0.375, 0, 0.375,
            0, 0.25, 0.125, 0.25, 0.125, 0.375,
            0.25, 0.125, 0.125, 0.25, 0.125, 0.125,
            0.25, 0.125, 0.25, 0.25, 0.125, 0.25,
            0, 0.125, 0.125, 0.125, 0.125, 0.25,
            0, 0.125, 0.125, 0.25, 0, 0.25,
            0.125, 0, 0.25, 0, 0.25, 0.125,
            0.125, 0, 0.25, 0.125, 0.125, 0.125
    ]);
    }
    
    loadTexture2() {
        this.loadTexture1();
        
                for (let i = 0; i < this.uvVerts32.length; i += 2) {
                    this.uvVerts32[i] += 2/8;
                }
    }

    loadTexture3() {this.loadTexture1();
                for (let i = 0; i < this.uvVerts32.length; i += 2) {
                    this.uvVerts32[i] += 4/8;
                }
    }

    loadTexture4() {this.loadTexture1();
        for (let i = 0; i < this.uvVerts32.length; i += 2) {
            this.uvVerts32[i] += 6/8;
        }
}

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // gl.vertexAttrib3b(a_Position, xy[0], xy[1], 0.0);

        // pass in texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // back
        drawTriangle3DUV( [0, 0, 0,    1, 1, 0,    1, 0 ,0], [1/8, 0, 0, 1/8, 0,0] );
        drawTriangle3DUV( [0, 0, 0,    0, 1, 0,    1, 1 ,0], [1/8, 0, 1/8,1/8, 0, 1/8] );
        
        //top i think
        drawTriangle3DUV( [0, 1, 0,    0, 1, 1,    1, 1 ,1], [0,4/8, 0,3/8, 1/8,3/8] );
        drawTriangle3DUV( [0, 1, 0,    1, 1, 1,    1, 1 ,0], [0,4/8, 1/8,3/8, 1/8,4/8] );

        // bottom
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,    1, 0, 1,    0, 0, 1], [0,2/8, 1/8,3/8, 0,3/8] );
        drawTriangle3DUV( [0, 0, 0,    1, 0, 0,    1, 0, 1], [0,2/8, 1/8,2/8, 1/8,3/8] );

        //right 
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3DUV( [1, 0, 0,    1, 1, 1,    1, 0, 1], [2/8,1/8, 1/8,2/8, 1/8,1/8] );
        drawTriangle3DUV( [1, 0, 0,    1, 1, 0,    1, 1, 1], [2/8,1/8, 2/8,2/8, 1/8,2/8] );

        //left
        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,    0, 0, 1,    0, 1, 1], [0,1/8, 1/8,1/8, 1/8,2/8] );
        drawTriangle3DUV( [0, 0, 0,    0, 1, 1,    0, 1, 0], [0,1/8, 1/8,2/8, 0,2/8] );
        // // front

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3DUV( [0, 0, 1,    1, 0, 1,    1, 1, 1], [1/8,0, 2/8,0, 2/8,1/8] );
        drawTriangle3DUV( [0, 0, 1,    1, 1, 1,    0, 1, 1], [1/8,0, 2/8,1/8, 1/8,1/8] );

    }

    renderfast() {
        if (this.textureNum == -2) {
            var rgba = this.color;
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        }
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture, this.textureNum);

        drawTriangle3DUVMultiple(this.cubeVerts32, this.uvVerts32);
    }

    renderfaster() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, -2);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initTriangle3d();
        }

        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts, gl.DYNAMIC_DRAW));
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}