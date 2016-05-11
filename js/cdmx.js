$(document).ready (function () { 
	var conf = {
		data: {
			cdmx: {
				type: d3.json,
				url: "data/cdmx.json",
				id: "cdmx",
				key: "df_municipio",
				enumerator: "geometries",
			}
		}
	};
	var a = new Ant (conf);
});
