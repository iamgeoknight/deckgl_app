import pandas as pd
import geopandas as gpd
import json

#Read datasets
uk_accidents_1 = pd.read_csv('uk_accidents/uk_accidents_2005_to_2007.tar.xz', low_memory=False)
uk_accidents_2 = pd.read_csv('uk_accidents/uk_accidents_2009_to_2011.tar.xz', low_memory=False)
uk_accidents_3 = pd.read_csv('uk_accidents/uk_accidents_2012_to_2014.tar.xz', low_memory=False)

uk_accidents = pd.concat([uk_accidents_1, uk_accidents_2, uk_accidents_3])

# Convert Long Lat into numeric type
uk_accidents['Longitude'] = pd.to_numeric(uk_accidents['Longitude'])
uk_accidents['Latitude'] = pd.to_numeric(uk_accidents['Latitude'])

# Convert Longitude Latitude into Point Geometry
uk_accidents = gpd.GeoDataFrame(geometry = gpd.points_from_xy(x=uk_accidents['Longitude'], y=uk_accidents['Latitude']))
uk_accidents = uk_accidents.set_crs('EPSG:4326')

# Remove invalid geometries if any
uk_accidents = uk_accidents[uk_accidents.is_valid]
uk_accidents = uk_accidents[~uk_accidents.is_empty]

# Get x, y coordinates
uk_accidents['x'] = uk_accidents.geometry.x
uk_accidents['y'] = uk_accidents.geometry.y

df = uk_accidents[['x', 'y']]

#Save data points in json format
coords = []
for x, y in zip(df.x, df.y):
    coords.append({
        "COORDINATES": [x, y]
    })

with open('jsons/uk_accidents.json', 'w') as filehandle:
    json.dump(coords, filehandle)