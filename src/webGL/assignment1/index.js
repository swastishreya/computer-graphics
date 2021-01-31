import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Rectangle from './rectangle.js'
import Circle from './circle.js'

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
			} else if (shapeMode === 'c') 
			{
				primitives.push(new Circle(gl, clipCoordinates[0], clipCoordinates[1]));
			}
		} else if (modeValue === 1)
		{
			if (primitives.length > 0) 
			{
				closest = getClosestPrimitive(clipCoordinates[0], clipCoordinates[1]);

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

						closest.transform.setTranslate(moveDown);
					}
				}
				break;
			case 'ArrowUp':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.transform.setTranslate(moveUp);
					}
				}
				break;
			case 'ArrowLeft':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.transform.setTranslate(moveLeft);
					}
				} else if (modeValue === 2)
				{
					rotationAngle -= 0.01;
					primitives.forEach( primitive => {
						primitive.transform.setRotate(centroid, rotationAxis, rotationAngle);
					})
				}
				break;
			case 'ArrowRight':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.transform.setTranslate(moveRight);
					}
				} else if (modeValue === 2)
				{
					rotationAngle += 0.01;
					primitives.forEach( primitive => {
						primitive.transform.setRotate(centroid, rotationAxis, rotationAngle);
					})
				}
				break;
			case '+':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.transform.setScale(upScale);
					}
				}
				break;
			case '-':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.transform.setScale(downScale);
					}
				}
				break;
			case 'x':
				if (modeValue === 1)
				{
					if (closest !== null)
					{
						closest.isDeleted = true;
					}
					let newPrimitives = [];
					primitives.forEach( primitive => {
						if (!primitive.isDeleted) {
							newPrimitives.push(primitive);
						}
					})
					primitives = newPrimitives;
				}
				break;
			case 'r':
				shapeMode = 'r';
				break;
			case 's':
				shapeMode = 's';
				break;
			case 'c':
				shapeMode = 'c';
				break;
			case 'm':
				modeValue = (modeValue + 1) % 3;
				if (modeValue === 0)
				{
					rotationAngle = 0.0;
					primitives.forEach( primitive => {
						primitive.transform.setRotate(centroid, rotationAxis, rotationAngle);
					})	
				} else if (modeValue === 2)
				{
					closest = null;
					centroid = getBoundingBoxCentroid();
				}
				break;
			case 'Escape':
				console.log("pressed escape!!");
				window.location.replace("http://0.0.0.0:8000/");
				break;
		}
	},
		true
	);
}


var primitives = [];
let closest = null;

let rotationAngle = 0;
const rotationAxis = new Float32Array([0.0, 0.0, 1.0]);
var centroid = [];

const moveRight = new Float32Array([0.1, 0.0, 0.0]);
const moveLeft = new Float32Array([-0.1, 0.0, 0.0]);
const moveUp = new Float32Array([0.0, 0.1, 0.0]);
const moveDown = new Float32Array([0.0, -0.1, 0.0]);

const upScale = new Float32Array([0.1, 0.1, 0.0]);
const downScale = new Float32Array([-0.1, -0.1, 0.0]);

//Draw loop
function animate()
{

	if (rotationAngle > Math.PI || rotationAngle < -Math.PI)
		rotationAngle = 0;

	renderer.clear();

	primitives.forEach( primitive => {
		primitive.transform.updateMVPMatrix();
		primitive.draw(shader);
	})

	window.requestAnimationFrame(animate);
}

function getClosestPrimitive(mouseX, mouseY)
{

	let closestPrimitive = null;
	let minDist = 2.0;

	for (var i = primitives.length-1; i >= 0; i--)
	{
		let cornerVertexPositions = primitives[i].getTransformedCornerPositions();
		let minX = Math.min(cornerVertexPositions[0], Math.min(cornerVertexPositions[2],Math.min(cornerVertexPositions[4], cornerVertexPositions[6])));
		let maxX = Math.max(cornerVertexPositions[0], Math.max(cornerVertexPositions[2],Math.max(cornerVertexPositions[4], cornerVertexPositions[6])));
		let minY = Math.min(cornerVertexPositions[1], Math.min(cornerVertexPositions[3],Math.min(cornerVertexPositions[5], cornerVertexPositions[7])));
		let maxY = Math.max(cornerVertexPositions[1], Math.max(cornerVertexPositions[3],Math.max(cornerVertexPositions[5], cornerVertexPositions[7])));

		
		if (primitives[i].type === 'circle')
		{
			let x = (minX + maxX) / 2;
			let y = (minY + maxY) / 2;
			let dist = distance(mouseX, mouseY, x, y) - Math.abs(x - minX);
			if (dist < 0)
			{
				// Mouse click coordinates are inside the object
				return primitives[i];
			} else if (dist < minDist)
			{
				minDist = dist;
				closestPrimitive = primitives[i];
			}

		} else {	
			if ( mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY){
				// Mouse click coordinates are inside the object
				return primitives[i];
			} else if (mouseX >= minX && mouseX <= maxX) {
				// Mouse click coordinates are outside the object but near a horizontal edge
				let dist = Math.min(Math.abs(mouseY-minY), Math.abs(mouseY-maxY));
				if (dist < minDist)
				{
					minDist = dist;
					closestPrimitive = primitives[i];
				}
			} else if (mouseY >= minY && mouseY <= maxY) {
				// Mouse click coordinates are outside the object but near a vertical edge
				let dist = Math.min(Math.abs(mouseX-minX), Math.abs(mouseX-maxX));
				if (dist < minDist)
				{
					minDist = dist;
					closestPrimitive = primitives[i];
				}
			} else {
				let dist = Math.min(distance(mouseX, mouseY, minX, minY), Math.min(distance(mouseX, mouseY, minX, maxY), Math.min(distance(mouseX, mouseY, maxX, minY), distance(mouseX, mouseY, maxX, maxY))));
				if (dist < minDist)
				{
					minDist = dist;
					closestPrimitive = primitives[i];
				}
			}
		}
	}

	return closestPrimitive;
}

function distance(x1,y1,x2,y2)
{
	// Get distance between two points
	return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function getBoundingBoxCentroid() 
{
	let minX = 1.0;
	let maxX = -1.0;
	let minY = 1.0;
	let maxY = -1.0;

	primitives.forEach( primitive => {
		let cornerVertexPositions = primitive.getTransformedCornerPositions();
		minX = Math.min(minX, Math.min(cornerVertexPositions[0], Math.min(cornerVertexPositions[2],Math.min(cornerVertexPositions[4], cornerVertexPositions[6]))));
		maxX = Math.max(maxX, Math.max(cornerVertexPositions[0], Math.max(cornerVertexPositions[2],Math.max(cornerVertexPositions[4], cornerVertexPositions[6]))));
		minY = Math.min(minY, Math.min(cornerVertexPositions[1], Math.min(cornerVertexPositions[3],Math.min(cornerVertexPositions[5], cornerVertexPositions[7]))));
		maxY = Math.max(maxY, Math.max(cornerVertexPositions[1], Math.max(cornerVertexPositions[3],Math.max(cornerVertexPositions[5], cornerVertexPositions[7]))));
	})

	let centroidX = (minX + maxX)/2;
	let centroidY = (minY + maxY)/2;

	return [centroidX, centroidY];
}

animate();
shader.delete();
