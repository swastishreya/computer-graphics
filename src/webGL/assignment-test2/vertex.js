const vertexShaderSrc = `      
        attribute vec4 aPosition;  
        attribute vec4 aColor; 
        uniform mat4 uModelTransformMatrix;

        varying vec4 vColor;  
        void main () {             
          gl_Position = uModelTransformMatrix * aPosition; 
		      gl_PointSize = 5.0;    
		      vColor = aColor;
        }                          
	  `;

export default vertexShaderSrc;
