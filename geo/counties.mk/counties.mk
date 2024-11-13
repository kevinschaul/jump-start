data/build/counties.geojson: data/build/cb_2023_us_county_5m.shp
	mkdir -p $(dir $@)
	npx mapshaper \
		-i name=counties $< \
		-filter "'78,72,69,66,60'.indexOf(STATEFP) == -1" \
		-filter-fields GEOID \
		-clean \
		-each 'GEOID_N = +GEOID' \
		-o gj2008 id-field=geoID_N $@

data/build/states.geojson: data/build/counties.geojson data/raw/states.csv
	mkdir -p $(dir $@)
	npx mapshaper \
		-i $< \
		-each 'GEOID = GEOID.slice(0, 2)' \
		-dissolve2 'GEOID' \
		-clean \
		-join data/raw/states.csv keys=GEOID,fips string-fields=fips \
		-each 'GEOID_N = +GEOID' \
		-o gj2008 $@

data/build/states-inner-lines.geojson: data/build/states.geojson
	mkdir -p $(dir $@)
	npx mapshaper \
		-i $< \
		-innerlines \
		-each 'GEOID=0' \
		-o gj2008 $@

data/build/nation.geojson: data/build/counties.geojson
	mkdir -p $(dir $@)
	npx mapshaper \
		-i $< \
		-dissolve2 \
		-each 'GEOID=0' \
		-clean \
		-o gj2008 $@

data/build/cb_2023_us_county_5m.shp:
	mkdir -p $(dir $@)
	wget -qcO $(basename $@).zip 'https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_county_5m.zip'
	unzip -o $(basename $@).zip -d $(dir $@)
	touch $@

data/raw/states.csv:
	mkdir -p $(dir $@)
	curl -o $@ 'https://raw.githubusercontent.com/kevinschaul/us-abbreviations/refs/heads/master/src/abbreviations.csv'
