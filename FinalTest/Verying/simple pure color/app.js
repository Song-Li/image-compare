var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'uniform vec3 dim;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'  //gl_Position = vec4(((2.0*floor(((gl_Position.xyz+1.0)*dim)/2.0))/dim-1.0), gl_Position.w);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  //gl_FragColor = vec4(floor(fragColor * 255.0)/255.0  , 1.0);',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

var gl;

var InitDemo = function () {
/*	
	// get image data
	var myImg = new Image();
	myImg.src = 'image.jpg';
	var context = document.getElementById('canvas');
	context.drawImage(myImg, 0, 0);
	var imgd = context.getImageData(x, y, width, height);
	var pix = imgd.data;
	for (var i = 0, n = pix.length; i < n; i += 4) {
	console.log pix[i+3]
	}
*/	
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl',{antialias: false});

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	
	
	
	
	
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	//
	// Create buffer
	//
	var boxVertices = [];
	var boxIndices = [];
	var j = 0;
/*
	for (var i = -1; i < 0.95; i+= 0.05){
		boxVertices = boxVertices.concat([i, 1.0, 1.0,    		(i + 1) / 2.0, 1.0, 1.0]);
		boxVertices = boxVertices.concat([i + 0.05, 1.0, 1.0,    (i + 1) / 2.0, 1.0, 1.0]);
		boxVertices = boxVertices.concat([-1.0, -1.0, 1.0,    	(i + 1) / 2.0, 1.0, 1.0]);	
		boxIndices = boxIndices.concat([j++ , j ++, j ++]);
	}
	for (var i = -1; i < 0.9; i+= 0.1){
		boxVertices = boxVertices.concat([i + 0.1, -1.0, 1.0,    		(i + 1) / 2.0, 1.0, 1.0]);
		boxVertices = boxVertices.concat([i , -1.0, 1.0,    0.0,(i + 1) / 2.0, 1.0, 1.0]);
		boxVertices = boxVertices.concat([1.0, 1.0, 1.0,    	(i + 1) / 2.0, 1.0, 1.0]);	
		boxIndices = boxIndices.concat([j++ , j ++, j ++]);
	}*/
	
	/*
	boxVertices = [
		 // Front face
    -1.0, -1.0,  1.0, 0.0,  1.0,  1.0,
     1.0, -1.0,  1.0, 1.0,  0.0,  1.0,
     1.0,  1.0,  1.0, 0.0,  0.0,  0.0,
    -1.0,  1.0,  1.0,0.0,  0.0,  0.0,

    // Back face
    -1.0, -1.0, -1.0,1.0,  0.0,  0.0,
    -1.0,  1.0, -1.0,0.0,  1.0,  0.0,
     1.0,  1.0, -1.0,0.0,  0.0,  1.0,
     1.0, -1.0, -1.0,0.0,  1.0,  0.0,

    // Top face
    -1.0,  1.0, -1.0, 1.0,  0.0,  0.0,
    -1.0,  -1.0,  1.0,1.0,  0.0,  0.0,
     1.0,  -1.0,  1.0,0.0,  0.0,  1.0,
     1.0,  1.0, -1.0,0.0,  0.0,  1.0,

    // Bottom face
    -1.0, -1.0, -1.0,1.0,  0.0,  1.0,
     1.0, -1.0, -1.0,0.0,  1.0,  1.0,
     1.0, -1.0,  1.0,1.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,1.0,  1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,1.0,  1.0,  0.0,
     1.0,  1.0, -1.0,1.0,  0.0,  1.0,
     1.0,  1.0,  1.0,0.0,  1.0,  1.0,
     1.0, -1.0,  1.0,1.0,  1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,0.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,1.0,  0.0,  1.0,
    -1.0,  1.0,  1.0,1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,1.0,  1.0,  1.0
	];


	
	boxIndices = [
	
	
	8,  9,  10,     8,  10, 11,   // top
    
	];*/
	//4,  3,  2,      4 ,  2,  7,    // front
/*

	var boxIndices = [];
	boxIndices = boxIndices.concat([0,1,2]);
	boxIndices = boxIndices.concat([3,4,5]);
	boxIndices = boxIndices.concat([6,7,8]);
	boxIndices = boxIndices.concat([9,10,11]);
*/
var k = 0.1;
/*
for (var i = -1; i < 1 - k; i+= k){
	boxVertices = boxVertices.concat([i,  1.0, -1.0, 1 /255 *5 * j,  0.0,  0.0]);
	boxVertices = boxVertices.concat([i,  -1.0,  1.0,1 /255 *5 * j,  0.0,  0.0]);
	boxVertices = boxVertices.concat([i + k,  -1.0,  1.0,1 /255 *5 * j,  0.0,  0.0]);	
	boxVertices = boxVertices.concat([i + k,  1.0, -1.0,1 /255 *5 * j,  0.0,  0.0]);	
	boxIndices = boxIndices.concat([j, j + 1, j + 2, j , j+2, j+3]);
	j += 4;
}
*/
for (var i = -1; i < 1 - k; i+= k){
	boxVertices = boxVertices.concat([i,  1.0, -1.0, 1 /255 *5 * j,  0.0,  0.0]);
	boxVertices = boxVertices.concat([i,  -1.0,  1.0,1 /255 *5 * j,  0.0,  0.0]);
	boxVertices = boxVertices.concat([i + k,  -1.0,  1.0,1 /255 *5 * j,  0.0,  0.0]);	
	boxVertices = boxVertices.concat([i,  1.0, -1.0,  0.0, 1 /255 *5 * j, 0.0]);
	boxVertices = boxVertices.concat([i + k,  -1.0,  1.0,  0.0, 1 /255 *5 * j, 0.0]);	
	boxVertices = boxVertices.concat([i + k,  1.0, -1.0,  0.0, 1 /255 *5 * j, 0.0]);	
	boxIndices = boxIndices.concat([j, j + 1, j + 2, j+3 , j+4, j+5]);
	j += 6;
}




/*
boxVertices = [
// Top face
-1.0,  1.0, -1.0, 1.0,  0.0,  0.0,
-1.0,  -1.0,  1.0,1.0,  0.0,  0.0,
1.0,  -1.0,  1.0,0.0,  0.0,  1.0,
1.0,  1.0, -1.0,1.0,  1.0,  1.0,
];

boxIndices = [	
	0,  1,  2,     0,  2, 3,   // top
	];



	var boxIndices =
	[
		// Top
		0, 1, 2,
		3,4,5,
		6,7,8,
		9,10,11,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];*/	
	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);
	gl.uniform3f(gl.getUniformLocation(program, 'dim'), canvas.width, canvas.height, 100.0);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [4, 4, 4], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	/*
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	*/
	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    var dataURL = canvas.toDataURL('image/png', 1.0);
    console.log(dataURL);
    tryTest(dataURL);
};