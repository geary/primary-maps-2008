module Search
	def Search.search( text )
		!!( SEARCH =~ ' ' + text + ' ' )
	end
	
	WORDS = <<END
barack
barr
biden
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
giuliani
gop
hillary
huckabee
libertarian
mccain
obama
republican
republicans
romney
ron paul
super tuesday
tancredo
END

	SEARCH = Regexp.new( '(^|\\W)('+ WORDS.strip().gsub( /\n/, '|' ) + ')(\\W|$)', Regexp::IGNORECASE )
	
end

#p Search.search( 'test' )
#p Search.search( 'voter' )
