import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Rectangle from './rectangle.js'

const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();

let modeValue = 0; // 0 -> drawing-mode, 1 -> instance-transformation-mode, 2 -> scene-transformation-mode
let shapeMode = 'r';

window.onload = () =>
{

	// Convert mouse click to coordinate system as understood by webGL
	renderer.getCanvas().addEventListener('click', (event) =>
	{
		let mouseX = event.clientX;
		let mouseY = event.clientY;
		const clipCoordinates = renderer.mouseToClipCoord(mouseX,mouseY);

		if (modeValue === 0)
		{
			if (shapeMode === 'r')
			{
				primitives.push(new Rectangle(gl, clipCoordinates[0], clipCoordinates[1], new Float32Array([1.0, 0.0, 0.0])));
			} else if (shapeMode === 's') 
			{
				primitives.push(new Rectangle(gl, clipCoordinates[0], clipCoordinates[1], new Float32Array([1.0, 0.0, 1.0]), true));
			}
		} else if (modeValue === 1)
		{
			if (primitives.length > 0) 
			{
				closest = primitives[0];
				let minDist = Math.abs(clipCoordinates[0]-closest.centroidX) + Math.abs(clipCoordinates[1]-closest.centroidY);
				primitives.forEach( primitive => {
					let dist = Math.abs(clipCoordinates[0]-primitive.centroidX) + Math.abs(clipCoordinates[1]-primitive.centroidY);
					if (dist < minDist)
					{
						minDist = dist;
						closest = primitive;
					}
				})

			}
		}

		
	});

	window.addEventListener('keydown', function (event)
	{
		switch (event.key)
		{
			case 'ArrowDown':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.centroidY -= 0.1;
						closest.recomputeVertexAttributesData();
					}
				}
				break;
			case 'ArrowUp':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.centroidY += 0.1;
						closest.recomputeVertexAttributesData();
					}
				}
				break;
			case 'ArrowLeft':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.centroidX -= 0.1;
						closest.recomputeVertexAttributesData();
					}
				} else if (modeValue === 2)
				{
					let centroid = getBoundingBoxCentroid();
					vec3.set(rotationAxis, centroid[0], centroid[1], 1);
					rotationAngle -= 0.01;
				}
				break;
			case 'ArrowRight':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.centroidX += 0.1;
						closest.recomputeVertexAttributesData();
					}
				} else if (modeValue === 2)
				{
					let centroid = getBoundingBoxCentroid();
					vec3.set(rotationAxis, centroid[0], centroid[1], 1);
					rotationAngle += 0.01;
				}
				break;
			case '+':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.width = closest.width*1.1;
						closest.height = closest.height*1.1;
						console.log(closest.width);
						console.log(closest.height);
						closest.recomputeVertexAttributesData();
					}
				}
			case '-':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.width = closest.width*0.9;
						closest.height = closest.height*0.9;
						console.log(closest.width);
						console.log(closest.height);
						closest.recomputeVertexAttributesData();
					}
				}
			case 'x':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.isDeleted = true;
					}
				}
			case 'r':
				shapeMode = 'r';
				break;
			case 's':
				shapeMode = 's';
				break;
			case 'm':
				modeValue = (modeValue + 1) % 3;
				if (modeValue === 0)
				{
					let centroid = getBoundingBoxCentroid();
					vec3.set(rotationAxis, centroid[0], centroid[1], 1);
					rotationAngle = 0.0;	
				} else if (modeValue === 2)
				{
					closest = null;
				}
				break;
		}
	},
		true
	);
}


var primitives = [];
let closest = null;

let rotationAngle = 0;
let rotationAxis = vec3.create();


//Draw loop
function animate()
{

	if (rotationAngle > Math.PI || rotationAngle < -Math.PI)
		rotationAngle = 0;

	renderer.clear();

	console.log(modeValue);

	primitives.forEach( primitive => {
		primitive.transform.setRotate(rotationAxis, rotationAngle);
		primitive.transform.updateMVPMatrix();
	})

	primitives.forEach( primitive => {
		primitive.draw(shader);
	})

	window.requestAnimationFrame(animate);
}

function getCentroid() 
{
	let centroidX = 0;
	let centroidY = 0;
	let count = 0;
	primitives.forEach( primitive => {
		centroidX += primitive.centroidX;
		centroidY += primitive.centroidY;
		count += 1;
	})

	return [centroidX/count, centroidY/count]
}

function getBoundingBoxCentroid() 
{
	let minX = 1.0;
	let maxX = -1.0;
	let minY = 1.0;
	let maxY = -1.0;

	primitives.forEach( primitive => {
		minX = Math.min(minX, primitive.centroidX - primitive.width/2);
		maxX = Math.max(maxX, primitive.centroidX + primitive.width/2);
		minY = Math.min(minY, primitive.centroidY - primitive.height/2);
		maxY = Math.max(maxY, primitive.centroidY + primitive.height/2);
	})

	let centroidX = (minX + maxX)/2;
	let centroidY = (minY + maxY)/2;

	return [centroidX, centroidY]
}

animate();
shader.delete();
