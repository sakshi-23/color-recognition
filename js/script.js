window.onload = function() {
	var width = 1800;
	var height = 900;
	var scaleX = width/480;
	var scaleY = height/300;
	var mouseX=0,mouseY=0;
	var svgContainer = d3.select("#overlay").append("svg")
						.attr("width", width)
						.attr("height",height)
						.attr("class","svg-container");
	
	
	var cursor = svgContainer.append("circle");
	createChart();
	var drawSegments = [[]];
	var segment = 0;
	
	_points = new Array(); // point array for current stroke
	_strokeID = 0;
	_r = new PDollarRecognizer();
	
	svgPath = svgContainer.append("svg:path")
	 				 .style("stroke", "#000")
	 				 .style("strokeWidth","5px")
	 				 .style("fill","none");
	

	var video = document.getElementById('video');


	var tracker = new tracking.ColorTracker();
	//var tracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
	tracking.ColorTracker.registerColor('cyan', function(r, g, b) {
 		 if (r < 50 && g > 200 && b > 200) {
   			 return true;
 			 }
 			 return false;
	});

	tracking.ColorTracker.registerColor('magenta', function(r, g, b) {
 		 if (r > 200 && g < 50 && b > 200) {
   			 return true;
 			 }
 			 return false;
	});

	tracking.ColorTracker.registerColor('yellow', function(r, g, b) {
 		 if (r > 200 && g > 200 && b < 50) {
   			 return true;
 			 }
 			 return false;
	});


	tracking.track('#video', tracker, { camera: true });
	tracker.on('track', function(event) {
		//Traces for Gesture recognition
		if (event.data.length == 0 && drawSegments[segment].length > 0) {
			//segment++;
			if (!drawSegments[segment]) {
				// drawSegments[segment] = [];
			}
		}
		// context.clearRect(0, 0, canvas.width, canvas.height);
		event.data.forEach(function(rect,index, _array) {
	          if (rect.color === 'yellow') {

				  if(index!=0 && _array[index-1].x - _array[index].x<60){}

	        	  if (_strokeID == 0) // starting a new gesture
					{
	        		  	 
	        		  svgPath.attr("d","M "+(width- scaleX*rect.x)+" "+rect.x); //Set path's data
		        		  _points.length = 0;
		        		  _strokeID=1;
					}
	        	  if(rect.x){
	        		  _points[_points.length] = new Point(rect.x, rect.y, _strokeID);
	        		  svgPath.attr("d",svgPath.attr("d")+" L "+(width- scaleX*rect.x)+" "+rect.y); //Set path's data
		           //  executeActions();
	        		  
	        	  }
			  }
	          }

	          else if (rect.color == 'magenta') {
	        	 _strokeID=0;
			    moveCursor(rect.x,rect.y);
			    
			}

	          else if (rect.color == 'cyan') {
	        	  _strokeID=0;
				clickCursor(rect.x,rect.y);
			}


		});
	});
	
	function createChart(){
		
	  
	}

	function mouseOverBar(d){
			var x= d3.event.pageX;
			var y=d3.event.pageY;
			if(x==0){
				x=cursor.attr("cx");
				y=cursor.attr("cy");
			}
			

		}
	
	function mouseClickBar(d){
		d3.selectAll(".bar").style("fill", "steelblue");
		d3.select(this).style("fill", "red");
	}
	
	jQuery.fn.d3MouseOver = function () {
	  this.each(function (i, e) {
	    var evt = new MouseEvent("mouseover");
	    e.dispatchEvent(evt);
	  });
	};
	
	jQuery.fn.d3MouseClick = function () {
		  this.each(function (i, e) {
		    var evt = new MouseEvent("click");
		    e.dispatchEvent(evt);
		  });
		};


//	initGUIControllers(tracker);
	
	function drawShape(rect) {
		cursor.attr("cx", function (d) { return width- scaleX*x; })
			.attr("cy", function (d) { return  scaleY*y; })
			.attr("r", 5)
			.style("fill", function(d) { return"green"; });
	}

	function moveCursor(x,y){
		cursor.attr("cx", function (d) { return width- scaleX*x; })
				.attr("cy", function (d) { return  scaleY*y; })
				.attr("r", 5)
				.style("fill", function(d) { return"green"; });

		var elem = document.elementFromPoint( width- scaleX*x,scaleY*y);
		if(elem && elem.nodeName!="VIDEO"){
			$(elem).d3MouseOver();
		}
		mouseX=x;
		mouseY=y;
		
	}


	function clickCursor(x,y){
		cursor
		.attr("r", 8)
		.style("fill", function(d) { return"blue"; });
		
		var elem = document.elementFromPoint( width- scaleX*mouseX,scaleY*mouseY);
		if(elem && elem.nodeName!="VIDEO"){
			$(elem).d3MouseClick();
		}
		
		if(_points.length>0){
			var result = _r.Recognize(_points);
			console.log("Result: " + result.Name + " (" + (result.Score,2) + ").");
		}
			
	}

	$("body").on("dblclick",function(e){
		var result = _r.Recognize(_points);
		console.log("Result: " + result.Name + " (" + (result.Score,2) + ").");
//		e.preventDefault();
//		console.log("clicked at " + e.pageX + " , " + e.pageY);
	})



};



