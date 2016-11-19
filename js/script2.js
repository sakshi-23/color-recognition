window.onload = function() {
	var width = 1800;
	var height = 900;
	var scaleX = width/480;
	var scaleY = height/300;
	var mouseX=0,mouseY=0;
	var timerId;
	var orderding_type=0;
	
	var cursor =   d3.select(".cursor");
	createChart();
	var drawSegments = [[]];
	var segment = 0;
	var current_elem="";
	
	_points = new Array(); // point array for current stroke
	_strokeID = 0;
	_r = new PDollarRecognizer();

	

	var video = document.getElementById('video');


	//var tracker = new tracking.ColorTracker();
	var tracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
//	tracking.ColorTracker.registerColor('cyan', function(r, g, b) {
// 		 if (r < 50 && g > 200 && b > 200) {
//   			 return true;
// 			 }
// 			 return false;
//	});
//
//	tracking.ColorTracker.registerColor('magenta', function(r, g, b) {
// 		 if (r > 200 && g < 50 && b > 200) {
//   			 return true;
// 			 }
// 			 return false;
//	});
//
//	tracking.ColorTracker.registerColor('yellow', function(r, g, b) {
// 		 if (r > 200 && g > 200 && b < 50) {
//   			 return true;
// 			 }
// 			 return false;
//	});


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
		event.data.forEach(function(rect,index) {
	          if (rect.color === 'cyan') {
				  console.log(rect)
	        	  clearTimeout(timerId)
	        	  timerId = setTimeout(executeAction, 500);

	        	  if (_strokeID == 0) // starting a new gesture
					{
	        			svgContainer = d3.select("#overlay").append("svg")
	        			.attr("width", $(window).width())
	        			.attr("height",$(window).height())
	        			.attr("class","svg-container")
	        			
	        			svgPath = svgContainer.append("svg:path")
	        			 				 .style("fill","none")
	        			 				 ;
	        		  svgPath.attr("d","M "+(width- scaleX*rect.x)+" "+rect.y); //Set path's data
		        		  _points.length = 0;
		        		  _strokeID=1;
					}
	        	  if(rect.x){
	        		  _points[_points.length] = new Point(rect.x, rect.y, _strokeID);
	        		  svgPath.attr("d",svgPath.attr("d")+" L "+(width- scaleX*rect.x)+" "+rect.y); //Set path's data
//		             executeActions();
	        		  //drawShape(rect.x,rect.y);
	        		  
	        	  }
					
	          }

	          else if (rect.color == 'magenta') {
	        	 _strokeID=0;
			    moveCursor(rect.x,rect.y);
			    
			}

	          else if (rect.color == 'yellow') {
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
				x=cursor.attr("x");
				y=cursor.attr("y");
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
	
	function drawShape(x,y) {
		cursor
        .style("left", width- scaleX*x + "px")
        .style("top", scaleY*y+ "px")
        .style("display", "block")
        .style("background", "pink");
	}

	function moveCursor(x,y){
		
		current_elem= document.elementFromPoint(  width- scaleX*x,y*scaleY);
		if(current_elem && current_elem.nodeName!="VIDEO"){
			$(current_elem).d3MouseOver();
		}
		
		mouseX=x;
		mouseY=y;
		cursor
        .style("left", width- scaleX*x + "px")
        .style("top", scaleY*y+ "px")
        .style("display", "block")
        .style("background", "blue");

		
	}


	function clickCursor(x,y){
		cursor
		.attr("r", 8)
		.style("background", "green");
		
		if(current_elem && current_elem.nodeName!="VIDEO"){
			$(current_elem).d3MouseClick();
		}
		
		if(_points.length>0){
//			var result = _r.Recognize(_points);
		//	console.log("Result: " + result.Name + " (" + (result.Score,2) + ").");
		}
			
	}
	
	function executeAction(){

		d3.select("#overlay svg").remove();
		var result = _r.Recognize(_points);
		console.log("Result: " + result.Name + " (" + (result.Score,2) + ").");
		_strokeID=0;
		if(result.Name.lastIndexOf("star")!=-1 || result.Name.lastIndexOf("asterisk")!=-1 )
			console.log("screenshot");
		
		else if(result.Name =='caret-up')
			mapNew.zoomIn();
			
		else if(result.Name =='caret-down')
			mapNew.zoomOut();
		
		else if(result.Name =='arrow'){
			
			ibuCountChart  = dc.barChart('#chart-ibu-count')
				ibuCountChart
				.width(800)
				.height(270)
				.dimension(ibuDim)
				.group(countPerIBU)
				.x(d3.scale.ordinal().domain(ibuDim)) // Need the empty val to offset the first value
				.xUnits(dc.units.ordinal) // Tell Dc.js that we're using an ordinal x axis
				.brushOn(false)
				.centerBar(false)
				.gap(7)
				.margins({top: 10, right: 20, bottom: 50, left: 50})
				.ordering(function(d) {
					if (orderding_type==0)
						return -d.value; 
					else
						return d.key; 
				})
				
			ibuCountChart.render();
			
			d3.selectAll(".bar").call(barTip);
			d3.selectAll(".bar").on('mouseover', barTip.show)
		      .on('mouseout', barTip.hide);  
		  
		  orderding_type=(orderding_type+1)%2;
		}
		
		  
		
//		GrabzIt("YWJiYjk5ODU5MDUwNDc0NmE2NmY4ZGU3MDRiZTAyMWE=").ConvertHTML(document.documentElement.innerHTML,
//				{"format": "pdf"}).Create();
	}

//	$("body").on("dblclick",function(e){
//		
////		
////		e.preventDefault();
////		console.log("clicked at " + e.pageX + " , " + e.pageY);
//	})



};



