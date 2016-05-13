$(document).ready (function () { 
	var conf = {
		data: {
			cdmx: {
				type: d3.json,
				url: "data/cdmx.json",
				id: "cdmx",
				key: "stdin",
				enumerator: "geometries",
			},
			simat: {
				type: d3.json,
				url: "data/simat.json",
				id: "simat",
				key: "stdin",
				plot: "points",
				idProperty: function (e) { return e.properties.clave; },
				enumerator: "geometries"
			},
			grid: {
				type: d3.json,
				url: "data/grid.json",
				id: "grid",
				key: "stdin",
				plot: "points",
				enumerator: "geometries"
			}
		},
		prequantifiers: {},
		quantifiers: {
			maps: {
				categorize: function (e) {
					if (e.properties.zmvm !== undefined) {
						var ent, zmvm = e.properties.zmvm ? "zmvm" : "";
						switch (e.properties.cve_ent) { 
							case "09": ent = "cdmx"; break;
							case "15": ent = "mex"; break;
							case "17": ent= "mor"; break;
						}
						return {"class": ent + " " + zmvm + " mun_" + e.properties.cvegeo };
					} else if (e.properties.clave !== undefined) {
						var data = {parse: [
							{"control_element": ".pt", "element_attrs": {"r": 0} },
							{"control_element": "." + e.properties.clave + "_1", "element_attrs": {"r": 2} },
							{"control_element": "." + e.properties.clave + "_2", "element_attrs": {"r": 1} },
							{"control_element": "." + e.properties.clave + "_3", "element_attrs": {"r": 0.5} }
						]};
						return {"r": 3, "data": data} 
					} else if (e.properties.simat !== undefined ) {
						var scale = d3.scale.quantize ().domain ([0, 0.5]).range ([1, 2, 3, 4, 5, 6])
							cls = "pt ";

						for (var s in e.properties.simat) {
							cls += " " + e.properties.simat [s].cve + "_" + scale (e.properties.simat [s].dist);
						}
						return {"r": 0.5, "class": cls}
					}
				}
			}
		}
	};
	var a = new Ant (conf);
});
