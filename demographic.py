#!/usr/bin/env python

# demographic.py - vote reader for 2008 primaries

import csv
import os
import re

#from template import *
import simplejson as sj
import states

datapath = '../election-data/demographic'

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

class Reader:
	def __init__( self, state ):
		self.state = state
		self.makeCountyList()
	
	def makeCountyList( self ):
		print 'Reading typology %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/CO-EST2007-02-42.csv' %( datapath, self.state ), 'rb' ) )
		self.labels = {}
		self.places = []
		header = reader.next()
		for row in reader:
			name = fixCountyName( row[0][1:] )
			self.places.append({ 'name':name, 'ages':{}, 'population':{} })
		# TODO: generalize this like [].index() in JS?
		self.countiesByName = {}
		for place in self.places:
			self.countiesByName[ place['name'] ] = place
	
	def readAll( self ):
		self.readAges( 'all' )
		self.readAges( 'dem' )
		self.readAges( 'gop' )
		self.readRegChange()
		self.readReligion()
		self.readPopulation()
		self.readTypology()
		self.calcLimits()
	
	def readAges( self, party ):
		print 'Reading ages %s %s' %( self.state, party )
		reader = csv.reader( open( '%s/states/%s/age-%s.csv' %( datapath, self.state, party ), 'rb' ) )
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
			self.countiesByName[name]['ages'].update({
				party: {
					'mean': '%.1f' %( float(age) / float(total) ),
					'total': total,
					'min': min,
					'max': max,
					'counts': counts
				}
			})
		self.labels.update({ 'ages':header })
	
	def readReligion( self ):
		print 'Reading religion %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/PennCountiesReligion.csv' %( datapath, self.state ), 'rb' ) )
		header = reader.next()
		header.pop(0)
		for row in reader:
			name = fixCountyName( row.pop(0) )
			if name == 'Total': break
			total = max = 0.0;  min = 999999999.0;  percents = []
			percent = len(header)
			for i in xrange(percent):
				col = row[i]
				if col == '': continue
				n = float(col)
				total += n
				if min > n: min = n
				if max < n: max = n
				percents.append( n )
			percents.append( 100.0 - total )
			self.countiesByName[name].update({
				'religion': {
					'total': total,
					'min': min,
					'max': max,
					'percents': percents
				}
			})
		header.append( 'None' )
		self.labels.update({ 'religion':header })
	
	def readTypology( self ):
		print 'Reading typology %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/CountyTypologyPA.csv' %( datapath, self.state ), 'rb' ) )
		header = reader.next()
		for row in reader:
			name = fixCountyName( row.pop(0)[1:] )
			self.countiesByName[name]['population'].update({
				'type': row[4].strip()
			})
	
	def readRegChange( self ):
		print 'Reading registration changes %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/PennCountiesVoterRegNumbersCorrected.csv' %( datapath, self.state ), 'rb' ) )
		reader.next()
		header = reader.next()
		for row in reader:
			name = fixCountyName( row.pop(0) )
			self.countiesByName[name]['population'].update({
				'dem': {
					'before': fixint( row[0] ),
					#'oldpercent': fixpercent( row[2] ),
					'after': fixint( row[4] ),
					#'newpercent': fixpercent( row[6] ),
					'change': fixpercent( row[7] )
				},
				'gop': {
					'before': fixint( row[1] ),
					#'oldpercent': fixpercent( row[3] ),
					'after': fixint( row[5] ),
					#'newpercent': fixpercent( row[8] ),
					'change': fixpercent( row[9] )
				}
			})
	
	def readPopulation( self ):
		print 'Reading population %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/CO-EST2007-02-42.csv' %( datapath, self.state ), 'rb' ) )
		header = reader.next()
		for row in reader:
			name = fixCountyName( row.pop(0)[1:] )
			self.countiesByName[name]['population'].update({
				'all': {
					'before': fixint( row[1] ),
					'after': fixint( row[0] ),
					'change': float( row[3] ),
				}
			})
	
	def calcLimits( self ):
		print 'Calculating percent limits %s' %( self.state )
		minPercent = 101.0;  maxPercent = -101.0
		for place in self.places:
			popPercent = place['population']['all']['change']
			demPercent = place['population']['dem']['change']
			gopPercent = place['population']['gop']['change']
			minPercent = min( minPercent, popPercent, demPercent, gopPercent )
			maxPercent = max( maxPercent, popPercent, demPercent, gopPercent )
		print 'Min percent = %2.2f, max percent = %2.2f' %( minPercent, maxPercent )
		self.limits = {
			'population': {
				'minPercent': minPercent,
				'maxPercent': maxPercent
			}
		}

	def makeJson( self ):
		write(
			'%s/states/%s/demographic.js' %( datapath, self.state ),
			'GoogleElectionMap.Demographics(%s)' % json({
					'status': 'ok',
					'state': self.state,
					'labels': self.labels,
					'limits': self.limits,
					'places': self.places
			}) )

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

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
def update( state ):
	reader = Reader( state )
	reader.readAll()
	reader.makeJson()
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'Done!'

def main():
	update( 'pa' )

if __name__ == "__main__":
    main()
