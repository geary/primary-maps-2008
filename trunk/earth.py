#!/usr/bin/env python

# earth.py - Make KML file for Google Earth

shapespath = '../election-data/shapes/detailed'
votespath = '../election-data/votes'

import locale
import re
import zipfile

from earth_candidates import candidates

locale.setlocale( locale.LC_ALL, '' )

def T( text, **values ):
	'''	Interpolate the values hash into text, then remove newlines
		and the whitespace following them. If you need whitespace between
		two lines in the template text, add a trailing space or a blank line. '''
	return re.sub( '(^\n*|\n+)[ \t]*', '', text % values )

def readFile( filename ):
	'''	Read the named file and return its contents. '''
	f = open( filename, 'rb' )
	data = f.read()
	f.close()
	return data

def writeFile( filename, data ):
	''' Write data to the named file. '''
	f = open( filename, 'wb' )
	f.write( data )
	f.close()

def readJSONP( path ):
	'''	Read a file containing JSONP, e.g.
			callback({ "a":"b", "c":"d" })
		and return a hash of the JSON data. '''
	exec re.sub( '^.+\(', 'data = (', readFile(path) )
	return data

def getIcon( candidate ):
	'''	Return the filename of the icon for a given candidate. '''
	if candidate['name'] == 'uncommitted-d':
		pass  # ??
	name = 'blank'
	if candidate.get( 'icon', True ):
		name = candidate['name']
	return 'files/%s-border.png' % name
	
def getData( region, party ):
	'''	Read the JSON data data for a region ('us' or state) and party,
		return the places (shapes) and votes hashes. '''
	print 'Reading %s %s' %( region, party )
	shapes = readJSONP( '%s/%s.js' %( shapespath, region ) )
	places = shapes['places']
	votes = readJSONP( '%s/%s_%s.js' %( votespath, region, party ) )
	return places, votes

def getCandidateAltitude( votes ):
	'''	Given a votes tally hash, return the winning candidate and an
		altitude calculated from the difference between the first and second
		place candidates. '''
	first = votes['votes'][0]
	second = votes['votes'][1]
	altitude = ( first['votes'] - second['votes'] ) * 2.25 + 10000
	name = first['name']
	candidate = candidates['byname'][name]
	return candidate, altitude
	
def generateKML( region, party ):
	'''	Generate and write the KMZ file for a region and party. '''
	kml = makeKML( region, party )
	path = 'kmz/%s/doc.kml' % party
	writeFile( path, kml )

def makeKML( region, party ):
	'''	Return KML text for a region and party. The region could be a state
		or 'us', but some values (looklat etc.) are hard coded for a USA view. '''
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
	'''	Return KML text with a series of Placemark elements for the
		region, places, party, and votes, using the maker function to
		generate each Placemark. '''
	marks = []
	for place in places:
		locals = votes['locals']
		name = place['name']
		if name in locals:
			marks.append( maker( place, party, locals[name] ) )
	return ''.join(marks)

def makeElevatedStateKML( place, party, votes ):
	'''	Return KML text with a Placemark for place, party, and votes,
		containing an extruded polygon of the state outline with an
		altitude calculated according to the votes. '''
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
	'''	Return KML text with a Placemark for place, party, and votes,
		containing an icon for the winning candidate and a balloon
		for all the candidates. '''
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
		icon = getIcon( candidate ),
		balloon = htmlBalloon( place, party, votes )
	)

def makePolygonsKML( polys, altitude ):
	'''	Return KML text of an extruded Polygon for polys and altitude. '''
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
	'''	Return text for a point and altitude (default 0) in the format
		used in KML placemarks. '''
	return ','.join(( str(point[0]), str(point[1]), str(altitude) ))

def bgr( hrgb ):
	'''	Convert an HRGB color string as used in CSS into BGR format, e.g.
		'#ABCDEF' becomes 'EFCDAB'. '''
	return hrgb[5:7] + hrgb[3:5] + hrgb[1:3]

def htmlBalloon( place, party, votes ):
	'''	Return HTML text for a placemark balloon for place, party, and votes.
		The style of this balloon could be improved; it was written for the
		limited HTML balloons in Earth 4.0. '''
	return T('''
		<![CDATA[
			<font size=5>
				<div>
					<b>%(placename)s</b>
				</div>
				<div>
					2008 %(party)s Primary
				</div>
			</font>
			<font size=4>
				<table>
					<thead>
						<tr>
							<td align=right>
								<b>Delegates</b>
								&nbsp;
							</td>
							<td align=right>
								<b>Votes</b>
								&nbsp;
							</td>
							<td>
								&nbsp;
							</td>
							<td>
								<b>Candidate</b>
							</td>
						</tr>
					</thead>
					<tbody>
						%(tally)s
					</tbody>
				</table>
			</font>
		]]>
	''',
		placename = place['name'],
		party = partyName( party ),
		tally = htmlBalloonTally( place, party, votes )
	)

def htmlBalloonTally( place, party, votes ):
	'''	Return HTML text of the <tr> elements for the vote results table
		in a placemark balloon. '''
	list = votes.get('votes')
	if list == None  or  len(list) == 0:
		return '<tr><td>No votes reported</td></tr>'
	return ''.join([ htmlBalloonTallyRow(party,vote) for vote in list ])

def htmlBalloonTallyRow( party, vote ):
	'''	Return HTML text of the <tr> element for a single candidate in the
		vote results table of a placemark balloon. '''
	candidate = candidates['byname'][ vote['name'] ]
	return T('''
		<tr>
			<td align=right>
				%(delegates)s
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td align=right>
				%(votes)s
				&nbsp;
			</td>
			<td>
				<img width=18 height=18 src="%(icon)s" />
				&nbsp;
			</td>
			<td>
				%(name)s
			</td>
		</tr>
	''',
		votes = formatNumber( vote['votes'] ),
		delegates = formatNumber( vote.get( 'delegates', ' ' ) ),
		color = candidate['color'],
		icon = getIcon( candidate ),
		name = candidate['fullName'].replace( ' ', '&nbsp;' )
	)

def partyName( party ):
	'''	Return the full name of a party given its abbreviation. '''
	return { 'dem':'Democratic', 'gop':'Republican' }[ party ]

def formatNumber( number ):
	'''	Format a number with thousands separators. '''
	if number == ' ': return number
	return locale.format( '%d', int(number), True )

def write( filename, text ):
	'''	Create a file with the given name and write text to it. '''
	print 'Writing ' + filename
	f = open( filename, 'w' )
	f.write( text )
	f.close()

def main():
	'''	Main program: generate the Democratic and Republican KMZ files. '''
	generateKML( 'us', 'dem' )
	generateKML( 'us', 'gop' )
	print 'Done!'

if __name__ == "__main__":
    main()
