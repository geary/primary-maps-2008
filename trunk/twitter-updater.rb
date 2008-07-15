
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
require 'hpricot'
require 'htmlentities'
require 'json'
require 'net/http'
require 'time'
require 'xmpp4r-simple'

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
		@MAX_UPDATES = 50
		@lastwrite = Time.now
		@users = {}
		@updates = {}
		@updatelist = []
		@exit = false
		@skiptimes = 0
	end
	
	def connect
		@im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
		#print "Sending 'on'\n"
		@im.deliver( 'twitter@twitter.com', 'on' )
		#print "Sending 'track'\n"
		#@im.deliver( 'twitter@twitter.com', 'track' )
	end
	
	def run
		until @exit
			begin
				receive
				sleep 3
			rescue
				backtrace = $!.backtrace.join("\n")
				print "\n\nEXCEPTION! #{$!}:\n#{backtrace}\n\n\n"
			end
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
					update['body'] = $coder.decode( update['body'] )
					update['message'] = $coder.decode( update['message'] )
					# TODO: make a user object
					user = update.dup
					user.delete 'body'
					user.delete 'message'
					user.delete 'time'
					@users[ update['user'] ] = user
					add update
				end
			}
			list = oldUpdates.map { |update| update ? update['body'] : '' }.join("\n")
			#print "Loaded #{oldUpdates.length-1} tweets:\n#{list}\n"
			print "Loaded #{oldUpdates.length-1} tweets\n"
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
		AWS::S3::S3Object.store( "twitter/#{@JSON}", open(@JSON), 'elections' )
		print "Done uploading\n"
	end
	
	def add( update )
		@updates[ update['body'] ] = update
		@updatelist.push( update )
		File.open( @ALLTWEETS, 'a' ) { |f| f.puts update.to_json }
	end
	
	def onemsg( msg )
		#print "#{msg.body}\n"
		return if msg.type != :chat or msg.from != 'twitter@twitter.com' or @updates[msg.body]
		body = msg.body
		if ! Search.search(body)
			@skipped += 1
			#print "Skipped: #{body}\n"
			return
		end
		if Banned.banned(body)
			@blocked += 1
			print "Blocked: #{body}\n"
			return
		end
		match = /^(.*):(.*)$/.match(body)
		return if not match
		username = match[1].strip
		message = match[2].strip
		doc = Hpricot::XML(msg.to_s)
		author = (doc/:author/:name).text
		# TODO: make a user object
		user = getuser( username, author )
		return if not user
		update = {
			'body' => $coder.decode(body),
			'message' => $coder.decode(message),
			'time' => Time.xmlschema( (doc/:published).text ).to_i
		}.merge( user )
		if Banned.banned( update['where'] )
			@blocked += 1
			print "Blocked location: #{update['where']}\n"
			return
		end
		print "Posting: #{update['body']}\n"
		add update
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		writeupdates
		#if Time.now - @lastwrite > 150
			@lastwrite = Time.now
			checkin
			@exit = true
		#end
	end
	
	def getuser( username, author )
		if not @users[username]
			#print "Getting twittervision user #{username}\n"
			http = Net::HTTP.new( 'twittervision.com' )
			headers, body = http.get( "/user/current_status/#{username}.xml" )
			if headers.code == '200'
				tv = Hpricot::XML(body)
				loc = (tv/:location)
				lat = (loc/:latitude).text
				lon = (loc/:longitude).text
				if lat != '' and lon != ''
					@users[username] = {
						'user' => username,
						'author' => author,
						'name' => (tv/:name).text,
						'image' => (tv/'profile-image-url').text,
						'lat' => (loc/:latitude).text,
						'lon' => (loc/:longitude).text,
						'where' => (tv/'current-location').text,
						'status' => 0
					}
				end
			end
		end
		@users[username]
	end
	
	def receive
		#print "Start receive\n"
		@skipped = @blocked = 0
		@im.received_messages do |msg|
			#print "Got msg\n"
			onemsg msg
		end
		if @skipped > 0
			@skiptimes = 0
		else
			@skiptimes += 1
		end
		times = @skiptimes > 0 ? " (#{@skiptimes})" : ''
		msg = "Skipped #{@skipped}#{times}"
		msg += ", blocked #{@blocked}" if @blocked > 0
		print msg + "\n"
	end
	
end

updater = Updater.new
updater.readupdates
updater.connect
updater.run
