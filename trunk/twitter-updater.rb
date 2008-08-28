#!/usr/bin/env ruby

# twitter-updater.rb
# Copyright (c) 2008 Michael Geary - http://mg.to/
# Free Beer and Free Speech License (MIT+GPL)
# http://freebeerfreespeech.org/
# http://www.opensource.org/licenses/mit-license.php
# http://www.opensource.org/licenses/gpl-2.0.php

#puts 'starting'

require 'rubygems'

require 'election-words'
require 'banned-words'
require 'secret'

require 'aws/s3'
require 'cgi'
require 'hpricot'
require 'htmlentities'
require 'json'
#require 'net/http'
require 'open-uri'
require 'time'

INFINITY = 1.0 / 0

$coder = HTMLEntities.new

#class String
#	
#	def fix_json
#		self.sub( /^\[/, "[\n" ).sub( /\]\s*$/, ",\nnull]\n" ).gsub( /"\},\{"/, "\"},\n{\"" )
#	end
#	
#end

class Updater
	
	def initialize
		@ALLTWEETS = 'tweets-all.txt'
		@JSON = 'tweets-latest.js'
		@TWEETMAX = 'tweets-max.txt'
		@MAX_UPDATES = 50
		@lastwrite = Time.now
		@users = {}
		@updates = {}
		@updatelist = []
		@max_id = INFINITY
	end
	
	def getupdates
		begin
			receive
		rescue
			backtrace = $!.backtrace.join("\n")
			print "\n\nEXCEPTION! #{$!}:\n#{backtrace}\n\n\n"
		end
	end
	
	def readupdates
		#print "Loading old tweets\n"
		File.open( @JSON, 'r' ) { |f|
			data = f.read
			oldUpdates = JSON.parse( data )
			oldUpdates.each { |update|
				if update
					# temp
					update['message'] = $coder.decode( update['message'] )
					# TODO: make a user object
					user = update.dup
					user.delete 'message'
					user.delete 'time'
					@users[ update['user'] ] = user
					add update, false
				end
			}
			list = oldUpdates.map { |update| update ? update['message'] : '' }.join("\n")
			#print "Loaded #{oldUpdates.length-1} tweets:\n#{list}\n"
			print "Loaded #{oldUpdates.length-1} tweets\n"
			sleep 2
		}
	end
	
	def writeupdates
		#print "Writing updates\n"
		# Add newlines to JSON output to make it more Subversion-friendly
		json = @updatelist.to_json #.fix_json
		File.open( @JSON, 'w' ) { |f| f.puts json }
	end
	
	def checkin
		print "Uploading updates to S3\n"
		AWS::S3::Base.establish_connection!(
			:access_key_id     => Secret::S3_KEY,
			:secret_access_key => Secret::S3_SECRET
		)
		AWS::S3::S3Object.store( "twitter/#{@JSON}", open(@JSON), 'elections', :access => :public_read )
		print "Done uploading\n"
	end
	
	def add( update, save )
		@updates[ update['message'] ] = update
		@updatelist.push( update )
		File.open( @ALLTWEETS, 'a' ) { |f| f.puts update.to_json } if save
	end
	
	def onemsg( msg )
		body = msg['text']
		return if @updates[body]
		username = msg['from_user']
		#print "#{msg.body}\n"
		if Banned.banned(body) or Banned.banned(username)
			@blocked += 1
			print "Blocked: #{username}: #{body}\n"
			return
		end
		# TODO: make a user object
		user = getuser( username )
		return if not user
		update = {
			'message' => $coder.decode(body),
			'time' => Time.rfc2822( msg['created_at'] ).to_i
		}.merge( user )
		if Banned.banned( update['where'] )
			@blocked += 1
			print "Blocked location: #{update['where']}\n"
			return
		end
		print "Posting: #{update['message']}\n"
		add update, true
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		writeupdates
		checkin
	end
	
	def getuser( username )
		if not @users[username]
			print "Getting twittervision user #{username}\n"
			sleep 2
			open "http://twittervision.com/user/current_status/#{username}.xml" do |f|
				print "Received twittervision user #{username}, status = #{f.status.inspect}\n"
				if f.status[0] == '200'
					xml = f.read
					#print "#{xml}\n"
					tv = Hpricot::XML(xml)
					loc = (tv/:location)
					lat = (loc/:latitude).text
					lon = (loc/:longitude).text
					if lat != '' and lon != ''
						#print "Saving twittervision user #{username}\n"
						image = (tv/'profile-image-url').text
						begin
							image = '' if open(CGI.escape(image)).status[0] != '200'
						rescue
							image = ''
						end
						@users[username] = user = {
							'user' => username,
							'name' => (tv/:name).text,
							'lat' => (loc/:latitude).text,
							'lon' => (loc/:longitude).text,
							'where' => (tv/'current-location').text,
							'status' => 0
						}
						print "image: #{ image == '' ? 'None' : image }\n"
						user['image'] = image if image != ''
					else
						print "No lat/long for #{username}\n"
					end
				end
			end
		end
		@users[username]
	end
	
	def receive
		#print "Start receive\n"
		@blocked = 0
		max_id = open( @TWEETMAX ).gets.chomp.to_i
		print "Starting max_id = #{max_id}\n"
		queries do |query|
			url = "http://search.twitter.com/search.json?rpp=100&since_id=#{max_id}&q=#{CGI.escape(query)}"
			print "#{query}\n#{url}\n"
			open url do |f|
				body = f.read
				#print "\n"
				#print body
				#print "\n\n"
				process JSON.parse( body )
			end
		end
		print "New max_id = #{@max_id}\n"
		#msg = ", blocked #{@blocked}" if @blocked > 0
		#print msg + "\n"
	end
	
	def process( json )
		@max_id = [ @max_id, json['max_id'] ].min
		open( @TWEETMAX, 'w' ) { |f| f.puts @max_id } if @max_id < INFINITY
		results = json['results']
		print "Received #{results.length} tweets\n"
		results.each do |msg|
			onemsg msg
		end
	end
	
	def queries
		query = ''
		ElectionWords::WORDS.strip().split(/\n/).each do |word|
			more = ( query == '' ? '' : ' OR ' ) + word
			if query.length + more.length > 140
				yield query
				query = word
			end
			query += more
		end
		yield query if query != ''
	end
	
end

updater = Updater.new
updater.readupdates
updater.getupdates
