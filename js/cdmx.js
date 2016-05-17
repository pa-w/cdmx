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
			index: {
				type: d3.csv,
				url: "data/aire.csv",
				id: "index",
				processor: function (rows) {
					//var limit = rows.length;
					var limit = 10;
					for (var i = 0; i < limit; i++) {
						var dx = {
							"download": rows [i]["index"], 
							"download_id": "a_" + i, 
							"download_processor": "air", 
							"debug": "download " + i 
						}
						if (i == limit - 1) dx ["download_parse"] = "#download_callback";

						var d = $("<div id='download_" + i + "' class='download'>")
							.data (dx)

						$("#ctrls").append (d);
						var parse = [
							{"control_element": ".pt", "element_attrs": {"r": 0} },
							{"control_element": ".a_" + i + "_2", "element_attrs": {"r": 1} },
							{"control_element": ".a_" + i + "_4", "element_attrs": {"r": 3} },
							{"control_element": ".a_" + i + "_5", "element_attrs": {"r": 5} }, 
							{"control_element": ".a_" + i + "_6", "element_attrs": {"r": 6} }
						]
						var desc = rows [i]["index"];
						$("<div id='scene_"+ i +"'>")
							.data ({parse: parse, debug: "Scene " + i})
							.text (desc)
							.appendTo ("#movie");
					}
					this.initScroll ();
				}
			},
			latest: {
				type: d3.csv,
				url: "data/aire/latests.csv",
				id: "latest",
				processor: function (rows) { 
					rows = rows.sort (function (a, b) { return d3.ascending (parseInt (a.indice), parseInt (b.indice)); })
					var nest = new Nestify (rows, ["clave"], ["clave", "delegacion", "calidad", "parametro", "indice"]);

					return nest.data;
				}
			}
		},
		prequantifiers: { categorize: function () { console.log (this.data); }},
		quantifiers: {
			maps: {
				categorize: function (e, a) {
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
						which stations have an influence on this point: 1 to 3
						*/
						var scale = d3.scale.quantize ().range ([1, 2, 3])
							cls = "pt ", indices = [];
						for (var i = 0; i < 10; i++) {
							var col = "a_" + i;
							for (var s in e.properties.simat) {
								if (!this.data [col]) console.log (col + " no existe"); 
								if (this.data [col] && this.data [col][e.properties.simat [s].cve]) {
									var index = this.data [col][e.properties.simat [s].cve].indice.value,
										domain = d3.scale.linear ().domain ([0, 200]);
									scale.domain ([0, domain (index)]);
									indices.push (index / scale (e.properties.simat [s].dist));
								}

							}
							var maxIndex = Math.max.apply (null, indices);
							scale.domain ([0, 80]).range ([0, 2, 4, 5, 6]); 
							cls += " a_" + i + "_" + scale (maxIndex);
						}

						return {"class": cls}
					}
				}
			}
		},
		callbacks: {
			air: function (rows) {
				return new Nestify (rows, ["clave"], ["clave", "delegacion", "calidad", "parametro", "indice"]).data;
			}
		}
	};
	var a = new Ant (conf);
});
