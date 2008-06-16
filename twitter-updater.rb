#!/usr/bin/env ruby

#puts 'starting'

require 'rubygems'

require 'banned-words'
require 'secret'

require 'hpricot'
require 'json'
require 'net/http'
require 'time'
require 'xmpp4r-simple'

class Updater
	
	def initialize
		@JSON = '../election-data/tweets/tweets-new.js'
		@MAX_UPDATES = 50
		@lastwrite = Time.now
		@users = {}
		@updates = {}
		@updatelist = []
		@im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
		p "Sending 'on'"
		@im.deliver( 'twitter@twitter.com', 'on' )
		#p "Sending 'track'"
		#@im.deliver( 'twitter@twitter.com', 'track' )
	end
	
	def run
		while true
			#begin
				receive
				sleep 1
			#rescue
			#	p "Exception raised!"
			#end
		end
	end
	
	#def readupdates
	#	File.open( @JSON, 'r' ) do |f|
	#		data = f.read
	#		oldUpdates = JSON.parse( data )
	#		oldUpdates.each { |update|
	#			@updates[ update['message'] ] = update
	#			@updatelist.push( update )
	#		}
	#	end
	#end
	
	def writeupdates
		p 'Writing updates'
		# Add newlines to JSON output to make it more Subversion-friendly
		json = @updatelist.to_json.sub( /^\[/, "[\n" ).sub( /\]\s*$/, "\n]\n" ).gsub( /"\},\{"/, "\"},\n{\"" )
		File.open( @JSON, 'w' ) do |f|
			f.puts json
		end
		#p 'Checking in updates'
		#`svn ci -m "Twitter update" #{@JSON}`
		#p 'Done checking in'
	end
	
	#readupdates
	
	def onemsg( msg )
		#p msg.body
		return if msg.type != :chat or msg.from != 'twitter@twitter.com' or @updates[msg.body]
		body = msg.body
		match = /^(.*):(.*)$/.match(body)
		return if not match
		username = match[1].strip
		message = match[2].strip
		if Banned.banned(body)
			p "Blocked: #{message}"
			return
		end
		doc = Hpricot::XML(msg.to_s)
		author = (doc/:author/:name).text
		user = getuser( username, author )
		return if not user
		update = {
			'body' => msg.body,
			'message' => message,
			'time' => Time.xmlschema( (doc/:published).text ).to_i
		}.merge( user )
		if Banned.banned( update['where'] )
			p "Blocked location: #{update['where']}"
			return
		end
		p "Posting: #{message}"
		@updates[msg.body] = update
		@updatelist.push( update )
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		#if Time.now - @lastwrite > 300 and @updatelist.length >= 20
		if @updatelist.length >= 5
			@lastwrite = Time.now
			writeupdates
		end
	end
	
	def getuser( username, author )
		if not @users[username]
			#p "Getting twittervision user #{username}"
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
		p "Start receive"
		@im.received_messages do |msg|
			#p "Got msg: #{msg}"
			onemsg msg
		end
	end
	
end

updater = Updater.new
updater.run
