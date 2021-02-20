export default class Parser
{
    constructor()
    {
    }
    
    parseOBJ(text) {
        // because indices are base 1 let's just fill in the 0th data
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        var faces = [];
        var vertices = [];
    
    
        const keywords = {
            v(parts) {
                vertices = [...vertices, ...parts.map(parseFloat)];
            },
            vn(parts) {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts) {
                // should check for missing v and extra w?
                objTexcoords.push(parts.map(parseFloat));
            },
            f(parts) {
                let face = [];
                for (let i = 0; i < parts.length; ++i) {
                    let ptn = parts[i].split('/').map(parseFloat);
                    face.push(ptn[0]-1);
                }
                faces.push(face);
            },
        };
    
        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }
    
        return {
            vertices: vertices,
            faces: faces,
        };
    }

}

// for (var i = 0; i < faces.length; i++)
        // {
        //     const numTriangles = faces[i].length - 2;
        //     for (let tri = 0; tri < numTriangles; ++tri) {
        //         this.vertexIndices.push(faces[i][0]);
        //         this.vertexIndices.push(faces[i][tri + 1]);
        //         this.vertexIndices.push(faces[i][tri + 2]);
        //       }
        // }

        // console.log(this.vertexIndices);

// for (var i = 0; i < faces.length; i++)
        // {
        //     for (var j = 0; j < faces[i].length; j++)
        //     {
        //         this.vertexData.push(vertices[faces[i][j]*3]);
        //         this.vertexData.push(vertices[faces[i][j]*3 + 1]);
        //         this.vertexData.push(vertices[faces[i][j]*3 + 2]);
        //     }
        // }