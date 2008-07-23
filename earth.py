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

def writeKML( region, places, party, votes ):
	print 'Writing %s %s' %( region, party )
	kml = ET.Element( 'kml', { 'xmlns':'http://earth.google.com/kml/2.0' } )
	kmlDocument = ET.SubElement( kml, 'Document' )
	kmlDocumentLookAt = ET.SubElement( kmlDocument, 'LookAt' )
	kmlDocumentLookAtLatitude = ET.SubElement( kmlDocumentLookAt, 'latitude' )
	kmlDocumentLookAtLatitude.text = '43.5'
	kmlDocumentLookAtLongitude = ET.SubElement( kmlDocumentLookAt, 'longitude' )
	kmlDocumentLookAtLongitude.text = '-71.7'
	kmlDocumentLookAtRange = ET.SubElement( kmlDocumentLookAt, 'range' )
	kmlDocumentLookAtRange.text = '200000'
	kmlDocumentLookAtTilt = ET.SubElement( kmlDocumentLookAt, 'tilt' )
	kmlDocumentLookAtTilt.text = '55'
	kmlDocumentName = ET.SubElement( kmlDocument, 'name' )
	kmlDocumentName.text = 'New Hampshire ' + partyName(party) + ' Primary'
	kmlFolder = ET.SubElement( kmlDocument, 'Folder' )
	kmlFolderName = ET.SubElement( kmlFolder, 'name' )
	kmlFolderName.text = 'New Hampshire Towns'
	for name, county in counties.iteritems():
		kmlPlacemark = ET.SubElement( kmlFolder, 'Placemark' )
		#kmlPlaceName = ET.SubElement( kmlPlacemark, 'name' )
		#kmlPlaceName.text = name
		kmlMultiGeometry = ET.SubElement( kmlPlacemark, 'MultiGeometry' )
		if earth:
			kmlPoint = ET.SubElement( kmlMultiGeometry, 'Point' )
			kmlPointCoordinates = ET.SubElement( kmlPoint, 'coordinates' )
			kmlPointCoordinates.text = coord( county['centroid'] )
		kmlPolygon = ET.SubElement( kmlMultiGeometry, 'Polygon' )
		kmlOuterBoundaryIs = ET.SubElement( kmlPolygon, 'outerBoundaryIs' )
		kmlLinearRing = ET.SubElement( kmlOuterBoundaryIs, 'LinearRing' )
		kmlCoordinates = ET.SubElement( kmlLinearRing, 'coordinates' )
		kmlCoordinates.text = ' '.join([ coord(point) for point in county['points'] ])
		kmlStyle = ET.SubElement( kmlPlacemark, 'Style' )
		if earth:
			kmlIconStyle = ET.SubElement( kmlStyle, 'IconStyle' )
			kmlIcon = ET.SubElement( kmlIconStyle, 'Icon' )
			kmlIconHref = ET.SubElement( kmlIcon, 'href' )
			leader = getLeader(county,party) or { 'name': 'generic' }
			kmlIconHref.text = iconBaseUrl + leader['name'] + '-border.png'
			kmlBalloonStyle = ET.SubElement( kmlStyle, 'BalloonStyle' )
			kmlBalloonText = ET.SubElement( kmlBalloonStyle, 'text' )
			kmlBalloonText.text = htmlBalloon( county, party )
		kmlLineStyle = ET.SubElement( kmlStyle, 'LineStyle' )
		kmlLineStyleColor = ET.SubElement( kmlLineStyle, 'color' )
		kmlLineStyleColor.text = '40000000'
		kmlLineStyleWidth = ET.SubElement( kmlLineStyle, 'width' )
		kmlLineStyleWidth.text = '1'
		kmlPolyStyle = ET.SubElement( kmlStyle, 'PolyStyle' )
		kmlPolyStyleColor = ET.SubElement( kmlPolyStyle, 'color' )
		kmlPolyStyleColor.text = getColor( county, party )
	
	kmlTree = ET.ElementTree( kml )
	kmlfile = open( private.targetKML + ['maps','earth'][earth] + '-nh-' + party + '.kml', 'w' )
	kmlfile.write( '<?xml version="1.0" encoding="utf-8" ?>\n' )
	kmlTree.write( kmlfile )
	kmlfile.close()

def makeData():
	data = getData()
	state = data['state']
	counties = data['counties']
	
	ctyNames = []
	for name in counties:
		ctyNames.append( name )
	ctyNames.sort()
	#for name in ctyNames:
	#	print name
	
	nPoints = 0
	ctys = []
	for name in ctyNames:
		county = counties[name]
		pts = []
		#for point in county['points']:
		#	pts.append( '[%s,%s]' %( point[0], point[1] ) )
		#ctys.append( '{name:"%s",centroid:[%.8f,%.8f],points:[%s]}' %(
		#	county['name'],
		#	','.join(pts)
		#) )
		pts = []
		#lats = lons = 0
		minLat = minLon = 360
		maxLat = maxLon = -360
		centroid = county['centroid']
		points = county['points']
		for point in points:
			nPoints += 1
			pts.append( '[%s,%s]' %( point[0], point[1] ) )
		ctys.append( '{name:"%s",centroid:[%.8f,%.8f],points:[%s]}' %(
			reader.fixCountyName( name ),
			centroid[0], centroid[1],
			','.join(pts)
		) )
	
	print '%d points in %d places' %( nPoints, len(ctys) )
	write( '../data.js', '''
Data = {
	counties: [%s]
};
''' %( ','.join(ctys) ) )

def makeJson( party ):
	data = getData()
	reader.readVotes( data, party )
	state = data['state']
	counties = data['counties']
	for county in counties.itervalues():
		del county['centroid']
		del county['points']
	
	result = {
		'status': 'ok',
		'state': state,
		'counties': counties
	}
	
	write(
		'../results_%s.js' % party,
		'Json.%sResults(%s)' %( party, json(result) )
	)

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
