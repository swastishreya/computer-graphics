export default class Parser
{
	constructor(objectData)
	{
      var verts = [];
      var vertNormals = [];
      var textures = [];
      
      // unpacking stuff
      var packed = {};
      packed.verts = [];
      packed.norms = [];
      packed.textures = [];
      packed.hashindices = {};
      packed.indices = [];
      packed.index = 0;
      
      // array of lines separated by the newline
      var lines = objectData.split( '\n' )
      console.log(lines);
      for( var i=0; i<lines.length; i++ ){
        // if this is a vertex
        lines[i] = lines[i].trim();
        console.log(lines[i]);
        if( lines[ i ].startsWith( 'v' ) ){
          let line = lines[ i ].slice( 2 ).split( " " )
          verts.push( line[ 0 ] );
          verts.push( line[ 1 ] );
          verts.push( line[ 2 ] );
        }
        // if this is a vertex normal
        else if( lines[ i ].startsWith( 'vn' ) ){
          let line = lines[ i ].slice( 3 ).split( " " )
          vertNormals.push( line[ 0 ] );
          vertNormals.push( line[ 1 ] );
          vertNormals.push( line[ 2 ] );
        }
        // if this is a texture
        else if( lines[ i ].startsWith( 'vt' ) ){
          let line = lines[ i ].slice( 3 ).split( " " )
          textures.push( line[ 0 ] );
          textures.push( line[ 1 ] );
        }
        // if this is a face
        else if( lines[ i ].startsWith( 'f' ) ){
          let line = lines[ i ].slice( 2 ).split( " " );
          var quad = false;
          for(var j=0; j<line.length; j++){
              // Triangulating quads
              // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
              // corresponding triangles:
              //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
              //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
              if(j == 3 && !quad) {
                  // add v2/t2/vn2 in again before continuing to 3
                  j = 2;
                  quad = true;
              }
  
              if( line[ j ] in packed.hashindices ){
                  packed.indices.push( packed.hashindices[ line[ j ] ] );
              }
              else{
                  let face = line[ j ].split( '/' );
                  // vertex position
                  packed.verts.push( verts[ (face[ 0 ] - 1) * 3 + 0 ] );
                  packed.verts.push( verts[ (face[ 0 ] - 1) * 3 + 1 ] );
                  packed.verts.push( verts[ (face[ 0 ] - 1) * 3 + 2 ] );
                  // vertex textures
                  packed.textures.push( textures[ (face[ 1 ] - 1) * 2 + 0 ] );
                  packed.textures.push( textures[ (face[ 1 ] - 1) * 2 + 1 ] );
                  // vertex normals
                  packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 0 ] );
                  packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 1 ] );
                  packed.norms.push( vertNormals[ (face[ 2 ] - 1) * 3 + 2 ] );
                  // add the newly created vertex to the list of indices
                  packed.hashindices[ line[ j ] ] = packed.index;
                  packed.indices.push( packed.index );
                  // increment the counter
                  packed.index += 1;
              }
  
              if(j == 3 && quad) {
                  // add v0/t0/vn0 onto the second triangle
                  packed.indices.push( packed.hashindices[ line[ 0 ] ] );
              }
          }
        }
      }
      this.vertices = packed.verts.map(parseFloat);
      this.vertexNormals = packed.norms;
      this.textures = packed.textures;
      this.indices = packed.indices;
  }
  
}