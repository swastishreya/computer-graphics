import {vec3, vec4} from 'https://cdn.skypack.dev/gl-matrix';
import Transform from './transform.js';

export default class Mesh
{
	constructor(gl, vertices, indices, vertexNormals, id=0, material={}, mesh_light={})
	{
        this.id = id;
        this.vertexData = new Float32Array(vertices);        
        this.vertexIndices = new Uint16Array(indices);
        this.vertexNormalData = new Float32Array(vertexNormals);

        // Material properties
        this.material = material;

        // Light (switched on/off)
        this.lighting = 1;
        this.mesh_light = mesh_light;

		this.gl = gl;

		this.vertexBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.vertexNormalBuffer = this.gl.createBuffer();

		if (!this.vertexBuffer || !this.indexBuffer || !this.vertexNormalBuffer )
		{
			throw new Error("Buffer for vertex attributes could not be allocated");
        }
        
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexIndices), gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexNormalData), gl.DYNAMIC_DRAW);

        this.transform = new Transform(gl);
    }

    getVertexData()
    {
        return this.vertexData;
    }

    getLighting()
    {
        return this.lighting;
    }
    
    switchLighting(light, lightSwitch)
    {
        if (lightSwitch === 0){
            this.lighting = 0;
        } else if (lightSwitch === 1) {
            this.lighting = 1;
        } 
        var light_switch = light.getLightSwitch();
        var objects = light.getObjects();
        for (var i = 0; i < light_switch.length; i++){
            if (objects[i].id === this.id){
                light_switch[i] = this.lighting;
            }
        }
        light.setLightSwitch(light_switch);
    }

    getTransformedVertices(vertices)
    {
        const currentVertex = vertices;
		const updatedVertex = vec4.create();
		vec4.transformMat4(updatedVertex, currentVertex, this.transform.getMVPMatrix());
		return updatedVertex;
    }

	draw(shader, light)
	{
        var white = [1.0, 1.0, 1.0, 1.0];
        var black = [0.0, 0.0, 0.0, 1.0];

        const uModelViewMatrix = shader.uniform("uModelViewMatrix");
        shader.setUniformMatrix4fv(uModelViewMatrix, this.transform.getMVMatrix());
        const uProjectionMatrix = shader.uniform("uProjectionMatrix");
        shader.setUniformMatrix4fv(uProjectionMatrix, this.transform.getPMatrix());
        const uColor = shader.uniform("uColor");
        shader.setUniform4f(uColor, this.material.diffuse);
        const lighting = shader.uniform("lighting");
        shader.setUniform1i(lighting, 1);
        const constant = shader.uniform("constant");
        shader.setUniform1f(constant, 1.0);
        const linear = shader.uniform("linear");
        shader.setUniform1f(linear, 0.1);
        const quadratic = shader.uniform("quadratic");
        shader.setUniform1f(quadratic, 0.1);

        // Get and set light uniforms
        var lights = []; // array of light property locations (defined globally)
        var n = light.getN(); // number of lights - adjust to match shader
        var mesh_lighting = light.getLightSwitch();
        var mesh_light = light.getLight();
        for (var i = 0; i < n; i++) {
            lights[i] = {}; // initialize this light object
            lights[i].diffuse = shader.uniform("light[" + i + "].diffuse");
            lights[i].specular = shader.uniform("light[" + i + "].specular");
            lights[i].ambient = shader.uniform("light[" + i + "].ambient");
            lights[i].position = shader.uniform("light[" + i + "].position");

            //initialize light 0 to default of white light coming from viewer
            if (mesh_lighting[i] === 1) {
                shader.setUniform4fv(lights[i].diffuse, mesh_light[i].diffuse);
                shader.setUniform4fv(lights[i].specular, mesh_light[i].specular);
                shader.setUniform4fv(lights[i].ambient, mesh_light[i].ambient);
                shader.setUniform4fv(lights[i].position, mesh_light[i].position);

                lights[0].rotY = 0;
            } else //disable all other lights
            {
                shader.setUniform4fv(lights[i].diffuse, black);
                shader.setUniform4fv(lights[i].specular, black);
                shader.setUniform4fv(lights[i].ambient, black);
                shader.setUniform4fv(lights[i].position, black);
            }
        }

        // Get and set material uniforms
        var material = {};
        material.diffuse = shader.uniform("material.diffuse");
        material.specular = shader.uniform("material.specular");
        material.ambient = shader.uniform("material.ambient");
        material.shininess = shader.uniform("material.shininess");

        shader.setUniform4fv(material.diffuse, this.material.diffuse);
        shader.setUniform4fv(material.specular, this.material.specular);
        shader.setUniform4fv(material.ambient, this.material.ambient);
        shader.setUniform1f(material.shininess, this.material.shininess);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);		
		const aPosition = shader.attribute("aPosition");
        this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 3 * this.vertexData.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(aPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        const aNormal = shader.attribute("aNormal");
        this.gl.vertexAttribPointer(aNormal, 3, this.gl.FLOAT, false, 3 * this.vertexNormalData.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(aNormal);

		// draw geometry lines by indices
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, 0);
	}
}