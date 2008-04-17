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

def readData( state, party ):
	print 'Processing %s %s' %( state, party )
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
			n = int( col.replace( ',', '' ) )
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

def fixCountyName( name ):
	name = name.capitalize()
	#fixNames = {
	#	"Harts Location": "Hart's Location",
	#	"Waterville": "Waterville Valley"
	#}
	#if( name in fixNames ):
	#	name = fixNames[name]
	return name

def percentage( n ):
	pct = int( round( 100.0 * float(n) ) )
	if pct == 100 and n < 1: pct = 99
	return pct

def cleanNum( n ):
	return int( re.sub( '[^0-9]', '', n ) or 0 )

def makeJson( state, data ):
	write(
		'%s/states/%s/demographic.js' %( datapath, state ),
		'GoogleElectionMap.Demographics(%s)' % json({
				'status': 'ok',
				'state': state,
				'ages': data
		}) )

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
def update( state ):
	makeJson( state, {
		'all': readData( state, 'all' ),
		'dem': readData( state, 'dem' ),
		'gop': readData( state, 'gop' )
	})
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'Done!'

def main():
	update( 'pa' )

if __name__ == "__main__":
    main()
