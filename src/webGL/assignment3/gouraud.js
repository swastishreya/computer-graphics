const gouraudVertexShaderSrc = ` 
    //diffuse and ambient multi-light shader

    //inputs
    attribute vec4 aPosition;
    attribute vec3 aNormal;

    //outputs
    varying vec4 vColor;

    //structs
    struct _light
    {
        vec4 diffuse;
        vec4 specular;
        vec4 ambient;
        vec4 position;
    };

    struct _material
    {
        vec4 diffuse;
        vec4 specular;
        vec4 ambient;
        float shininess;
    };

    //constants
    const int nLights = 3; // number of lights

    //uniforms
    uniform mat4 uProjectionMatrix;    // perspective matrix
    uniform mat4 uModelViewMatrix;     // modelview matrix
    uniform bool lighting;             // to enable and disable lighting
    uniform vec4 uColor;               // colour to use when lighting is disabled
    uniform _light light[nLights];     // properties for the n lights
    uniform _material material;        // material properties
    uniform float constant;
    uniform float linear;
    uniform float quadratic;

    //globals
    vec4 mvPosition; // unprojected vertex position
    vec3 N; // fixed surface normal

    //prototypes
    vec4 lightCalc(in _light light);

    void main() 
    {
        //Transform the point
        mvPosition = uModelViewMatrix*aPosition;  //mvPosition is used often
        gl_Position = uProjectionMatrix*mvPosition; 

        if (lighting == false) 
        {
            vColor = uColor;
        }
        else
        {
            //Make sure the normal is actually unit length, 
            //and isolate the important coordinates
            N = normalize((uModelViewMatrix*vec4(aNormal,0.0)).xyz);
            
            //Combine colors from all lights
            vColor.rgb = vec3(0,0,0);
            for (int i = 0; i < nLights; i++)
            {
                vColor += lightCalc(light[i]);
            }
            vColor.a = 1.0; //Override alpha from light calculations
        }
    }

    vec4 lightCalc(in _light light)
    {
        //Set up light direction for positional lights
        vec3 L;
        
        //If the light position is a vector, use that as the direction
        if (light.position.w == 0.0) 
            L = normalize(light.position.xyz);
        //Otherwise, the direction is a vector from the current vertex to the light
        else
            L = normalize(light.position.xyz - mvPosition.xyz);

        //Set up eye vector
        vec3 E = -normalize(mvPosition.xyz);
        vec3 H = normalize(L+E); 
        float Ks = pow(max(dot(N, H),0.0), material.shininess);
        
        //Calculate diffuse coefficient
        float Kd = max(dot(L,N), 0.0);

        //Calculate attenuation
        float attenuation = 1.0;
        float dist = length(light.position.xyz - mvPosition.xyz);
        attenuation = 1.0/(constant + linear*dist + quadratic*dist*dist);

        //Calculate colour for this light
        vec4 vColor = Ks * material.specular * light.specular
                    + Kd * material.diffuse * light.diffuse
                    + material.ambient * light.ambient;
        
        return attenuation*vColor;
    }
`;

export default gouraudVertexShaderSrc;