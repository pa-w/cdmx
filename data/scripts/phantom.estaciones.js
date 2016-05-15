
"use strict";
var page = require ('webpage').create ();

page.onConsoleMessage = function (msg) {
	console.log (msg);
};

console.log ("fetching ... ");
page.open ("http://aire.df.gob.mx/googlemaps/index.php", function (status) { 
	console.log (status);
	if (status == "success") {
		page.evaluate (function () {
			console.log (window.station);
			for (var est in window.station) {
				console.log (est);
			}
		}); 
	}
	phantom.exit (0);
/*
	if (st === "success") {
		page.evaluate (function () { 
			console.log (station);
		}
	}
*/
});
