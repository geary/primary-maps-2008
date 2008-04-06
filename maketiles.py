#!/usr/bin/env python

# maketiles.py

shapespath = '../election-data/shapes/detailed'
tilespath = '../election-tiles/tiles'

import magick
import math
import os
import random
import re
import shutil
import stat
import sys
import time

from geo import Geo
import shpUtils
import states

def randomColor():
	return hh() + hh() + hh()

def randomGray():
	h = hh()
	return '#' + h + h + h

def hh():
	return '%02X' %( random.random() *128 + 96 )

placesByName = {}
def placeByName( place ):
	name = place['name']
	if name not in placesByName:
		placesByName[name] = {
			'place': place,
			'color': randomColor()
		}
	return placesByName[name]

def filterCONUS( places ):
	result = []
	for place in places:
		state = place['name']
		if state == 'Alaska': continue
		if state == 'Hawaii': continue
		if state == 'Puerto Rico': continue 
		result.append( place )
	return result

def placesBounds( places ):
	bounds = [ [ None, None ], [None, None ] ]
	for place in places:
		bounds = geo.extendBounds( bounds, place['bounds'] )
	return bounds

def readFile( filename ):
	f = open( filename, 'rb' )
	data = f.read()
	f.close()
	return data

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def generate( state, zoom ):
	global geo, scaleoffset
	print '----------------------------------------'
	print 'Generating %s zoom %d' %( state, zoom )
	scale = 10
	
	geo = Geo( zoom, 256*scale )
	pixgeo = Geo( zoom, 256 )
	
	#exec re.sub( '.+\(', 'data = (', readFile( '%s/%s.js' %( shapespath, state ) ) )
	json = readFile( '%s/%s.js' %( shapespath, state ) )
	exec re.sub( '^.+\(', 'data = (', json )
	places = data['places']
	
	#t1 = time.time()
	
	places = filterCONUS( places )
	
	#outer = pixgeo.pixFromGeoBounds( featuresBounds(features) )
	bounds = placesBounds( places )
	outer = pixgeo.pixFromGeoBounds( bounds )
	outer = pixgeo.inflateBounds( outer, 8 )
	gridoffset, gridsize = pixgeo.tileBounds( outer )
	scaleoffset = pixgeo.scalePoint( gridoffset, scale )
	print 'Offset:[%d,%d], Size:[%d,%d]' %( gridoffset[0], gridoffset[1], gridsize[0], gridsize[1] )

	draw = [ 'scale .1,.1\n' ]
	
	draw.append( 'stroke-width 10\n' )
	drawPlaces( draw, places )
	
	cmdfile = 'draw.tmp'
	writeFile( cmdfile, ''.join(draw) )
	
	#t2 = time.time()
	#print '%0.3f seconds to generate commands' %( t2 - t1 )
	
	crop = True
	if crop:
		cropcmd = '-crop 256x256'
	else:
		cropcmd = ''
	blank = magick.blank( gridsize )
	base = '%s/%s/%s-%d' %( tilespath, state, state, zoom )
	command = ( '%s -draw "@%s" %s ' + base + '.png' )%( blank, cmdfile, cropcmd )
	#command = ( '%s -draw "@draw.cmd" %s -depth 8 -type Palette -floodfill 0x0 white -background white -transparent-color white ' + base + '.png' )%( blank, cropcmd )
	#command = ( 'null: -resize %dx%d! -floodfill 0x0 white -draw "@draw.cmd" %s -depth 8 -type Palette -background white -transparent white -transparent-color white ' + base + '.png' )%( gridsize[0], gridsize[1], cropcmd )
	#command = 'null: -resize %(cx)dx%(cy)d! -draw "@draw.cmd" %(crop)s tile%(zoom)d.png' %({
	#	'cx': gridsize[0],
	#	'cy': gridsize[1],
	#	'crop': crop,
	#	'zoom': zoom
	#})
	magick.convert( command )
	if crop:
		xyCount = 2 << zoom
		n = 0
		# TODO: refactor
		xMin = gridoffset[0] / 256
		xMinEdge = max( xMin - 2, 0 )
		yMin = gridoffset[1] / 256
		yMinEdge = max( yMin - 2, 0 )
		xN = gridsize[0] / 256
		yN = gridsize[1] /256
		xLim = xMin + xN
		xLimEdge = min( xLim + 2, xyCount )
		yLim = yMin + yN
		yLimEdge = min( yLim + 2, xyCount )
		nMoving = xN * yN
		nCopying = ( xLimEdge - xMinEdge ) * ( yLimEdge - yMinEdge ) - nMoving
		print 'Moving %d tiles, copying %d blank tiles...' %( nMoving, nCopying )
		t1 = time.time()
		for y in xrange( yMinEdge, yLimEdge ):
			for x in xrange( xMinEdge, xLimEdge ):
				target = '%s-%d-%d.png' %( base, y, x )
				if xMin <= x < xLim and yMin <= y < yLim:
					if xN == 1 and yN == 1:
						source = '%s.png' %( base )
					else:
						source = '%s-%d.png' %( base, n )
					if os.path.exists( target ): os.remove( target )
					if os.stat(source)[stat.ST_SIZE] > 415:
						os.rename( source, target )
					else:
						os.remove( source )
						shutil.copy( 'blanktile.png', target )
					n += 1
				else:
					shutil.copy( 'blanktile.png', target )
		t2 = time.time()
		print '%0.3f seconds to move files' %( t2 - t1 )

def drawPlaces( draw, places ):
	global geo, scaleoffset
	nPolys = nPoints = 0
	for place in places:
		placename = place['name']
		color = randomGray()
		opacity = .12
		alpha = '%02X' % int( opacity * 255.0 )
		for shape in place['shapes']:
			nPolys += 1
			draw += '''
fill  %s%s
stroke #00000040
polygon''' %( color, alpha )
			points = shape['points']
			n = len(points) # - 1
			nPoints += n
			for j in xrange(n):
				point = geo.pixFromGeoPoint( points[j] )
				draw += ' %d,%d' %( point[0] - scaleoffset[0], point[1] - scaleoffset[1] )
	print '%d points in %d polygons' %( nPoints, nPolys )

for z in xrange(0,6):
	generate( 'us', z )
	
for z in xrange(5,9):
	for state in states.array:
		#if state['name'] != 'Alaska':  # temp
			generate( state['abbr'].lower(), z )

for z in xrange(9,10):
	generate( 'hi', z )
	generate( 'nj', z )

for z in xrange(9,11):
	generate( 'ct', z )
	generate( 'de', z )
	generate( 'ma', z )
	generate( 'md', z )
	generate( 'nh', z )
	generate( 'pr', z )
	generate( 'ri', z )
	generate( 'vt', z )

for z in xrange(9,12):
	generate( 'dc', z )

print 'Done!'
