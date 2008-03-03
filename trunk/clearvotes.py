#!/usr/bin/env python

# clearvotes.py - clear all vote files

import os

import states

votespath = '../election-data/votes'

def write( name, text ):
	print 'Writing %s' % name
	f = open( name, 'w' )
	f.write( text )
	f.close()

def clear( abbr ):
	for party in 'dem', 'gop':
		write(
			'%s/%s_%s.js' %( votespath, abbr, party ),
			'GoogleElectionMap.votesReady({ "status":"none", "party":"%s", "state":"%s" })' %( party, abbr )
		)

def main():
	clear( 'us' )
	for state in states.array:
		clear( state['abbr'].lower() )
	print 'Done!'

if __name__ == "__main__":
    main()
