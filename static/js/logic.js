//creating empty layergroup for later adding to map
//https://www.tutorialspoint.com/leafletjs/leafletjs_layers_group.htm
var earthquakeLayer = new L.layerGroup();

//light tile layer
var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

//satellite tile layer
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

//create map with layer
var map =  L.map("map", {
    center: [38.6270, -90.1994], //st. louis
    zoom: 3,
    layers: [earthquakeLayer]
});

//Add lightMap and satelliteMap tiles to the map
lightMap = lightMap.addTo(map);
satelliteMap = satelliteMap.addTo(map);

//overlay object
var overlayMaps = {
    "Earthquakes": earthquakeLayer,
};
//basemap object
var baseMaps = {
    "Light": lightMap,
    "Satellite": satelliteMap,
};

//add base and overlay layers
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

//color scale based on earthquake magnitude
//http://www.perbang.dk/rgbgradient/
//https://stackoverflow.com/questions/22040118/switch-statement-with-range-value
//https://gis.stackexchange.com/questions/260852/switch-icons-on-geojson-file-in-leaflet
var circleColor = function getColor(mag) {
  switch(true) {
      case(mag>0 && mag<=1): return "#7cf92f";
      break;
      case(mag>1 && mag<=2): return "#bef627";
      break;
      case(mag>2 && mag<=3): return "#f3e120";
      break;
      case(mag>3 && mag<=4): return "#ef9218";
      break;
      case(mag>4 && mag<=5): return "#ed4011";
      break;
      case(mag>5): return "#ea0b2a"
  }
};

var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// fetch GEOJson data for the earthquake layer
d3.json(link, function(data){
  createMap(data);
});

function createMap(data) {
     L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Location: "+feature.properties.place +
                            "</h3><h3>Magnitude: "+feature.properties.mag +
                            "</h3><h3>DateTime: "+ new Date(feature.properties.time)+"</h3>")
        },
        pointToLayer: function (feature, latlng) {
            return new L.circleMarker(latlng, {
                radius: feature.properties.mag*5,
                fillColor: circleColor(feature.properties.mag),
                fillOpacity: 0.8,
                color: "black",
                weight: .5
            })
        }
    }).addTo(earthquakeLayer);

    //setting up legend
        var legend = L.control({position: "bottomleft"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var magnitudes = [1,2,3,4,5,5.1];
        var colors = magnitudes.map(d=>circleColor(d));
        labels=[];

        var legendInfo = "<h3><center>Magnitude</center></h3>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">"+"<" + magnitudes[0].toFixed(1)+ "</div>" +
            "<div class=\"max\">"+">"+magnitudes[magnitudes.length-2].toFixed(1) +"</div>"+
            "</div>"
      
        div.innerHTML = legendInfo;
        // set up legend color bar
        
        magnitudes.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>"); 
        })
        div.innerHTML += "<ul>"+ labels.join("") + "</ul>";
        return div;
    };
    legend.addTo(map);
};