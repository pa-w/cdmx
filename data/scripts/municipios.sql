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
				DATA (gid, cvegeo, cve_ent, cve_mun, nomgeo,zmvm) 
			AS (
				VALUES (self.gid, self.cvegeo, self.cve_ent, self.cve_mun, self.nomgeo, self.zmvm)
			) SELECT row_to_json (data) FROM data) as properties
		FROM
			(
			SELECT 
				m.*, 
				(z.cvegeo IS NOT NULL) as zmvm
			FROM 
				mex_municipio m LEFT JOIN
				zmvm z ON m.cvegeo = z.cvegeo
			) as self
		) as feature
	) as collection
