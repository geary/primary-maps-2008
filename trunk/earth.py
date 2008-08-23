#!/usr/bin/env python

# earth.py - Make KML file for Google Earth

shapespath = '../election-data/shapes/detailed'
votespath = '../election-data/votes'

import re
import zipfile

from earth_candidates import candidates

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

def getIcon( party, candidate ):
	if candidate['name'] == 'uncommitted-d':
		pass
	name = 'blank'
	if candidate.get( 'icon', True ):
		name = candidate['name']
	return 'files/%s-border.png' % name
	
def getData( region, party ):
	print 'Reading %s %s' %( region, party )
	shapes = readJSONP( '%s/%s.js' %( shapespath, region ) )
	places = shapes['places']
	votes = readJSONP( '%s/%s_%s.js' %( votespath, region, party ) )
	return places, votes

def getCandidateAltitude( votes ):
	first = votes['votes'][0]
	second = votes['votes'][1]
	altitude = ( first['votes'] - second['votes'] ) * 2.25 + 10000
	name = first['name']
	candidate = candidates['byname'][name]
	return candidate, altitude
	
def generateKML( region, party ):
	kml = makeKML( region, party )
	path = 'kmz/%s/doc.kml' % party
	writeFile( path, kml )

def makeKML( region, party ):
	places, votes = getData( region, party )
	return T('''
		<?xml version="1.0" encoding="utf-8" ?>
		<kml xmlns="http://earth.google.com/kml/2.0">
			<Document>
				<open>1</open>
				<name>2008 %(partyname)s Primary</name>
				<LookAt>
					<latitude>%(looklat)s</latitude>
					<longitude>%(looklng)s</longitude>
					<range>%(range)s</range>
					<tilt>%(tilt)s</tilt>
					<heading>0</heading>
				</LookAt>
				<Folder>
					<name>Elevated States</name>
					%(elevatedstates)s
				</Folder>
				<Folder>
					<name>State Pins and Info</name>
					%(elevatedpins)s
				</Folder>
			</Document>
		</kml>
	''',
		looklat = '40',
		looklng = '-98',
		range = '5000000',
		tilt = '55',
		partyname = partyName( party ),
		elevatedstates = makePlacemarksKML( makeElevatedStateKML, region, places, party, votes ),
		elevatedpins = makePlacemarksKML( makePinKML, region, places, party, votes )
	)

def makePlacemarksKML( maker, region, places, party, votes ):
	marks = []
	for place in places:
		locals = votes['locals']
		name = place['name']
		if name in locals:
			marks.append( maker( place, party, locals[name] ) )
	return ''.join(marks)

def makeElevatedStateKML( place, party, votes ):
	candidate, altitude = getCandidateAltitude( votes )
	return T('''
		<Placemark>
			<name>%(name)s</name>
			<MultiGeometry>
				%(polys)s
			</MultiGeometry>
			<Style>
				<LineStyle>
					<color>%(bordercolor)s</color>
					<width>1</width>
				</LineStyle>
				<PolyStyle>
					<color>%(fillcolor)s</color>
				</PolyStyle>
				<BalloonStyle>
					<displayMode>hide</displayMode>
				</BalloonStyle>
			</Style>
		</Placemark>
	''',
		name = place['name'],
		polys = makePolygonsKML( place['shapes'], altitude ),
		bordercolor = '80000000',
		fillcolor = 'C0' + bgr(candidate['color'])
	)

def makePinKML( place, party, votes ):
	candidate, altitude = getCandidateAltitude( votes )
	return T('''
		<Placemark>
			<name>%(name)s</name>
			<Point>
				<altitudeMode>relativeToGround</altitudeMode> 
				<coordinates>%(centroid)s</coordinates>
			</Point>
			<Style>
				<IconStyle>
					<Icon>
						<href>%(icon)s</href>
					</Icon>
				</IconStyle>
				<BalloonStyle>
					<text>%(balloon)s</text>
				</BalloonStyle>
			</Style>
		</Placemark>
	''',
		name = place['name'],
		centroid = coord( place['centroid'], altitude ),
		icon = getIcon( party, candidate ),
		balloon = htmlBalloon( place, party, votes )
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

def htmlBalloon( place, party, votes ):
	return T('''
		<![CDATA[
			<div style="font-weight:bold;">
				%(placename)s
			</div>
			<div>
				2008 %(party)s Primary
			</div>
			<table>
				%(tally)s
			</table>
		]]>
	''',
		placename = place['name'],
		party = partyName( party ),
		tally = htmlBalloonTally( place, party, votes )
	)

def htmlBalloonTally( place, party, votes ):
	list = votes.get('votes')
	if list == None  or  len(list) == 0:
		return '<tr><td>No votes reported</td></tr>'
	return ''.join([ htmlBalloonTallyRow(party,vote) for vote in list ])

def htmlBalloonTallyRow( party, vote ):
	candidate = candidates['byname'][ vote['name'] ]
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
				<img style="height:16px; width:16px; margin: 1px 4px 1px 1px;" src="%(icon)s" />
			</td>
			<td>
				<div>
					%(name)s
				</div>
			</td>
		</tr>
	''',
		votes = formatNumber( vote['votes'] ),
		color = candidate['color'],
		icon = getIcon( party, candidate ),
		name = candidate['fullName']
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
