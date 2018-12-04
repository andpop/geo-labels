console.log("In entry.js");

ymaps.ready(init);

function init () {
    var myMap = new ymaps.Map('map', {
        center   : [54.17523457, 45.18074950], // Саранск
        zoom     : 16,
        behaviors: ['drag']
    });
    myMap.controls.add('zoomControl');

}
