const phongFragmentShaderSrc = `   
        precision mediump float;
        varying vec4 vColor;
        varying vec3 normal; 
        varying vec4 mvPosition;

        vec3 N;


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
        uniform bool lighting;  // to enable and disable lighting
        uniform vec4 uColor;    // colour to use when lighting is disabled
        uniform _light light[nLights]; // properties for the n lights
        uniform _material material; // material properties    	
        uniform float constant;
        uniform float linear;
        uniform float quadratic;
        vec4 lightCalc(in _light light);
            
                
        void main() 
        { 
            gl_FragColor = vColor;
            if (lighting != false) 
            {
                //Make sure the normal is actually unit length, 
                //and isolate the important coordinates
                N = normalize(normal);
                
                //Combine colors from all lights
                for (int i = 0; i < nLights; i++)
                {
                    gl_FragColor += lightCalc(light[i]);
                }
                gl_FragColor.a = 1.0; //Override alpha from light calculations
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
                attenuation = 1.0/(constant + linear * dist + quadratic * dist*dist);

                //Calculate colour for this light
                vec4 vColor = Ks * material.specular * light.specular
                            + Kd * material.diffuse * light.diffuse
                            + material.ambient * light.ambient;
                            
                return attenuation*vColor;
        }`;

export default phongFragmentShaderSrc;
