
$( document ).ready(function() {
var prevChart,prevDayChart;
 mapNew = L.map('map');
var breweryMarkers = new L.FeatureGroup();

L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=sk.eyJ1IjoiZGhydXZjaGFuZCIsImEiOiJjaXZtb2JlamEwYTVjMm9wM2czbWR3ZjJqIn0.netEBHSaIYINrdSgqUb6Gw', {
  id: 'PUI',
  accessToken: 'sk.eyJ1IjoiZGhydXZjaGFuZCIsImEiOiJjaXZtb2JlamEwYTVjMm9wM2czbWR3ZjJqIn0.netEBHSaIYINrdSgqUb6Gw',
  maxZoom: 16,
  minZoom:2  
} ).addTo(mapNew);


//tooltips for pie chart
var pieTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) { 
    	return "<span style='color: #f0027f'>" +  d.data.key + "</span> : "  + (d.value); });

//tooltips for bar chart
var barTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
    	return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + (d.y);});


/* Parse JSON file, create charts, draw markers on map */
d3.json('untappd.json', function (error, data) {
  var beerData = data.response.beers.items;

  var fullDateFormat = d3.time.format('%a, %d %b %Y %X %Z');
  var yearFormat = d3.time.format('%Y');
  var monthFormat = d3.time.format('%b');
  var dayOfWeekFormat = d3.time.format('%a');

  // normalize/parse data so dc can correctly sort & bin them
  // I like to think of each "d" as a row in a spreadsheet
  _.each(beerData, function(d) {
    d.count = +d.count;
    // round to nearest 0.25
    d.rating_score = Math.round(+d.rating_score * 4) / 4;
    d.beer.rating_score = Math.round(+d.beer.rating_score *4) / 4;
    // round to nearest 0.5
    d.beer.beer_abv = Math.round(+d.beer.beer_abv * 2) / 2;
    // round to nearest 10
    d.beer.beer_ibu = Math.floor(+d.beer.beer_ibu / 10) * 10;

    d.first_had_dt = fullDateFormat.parse(d.first_had);
    d.first_had_year = +yearFormat(d.first_had_dt);
    d.first_had_month = monthFormat(d.first_had_dt);
    d.first_had_day = dayOfWeekFormat(d.first_had_dt);
  });

  // set crossfilter
  var ndx = crossfilter(beerData);

  // create dimensions (x-axis values)
   yearDim  = ndx.dimension(function(d) {return d.first_had_year;}),
      // dc.pluck: short-hand for same kind of anon. function we used for yearDim
      dayOfWeekDim = ndx.dimension(dc.pluck('first_had_day')),
      ibuDim = ndx.dimension(function(d) {return d.beer.beer_ibu;})
	  allDim = ndx.dimension(function(d) {return d;});
  // create groups (y-axis values)
  var all = ndx.groupAll();
   countPerDay = dayOfWeekDim.group().reduceCount(),
      countPerIBU = ibuDim.group().reduceCount();

countPerIBU.all = function(){return this.top(Infinity)}

  // specify charts
   		dayChart   = dc.pieChart('#chart-ring-day'),
      //ibuCountChart  = dc.barChart('#chart-ibu-count'),
	   dataTable = dc.dataTable('#data-table');

  dayChart
      .width(200)
      .height(200)
      .dimension(dayOfWeekDim)
      .group(countPerDay)
      .innerRadius(20)
      .ordering(function (d) {
        var order = {
          'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3,
          'Fri': 4, 'Sat': 5, 'Sun': 6
        }
        return order[d.key];
      }
     );
  
//  dayChart.filter=function (chart,e) { // <-this bit onwards does the magic (I think)
//	  if(prevDayChart==chart)
//		  return;
//	  d3.selectAll(".bar").style('fill','#1f77b4');
//	  dayOfWeekDim.filter(chart)
//	  dc.renderAll();
//	  d3.select(d3.event.target).style('fill','red');
//	  prevDayChart=chart;
//  }
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
    //console.log(d) ;
	  return d.key; })

//  ibuCountChart
//      .width(800)
//      .height(270)
//      .dimension(ibuDim)
//      .group(countPerIBU)
//      .x(d3.scale.ordinal().domain(ibuDim.group().all().map(function (d) {return d.value; })))
//      .xUnits(dc.units.ordinal)
//      .brushOn(false)
//      .centerBar(false)
//      .barPadding(5)
//      .xAxisLabel('International Bitterness Units')
//      .yAxisLabel('Count')
//      .xUnits(function (d) { return 5;})
//      .margins({top: 10, right: 20, bottom: 50, left: 50});
//  
//  ibuCountChart.filter=function (chart,e) { // <-this bit onwards does the magic (I think)
//	  if(prevChart==chart)
//		  return;
//	  d3.selectAll(".bar").style('fill','#1f77b4');
//	  ibuDim.filter(chart)
//	  dc.renderAll();
//	  d3.select(d3.event.target).style('fill','red');
//	  prevChart=chart;
//  }
  
//  ibuCountChart.on('filtered', function(chart) {
//	  
//	  
//  });
  

 

   dataTable
    .dimension(allDim)
    .group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
    .size(100)
    .columns([
      function (d) { return d.brewery.brewery_name; },
      function (d) { return d.beer.beer_name; },
      function (d) { return d.beer.beer_style; },
      function (d) { return d.rating_score; },
      function (d) { return d.beer.rating_score; },
      function (d) { return d.beer.beer_abv; },
      function (d) { return d.beer.beer_ibu; }
    ])
    .sortBy(dc.pluck('rating_score'))
    .order(d3.descending)
    .on('renderlet', function (table) {
      // each time table is rendered remove nasty extra row dc.js insists on adding
      table.select('tr.dc-table-group').remove();

      // update map with breweries to match filtered data
      breweryMarkers.clearLayers();
      _.each(allDim.top(Infinity), function (d) {
        var loc = d.brewery.location;
        var name = d.brewery.brewery_name;
        var marker = L.marker([loc.lat, loc.lng]);
        marker.bindPopup("<p>" + name + " " + loc.brewery_city + " " + loc.brewery_state + "</p>");
        breweryMarkers.addLayer(marker);
      });
      mapNew.addLayer(breweryMarkers);
      mapNew.fitBounds(breweryMarkers.getBounds());
    });

  // register handlers
  d3.selectAll('a#all').on('click', function () {
	  console.log(mapNew+breweryMarkers);
    dc.filterAll();
    dc.renderAll();
  });

  d3.selectAll('a#day').on('click', function () {
    dayChart.filterAll();
    dc.redrawAll();
  });

  d3.selectAll('a#ibu').on('click', function () {
	  ibuCountChart.filterAll();
	  dc.renderAll();
  });

  // showtime!
  dc.renderAll();
  
  
  d3.selectAll(".pie-slice").call(pieTip);
  d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
      .on('mouseout', pieTip.hide);

  d3.selectAll(".bar").call(barTip);
  d3.selectAll(".bar").on('mouseover', barTip.show)
      .on('mouseout', barTip.hide);  

});
});