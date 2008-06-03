#!/usr/bin/env ruby

require 'rubygems'

require 'hpricot'
require 'open-uri'
require 'time'

HTMLPATH = '../election-data/votes/pr.html'
CSVPATH = '../election-data/votes/0601.csv'

class Quit < Exception
end

def get
	print "Getting page\n"
	uri = open( 'http://www.ceepur.org/Presidenciales08/Div/index.aspx-op=ISLAPRECINTOS.htm' )
	File.open( HTMLPATH, 'w' ).puts uri.read
end

def parse
	print "Reading file\n"
	totals = { 'name' => '*', 'precincts' => 0, 'clinton' => 0, 'obama' => 0 }
	counties = { '*' => totals }
	doc = Hpricot File.open( HTMLPATH, 'r' ).read
	(doc/'#table4 tr:gt(1)').each { |row|
		name = county_name row
		clinton = precinct_votes row, 1
		obama = precinct_votes row, 3
		counties[name] = { 'name' => name, 'precincts' => 0, 'clinton' => 0, 'obama' => 0 } unless counties[name]
		counties[name]['precincts'] += 1
		counties[name]['clinton'] += clinton
		counties[name]['obama'] += obama
		totals['precincts'] += 1
		totals['clinton'] += clinton
		totals['obama'] += obama
	}
	File.open( CSVPATH, 'w' ) { |f|
		f.write "state,county,precincts,reporting,clinton,obama\n"
		counties.each { |k,v|
			f.write "PR,#{k},#{v['precincts']},#{v['precincts']},#{v['clinton']},#{v['obama']}\n"
		}
	}
end

def county_name( row )
	name = (row/'td:eq(0)').text.sub( /^\s*/, '' ).sub( /\s*\d*\s*$/, '' )
end

def precinct_votes( row, col )
	sel = 'td:eq(' + col.to_s + ')'
	(row/sel).text.gsub( /[\s,]/, '' ).to_i
end

begin
	get
	parse
	print "Done!\n"
rescue Quit
	print "Error: #{$!}\n"
end
