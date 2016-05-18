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
					return {
						"label": x.key, 
						"value": x.values.indice.value, 
						"y": a.scale (parseInt (x.values.indice.value)), 
						"class": x.values.calidad.value.toLowerCase () + 
							" estacion est_" + x.key, 
						"r": x.values.indice.value / 10, 
						"data": {
							"parse": [
								{"control_element": ".estacion", "element_remove_class": "highlight"},
								{"control_element": ".est_" + x.key, "element_add_class": "highlight"}
							]
						}
					}	
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
						if (this.data ["a_"+ a]) {
							var index = this.data["a_" + a][e.properties.clave];
							if (index) {
								
								return {
									"class": "estacion est_" + e.properties.clave +" "+
										index.calidad.value.toLowerCase (),
									"r": parseInt (index.indice.value) / 6 
								}
							} 
							return {};
						}
						return {"r": 3, "class": "estacion est_" + e.properties.clave} 
					} else if (e.properties.simat !== undefined ) {
					/* grid */
						/* 
						which stations have an influence on this point: 1 to 3
						*/
						var scale = d3.scale.quantize ().range ([1, 2, 3])
							debug = "...",
							cls = "pt ", 
							indices = [], 
							parse = [
								{"control_element": ".estacion", "element_remove_class": "highlight"}
							];
						for (var s in e.properties.simat) {
							parse.push ({
								"control_element": ".est_" + e.properties.simat [s].cve,
								"element_add_class": "highlight"
							});
						}
							
						for (var i = 0; i < 100; i++) {
							var col = "a_" + i;
							scale = d3.scale.quantize ()
							indices = [];
							for (var s in e.properties.simat) {
								if (this.data [col] && this.data [col][e.properties.simat [s].cve]) {
									var index = this.data [col][e.properties.simat [s].cve].indice.value,
										domain = d3.scale.linear ().domain ([0, 150]);
									scale.domain ([0, domain (index)]);
									indices.push (index / (scale (e.properties.simat [s].dist) + 1));
								}
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
			air: function (rows, id) {
				var worstCalidad = 'BUENA', worstIndex = 0;
				for (var i in rows) {
					if (parseInt (rows [i].indice) > worstIndex) {
						worstCalidad = rows [i].calidad;
						worstIndex = parseInt (rows [i].indice);
					}
				}
				$("#"+ id +" .calidad").remove ();
				$("#"+ id).append ($("<h3 class='calidad " + worstCalidad.toLowerCase () + "'>").text (worstCalidad +" (" + worstIndex + " puntos)"));
				return new Nestify (rows, ["clave"], ["clave", "delegacion", "calidad", "parametro", "indice"]).data;
			},
			initScrolls: function () { 
				this.initScroll ();
			},
			cloner: function (element, data, idx, total) { 
				var parse = [
					//{"control_element": ".pt", "element_attrs": {"r": 0}, "debug": "Resetting"},
					{"control_element": ".a_" + idx + "_0", "element_attrs": {"r": 1} },
					{"control_element": ".a_" + idx + "_1", "element_attrs": {"r": 2} },
					{"control_element": ".a_" + idx + "_2", "element_attrs": {"r": 3} },
					{"control_element": ".a_" + idx + "_3", "element_attrs": {"r": 4} }, 
					{"control_element": ".a_" + idx + "_4", "element_attrs": {"r": 6} },
					{"control_element": ".a_" + idx + "_5", "element_attrs": {"r": 8} },
					{"parse": "#quantify_simat_" + idx + ".active"}
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
					"class": "download",
					"id": "a_" + idx
				}, 

				elm = d3.select (element);
				var d = data.index.split ("."), x = d[0].split ("/")[2].split ("-");

				var title = document.createElement ("h3");
				title.innerText = x [1]+"/"+ x [2] +" "+ d[1].substring (0, 2) + ":00";

				element.appendChild (title);
				
				var quantifier = document.createElement ("span");
				element.appendChild (quantifier);
				d3.select (quantifier)
					.attr({
						"id": "quantify_simat_" + idx, 
						"class": "quantifier",
						"data-control_chart": "cdmx",
						"data-quantify": "simat", 
						"data-quantifier": "categorize", 
						"data-quantifier_args": idx,
					});

				elm.attr(attr)
				//.text (x + " " + parseInt (d [1])/100);

				if (idx == total - 1) dt ["download_parse"] = "#download_callback";
				
				for (var d in dt) {
					elm.attr ("data-" + d, dt [d] === Object (dt [d]) ? JSON.stringify (dt [d]) : dt [d]);
				}

			}
		}
	};
	var a = new Ant (conf);
});
