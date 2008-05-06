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

def toJSON( obj ):
	if 0:
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
		print 'Reading county list %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/%s_Religion.csv' %( datapath, self.state, self.state ), 'rb' ) )
		self.labels = {}
		self.places = []
		header = reader.next()
		for row in reader:
			name = fixCountyName( row[0] )
			self.places.append({ 'name':name, 'ages':{}, 'population':{} })
		# TODO: generalize this like [].index() in JS?
		self.countiesByName = {}
		for place in self.places:
			self.countiesByName[ place['name'] ] = place
	
	def readAll( self ):
		if self.state == 'in':
			#self.readRegChange()
			self.readReligion()
			self.readPopChange()
			self.readOccupation()
			self.readUrbanRural()
			#self.readEthnic()
			self.calcLimits()
		elif self.state == 'nc':
			#self.readRegChange()
			self.readReligion()
			self.readPopChange()
			self.readOccupation()
			self.readUrbanRural()
			#self.readEthnic()
			self.calcLimits()
		elif self.state == 'pa':
			self.readAges( 'all' )
			self.readAges( 'dem' )
			self.readAges( 'gop' )
			self.readRegChange()
			self.readReligion()
			self.readPopChange()
			self.readTypology()
			self.readEthnic()
			self.readGub2002()
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
		reader = csv.reader( open( '%s/states/%s/%s_Religion.csv' %( datapath, self.state, self.state ), 'rb' ) )
		header = reader.next()
		header.pop(0)
		for row in reader:
			name = fixCountyName( row.pop(0) )
			if name == 'Total': break
			total = max = 0.0;  min = 999999999.0;  percents = []
			percent = len(header)
			for i in xrange(percent):
				col = row[i]
				if col == '': col = 0
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
			name = fixCountyName( row.pop(0) )
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
			demBefore = fixint( row[0] )
			demAfter = fixint( row[4] )
			gopBefore = fixint( row[1] )
			gopAfter = fixint( row[5] )
			self.countiesByName[name]['population'].update({
				'dem': {
					'before': demBefore,
					'after': demAfter,
					'change': percent( float( demAfter - demBefore ) / float(demBefore) )
				},
				'gop': {
					'before': gopBefore,
					'after': gopAfter,
					'change': percent( float( gopAfter - gopBefore ) / float(gopBefore) )
				}
			})
	
	def readPopChange( self ):
		print 'Reading population %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/%s_PopChange.csv' %( datapath, self.state, self.state ), 'rb' ) )
		header = reader.next()
		for row in reader:
			name = fixCountyName( row.pop(0) )
			self.countiesByName[name]['population'].update({
				'all': {
					'before': fixint( row[1] ),
					'after': fixint( row[0] ),
					'change': float( row[3] ),
				}
			})
	
	def readOccupation( self ):
		print 'Reading occupation %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/%s_Occupation.csv' %( datapath, self.state, self.state ), 'rb' ) )
		header = reader.next()
		header.pop(0)
		for row in reader:
			name = fixCountyName( row.pop(0) )
			self.countiesByName[name]['occupation'] = [
				float( row[0] ), float( row[1] ), float( row[2] )
			]
		self.labels.update({ 'occupation':header })
	
	def readUrbanRural( self ):
		print 'Reading urban-rural %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/%s_UrbanRural.csv' %( datapath, self.state, self.state ), 'rb' ) )
		header = reader.next()
		header.pop(0)
		for row in reader:
			name = fixCountyName( row.pop(0) )
			self.countiesByName[name]['urbanrural'] = [
				float( row[0] ),
				float( row[1] )
			]
		self.labels.update({ 'urbanrural':header })
	
	def readEthnic( self ):
		print 'Reading ethnic %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/qt_pep_2006_est_data1.csv' %( datapath, self.state ), 'rb' ) )
		reader.next()
		header = reader.next()
		for row in reader:
			name = fixCountyName( row[3].replace( ', Pennsylvania', '' ) )
			white = int(row[35])
			black = int(row[36])
			asian = int(row[38])
			#hispanic = int(row[47])
			#whiteonly = int(row[49])
			#white = int(row[49])
			total = int(row[33])
			#other = total - white - black - asian - hispanic
			other = int(row[40])
			self.countiesByName[name].update({
				#'ethnic': [ white, black, asian, hispanic, other ]
				'ethnic': [ white, black, asian, other ]
			})
			#print name, white, black, asian, hispanic, other
		#self.labels.update({ 'ethnic':[ 'White', 'Black', 'Asian', 'Hispanic', 'Other' ] })
		self.labels.update({ 'ethnic':[ 'White', 'Black', 'Asian', 'Other' ] })
	
	def readGub2002( self ):
		print 'Reading Casey-Rendell %s' %( self.state )
		reader = csv.reader( open( '%s/states/%s/Casey-Rendell-2002.csv' %( datapath, self.state ), 'rb' ) )
		header = reader.next()
		for row in reader:
			name = fixCountyName( row.pop(0) )
			casey = float( row[0] )
			rendell = float( row[1] )
			total = casey + rendell
			self.countiesByName[name].update({
				'gub2002': [ percent( casey / total ), percent( rendell / total ) ]
			})
		self.labels.update({ 'gub2002':[ 'Casey', 'Rendell' ] })
	
	def calcLimits( self ):
		print 'Calculating percent limits %s' %( self.state )
		minPercent = 101.0;  maxPercent = -101.0
		for place in self.places:
			popPercent = place['population']['all']['change']
			if self.state == 'pa':  # hack
				demPercent = place['population']['dem']['change']
				gopPercent = place['population']['gop']['change']
				minPercent = min( minPercent, popPercent, demPercent, gopPercent )
				maxPercent = max( maxPercent, popPercent, demPercent, gopPercent )
			else:
				minPercent = min( minPercent, popPercent )
				maxPercent = max( maxPercent, popPercent )
		print 'Min percent = %2.2f, max percent = %2.2f' %( minPercent, maxPercent )
		self.limits = {
			'population': {
				'minPercent': minPercent,
				'maxPercent': maxPercent
			}
		}

	def stateObject( self ):
		obj = {
			'status': 'ok',
			'state': self.state,
			'labels': self.labels,
			'limits': self.limits,
			'places': self.places
		}
		
		write( '%s/states/%s/demographic.js' %( datapath, self.state ),
			'GoogleElectionMap.Demographics(%s)' % toJSON(obj) )
		return obj
	
	def makeSheet( self ):
		csv = [ 'County,Type,All 2000,All 2008,All % Change,Dem 2000,Dem 2008,Dem % Change,GOP 2000,GOP 2008,GOP % Change,All 18-24,All 25-34,All 35-44,All 45-54,All 55-64,All 65-74,All 75+,Dem 18-24,Dem 25-34,Dem 35-44,Dem 45-54,Dem 55-64,Dem 65-74,Dem 75+,GOP 18-24,GOP 25-34,GOP 35-44,GOP 45-54,GOP 55-64,GOP 65-74,GOP 75+,White,Black,Asian,Other,Catholic,Evangelical,Mainline,Jewish,Other,None,Casey,Rendell' ]
		for place in self.places:
			pop = place['population'];  popAll = pop['all'];  popDem = pop['dem'];  popGop = pop['gop']
			ages = place['ages'];  ageAll = ages['all']['counts'];  ageDem = ages['dem']['counts']; ageGop = ages['gop']['counts']
			ethnic = place['ethnic']
			religion = place['religion']['percents']
			gub2002 = place['gub2002']
			csv.append(
				'%s,%s,%d,%d,%.2f%%,%d,%d,%.2f%%,%d,%d,%.2f%%,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%.2f%%,%.2f%%,%.2f%%,%.2f%%,%.2f%%,%.2f%%,%.2f%%,%.2f%%' %(
					place['name'], pop['type'],
					popAll['before'], popAll['after'], popAll['change'],
					popDem['before'], popDem['after'], popDem['change'],
					popGop['before'], popGop['after'], popGop['change'],
					ageAll[0], ageAll[1], ageAll[2], ageAll[3], ageAll[4], ageAll[5], ageAll[6],
					ageDem[0], ageDem[1], ageDem[2], ageDem[3], ageDem[4], ageDem[5], ageDem[6],
					ageGop[0], ageGop[1], ageGop[2], ageGop[3], ageGop[4], ageGop[5], ageGop[6],
					ethnic[0], ethnic[1], ethnic[2], ethnic[3],
					religion[0], religion[1], religion[2], religion[3], religion[4], religion[5],
					gub2002[0], gub2002[1]
				)
			)
		write(
			'%s/states/%s/spreadsheet.csv' %( datapath, self.state ),
			'\n'.join(csv)
		)

def fixCountyName( name ):
	name = name.replace( ' County', '' ).strip()
	name = re.sub( '^\.', '', name )
	name = name.capitalize()
	fixNames = {
		#"Harts Location": "Hart's Location",
		#"Waterville": "Waterville Valley",
		"Cabarus": "Cabarrus",
		"Mckean": "McKean"
	}
	if( name in fixNames ):
		name = fixNames[name]
	return name

def percent( n, digits=1 ):
	pct = round( 100.0 * float(n), digits )
	#if pct == 100.0 and n < 1: pct = 99.0
	return pct

def cleanNum( n ):
	return int( re.sub( '[^0-9]', '', n ) or 0 )

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()

allStates = []

def update( state ):
	global alljson
	reader = Reader( state )
	reader.readAll()
	allStates.append( reader.stateObject() )
	if state == 'pa':  # temp
		reader.makeSheet()
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'State done'

def main():
	update( 'in' )
	update( 'nc' )
	update( 'pa' )
	write( '%s/demographic.js' %( datapath ),
		'GoogleElectionMap.Demographics(%s)' % toJSON(allStates) )
	print 'All done'

if __name__ == "__main__":
    main()
