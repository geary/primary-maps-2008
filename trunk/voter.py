#!/usr/bin/env python

# voter.py - vote reader for 2008 primaries

import csv
import os
import re
import time
import urllib

from candidates import candidates
#from template import *
import private
import random
import simplejson as sj
import states

votespath = '../election-data/votes'

#def str( text ):
#	strings = {
#		'county': 'town',
#		'counties': 'towns'
#	}
#	return strings[text] or text

def formatNumber( number ):
	return str(number)

def json( obj ):
	if 0:
		json = sj.dumps( obj, indent=4 )
	else:
		json = sj.dumps( obj, separators=( ',', ':' ) )
		json = re.sub( '\],"', '],\n"', json )
		json = re.sub( ':\[{', ':[\n{', json )
		json = re.sub( '":{', '":\n{', json )
		json = re.sub( '},{', '},\n{', json )
		json = re.sub( '},"', '},\n"', json )
	return json

def feedCSV( feed ):
	return '%s/%s' %( votespath, feed['file'] )

def fetchData( feed ):
	url = feed['url']
	file = feedCSV(feed)
	print 'Retrieving %s from:\n%s' %( file, url )
	urllib.urlretrieve( url, file )

		## Correct error in census data for Wentworth's Location
		#if( name == "Wentworth" and number == '9' ):
		#	name = "Wentworth's Location"

#def clearParties( entity ):
#	for party in 'dem', 'gop':
#		ep = entity['parties'][party]
#		if 'votes' in ep: del ep['votes']
#		if 'precincts' in ep: del ep['precincts']
#
#def clearVotes( feed ):
#	for state in states.array:
#		clearParties( state )
#		if 'counties' in state:
#			for county in state['counties'].itervalues():
#				clearParties( county )

def readVotes( feed ):
	print 'Processing %s' % feed['file']
	state = feed.get('state')
	reader = csv.reader( open( feedCSV(feed), 'rb' ) )
	header = []
	while header == []:
		header = reader.next()
	if state: header.insert( 0, 'state' )
	#print header
	for row in reader:
		if len(row) < 2: continue
		if state: row.insert( 0, state )
		setData( feed, header, row )

def setData( feed, header, row ):
	entity = state = states.byAbbr[ row[0] ]
	if 'counties' not in state: state['counties'] = {}
	setVotes( state, header, row )

def getPrecincts( row ):
	return {
		'reporting': int(row[3]),
		'total': int(row[2])
	}

def setVotes( entity, header, row ):
	counties = entity['counties']
	countyname = row[1]
	if countyname != '*':
		if countyname not in counties:
			counties[countyname] = { 'parties':{ 'dem':{}, 'gop':{} } }
		entity = counties[countyname]
	for col in xrange( 4, len(header) ):
		if col >= len(row) or row[col] == '': continue
		name = header[col]
		if name == 'total-d' or name == 'total-r': continue
		if name == 'trancredo': name = 'tancredo'
		candidate = candidates['byname'][name]
		party = candidate['party']
		p = entity['parties'][party]
		if 'precincts' not in p: p['precincts'] = getPrecincts( row )
		if 'votes' not in p: p['votes'] = {}
		p['votes'][name] = int(row[col])

def percentage( n ):
	pct = int( round( 100.0 * float(n) ) )
	if pct == 100 and n < 1: pct = 99
	return pct

def sortVotes( party ):
	if not party.get('votes'): party['votes'] = {}
	tally = []
	for name, votes in party['votes'].iteritems():
		tally.append({ 'name':name, 'votes':votes })
	tally.sort( lambda a, b: b['votes'] - a['votes'] )
	party['votes'] = tally

def makeJson( party ):
	ustotal = 0
	usvotes = {}
	usprecincts = { 'total': 0, 'reporting': 0 }
	usparty = { 'votes': usvotes, 'precincts': usprecincts }
	statevotes = {}
	for state in states.array:
		statetotal = 0
		parties = state['parties']
		if party not in parties: continue
		stateparty = state['parties'][party]
		stateparty['name'] = state['name']
		if 'votes' not in stateparty: continue
		sortVotes( stateparty )
		statevotes[ state['name'] ] = stateparty
		print 'Loading %s %s' %( state['name'], party )
		for vote in stateparty['votes']:
			name = vote['name']
			count = vote['votes']
			if name not in usvotes:
				usvotes[name] = 0
			usvotes[name] += count
			ustotal += count
			statetotal += count
		countyvotes = {}
		counties = state.get( 'counties', {} )
		for countyname, county in counties.iteritems():
			countyparty = county['parties'][party]
			countyparty['name'] = countyname
			sortVotes( countyparty )
			countytotal = 0
			for vote in countyparty['votes']:
				countytotal += vote['votes']
			countyparty['total'] = countytotal
			countyvotes[countyname] = countyparty
		write(
			'%s/%s_%s.js' %( votespath, state['abbr'].lower(), party ),
			'GoogleElectionMap.votesReady(%s)' % json({
					'status': 'ok',
					'party': party,
					'state': state['abbr'],
					'total': statetotal,
					'totals': stateparty,
					'locals': countyvotes
			}) )
	sortVotes( usparty )
	write(
		'%s/%s_%s.js' %( votespath, 'us', party ),
		'GoogleElectionMap.votesReady(%s)' % json({
				'status': 'ok',
				'party': party,
				'state': 'US',
				'total': ustotal,
				'totals': usparty,
				'locals': statevotes
		}) )
	#print '%s of %s precincts reporting' %( state['precincts']['reporting'], state['precincts']['total'] )

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()
	
def update():
	for feed in private.feeds:
		#fetchData( feed )
		readVotes( feed )
	print 'Creating votes JSON...'
	makeJson( 'dem' )
	makeJson( 'gop' )
	#print 'Checking in votes JSON...'
	#os.system( 'svn ci -m "Vote update" %s' % votespath )
	print 'Done!'

def main():
	#while 1:
		update()
		#print 'Waiting 10 minutes...'
		#time.sleep( 600 )

if __name__ == "__main__":
    main()
