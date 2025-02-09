
class Cylinder {
    constructor() {
        this.type= "cylinder";
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size=  5.0;
        this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // gl.vertexAttrib3b(a_Position, xy[0], xy[1], 0.0);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const top = [0, 1, 0];
        const bottom = [0, 0, 0];

        const angleStep = (2 * Math.PI) / this.segments

        for (let i = 0; i < this.segments; i++) {
            const angle1 = i * angleStep;
            const angle2 = (i + 1) * angleStep;

            // points of the tope circle
            const topx1 = Math.cos(angle1);
            const topz1 = Math.sin(angle1);
            const topx2 = Math.cos(angle2);
            const topz2 = Math.sin(angle2);

            // pts fo rbottom
            const bottomx1 = topx1;
            const bottomx2 = topx2;
            const bottomz1 = topz1;
            const bottomz2 = topz2;


            // render top
            gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
            drawTriangle3D([
                top[0], top[1], top[2],
                topx1, top[1], topz1,
                topx2, top[1], topz2
            ]);
            
            // render bottom

            gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
            drawTriangle3D([
                bottom[0], bottom[1], bottom[2],
                bottomx2, bottom[1], bottomz2,
                bottomx1, bottom[1], bottomz1
            ]);

            // render sides
            const shade = 0.8 + 0.2 * Math.cos((angle1 + angle2) / 2 + (Math.PI / 2)); // add some shading
            gl.uniform4f(u_FragColor, rgba[0] * shade, rgba[1] * shade, rgba[2] * shade, rgba[3]);
            drawTriangle3D([
                bottomx1, bottom[1], bottomz1,
                topx1, top[1], topz1,
                topx2, top[1], topz2
            ]);
            drawTriangle3D([
                bottomx1, bottom[1], bottomz1,
                topx2, top[1], topz2,
                bottomx2, bottom[1], bottomz2
            ]);
        }
    }
}