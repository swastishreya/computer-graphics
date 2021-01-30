import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Transform
{
	constructor(centroidX, centroidY)
	{
		this.translate = vec3.fromValues( centroidX, centroidY, 0);
		this.moveOrigin = vec3.fromValues(-centroidX,-centroidY,0)
		this.scale = vec3.fromValues( 1, 1, 1);
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues( 0, 0, 1);
		this.rotationAboutPoint = vec3.create();
		this.rotationResetPoint = vec3.create();

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
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationResetPoint);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAboutPoint);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix,this.moveOrigin);
	}

	setTranslate(translationVec)
	{
		vec3.add(this.translate, translationVec, this.translate);
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		vec3.add(this.scale, scalingVec, this.scale);
	}

	getScale()
	{
		return this.scale;
	}

	setRotate(rotationAboutPoint, rotationAxis, rotationAngle)
	{
		this.rotationAngle = rotationAngle;
		this.rotationAxis = rotationAxis;
		vec3.set(this.rotationAboutPoint, -rotationAboutPoint[0], -rotationAboutPoint[1], 0);
		vec3.set(this.rotationResetPoint, rotationAboutPoint[0], rotationAboutPoint[1], 0);
	}

	getRotate()
	{
		return this.rotate;
	}
}