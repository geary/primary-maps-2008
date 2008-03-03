#!/usr/bin/env python

# makepolys.py

import math
import os
import random
import shutil
import stat
import sys
import time

from geo import Geo
import shpUtils
import states

shapespath = '../election-data/shapes'

geo = Geo()
keysep = '|'
states.byNumber = {}

useTowns = {
	'CT': 80,
	'MA': 80,
	'NH': 94,
	'VT': 80
}

def loadshapefile( filename ):
	print 'Loading shapefile %s' % filename
	t1 = time.time()
	shapefile = shpUtils.loadShapefile( filename )
	t2 = time.time()
	print '%0.3f seconds load time' %( t2 - t1 )
	return shapefile
	
#def randomColor():
#	def hh(): return '%02X' %( random.random() *128 + 96 )
#	return hh() + hh() + hh()

featuresByName = {}
def featureByName( feature ):
	info = feature['info']
	name = info['NAME']
	if name not in featuresByName:
		featuresByName[name] = {
			'feature': feature #,
			#'color': randomColor()
		}
	return featuresByName[name]

def filterCONUS( features ):
	result = []
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		state = int(info['STATE'])
		if state == 2: continue  # Alaska
		if state == 15: continue  # Hawaii
		if state == 72: continue  # Puerto Rico
		result.append( feature )
	return result

def featuresBounds( features ):
	bounds = [ [ 180.0, 90.0 ], [ -180.0, -90.0 ] ]
	for feature in features:
		shape = feature['shape']
		if shape['type'] == 5:
			for part in shape['parts']:
				bounds = geo.extendBounds( bounds, part['bounds'] )
	return bounds

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def readShapefile( filename ):
	print '----------------------------------------'
	print 'Loading %s' % filename
	
	shapefile = loadshapefile( filename )
	features = shapefile['features']
	print '%d features' % len(features)
	
	#conus = filterCONUS( features )
	#conusBounds = featuresBounds( conus )
	
	#stateFeatures = filterCONUS( stateFeatures )
	#print '%d features in CONUS states' % len(stateFeatures)
	
	#writeFile( 'features.csv', shpUtils.dumpFeatureInfo(features) )
	
	nPoints = nPolys = 0
	places = {}
	for feature in features:
		shape = feature['shape']
		if shape['type'] != 5: continue
		info = feature['info']
		name = info['NAME']
		state = info['STATE']
		key = name + keysep + state
		if key not in places:
			places[key] = {
				'name': name,
				'state': state,
				'bounds': [ [ 180.0, 90.0 ], [ -180.0, -90.0 ] ],
				'shapes': []
			}
		place = places[key]
		shapes = place['shapes']
		for part in shape['parts']:
			nPolys += 1
			points = part['points']
			n = len(points) - 1
			nPoints += n
			pts = []
			area = part['area']
			if area == 0: continue
			bounds = part['bounds']
			place['bounds'] = geo.extendBounds( place['bounds'], bounds )
			centroid = part['centroid']
			points = part['points']
			for j in xrange(n):
				point = points[j]
				pts.append( '[%s,%s]' %( point[0], point[1] ) )
			shapes.append( '{"area":%.8f,"bounds":[[%.8f,%.8f],[%.8f,%.8f]],"centroid":[%.8f,%.8f],"points":[%s]}' %(
				area,
				bounds[0][0], bounds[0][1], 
				bounds[1][0], bounds[1][1], 
				centroid[0], centroid[1],
				','.join(pts)
			) )
	print '%d points in %d places' %( nPoints, len(places) )
	return shapefile, places

def writeUS( places, path ):
	json = []
	keys = places.keys()
	keys.sort()
	for key in keys:
		json.append( getPlaceJSON( places, key ) )
	writeJSON( path, 'us', json )

def writeStates( places, path ):
	keys = places.keys()
	keys.sort()
	for key in keys:
		name, number = key.split(keysep)
		state = states.byNumber[number]
		state['json'].append( getPlaceJSON( places, key ) )
	for state in states.array:
		abbr = state['abbr'].lower()
		writeJSON( path, state['abbr'].lower(), state['json'] )

def writeJSON( path, abbr, json ):
	file = '%s/%s/%s.js' %( shapespath, path, abbr )
	print 'Writing %s' % file
	writeFile( file,
		'''GoogleElectionMap.shapesReady({
	"state": "%s",
	"places": [%s]
})
''' %( abbr, ','.join(json) ) )

def getPlaceJSON( places, key ):
	place = places[key]
	bounds = place['bounds']
	centroid = [ 0, 0 ] # place['centroid']
	return '{"name":"%s","bounds":[[%.8f,%.8f],[%.8f,%.8f]],"centroid":[%.8f,%.8f],"shapes":[%s]}' %(
		key.split(keysep)[0],
		bounds[0][0], bounds[0][1], 
		bounds[1][0], bounds[1][1], 
		centroid[0], centroid[1],
		','.join(place['shapes'])
	)

def generateUS( detail, path='' ):
	shapefile, places = readShapefile( 'states/st99_d00_shp-90/st99_d00.shp' )
	for key in places:
		name, number = key.split(keysep)
		state = states.byName[name]
		state['json'] = []
		state['counties'] = []
		state['number'] = number
		states.byNumber[number] = state
	writeUS( places, path )

def generateStates( detail, path ):
	shapefile, places = readShapefile( 'counties/co99_d00_shp-%s/co99_d00.shp' % detail )
	for key, place in places.iteritems():
		name, number = key.split(keysep)
		state = states.byNumber[number]
		abbr = state['abbr']
		if abbr not in useTowns:
			state['counties'].append( place )
	for abbr, simplify in useTowns.iteritems():
		state = states.byAbbr[abbr]
		number = state['number']
		townshapefile, townplaces = readShapefile(
			'towns/cs%(number)s_d00_shp-%(simplify)s/cs%(number)s_d00.shp' %{
				'number':number,
				'simplify':simplify
			} )
		for key, place in townplaces.iteritems():
			name, number = key.split(keysep)
			state = states.byNumber[number]
			state['counties'].append( place )
			places[key] = place
	writeStates( places, path )

generateUS( 90, 'coarse' )
generateStates( 90, 'coarse' )

generateUS( 75, 'detailed' )
generateStates( 80, 'detailed' )

print 'Done!'
