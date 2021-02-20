import { vec3 } from 'https://cdn.skypack.dev/gl-matrix';

import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Cube from './cube.js';
import Mesh from './mesh.js';
import Parser from './parser.js';

async function main () {

const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();

const gui = new dat.GUI();

const response = await fetch('./models/cube.obj');  
const text = await response.text();
const data = new Parser(text);

console.log(data);

console.log(data.vertices);
console.log(data.indices);

const cube1 = new Mesh(gl, data.vertices, data.indices, 1);
const cube2 = new Mesh(gl, data.vertices, data.indices, 2);
const cube3 = new Mesh(gl, data.vertices, data.indices, 3);

const response2 = await fetch('./models/axis.obj');  
const text2 = await response2.text();
const data2 = new Parser(text2);

const object1 = new Mesh(gl, data2.vertices, data2.indices, 0, 'g');
const object2 = new Mesh(gl, data2.vertices, data2.indices, 0, 'r');
object2.transform.setRotate(-90, 'Z');
const object3 = new Mesh(gl, data2.vertices, data2.indices, 0, 'b');
object3.transform.setRotate(90, 'X');

var mouseDown = false;
var angle = 0;
var selected = null;

// const cube1 = new Cube(gl,1);
// const cube2 = new Cube(gl,2);
// const cube3 = new Cube(gl,3);

const transformSettings = {
	orientation: 'Origin',
	mode: 'Camera',
	color: [ 0, 128, 255 ],
	selectionMode: 'Face',
}

gui.add(transformSettings,'orientation', ['Origin', 'Corners', 'Sides']).name('Object orientations').listen().onChange(function (orientation)
{
	if (orientation === 'Corners'){
		cube1.transform.setTranslate(new Float32Array([1.156/1.0, -1/1.0, -5]));
		cube2.transform.setTranslate(new Float32Array([-1.156/1.0, -1/1.0, -5]));
		cube3.transform.setTranslate(new Float32Array([0, 1/1.0, -5]));
	} else if (orientation === 'Sides'){
		cube1.transform.setTranslate(new Float32Array([0, -1/1.0, -5]));
		cube2.transform.setTranslate(new Float32Array([-0.65/1.0, -0.124/1.0, -5]));
		cube3.transform.setTranslate(new Float32Array([0.65/1.0, -0.124/1.0, -5]));
	} else if (orientation === 'Origin'){
		cube1.transform.setTranslate(new Float32Array([0, 0, -5]));
		cube2.transform.setTranslate(new Float32Array([0, 0, -5]));
		cube3.transform.setTranslate(new Float32Array([0, 0, -5]));
	}
});

gui.add(transformSettings,'selectionMode', ['Face', 'Object']).name('Selection Mode').listen().onChange(function (sm)
{
	if (sm === 'Face'){
		transformSettings.selectionMode = 'Face';		
	} else if (sm === 'Object'){
		transformSettings.selectionMode = 'Object';
	} 
});

gui.add(transformSettings,'mode', ['Camera', 'Selection']).name('Mode').listen().onChange(function (m)
{
	if (m === 'Camera'){
		transformSettings.mode = 'Camera';		
	} else if (m === 'Selection'){
		transformSettings.mode = 'Selection';
	} 
});

gui.addColor(transformSettings, 'color').name('Color').listen().onChange(function(newColor) {
		console.log("Changed color to:" + newColor);
		transformSettings.color = newColor;
});

window.onload = () =>
{
	renderer.getCanvas().addEventListener('mousemove', (event) =>
	{
		let mouseX = event.clientX;
		let mouseY = event.clientY;
		const clipCoordinates = renderer.mouseToClipCoord(mouseX, mouseY);

		if (transformSettings.mode === 'Camera' && mouseDown === true){
			angle = Math.atan(clipCoordinates[0]/5);
		}
	});

	renderer.getCanvas().addEventListener("mousedown", function(event) {
		mouseDown = true;
	}, false);

	renderer.getCanvas().addEventListener("mouseup", function(event) {
		mouseDown = false;
	}, false);

	renderer.getCanvas().addEventListener('click', (event) =>
	{
		const rect = renderer.getCanvas().getBoundingClientRect();
		let mouseX = event.clientX - rect.left;
		let mouseY = event.clientY - rect.top;

		const pixelX = mouseX * renderer.getCanvas().width / renderer.getCanvas().clientWidth;
		const pixelY = renderer.getCanvas().height - mouseY * renderer.getCanvas().height / renderer.getCanvas().clientHeight - 1;

		if (transformSettings.mode === 'Selection')
		{
			var pixels = new Uint8Array(4);
			gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			if (pixels === [0,0,0,255]) {
				selected = null;
			} else {
				let faceId = pixels[3]%10;
				let objectId = parseInt((pixels[3] - faceId)/80);
				if (objectId === 1) {
					if (transformSettings.selectionMode === 'Face'){
						console.log(cube1);
						cube1.setFaceColor(faceId - 1, [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube1.faceColors[faceId-1][3]]);
					} else if (transformSettings.selectionMode === 'Object'){
						console.log("hellooo");
						for (var j = 0; j < cube1.faceColors.length; ++j) {
							cube1.setFaceColor(j, [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube1.faceColors[j][3]]);
						}
					}
					cube1.recomputeColorData();
				} else if (objectId === 2) {
					if (transformSettings.selectionMode === 'Face'){
						console.log(cube2);
						cube2.faceColors[faceId-1] = [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube2.faceColors[faceId-1][3]];
					} else if (transformSettings.selectionMode === 'Object'){
						console.log("hellooo");
						for (var j = 0; j < cube2.faceColors.length; ++j) {
							cube2.faceColors[j] = [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube2.faceColors[j][3]];
						}
					}
					cube2.recomputeColorData();
				} else if (objectId === 3) {
					if (transformSettings.selectionMode === 'Face'){
						console.log(cube3);
						cube3.faceColors[faceId-1] = [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube3.faceColors[faceId-1][3]];
					} else if (transformSettings.selectionMode === 'Object'){
						console.log("hellooo");
						for (var j = 0; j < cube3.faceColors.length; ++j) {
							cube3.faceColors[j] = [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, cube3.faceColors[j][3]];
						}
					}
					cube3.recomputeColorData();
				}
			}
			console.log(pixels);
		}
	});


}

transformSettings.rotate = function() {
	cube1.transform.setRotate(90, 'Z');
    cube2.transform.setRotate(90, 'Y');
	cube3.transform.setRotate(90, 'X');
};

gui.add(transformSettings,'rotate').name('Rotate');

transformSettings.scale = function() {
	cube1.transform.setUniformScale(0.5);
    cube2.transform.setUniformScale(2);
	cube3.transform.setUniformScale(3);
};

gui.add(transformSettings,'scale').name('Scale');

//Draw loop
function animate()
{
	if (mouseDown){
		cube1.transform.setLookAt(angle);
		cube2.transform.setLookAt(angle);
		cube3.transform.setLookAt(angle);
	}

	cube1.transform.updateMVPMatrix();
	cube2.transform.updateMVPMatrix();
	cube3.transform.updateMVPMatrix();

	object1.transform.updateMVPMatrix();
	object2.transform.updateMVPMatrix();
	object3.transform.updateMVPMatrix();

	renderer.clear();
	object1.draw(shader);
	object2.draw(shader);
	object3.draw(shader);
	cube1.draw(shader);
	cube2.draw(shader);
	cube3.draw(shader);
	window.requestAnimationFrame(animate);
}

animate();
shader.delete();

}

main();
