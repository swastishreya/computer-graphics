import { vec4 } from 'https://cdn.skypack.dev/gl-matrix';

import Transform from './transform.js';

export default class Cirlce 
{
    constructor(gl, centroidX, centroidY, radius=0.125) 
    {
        console.log("Helooo circle"); 
		console.log(centroidX); 
		console.log(centroidY); 

        this.centroidX = centroidX;
        this.centroidY = centroidY;
        this.radius = radius;
        this.positionAttributesData = new Float32Array([
            //  x , y,  z 
            centroidX, centroidY , 0.0,
            centroidX, centroidY , 0.0,
        ]);

        this.colorAttributesData = new Float32Array([
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ]);

        for ( var i = 0; i <= 200; i++)
        {
            var t = new Float32Array([
                centroidX, centroidY, 0,
                centroidX + radius*Math.cos(i*2*Math.PI/200), centroidY + radius*Math.sin(i*2*Math.PI/200), 0
            ]);
            var color = new Float32Array([
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
            ]);
            this.positionAttributesData = new Float32Array([...this.positionAttributesData, ...t]);
            this.colorAttributesData  = new Float32Array([...this.colorAttributesData, ...color]);
        }
        
        this.gl = gl;

		this.positionBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        if (!this.positionBuffer || !this.colorBuffer)
		{
			throw new Error("Buffer for vertex attributes could not be allocated");
		}

		this.transform = new Transform(centroidX, centroidY);
    }

    draw(shader)
	{
		const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
		let elementPerVertex = 3;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positionAttributesData, this.gl.DYNAMIC_DRAW);
		
		const aPosition = shader.attribute("aPosition");
		this.gl.enableVertexAttribArray(aPosition);
		this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 3 * this.positionAttributesData.BYTES_PER_ELEMENT, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colorAttributesData, this.gl.STATIC_DRAW);
		
		const aColor = shader.attribute("aColor");
		this.gl.enableVertexAttribArray(aColor);
		this.gl.vertexAttribPointer(aColor, elementPerVertex, this.gl.FLOAT, false, 3 * this.colorAttributesData.BYTES_PER_ELEMENT, 0);

		shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.positionAttributesData.length / elementPerVertex);
    }
    
    getTransformedCornerPositions() 
	{
		// Position of top left vertex
		const currentVertex1 = vec4.fromValues(this.positionAttributesData[0]+this.radius,this.positionAttributesData[1],this.positionAttributesData[2],1);
		const updatedVertex1 = vec4.create();
		vec4.transformMat4(updatedVertex1, currentVertex1, this.transform.getMVPMatrix());

		const currentVertex2 = vec4.fromValues(this.positionAttributesData[0]-this.radius,this.positionAttributesData[1],this.positionAttributesData[2],1);
		const updatedVertex2 = vec4.create();
		vec4.transformMat4(updatedVertex2, currentVertex2, this.transform.getMVPMatrix());

		const currentVertex3 = vec4.fromValues(this.positionAttributesData[0],this.positionAttributesData[1]+this.radius,this.positionAttributesData[2],1);
		const updatedVertex3 = vec4.create();
		vec4.transformMat4(updatedVertex3, currentVertex3, this.transform.getMVPMatrix());

		const currentVertex4 = vec4.fromValues(this.positionAttributesData[0],this.positionAttributesData[1]-this.radius,this.positionAttributesData[2],1);
		const updatedVertex4 = vec4.create();
		vec4.transformMat4(updatedVertex4, currentVertex4, this.transform.getMVPMatrix());

		const updatedVertex = new Float32Array([updatedVertex1[0],updatedVertex1[1],
												updatedVertex2[0],updatedVertex2[1],
												updatedVertex3[0],updatedVertex3[1],
												updatedVertex4[0],updatedVertex4[1],
											]);

		return updatedVertex;
	}
    
}