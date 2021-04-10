const phongVertexShaderSrc = `      
        //diffuse and ambient multi-light shader

        //inputs
        attribute vec4 aPosition;
        attribute vec3 aNormal;


        //outputs
        varying vec4 vColor;
        varying vec3 normal;
        varying vec4 mvPosition; //unprojected vertex position


        //constants
        const int n = 1; // number of lights

        //uniforms
        uniform mat4 uProjectionMatrix;     // perspective matrix
        uniform mat4 uModelViewMatrix;    // modelview matrix

        //globals
        vec3 N; // fixed surface normal

        void main() 
        {
            //Transform the point
            mvPosition = uModelViewMatrix*aPosition;  //mvPosition is interpolated for pixel lighting
            gl_Position = uProjectionMatrix*mvPosition; 

            //normal is also interpolated for pixel lighting
            normal = (uModelViewMatrix*vec4(aNormal,0.0)).xyz;
            
        }`;

export default phongVertexShaderSrc;