---
export_on_save:
  html: true
---
# Safety Map
#### visit link: http://gdt.usc.edu:3000
#### source code
project directory on USC server:
gdt.usc.edu:/var/www/html/Annenberg-IMSC/CrimeMap/safety_map
Github link: https://github.com/SafetyMap/jour490

### how to run it and kill it
#### run it tempararily
```
ssh xibei@gdt.usc.edu
cd /var/www/html/Annenberg-IMSC/CrimeMap/safety_map
node app.js
```
#### kill it
```
lsof -i 3000 //to see the processID
kill -9 processID
```


### project folder tree
```
safety_map
|-- controllers
    | routeController.js
    | testdb.js
|-- public
    |-- assets
        |-- css
            | map_routing.css
            | map.css
        |-- js
            | map.js
            | morris.min.js
            | raphael.min.js
        |-- json
            | bound_sort.geojson
            | boundtotal_.geojson
            | bound_try_.geojson
            | demo.geojson
    | favicon.ico
    | SafetyMapLogo.png
|-- views
    | map.ejs
    | map_routing_test.ejs
    | intro.ejs
| app.js
| package.json
| ReadMe.md
| aggtotal.sql
```

entry file: app.js
package dependence description: package.json

### modules introduction
#### safety of neighborhood
##### functionality:
- Show boundary and safety index (range 0 - 100)
We use Google Map to show boundary and safety index for each neighborhood in LA with different color gradients (range 0 - 6). And each neighborhood (polygon) has its own infowindow which simply shows the name and safety index
- Deeper statistics for each neighborhood
When click each neighborhood on the map, a modal will pop up, which contains the detailed statistics for that neighborhood in graphs (morris jQuery library), such as total crimes for each month, most 3 frequent crime type for each month and so on
- Ranking over LA neighborhoods (TOP 10)
When you hover over a small picture on the left side, a ranking panel will show up where there are top 10 safest neighborhoods in LA with names. And when some item on the ranking list is clicked, our map will automatically pan to that neighborhood and show the boundary with blue borders.
- Safety situation for different hours
There are 4 buttons above the map which shows 4 different time periods(3AM-9AM, 9AM-3PM, 3PM-9PM, 9PM -3AM) a day. When you click any button, the map will show the safety index for each neighborhoods within that period of a day
- Exact crime points when zoom in
when you zoom in (level 13 or higher), the map will rerender and show exact crime points with tiny orange circles. We plan to show all crime data but there's too much data. Cannot fix the loading speed problem now. Currently we only show parts of crime points.

##### related files:
views/map.ejs
public/assets/css/map.css
public/assets/js/map.js
public/assets/json/bound_sort.geojson
public/assets/json/demo.geojson
(for morris chart)
public/assets/js/morris.min.js
public/assets/js/raphael.min.js
##### Code Explanation:
map.ejs: the view file, simply html, layout and text
map.css: style file for map.ejs
map.js: contains main logic

- function loadCrimePoints:
  - load raw crime points from demo.geojson file, create Google Map object with crime data and store objects to typedata array

- function addTypeData:
  - for one type of crime, create Google Map object and store into typedata array

- function initMap:
  - create map, an instance of styled Google Map
  - add marker with USC geolocation to map
  - define color gradient array
  - import boundary for LA neighborhoods from bound_sort.geojson
  - read information for each neighborhood such as safety index for different time periods, geolocation, create Polygon for each neighborhood and add that to map, add event listener 'click', 'mouseover','mouseout' for neighborhood where click link to the statistics modal popup event
  - add rank information and set the ranking panel UI
  - load crime points
  - add legend for map to specify the color gradients and corresponding meaning
  - add event listener 'zoom_changed' for map and link zoom level greater than or equal to 13 to showing raw crime points on map
while level less than 13 correlates to the default boundary, safety index information

- function addRankEvent
  - a event listener for clicking rank item, each time an item on the ranking list is clicked, the map will pan to that neighborhood

- function toggleCrimePoints
  - change type of crime points, not useful now

- function toggleTimeSlices
  - change the safety index for neighborhoods with change of time periods of a day

- function addNeighborhoodStat
  - add 'mouseover', 'mouseout','click' event listener for the given neighborhood
  - for 'mouseover' and 'mouseout', simply link them to the change of the boundary style and the infowindow opening or not
  - for 'click', it links to the statistics modal popup event.
here we process and push the statistics information to some global variables, and then call function to let modal show

- function handleLocationError
  - this function was meant to handle error callback when there's error in browser's geolocation fetch, but our project url now starts with 'http', the program cannot even fetch geolocation, not useful now

- function scoreTotype
  - map score 0 - 100 to color gradient 0 - 6 with 0 being the safest and 6 the least safe

- $(document).ready()
  - define graph explanation texts
  - add animation for ranking panel, specifically 'mouseout', 'mouseover' function for ranking panel and small picture on the left side
  - initialize statistics graph objects using Morris library, add some animation for them
  - add callback function for modal's 'shown.bs.modal' event.
  this event occurs once the modal(show) function is called.
  in the callback function, we set those graph objects with the updated data and rerender the UI
  - call initMap to initialize most things

#### safety route
##### functionality:
- Ask for user's input and return routes
User can enter their start point and end point and choose the transportation they want to use. Then, using Google Map API, we can get all possible routes back.
- Segment long path into shorter path
since some route is long (e.g. from LA downtown to Santa Monica), it is meaningless to give one overall score to this long path, so we break it into smaller unit and evaluate each segment individually.
- Query the database and get a score back
We use node.js to send data to the backend and query the database to get the total number of crimes around the path segment and then convert the count into a safety score.
- Show the routes in different colors
Having the score of each path segment, we assign different colors and draw them on map using google map's polyline
##### related files:
views/map_routing_test.ejs
public/assets/css/map_routing.css
controllers/routeController.js
##### Code Explanation:
map_routing_test.ejs:

- function initMap:
  - create map, an instance of styled Google Map
  - call AutocompleteDirectionsHandler function to get the routes from the start point to end point

- class AutocompleteDirectionsHandler:
  - this basically use the tutorial in google map document
  - reference:  https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete?
  - we modify the class member AutocompleteDirectionsHandler.prototype.route in this class to make it show different routes according to different safty score

-  function AutocompleteDirectionsHandler.prototype.route
  - by setting provideRouteAlternatives: true, the google api returns all possible routes instead of only one
  - clean the former routes if either origin or destination is changed
  - set markers for the origin (green marker) and destination (red marker)
  - create a color set including green, yellow, orange and red (from safe to dangerous)
  - response.routes will contain all possible routes. Each route is represents as an array of geo points
  - when breaking the whole route, we group every ten points into a segment. For those segments, we create two arrays to store the necessary info: 1. *segments:* store the strings of the segment for database queries 2. *paths:* store the geo points for later drawing polylines
  - we use ajax to send the *segments* to backend for database query and get the corresponding score back and then fraw the polyline
  - add a mouse event to each segment(introduced later)

- function mouseEvent
  - to view the route as a whole (combine the segmentsback to the original long route), we add a mouse event
  - when users move mouse over a route, a black outline will be show to tell the users how the whole route look like
  - when users move mouse out, the black outline will disappear

- function count2score
  - the returned data is the number of crime around the segment rather than the real safty score, so we need to convert
  - the basic idea is that higher the crime count, lower the saftey degree
  - we check the returned data to determine the boundary points, you may change them later or improve the conversion mechanism
  - 0 stands for the safest (green) while 3 stands for the most dangerous (red)

map_routing.css: style file for map_routing_test.ejs
routeController.js: mainly implement the nearby neighborhood crime data query for a given route
- PostgreSQL database configuration
- use pg connection pool to optimize performance rather than single client connection each time
- parse the request info in JSON format into route segments array
- spatial query for crime cases count near each route segments
  - for 'near' we mean within 0.01 degree minus or plus range geographically)
  - query according to the current system time (here we simply split a day into 2 parts, day and night)
  - we create a temp sequence r to mark the segment index in original segments to maintain the segments order
  - the sql statement:
```
BEGIN
create temp sequence r
select count(*), st.rnum from (
  select nextval('r') as rnum, geom from (
    select ST_GeomFromGeoJSON(unnest(ARRAY['GEOJSON segment',...])) as geom)
    as tmp ) as st, public.aggtotal as agg
where ST_DWithin(st.geom, agg.latlng, 0.01) is true
and (extract(hour from incident_date) either at daytime or night)
group by st.rnum;
COMMIT
```
- after executing the sql query
  - fail, return status fail for different errors
  - success, return the query results, and the index of current route (obtain from request info) in JSON format
#### safety matters
##### functionality:
- Give an analysis of the crime data in LA county.
- Give some data visulization of tear trend of crime data
##### related files:
views/intro.ejs
##### Code Explanation:

- This is a simple html file
- Data visualization:
  - the charts are generated on https://data.lacity.org, and they provides the code to insert in the webpage


#### database
PostgreSQL with PostGis spatial extension
- database: crime_map
- user: xibei
- table: aggtotal
store the crime cases info including the geolocation and crime info such as crime_date, neighborhood id('bid' field)
- schema: refer 'aggtotal.sql'
- index built: column 'latlng'

#### backend framework
backend language: Node.js
framework: express, an MVC framework
- model: none
- view: use ejs view engine to create view templates for html files
- controller: currently only 1 routeController
- routing:
```
request type | routing url   | action type  | controller       | page redirect to
get             /              normal           none              map
get             /route         normal           none              map_routing_test
get             /intro         normal           none              intro
post            /detect_crime  Ajax             routeController   none
```
##### author:
Xi Chen: 771486569@qq.com
Bei Gao: beigao@usc.edu
##### data resource provided by Prof. Yao-Yi Chiang
