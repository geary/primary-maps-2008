#!/usr/bin/env ruby

#puts 'starting'

require 'rubygems'

require 'election-words'
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
		print "Sending 'on'\n"
		@im.deliver( 'twitter@twitter.com', 'on' )
		#print "Sending 'track'\n"
		#@im.deliver( 'twitter@twitter.com', 'track' )
	end
	
	def run
		while true
			begin
				receive
				sleep 1
			rescue
				backtrace = $!.backtrace.join("\n")
				print "\n\nEXCEPTION! #{$!}:\n#{backtrace}\n\n\n"
			end
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
		print "Writing updates\n"
		# Add newlines to JSON output to make it more Subversion-friendly
		json = @updatelist.to_json.sub( /^\[/, "[\n" ).sub( /\]\s*$/, ",\nnull]\n" ).gsub( /"\},\{"/, "\"},\n{\"" )
		File.open( @JSON, 'w' ) do |f|
			f.puts json
		end
		print "Checking in updates\n"
		`svn ci -m "Twitter update" #{@JSON}`
		print "Done checking in\n"
	end
	
	#readupdates
	
	def onemsg( msg )
		#print "#{msg.body}\n"
		return if msg.type != :chat or msg.from != 'twitter@twitter.com' or @updates[msg.body]
		body = msg.body
		if ! Search.search(body)
			#print "Skipped: #{body}\n"
			return
		end
		if Banned.banned(body)
			print "Blocked: #{body}\n"
			return
		end
		match = /^(.*):(.*)$/.match(body)
		return if not match
		username = match[1].strip
		message = match[2].strip
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
			print "Blocked location: #{update['where']}\n"
			return
		end
		print "Posting: #{body}\n"
		@updates[msg.body] = update
		@updatelist.push( update )
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		if Time.now - @lastwrite > 300 and @updatelist.length >= 20
			@lastwrite = Time.now
			writeupdates
		end
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
		@im.received_messages do |msg|
			#print "Got msg\n"
			onemsg msg
		end
	end
	
end

updater = Updater.new
updater.run
