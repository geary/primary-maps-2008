function scriptIG( url, seconds ) {
	document.write(
		'<script type="text/javascript" src="',
			_IG_GetCachedUrl( url, { refreshInterval:seconds } ),
		'">',
		'<\/script>'
	);
}

if( ! window.jQuery )
	scriptIG( 'http://primary-maps-2008.googlecode.com/svn/trunk/jquery-1.2.3-no-ajax.min.js', 3600 );
	
scriptIG( 'http://primary-maps-2008.googlecode.com/svn/trunk/map-proto.js', 120 );
scriptIG( 'http://primary-maps-2008-data.googlecode.com/svn/trunk/demographic/demographic.js', 120 );
