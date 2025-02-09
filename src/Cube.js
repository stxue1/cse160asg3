
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
        ]);
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

        // front
        drawTriangle3DUV( [0, 0, 0,    1, 1, 0,    1, 0 ,0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0, 0, 0,    0, 1, 0,    1, 1 ,0], [0,0, 0,1, 1,1] );

        // pass color
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        
        //top i think
        drawTriangle3DUV( [0, 1, 0,    0, 1, 1,    1, 1 ,1], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0, 1, 0,    1, 1, 1,    1, 1 ,0], [0,0, 1,1, 1,0] );

        // bottom
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,    1, 0, 1,    0, 0, 1], [0,1, 1,0, 0,0] );
        drawTriangle3DUV( [0, 0, 0,    1, 0, 0,    1, 0, 1], [0,1, 1,1, 1,0] );

        //right 
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3DUV( [1, 0, 0,    1, 1, 1,    1, 0, 1], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [1, 0, 0,    1, 1, 0,    1, 1, 1], [0,0, 0,1, 1,1] );

        //left
        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,    0, 0, 1,    0, 1, 1], [1,0, 0,0, 0,1] );
        drawTriangle3DUV( [0, 0, 0,    0, 1, 1,    0, 1, 0], [1,0, 0,1, 1,1] );
        // // back

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3DUV( [0, 0, 1,    1, 0, 1,    1, 1, 1], [1,0, 0,0, 0,1] );
        drawTriangle3DUV( [0, 0, 1,    1, 1, 1,    0, 1, 1], [1,0, 0,1, 1,1] );

    }

    renderfast() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture, this.textureNum);
        
        var allverts = [];
        allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0] )
        allverts = allverts.concat( [0, 0, 0,    0, 1, 0,    1, 1 ,0]);
        allverts = allverts.concat( [0, 1, 0,    0, 1, 1,    1, 1 ,1]);
        allverts = allverts.concat( [0, 1, 0,    1, 1, 1,    1, 1 ,0]);
        allverts = allverts.concat( [0, 0, 0,    1, 0, 1,    0, 0, 1]);
        allverts = allverts.concat( [0, 0, 0,    1, 0, 0,    1, 0, 1]);
        allverts = allverts.concat( [1, 0, 0,    1, 1, 1,    1, 0, 1]);
        allverts = allverts.concat( [1, 0, 0,    1, 1, 0,    1, 1, 1]);
        allverts = allverts.concat( [0, 0, 0,    0, 0, 1,    0, 1, 1]);
        allverts = allverts.concat( [0, 0, 0,    0, 1, 1,    0, 1, 0]);
        allverts = allverts.concat( [0, 0, 1,    1, 0, 1,    1, 1, 1]);
        allverts = allverts.concat( [0, 0, 1,    1, 1, 1,    0, 1, 1]);
        drawTriangle3D(allverts);
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