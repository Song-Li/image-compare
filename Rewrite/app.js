var canvas = document.getElementById('my_Canvas');
gl = canvas.getContext('experimental-webgl',{antialias: false}); 


/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/		 
		 // 重新定义bufferData并且用全局变量记录bufferData
		 // 这块需要确认是否是index
		 // 如果是index的话还需要重新构造数据
		 gl.my_glbufferData = gl.bufferData;
		 gl.bufferData = function (a, b, c){
			if (a == gl.ELEMENT_ARRAY_BUFFER){
				__My_index = b;
				__My_index_flag = 1;
			}
			else{
				__My_buffer = b;
				gl.my_glbufferData(a, b, c);
			//console.log(b);
			//console.log(__My_buffer);
			}
		 } 
         //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/




/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/	
		//在这里判断是否有index，如果有的话，需要从新构造数据		 
		gl.my_vertexAttribPointer = gl.vertexAttribPointer;
		gl.vertexAttribPointer = function (positionAttributeLocation, size, type, normalize, stride, offset){
			__VertexPositionAttributeLocation = positionAttributeLocation;
			__VertexSize = size;
			__VertexType = type;
			__VertexNomalize = normalize;
			__VertexStride = stride;
			__VertexOffset = offset;
			gl.my_vertexAttribPointer(__VertexPositionAttributeLocation, __VertexSize,__VertexType, __VertexNomalize, __VertexStride, __VertexOffset);	

			//这块进行构造数据
			//未经过测试                 用松神的算法进行测试！！！！！！！正方体的那个进行测试
			if (__My_index_flag == 1){
				var __Tem_my_buffer = [];
				for (var i = 0; i < __My_index.length; i++){
					for (var j = __My_index[i] * stride; j < (__My_index[i] + 1) * stride; j++)
						__Tem_my_buffer = __Tem_my_buffer.concat(__My_buffer);
				}
				__My_buffer = __Tem_my_buffer;
			}

			else {
					if (__VertexOffset == 0)
				{
					// __ActiveBuffer_vertex最后存储所有有效的数据。stride参数还没有加入，之后加。
					//console.log("__My_buffer", __My_buffer);
					stride = stride / 4;  // 这个是因为传入的数据内容大小，转换成数据个数
					for (var i = 0; (i + 1) * stride <= __My_buffer.length; i++)
						for (var j = i * stride + offset; j <  i * stride + offset + size ; j++)
							__ActiveBuffer_vertex = __ActiveBuffer_vertex.concat(__My_buffer[j]);
					//console.log("__ActiveBuffer_vertex",__ActiveBuffer_vertex);
					/*
					//console.log("stride", stride);
					for (var i = __VertexOffset ; i < __My_buffer.length ; i++)
							__ActiveBuffer_vertex = __ActiveBuffer_vertex.concat(__My_buffer[i]);
						for (i = offset * __VertexSize; i < __ActiveBuffer_vertex.length; i++)
							__PointBuffer = __PointBuffer.concat(__ActiveBuffer_vertex[i]);
						__ActiveBuffer_vertex = __PointBuffer;
						__PointBuffer = [];
					*/
				}
				else{
					stride = stride / 4;
					for (var i = 0; (i + 1) * stride <= __My_buffer.length; i++)
						for (var j = i * stride + offset; j <  i * stride + offset + size; j++)
							__ActiveBuffer_frag = __ActiveBuffer_frag.concat(__My_buffer[j]);
				}
			}

		}


         // Point an attribute to the currently bound VBO
        // gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		 
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/


/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
gl.my_drawArrays = gl.drawArrays;
gl.drawArrays = function(primitiveType, offset, count){
   switch (primitiveType){
   case gl.POINTS:
       gl.my_drawArrays(primitiveType,  offset, count);
   break;
   case gl.LINES:
       //gl.my_drawArrays(primitiveType,  offset, count);				
       // 在这块可以加入一个是应该画出来的判断条件,之后加。
       //console.log("count", count);
       //console.log("__VertexSize", __VertexSize);
       // 我在这块没有考虑这里的offset
       for (i = 0; i < count; i += 2){   // 因为是每次取2个点，所以是2，在三角形的时候要变换
           console.log("count i", i);
           // 后面跟着flag参数，1代表第一个和第二个点，2代表第二个和第三个点，3代表第一个和第三个点
           switch (__VertexSize){
           case 1:
               line_1(i,1);
           break;
           case 2:
               line_2(i,1);
           break;
           case 3:
               line_3(i,1);
           break;
           }
       }
       console.log("__My_buffer", __My_buffer);
       console.log("__ActiveBuffer_vertex", __ActiveBuffer_vertex);
       console.log("__PointBuffer", __PointBuffer);
   break;
   case gl.TRIANGLES:
       //console.log("TRIANGLES");
       //先把三角形给完整的画出来
       gl.my_drawArrays(primitiveType, offset, count);
       //之后再重新添加点
       
       for (i = 0; i < count; i += 3){   // 3个点
           console.log("count i", i);
           // 后面跟着flag参数，1代表第一个和第二个点，2代表第二个和第三个点，3代表第一个和第三个点
           switch (__VertexSize){
           case 1:
               line_1(i,1);
               line_1(i,2);
               line_1(i,3);
           break;
           case 2:
               line_2(i,1);
               line_2(i,2);
               line_2(i,3);
           break;
           case 3:
               line_3(i,1);
               line_3(i,2);
               line_3(i,3);
           break;
           }
       }
       
       
       console.log("__My_buffer", __My_buffer);
       console.log("__ActiveBuffer_vertex", __ActiveBuffer_vertex);
       console.log("__PointBuffer", __PointBuffer);


   break;
   }	
   
   // 数据传递到__PointBuffer, 开始在这里进行画图
   var Point_Number = __PointBuffer.length;
   console.log("Point_Number", Point_Number);

   // 重新开始传入buffer
   
   var new_vertex_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, new_vertex_buffer);
   gl.my_glbufferData(gl.ARRAY_BUFFER, new Float32Array(__PointBuffer), gl.STATIC_DRAW);
   //gl.bindBuffer(gl.ARRAY_BUFFER, null);
   gl.my_vertexAttribPointer(__VertexPositionAttributeLocation, __VertexSize,__VertexType, __VertexNomalize, __VertexStride, __VertexOffset);
           
   gl.useProgram(shaderProgram);
   gl.bindBuffer(gl.ARRAY_BUFFER, new_vertex_buffer);
   gl.my_drawArrays(gl.POINTS, 0, Point_Number/2);
}


//var n = 3 * 8;
//gl.drawArrays(gl.TRIANGLES, 0, n);	
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/




/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
		// 较小值返回在前面，较大值在后面, 1 表示交换了， 0 表示没有交换
		function line_1 (i, flag){
			if (flag == 1){
				var x1 = i * __VertexSize;
				var x2 = i * __VertexSize + 1;
			}else if (flag == 2){
				var x1 = i * __VertexSize + 1;
				var x2 = i * __VertexSize + 2;
			}else{
				var x1 = i * __VertexSize;
				var x2 = i * __VertexSize + 2;
			}
			
			//concole.log("x1", x1, "x2", x2);
			x1,x2 = sort(x1, x2)[0],[1];				
			for (var j = x1; j <= x2; j++)
			__PointBuffer = __PointBuffer.concat(j);
		}

		function line_2 (i, flag){
			if (flag == 1){
				var x1 = __ActiveBuffer_vertex[i * __VertexSize];
				var y1 = __ActiveBuffer_vertex[i * __VertexSize + 1];
				var x2 = __ActiveBuffer_vertex[i * __VertexSize + 2];
				var y2 = __ActiveBuffer_vertex[i * __VertexSize + 3];
			}else if (flag == 2){
				var x1 = __ActiveBuffer_vertex[i * __VertexSize + 2];
				var y1 = __ActiveBuffer_vertex[i * __VertexSize + 3];
				var x2 = __ActiveBuffer_vertex[i * __VertexSize + 4];
				var y2 = __ActiveBuffer_vertex[i * __VertexSize + 5];
			}else{
				var x1 = __ActiveBuffer_vertex[i * __VertexSize];
				var y1 = __ActiveBuffer_vertex[i * __VertexSize + 1];
				var x2 = __ActiveBuffer_vertex[i * __VertexSize + 4];
				var y2 = __ActiveBuffer_vertex[i * __VertexSize + 5];
			}
			
			var __Tem = [];
			//console.log("x1", x1, "y1", y1, "x2", x2, "y2", y2);
			var flag; // 1: 以x为基准， 2： 以y为基准
			Math.abs(x1 - x2) > Math.abs(y1 - y2) ? flag = 1: flag = 2;
			//console.log("flag", flag);
			console.log("begin", __PointBuffer);
			__PointBuffer = addPoint_2 (x1, y1, x2, y2, __PointBuffer, flag );
			//__Tem = addPoint_2 (x1, y1, x2, y2, __PointBuffer, flag );
			//__PointBuffer += __Tem;
			console.log("back __PointBuffer", __PointBuffer);
		}

		function line_3(i, flag){
			if (flag == 1){
				var x1 = i * __VertexSize;
				var y1 = i * __VertexSize + 1;
				var z1 = i * __VertexSize + 2;
				var x2 = i * __VertexSize + 3;
				var y2 = i * __VertexSize + 4;
				var z2 = i * __VertexSize + 5;
			}else if (flag == 2){
				var x1 = i * __VertexSize + 3;
				var y1 = i * __VertexSize + 4;
				var z1 = i * __VertexSize + 5;
				var x2 = i * __VertexSize + 6;
				var y2 = i * __VertexSize + 7;
				var z2 = i * __VertexSize + 8;
			}else{
				var x1 = i * __VertexSize;
				var y1 = i * __VertexSize + 1;
				var z1 = i * __VertexSize + 2;
				var x2 = i * __VertexSize + 6;
				var y2 = i * __VertexSize + 7;
				var z2 = i * __VertexSize + 8;
			}
			
			var flag; // 1: 以x为基准， 2： 以y为基准, 3: 以z为基准
			Math.abs(x1 - x2) > Math.abs(y1 - y2) ? (Math.abs(x1 - x2) > Math.abs(z1 - z2) ?  flag = 1: flag = 3):(Math.abs(y1 - y2) > Math.abs(z1 - z2) ?  flag = 2: flag = 3);
			__PointBuffer = addPoint_3 (x1, y1, z1, x2, y2, z2, __PointBuffer, flag );
		}



		function sort( a,  b){
			//console.log("a", a, "b",b);
			return a > b ? [b ,a, 1] : [a ,b, 0];
		}

		function exchange (a , b){
			return [b , a];
		}
		// 在二维数据里面增加二维的数据点
		// 1: 以x为基准， 2： 以y为基准
		function addPoint_2 (x1, y1, x2, y2, __PointBuffer, flag){
			console.log("x1", x1, "y1", y1, "x2", x2, "y2", y2,"flag", flag);
			if (flag == 1){
				var t;
				var returnValue;
				returnValue = sort(x1, x2);
				x1 = returnValue[0];
				x2 = returnValue[1];
				t = returnValue[2];
				if (t == 1){
					returnValue = exchange(y1, y2);
					y1 = returnValue[0];
					y2 = returnValue[1];
				}			
				for (var i = x1; i <= x2; i++){
					__PointBuffer = __PointBuffer.concat(i + 0.5);
					__PointBuffer = __PointBuffer.concat(Math.floor(y1 + (y2 - y1) / (x2 - x1 ) * (i- x1)) + 0.5 );
					// 这个公式在之后还要进行变换
				}	
			}
			else{
				var t;
				var returnValue;
				//console.log("y1", y1, "y2", y2, "t",t);
				//console.log("aaa",sort(y1, y2)[0]);
				returnValue = sort(y1, y2);
				y1 = returnValue[0];
				y2 = returnValue[1];
				t = returnValue[2];
				//console.log("y1", y1, "y2", y2, "t",t);
				//console.log("before", x1, x2);
				if (t == 1){
					returnValue = exchange(x1, x2);
					x1 = returnValue[0];
					x2 = returnValue[1];
				}			
				//console.log("after", x1, x2);
				//console.log("after sort  x1",x1, "y1", y1, "x2", x2, "y2", y2, "t", t);
				console.log("I am here",x1,x2);
				for (var i = y1; i <= y2; i++){
					//console.log("x2 - x1", x2 - x1);
					//console.log("y2 - y1 + 1",y2 - y1 + 1);
					__PointBuffer = __PointBuffer.concat(Math.floor (x1 + (x2 - x1)/ (y2 - y1 ) * (i - y1))+ 0.5 );
					__PointBuffer = __PointBuffer.concat(i + 0.5);
				}	
			}
			return __PointBuffer;
		}
		// 在三维数据里面增加三维的数据点
		// 1: 以x为基准， 2： 以y为基准 3： 以Z为基准
		function addPoint_3 (x1, y1, z1, x2, y2, z2, __PointBuffer, flag ){
			var t;
			var returnValue;
			switch (flag) {
			case 1:
				returnValue = sort(x1, x2);
				x1 = returnValue[0];
				x2 = returnValue[1];
				t = returnValue[2];
				if (t == 1){
					returnValue = exchange(y1, y2);
					y1 = returnValue[0];
					y2 = returnValue[1];
					returnValue = exchange(z1, z2);
					z1 = returnValue[0];
					z2 = returnValue[1];
				}
				for (var i = x1; i <= x2; i++){
					__PointBuffer = __PointBuffer.concat(i + 0.5);
					__PointBuffer = __PointBuffer.concat(Math.floor( y1 + (y2 - y1) / (x2 - x1 ) * (i - x1))+ 0.5 );
					__PointBuffer = __PointBuffer.concat(Math.floor(z1 + (z2 - z1) / (x2 - x1 ) * (i - x1)) + 0.5) ;
					// 这个公式在之后还要进行变换
				}	
			break;
			case 2:
				returnValue = sort(y1, y2);
				y1 = returnValue[0];
				y2 = returnValue[1];
				t = returnValue[2];
				if (t == 1){
					returnValue = exchange(x1, x2);
					x1 = returnValue[0];
					x2 = returnValue[1];
					returnValue = exchange(z1, z2);
					z1 = returnValue[0];
					z2 = returnValue[1];
				}
				for (var i = x1; i <= x2; i++){
					__PointBuffer = __PointBuffer.concat(Math.floor(x1 + (x2 - x1)/ (y2 - y1) * (i - x1))+ 0.5);
					__PointBuffer = __PointBuffer.concat(i + 0.5);
					__PointBuffer = __PointBuffer.concat(Math.floor(z1 + (z2 - z1) / (y2 - y1) * (i - x1)) + 0.5);
					// 这个公式在之后还要进行变换
				}	
			break;
			case 3:
				returnValue = sort(z1, z2);
				z1 = returnValue[0];
				z2 = returnValue[1];
				t = returnValue[2];
				if (t == 1){
					returnValue = exchange(x1, x2);
					x1 = returnValue[0];
					x2 = returnValue[1];
					returnValue = exchange(y1, y2);
					y1 = returnValue[0];
					y2 = returnValue[1];
				}
				for (var i = x1; i <= x2; i++){
					__PointBuffer = __PointBuffer.concat(Math.floor(x1 + (x2 - x1)/ (y2 - y1 ) * (i - x1)) + 0.5);
					__PointBuffer = __PointBuffer.concat(Math.floor(y1 + (y2 - y1) / (x2 - x1 ) * (i - x1)) + 0.5);
					__PointBuffer = __PointBuffer.concat(i + 0.5);
					// 这个公式在之后还要进行变换
				}	
			break;
			}
			return __PointBuffer;
		}