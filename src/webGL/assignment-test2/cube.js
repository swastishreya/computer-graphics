import { vec4 } from 'https://cdn.skypack.dev/gl-matrix';

import Transform from './transform.js';

export default class Cube
{
	constructor(gl, id)
	{
        this.id = id;
		this.vertexData = new Float32Array(
            [
                // Front face
                -0.3, -0.3,  0.3,
                 0.3, -0.3,  0.3,
                 0.3,  0.3,  0.3,
                -0.3,  0.3,  0.3,
            
                // Back face
                -0.3, -0.3, -0.3,
                -0.3,  0.3, -0.3,
                 0.3,  0.3, -0.3,
                 0.3, -0.3, -0.3,
            
                // Top face
                -0.3,  0.3, -0.3,
                -0.3,  0.3,  0.3,
                 0.3,  0.3,  0.3,
                 0.3,  0.3, -0.3,
            
                // Bottom face
                -0.3, -0.3, -0.3,
                 0.3, -0.3, -0.3,
                 0.3, -0.3,  0.3,
                -0.3, -0.3,  0.3,
            
                // Right face
                 0.3, -0.3, -0.3,
                 0.3,  0.3, -0.3,
                 0.3,  0.3,  0.3,
                 0.3, -0.3,  0.3,
            
                // Left face
                -0.3, -0.3, -0.3,
                -0.3, -0.3,  0.3,
                -0.3,  0.3,  0.3,
                -0.3,  0.3, -0.3,
              ]
        );

		this.vertexIndices = new Uint16Array(
            [
                0,  1,  2,      0,  2,  3,    // front
                4,  5,  6,      4,  6,  7,    // back
                8,  9,  10,     8,  10, 11,   // top
                12, 13, 14,     12, 14, 15,   // bottom
                16, 17, 18,     16, 18, 19,   // right
                20, 21, 22,     20, 22, 23,   // left
              ]
            );

        this.faceColors = [
                [1.0,  1.0,  1.0, (this.id*80 + 1)/255.0],    // Front face: white
                [1.0,  0.0,  0.0, (this.id*80 + 2)/255.0],    // Back face: red
                [0.0,  1.0,  0.0, (this.id*80 + 3)/255.0],    // Top face: green
                [0.0,  0.0,  1.0, (this.id*80 + 4)/255.0],    // Bottom face: blue
                [1.0,  1.0,  0.0, (this.id*80 + 5)/255.0],    // Right face: yellow
                [1.0,  0.0,  1.0, (this.id*80 + 6)/255.0],    // Left face: purple
              ];

        this.colorData = [];

        for (var j = 0; j < this.faceColors.length; ++j) {
        const c = this.faceColors[j];
    
        // Repeat each color four times for the four vertices of the face
        this.colorData = this.colorData.concat(c, c, c, c);
        }

		this.gl = gl;

		this.vertexBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();

		if (!this.vertexBuffer || !this.colorBuffer || !this.indexBuffer)
		{
			throw new Error("Buffer for vertex attributes could not be allocated");
        }
        
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorData), gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexIndices), gl.DYNAMIC_DRAW);

        this.transform = new Transform(gl);
	}

	draw(shader)
	{
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);		
		const aPosition = shader.attribute("aPosition");
        this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 3 * this.vertexData.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(aPosition);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		const aColor = shader.attribute("aColor");
        this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 4 * this.colorData.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(aColor);

		// draw geometry lines by indices
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, 0);
	}
    
    recomputeColorData()
    {
        console.log("Ohhh hellooo");
        this.gl.deleteBuffer(this.colorBuffer);
        this.colorData = [];
        for (var j = 0; j < this.faceColors.length; ++j) {
            const c = this.faceColors[j];
        
            // Repeat each color four times for the four vertices of the face
            this.colorData = this.colorData.concat(c, c, c, c);
        }

        this.colorBuffer = this.gl.createBuffer();
        if ( !this.colorBuffer )
		{
			throw new Error("Buffer for color attributes could not be allocated");
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colorData), this.gl.DYNAMIC_DRAW);

        console.log(this.faceColors);
    }

    setFaceColor(faceIdx, color)
    {
        this.faceColors[faceIdx] = color;
    }
}