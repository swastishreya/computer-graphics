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
		}

		
	});

	window.addEventListener('keydown', function (event)
	{
		switch (event.key)
		{
			case 'ArrowDown':
				break;
			case 'ArrowUp':
				break;
			case 'ArrowLeft':
				if (modeValue === 0)
				{
					
				} else if (modeValue === 2)
				{
					let centroid = getCentroid();
					vec3.set(rotationAxis, centroid[0], centroid[1], 1);
					rotationAngle -= 0.01;
				}
				break;
			case 'ArrowRight':
				if (modeValue === 0)
				{
					
				} else if (modeValue === 2)
				{
					let centroid = getCentroid();
					vec3.set(rotationAxis, centroid[0], centroid[1], 1);
					rotationAngle += 0.01;
				}
				break;
			case 'r':
				shapeMode = 'r';
				break;
			case 's':
				shapeMode = 's';
				break;
			case 'm':
				modeValue = (modeValue + 1) % 3;
				break;
		}
	},
		true
	);
}


const primitives = [];

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

animate();
shader.delete();
