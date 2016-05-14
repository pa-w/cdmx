// Read the Phantom webpage '#intro' element text using jQuery and "includeJs"

"use strict";
var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open ("http://www.aire.df.gob.mx/ultima-hora-reporte.php", function (status) { 
	if (status === "success") {
		page.evaluate (function () { 
			var tbls = document.querySelectorAll ("#tabladf,#tablaedomex");
			var t = [];
			for (var x = 0; x < tbls.length; x++) {
				var trs = tbls [x].querySelectorAll ("tr");
				for (var i = 0; i < trs.length; i++) {
					var d = [];
					var tds = trs [i].querySelectorAll ("td");
					for (var e = 0; e < tds.length; e++) {
						if (tds [0].innerText.length == 3) {
							var scripts = tds [e].querySelectorAll ("script");
							d.push (tds [e].innerText);
						}
					}

					t.push (d);
				}
			}
			console.log ("clave,delegacion,calidad,parametro,indice");
			for (var a in t) {
				if (t [a].length > 2) { 
					var txt = t [a].join (",")
					console.log (txt);
				}
			}
		});
		phantom.exit (0);
	}
});
