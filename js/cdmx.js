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
			},
			latest: {
				type: d3.csv,
				url: "data/aire/latests.csv",
				id: "latest",
				processor: function (rows) { 
					rows = rows.sort (function (a, b) { return d3.ascending (parseInt (a.indice), parseInt (b.indice)); })
					rows.forEach (function (a) { console.log (a.indice); });
					var nest = new Nestify (rows, ["clave"], ["clave", "delegacion", "calidad", "parametro", "indice"]);

					return nest.data;
				}
			}
		},
		prequantifiers: {},
		quantifiers: {
			maps: {
				categorize: function (e) {
					if (e.properties.zmvm !== undefined) {
					/* municipios */
						var ent, zmvm = e.properties.zmvm ? "zmvm" : "";
						switch (e.properties.cve_ent) { 
							case "09": ent = "cdmx"; break;
							case "15": ent = "mex"; break;
							case "17": ent= "mor"; break;
						}
						return {"class": ent + " " + zmvm + " mun_" + e.properties.cvegeo };
					} else if (e.properties.clave !== undefined) {
					/* estaciones de monitoreo */
						var data = {parse: [
							//{"control_element": ".pt", "element_attrs": {"r": 0} },
							{"control_element": "." + e.properties.clave + "_1", "element_attrs": {"r": 2} },
							{"control_element": "." + e.properties.clave + "_2", "element_attrs": {"r": 1} },
							{"control_element": "." + e.properties.clave + "_3", "element_attrs": {"r": 0.5} }
						]};
						return {"r": 3, "class": "estacion"} 
					} else if (e.properties.simat !== undefined ) {
					/* grid */
						/* 
						which stations have an influence on this point: 1 to 5
						*/
						var scale = d3.scale.quantize ().range ([1, 2, 3])
							cls = "pt ", indices = [];
						for (var s in e.properties.simat) {
							if (this.data.latest [e.properties.simat [s].cve]) {
								var index = this.data.latest [e.properties.simat [s].cve].indice.value,
									domain = d3.scale.linear ().domain ([0, 150]);

								scale.domain ([0, domain (index)]);
								indices.push (index / scale (e.properties.simat [s].dist));
							
								cls += " " + e.properties.simat [s].cve + "_" + scale (e.properties.simat [s].dist);
							}

						}
						var maxIndex = Math.max.apply (null, indices);
						scale.domain ([0, 100]).range ([0, 2, 4, 5, 6]); // 80 is the max

						return {"r": scale (maxIndex) - 1, "class": cls}
					}
				}
			}
		}
	};
	var a = new Ant (conf);
});
