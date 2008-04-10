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

Array.prototype.mapjoin = function( fun, delim ) {
	return this.map( fun ).join( delim || '' );
};

if( ! Array.prototype.index ) {
	Array.prototype.index = function( field ) {
		this.by = {};
		if( field ) {
			var by = this.by[field] = {};
			for( var i = 0, n = this.length;  i < n;  ++i ) {
				var obj = this[i];
				by[obj[field]] = obj;
				obj.index = i;
			}
		}
		else {
			var by = this.by;
			for( var i = 0, n = this.length;  i < n;  ++i ) {
				by[ this[i] ] = i;
			}
		}
		return this;
	};
}

Object.sort = function( input, key, numeric ) {
	var sep = unescape('%uFFFF');
	
	var i = 0, n = input.length, sorted = [];
	if( numeric ) {
		if( typeof key == 'function' ) {
			for( ;  i < n;  ++i )
				sorted[i] = [ ( 1000000000000000 + key(input[i]) + '' ).slice(-15), i ].join(sep);
		}
		else {
			for( ;  i < n;  ++i )
				sorted[i] = [ ( 1000000000000000 + input[i][key] + '' ).slice(-15), i ].join(sep);
		}
	}
	else {
		if( typeof key == 'function' ) {
			for( ;  i < n;  ++i )
				sorted[i] = [ key(input[i]), i ].join(sep);
		}
		else {
			for( ;  i < n;  ++i )
				sorted[i] = [ input[i][key], i ].join(sep);
		}
	}
	
	sorted.sort();
	
	var output = [];
	for( i = 0;  i < n;  ++i )
		output[i] = input[ sorted[i].split(sep)[1] ];
	
	return output;
};

String.prototype.trim = function() {
	return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
};

String.prototype.words = function( fun ) {
	this.split(' ').forEach( fun );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
}

function join( array, delim ) {
	return Array.prototype.join.call( array, delim || '' );
}

jQuery.fn.html = function( a ) {
	if( a == null ) return this[0] && this[0].innerHTML;
	return this.empty().append( join( a.charAt ? arguments : a ) );
};

// hoverize.js
// Based on hoverintent plugin for jQuery

(function( $ ) {
	
	var opt = {
		slop: 7,
		interval: 200
	};
	
	function start() {
		if( ! timer ) {
			timer = setInterval( check, opt.interval );
			$(document.body).bind( 'mousemove', move );
		}
	}
	
	function clear() {
		if( timer ) {
			clearInterval( timer );
			timer = null;
			$(document.body).unbind( 'mousemove', move );
		}
	}
	
	function check() {
		if ( ( Math.abs( cur.x - last.x ) + Math.abs( cur.y - last.y ) ) < opt.slop ) {
			clear();
			for( var i  = 0,  n = functions.length;  i < n;  ++i )
				functions[i]();
		}
		else {
			last = cur;
		}
	}
	
	function move( e ) {
		cur = { x:e.screenX, y:e.screenY };
	}
	
	var timer, last = { x:0, y:0 }, cur = { x:0, y:0 }, functions = [];
	
	hoverize = function( fn, fast ) {
		
		function now() {
			fast && fast.apply( null, args );
		}
		
		function fire() {
			clear();
			return fn.apply( null, args );
		}
		functions.push( fire );
		
		var args;
		
		return {
			clear: clear,
			
			now: function() {
				args = arguments;
				now();
				fire();
			},
			
			hover: function() {
				args = arguments;
				now();
				start();
			}
		};
	}
})( jQuery );

(function( $ ) {

var opt = window.GoogleElectionMapOptions || {};
var mapplet = opt.mapplet;

if( opt.gadget ) {
	var p = new _IG_Prefs();
	opt.sidebarWidth = p.getInt('sidebarwidth');
	opt.zoom = p.getInt('zoom');
	opt.mapWidth = window.innerWidth - opt.sidebarWidth;
	opt.mapHeight = window.innerHeight;
	if( window.innerWidth < 500 ) {
		opt.mapWidth = opt.sidebarWidth = window.innerWidth;
		opt.mapHeight = opt.sidebarHeight = ( window.innerHeight - 4 ) / 2;
	}
}

opt.zoom = opt.zoom || 3;
opt.sidebarWidth = opt.sidebarWidth || 280;
opt.mapWidth = opt.mapWidth || 400;
opt.mapHeight = opt.mapHeight || 300;

opt.mapWidth = ( '' + opt.mapWidth ).replace( /px$/, '' );
opt.mapHeight = ( '' + opt.mapHeight ).replace( /px$/, '' );

opt.imgUrl = opt.imgUrl || 'http://primary-maps-2008.googlecode.com/svn/trunk/images/';

opt.gadgetXML = opt.gadgetXML || 'http://primary-maps-2008.googlecode.com/svn/trunk/campaign-trail-gadget.xml';

function adjustHeight() {
	if( mapplet )
		_IG_AdjustIFrameHeight();
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 120;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

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

function percent( n ) {
	n = Math.round( n * 100 );
	return n ? n + '%' : '';
}

// calendar.google.com feed template:
// http://www.google.com/calendar/feeds/{candidate.feed}%40group.calendar.google.com/public/basic

var candidates = [
	{ 'name': 'clinton', 'lastName': 'Clinton', 'fullName': 'Hillary Clinton', 'feed': '2jmb4ula0um5138qnfk621nagg' },
	{ 'name': 'mccain', 'lastName': 'McCain', 'fullName': 'John McCain', 'feed': 'q1du1ju69m8jecsjkhjr538kbs' },
	{ 'name': 'obama', 'lastName': 'Obama', 'fullName': 'Barack Obama', 'feed': 'nkt5atdq7cdbes3ehdfpendpnc' }
].index('name');

candidates.forEach( function( candidate ) {
	var name = candidate.name;
	candidate.iconUrl = imgUrl( name + '-icon-border' );
	
	var icon = candidate.gicon = new GIcon(G_DEFAULT_ICON);
	icon.image = imgUrl( name + '-pin' );
	icon.iconSize = new GSize( 22, 40 );
	icon.shadowSize = new GSize( 40, 40 );
	icon.iconAnchor = new GPoint( 11, 40 );
	icon.infoWindowAnchor = new GPoint( 11, 0 );
});

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
	
	//var mapplet = ! window.GBrowserIsCompatible;
	
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

function fetchMultiXml( urls, callback ) {
	var results = [], n = urls.length;
	urls.forEach( function( url, i ) {
		_IG_FetchXmlContent( url, function( xml ) {
			results[i] = xml;
			if( ! --n ) callback( results );
		});
	});
}

var shortMonths = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').index();

function fmtDate( date ) {
	var d = date.split('-');
	if( d.length != 2 ) return date;
	return shortMonths[ d[0] - 1 ] + ' ' + (+d[1]);
}

if( mapplet ) writeMappletHTML();
else writeApiMapHTML();

function writeCSS() {
	document.write(
		'<style type="text/css">',
			'body { margin:0; padding:0; }',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { xfont-size:14pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; margin:2px 4px 2px 2px; }',
			'.Video { margin-top:4px; }',
			'.VideoHeading { xfont-size:125%; }',
			'.VideoTitle { xfont-size:110%; }',
			'.VideoThumb { float:left; margin-right:8px; }',
			'.VideoBorder { clear:left; }',
			'.votesattrib * { font-size:85%; }',
			'#legend table { xwidth:100%; }',
			'#legend .legendboxtd { width:1%; }',
			'#legend .legendnametd { xfont-size:24px; xwidth:18%; }',
			'#legend .legendbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
			'#legend .legendname { xfont-size:12pt; white-space:pre; }',
			'#legend .legendvotestd { text-align:right; width:5em; }',
			'#legend .legendpercenttd { text-align:right; width:2em; }',
			'#legend .legendvotes, #legend .legendpercent { xfont-size:10pt; margin-right:6px; }',
			'#legend .legendclear { clear:left; }',
			'#legend .legendreporting * { xfont-size:20px; }',
			'.uftl {border:1px solid white;border-bottom:none;}',
			'.uftl_reverse_directionality {border:1px solid white;border-bottom:none;clear: right;text-align: right;}',
			'.uftl{padding:4px 0px 4px 0px;border:1px solid #fff;}',
			'.uftl_reverse_directionality{padding:4px 0px 4px 0px;border:1px solid #fff;clear:right;text-align:right;}',
			'.fbox,.fmaxbox, .fmaxbox_reverse_directionality,.fminbox, .fminbox_reverse_directionality,a.fmaxbox:hover, a.fmaxbox_reverse_directionality:hover,a.fminbox:hover, a.fminbox_reverse_directionality:hover {background-image: url("http://img0.gmodules.com/ig/images/max_min_dark_blue.gif");width:12px;height:12px;}',
			'.fmaxbox, .fmaxbox_reverse_directionality {background-position:0px 0px;}',
			'.fminbox, .fminbox_reverse_directionality {background-position:-12px 0px;}',
			'a.fmaxbox:hover, a.fmaxbox_reverse_directionality:hover{background-position:0px -12px;}',
			'a.fminbox:hover, a.fminbox_reverse_directionality:hover{background-position:-12px -12px;}',
			'a.fmaxbox,a.fminbox{float:left;margin-right:4px;margin-top:2px;width:12px;height:12px;display:block;overflow:hidden;}',
			'a.fmaxbox_reverse_directionality,a.fminbox_reverse_directionality{float:right;margin-left:4px;margin-top:2px;width:12px;height:12px;display:block;overflow:hidden;}',
			'.fpad{padding-top:5px;padding-bottom:2px;padding-left:3%;padding-right:2%;width:92%;overflow:auto;}',
		'</style>'
	);
}

function writeMappletHTML() {
	writeCSS();
	document.write(
		'<div id="outer">',
			'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
				'<span style="color:red;">New!</span> ',
				'<a href="http://gmodules.com/ig/creator?synd=open&url=', opt.gadgetXML, '" target="_blank">Get this map for your website</a>',
			'</div>',
			'<div id="eventlist">',
				'Loading&#8230;',
			'</div>',
			//'<div id="videos" style="margin-top:8px;">',
			//'</div>',
			'<div id="news" style="margin-top:6px;">',
			'</div>',
		'</div>'
	);
}

function writeApiMapHTML() {
	writeCSS();
	var mapWidth = opt.mapWidth ? opt.mapWidth + 'px' : '100%';
	var mapHeight = opt.mapHeight ? opt.mapHeight + 'px' : '100%';
	var mapHTML = S(
		'<div id="map" style="margin:0; padding:0; width:', mapWidth, '; height:', mapHeight, ';">',
		'</div>'
	);
	var sidebarHTML = S(
		'<div id="resultlist">',
		'</div>',
		'<div id="votesbar">',
			'<div id="eventlist">',
				'Loading&#8230;',
			'</div>',
			'<div id="results">',
				//'Roll the mouse over the map for county-by-county results.<br /><br />',
				//'Roll the mouse over the map for state-by-state results.<br />',
				//'Zoom in for county-by-county results.<br /><br />',
				//'Scroll down for statewide details',
			'</div>',
		'</div>'
	);
	//document.write(
	//	'<style type="text/css">',
	//		'body { margin:0; padding:0; }',
	//		'* { font-family: Arial,sans-serif; font-size: 10pt; }',
	//		'#outer {}',
	//		'#eventbar { display:none; }',
	//		'#links { margin-bottom:4px; }',
	//		'#news { margin-top:4px; padding:4px; }',
	//		'#clicknote { display:none; }',
	//		'h2 { font-size:11pt; margin:0; padding:0; }',
	//		'#loading { font-weight:normal; }',
	//		'.NewsHeading { padding-left:4px; }',
	//		'.NewsList { background-color:white; padding:2px; margin:4px; }',
	//		'.NewsList a { text-decoration:none; }',
	//		'.NewsList  a:hover { text-decoration:underline; }',
	//		'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
	//		'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
	//		'.statewide * { font-weight: bold; }',
	//		'.votesattrib * { font-size:85%; }',
	//		'#legend table { xwidth:100%; }',
	//		'#legend .legendboxtd { width:7%; }',
	//		'#legend .legendnametd { xfont-size:24px; xwidth:18%; }',
	//		'#legend .legendbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
	//		'#legend .legendname { xfont-size:12pt; white-space:pre; }',
	//		'#legend .legendvotestd { text-align:right; width:5em; }',
	//		'#legend .legendpercenttd { text-align:right; width:2em; }',
	//		'#legend .legendvotes, #legend .legendpercent { xfont-size:10pt; margin-right:4px; }',
	//		'#legend .legendclear { clear:left; }',
	//		'#legend .legendreporting { margin-bottom:8px; }',
	//		'#legend .legendreporting * { xfont-size:20px; }',
	//	'</style>'
	//);
	
	if( opt.sidebarHeight ) {
		document.write(
			mapHTML,
			'<div style="margin-top:4px; width:', opt.sidebarWidth, 'px; height:', opt.sidebarHeight, 'px; overflow:auto;">',
				'<div style="width:99%;">',
					sidebarHTML,
				'</div>',
			'</div>'
		);
	}
	else {
		document.write(
			'<table cellspacing="0" cellpadding="0">',
				'<tr valign="top">',
					'<td>',
						mapHTML,
					'</td>',
					'<td valign="top" style="width:', opt.sidebarWidth, 'px;">',
						'<div style="margin-left:4px; width:100%; height:100%; overflow:auto;">',
							sidebarHTML,
						'</div>',
					'</td>',
				'</tr>',
			'</table>'
		);
	}
}

var map;

function load() {

	if( mapplet ) {
		map = new GMap2;
	}
	else {
		if( ! GBrowserIsCompatible() ) return;
		map = new GMap2( $('#map')[0] );
		map.enableContinuousZoom();
		map.enableDoubleClickZoom();
		map.enableScrollWheelZoom();
		//map.addControl( new GLargeMapControl() );
		map.addControl( new GSmallMapControl() );
		var center = new GLatLng( 37.0625, -95.677068 );
		map.setCenter( center, opt.zoom );
	}
	
	getCandidateCalendars();
	adjustHeight();
}

function imgUrl( name ) {
	return opt.imgUrl + name + '.png';
}

function getCandidateCalendars() {
	var urls = candidates.map( function( candidate ) {
		return cacheUrl( S( 'http://www.google.com/calendar/feeds/', candidate.feed, '%40group.calendar.google.com/public/basic' ), 3600, true );
	});
	fetchMultiXml( urls, function( feeds ) {
		var events = feedEvents( feeds );
		$('#eventlist').html( listEvents( events ) );
		adjustHeight();
		markEvents( events );
	});
}

function feedEvents( feeds ) {
	events = [];
	feeds.forEach( function( feed, i ) {
		$('feed>entry',feed).each( function() {
			var lat = $('extendedProperty[name=NYTlatitude]',this).attr('value');
			var lng = $('extendedProperty[name=NYTlongitude]',this).attr('value');
			if( ! lat  ||  lat == 'None'  ||  ! lng  ||  lng == 'None' ) return;
			var summary = $('summary',this).text();
			var date = feedDate( summary );
			if( ! date ) return;
			//var midnight = new Date().setHours( 0, 0, 0, 0 );
			//if( date < midnight ) return;
			var event = {
				id: $('id',this).text(),
				candidate: candidates[i],
				latlng: new GLatLng( +lat, +lng ),
				date: date.date,
				dateText:date.text,
				title: $('title',this).text(),
				cal: $('link[rel=alternate]',this).attr('href'),
				summary: summary,
				content: $('content',this).text()
			};
			event.balloon = eventBalloon( event );
			events.push( event );
		});
	});
	return events = Object.sort( events, 'date', true ).index('id').reverse();
}

 // When: 2008-03-19...
 // When: 2008-03-19 11:15am to 12:15pm...
 // When: Fri Mar 14, 2008...
 // When: Fri Mar 14, 2008 7pm to 8:30pm...
 // When: Fri Mar 14, 2008 7:00pm to 8:00pm...
 // When: Fri Mar 14, 2008 19:00 to 20:00...
 // When: Fri Mar 14, 2008 19:00 to Fri Mar 14, 2008 20:00...

function feedDate( text ) {
	function num( i ) { return +( match[i] || 0 ); }
	var match = text.match(
		/^When: *(((\d{4})-(\d{1,2})-(\d{1,2})|\w{3} +(\w{3}) +(\d{1,2}), +(\d{4}))( +(\d{1,2})(:(\d{2}))? ?(am|pm)?( +to +(\w{3} +\w{3} +\d{1,2}, +\d{4} +)?(\d{1,2})(:(\d{2}))? ?(am|pm)?))?)/ );
	if( ! match ) return badDate( text );
	var year = num(3), month, day, hour, minute;
	if( year ) {
		month = num(4);
		day = num(5);
	}
	else {
		month = shortMonths.by[ match[6] ];
		if( month == null ) return badDate( text );
		day = num(7);
	}
	hour = num(10) + ( match[13] == 'pm' ? 12 : 0 );
	minute = num(12);
	return {
		date: new Date( year, month, day, hour, minute ).getTime(),
		text: match[1],
		match: match
	};
}

function badDate( text ) {
	window.console && console.log && console.log( 'Bad date:', text );
}

function markEvents( events ) {
	events.forEach( function( event ) {
		event.marker = new GMarker( event.latlng, {
			icon: event.candidate.gicon,
			title: S( event.title, ' - ', event.dateText )
		});
		map.addOverlay( event.marker );
	});
	setTimeout( function() {
		events.forEach( function( event ) {
			eventInfoWindow( event, 'bindInfoWindow' );
		});
	}, 250 );
}

openEvent = function( id ) {
	var event = events.by.id[id];
	if( event )
		eventInfoWindow( event, 'openInfoWindow' );
};

function eventInfoWindow( event, method ) {
	event.marker[method]( event.balloon, {
		maxWidth: Math.min( opt.mapWidth - 100, 400 ),
		disableGoogleLinks: true
	});
}

function listEvents( events ) {
	return S(
		'<div class="eventwrapper">',
			events.mapjoin( function( event ) {
				return S(
					'<div style="cursor:pointer;" onclick="openEvent(\'', event.id, '\')">',
						'<div>',
							'<img style="vertical-align:middle; border:0; margin-right:4px; width:18px; height:18px;" src="', event.candidate.iconUrl, '" />',
							'<span style="vertical-align:middle; font-weight:bold;">',
								event.title,
							'</span>',
						'</div>',
						'<div style="margin-bottom:6px;">',
							event.dateText,
						'</div>',
					'</div>'
				);
			}),
		'</div>'
	);
}

function eventBalloon( event ) {
	return S(
		'<div>',
			'<img style="vertical-align:middle; border:0; margin-right:4px; width:18px; height:18px;" src="', event.candidate.iconUrl, '" />',
			'<span style="vertical-align:middle; font-size:11pt; font-weight:bold;">',
				event.title,
			'</span>',
		'</div>',
		'<div style="margin-top:12px; font-size:10pt;">',
			event.content
				.replace( /<br>Event Status: confirmed/, '' )
				.replace( /Event Description:.*<\/a>/, '' ),
		'</div>'
	);
}

$(window).bind( 'load', load ).bind( 'onunload', GUnload );

})( jQuery );
