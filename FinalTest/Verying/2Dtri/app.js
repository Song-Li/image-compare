var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform vec2 dim;',
'uniform float scale;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  vec2 pos = vertPosition;',
'  //pos.x = pos.x / scale;',
'  //pos = floor((dim/16.0)*(pos+1.0))*16.0/dim-1.0;',
'  pos = (2.0*floor(((pos+1.0)*dim)/2.0))/dim-1.0;',
'  //gl_Position = vec4(pos , 0.0, 1.0);',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n'); 

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'  //gl_FragColor = vec4(floor(fragColor * 255.0)/255.0 , 1.0);',
'  //gl_FragColor = vec4(1.0, 0.0, 0.0 , 1.0);',
'}'
].join('\n');

var InitDemo = function () {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl',{antialias: false});

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
	/*
	var triangleVertices = 
	[ // X, Y,       R, G, B
		-0.7, 1.0,    0.0 , 1.0, 0.0,
		-0.8, -0.8,  1.0, 0.0, 0.0,
		0.7, -0.5,   0.0,0.0,1.0
	];

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	*/
	var boxVertices = [];
	var boxIndices = [];
	var j = 0;
	var k = 0.001;
	for (var i = -1; i < 1 - k; i+= k){
		boxVertices = boxVertices.concat([i,  1.0,  1 /255 *5 * j,  0.0,  0.0]);
		boxVertices = boxVertices.concat([i,  -1.0,  1 /255 *5 * j,  0.0,  0.0]);
		boxVertices = boxVertices.concat([i + k,  -1.0,  1 /255 *5 * j,  0.0,  0.0]);	/*
		boxVertices = boxVertices.concat([i,  1.0, -1.0,   1 /255 *5 * j, 0.0]);
		boxVertices = boxVertices.concat([i + k,  -1.0,   0.0, 1 /255 *5 * j, 0.0]);	
		boxVertices = boxVertices.concat([i + k,  1.0,   0.0, 1 /255 *5 * j, 0.0]);	
		boxIndices = boxIndices.concat([j, j + 1, j + 2, j+3 , j+4, j+5]);
		j += 6;*/
		boxIndices = boxIndices.concat([j, j + 1, j + 2]);
		j += 3;
	}
	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var triangleIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	
	//
	// Main render loop
	//
	gl.useProgram(program);
	gl.uniform2f(gl.getUniformLocation(program, 'dim'), canvas.width, canvas.height);
	var scale = 1.0;
	var dir = 1;
	var scalepos = gl.getUniformLocation(program, 'scale');
	gl.uniform1f(scalepos, scale);
	gl.drawArrays(gl.TRIANGLES, 0, 5000);

    var dataURL = canvas.toDataURL('image/png', 1.0);
    console.log(dataURL);
    tryTest(dataURL);
};
