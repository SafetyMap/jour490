function loadCrimePoints() {
    //read in json data
    $.getJSON ("/assets/json/demo.geojson", function (data) {
          //$.each (data.features, function (i, item)
          //due to api query limit, just show 40 data for demo
        var mydata = data.features;
        for (var i = 0; i < mydata.length; i++) {
            switch (mydata[i].properties.CATEGORY){
                case "ROBBERY": {t = 0;mydata[i].t = t; typedata[0].data.push(mydata[i]);break;}
                case "AGGRAVATED ASSAULT": {t = 1;mydata[i].t = t; typedata[1].data.push(mydata[i]);break;}
                default: t = 2;
            }
        }
        addTypeData(0);
        addTypeData(1);
    });
}

function addTypeData(type) {
    for (var i = 0; i < typedata[type].data.length; i++) {
    var lon = typedata[type].data[i].properties.X_COORDINATE;
    var lat = typedata[type].data[i].properties.Y_COORDINATE;
    var t = typedata[type].data[i].t;

    typedata[type].data[i] = new google.maps.Circle({
        strokeColor: "#FABB3C",//gradient[t],
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#FABB3C",
        fillOpacity: 0.35,
        center: {lat:lat, lng: lon},
        radius: 15//rad[t]

    });

    }
}
function initMap() {
    var styledMapType = new google.maps.StyledMapType([
    {"elementType": "geometry","stylers": [{"color": "#f5f5f5"}]},
    {"elementType": "labels.icon","stylers": [{"visibility": "off"}]},
    {"elementType": "labels.text.fill","stylers": [{"color": "#616161"}]},
    {"elementType": "labels.text.stroke","stylers": [{"color": "#f5f5f5"}]},
    {"featureType": "administrative.land_parcel","elementType": "labels.text.fill","stylers": [{"color": "#bdbdbd"}]},
    {"featureType": "poi","elementType": "geometry","stylers": [{"color": "#eeeeee"}]},
    {"featureType": "poi","elementType": "labels.text.fill","stylers": [{"color": "#757575"}]},
    {"featureType": "poi.park","elementType": "geometry","stylers": [{"color": "#e5e5e5"}]},
    {"featureType": "poi.park","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]},
    {"featureType": "road","elementType": "geometry","stylers": [{"color": "#ffffff"}]},
    {"featureType": "road.arterial","elementType": "labels.text.fill","stylers": [{"color": "#757575"}]},
    {"featureType": "road.highway","elementType": "geometry","stylers": [{"color": "#dadada"}]},
    {"featureType": "road.highway","elementType": "labels.text.fill","stylers": [{"color": "#616161"}]},
    {"featureType": "road.local","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]},
    {"featureType": "transit.line","elementType": "geometry","stylers": [{"color": "#e5e5e5"}]},
    {"featureType": "transit.station","elementType": "geometry","stylers": [{"color": "#eeeeee"}]},
    {"featureType": "water","elementType": "geometry","stylers": [{"color": "#c9c9c9"}]},
    {"featureType": "water","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]}],
    {name: 'Styled Map'});

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 34.0416, lng: -118.2468},
        mapTypeId: 'roadmap'
    });
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
    //find user's location
    //var infoWindow = new google.maps.InfoWindow({map: map});
    var USC = new google.maps.Marker({map:map});
    /*if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        
    */
    var pos = {
            lat: 34.0281185,
            lng: -118.2865914
        };
    USC.setPosition(pos);
    USC.setTitle(pos.lat+","+pos.lng);
    USC.setLabel('USC');
    map.setCenter(pos);
    /*    }, function() {
        handleLocationError(true, me, map.getCenter());
        });
    }else {
    // Browser doesn't support Geolocation
        handleLocationError(false, me, map.getCenter());
    }*/

    gradient = ['#186A3B','#239B56','#28B463','#F7F709','#FFCC00','#FF9900','#FF3300'];
    neighborhoods = new Array(272);
    timeslices = new Array(5);
    for (var i = 0; i < 5; i++) {
      timeslices[i] = new Array(272);
    }

    //import boundary
    $.getJSON ("/assets/json/bound_sort.geojson", function (data) {
       ranks = data.features.rank;
       var mydata = data.features.each;

    //console.log(mydata.length);
      for (var i = 0; i < mydata.length; i++) {
         var vertices = mydata[i].geometry.coordinates;
         polygon = [];
         var t = scoreTotype(mydata[i].stat.degree);
         for (var k = 0; k < 4; k++) {
           timeslices[k][i] = scoreTotype(mydata[i].stat.timeslice[k]);
         }
         timeslices[4][i] = t;
         var properties = mydata[i].properties;
         var index = mydata[i].stat.degree.toFixed(2);
         var message = {name:properties.name, index: index};
         var stat = mydata[i].stat;
         var centroid = new google.maps.LatLng(parseFloat(mydata[i].geometry.centroid.lat),parseFloat(mydata[i].geometry.centroid.lng));
         for (var j = 0; j < vertices[0][0].length; j++) {
             polygon.push({lat: vertices[0][0][j][1], lng: vertices[0][0][j][0]});
         }
         neighborhoods[i] = new google.maps.Polygon({
                center: centroid,
                paths: polygon,
                strokeColor: 'white',//gradient[t],//'#9BCD9B',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: gradient[t],//'#C1FFC1',
                fillOpacity: 0.8
        });
        neighborhoods[i].setMap(map);
        addNeighborhoodStat(neighborhoods[i], message, stat);
      }
      for (var i = 0; i < 10; i++) {
          var id = ranks[i][0];
          var name = mydata[id].properties.name;
          //var id = ""+ranks[i][0];
          var curline = '<div class="rank" id="'+ id +'" onclick="addRankEvent('+id+')">'+(i+1)+'. &nbsp;'+name+'</div>';
          //console.log(curline);
          document.getElementById('myrank').innerHTML += curline;
          //addRankEvent("n"+id);
          //document.getElementById("n"+id).addEventListener("click", function(){
            // console.log(id);
          //});
          
      }
    });

    loadCrimePoints();
    var legend = document.getElementById('legend');

    for (var item in gradient) {
        var boxContainer = document.createElement("DIV");
        var box = document.createElement("DIV");
        boxContainer.className = "bc";
        box.className = "box";
        box.style.backgroundColor = gradient[item];
        boxContainer.appendChild(box);
        legend.appendChild(boxContainer);
    }

    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    map.addListener('zoom_changed', function() {
        zlevel = map.getZoom();
        var cur = true;
        if (zlevel < 13) {
            cur = false;
        }
        if (cur != visibility) {
          //for (var i = 0; i < typedata.length; i++) {
            typedata[0].visible = cur;
          //}
            toggleCrimePoints(0);
        //toggleCrimePoints(1);
            if (cur == true) {
                for (var i in neighborhoods) {
                    neighborhoods[i].setMap(null);
                }
            } else {
                for (var i in neighborhoods) {
                    neighborhoods[i].setMap(map);
                }
            }
            visibility = cur;
        }
    });
}
function addRankEvent(neigh_id) {
 
   neighborhoods[neigh_id].setOptions({strokeColor:'blue', strokeWeight:5,fillOpacity:0.3});
   map.panTo(neighborhoods[neigh_id].center);

   
}
function toggleCrimePoints(type) {
    var circles = typedata[type];
//console.log(circles);
    if (circles.visible == true) {
        for (var i = 0; i < circles.data.length; i++) {
            circles.data[i].setMap(map);
        }
        //document.getElementById('routing').innerHTML = "<p>"+circles.name+
        //"</p><p>Something we found meaningful....</p>";
        circles.visible = false;
    } else {
        for (var i = 0; i < circles.data.length; i++) {
            circles.data[i].setMap(null);
        }
        circles.visible = true;

    }
}

function toggleTimeSlices(index) {
    for (var i in neighborhoods) {
        neighborhoods[i].setOptions({fillColor:gradient[timeslices[index][i]]});
    }
}

function addNeighborhoodStat(neighborhood, message, stat) {
    var infowindow = new google.maps.InfoWindow({
       content: message.name+"<br/>safety index:"+message.index,
	   position: neighborhood.center
    });
    google.maps.event.addListener(neighborhood, 'mouseover', function(event){
        this.setOptions({strokeWeight:8,fillOpacity:0.3});
        //infowindow.setPosition({lat:neighborhood.center.lat, lng:neighborhood.center.lng});
        infowindow.open(map, neighborhood);
        //console.log("center:" + neighborhood.center.lat);
    });
    google.maps.event.addListener(neighborhood, 'mouseout', function(){
        this.setOptions({strokeColor:'white',strokeWeight:2,fillOpacity:0.8});
        infowindow.close();
    });
    google.maps.event.addListener(neighborhood, 'click', function(){
        document.getElementById('neighborhood').innerHTML = message.name;
        document.getElementById('safety-index').innerHTML = message.index;
         //$("#map_panel").hide();
         //document.getElementById("togglebtn").innerHTML = "back";
         //$("#togglebtn").show();
         //console.log(document.getElementById("togglebtn").innerHTML);
         //document.getElementById('explain').innerHTML = "";
        labels = ["NON-AGGRAVATED_ASSAULTS","ROBBERY"];
        Mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];


        //document.getElementById('morris-line-chart').innerHTML = "";
/*
        for (var mindx in Mon) {
            var month = Mon[mindx];
            dd = {m:month};
            mvalue = stat[month];
            for (var i in labels ) {
                var label = labels[i];
                dd[label] = 0;
                if (mvalue.hasOwnProperty(label)){
                   dd[label] = mvalue[label];
                }
            }
        /* for (var j in values ) {
          var type = crimetypes[j];

          if (mvalue.hasOwnProperty(type)){
             values[j] += mvalue[type];
          }
        }
       //console.log(dd);
            lineData.push(dd);
        }
      console.log(values);
    */
        crimelist = [];
        for (var c in stat.top_crime){
            if (c != "total"){
                crimelist.push(c);
            }
        }
        //console.log(stat.top_crime);
        donutData = [
        {label: crimelist[0].replace(/_/g," "),value: stat.top_crime[crimelist[0]]},
        {label: crimelist[1].replace(/_/g," "),value: stat.top_crime[crimelist[1]]},
        {label: crimelist[2].replace(/_/g," "),value: stat.top_crime[crimelist[2]]}];
        //console.log(donutData);
        //donut.setData(donutData)
        barData = [
            { m: 'Jan', a: stat.month_stat.Jan.total},
            { m: 'Feb', a: stat.month_stat.Feb.total},
            { m: 'Mar', a: stat.month_stat.Mar.total},
            { m: 'Apr', a: stat.month_stat.Apr.total},
            { m: 'May', a: stat.month_stat.May.total},
            { m: 'Jun', a: stat.month_stat.Jun.total},
            { m: 'Jul', a: stat.month_stat.Jul.total},
            { m: 'Aug', a: stat.month_stat.Aug.total},
            { m: 'Sep', a: stat.month_stat.Sep.total},
            { m: 'Oct', a: stat.month_stat.Oct.total},
            { m: 'Nov', a: stat.month_stat.Nov.total},
            { m: 'Dec', a: stat.month_stat.Dec.total}
       ];
       
       
       lineData = [];
       for (var mon = 0; mon < 12; mon++){
           //console.log(stat.month_stat[Mon[mon]]);
           tmp = {m: Mon[mon]};
           for (var c in stat.month_stat[Mon[mon]]){
               //console.log(c);
               if (c != "total"){
                   tmp[c] = stat.month_stat[Mon[mon]][c];
               }
           }
           lineData.push(tmp);
       }
        /*
       lineData = [
                { m: '1', a: 2, b: 2 },
                { m: '2', a: 33, b: 3 },
                { m: '3', a: 4,  b: 4 },
                { m: '4', a: 5,  b: 43 },
                { m: '5', a: 66,  b: 23 },
                { m: '6', a: 32,  b: 5 },
                { m: '7', a: 6,  b: 23 },
                { m: '8', a: 12,  b: 56 },
                { m: '9', a: 43,  b: 26 },
                { m: '10', a: 56,  b: 27 },
                { m: '11', a: 24,  b: 17 },
                { m: '12', a: 12,  b: 23 }
              ]*/
      //flag = false;
      $("#myModal").modal('show');
    });
}


function handleLocationError(browserHasGeolocation, myMarker, pos) {
    myMarker.setPosition(pos);
    myMarker.setTitle(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}


function scoreTotype(score) {
     //console.log(score)
    if (score < 48){ return 6;}
    else if (score <= 57){ return 5;}
    else if (score <= 62){ return 4;}
    else if (score <= 65){ return 3;}
    else if (score <= 70){ return 2;}
    else if (score <= 75){ return 1;}
    else{ return 0;}
}

$(document).ready(function(){
    //$("#map_panel").show();
    //$("#myModal").modal('show');
    $('.w').hide();
    //$("#stat_panel").hide();
    //flag = true;
    /*$("#togglebtn").hide();
    $("#togglebtn").click(function(){
      if (flag) {
        $("#map_panel").hide();
        $("#stat_panel").show();
        this.innerHTML = "back";
      } else {
        $("#map_panel").show();
        $("#stat_panel").hide();
        this.innerHTML = "more";
      }
      flag = !flag;
    });*/
    donut_explain = {
"CRIMINAL HOMICIDE": "Refers to the killing of another person, whether lawful or unlawful. Includes murder, manslaughter, as well as justifiable killings.",
"ASSAULT": "Involves a clear intent to commit serious bodily injury to another. Includes any crime that involves the attempt to murder, rob, kill, rape, or assault with a deadly or dangerous weapon.",
"RAPE":"Nonconsensual sexual intercourse accomplished by means of threats, force, or fraud, or  with a victim who is unconscious or incapable of consenting.",
"SEX OFFENSES FELONIES": "Includes rape, spousal rape, statutory rape, child pornography, lewd and lascivious acts or sexual battery.",
"SEX OFFENSES MISDEMEANORS": "Includes indecent exposure, improperly touching a child, prostitution, Solicitation",
"ROBBERY": "Felonious taking of personal property in the possession of another, from his person or immediate presence, and against his will, accomplished by means of force or fear.",
"BURGLARY": "Every person who enters any house, room, apartment or other building with intent to commit grand or petit larceny or any felony.",
"GRAND THEFT AUTO": "The intentional taking away of a motor vehicle that belongs to someone else.",
"LARCENY THEFT": "Unlawfully, intentionally, and permanently taking property that belongs to someone else.",
"ARSON": "To set fire to or burn a structure, forest land, or property; and to do so willfully and maliciously."
   };
	/*case("AGGRAVATED ASSAULT"): text = "<h4>Aggravated Assault:</h4> <p> Involves a clear intent to commit serious bodily injury to another. Includes any crime that involves the attempt to murder, rob, kill, rape, or assault with a deadly or dangerous weapon.</p>"; break;
              case("ROBBERY"): text = "<h4>Robbery:</h4><p> 
              case("RAPE"): text = "<h4>Rape:</h4><p></p>"; break;
    */
    $('#arrow').mouseover(function(){
        $(this).hide("slow");
        $('#mydiv').show("slow");
    });

    $('#mydiv').mouseover(function(){
        $(this).show();
        
    });
    $('#mydiv').mouseout(function(){
        document.getElementById('mydiv').style.visibility = false;
        //document.getElementById('arrow').style.width = "20px";
        //$('#arrow').show();
        for (var i in ranks) {
            //console.log(ranks[i][0]);
            neighborhoods[ranks[i][0]].setOptions({
                strokeColor: 'white',//gradient[t],//'#9BCD9B',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: gradient[t],//'#C1FFC1',
                fillOpacity: 0.8
            });
        }

        $(this).hide();
        $('#arrow').show();
    });
    barData = [];
    bar = Morris.Bar({
        element: 'morris-bar-chart',
        data: barData,
        xkey: 'm',
        ykeys: ['a'],
        labels: ['Total number of crimes'],
        parseTime:false,
        hideHover: true
      });
    
    donutData = [{label: "initial", value: 0}];
    donut = Morris.Donut({
        element: 'morris-donut-chart',
        data: donutData,
        resize: true
        }).on('click', function(i, row){
            var label = row.label.replace(/_/g," ");
            $('.donut-label').html(label);
			var text="nothing now";
			if (donut_explain.hasOwnProperty(row.label)) {
				text = donut_explain[row.label];
			}
			$('.donut-text').html(text);

	   });
    lineData = [];
    $('#myModal').on('shown.bs.modal', function (event) {
        // When you open modal several times Morris charts over loading. So this is for destory to over loades Morris charts.
        // If you have better way please share it.
        bar.setData(barData);
        //console.log(lineData);
        tmplist = [],myLabels = [];
        for (c in lineData[0]){
            if (c != "m"){
                tmplist.push(c);
                myLabels.push(c.replace(/_/g," "));
            }
        }
        //console.log(tmplist);
        document.getElementById('morris-line-chart').innerHTML = "";
        var line = Morris.Line({
        element: 'morris-line-chart',
        data: lineData,
        xkey: 'm',
        ykeys: [tmplist[0],tmplist[1],tmplist[2]],
        labels: [myLabels[0],myLabels[1],myLabels[2]],
        parseTime:false,
        hideHover: true
        });
        donut.setData(donutData);
        if($('#morris-donut-chart').find('svg').length > 1){
                    // Morris Charts creates svg by append, you need to remove first SVG
                $('#morris-donut-chart svg:first').remove();
                    // Also Morris Charts created for hover div by prepend, you need to remove last DIV
                $(".morris-hover:last").remove();
        }
        //console.log(document.getElementById('explain').innerHTML);
        // Smooth Loading
        $('.js-loading').addClass('hidden');

        lineData = [];
        barData = [];
        donutData = [];
    });
    var map;
    visibility = false;
    //store data on different types of crime
    typedata = [
    {name:'ROBBERY',visible:true,data:[]},
    {name:'AGGRAVATED ASSAULT',visible:true,data:[]}
    ];
    ranks = new Array(10);
    initMap();
});
