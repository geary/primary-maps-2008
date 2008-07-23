#!/usr/bin/env python

# earth.py - Make KML file for Google Earth

shapespath = '../election-data/shapes/detailed'
votespath = '../election-data/votes'

iconBaseUrl = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/images/icons/'

import re

from candidates import candidates

def T( text, **values ):
	return re.sub( '(^\n*|\n+)[ \t]*', '', text % values )

def readFile( filename ):
	f = open( filename, 'rb' )
	data = f.read()
	f.close()
	return data

def writeFile( filename, data ):
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def readJSONP( path ):
	exec re.sub( '^.+\(', 'data = (', readFile(path) )
	return data

def getData( region, party ):
	print 'Reading %s %s' %( region, party )
	shapes = readJSONP( '%s/%s.js' %( shapespath, region ) )
	places = shapes['places']
	votes = readJSONP( '%s/%s_%s.js' %( votespath, region, party ) )
	return places, votes

def generateKML( region, party ):
	kml = makeKML( region, party )
	path = 'earth-%s-%s.kml' %( region, party )
	writeFile( path, kml )

def makeKML( region, party ):
	places, votes = getData( region, party )
	return T('''
		<?xml version="1.0" encoding="utf-8" ?>
		<kml xmlns="http://earth.google.com/kml/2.0">
			<Document>
				<name>US %(partyname)s Primary</name>
				<LookAt>
					<latitude>%(looklat)s</latitude>
					<longitude>%(looklng)s</longitude>
					<range>%(range)s</range>
					<tilt>%(tilt)s</tilt>
					<heading>0</heading>
				</LookAt>
				<Folder>
					<name>States</name>
					%(placemarks)s
				</Folder>
			</Document>
		</kml>
	''',
		looklat = '40',
		looklng = '-100',
		range = '5000000',
		tilt = '55',
		partyname = partyName( party ),
		placemarks = makePlacemarksKML( region, places, party, votes )
	)

def makePlacemarksKML( region, places, party, votes ):
	marks = []
	for place in places:
		locals = votes['locals']
		name = place['name']
		if name in locals:
			marks.append( makePlacemarkKML( place, party, locals[name] ) )
	return ''.join(marks)

def makePlacemarkKML( place, party, votes ):
	vote = votes['votes'][0]
	altitude = vote['votes'] / 2 + 10000
	name = vote['name']
	candidate = candidates['byname'][name]
	return T('''
		<Placemark>
			<name>%(name)s</name>
			<MultiGeometry>
<!--
				<Point>
					<coordinates>%(centroid)s</coordinates>
				</Point>
-->
				%(polys)s
			</MultiGeometry>
			<Style>
				<IconStyle>
					<Icon>
						<href>%(icon)s</href>
					</Icon>
				</IconStyle>
				<BalloonStyle>
					<text>%(balloon)s</text>
				</BalloonStyle>
				<LineStyle>
					<color>%(bordercolor)s</color>
					<width>1</width>
				</LineStyle>
				<PolyStyle>
					<color>%(fillcolor)s</color>
				</PolyStyle>
			</Style>
		</Placemark>
	''',
		name = place['name'],
		centroid = coord( place['centroid'], altitude ),
		icon = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/images/icons/%s-border.png' % name,
		polys = makePolygonsKML( place['shapes'], altitude ),
		bordercolor = '80000000',
		fillcolor = 'C0' + bgr(candidate['color']),
		balloon = 'balloon!'
	)

def makePolygonsKML( polys, altitude ):
	xml = []
	for poly in polys:
		points = poly['points']
		coords = [ coord(points[0],altitude) ]  # Repeat first point
		for i in xrange( len(points)-1, -1, -1 ):
			coords.append( coord(points[i],altitude) )
		xml.append( T('''
			<Polygon>
				<extrude>1</extrude>
				<altitudeMode>relativeToGround</altitudeMode> 
				<outerBoundaryIs>
					<LinearRing>
						<coordinates>%(vertices)s</coordinates>
					</LinearRing>
				</outerBoundaryIs>
			</Polygon>
		''',
			vertices = ' '.join(coords)
		) )
	return ''.join(xml)

def coord( point, altitude='0' ):
	return ','.join(( str(point[0]), str(point[1]), str(altitude) ))

def bgr( hrgb ):
	return hrgb[5:7] + hrgb[3:5] + hrgb[1:3]

def htmlBalloon( county, party ):
	return T('''
		<div style="font-weight:bold;">
			%(placename)s
		</div>
		<div>
			2008 %(party)s Primary
		</div>
		<table>
			%(tally)s
		</table>
	''',
		placename = place['name'],
		party = partyName( party ),
		tally = htmlBalloonTally( county, party )
	)

def htmlBalloonTally( county, party ):
	tally = county.get(party)
	if tally == None  or  len(tally) == 0:
		return '<tr><td>No votes reported</td></tr>'
	return ''.join([ htmlBalloonTallyRow(party,who) for who in tally ])

def htmlBalloonTallyRow( party, who ):
	candidate = reader.candidates['byname'][party][ who['name'] ]
	return T('''
		<tr>
			<td style="text-align:right; width:1%%;">
				<div style="margin-right:4px;">
					%(votes)s
				</div>
			</td>
			<td style="width:1%%">
				<div style="height:18px; width:18px; border:1px solid #888888; background-color:%(color)s; margin-right:4px;">
					&nbsp;
				</div>
			</td>
			<td style="width:1%%;">
				<img style="height:16px; width:16px; margin: 1px 4px 1px 1px;" src="%(img)s" />
			</td>
			<td>
				<div>
					%(name)s
				</div>
			</td>
		</tr>
	''',
		votes = formatNumber( who['votes'] ),
		color = candidate['color'],
		img = iconBaseUrl + who['name'] + '-border.png',
		name =candidate['fullName']
	)

def partyName( party ):
	return { 'dem':'Democratic', 'gop':'Republican' }[ party ]

def formatNumber( number ):
	return str(number)

def write( name, text ):
	print 'Writing ' + name
	f = open( name, 'w' )
	f.write( text )
	f.close()

def main():
	generateKML( 'us', 'dem' )
	generateKML( 'us', 'gop' )
	print 'Done!'

if __name__ == "__main__":
    main()
