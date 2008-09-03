// twitter-map.js
// Copyright (c) 2008 Michael Geary - http://mg.to/
// Free Beer and Free Speech License (MIT+GPL)
// http://freebeerfreespeech.org/
// http://www.opensource.org/licenses/mit-license.php
// http://www.opensource.org/licenses/gpl-2.0.php

(function( $ ) {

tweets = {
	interval: 15000,
	max: 50,
	index: 0,
	array: [],
	timer: null,
	next: function() {
		tweets.clearTimer();
		if( ++tweets.index < tweets.array.length )
			openTweet();
		else
			loadTwitter();
	},
	previous: function() {
		tweets.clearTimer();
		if( --tweets.index >= 0 )
			openTweet();
	},
	setTimer: function() {
		tweets.timer = setTimeout( tweets.next, tweets.interval );
	},
	clearTimer: function() {
		clearTimeout( tweets.timer );
		tweets.timer = null;
	}
};

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

function htmlClean( html ) {
	if( html == null ) html = '';
	return htmlEscape( htmlUnEntitize(html) );
}

function htmlEscape( html ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( html ) );
	return div.innerHTML;
}

//function htmlUnescape( html ) {
//	return $('<div></div>').html( html ).text();
//}

function htmlUnEntitize( html ) {
	return html
		.replace( /&amp;/g, '&' )
		.replace( /&apos;/g, "'" )
		.replace( /&gt;/g, '>' )
		.replace( /&lt;/g, '<' )
		.replace( /&quot;/g, '"' );
}

function atLinks( str ) {
	return str.replace(
		/(^|\s)@([\w_]+)/g,
		'$1@<a target="_blank" href="http://twitter.com/$2">$2</a>'
	);
}

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

function showCredits() {
	showInfoTip( true, {
		width: 310,
		top: 20,
		title: 'Twitter Election Map by Geary Labs',
		text: S(
			'<div class="credits">',
				'<div class="credit">',
					'Designed and developed by:',
					'<div class="source">',
						'<a target="_blank" href="http://mg.to/">Michael Geary</a>',
					'</div>',
				'</div>',
				'<div class="credit">',
					'Live updates provided by:',
					'<div class="source">',
						'<a target="_blank" href="http://twitter.com/">Twitter</a>',
					'</div>',
				'</div>',
				'<div class="credit">',
					'Geolocation by:',
					'<div class="source">',
						'<a target="_blank" href="http://twittervision.com/">Twittervision</a>',
					'</div>',
				'</div>',
				'<div class="credit">',
					'Special thanks to:',
					'<div class="source">',
						'<a target="_blank" href="http://www.brittanybohnet.com/">Brittany Bohnet</a>',
					'</div>',
					'<div class="source">',
						'<a target="_blank" href="http://code.google.com/apis/maps/">Google Maps API Team</a>',
					'</div>',
					'<div class="source">',
						'<a target="_blank" href="http://jquery.com/">jQuery</a>',
					'</div>',
				'</div>',
			'</div>'
		)
	});
}

// TODO: generalize this
CreditsControl = function( show ) {
	return $.extend( new GControl, {
		initialize: function( map ) {
			var $control = $(S(
				'<div style="color:black; font-family:Arial,sans-serif;">',
					'<div style="background-color:white; border:1px solid black; cursor:pointer; text-align:center; width:3.5em;">',
						'<div style="border-color:white #B0B0B0 #B0B0B0 white; border-style:solid; border-width:1px; font-size:12px;">',
							'Credits',
						'</div>',
					'</div>',
				'</div>'
			)).click( showCredits ).appendTo( map.getContainer() );
			return $control[0];
		},
		
		getDefaultPosition: function() {
			return new GControlPosition( G_ANCHOR_BOTTOM_LEFT, new GSize( 4, 40 ) );
		}
	});
};

function showInfoTip( show, tip ) {
	var $infotip = $('#infotip');
	if( show ) {
		if( $infotip[0] ) return;
		var $outer = $('#outer'), ow = $outer.width();
		var width = tip.width || ow - 40;
		var offset = $outer.offset();
		var top = offset.top + ( tip.top || 8 );
		//var left = offset.left + 8;
		var left = offset.left + ( ow - width ) / 2 - 8;
		
		$('body').append( S(
			//'<div id="infotip" style="z-index:999; position:absolute; top:', top, 'px; left:', left, 'px; width:', width, 'px; padding:8px; background-color:#F2EFE9; border: 1px solid black;">',
			'<div id="infotip" style="z-index:999; position:absolute; top:', top, 'px; left:', left, 'px; width:', width, 'px; padding:8px; background-color:#F8F7F3; border: 1px solid black;">',
				'<div style="margin-bottom:px;">',
					'<table cellspacing="0" cellpadding="0">',
						'<tr valign="top">',
							'<td style="width:99%;">',
								'<b>', tip.title, '</b>',
							'</td>',
							'<td style="width:12px;">',
								'<a class="delbox" id="infoclose" href="javascript:void(0)" title="Close">',
								'</a>',
							'</td>',
						'</tr>',
					'</table>',
				'</div>',
				'<div margin-top:12px;>',
					tip.text,
				'</div>',
			'</div>'
		) );
		
		$('body').append( S(
			'<iframe id="tipframe" style="position:absolute; top:', top, 'px; left:', left, 'px; width:', width, 'px; height:', $('#infotip').height(), 'px; border:0" frameborder="0">',
			'</iframe>'
		) );
		
		$('#infoclose').click( function() { showInfoTip( false ); })
		$(document).bind( 'keydown', infoTipKeyDown ).bind( 'mousedown', infoTipMouseDown );
	}
	else {
		$(document).unbind( 'keydown', infoTipKeyDown ).unbind( 'mousedown', closeInfoTip );
		$infotip.remove();
		$('#tipframe').remove();
	}
}

function infoTipKeyDown( event ) {
	if( event.keyCode == 27 )
		closeInfoTip();
}

function infoTipMouseDown( event ) {
	if( ! $(event.target).is('a') )
		closeInfoTip();
}

function closeInfoTip() {
	showInfoTip( false );
}

(function() {
	var $window = $(window), ww = $window.width(), wh = $window.height();
	var fh = 20;
	document.body.scroll = 'no';
	var html = mapplet ? S(
		//'<style type="text/css">',
		//	'* { font-family: Arial,sans-serif; font-size: 10pt; }',
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
	) : S(
		'<style type="text/css">',
			'html, body { margin:0; padding:0; border:0 none; overflow:hidden; height:100%; }',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#map { width:', ww, 'px; height:', wh - fh, 'px; }',
			'#eventbar { display:none; }',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { font-size:11pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'a.delbox { background-position:-60px 0px; float:right; height:12px; overflow:hidden; position:relative; width:12px; background-image:url(http://img0.gmodules.com/ig/images/sprite_arrow_enlarge_max_min_shrink_x_blue.gif); }',
			'a.delbox:hover { background-position:-60px -12px; }',
			'.credits {}',
			'.credits .credit { margin-top:8px; }',
			'.credits .source { margin-left:16px; }',
			'#footer { width:', ww, 'px; height:', fh, 'px; text-align:center; padding-top:2px; background-color:#FBE6B6; overflow:hidden; }',
			'#footer, #footer * { font-size:15px; }',
			'#footer a { font-weight:bold; }',
			'img[src="http://maps.google.com/intl/en_us/mapfiles/iw_close.gif"] { display:none; }',
		'</style>',
		'<div id="outer">',
			'<div id="map">',
			'</div>',
			'<div id="footer">',
				'See more maps in the <a href="http://maps.google.com/elections" target="_blank">Google Maps Elections Gallery</a>',
			'</div>',
		'</div>'
	);
	document.write( html );
})();

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
		map.addControl( new CreditsControl() );
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
	var url = 'http://elections.s3.amazonaws.com/twitter/tweets-latest.js';
	_IG_FetchContent( url, function( t ) {
		tweets.array = tweets.array.concat( eval( '(' + t + ')' ) );
		if( tweets.array.length > tweets.max * 2 ) {
			var cut = tweets.array.length - tweets.max;
			tweets.index = Math.max( 0, tweets.index - cut );
			tweets.array = tweets.array.slice( -tweets.max );
		}
		openTweet();
	}, {
		refreshInterval: 120
	});
}

function openTweet() {
	var tweet = tweets.array[tweets.index];
	var latlng = new GLatLng( tweet.lat, tweet.lon );
	var bubble = tweetBubble(tweet);
	map.openInfoWindowHtml( latlng, bubble, {
		maxWidth: 300,
		disableGoogleLinks: true,
		noCloseOnClick: true
	});
	
	tweets.setTimer();
}

function tweetBubble( tweet ) {
	function link( text, which, yes ) {
		return yes ? S( '<a href="javascript:tweets.', which, '()">', text, '</a>' ) : '';
	}
	var img = ! tweet.image ? '' : S(
		'<img ',
			'style="border:1px solid black; float:left; width:48px; height:48px; margin:0 6px 6px 0; vertical-align:top;" ',
			'src="', tweet.image, '" />'
	);
	var author = ! tweet.author || tweet.author == tweet.user ? '' : S( '<span>', htmlClean(tweet.author), '</span>' );
	return S(
		'<div style="font-family: Arial,sans-serif; font-size: 10pt;">',
			img,
			'<span style="font-weight:bold;">',
				'<a target="_blank" href="http://twitter.com/', htmlClean(tweet.user), '">', htmlClean(tweet.user), '</a>',
			'</span>',
			' ', author, ' ',
			htmlClean(tweet.where),
			'<div>',
				atLinks( httpLinks( htmlClean(tweet.message) ) ),
				//atLinks( httpLinks( htmlClean(tweet.message) ) ),
			'</div>',
			//'<div id="statusupdated">less than a minute ago in WWW</div>
			'<div style="margin-top:0.25em;">',
				'<div style="float:left;">',
					link( '&lt;&nbsp;Previous', 'previous', tweets.index > 0 ),
				'</div>',
				'<div style="float:right;">',
					link( 'Next&nbsp;&gt;', 'next', tweets.index < tweets.array.length - 1 ),
				'</div>',
				'<div style="clear:both;">',
				'</div>',
				//atLinks( httpLinks( htmlClean(tweet.message) ) ),
			'</div>',
		'</div>'
	);
}

})( jQuery );
