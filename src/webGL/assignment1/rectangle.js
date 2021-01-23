import Transform from './transform.js'

export default class Rectangle
{
	constructor(gl, centroidX, centroidY, color, isSquare=false, width=0.25, height=0.5)
	{
		console.log("Helooo rectangle"); 
		console.log(centroidX); 
		console.log(centroidY); 
	
		this.centroidX = centroidX;
		this.centroidY = centroidY;
		this.width = width;
		this.height = height;
		this.color = color;

		if (isSquare){
            this.height = this.width;
        }
        
		this.vertexAttributesData = new Float32Array([
			//  x , y,  z
			this.centroidX + this.width/2, this.centroidY + this.height/2, 0.0, this.color[0], this.color[1], this.color[2],
			this.centroidX + this.width/2, this.centroidY - this.height/2, 0.0, this.color[0], this.color[1], this.color[2],
			this.centroidX - this.width/2, this.centroidY + this.height/2, 0.0, this.color[0], this.color[1], this.color[2],
			this.centroidX - this.width/2, this.centroidY - this.height/2, 0.0, this.color[0], this.color[1], this.color[2],
		]);

		this.gl = gl;

		this.vertexAttributesBuffer = this.gl.createBuffer();
		if (!this.vertexAttributesBuffer)
		{
			throw new Error("Buffer for vertex attributes could not be allocated");
		}

		this.transform = new Transform();
	}

	draw(shader)
	{
		const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
		let elementPerVertex = 3;
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexAttributesData, this.gl.DYNAMIC_DRAW);
		
		const aPosition = shader.attribute("aPosition");
		this.gl.enableVertexAttribArray(aPosition);
		this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 6 * this.vertexAttributesData.BYTES_PER_ELEMENT, 0);
		
		const aColor = shader.attribute("aColor");
		this.gl.enableVertexAttribArray(aColor);
		this.gl.vertexAttribPointer(aColor, elementPerVertex, this.gl.FLOAT, false, 6 * this.vertexAttributesData.BYTES_PER_ELEMENT, 3 * this.vertexAttributesData.BYTES_PER_ELEMENT);

		shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexAttributesData.length / (2 * elementPerVertex));
	}

};