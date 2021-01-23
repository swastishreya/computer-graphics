// const fragmentShaderSrc = `      
// 		precision mediump float;       
//         void main () {               
//           gl_FragColor = vec4(1.0,0.0,1.0,1.0); 
//         }                            
// 	  `;

// export default fragmentShaderSrc;

const fragmentShaderSrc = `      
		precision mediump float;   
		varying vec3 vColor;       
        void main () {               
          gl_FragColor = vec4(vColor, 1.0); 
        }                            
	  `;

export default fragmentShaderSrc;
