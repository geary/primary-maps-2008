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

def readJSON( filename )
	File.open( filename, 'r' ) { |f| JSON.parse(f.read) }
end

def writeJSON( filename, value )
	File.open( filename, 'w' ) { |f| f.puts value.to_json }
end

class Updater
	
	def initialize
		@ALLTWEETS = 'tweets-all.txt'
		@JSON = 'tweets-latest.json'
		@USERS = 'tweets-users.json'
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
		now = Time.new.to_i
		users = readJSON @USERS
		users.each { |name,user|
			@users[name] = user if now - user['time'] < 60*60*4
		}
		print "Loaded #{@users.length} from cache, discarded #{users.length-@users.length} users\n"
		oldUpdates = readJSON @JSON
		oldUpdates.each { |update|
			if update
				# temp
				update['message'] = $coder.decode( update['message'] )
				add update, false
			end
		}
		list = oldUpdates.map { |update| update ? update['message'] : '' }.join("\n")
		#print "Loaded #{oldUpdates.length-1} tweets:\n#{list}\n"
		print "Loaded #{oldUpdates.length-1} tweets\n"
		sleep 2
	end
	
	def writeupdates
		writeJSON @JSON, @updatelist
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
		message = update['message']
		return if update[message]
		@updates[message] = update
		@updatelist.push( update )
		writeJSON( @ALLTWEETS, update ) if save
	end
	
	def onemsg( msg )
		text = msg['text']
		return if @updates[text]
		username = msg['from_user']
		#print "#{text}\n"
		if Banned.banned(text) or Banned.banned(username)
			@blocked += 1
			print "Blocked: #{username}: #{text}\n"
			return
		end
		# TODO: make a user object
		user = getuser( username )
		return if not user or not user['status']
		update = {
			'id' => msg['id'],
			'message' => $coder.decode(text),
			'time' => Time.rfc2822( msg['created_at'] ).to_i,
			'image' => msg['profile_image_url']
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
		if @users[username]
			print "Twittervision user #{username} from cache\n"
		else
			print "Getting twittervision user #{username}\n"
			sleep 10
			open "http://twittervision.com/user/current_status/#{username}.xml" do |f|
				#print "Received twittervision user #{username}, status = #{f.status.inspect}\n"
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
							'status' => 0,
							'time' => Time.new.to_i
						}
						print "image: #{ image == '' ? 'None' : image }\n"
						user['image'] = image if image != ''
					else
						print "No lat/long for #{username}\n"
						@users[username] = {
							'user' => username,
							'time' => Time.new.to_i
						}
					end
					saveusers
				end
			end
		end
		@users[username]
	end
	
	def saveusers
		writeJSON @USERS, @users
	end
	
	def receive
		#print "Start receive\n"
		@blocked = 0
		max_id = open( @TWEETMAX ).gets.chomp.to_i
		print "Starting max_id = #{max_id}\n"
		queries do |query|
			url = "http://search.twitter.com/search.json?lang=en&rpp=100&since_id=#{max_id}&q=#{CGI.escape(query)}"
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
