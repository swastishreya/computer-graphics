import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Transform
{
	constructor(centroidX, centroidY)
	{
		this.translate = vec3.fromValues( centroidX, centroidY, 0);
		this.moveOrigin = vec3.fromValues(-centroidX,-centroidY,0)
		this.scale = vec3.fromValues( 1, 1, 1);
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues( centroidX, centroidY, 1);

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);
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
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix,this.moveOrigin);
	}

	setTranslate(translationVec)
	{
		vec3.add(this.translate, translationVec, this.translate);
		// this.translate = translationVec;
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		console.log("Scale before:" + this.scale);
		console.log("Translate before:" + this.translate);
		vec3.add(this.scale, scalingVec, this.scale);
		// this.scale = scalingVec;
		console.log("Scale after:" + this.scale);
		console.log("Translate after:" + this.translate);
	}

	getScale()
	{
		return this.scale;
	}

	setRotate(rotationAxis, rotationAngle)
	{
		this.rotationAngle = rotationAngle;
		vec3.add(this.rotationAxis, rotationAxis, this.rotationAxis);
		// this.rotationAxis = rotationAxis;
	}

	getRotate()
	{
		return this.rotate;
	}
}