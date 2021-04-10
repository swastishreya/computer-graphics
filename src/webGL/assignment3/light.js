import {vec4} from 'https://cdn.skypack.dev/gl-matrix';

export default class Light
{
	constructor(objects)
	{
        this.objects = objects;
        this.n = objects.length; // Number of lights
        this.light_switch = new Uint16Array(this.n);
        for (var i = 0; i < this.n; i++){
            this.light_switch[i] = this.objects[i].getLighting();
        }
        this.light = [];
        this.initial_light_position = [];
        this.object_bounding_boxes = [];
        this.transformed_object_bounding_boxes = [];
        for (var i = 0; i < this.n; i++){
            this.object_bounding_boxes[i] = {};
            var vertices = this.objects[i].getVertexData();
            var minX = Infinity, minY = Infinity, minZ = Infinity;
            var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
            for (var j = 0; j < vertices.length; j++){
                if (j%4 === 0){
                    minX = Math.min(minX, vertices[j]);
                    maxX = Math.max(maxX, vertices[j]);
                } else if (j%4 === 1){
                    minY = Math.min(minY, vertices[j]);
                    maxY = Math.max(maxY, vertices[j]);
                } else if (j%4 === 2){
                    minZ = Math.min(minZ, vertices[j]);
                    maxZ = Math.max(maxZ, vertices[j]);
                }
            }
            var heightX = ((maxX - minX)/2)*1.25;
            var heightY = ((maxY - minY)/2)*1.25;
            var heightZ = ((maxZ - minZ)/2)*1.25;
            var centerX = (maxX + minX)/2;
            var centerY = (maxY + minY)/2;
            var centerZ = (maxZ + minZ)/2;
            minX = centerX - heightX;
            maxX = centerX + heightX;
            minY = centerY - heightY;
            maxY = centerY + heightY;
            minZ = centerZ - heightZ;
            maxZ = centerZ + heightZ;
            this.object_bounding_boxes[i].v0 = vec4.fromValues(minX, minY, minZ, 1.0);
            this.object_bounding_boxes[i].v1 = vec4.fromValues(minX, minY, maxZ, 1.0);
            this.object_bounding_boxes[i].v2 = vec4.fromValues(minX, maxY, minZ, 1.0);
            this.object_bounding_boxes[i].v3 = vec4.fromValues(minX, maxY, maxZ, 1.0);
            this.object_bounding_boxes[i].v4 = vec4.fromValues(maxX, minY, minZ, 1.0);
            this.object_bounding_boxes[i].v5 = vec4.fromValues(maxX, minY, maxZ, 1.0);
            this.object_bounding_boxes[i].v6 = vec4.fromValues(maxX, maxY, minZ, 1.0);
            this.object_bounding_boxes[i].v7 = vec4.fromValues(maxX, maxY, maxZ, 1.0);
            this.initial_light_position[i] = {};
            this.initial_light_position[i].p = this.object_bounding_boxes[i].v0;
            // Still need to apply transformation
            this.transformed_object_bounding_boxes[i] = {};
            
        }
        this.getTransformedObjectBoundingBoxes();

        for (var i = 0; i < this.n; i++) {

            this.light[i] = {}; // initialize this light object
            this.light[i].diffuse = this.objects[i].mesh_light.diffuse;
            this.light[i].specular = this.objects[i].mesh_light.specular;
            this.light[i].ambient = this.objects[i].mesh_light.ambient;
            this.light[i].position = this.objects[i].getTransformedVertices(this.initial_light_position[i].p);

        }
    }
    
    moveLight(object, movement)
    {
        for (var i = 0; i < this.n; i++){
            if (this.objects[i].id === object.id)
            {
                var pos = this.light[i].position;
                var minX = this.object_bounding_boxes[i].v0[0];
                var maxX = this.object_bounding_boxes[i].v4[0];
                var minY = this.object_bounding_boxes[i].v0[1];
                var maxY = this.object_bounding_boxes[i].v2[1];
                var minZ = this.object_bounding_boxes[i].v0[2];
                var maxZ = this.object_bounding_boxes[i].v1[2];
                if (movement === 'moveRight' && pos[0] + 0.1 <= maxX)
                {
                    pos[0] += 0.1;
                } else if (movement === 'moveLeft' && pos[0] - 0.1 >= minX)
                {
                    pos[0] -= 0.1;
                } else if (movement === 'moveUp' && pos[1] + 0.1 <= maxY)
                {
                    pos[1] += 0.1;
                } else if (movement === 'moveDown' && pos[1] - 0.1 >= minY)
                {
                    pos[1] -= 0.1;
                } else if (movement === 'moveFront' && pos[2] + 0.1 <= maxZ)
                {
                    pos[2] += 0.1;
                } else if (movement === 'moveBack' && pos[2] - 0.1 >= minZ)
                {
                    pos[2] -= 0.1;
                }
                this.initial_light_position[i].p = pos;
                this.light[i].position = this.objects[i].getTransformedVertices(this.initial_light_position[i].p);
            }
        }
    }

	getN()
	{
		return this.n;
    }
    
    getLightSwitch()
    {
        return this.light_switch;
    }

    getObjects()
    {
        return this.objects;
    }

    setLightSwitch(light_switch)
    {
        this.light_switch = light_switch;
    }

    getLight()
    {
        return this.light;
    }

    getTransformedObjectBoundingBoxes()
    {
        for (var i = 0; i < this.n; i++){
            this.transformed_object_bounding_boxes[i].v0 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v0);
            this.transformed_object_bounding_boxes[i].v1 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v1);
            this.transformed_object_bounding_boxes[i].v2 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v2);
            this.transformed_object_bounding_boxes[i].v3 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v3);
            this.transformed_object_bounding_boxes[i].v4 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v4);
            this.transformed_object_bounding_boxes[i].v5 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v5);
            this.transformed_object_bounding_boxes[i].v6 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v6);
            this.transformed_object_bounding_boxes[i].v7 = this.objects[i].getTransformedVertices(this.object_bounding_boxes[i].v7);
        }
        return this.transformed_object_bounding_boxes;
    }
}