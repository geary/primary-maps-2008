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
			'change': fixint( row[2] ),
			'percent': float( row[3] ),
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
				'oldcount': fixint( row[0] ),
				'oldpercent': fixpercent( row[2] ),
				'newcount': fixint( row[4] ),
				'newpercent': fixpercent( row[6] ),
				'change': fixpercent( row[7] )
			},
			'gop': {
				'oldcount': fixint( row[1] ),
				'oldpercent': fixpercent( row[3] ),
				'newcount': fixint( row[5] ),
				'newpercent': fixpercent( row[8] ),
				'change': fixpercent( row[9] )
			}
		})
	return { 'counties':counties }

def fixCountyName( name ):
	name = name.replace( ' County', '' ).strip().capitalize()
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

def makeJson( state, ages, religion, typology, regchange ):
	write(
		'%s/states/%s/demographic.js' %( datapath, state ),
		'GoogleElectionMap.Demographics(%s)' % json({
				'status': 'ok',
				'state': state,
				'ages': ages,
				'religion': religion,
				'typology': typology,
				'regchange': regchange
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
		readTypology( state ),
		readRegChange( state )
	)
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'Done!'

def main():
	update( 'pa' )

if __name__ == "__main__":
    main()
