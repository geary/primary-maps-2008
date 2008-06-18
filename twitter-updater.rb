#!/usr/bin/env ruby

#puts 'starting'

require 'rubygems'

require 'election-words'
require 'banned-words'
require 'secret'

require 'hpricot'
require 'htmlentities'
require 'json'
require 'net/http'
require 'time'
require 'xmpp4r-simple'

$coder = HTMLEntities.new

class String
	
	def fix_json
		self.sub( /^\[/, "[\n" ).sub( /\]\s*$/, ",\nnull]\n" ).gsub( /"\},\{"/, "\"},\n{\"" )
	end
	
end

class Updater
	
	def initialize
		@JSON = '../election-data/tweets/tweets-new.js'
		@MAX_UPDATES = 50
		@lastwrite = Time.now
		@users = {}
		@updates = {}
		@updatelist = []
		@exit = false
	end
	
	def connect
		@im = Jabber::Simple.new( Secret::USERNAME, Secret::PASSWORD )
		print "Sending 'on'\n"
		@im.deliver( 'twitter@twitter.com', 'on' )
		#print "Sending 'track'\n"
		#@im.deliver( 'twitter@twitter.com', 'track' )
	end
	
	def run
		until @exit
			begin
				receive
				sleep 1
			rescue
				backtrace = $!.backtrace.join("\n")
				print "\n\nEXCEPTION! #{$!}:\n#{backtrace}\n\n\n"
			end
		end
	end
	
	def readupdates
		print "Loading old tweets\n"
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
			print "Loaded #{oldUpdates.length-1} tweets:\n#{list}\n"
		}
	end
	
	def writeupdates
		print "Writing updates\n"
		# Add newlines to JSON output to make it more Subversion-friendly
		json = @updatelist.to_json.fix_json
		File.open( @JSON, 'w' ) do |f|
			f.puts json
		end
	end
	
	def checkin
		print "Checking in updates\n"
		`svn ci -m "Twitter update" #{@JSON}`
		print "Done checking in\n"
	end
	
	def add( update )
		@updates[ update['body'] ] = update
		@updatelist.push( update )
	end
	
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
		# TODO: make a user object
		user = getuser( username, author )
		return if not user
		update = {
			'body' => $coder.decode(body),
			'message' => $coder.decode(message),
			'time' => Time.xmlschema( (doc/:published).text ).to_i
		}.merge( user )
		if Banned.banned( update['where'] )
			print "Blocked location: #{update['where']}\n"
			return
		end
		print "Posting: #{update['body']}\n"
		add update
		@updatelist.delete_at(0) if @updatelist.length > @MAX_UPDATES
		writeupdates
		if Time.now - @lastwrite > 300
			@lastwrite = Time.now
			checkin
			@exit = true
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
updater.readupdates
updater.connect
updater.run
