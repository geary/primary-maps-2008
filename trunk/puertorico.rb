#!/usr/bin/env ruby

require 'rubygems'

require 'hpricot'
require 'json'
require 'open-uri'
require 'time'

HTMLPATH = '../election-data/votes/pr.html'

class Quit < Exception
end

def get
	print "Getting page\n"
	uri = open( 'http://www.ceepur.org/Presidenciales08/Div/index.aspx-op=ISLAPRECINTOS.htm' )
	File.open( HTMLPATH, 'w' ).puts uri.read
end

def parse
	print "Reading file\n"
	doc = Hpricot File.open( HTMLPATH, 'r' ).read
	(doc/'#table4 tr:gt(1)').each { |row|
		name = county_name row
		clinton = precinct_votes 1
		obama = precinct_votes 3
	}
end

def county_name( row )
	name = (row/'td:eq(0)').text.sub( /^\s*/, '' ).sub( /\s*\d*\s*$/, '' )
	
end

def precinct_votes( row, col )
	(row/'td:eq('+col+')').text.gsub( /[\s,]/, '' )
end

begin
	get
	parse
	print "Done!\n"
rescue Quit
	print "Error: #{$!}\n"
end
