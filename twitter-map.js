(function( $ ) {

var opt = window.GoogleElectionMapOptions || {};

var mapplet = opt.mapplet;

var imgBaseUrl = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/images/icons/';

function loadScript( url ) {
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	var seq = (new Date).getTime();
	script.src = url + '?q=' + seq;
	script.title = 'jsonresult';
	$('head')[0].appendChild( script );
}

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var thisp = arguments[1];
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			if( i in this )
				fun.call( thisp, this[i], i, this );
		}
	};
}

if( ! Array.prototype.map ) {
	Array.prototype.map = function( fun /*, thisp*/ ) {
		var len = this.length;
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

if( ! Array.prototype.index ) {
	Array.prototype.index = function( field ) {
		this.by = {};
		var by = this.by[field] = {};
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			var obj = this[i];
			by[obj[field]] = obj;
			obj.index = i;
		}
		return this;
	};
}

String.prototype.trim = function() {
	return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
};

String.prototype.words = function( fun ) {
	this.split(' ').forEach( fun );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

//function atLinks( str ) {
//	var replacement = '$1@<a href="$2" target="_blank">$2</a>$3';
//	return str
//		.replace( /(^|\s)@([^\s:]+)(:)/g, replacement )
//		.replace( /(^|\s)@(\S+)(\s|$)/g, replacement );
//}

function httpLinks( str ) {
	return str.replace( /(http:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>' );
}

// GAsync v2 by Michael Geary
// Commented version and description at:
// http://mg.to/2007/06/22/write-the-same-code-for-google-mapplets-and-maps-api
// Free beer and free speech license. Enjoy!

function GAsync( obj ) {
	
	function callback() {
		args[nArgs].apply( null, results );
	}
	
	function queue( iResult, name, next ) {
		
		function ready( value ) {
			results[iResult] = value;
			if( ! --nCalls )
				callback();
		}
		
		var a = [];
		if( next.join )
			a = a.concat(next), ++iArg;
		if( mapplet ) {
			a.push( ready );
			obj[ name+'Async' ].apply( obj, a );
		}
		else {
			results[iResult] = obj[name].apply( obj, a );
		}
	}
	
	var mapplet = ! window.GBrowserIsCompatible;
	
	var args = arguments, nArgs = args.length - 1;
	var results = [], nCalls = 0;
	
	for( var iArg = 1;  iArg < nArgs;  ++iArg ) {
		var name = args[iArg];
		if( typeof name == 'object' )
			obj = name;
		else
			queue( nCalls++, name, args[iArg+1] );
	}
	
	if( ! mapplet )
		callback();
}

//twitterBlurb = ! opt.twitter ? '' : S(
//	'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
//		'We\'ve joined forces with <a href="http://twitter.com/" target="_blank">Twitter</a> and <a href="http://twittervision.com/" target="_blank">Twittervision</a> to give you instant updates on Super Tuesday. You can watch Twitter texts from across the country and send in your own updates!',
//	'</div>'
//);

	document.write( (
		mapplet ? [
			//'<style type="text/css">',
			//	'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			//	'#outer {}',
			//	'#links { margin-bottom:4px; }',
			//	'#news { margin-top:4px; padding:4px; }',
			//	'#clicknote { display:none; }',
			//	'h2 { xfont-size:14pt; margin:0; padding:0; }',
			//	'#loading { font-weight:normal; }',
			//	'.NewsHeading { padding-left:4px; }',
			//	'.NewsList { background-color:white; padding:2px; margin:4px; }',
			//	'.NewsList a { text-decoration:none; }',
			//	'.NewsList  a:hover { text-decoration:underline; }',
			//	'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			//	'.favicon { width:16; height:16; float:left; margin:2px 4px 2px 2px; }',
			//	'.Video { margin-top:4px; }',
			//	'.VideoHeading { xfont-size:125%; }',
			//	'.VideoTitle { xfont-size:110%; }',
			//	'.VideoThumb { float:left; margin-right:8px; }',
			//	'.VideoBorder { clear:left; }',
			//	'#votestitle { margin:12px 0 6px 0; padding:0; }',
			//	'#votesattrib * { font-size:85%; }',
			//	'#legend table { xwidth:100%; }',
			//	'#legend .legendboxtd { width:1%; }',
			//	'#legend .legendnametd { xfont-size:24px; xwidth:18%; }',
			//	'#legend .legendbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
			//	'#legend .legendname { xfont-size:12pt; white-space:pre; }',
			//	'#legend .legendvotestd { text-align:right; width:5em; }',
			//	'#legend .legendpercenttd { text-align:right; width:2em; }',
			//	'#legend .legendvotes, #legend .legendpercent { xfont-size:10pt; margin-right:6px; }',
			//	'#legend .legendclear { clear:left; }',
			//	'#legend .legendreporting * { xfont-size:20px; }',
			//'</style>',
			//'<div id="outer">',
			//	'<div id="resultlist">',
			//	'</div>',
			//	'<div id="attribution" style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px; text-align:right; display:none;">',
			//		'<span>AP</span>',
			//		'<span>/</span>',
			//		'<a href="http://www.boston.com/" target="_blank">Boston&nbsp;Globe</a>',
			//	'</div>',
			//	'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
			//		//'<span style="color:red;">New!</span> ',
			//		'<a href="http://gmodules.com/ig/creator?synd=open&url=http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/supermap2.xml" target="_blank">Get this map for your website</a>',
			//	'</div>'
		] : [
			'<style type="text/css">',
				'body { margin:0; padding:0; }',
				'* { font-family: Arial,sans-serif; font-size: 10pt; }',
				'#outer {}',
				'#eventbar { display:none; }',
				'#links { margin-bottom:4px; }',
				'#news { margin-top:4px; padding:4px; }',
				'#clicknote { display:none; }',
				'h2 { font-size:11pt; margin:0; padding:0; }',
				'#loading { font-weight:normal; }',
				'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'</style>',
			'<div id="map" style="width:100%; height:100%;">',
			'</div>'
		] ).join('') );

var map;

//opt.baseUrl = opt.baseUrl || 'http://gmaps-samples.googlecode.com/svn/trunk/';

function pointLatLng( point ) {
	return new GLatLng( point[0], point[1] );
}

function load() {
	if( mapplet ) {
		map = new GMap2;
	}
	else {
		if( ! GBrowserIsCompatible() ) return;
		map = new GMap2( $('#map')[0] );
		map.enableContinuousZoom();
		map.enableDoubleClickZoom();
		//map.enableGoogleBar();
		map.enableScrollWheelZoom();
		//map.addControl( new GLargeMapControl() );
		map.addControl( new GSmallMapControl() );
	}
	
	map.setCenter( new GLatLng( 37.0625, -95.677068 ), 4 );
	
	loadTwitter();
	
	if( mapplet )
		_IG_AdjustIFrameHeight();
}

function imgUrl( name ) {
	return imgBaseUrl + name + '.png';
}

$(window).bind( 'load', load ).bind( 'onunload', GUnload );

function loadTwitter() {
	//var url = 'http://primary-maps-2008-data.googlecode.com/svn/trunk/tweets/tweets.js?t=' + new Date().getTime();
	var url = 'http://primary-maps-2008-data.googlecode.com/svn/trunk/tweets/tweets.js';
	_IG_FetchContent( url, function( t ) {
		window.tweets = eval( '(' + t + ')' );
		//var list = [], markers = [];
		//tweets.forEach( function( tweet ) {
		//	markers.push();
		//});
		showTweet();
	});
}

function showTweet() {
	var tweet = tweets.shift();
	if( tweet )
		addTweetMarker( tweet );
	else
		loadTwitter();
}

var tweetMarker;
function addTweetMarker( tweet ) {
	//debugger;
	//if( tweetMarker ) {
	//	//map.closeInfoWindow();
	//	map.removeOverlay( tweetMarker );
	//	tweetMarker = null;
	//}
	
	var latlng = new GLatLng( tweet.lat, tweet.lon );
	if( ! tweetMarker ) {
		tweetMarker = new GMarker( latlng/*, { icon:icons[color] }*/ );
		map.addOverlay( tweetMarker );
	}
	else {
		if( mapplet )
			tweetMarker.setPoint( latlng );
		else
			tweetMarker.setLatLng( latlng );
	}
	//marker.openInfoWindowHtml( tweetBubble(tweet) );
	var bubble = tweetBubble(tweet);
	tweetMarker.openInfoWindowHtml( bubble, { maxWidth:300, disableGoogleLinks:true } );
	
	//setTimeout( showTweet, 15000 );
}

function tweetBubble( tweet ) {
	var img = ! tweet.image ? '' : S(
		'<img ',
			'style="border:1px solid black; float:left; width:48px; height:48px; margin:0 6px 6px 0; vertical-align:top;" ',
			'src="', tweet.image || '', '" />'
	);
	var author = ! tweet.author || tweet.author == tweet.user ? '' : S( '<div>', htmlEscape(tweet.author), '</div>' );
	return S(
		'<div style="font-family: Arial,sans-serif; font-size: 10pt;">',
			img,
			'<div style="font-weight:bold;">',
				'<a target="_new" href="http://twitter.com/', htmlEscape(tweet.user), '">', htmlEscape(tweet.user), '</a>',
			'</div>',
			author,
			'<div>',
				htmlEscape( tweet.where || '' ),
			'</div>',
			'<div style="display: inline;">',
				httpLinks( htmlEscape(tweet.message) ),
				//atLinks( httpLinks( htmlEscape(tweet.message) ) ),
			'</div>',
			//'<div id="statusupdated">less than a minute ago in WWW</div>
		'</div>'
	);
}

})( jQuery );
