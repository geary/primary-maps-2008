#!/usr/bin/env python

# demographic.py - vote reader for 2008 primaries

import csv
import os
import re

#from template import *
import simplejson as sj
import states

datapath = '../election-data/demographic'

#def str( text ):
#	strings = {
#		'county': 'town',
#		'counties': 'towns'
#	}
#	return strings[text] or text

def fixint( str ):
	return int( str.replace( ',', '' ).replace( '.00', '' ) )

def fixpercent( str ):
	return float( str.replace( '%', '' ) )
	
def formatNumber( number ):
	return str(number)

def json( obj ):
	if 1:
		# Pretty print
		json = sj.dumps( obj, indent=4 )
	else:
		# Use compact format, but add some newlines in the hope of using less space for svn revisions
		json = sj.dumps( obj, separators=( ',', ':' ) )
		json = re.sub( '\],"', '],\n"', json )
		json = re.sub( ':\[{', ':[\n{', json )
		json = re.sub( '":{', '":\n{', json )
		json = re.sub( '},{', '},\n{', json )
		json = re.sub( '},"', '},\n"', json )
	return json

def readAges( state, party ):
	print 'Reading ages %s %s' %( state, party )
	reader = csv.reader( open( '%s/states/%s/age-%s.csv' %( datapath, state, party ), 'rb' ) )
	counties = []
	header = reader.next()
	header.pop(0)
	if party != 'all': header.pop(0)
	for row in reader:
		name = fixCountyName( row.pop(0) )
		if name == 'Totals:': break
		if party != 'all': row.pop(0)
		age = total = max = 0;  min = 999999999;  counts = []
		centers =  [ 21.5, 30, 40, 50, 60, 70, 80 ]
		count = len(centers)
		for i in xrange(count):
			col = row[i]
			if col == '': continue
			n = fixint( col )
			age += n * centers[i]
			total += n
			if min > n: min = n
			if max < n: max = n
			counts.append( n )
		counties.append({
			'name': name,
			'meanAge': '%.1f' %( float(age) / float(total) ),
			'total': total,
			'min': min,
			'max': max,
			'counts': counts
		})
	return { 'labels':header, 'counties':counties }

def readReligion( state ):
	print 'Reading religion %s' %( state )
	reader = csv.reader( open( '%s/states/%s/PennCountiesReligion.csv' %( datapath, state ), 'rb' ) )
	counties = []
	header = reader.next()
	header.pop(0)
	for row in reader:
		name = fixCountyName( row.pop(0) )
		if name == 'TOTAL': break
		total = max = 0.0;  min = 999999999.0;  counts = []
		count = len(header)
		for i in xrange(count):
			col = row[i]
			if col == '': continue
			n = float(col)
			total += n
			if min > n: min = n
			if max < n: max = n
			counts.append( n )
		counts.append( 100.0 - total )
		counties.append({
			'name': name,
			'total': total,
			'min': min,
			'max': max,
			'counts': counts
		})
	header.append( 'None' )
	return { 'labels':header, 'counties':counties }

def readTypology( state ):
	print 'Reading typology %s' %( state )
	reader = csv.reader( open( '%s/states/%s/CountyTypologyPA.csv' %( datapath, state ), 'rb' ) )
	counties = []
	header = reader.next()
	for row in reader:
		name = fixCountyName( row.pop(0)[1:] )
		counties.append({
			'name': name,
			'before': fixint( row[0] ),
			'after': fixint( row[1] ),
			#'change': fixint( row[2] ),
			#'percent': float( row[3] ),
			'type': row[4].strip()
		})
	return { 'counties':counties }

def readRegChange( state ):
	print 'Reading registration changes %s' %( state )
	reader = csv.reader( open( '%s/states/%s/PennCountiesVoterRegNumbersCorrected.csv' %( datapath, state ), 'rb' ) )
	counties = []
	reader.next()
	header = reader.next()
	for row in reader:
		name = fixCountyName( row.pop(0) )
		counties.append({
			'name': name,
			'dem': {
				'before': fixint( row[0] ),
				#'oldpercent': fixpercent( row[2] ),
				'after': fixint( row[4] ),
				#'newpercent': fixpercent( row[6] ),
				#'change': fixpercent( row[7] )
			},
			'gop': {
				'before': fixint( row[1] ),
				#'oldpercent': fixpercent( row[3] ),
				'after': fixint( row[5] ),
				#'newpercent': fixpercent( row[8] ),
				#'change': fixpercent( row[9] )
			}
		})
	return { 'counties':counties }

def makeChanges( state ):
	typ = readTypology( state );  typCounties = typ['counties']
	vot = readRegChange( state );  votCounties = vot['counties']
	minPercent = 101.0;  maxPercent = -101.0;  counties = []
	for i in xrange(len(typCounties)):
		typCounty = typCounties[i]
		votCounty = votCounties[i]
		name = fixCountyName( typCounty['name'] )
		if name != fixCountyName( votCounty['name'] ): print 'ERROR!'
		popOld = typCounty['before']
		popNew = typCounty['after']
		popChange = popNew - popOld
		popPercent = float(popChange) / float(popOld) * 100.0
		demOld = votCounty['dem']['before']
		demNew = votCounty['dem']['after']
		demChange = demNew - demOld
		demPercent = float(demChange) / float(popOld) * 100.0
		gopOld = votCounty['gop']['before']
		gopNew = votCounty['gop']['after']
		gopChange = gopNew - gopOld
		gopPercent = float(gopChange) / float(popOld) * 100.0
		minPercent = min( minPercent, popPercent, demPercent, gopPercent )
		maxPercent = max( maxPercent, popPercent, demPercent, gopPercent )
		counties.append({
			'name': name,
			'popOld': popOld,
			'popNew': popNew,
			'popChange': popPercent,
			'demOld': demOld,
			'demNew': demNew,
			'demChange': demPercent,
			'gopOld': gopOld,
			'gopNew': gopNew,
			'gopChange': gopPercent
		})
	print 'Min percent = %2.2f, max percent = %2.2f' %( minPercent, maxPercent )
	return {
		'minChange': minPercent,
		'maxChange': maxPercent,
		'counties': counties
	}

def fixCountyName( name ):
	name = name.replace( ' County', '' ).strip().capitalize()
	fixNames = {
		#"Harts Location": "Hart's Location",
		#"Waterville": "Waterville Valley",
		"Mckean": "McKean"
	}
	if( name in fixNames ):
		name = fixNames[name]
	return name

def percentage( n ):
	pct = int( round( 100.0 * float(n) ) )
	if pct == 100 and n < 1: pct = 99
	return pct

def cleanNum( n ):
	return int( re.sub( '[^0-9]', '', n ) or 0 )

def makeJson( state, ages, religion, changes ):
	write(
		'%s/states/%s/demographic.js' %( datapath, state ),
		'GoogleElectionMap.Demographics(%s)' % json({
				'status': 'ok',
				'state': state,
				'ages': ages,
				'religion': religion,
				'changes': changes
		}) )

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
def update( state ):
	makeJson( state,
		{
			'all': readAges( state, 'all' ),
			'dem': readAges( state, 'dem' ),
			'gop': readAges( state, 'gop' )
		},
		readReligion( state ),
		makeChanges( state )
	)
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'Done!'

def main():
	update( 'pa' )

if __name__ == "__main__":
    main()
