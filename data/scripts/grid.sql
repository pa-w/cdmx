CREATE OR REPLACE FUNCTION makegrid (geometry, integer) RETURNS geometry AS
	'SELECT 
		ST_Collect(st_SetSRID(ST_POINT(x/1000000::float,y/1000000::float), ST_SRID($1))) 
	FROM 
		generate_series(floor(ST_Xmin($1)*1000000)::int, ceiling(ST_Xmax($1)*1000000)::int,$2) as x,
		generate_series(floor(ST_Ymin($1)*1000000)::int, ceiling(ST_Ymax($1)*1000000)::int,$2) as y 
	WHERE st_intersects($1,ST_SetSRID(ST_POINT(x/1000000::float,y/1000000::float),ST_SRID($1)))'
LANGUAGE SQL;
DROP TABLE IF EXISTS zmvm_grid;
CREATE TABLE zmvm_grid AS 
	SELECT 
		(a.geom).path [1] as id,
		(a.geom).geom
	FROM 
		(SELECT 
			ST_Dump (makegrid (geom, 20000)) as geom 
		FROM 
			(SELECT ST_Union (m.geom) as geom FROM mex_municipio m, zmvm z WHERE m.cvegeo = z.cvegeo) b
		) a
;
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
			(WITH data (id,simat) AS (VALUES (id,simat)) SELECT row_to_json (data) FROM data) as properties
		FROM
			(
			SELECT 
				z.*, 
				(WITH data (cve, dist) AS (SELECT clave, ST_Distance (s.geom, z.geom) as dist FROM simat s ORDER BY s.geom <-> z.geom LIMIT 3) SELECT array_agg (data) FROM data ) as simat

				
			FROM
				zmvm_grid z
			) as self
		) as feature
	) as collection

