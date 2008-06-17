module Search
	def Search.search( text )
		!!( SEARCH =~ ' ' + text + ' ' )
	end
	
	WORDS = <<END
barack
barr
biden
candidate
candidates
caucus
caucused
caucuses
caucusing
clinton
democrat
democratic
democrats
dodd
edwards
election
elections
endorse
endorses
frontrunner
giuliani
gop
hillary
huckabee
libertarian
mccain
obama
poll
polls
primaries
primary
republican
republicans
romney
ron paul
super tuesday
tancredo
vote
voted
voter
voters
votes
voting
END

	SEARCH = Regexp.new( '(^|\\W)('+ WORDS.strip().gsub( /\n/, '|' ) + ')(\\W|$)', Regexp::IGNORECASE )
	
end

#p Search.search( 'test' )
#p Search.search( 'voter' )
