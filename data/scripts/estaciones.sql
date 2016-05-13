SELECT
	row_to_json (collection)
FROM
	(
	SELECT
		'FeatureCollection' as type,
		array_to_json (array_agg (feature)) as features
	FROM
		(
		SELECT
			'Feature' as type,
			ST_AsGeoJson (self.geom)::json as geometry,
			(WITH 
				DATA (clave,zona,nombre) 
			AS (
				VALUES (self.clave, self.zona, self.nombre)
			) SELECT row_to_json (data) FROM data) as properties
		FROM
			(
			SELECT 
				clave, zona, nombre, geom
			FROM 
				simat
			WHERE
				latitud != '' AND longitud != ''
			) as self
		) as feature
	) as collection
