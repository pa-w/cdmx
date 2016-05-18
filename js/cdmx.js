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
				/*
				processor: function (rows) {
					//var limit = rows.length;
					var limit = 20;
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
							//{"control_element": ".pt", "element_attrs": {"r": 0}, "debug": "Resetting"},
							{"control_element": ".a_" + i + "_0", "element_attrs": {"r": 0} },
							{"control_element": ".a_" + i + "_1", "element_attrs": {"r": 1} },
							{"control_element": ".a_" + i + "_2", "element_attrs": {"r": 2} },
							{"control_element": ".a_" + i + "_3", "element_attrs": {"r": 3} }, 
							{"control_element": ".a_" + i + "_4", "element_attrs": {"r": 4} },
							{"control_element": ".a_" + i + "_5", "element_attrs": {"r": 5} }
						]
						var x = rows [i]["index"].split ("."), 
							date = x [0].split ("/"), time = x [1], desc = time;

						$("<div id='scene_"+ i +"'>")
							.data ({parse: parse, debug: "Scene " + i})
							.text (desc)
							.appendTo ("#movie");
					}
					this.initScroll ();
				}
				*/
			}
		},
		prequantifiers: { 
			calidad: function (idx) {
				if ( this.data && this.data [idx]) {
					var values = this.data [idx].items ();
					return {
						"data": [
							{
							"values": values,
							"attrs": {"class": "line"}
							}
						], 
						"scale": d3.scale.linear ().domain ([0, 200])
					};
				}
			}
		},
		quantifiers: {
			lines: {
				calidad: function (x, d, a) {
					x.values.indice.value = x.values.indice.value ? x.values.indice.value : 0;
					return { "label": x.key, "value": x.values.indice.value, "y": a.scale (parseInt (x.values.indice.value)), "class": x.values.calidad.value.toLowerCase (), "r": x.values.indice.value / 10, "data": {} }	
				}
			},
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
						return {"r": 3, "class": "estacion est_" + e.properties.clave} 
					} else if (e.properties.simat !== undefined ) {
					/* grid */
						/* 
						which stations have an influence on this point: 1 to 3
						*/
						var scale = d3.scale.quantize ().range ([1, 2, 3])
							debug = "...",
							cls = "pt ", indices = [], parse = [
											{"control_element": ".estacion", 
											"element_attrs": {"r": "3" } }
											];
						for (var i = 0; i < 10; i++) {
								var col = "a_" + i;
							for (var s in e.properties.simat) {
								if (this.data [col] && this.data [col][e.properties.simat [s].cve]) {
									var index = this.data [col][e.properties.simat [s].cve].indice.value,
										domain = d3.scale.linear ().domain ([0, 150]);
									scale.domain ([0, domain (index)]);
									indices.push (index / (scale (e.properties.simat [s].dist) + 1));
								}
								parse.push ({
									"control_element": ".est_" + e.properties.simat [s].cve,
									"element_attrs": {"fill": "purple", "r": "10"}
								});

							}
							var maxIndex = Math.max.apply (null, indices);
							scale.domain ([0, 80]).range ([0, 1, 2, 3, 4, 5]); 
							cls += " a_" + i + "_" + scale (maxIndex);

						}
						var data = {
							"parse": parse
							//here we can do something very, very cool like highlight the neighbors
						};
						return {"class": cls, "data": data}
					}
				}
			}
		},
		callbacks: {
			air: function (rows) {
				return new Nestify (rows, ["clave"], ["clave", "delegacion", "calidad", "parametro", "indice"]).data;
			},
			initScrolls: function () { 
				this.initScroll ();
			},
			cloner: function (element, data, idx, total) { 
				var parse = [
					//{"control_element": ".pt", "element_attrs": {"r": 0}, "debug": "Resetting"},
					{"control_element": ".a_" + idx + "_0", "element_attrs": {"r": 0} },
					{"control_element": ".a_" + idx + "_1", "element_attrs": {"r": 1} },
					{"control_element": ".a_" + idx + "_2", "element_attrs": {"r": 2} },
					{"control_element": ".a_" + idx + "_3", "element_attrs": {"r": 3} }, 
					{"control_element": ".a_" + idx + "_4", "element_attrs": {"r": 4} },
					{"control_element": ".a_" + idx + "_5", "element_attrs": {"r": 5} }
				]
				var dt = {
					"download": data.index,
					"download_id": "a_" + idx, 
					"download_processor": "air", 
					"download_clone": "tr",
					"download_clone_into": "#data_" + idx,
					"download_clone_callback": "table",
					"control_chart": "calidad",
					"quantify": "a_" + idx,
					"quantifier": "calidad",
					"quantifier_args": "a_" + idx,
					"parse": parse
				},
				attr = {
					"class": "download"
				}, 

				elm = d3.select (element);
				var d = data.index.split ("."), x = d[0].split ("/")[2];

				elm.attr(attr).text (x + " " +parseInt (d [1])/100);

				if (idx == total - 1) dt ["download_parse"] = "#download_callback";
				
				for (var d in dt) {
					elm.attr ("data-" + d, dt [d] === Object (dt [d]) ? JSON.stringify (dt [d]) : dt [d]);
				}

			}
		}
	};
	var a = new Ant (conf);
});
