import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

function degToRad(d) {
    return d * Math.PI / 180;
}

export default class Transform
{
	constructor(gl)
	{
		this.translate = vec3.fromValues( 0, 0, -5);
		this.scale = vec3.fromValues( 1, 1, 1);
		this.scaleValue = 1;
		this.rotationAngleX = 0;
		this.rotationAxisX = vec3.fromValues( 1, 0, 0);
		this.rotationAngleY = 0;
		this.rotationAxisY = vec3.fromValues( 0, 1, 0);
		this.rotationAngleZ = 0;
		this.rotationAxisZ = vec3.fromValues( 0, 0, 1);
		this.fieldOfView = degToRad(60);
		this.aspect = gl.canvas.width / gl.canvas.height;
		this.up = vec3.fromValues( 0, 1, 0);
		this.center = vec3.fromValues( 0, 0, -5);
		this.eye = vec3.fromValues( 0, 0, 0.1);
		this.eyeAngle = 0;

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.mvpMatrix = this.modelTransformMatrix;

		this.updateMVPMatrix();
	}

	getMVPMatrix()
	{
		return this.modelTransformMatrix;
	}

	// Keep in mind that modeling transformations are applied to objects in the opposite of the order in which they occur in the code
	updateMVPMatrix()
	{
		mat4.identity(this.modelTransformMatrix);
		mat4.lookAt(this.modelTransformMatrix, this.eye, this.center, this.up);
		mat4.perspective(this.modelTransformMatrix, this.fieldOfView, this.aspect, 0.1, 100);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleX, this.rotationAxisX);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleY, this.rotationAxisY);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleZ, this.rotationAxisZ);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
	}

	setTranslate(translationVec)
	{
		this.translate = translationVec;
		// vec3.add(this.translate, translationVec, this.translate);
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		this.scale = scalingVec;
	}

	setUniformScale(scaleValue)
	{
		this.scaleValue *= scaleValue;
		this.scale = new Float32Array([this.scale[0]*this.scaleValue, this.scale[1]*this.scaleValue, this.scale[2]*this.scaleValue]);
	}

	getScale()
	{
		return this.scale;
	}

	setRotate(rotationAngle, axis)
	{
		if (axis === 'X'){
			this.rotationAngleX += degToRad(rotationAngle);
		} else if (axis === 'Y'){
			this.rotationAngleY += degToRad(rotationAngle);
		} else if (axis === 'Z'){
			this.rotationAngleZ += degToRad(rotationAngle);
		}
		
	}

	setLookAt(eyeAngle)
	{
		this.eyeAngle += eyeAngle;
		this.eye = new Float32Array([-5 + 5*Math.cos(this.eyeAngle), 0, -5 + 5*Math.sin*(this.eyeAngle)]);
	}

	getRotate()
	{
		return this.rotate;
	}
}