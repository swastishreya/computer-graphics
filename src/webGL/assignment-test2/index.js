import { vec3 } from 'https://cdn.skypack.dev/gl-matrix';

import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Cube from './cube.js';
import Mesh from './mesh.js';
import webglObjLoader from 'https://cdn.skypack.dev/webgl-obj-loader';
import axis from './models/axis.js';
import cube from './models/cube.js';

const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();

const gui = new dat.GUI();

const data  = new webglObjLoader.Mesh(cube);

console.log(data.vertices);
console.log(data.indices);

const cube1 = new Mesh(gl, data.vertices, data.indices, 1);
const cube2 = new Mesh(gl, data.vertices, data.indices, 2);
const cube3 = new Mesh(gl, data.vertices, data.indices, 3);

const data2  = new webglObjLoader.Mesh(axis);

const axis1 = new Mesh(gl, data2.vertices, data2.indices, 0, 'g');
axis1.transform.setUniformScale(0.5);
const axis2 = new Mesh(gl, data2.vertices, data2.indices, 0, 'r');
axis2.transform.setRotate(-90, 'Z');
axis2.transform.setUniformScale(0.5);
const axis3 = new Mesh(gl, data2.vertices, data2.indices, 0, 'b');
axis3.transform.setRotate(90, 'X');
axis3.transform.setUniformScale(0.5);

var mouseDown = false;
var angle = 0;
var selected = null;
let prevX =0;

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
		console.log("Selection mode")
		transformSettings.mode = 'Selection';
	} 
});

gui.addColor(transformSettings, 'color').name('Color').listen().onChange(function(newColor) {
		transformSettings.color = newColor;
});

window.onload = () =>
{
	// renderer.getCanvas().addEventListener('mousemove', (event) =>
	// {
	// 	let mouseX = event.clientX;
	// 	let mouseY = event.clientY;
	// 	const clipCoordinates = renderer.mouseToClipCoord(mouseX, mouseY);

	// 	if (transformSettings.mode === 'Camera' && mouseDown === true){
	// 		angle = Math.atan(clipCoordinates[0]/5);
	// 	}
	// });

	renderer.getCanvas().addEventListener('mousedown', function(event) {
		mouseDown = true;
	}, false);

	renderer.getCanvas().addEventListener('mouseup', function(event) {
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
					selected = cube1;
				} else if (objectId === 2) {
					selected = cube2;
				} else if (objectId === 3) {
					selected = cube3;
				}
				if (transformSettings.selectionMode === 'Face'){
					console.log(selected);
					selected.setFaceColor(faceId - 1, [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, selected.faceColors[faceId-1][3]]);
				} else if (transformSettings.selectionMode === 'Object'){
					console.log("hellooo");
					for (var j = 0; j < selected.faceColors.length; ++j) {
						selected.setFaceColor(j, [transformSettings.color[0]/255.0, transformSettings.color[1]/255.0, transformSettings.color[2]/255.0, selected.faceColors[j][3]]);
					}
				}
				selected.recomputeColorData();
			}
			console.log(pixels);
		}
	});

	renderer.getCanvas().addEventListener('mousemove', event => {

		if(mouseDown && transformSettings.mode === 'Camera'){
		    var mouseX = event.clientX;
			var factor = 10;
			var dx = factor * (mouseX - prevX);
			angle = angle + dx;
		  prevX = mouseX;
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
		cube1.transform.setRotate(angle, 'Y');
		cube2.transform.setRotate(angle, 'Y');
		cube3.transform.setRotate(angle, 'Y');

		axis1.transform.setRotate(angle, 'Y');
		axis2.transform.setRotate(angle, 'Y');
		axis3.transform.setRotate(angle, 'Y');

		// cube1.transform.setLookAt(angle);
		// cube2.transform.setLookAt(angle);
		// cube3.transform.setLookAt(angle);

		// axis1.transform.setLookAt(angle);
		// axis2.transform.setLookAt(angle);
		// axis3.transform.setLookAt(angle);
	}

	cube1.transform.updateMVPMatrix();
	cube2.transform.updateMVPMatrix();
	cube3.transform.updateMVPMatrix();

	axis1.transform.updateMVPMatrix();
	axis2.transform.updateMVPMatrix();
	axis3.transform.updateMVPMatrix();

	renderer.clear();
	axis1.draw(shader);
	axis2.draw(shader);
	axis3.draw(shader);
	cube1.draw(shader);
	cube2.draw(shader);
	cube3.draw(shader);
	window.requestAnimationFrame(animate);
}

animate();
shader.delete();
