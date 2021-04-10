import { vec3, vec4, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Shader from './shader.js';
import phongVertexShaderSrc from './phong.js';
import phongFragmentShaderSrc from './phong_fragment.js';
import gouraudVertexShaderSrc from './gouraud.js';
import fragmentShaderSrc from './fragment.js';
import Renderer from './renderer.js';
import Mesh from './mesh.js';
import Light from './light.js';
import webglObjLoader from 'https://cdn.skypack.dev/webgl-obj-loader';

// Import mesh data
import cube from './models/cube.js';
import small_teapot from './models/small_teapot.js';
import ell from './models/ell.js';

const renderer = new Renderer();
const gl = renderer.webGlContext();

var mode = 'shader';
var shaderMode = 'gouraud';
var shader = new Shader(gl, gouraudVertexShaderSrc, fragmentShaderSrc);
shader.use();

const gui = new dat.GUI();

const cube_data  = new webglObjLoader.Mesh(cube);
const teapot_data = new webglObjLoader.Mesh(small_teapot);
const ell_data = new webglObjLoader.Mesh(ell);

var cube_material = {};
cube_material.diffuse = vec4.fromValues(0.85, 0.3, 0.35, 1.0);
cube_material.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
cube_material.ambient = vec4.fromValues(0.45, 0.2, 0.15, 1.0);
cube_material.shininess = 30.0;
var cube_light = {};
cube_light.diffuse = vec4.fromValues(0.85, 0.3, 0.35, 1.0);
cube_light.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
cube_light.ambient = vec4.fromValues(0.45, 0.2, 0.15, 1.0);
const cube1 = new Mesh(gl, cube_data.vertices, cube_data.indices, cube_data.vertexNormals, 3, cube_material, cube_light);

var ell_material = {};
ell_material.diffuse = vec4.fromValues(0.55, 0.4, 0.15, 1.0);
ell_material.specular = vec4.fromValues(0.5, 1.0, 0.5, 1.0);
ell_material.ambient = vec4.fromValues(0.15, 0.35, 0.15, 1.0);
ell_material.shininess = 10.0;
var ell_light = {};
ell_light.diffuse = vec4.fromValues(0.5, 0.5, 0.5, 1.0);
ell_light.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
ell_light.ambient = vec4.fromValues(0.45, 0.2, 0.15, 1.0);
const ell1 = new Mesh(gl, ell_data.vertices, ell_data.indices, ell_data.vertexNormals, 4, ell_material, ell_light);

var teapot_material = {};
teapot_material.diffuse = vec4.fromValues(0.243, 0.937, 0.871, 1.0);
teapot_material.specular = vec4.fromValues(1.0, 0.0, 0.0, 1.0);
teapot_material.ambient = vec4.fromValues(0.243, 0.937, 0.871, 1.0);
teapot_material.shininess = 100.0;
var teapot_light = {};
teapot_light.diffuse = vec4.fromValues(0.85, 0.3, 0.35, 1.0);
teapot_light.specular = vec4.fromValues(1.0, 0.0, 0.0, 1.0);
teapot_light.ambient = vec4.fromValues(0.45, 0.2, 0.15, 1.0);
const teapot1 = new Mesh(gl, teapot_data.vertices, teapot_data.indices, teapot_data.vertexNormals, 5, teapot_material, teapot_light);

cube1.transform.setOrigin(vec3.fromValues(1.156/1.0, -1/1.0, -5));
ell1.transform.setOrigin(vec3.fromValues(-1.3/1.0, -1.3/1.0, -4));
teapot1.transform.setOrigin(vec3.fromValues(0, 1/1.0, -5));

ell1.transform.setUniformScale(0.5);
teapot1.transform.setUniformScale(0.9);

const light = new Light([cube1, ell1, teapot1]);

var selected = null;

var rotationMatrix = [];
Trackball.RotationWithQuaternion.onRotationChanged = function (updatedRotationMatrix) {
	console.log(updatedRotationMatrix);
	rotationMatrix = updatedRotationMatrix;
	if (selected !== null)
	{
		selected.transform.setRotation(rotationMatrix);
	}
}

const transformSettings = {
	object: 'No object',
	shader: 'Gouraud',
	mode: 'Shader',
}

gui.add(transformSettings,'object', ['No object', 'Teapot', 'Cube', 'Ellell']).name('Object').listen().onChange(function (object_selected)
{
	if (object_selected === 'Teapot'){
		transformSettings.object = 'Teapot';
		selected = teapot1;
	} else if (object_selected === 'Cube'){
		transformSettings.object = 'Cube';
		selected = cube1;
	} else if (object_selected === 'Ellell'){
		transformSettings.object = 'Ellell';
		selected = ell1;
	} else if (object_selected === 'No object'){
		transformSettings.object = 'No object';
		selected = null;
	}
});

gui.add(transformSettings, 'shader').listen().onFinishChange(function(){
	// refresh based on the new value of shader
})

gui.add(transformSettings, 'mode').listen().onFinishChange(function(){
	// refresh based on the new value of mode
})

window.onload = () =>
{
	window.addEventListener('keydown', function (event)
	{
		switch (event.key)
		{
			case '0':
				if (mode === 'illu')
				{
					if (selected !== null)
					{
						selected.switchLighting(light, 0);
					}
				}
				break;
			case '1':
				if (mode === 'illu')
				{
					if (selected !== null)
					{
						selected.switchLighting(light, 1);
					}
				}
				break;
			case 'l':
				mode = 'illu';
				transformSettings.mode = 'Illuminator';
				break;
			case 'm':
				if (mode === 'illu'){
					mode = 'shader';
					transformSettings.mode = 'Shader';
				} else if (mode === 'shader'){
					mode = 'illu';
					transformSettings.mode = 'Illuminator';
				}
				break;
			case 's':
				if (mode === 'shader')
				{
					transformSettings.mode = 'Shader';
					shader.delete();
					if (shaderMode === 'gouraud')
					{
						shader = new Shader(gl, phongVertexShaderSrc, phongFragmentShaderSrc);
						transformSettings.shader = 'Phong';
						shaderMode = 'phong';
					} else {
						shader = new Shader(gl, gouraudVertexShaderSrc, fragmentShaderSrc);
						transformSettings.shader = 'Gouraud';
						shaderMode = 'gouraud';
					}
					shader.use();
				}
				break;
			case 'ArrowDown':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('-Y');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveDown');
					}
					
				}
				break;
			case 'ArrowUp':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('Y');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveUp');
					}
				}
				break;
			case 'ArrowLeft':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('-X');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveLeft');
					}
				}
				break;
			case 'ArrowRight':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('X');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveRight');
					}
				}
				break;
			case '<':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('-Z');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveBack');
					}
				}
				break;
			case '>':
				if (selected !== null)
				{
					if (mode === 'shader')
					{
						selected.transform.setTranslate('Z');
					} else if (mode === 'illu')
					{
						light.moveLight(selected, 'moveFront');
					}
				}
				break;
			case '+':
				if (selected !== null)
				{
					selected.transform.setUniformScale(1.10);
				}
				break;
			case '-':
				if (selected !== null)
				{
					selected.transform.setUniformScale(0.90);
				}
				break;
		}
	},
		true
	);

}
transformSettings.rotate = function() {
	cube1.transform.setRotate(90, 'Z');
    ell1.transform.setRotate(90, 'Y');
	teapot1.transform.setRotate(90, 'X');
};

gui.add(transformSettings,'rotate').name('Rotate');

transformSettings.scale = function() {
	cube1.transform.setUniformScale(0.5);
    ell1.transform.setUniformScale(2);
	teapot1.transform.setUniformScale(3);
};

gui.add(transformSettings,'scale').name('Scale');

//Draw loop
function animate()
{
	cube1.transform.updateMVMatrix();
	ell1.transform.updateMVMatrix();
	teapot1.transform.updateMVMatrix();

	cube1.transform.updatePMatrix();
	ell1.transform.updatePMatrix();
	teapot1.transform.updatePMatrix();

	renderer.clear();
	cube1.draw(shader, light);
	ell1.draw(shader, light);
	teapot1.draw(shader, light);
	window.requestAnimationFrame(animate);
}

animate();
shader.delete();
