window.onload = function() {
	var width = 1600;
	var height = 900;
	var scaleX = width/480;
	var scaleY = height/300;
	var mouseX=0,mouseY=0;
	var svgContainer = d3.select("old_container").append("svg")
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
	var tracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
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
		event.data.forEach(function(rect) {
	          if (rect.color === 'yellow') {
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
		
	    var margin = {top: 20, right: 20, bottom: 30, left: 480},
	    width = +1000- margin.left - margin.right,
	   height = +600 - margin.top - margin.bottom;
	
		var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
		    y = d3.scaleLinear().rangeRound([height, 0]);
		
		var g = svgContainer.append("g")
		    .attr("transform", "translate(" +  margin.left + "," + margin.top + ")");
		
		 tooltip = d3.select("body").append("div").attr("class", "toolTip");
		
		d3.tsv("../data.tsv", function(d) {
		  d.frequency = +d.frequency;
		  return d;
		}, function(error, data) {
		  if (error) throw error;
		
		  x.domain(data.map(function(d) { return d.letter; }));
		  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
		
		  g.append("g")
		      .attr("class", "axis axis--x")
		      .attr("transform", "translate(0," + height + ")")
		      .call(d3.axisBottom(x));
		
		  g.append("g")
		      .attr("class", "axis axis--y")
		      .call(d3.axisLeft(y).ticks(10, "%"))
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", "0.71em")
		      .attr("text-anchor", "end")
		      .text("Frequency");
		
		  g.selectAll(".bar")
		    .data(data)
		    .enter().append("rect")
		      .attr("class", "bar")
		      .attr("x", function(d) { return x(d.letter); })
		      .attr("y", function(d) { return y(d.frequency); })
		      .attr("width", x.bandwidth())
		      .attr("height", function(d) { return height - y(d.frequency); })
		      .on("mouseover",mouseOverBar)
		      .on("mouseout", function(d){ tooltip.style("display", "none");})
		      .on("click", mouseClickBar);
		});
	}

	function mouseOverBar(d){
			var x= d3.event.pageX;
			var y=d3.event.pageY;
			if(x==0){
				x=cursor.attr("cx");
				y=cursor.attr("cy");
			}
			
		 tooltip
         .style("left", x + "px")
         .style("top", y+ "px")
         .style("display", "inline-block")
         .html(d.frequency);
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



