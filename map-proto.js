var ChartApi = {
	chart: function(  a ) {
		return this.url( a );
	},
	
	barH: function( a ) {
		return this.chart({
			cht: 'bhs',
			chco: a.colors.join(),
			chd: 't:' + a.data.join(),
			chds: a.scale.join(),
			chl: a.labels.join('|'),
			chs: a.width + 'x' + a.height,
			chtt: a.title
		});
	},
	
	barV: function( a ) {
		return this.chart({
			cht: 'bvs',
			chco: a.colors.join(),
			chd: 't:' + a.data.join(),
			chds: a.scale.join(),
			chl: a.labels.join('|'),
			chs: a.width + 'x' + a.height,
			chtt: a.title,
			chbh: a.barWidth.join()
		});
	},
	
	line: function( a ) {
		return this.chart({
			cht: 'lc',
			chco: a.colors.join(),
			chd: 't:' + a.data.join(),
			chds: a.scale.join(),
			chl: a.labels.join('|'),
			chs: a.width + 'x' + a.height,
			chtt: a.title
		});
	},
	
	pie3d: function( a ) {
		return this.chart({
			cht: 'p3',
			chco: a.colors.join(),
			chd: 't:' + a.data.join(),
			chds: a.scale.join(),
			chl: a.labels.join('|'),
			chs: a.width + 'x' + a.height,
			chtt: a.title
		});
	},
	
	rainbow: function( a ) {
		var img = this.chart({
			cht: 'bhs',
			chco: a.colors.join(),
			chd: 't:' + a.data.join('|'),
			chds: a.scale && a.scale.join(),
			chs: [ a.width + 1, a.height + 5 ].join('x')
		});
		var alt = ! a.alt ? '' : S( 'title="', a.alt, '" ' );
		return S(
			'<span style="display:block; ', alt, 'width:', a.width, 'px; height:', a.height, 'px; background-position:-1px 0; background-repeat:no-repeat; background-image:url(\'', img, '\');">',
			'</span>'
		);
	},
	
	sparkbar: function( a ) {
		var img = this.chart({
			cht: 'bhg',
			chbh: [ a.barHeight, a.barSpace, a.groupSpace || a.barSpace ].join(),
			chco: a.colors.join('|'),
			chf: a.background,
			chds: a.scale.join(),
			chd: 't:' + a.data.join(','),
			chs: [ a.width + 1, a.height + 5 ].join('x')
		});
		return S(
			'<span style="display:block; width:', a.width, 'px; height:', a.height, 'px; background-position:-1px -2px; background-repeat:no-repeat; background-image:url(\'', img, '\');">',
			'</span>'
		);
	},
	
	sparkline: function( a ) {
		return this.chart({
			cht: 'ls',
			chco: a.colors.join(),
			chd: 't:' + a.data.join('|'),
			chds: a.scale.join(),
			chl: a.labels && a.labels.join('|'),
			chs: a.width + 'x' + a.height,
			chtt: a.title,
			chf: a.solid,
			chm: a.fill
		});
	},
	
	url: function( a ) {
		var params = [];
		for( k in a )
			if( a[k] != null )
				params.push( k + '=' + /*encodeURIComponent(*/ a[k].replace( '&', '&amp;' ).replace( '+', '%2B' ).replace( ' ', '+' ) /*)*/ );
		params.sort();
		return 'http://chart.apis.google.com/chart?' + params.join('&');
	}
};

var IconFactory = { icons:{} };

IconFactory.createMarkerIcon = function(opts) {
	var height = opts.height || 32;
	var width = opts.width || height;
	var primaryColor = opts.primaryColor || "#ff0000";
	var cornerColor = opts.cornerColor || primaryColor;
	var strokeColor = opts.strokeColor || "#000000";
	
	var key = [ width, height, primaryColor, strokeColor, cornerColor ].join('|');
	var icon = IconFactory.icons[key];
	if( icon ) return icon;
	
	var baseUrl = "http://chart.apis.google.com/chart?cht=mm";
	var iconUrl = baseUrl + "&chs=" + width + "x" + height + 
		"&chco=" + cornerColor.replace("#", "") + "," + primaryColor.replace("#", "") + "," + strokeColor.replace("#", "") + "&ext=.png";
	icon = new GIcon(G_DEFAULT_ICON);
	icon.image = iconUrl;
	icon.iconSize = new GSize(width, height);
	icon.shadowSize = new GSize(Math.floor(width*1.6), height);
	//icon.shadowSize = new GSize( 0, 0 );
	icon.iconAnchor = new GPoint(width/2, height);
	icon.infoWindowAnchor = new GPoint(width/2, Math.floor(height/12));
	icon.printImage = iconUrl + "&chof=gif";
	icon.mozPrintImage = iconUrl + "&chf=bg,s,ECECD8" + "&chof=gif";
	var iconUrl = baseUrl + "&chs=" + width + "x" + height + 
		"&chco=" + cornerColor.replace("#", "") + "," + primaryColor.replace("#", "") + "," + strokeColor.replace("#", "");
	icon.transparent = iconUrl + "&chf=a,s,ffffff01&ext=.png";

	icon.imageMap = [
		width/2, height,
		(7/16)*width, (5/8)*height,
		(5/16)*width, (7/16)*height,
		(7/32)*width, (5/16)*height,
		(5/16)*width, (1/8)*height,
		(1/2)*width, 0,
		(11/16)*width, (1/8)*height,
		(25/32)*width, (5/16)*height,
		(11/16)*width, (7/16)*height,
		(9/16)*width, (5/8)*height
	];
	for (var i = 0; i < icon.imageMap.length; i++) {
		icon.imageMap[i] = parseInt(icon.imageMap[i]);
	}
	
	IconFactory.icons[key] = icon;
	
	return icon;
}

// TODO: combine this with code above

function getPinImage( color ) {
	color = color.replace( /#/, '' );
	var width = 24, height = 24;
	return S( 'http://chart.apis.google.com/chart?cht=mm&chs=', width, 'x', height, '&chco=', color, ',', color, ',', '000000', '&ext=.png' );
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
				var str = this[i];
				by[str] = str;
				str.index = i;
			}
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
}

function join( array, delim ) {
	return Array.prototype.join.call( array, delim || '' );
}

jQuery.fn.html = function( a ) {
	if( a == null ) return this[0] && this[0].innerHTML;
	return this.empty().append( join( a.charAt ? arguments : a ) );
};

/**
 * jQuery.ScrollTo
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Date: 2/19/2008
 *
 * @projectDescription Easy element scrolling using jQuery.
 * Tested with jQuery 1.2.1. On FF 2.0.0.11, IE 6, Opera 9.22 and Safari 3 beta. on Windows.
 *
 * @author Ariel Flesler
 * @version 1.3.3
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object} settings Hash of settings, optional.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @example $('div').scrollTo( 340 );
 *
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { offset:-20 } );
 *
 * Notes:
 *  - jQuery.scrollTo will make the whole window scroll, it accepts the same arguments as jQuery.fn.scrollTo.
 *	- If you are interested in animated anchor navigation, check http://jquery.com/plugins/project/LocalScroll.
 *	- The options margin, offset and over are ignored, if the target is not a jQuery object or a DOM element.
 *	- The option 'queue' won't be taken into account, if only 1 axis is given.
 */
;(function( $ ){

	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$scrollTo.window().scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'y',
		duration:1
	};

	//returns the element that needs to be animated to scroll the window
	$scrollTo.window = function(){
		return $( $.browser.safari ? 'body' : 'html' );
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		settings = $.extend( {}, $scrollTo.defaults, settings );
		duration = duration || settings.speed || settings.duration;//speed is still recognized for backwards compatibility
		settings.queue = settings.queue && settings.axis.length > 1;//make sure the settings are given right
		if( settings.queue )
			duration /= 2;//let's keep the overall speed, the same.
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this.each(function(){
			var elem = this, $elem = $(elem),
				t = target, toff, attr = {},
				win = $elem.is('html,body');
			switch( typeof t ){
				case 'number'://will pass the regex
				case 'string':
					if( /^([+-]=)?\d+(px)?$/.test(t) ){
						t = both( t );
						break;//we are done
					}
					t = $(t,this);// relative selector, no break!
				case 'object':
					if( t.is || t.style )//DOM/jQuery
						toff = (t = $(t)).offset();//get the real position of the target 
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					act = elem[key],
					Dim = axis == 'x' ? 'Width' : 'Height',
					dim = Dim.toLowerCase();

				if( toff ){//jQuery/DOM
					attr[key] = toff[pos] + ( win ? 0 : act - $elem.offset()[pos] );

					if( settings.margin ){//if it's a dom element, reduce the margin
						attr[key] -= parseInt(t.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(t.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;//add/deduct the offset
					
					if( settings.over[pos] )//scroll to a fraction of its width/height
						attr[key] += t[dim]() * settings.over[pos];
				}else
					attr[key] = t[pos];//remove the unnecesary 'px'

				if( /^\d+$/.test(attr[key]) )//number or 'number'
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max(Dim) );//check the limits

				if( !i && settings.queue ){//queueing each axis is required					
					if( act != attr[key] )//don't waste time animating, if there's no need.
						animate( settings.onAfterFirst );//intermediate animation
					delete attr[key];//don't animate this axis again in the next iteration.
				}
			});			
			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target);
				});
			};
			function max( Dim ){
				var el = win ? $.browser.opera ? document.body : document.documentElement : elem;
				return el['scroll'+Dim] - el['client'+Dim];
			};
		});
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );

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

GoogleElectionMap = {
	Demographics: function( data ) {
		Demographics = data;  // temp hack
	},
	shapesReady: function( data ) {
		var abbr = data.state;
		var state = stateByAbbr( abbr );
		state.places = data.places.index('name');
		//console.log( state );
		if( abbr == 'us' )
			initStateBounds( state.places );
		if( abbr == opt.state )
			loadScript( S( opt.dataUrl, 'votes/', abbr.toLowerCase(), '_', curParty.name, '.js' ), 120 );
	},
	votesReady: function( votes ) {
		var abbr = votes.state;
		var state = stateByAbbr( abbr );
		( state.votes = state.votes || {} )[curParty.name] = votes;
		stateReady( state );
	},
	zoomToState: function( abbr ) {
		setState( abbr );
	}
};

function initStateBounds( places ) {
	places.forEach( function( place ) {
		statesByName[place.name].bounds = place.bounds;
	});
}

if( opt.gadget ) {
	var p = new _IG_Prefs();
	opt.sidebarWidth = p.getInt('sidebarwidth');
	opt.mapWidth = window.innerWidth - opt.sidebarWidth ;
	opt.mapHeight = window.innerHeight;
	opt.state = p.getString('state');
	opt.party = p.getString('party');
	opt.stateSelector = p.getBool('stateselector');
	opt.partySelector = p.getBool('partyselector');
	//opt.twitter = p.getBool('twitter');
	//opt.youtube = p.getBool('youtube');
	if( window.innerWidth < 500 ) {
		opt.mapWidth = opt.sidebarWidth = window.innerWidth;
		opt.mapHeight = opt.sidebarHeight = ( window.innerHeight - 24 ) / 2;
	}
}

opt.twitter = false;
opt.youtube = false;

opt.zoom = opt.zoom || 3;
opt.sidebarWidth = opt.sidebarWidth || 280;
opt.mapWidth = opt.mapWidth || 400;
opt.mapHeight = opt.mapHeight || 300;

opt.mapWidth = ( '' + opt.mapWidth ).replace( /px$/, '' );
opt.mapHeight = ( '' + opt.mapHeight ).replace( /px$/, '' );

if( opt.stateSelector == null ) opt.stateSelector = true;
if( opt.partySelector == null ) opt.partySelector = true;

opt.tileUrl = opt.tileUrl || 'http://gmodules.com/ig/proxy?max_age=3600&url=http://election-map-tiles-1.s3.amazonaws.com/boundaries/';

//opt.twitter = opt.twitter || mapplet;
//opt.youtube = opt.youtube || mapplet;

opt.infoType = 'stateVotes';

//var imgBaseUrl = 'http://mg.to/iowa/server/images/';
var imgBaseUrl = opt.imgBaseUrl || 'http://primary-maps-2008.googlecode.com/svn/trunk/images/';

var parties = [
	{ name: 'dem', shortName: 'Democratic', fullName: 'Democratic Party' },
	{ name: 'gop', shortName: 'Republican', fullName: 'Republican Party' }
].index('name');

var q = opt.party || location.search.slice(1);
window.curParty = parties.by.name[q] || parties[ Math.random() < .5 ? 0 : 1 ];

var infoTips = {
	stateVotes: {
		title: 'Statewide Vote Results',
		text: ''
	},
	countyVotes: {
		title: 'County Vote Results',
		text: ''
	},
	age: {
		title: 'Registered Voters by Age',
		text: "Barack Obama has generally drawn more support from younger voters, while Hillary Clinton&#8217;s base has come more from older voters. With 15 percent of its population 65 or older, Pennsylvania has the third most seniors in the country after Florida and West Virginia. The candidate who does a better job turning out their core age group could take a big step toward winning the primary."
	},
	population: {
		title: 'Population/Party Gain and Loss',
		text: "Based on the results of the primary next door in Ohio seven weeks ago, Clinton should be favored in the Keystone State, but Pennsylvania is a more diverse state in its patterns of growth. It has rural and metropolitan areas that are losing population, and fast-growing exurbs. For Obama to do well, he will likely have to do well not only in Philadelphia and Pittsburgh, but also in some of the faster-growing parts of the state."
	},
	religion: {
		title: 'Religion',
		text: "Both Obama and Clinton recently participated in a forum on issues of faith at Messiah College in Pennsylvania, a reminder of the role that religion plays in politics and campaigns. In this primary season so far, Obama has done well among Democratic primary voters who identify as Protestants and other denominations, but lagged among Catholics."
	},
	ethnic: {
		title: 'Racial and Ethnic Background',
		text: "Obama has had some difficulty winning a significant share of support of white voters in most of the 2008 Democratic presidential primaries, but at the same time he has overwhelmed Clinton about African-American voters in these contests."
	},
	gub2002: {
		title: 'Casey vs. Rendell 2002',
		text: "In 2002, state auditor general Bob Casey Jr. lost the Democratic gubernatorial primary to Philadelphia mayor Ed Rendell, who went on to win the statehouse in 2002. Casey carried 57 of the state&#8217;s 67 counties, but Rendell won because of his strength in the southeastern part of the state, especially the Philadelphia suburbs in Bucks, Delaware, Chester and Montgomery counties, where he carried more that 80 percent of the vote. This year, Rendell has endorsed Clinton and Casey is backing Obama. Whether Rendell can help Clinton hold down Obama&#8217;s margins in the Philadelphia area, where he is still popular, or Casey can give Obama a boost among his political base in western, central and northeastern Pennsylvania could be pivotal in this primary&#8217;s outcome."
	}
};

var states = [
	{
		'abbr': 'AL',
		'name': 'Alabama',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AK',
		'name': 'Alaska',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'AZ',
		'name': 'Arizona',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AR',
		'name': 'Arkansas',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CA',
		'name': 'California',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CO',
		'name': 'Colorado',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'CT',
		'name': 'Connecticut',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DE',
		'name': 'Delaware',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DC',
		'name': 'District of Columbia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'FL',
		'name': 'Florida',
		'parties': {
			'dem': { 'date': '01-29' },
			'gop': { 'date': '01-29' }
		}
	},
	{
		'abbr': 'GA',
		'name': 'Georgia',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'HI',
		'name': 'Hawaii',
		'parties': {
			'dem': { 'date': '02-19', 'type': 'caucus' },
			'gop': { 'date': '01-25', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ID',
		'name': 'Idaho',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '05-27' }
		}
	},
	{
		'abbr': 'IL',
		'name': 'Illinois',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'IN',
		'name': 'Indiana',
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'IA',
		'name': 'Iowa',
		'parties': {
			'dem': { 'date': '01-03', 'type': 'caucus' },
			'gop': { 'date': '01-03', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KS',
		'name': 'Kansas',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KY',
		'name': 'Kentucky',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'LA',
		'name': 'Louisiana',
		'parties': {
			'dem': { 'date': '02-09' },
			'gop': { 'date': '01-22', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ME',
		'name': 'Maine',
		'parties': {
			'dem': { 'date': '02-10', 'type': 'caucus' },
			'gop': { 'date': '02-01', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MD',
		'name': 'Maryland',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'MA',
		'name': 'Massachusetts',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MI',
		'name': 'Michigan',
		'parties': {
			'dem': { 'date': '01-15' },
			'gop': { 'date': '01-15' }
		}
	},
	{
		'abbr': 'MN',
		'name': 'Minnesota',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MS',
		'name': 'Mississippi',
		'parties': {
			'dem': { 'date': '03-11' },
			'gop': { 'date': '03-11' }
		}
	},
	{
		'abbr': 'MO',
		'name': 'Missouri',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MT',
		'name': 'Montana',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NE',
		'name': 'Nebraska',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'NV',
		'name': 'Nevada',
		'parties': {
			'dem': { 'date': '01-19', 'type': 'caucus' },
			'gop': { 'date': '01-19', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NH',
		'name': 'New Hampshire',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '01-08' },
			'gop': { 'date': '01-08' }
		}
	},
	{
		'abbr': 'NJ',
		'name': 'New Jersey',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NM',
		'name': 'New Mexico',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '06-03' }
		}
	},
	{
		'abbr': 'NY',
		'name': 'New York',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NC',
		'name': 'North Carolina',
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'ND',
		'name': 'North Dakota',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'OH',
		'name': 'Ohio',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'OK',
		'name': 'Oklahoma',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'OR',
		'name': 'Oregon',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'PA',
		'name': 'Pennsylvania',
		'parties': {
			'dem': { 'date': '04-22' },
			'gop': { 'date': '04-22' }
		}
	},
	{
		'abbr': 'PR',
		'name': 'Puerto Rico',
		'parties': {
			'dem': { 'date': '06-07' },
			//'gop': { 'date': '02-24' }
			'gop': { 'date': 'n/a' }
		}
	},
	{
		'abbr': 'RI',
		'name': 'Rhode Island',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'SC',
		'name': 'South Carolina',
		'parties': {
			'dem': { 'date': '01-26' },
			'gop': { 'date': '01-19' }
		}
	},
	{
		'abbr': 'SD',
		'name': 'South Dakota',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '06-03' }
		}
	},
	{
		'abbr': 'TN',
		'name': 'Tennessee',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'TX',
		'name': 'Texas',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'UT',
		'name': 'Utah',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'VT',
		'name': 'Vermont',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'VA',
		'name': 'Virginia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'WA',
		'name': 'Washington',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'WV',
		'name': 'West Virginia',
		'parties': {
			'dem': { 'date': '05-13' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'WI',
		'name': 'Wisconsin',
		'parties': {
			'dem': { 'date': '02-19' },
			'gop': { 'date': '02-19' }
		}
	},
	{
		'abbr': 'WY',
		'name': 'Wyoming',
		'parties': {
			'dem': { 'date': '03-08', 'type': 'caucus' },
			'gop': { 'date': '01-05', 'type': 'caucus' }
		}
	}
];

var stateUS = {
	'abbr': 'US',
	'name': 'United States',
	bounds: [
		[ -124.72846051, 24.54570037 ],
		[ -66.95221658, 49.38362494 ]
	]
};

var statesByAbbr = {};
var statesByName = {};
states.forEach( function( state ) {
	statesByAbbr[state.abbr] = state;
	statesByName[state.name] = state;
});

function stateByAbbr( abbr ) {
	return statesByAbbr[abbr.toUpperCase()] || stateUS;
}

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

function loadScript( url, cache ) {
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	script.src = cacheUrl( url );
	//console.log( 'loadScript', script.src );
	script.title = 'jsonresult';
	$('head')[0].appendChild( script );
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
// http://www.google.com/calendar/feeds/{candidate.feed}@group.calendar.google.com/public/basic

var candidates = {
	'all': [],
	'dem': [
		{ 'name': 'biden', 'lastName': 'Biden', 'fullName': 'Joe Biden', 'color': '#20FF1F', 'feed': '' },
		{ 'name': 'clinton', 'lastName': 'Clinton', 'fullName': 'Hillary Clinton', 'color': '#EEE600', 'feed': '2jmb4ula0um5138qnfk621nagg' },
		{ 'name': 'dodd', 'lastName': 'Dodd', 'fullName': 'Chris Dodd', 'color': '#E4Af95', 'feed': 'l06f7eei6qfjns5a4pd5nv6erg' },
		{ 'name': 'edwards', 'lastName': 'Edwards', 'fullName': 'John Edwards', 'color': '#FF1300', 'feed': '46uusesnavfh045mmfjje0fflo' },
		{ 'name': 'gravel', 'lastName': 'Gravel', 'fullName': 'Mike Gravel', 'color': '#8A5C2E', 'feed': '47r7phlvf8e07lga3poj0ntv8g' },
		{ 'name': 'kucinich', 'lastName': 'Kucinich', 'fullName': 'Dennis Kucinich', 'color': '#EE00B5', 'feed': '7c9gellom85djmbl6664s9cclc' },
		{ 'name': 'obama', 'lastName': 'Obama', 'fullName': 'Barack Obama', 'color': '#1700E8', 'feed': 'nkt5atdq7cdbes3ehdfpendpnc' },
		{ 'name': 'richardson', 'lastName': 'Richardson', 'fullName': 'Bill Richardson', 'color': '#336633', 'feed': 'mdgiev7eul12rt1lo6eohg55q0' },
		{ 'name': 'uncommitted-d', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#DDDDDD', 'feed': '' },
		{ 'name': 'total-d', 'lastName': 'Total Democratic', 'fullName': 'Total Democratic', 'color': '#000000', 'feed': '' }
	],
	'gop': [
		{ 'name': 'brownback', 'lastName': 'Brownback', 'fullName': 'Sam Brownback', 'color': '#8080FF', 'feed': 'lm63qmbqunob5gbvratl1bo974' },
		{ 'name': 'cort', 'lastName': 'Cort', 'fullName': 'Hugh Cort', 'color': '#8080FF' },
		{ 'name': 'cox', 'lastName': 'Cox', 'fullName': 'John Cox', 'color': '#808040' },
		{ 'name': 'curry', 'lastName': 'Curry', 'fullName': 'Jerry Curry', 'color': '#808040' },
		{ 'name': 'fendig', 'lastName': 'Fendig', 'fullName': 'Cap Fendig', 'color': '#408080' },
		{ 'name': 'gilbert', 'lastName': 'Gilbert', 'fullName': 'Daniel Gilbert', 'color': '#408080' },
		{ 'name': 'giuliani', 'lastName': 'Giuliani', 'fullName': 'Rudy Giuliani', 'color': '#336633', 'feed': 'g0tkl52ft6nhrlm2e6v6his400' },
		{ 'name': 'huckabee', 'lastName': 'Huckabee', 'fullName': 'Mike Huckabee', 'color': '#1700E8', 'feed': 'h32i31ojgo9vvb3vnggmq1qrh8' },
		{ 'name': 'hunter', 'lastName': 'Hunter', 'fullName': 'Duncan Hunter', 'color': '#8A5C2E', 'feed': '' },
		{ 'name': 'keyes', 'lastName': 'Keyes', 'fullName': 'Alan Keyes', 'color': '#8080FF', 'feed': '' },
		{ 'name': 'mccain', 'lastName': 'McCain', 'fullName': 'John McCain', 'color': '#1FCC15', 'feed': 'q1du1ju69m8jecsjkhjr538kbs' },
		{ 'name': 'paul', 'lastName': 'Paul', 'fullName': 'Ron Paul', 'color': '#E4Af95', 'feed': '7p20d17uil4ft2qhvattqrjdgg' },
		{ 'name': 'romney', 'lastName': 'Romney', 'fullName': 'Mitt Romney', 'color': '#FF1300', 'feed': '3mv48r8us0rou62c356om8groc' },
		{ 'name': 'tancredo', 'lastName': 'Tancredo', 'fullName': 'Tom Tancredo', 'color': '#EE00B5', 'feed': '' },
		{ 'name': 'thompson', 'lastName': 'Thompson', 'fullName': 'Fred Thompson', 'color': '#20FF1F', 'feed': 'fhg9gjvi7459qaf0ki43ij1g78' },
		{ 'name': 'tran', 'lastName': 'Tran', 'fullName': 'Hoa Tran', 'color': '#F0201F' },
		{ 'name': 'uncommitted-r', 'lastName': 'Uncommitted', 'fullName': 'Uncommitted', 'color': '#DDDDDD', 'feed': '' },
		{ 'name': 'total-r', 'lastName': 'Total Republican', 'fullName': 'Total Republican', 'color': '#000000', 'feed': '' }
	]
};

//var preloadCandidates = candidates.all.forEach( function( candidate ) {
//	var img = new Image( 16, 16 );
//	img.src = imgUrl( candidate.name );
//	return img;
//});

var candidateNameList = [];
parties.forEach( function( party ) {
	var list = candidates[party.name];
	list.forEach( function( candidate ) {
		candidate.party = party;
		candidates.all.push( candidate );
		candidateNameList.push( candidate.name );
	});
	list.index( 'name' );
});

candidates.all.index( 'name' );

var reCandidates = new RegExp( candidateNameList.join('|'), 'g' );

function candidateIcon( name ) {
	var icon = new GIcon;
	icon.image = imgUrl( name + '-border' );
	icon.shadow = '';
	icon.iconSize = new GSize( 18, 18 );
	icon.shadowSize = new GSize( 0, 0 );
	icon.iconAnchor = new GPoint( 9, 9 );
	icon.infoWindowAnchor = new GPoint( 9, 9 );
	return icon;
}

function loadCandidateIcons() {
	parties.forEach( function( party ) {
		candidates[party.name].forEach( function( candidate ) {
			candidate.icon = candidateIcon( candidate.name );
		});
	});
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

var partyButtons = '<div id="partyButtons"></div>';

function setPartyButtons() {
	if( ! opt.partySelector ) return;
	$('#partyButtons').html(
		curParty.name == 'dem' ? [
			'<div style="margin-top:8px;">',
				'<b>Democratic</b>',
				'<a href="#" style="margin-left:8px;" id="btnRep">Republican</a>',
				'<button style="margin-left:8px;" id="btnReload">Refresh</button>',
			'</div>'
		] : [
			'<div style="margin-top:8px;">',
				'<a href="#" style="margin-right:8px;" id="btnDem">Democratic</a>',
				'<b>Republican</b>',
				'<button style="margin-left:8px;" id="btnReload">Refresh</button>',
			'</div>'
		]
	);
	$('#votestitle').html(
		'<div>',
			'<b>', curParty.shortName, ' results</b>',
		'</div>',
		'<div>',
			'Size of map pin reflects number of votes',
		'</div>'
	);
}

var shortMonths = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

function fmtDate( date ) {
	var d = date.split('-');
	if( d.length != 2 ) return date;
	return shortMonths[ d[0] - 1 ] + ' ' + (+d[1]);
}

(function() {
	var hotStates = [ 'PA' ]/*.index()*/;
	var index = 0;
	function option( value, name, style ) {
		++index;
		return S( '<option value="', value, '" style="', style || '', '">', name, '</option>' );
	}
	function stateOption( state, dated ) {
		state.selectorIndex = index;
		var dates = '';
		if( dated ) {
			var dem = state.parties.dem.date, gop = state.parties.gop.date;
			dates = ' (' + ( dem == gop ? fmtDate(dem) : S( 'D:', fmtDate(dem), ', R:', fmtDate(gop) ) ) + ')';
		}
		return option( state.abbr, state.name + dates );
	}
	function infoOption( key ) {
		return option( key, infoTips[key].title );
	}
	
	stateSelector = ! opt.stateSelector ? '' : S(
		'<div>',
			'<table class="selects" cellspacing="0" cellpadding="0">',
				'<tr>',
					'<td>',
						'<label for="stateSelector">',
							'State:',
						'</label>',
					'</td>',
					'<td>',
						'<select id="stateSelector">',
							option( 'us', 'Entire USA' ),
							option( 'pa', 'April 22 Primary', 'color:#AAA; font-style:italic; font-weight:bold;' ),
							hotStates.mapjoin( function( abbr ) {
								return stateOption( statesByAbbr[abbr], false );
							}),
							option( '', 'All States', 'color:#AAA; font-style:italic; font-weight:bold;' ),
							states.mapjoin( function( state ) {
								return /*hotStates.by[state.abbr] ? '' :*/ stateOption( state, true );
							}),
						'</select>',
					'</td>',
				'</tr>',
				'<tr>',
					'<td>',
						'<label for="stateInfoSelector">',
							'View:',
						'</label>',
					'</td>',
					'<td xstyle="width:99%;">',
						'<select id="stateInfoSelector">',
							infoOption( 'stateVotes' ),
							infoOption( 'countyVotes' ),
							//option( '', '' ),
							infoOption( 'age' ),
							infoOption( 'population' ),
							infoOption( 'religion' ),
							infoOption( 'ethnic' ),
							infoOption( 'gub2002' ),
						'</select>',
					'</td>',
				'</tr>',
			'</table>',
		'</div>'
	);
})();

writeCommon();
if( opt.projector ) writeProjectorHTML();
else if( mapplet ) writeMappletHTML();
else writeApiMapHTML();

// TODO: migrate other CSS here
function writeCommon() {
	document.write(
		'<style type="text/css">',
			'.selects tr { vertical-align:middle; }',
			'.selects label { font-weight:bold; margin:0; }',
			'.selects select { margin:0 8px 4px 6px; width:99%; }',
			'.legend {}',
			'.legend * { font-size:12px; }',
			'.legend div { float:left; }',
			'.placerow { padding:2px; margin:1px; border:2px solid white; cursor:pointer; }',
			'.placerow-hilite { border-color:#444; }',
		'</style>'
	);
}

function writeProjectorHTML() {
	document.write(
		'<style type="text/css">',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#eventbar { display:none; }',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { font-size:11pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'#content table { width:100%; }',
			'#content .contentboxtd { width:7%; }',
			'#content .contentnametd { font-size:24px; width:18%; }',
			'#content .contentbox { height:36px; width:36px; float:left; margin-right:4px; }',
			'#content .contentname { font-size:24px; }',
			'#content .contentvotes { font-size:18px; }',
			'#content .contentclear { clear:left; }',
			'#content .contentreporting * { font-size:20px; }',
		'</style>',
		'<div id="content" style="width: 700px; height: 140px">',
		'</div>',
		'<div id="map" style="width: 700px; height: 430px">',
		'</div>'
	);
}

function writeMappletHTML() {
	document.write(
		'<style type="text/css">',
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
			'#votestitle { margin:12px 0 6px 0; padding:0; }',
			'.votesattrib * { font-size:85%; }',
			'#content table { xwidth:100%; }',
			'#content .contentboxtd { width:1%; }',
			'#content .contentnametd { xfont-size:24px; xwidth:18%; }',
			'#content .contentbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
			'#content .contentname { xfont-size:12pt; white-space:pre; }',
			'#content .contentvotestd { text-align:right; width:5em; }',
			'#content .contentpercenttd { text-align:right; width:2em; }',
			'#content .contentvotes, #content .contentpercent { xfont-size:10pt; margin-right:6px; }',
			'#content .contentclear { clear:left; }',
			'#content .contentreporting * { xfont-size:20px; }',
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
		'</style>',
		'<div id="outer">',
			'<div id="resultlist">',
			'</div>',
			'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
				'<span style="color:red;">New!</span> ',
				'<a href="http://gmodules.com/ig/creator?synd=open&url=http://primary-maps-2008.googlecode.com/svn/trunk/map.xml" target="_blank">Get this map for your website</a>',
			'</div>',
			stateSelector,
			//'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
			//	'Come back after the polls close (around 8PM EST) for live election results of all the Super Tuesday states!',
			//'</div>',
			//'<div style="padding-bottom:6px; display:none;">',
			//	'View in <a href="http://earth.google.com/" target="_blank">Google Earth</a>: ',
			//	'<a href="http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/earth-', opt.state, '-democrat.kml">Democratic</a>',
			//	' ',
			//	'<a href="http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/earth-', opt.state, '-republican.kml">Republican</a>',
			//'</div>',
			//'<div>',
			//	'<select id="lstRegions">',
			//		'<option value="">',
			//			'Zoom to a region',
			//		'</option>',
			//	'</select>',
			//	'<input type="checkbox" checked id="chkEvents" xstyle="margin-left:16px;" />',
			//	'<label for="chkEvents">Show Events</label>',
			//'</div>',
			//'<div id="links">',
			//	'<a href="http://www.desmoinesregister.com/apps/pbcs.dll/article?AID=/20071219/NEWS09/71219068" target="_blank">How the caucuses work</a>',
			//	'&nbsp;|&nbsp;',
			//	'<a href="http://www.desmoinesregister.com/apps/pbcs.dll/section?Category=caucus" target="_blank">Des Moines Register</a>',
			//'</div>',
			'<div id="content">',
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
	var mapWidth = opt.mapWidth ? opt.mapWidth + 'px' : '100%';
	var mapHeight = opt.mapHeight ? opt.mapHeight + 'px' : '100%';
	var mapHTML = S(
		'<div id="map" style="width:', mapWidth, '; height:', mapHeight, ';">',
		'</div>'
	);
	var sidebarHTML = S(
		'<div id="outer">',
			'<div id="resultlist">',
			'</div>',
			stateSelector,
			'<div id="content">',
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
	document.write(
		'<style type="text/css">',
			'body { margin:0; padding:0; overflow:hidden; }',
			'* { font-family: Arial,sans-serif; font-size: 10pt; }',
			'#outer {}',
			'#eventbar { display:none; }',
			'#links { margin-bottom:4px; }',
			'#news { margin-top:4px; padding:4px; }',
			'#clicknote { display:none; }',
			'h2 { font-size:11pt; margin:0; padding:0; }',
			'#loading { font-weight:normal; }',
			'.NewsHeading { padding-left:4px; }',
			'.NewsList { background-color:white; padding:2px; margin:4px; }',
			'.NewsList a { text-decoration:none; }',
			'.NewsList  a:hover { text-decoration:underline; }',
			'.NewsItem { padding:4px 2px 2px 2px; vertical-align:bottom; line-height:125%; }',
			'.favicon { width:16; height:16; float:left; padding:2px 4px 2px 2px; }',
			'#fullstate { margin-top:12px; }',
			'#fullstate table { width:700px; }',
			'#fullstate th, #fullstate td { text-align: right; background-color:#E8E8E8; padding:2px; }',
			'#fullstate th.countyname, #fullstate td.countyname { text-align:left; font-weight:bold; }',
			'.statewide * { font-weight: bold; }',
			'#votestitle { margin:12px 0 3px 0; padding:0; }',
			'.votesattrib * { font-size:85%; }',
			'#content table { xwidth:100%; }',
			'#content .contentboxtd { width:7%; }',
			'#content .contentnametd { xfont-size:24px; xwidth:18%; }',
			'#content .contentbox { height:24px; width:24px; xfloat:left; margin-right:4px; }',
			'#content .contentname { xfont-size:12pt; white-space:pre; }',
			'#content .contentvotestd { text-align:right; width:5em; }',
			'#content .contentpercenttd { text-align:right; width:2em; }',
			'#content .contentvotes, #content .contentpercent { xfont-size:10pt; margin-right:4px; }',
			'#content .contentclear { clear:left; }',
			'#content .contentreporting { margin-bottom:8px; }',
			'#content .contentreporting * { xfont-size:20px; }',
			'#content {}',
			'#content-scroll { overflow:scroll; }',
		'</style>'
	);
	
	if( opt.sidebarHeight ) {
		document.write(
			mapHTML,
			'<div style="margin-top:4px; width:', opt.sidebarWidth, 'px; height:', opt.sidebarHeight, 'px; overflow:auto;">',
				'<div style="width:99%;">',
					sidebarHTML,
				'</div>',
			'</td>',
				'</tr>',
			'</table>',
			'<div id="fullstate">',
			'</div>'
		);
	}
	else {
		document.write(
			'<table>',
				'<tr valign="top">',
					'<td>',
						mapHTML,
					'</td>',
					'<td valign="top" style="width:', opt.sidebarWidth, 'px;">',
						sidebarHTML,
					'</td>',
				'</tr>',
			'</table>',
			'<div id="fullstate">',
			'</div>'
		);
	}
}

var feed = {
	news: 'http://news.google.com/?ned=us&topic=el&output=rss',
	video: 'http://www.youtube.com/rss/user/wmurtv/videos.rss'
};

var map;

opt.codeUrl = opt.codeUrl || 'http://primary-maps-2008.googlecode.com/svn/trunk/';
opt.frameUrl = opt.frameUrl || opt.codeUrl;
opt.dataUrl = opt.dataUrl || 'http://primary-maps-2008-data.googlecode.com/svn/trunk/';
opt.state = opt.state || 'us';

var state = states[opt.state];

//var allEventData = [];
var eventMarkers = [];
var icons = {};

//function onEventsReady( xml ) {
//	var items = {
//		eventtitle:1, eventid:1, eventdate:1, eventtimestart:1, eventendtime:1,
//		venueid:1, venuename:1, venueaddress:1, venuecity:1, venuelat:1, venuelng:1,
//		party:1, feclist:1, etidlist:1, candnamelist:1, iscurrent:1, eventdetailslink:1
//	};
//	
//	$('marker',xml).each( function() {
//		var event = {};
//		for( var item in items ) event[item] = this.getAttribute(item);
//		event.latlng = new GLatLng( +event.venuelat, +event.venuelng );
//		event.marker = addEventMarker( event );
//		//allEventData.push( event );
//	});
//}

//function addEventMarker( event ) {
//	var color = { b:'white', d:'blue', r:'red' }[event.party] || 'white';
//	var icon = icons[color];
//	var marker = new GMarker( event.latlng, { icon:icons[color] } );
//	GEvent.addListener( marker, 'click', function() {
//		marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
//	});
//	eventMarkers.push( marker );
//	map.addOverlay( marker );
//	return marker;
//}

function onNewsReady( xml ) {
	var articles = [];
	$('rss channel item',xml).each( function( i ) {
		if( i > 4 ) return false;
		//var $item = $(this);
		//var $thumb = $('thumbnail',this);
		var $more = $( $('description',this).text() );
		$('a',$more).attr({ target:'_blank' });
		var $lh = $('div.lh',$more);
		var $link = $('a:first',$lh);
		var source = $('font:first b',$lh).html();
		$('a:first,font:first,br:lt(2)',$lh).remove();
		articles.push({
			link: $('link',this).text(),
			//thumb: $thumb.attr('url'),
			//width: +$thumb.attr('width') / 2,
			//height: +$thumb.attr('height') / 2,
			title: $('b',$link).text(),
			source: source,
			more: $more.html()
		});
		return true;
	});
	
	$('#news').html(
		'<h2 class="VideoHeading">',
			'<a href="http://news.google.com/?ned=us&topic=el">',
				'Campaign News',
			'</a>',
		'</h2>',
		articles.mapjoin( function( article ) {
			return S(
				'<div class="uftl">',
					'<a class="fmaxbox" href="javascript:void(0)">',
					'</a>',
					'<a href="', article.link, '" target="_blank">',
						article.title,
					'</a>',
					'<br />',
					'<font size="-1">',
						article.source,
					'</font>',
				'</div>',
				'<div class="fpad" style="display:none;">',
					article.more,
				'</div>'
			);
		})
	).click( function( event ) {
		function update( clas, weight, action ) {
			target.className = clas;
			var $title = $(target).parent();
			$title.css({ fontWeight:weight });
			$title.next()[action]();
			adjustHeight();
			return false;
		}
		var target = event.target;
		switch( target.className ) {
			case 'fmaxbox':  return update( 'fminbox', 'bold', 'show' );
			case 'fminbox':  return update( 'fmaxbox', 'normal', 'hide' );
		}
		return true;
  	});
	
	adjustHeight();
}

//function onVideoReady( xml ) {
//	var videos = [];
//	$('rss channel item',xml).each( function( i ) {
//		if( i > 2 ) return false;
//		var $item = $(this);
//		var $thumb = $('thumbnail',this);
//		if( ! $thumb.length )
//			$thumb = $( this.getElementsByTagName( 'media:thumbnail' ) );
//		videos.push({
//			link: $('link',this).text(),
//			thumb: $thumb.attr('url'),
//			width: +$thumb.attr('width') / 2,
//			height: +$thumb.attr('height') / 2,
//			title: $('title:first',this).text()
//		});
//		return true;
//	});
//	
//	var html = S(
//		'<h2 class="VideoHeading"><a href="http://www.youtube.com/profile_videos?user=iowacaucuses">Latest Videos</a></h2>',
//		videos.mapjoin( function( video ) {
//			var thumb = ! video.thumb ? '' : S(
//				'<a class="VideoLink" href="', video.link, '" target="_blank">',
//					'<img class="VideoThumb" src="', video.thumb, '" style="width:', video.width, 'px; height:', video.height, 'px; border:0;" />',
//				'</a>'
//			);
//			return S(
//				'<div class="Video">',
//					thumb,
//					'<a href="', video.link, '" target="_blank">',
//						'<div class="VideoTitle">',
//							video.title,
//						'</div>',
//					'</a>',
//				'</div>',
//				'<div class="VideoBorder">',
//				'</div>'
//			);
//		})
//	);
//	
//	$('#videos').html( html );
//	
//	adjustHeight();
//}

function polyMethod( name, fn ) {
	GPolygon.prototype[name] = GPolyline.prototype[name] = fn;
}

polyMethod( 'contains', function( latlng ) {
	var inside = false;
	var x = latlng.lng(), y = latlng.lat();
	var n = this.getVertexCount();
	var v = this.getVertex(n-1), x1 = v.lng(), y1 = v.lat();

	for( var i = 0;  i < n;  ++i ) {
		var v = this.getVertex(i), x2 = v.lng(), y2 = v.lat();
		
		if( ( y1 < y  &&  y2 >= y ) || ( y2 < y  &&  y1 >= y ) )
			if ( x1 + ( y - y1 ) / ( y2 - y1 ) * ( x2 - x1 ) < x )
				inside = ! inside;
		
		x1 = x2, y1 = y2;
	}
	return inside;
});

function contains( shape, xy ) {
	var inside = false;
	var x = xy[0], y = xy[1];
	var points = shape.points, n = points.length;
	var v = points[n-1], x1 = v[0], y1 = v[1];

	for( var i = 0;  i < n;  ++i ) {
		var v = points[i], x2 = v[0], y2 = v[1];
		
		if( ( y1 < y  &&  y2 >= y ) || ( y2 < y  &&  y1 >= y ) )
			if ( x1 + ( y - y1 ) / ( y2 - y1 ) * ( x2 - x1 ) < x )
				inside = ! inside;
		
		x1 = x2, y1 = y2;
	}
	return inside;
}

//function zoomToCounty( county ) {
//	// TODO: update for multiple polys
//	map.setCenter(
//	   new GLatLng( county.centroid[0], county.centroid[1] ),
//	   map.getBoundsZoomLevel( county.polygon.base.getBounds() )
//   );
//}

function initControls() {
/*
	var $lst = $('#lstRegions');
	option({ name:'', caption:'Entire State' });
	'northwest northcentral northeast southwest southcentral southeast'.words( function( name ) {
		option( regions.by.name[name] );
	});
	
	function option( region ) {
		var opt = document.createElement('option');
		opt.innerHTML = region.caption;
		opt.value = region.name;
		$lst.append( opt );
	}
	
	$lst.bind( 'change', function() {
		zoomRegion( regions.by.name[this.value] );
	});
*/
/*
	$('#chkEvents').bind( 'click', function() {
		map.closeInfoWindow();
		var method = this.checked ? 'show' : 'hide';
		eventMarkers.forEach( function( marker ) {
			marker[method]();
		});
	});
*/
}

//function zoomRegion( region ) {
//	map.closeInfoWindow();
//	if( ! region  &&  state ) {
//		var zoom = state.zoom;
//		map.setCenter( new GLatLng( zoom[0], zoom[1] ), zoom[2] );
//		//selectRegion();
//	}
//	else if( ! mapplet ) {
//		var center = new GLatLng( 37.0625, -95.677068 );
//		map.setCenter( center, opt.zoom );
//		//GAsync( region.polygon.base, 'getBounds',
//		//	function( bounds ) {
//		//		GAsync( map, 'getBoundsZoomLevel', [ bounds ],
//		//			function( zoom ) {
//		//				//selectRegion( region );
//		//				var center = pointLatLng( region.centroid );
//		//				map.setCenter( center, zoom );
//		//			});
//		//	});
//	}
//}

function pointLatLng( point ) {
	return new GLatLng( point[1], point[0] );
}

function formatEvent( event ) {
	var href = event.eventdetailslink;
	var link = ! href ? '' : S(
		'<div style="margin-top:6px;">',
			'<a href="', event.eventdetailslink, '" target="_blank">Event details&#8230;</a>',
		'</div>'
	);
	var names = event.candnamelist.replace( /,+$/, '' ).replace( /, /, ',' ).replace( /,/, ', ' ).trim();

	var who = ! names ? '' : S(
		'<tr>',
			'<td><b>Candidate:&nbsp;</b></td>',
			'<td>', candidateIcons(names,'width:16; height:16; float:left; margin:2px 4px 2px 2px;'), names, '</td>',
		'</tr>'
	);
	
	var where = event.venuename == event.venuecity ? '' : S(
		'<tr>',
			'<td><b>Where:&nbsp;</b></td>',
			'<td>', event.venuename, '</td>',
		'</tr>'
	);

	return S(
		'<div style="margin-top:8px;">',
			'<div style="font-size: 120%; font-weight: bold; margin-bottom:6px;">', event.eventtitle, '</div>',
			'<table>',
				who,
				where,
				'<tr>',
					'<td><b>Address:&nbsp;</b></td>',
					'<td>', ( event.venueaddress ? event.venueaddress + ', ' : '' ), event.venuecity, '</td>',
				'</tr>',
				'<tr>',
					'<td><b>When:&nbsp;</b></td>',
					'<td>', event.eventdate, ' at ', event.eventtimestart, '</td>',
				'</tr>',
			'</table>',
			link,
		'</div>'
	);
}

/*
 function getEvents(regionIdx) {
	var poly = regions[regionIdx].polygon.base;
	var html = '<div style="width:350px;height:200px;overflow:auto;font-size:12px;">';
	for(var i=0; i<allEventData.length; i++) {
		if (poly.Contains(allEventData[i].latlng))
			html += formatEvent(allEventData[i]);
	}
	html += '</div>';
	return html;
}
*/

//function createNewsMarker(latlng, html, regionIdx) {
//	var marker = new GMarker( latlng, { icon:icon08 } );
//	
//	GEvent.addListener(marker, "click", function() {
//		var tabs = [];
//		var eventTab = new GInfoWindowTab('News', html);
//		tabs.push(eventTab);
//		/*
//		var eventsHTML = getEvents(regionIdx);
//		if (eventsHTML)
//			tabs.push(new GInfoWindowTab('Events', eventsHTML));
//		*/
//		tabs.push(new GInfoWindowTab('Results', ''));
//		tabs.push(new GInfoWindowTab('Videos', ''));
//		marker.openInfoWindowTabsHtml(tabs);
//	});
//	
//	return marker;	
//}

function randomColor() {
	return '#' + hh() + hh() + hh();
}

function randomGray() {
	var h = hh();
	return '#' + h + h + h;
}

function hh() {
	var xx = Math.floor( Math.random() *128 + 96 ).toString(16);
	return xx.length == 2 ? xx : '0'+xx;
}

function stateReady( state ) {
	if( ! map ) return;
	loadInfo();
	map.clearOverlays();
	//$('script[title=jsonresult]').remove();
	//if( json.status == 'later' ) return;
	var bounds = state.bounds;
	if( bounds ) {
		//var latpad = ( bounds[1][1] - bounds[0][1] ) / 20;
		//var lngpad = ( bounds[1][0] - bounds[0][0] ) / 20;
		//var latlngbounds = new GLatLngBounds(
		//	new GLatLng( bounds[0][1] - latpad, bounds[0][0] - lngpad ),
		//	new GLatLng( bounds[1][1] + latpad, bounds[1][0] + lngpad )
		//);
		var latlngbounds = new GLatLngBounds(
			new GLatLng( bounds[0][1], bounds[0][0] ),
			new GLatLng( bounds[1][1], bounds[1][0] )
		);
		GAsync( map, 'getBoundsZoomLevel', [ latlngbounds ], function( zoom ) {
			map.setCenter( latlngbounds.getCenter(), zoom );
			polys();
		});
	}
	else {
		polys();
	}
	function polys() {
		// Let map display before drawing polys
		setTimeout( function() {
			if( opt.tileUrl )
				loadTiles( state, curParty );
			setTimeout( function() {
				showPins( state, curParty );
			}, 250 );
		}, 250 );
	}
}

//function showVotes( json, party ) {
//	return;
//	map.clearOverlays();
//	$('script[title=jsonresult]').remove();
//	if( json.status == 'later' ) return;
//	showState( json, party );
//	showCounties( json, party );
//	adjustHeight();
//}

//function showState( json, party ) {
//	if( opt.projector ) showStateProjector( json, party );
//	//else if( mapplet ) showStateSidebar( json, party );
//	//else showStateTable( json, party );
//	else showStateSidebar( json, party );
//}

function formatNumber( nStr ) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

//function showStateProjector( json, party ) {
//	var state = json.state, tallies = state.candidates, precincts = state.precincts;
//	tallies.index('name');
//	var rows = [];
//	addRow( 0, 3 );
//	addRow( 4, 7 );
//	
//	var html = [
//		'<table>',
//			rows.join(''),
//		'</table>',
//		'<div class="contentreporting">',
//			'<table>',
//				'<tr>',
//					'<td style="text-align:left;">',
//						'LIVE: Leading candidates by county',
//					'</td>',
//					'<td style="text-align:right;">',
//						precincts.reporting, ' of ', precincts.total, ' precincts reporting',
//					'</td>',
//				'</tr>',
//		'</table>',
//			'<div style="clear:both;>',
//			'</div>',
//		'</div>'
//	];
//	
//	$('#content').html( html );
//	
//	function addRow( start, end ) {
//		var cols = [];
//		for( var i = start;  i <= end;  ++i ) {
//			var candidate = candidates[party][i];
//			var tally = tallies.by.name[candidate.name];
//			cols.push(
//				'<td class="contentboxtd">',
//					'<div class="contentbox" style="border:1px solid #888888; background-color:', candidate.color, ';">',
//						'&nbsp;',
//					'</div>',
//				'</td>',
//				'<td class="contentnametd">',
//					'<div class="contentname">',
//						candidate.fullName,
//					'</div>',
//					'<div class="contentvotes">',
//						formatNumber(tally.votes),
//					'</div>',
//					'<div class="contentclear">',
//					'</div>',
//				'</td>'
//			);
//		}
//		
//		rows.push(
//			'<tr>',
//				cols.join(''),
//			'</tr>'
//		);
//	}
//}

function getLeaders( locals ) {
	var leaders = {};
	for( var localname in locals ) {
		var votes = locals[localname].votes[0];
		if( votes ) leaders[votes.name] = true;
	}
	return leaders;
}

function stateSidebar() {
	var state = stateByAbbr(opt.state), party = curParty;
	var votes = state.votes[party.name];
	var totals = votes.totals, locals = votes.locals;
	if( ! totals || ! locals ) return 'No results reported';
	var leaders = getLeaders( locals );
	var precincts = totals.precincts;
	var tallies = totals.votes;
	tallies.index('name');
	var rows = [];
	var cands = candidates[party.name];
	addRows();
	
	var reporting = ! precincts.total ? '' : S(
		'<div class="contentreporting">',
			precincts.reporting, ' of ', precincts.total, ' precincts reporting',
		'</div>'
	);
	
	return S(
		partyButtons,
		'<div id="votestitle">',
		'</div>',
		'<table>',
			'<thead>',
				'<th>',
					'Votes',
				'</th>',
				'<th style="padding-right:8px;">',
					'Delegates',
				'</th>',
				'<th>',
					' ',
				'</th>',
				'<th style="text-align:left;">',
					'Candidate',
				'</th>',
			'</thead>',
			'<tbody>',
				rows.join(''),
			'</tbody>',
		'</table>',
		reporting,
		attribution
	);
	
	function addRows() {
		var cols = [];
		tallies.forEach( function( tally ) {
			var candidate = candidates.all.by.name[tally.name];
			var box = leaders[tally.name] ? S(
				'<div class="contentbox">',
					'<img src="', getPinImage(candidate.color), '" />',
				'</div>'
			) : S(
				'<div class="contentbox">',
					'&nbsp;',
				'</div>'
			);
			if( ! tally.votes ) return;
			rows.push(
				'<tr>',
					'<td class="contentvotestd">',
						'<div class="contentvotes">',
							formatNumber(tally.votes),
						'</div>',
					'</td>',
					'<td class="contentdelegatestd" style="text-align:center; padding-right:8px;">',
						'<div class="contentdelegates">',
							formatNumber( tally.delegates || '' ),
						'</div>',
					'</td>',
					//'<td class="contentpercenttd">',
					//	'<div class="contentpercent">',
					//		percent( tally.votes / state.total ),
					//	'</div>',
					//'</td>',
					'<td class="contentboxtd">',
						box,
					'</td>',
					'<td class="contentnametd">',
						'<div class="contentname">',
							candidate.fullName,
						'</div>',
					'</td>',
				'</tr>'
			);
		});
	}
}

function showStateTable( json, party ) {
	var state = json.state, tallies = state[party], precincts = state.precincts;
	tallies.index('name');
	var cands = candidates[party];
	
	var html = [
		'<table>',
			'<thead>',
				header(),
			'</thead>',
			'<tbody>',
				stateRow(),
				countyRows(),
			'</tbody>',
		'</table>',
		'<div class="contentreporting">',
			precincts.reporting, ' of ', precincts.total, ' precincts reporting',
		'</div>'
	];
	
	$('#fullstate').html( html );
	
	function header() {
		return S(
			'<th class="countyname"></th>',
			cands.mapjoin( function( candidate ) {
				return S( '<th>', candidate.lastName, '</th>' );
			})
		);
	}
	
	function countyRows() {
		return counties.mapjoin( function( county ) {
			return row( county );
		});
	}
	
	function stateRow() {
		return row( null, 'Entire State', 'statewide' );
	}
	
	function row( county, name, clas ) {
		var tallies = ( county ? json.counties[county.name] : json.state )[party];
		if( ! tallies ) return '';
		tallies.index('name');
		return S(
			'<tr class="', clas, '">',
				'<td class="countyname">', name || county.name, '</td>',
				cands.mapjoin( function( candidate ) {
					var tally = tallies.by.name[candidate.name] || { votes:0 };
					return S( '<td>', formatNumber(tally.votes), '</td>' );
				}),
			'</tr>'
		);
	}
}

function showPins( state, party ) {
	//function tallyColor( place, tally ) {
	//	if( ! tally ) return;
	//	place.precincts = tally.precincts;
	//	//place.total = tally.total;
	//	var leader = tally.votes && tally.votes[0];
	//	if( ! leader ) return;
	//	var votes = leader.votes;
	//	var candidate = candidates[party.name].by.name[leader.name];
	//	//var icon = candidate.icon;
	//	place.color = candidate.color;
	//	place.opacity = place.precincts.reporting / place.precincts.total * .5 + .1;
	//}
	
	var tallies = state.votes && state.votes[party.name] || {};
	
	//var statecolor = {};
	//if( state.abbr != 'US' )
	//	tallyColor( statecolor, tallies.totals );
	
	// TODO - do this in voter.py instead
	var min = Infinity, max = -Infinity;
	var places = state.places;
	places.forEach( function( place ) {
		if( tallies && tallies.locals ) {
			var tally = tallies.locals[place.name];
			if( tally ) {
				var leader = tally.votes && tally.votes[0];
				if( leader ) {
					var votes = leader.votes;
					if( votes ) {
						min = Math.min( min, votes );
						max = Math.max( max, votes );
					}
				}
			}
		}
	});
	
	places.forEach( function( place ) {
		//place.color = statecolor.color || randomGray();
		place.color = '#DDDDDD';
		
		// TODO: refactor this with tallyColor() - it broke when I tried it :-)
		if( tallies && tallies.locals ) {
			var tally = tallies.locals[place.name];
			if( tally ) {
				place.precincts = tally.precincts;
				//place.total = tally.total;
				var leader = tally.votes && tally.votes[0];
				if( leader ) {
					var votes = leader.votes;
					var candidate = candidates[party.name].by.name[leader.name];
					var icon = candidate.icon;
					place.color = candidate.color;
				}
			}
		}
		
		var size = 20;
		if( leader  &&  min < max ) {
			var fraction = ( leader.votes - min ) / ( max - min ) * ( place.precincts.reporting / place.precincts.total );
			size = Math.floor( 20 + fraction * 24 );
		}
		
		place.marker = createStateMarker( place, size );
	});
	
	setTimeout( function() {
		places.forEach( function( place ) {
			map.addOverlay( place.marker );
		});
		setTimeout( function() {
			places.forEach( function( place ) {
				bindStateMarker( place );
			});
		}, 100 );
	}, 100 );
}

function createStateMarker( place, size ) {
	var state = stateByAbbr(place.state);
	var icon = IconFactory.createMarkerIcon({ height:size, primaryColor:place.color });
	var marker = new GMarker( pointLatLng(place.centroid), {
		icon: icon,
		title: 'Click for ' + localityName( state, place ) + ' results'
	});
	return marker;
}

function bindStateMarker( place ) {
	openInfo( place, true );
	//GEvent.addListener( place.marker, 'click', function() {
	//	openInfo( place );
	//});
}

function makeIcons() {
	'red white blue'.words( function( color ) {
		icons[color] = makeColorIcon( color );
	});
	loadCandidateIcons();
}

function makeColorIcon( color ) {
	var icon = new GIcon;
	icon.image = 'http://www.google.com/intl/en_us/mapfiles/ms/icons/' + color + '-dot.png';
	//icon.shadow = '';
	icon.iconSize = new GSize( 32, 32 );
	//icon.shadowSize = new GSize( 0, 0 );
	icon.iconAnchor = new GPoint( 16, 32 );
	icon.infoWindowAnchor = new GPoint( 16, 0 );
	return icon;
}

//Json = {
//	democratResults: function( json ) { showVotes( json, 'democrat' ); },
//	republicanResults: function( json ) { showVotes( json, 'republican' ); }
//};

function setStateByAbbr( abbr ) {
	setState( stateByAbbr(abbr) );
}

function setStateByName( name ) {
	setState( statesByName[name] );
}

function setState( state ) {
	if( ! state ) return;
	if( typeof state == 'string' ) state = stateByAbbr( state );
	var select = $('#stateSelector')[0];
	select && ( select.selectedIndex = state.selectorIndex );
	opt.state = state.abbr.toLowerCase();
	loadState();
}

function openInfo( place, bind ) {
	if( ! place ) return;
	var state = stateByAbbr(place.state);
	
	var method = bind ? 'bindInfoWindowHtml' : 'openInfoWindowHtml';
	var html = placeBalloon( state, place );
	var options = { maxWidth:300, disableGoogleLinks:true };
	if( place.marker )
		place.marker[method]( html, options );
	else
		map[method]( pointLatLng(place.centroid), html, options );
}

var attribution = S(
	'<div class="votesattrib">',
		'<span>AP</span>',
		'<span> / </span>',
		'<a href="http://www.boston.com/" target="_blank">Boston&nbsp;Globe</a>',
		'<span> / </span>',
		'<a href="http://www.realclearpolitics.com/" target="_blank">RealClearPolitics</a>',
	'</div>'
);


function load() {

	loadResults = function( party ) {
		if( party ) curParty = party;  // vs. opt.party?
		else party = curParty;
		setPartyButtons();
		//map.clearOverlays();
		//$('#votestitle').html(
		//	'<div>',
		//		'<b>', primaryTitle( stateByAbbr(opt.state), party ), '</b>',
		//	'</div>',
		//	'<div id="votesattrib" style="text-align:right;">',
		//		attribution,
		//	'</div>'
		//);
		$('#content').html( 'Loading&#8230;' );
		setStateByAbbr( opt.state );
		//loadVotes( opt.state );
		
		//loadScript( 'http://mg.to/iowa/server/' + q + '_results.js' );
		//if( testdata )
		//	loadScript( 'http://gigapad/iowa/server/test.' + party + '_results.js' );
		//else
			//loadScript( 'http://gmaps-samples.googlecode.com/svn/trunk/elections/iowa/caucus/live/' + party.name + '_results.js' );
		//var kmlBaseUrl = 'http://mg.to/', opt.state, '/';
		//var kmlBaseUrl = 'http://gmaps-samples.googlecode.com/svn/trunk/elections/2008/primary/', opt.state, '/';
		//var kml = new GGeoXml( kmlBaseUrl + 'maps-', opt.state, '-' + party.name + '.kml?t=' + new Date().getTime() );
		//map.addOverlay( kml );
		//GEvent.addListener( kml, 'click', function( overlay, latlng ) {
		//	console.log( 'kml', overlay, latlng );
		//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
		//});
	}

	if( mapplet ) {
		map = new GMap2;
		//zoomRegion();
	}
	else {
		if( ! GBrowserIsCompatible() ) return;
		map = new GMap2( $('#map')[0] );
		//zoomRegion();
		map.enableContinuousZoom();
		map.enableDoubleClickZoom();
		//map.enableGoogleBar();
		map.enableScrollWheelZoom();
		//map.addControl( new GLargeMapControl() );
		map.addControl( new GSmallMapControl() );
		
		GEvent.addListener( map, 'mousemove', mapmousemoved/*.hover*/ );
		//GEvent.addListener( map, 'mouseout', mapmousemoved.clear );
	}
	
	GEvent.addListener( map, 'click', function( overlay, latlng ) {
		var where = hittest( latlng );
		openInfo( where && where.place );
	});
	
	makeIcons();
	
	//if( mapplet ) showVotes();
	
	//GEvent.addListener( map, 'click', function( overlay, latlng ) {
	//	//marker.openInfoWindowHtml( formatEvent(event), { maxWidth:500 } );
	//});
	
	var testdata = false;
	if( location.search.slice(1) == 'test' )
		testdata = true;
	
	loadResults( curParty );
	//showCounties();
	
	if( mapplet ) {
		//download( feed.video, onVideoReady );
		download( feed.news, onNewsReady );
		//loadYouTubeMap();
	}
	
	//loadVotes();
	if( opt.twitter ) loadTwitter();
	
	//loadTiles();
	//$('#btnTest').click( function() {
	//	loadTiles();
	//	return false;
	//});

	$('#stateSelector').change( function() {
		var value = this.value.toLowerCase();
		if( ! value ) {
			value = 'us';
			this.selectedIndex = 0;
		}
		opt.state = value;
		loadState();
	});
	
	$('#stateInfoSelector')
		.change( infoSelectorChange )
		.keyup( infoSelectorChange );
	
	function infoSelectorChange() {
		var value = this.value;
		if( ! value ) {
			value = 'stateVotes';
			this.selectedIndex = 0;
		}
		opt.infoType = value;
		loadInfo();
	}
	
	$('#content')
		.click( contentClick )
		.mouseover( contentMouseOver )
		.mouseout( contentMouseOut );
	
	setParty = function( party ) {
		if( party != curParty ) loadResults( party );
	}
	
	//initControls();
	adjustHeight();
}

function mapmousemoved( latlng ) {
	var where = hittest( latlng );
	setHilite( where && where.place.name, true );
}

function  contentClick( event ) {
	var target = event.target;
	switch( target.id ) {
		case 'btnDem':
			loadResults( parties.by.name['dem'] );
			return false;
		
		case 'btnRep':
			loadResults( parties.by.name['gop'] );
			return false;
		
		case 'btnReload':
			loadResults();
			return false;
	}
	
	return false;
}

function oneshot() {
	var timer;
	return function( fun, time ) {
		clearTimeout( timer );
		timer = setTimeout( fun, time );
	};
}

var hilite = { polys:[] };
var hiliteOneshot = oneshot();

function setHilite( name, scroll ) {
	hiliteOneshot( function() {
		var id = name && ( 'place-' + name.replace( ' ', '+' ) );
		if( id == hilite.id ) return;
		
		$('#'+hilite.id).removeClass( 'placerow-hilite' );
		hilite.id = id;
		var $row = $('#'+id);
		$row.addClass( 'placerow-hilite' );
		autoScrollContent.clear();
		if( scroll )
			autoScrollContent.hover( $row[0] );
		
		hilite.polys.forEach( function( poly ) { map.removeOverlay( poly ); } );
		hilite.polys = [];
		if( id ) {
			var place = curState.places.by.name[name];
			if( place ) {
				place.shapes.forEach( function( shape ) {
					var poly = new GPolygon( shapeVertices(shape), '#000000', 1, .8, '#000000', .2 );
					hilite.polys.push( poly );
					map.addOverlay( poly );
				});
			}
		}
	}, 10 );
}

if( ! mapplet ) autoScrollContent = hoverize( function( row ) {
	if( row )
		$('#content-scroll').stop().scrollTo( row, 500 );
});

function shapeVertices( shape ) {
	if( ! shape.vertices ) {
		var points = shape.points, n = points.length;
		var vertices = shape.vertices = new Array( n + 1 );
		for( var i = 0;  i < n;  ++i ) {  // old fashioned loop for speed
			var point = points[i];
			vertices[i] = new GLatLng( point[1], point[0] );
		}
		vertices[n] = new GLatLng( points[0][1], points[0][0] );
	}
	return shape.vertices;
}

function contentMouseOver( event ) {
	var target = event.target, $target = $(target);
	showInfoTip( target.id == 'infoicon' );
	var row = $target.parents('.placerow')[0];
	setHilite( row && row.id.replace( /^place-/, '' ).replace( '+', ' ' ) );
}

function contentMouseOut( event ) {
	showInfoTip( false );
	setHilite();
}

function showInfoTip( show ) {
	var $infotip = $('#infotip');
	if( show ) {
		if( $infotip[0] ) return;
		var tip = infoTips[opt.infoType];
		var $outer = $('#outer');
		var offset = $outer.offset();
		var top = offset.top + 8;
		var left = offset.left + 8;
		var width = $outer.width() - 40;
		
		$('body').append( S(
			'<div id="infotip" style="z-order:999; position:absolute; top:', top, 'px; left:', left, 'px; width:', width, 'px; padding:4px; background-color:#F2EFE9; border: 1px solid black;">',
				'<div style="margin-bottom:4px;">',
					'<b>', tip.title, '</b>',
				'</div>',
				'<div>',
					tip.text,
				'</div>',
			'</div>'
		) );
	}
	else {
		$infotip.remove();
	}
}

//var mousemoved = function( latlng ) {
//	//$('#test').html( latlng.lng() + ' : ' + latlng.lat() );
//	
///*
//	for( var i = 0, n = regions.length;  i < n;  ++i ) {
//		var region = regions[i];
//		if( region.polygon.base.contains( latlng ) ) {
//			//$('#test').css({ color: region.color });
//			break;
//		}
//	}
//	
//	if( i == n ) i = -1;
//	region = regions[i];
//	
//	selectRegion( region );
//*/
//	
//	// Old fashioned loops for speed
//	for( var i = 0, nI = counties.length;  i < nI;  ++i ) {
//		var county = counties[i];
//		var shapes = county.shapes;
//		for( var j = 0, nJ = shapes.length;  j < nJ;  ++j ) {
//			if( shapes[j].polygon.base.contains( latlng ) ) {
//				//$('#test').css({ color: region.color });
//				$('#results').html( countyTable( county ) );
//				return;
//			}
//		}
//	}
//}

function hittest( latlng ) {
	if( ! latlng ) return null;
	var lat = latlng.lat(), lng = latlng.lng();
	var state = stateByAbbr( opt.state );
	if( opt.state == 'us' ) {
		return test( state, lat, lng );
	}
	else {
		return test( state, lat, lng ) || test( stateUS, lat, lng );
	}
	
	function test( entity, lat, lng ) {
		// Old fashioned loops for speed
		var places = entity.places;
		for( var i = 0, nI = places.length;  i < nI;  ++i ) {
			var place = places[i];
			var shapes = place.shapes;
			for( var j = 0, nJ = shapes.length;  j < nJ;  ++j )
				if( contains( shapes[j], [ lng, lat ] ) )
					return { parent:entity, place:place };
		}
		return null;
	}
}

function following() {
	var chk = $('#chkFollow')[0];
	return ! chk  ||  chk.checked;
}

function loadState() {
	var abbr = opt.state;
	var state = curState = stateByAbbr( abbr );
	if( state.data ) {
		//console.log( 'state ready', state.name );
		stateReady( state.data );
	}
	else {
		//console.log( 'loading state', abbr );
		loadScript( S( opt.dataUrl, 'shapes/coarse/', abbr.toLowerCase(), '.js' ), 120 );
	}
}

function loadInfo() {
	if( opt.state != 'pa' ) opt.infoType = 'stateVotes';  // temp
	$('#content').html( infoHtml[opt.infoType]() );
	setContentScroll();
	adjustHeight();
}

function setContentScroll() {
	var $c = $('#content'), $cs = $('#content-scroll');
	var height = $(window).height() - $c.offset().top;
	$c.height( height + 'px' );
	if( $cs[0] )
		$cs.height( ( $c.offset().top + height - $cs.offset().top ) + 'px' );
}

var infoIcon = S( '<img id="infoicon" style="width:16px; height:16px;" src="', imgUrl('help'), '" />' );

var infoHtml = {
	stateVotes: stateSidebar,
	
	countyVotes: function() {
		return '(coming soon)';
	},
	
	age: listAges,
	population: listPopulation,
	religion: listReligion,
	ethnic: listEthnic,
	gub2002: listGub2002
};

function listAges() {
	var labels = Demographics.labels.ages.map( function( label ) {
		//return label.replace( ' to ', '&#8211;' );
		return label.replace( ' to ', '-' );
	});
	var color = {
		dem: { line:'0000FF', fill:'bg,ls,0,C4C4FF,0.28,DCDCFF,0.44,C4C4FF,0.28' },
		gop: { line:'DD0000', fill:'bg,ls,0,FFC4C4,0.28,FFDCDC,0.44,FFC4C4,0.28' }
	};
	var width = 75, height = 22;
	var html = Demographics.places.mapjoin( function( place ) {
		var ages = place.ages, dem = ages.dem, gop = ages.gop;
		var min = Math.min( dem.min, gop.min ), max = Math.max( dem.max, gop.max );
		var use = dem.total > gop.total ? {
			data: [ gop.counts.join(), dem.counts.join() ],
			colors: [ color.gop.line, color.dem.line ],
			solid: color.dem.fill
		} : {
			data: [ dem.counts.join(), gop.counts.join() ],
			colors: [ color.dem.line, color.gop.line ],
			solid: color.gop.fill
		};
		var img = ChartApi.sparkline({
			width: width,
			height: height,
			solid: use.solid,
			colors: use.colors,
			data: use.data,
			scale: [ min * .8, max * 1.1 ]
		});
		//alert( img );
		return S(
			'<div class="placerow" id="place-', place.name.replace( ' ', '+' ), '">',
				'<div style="vertical-align:middle;">',
					'<img style="width:', width, 'px; height:', height, 'px;" src="', img, '" />',
					' ', place.name, ' County',
				'</div>',
			'</div>'
		);
	});
	width = 24, height = 16;
	var imgDem = ChartApi.sparkline({
		width: width,
		height: height,
		solid: 'bg,s,C4C4FF',
		colors: [ '0000FF' ],
		data: [ '50,50' ],
		scale: [ 0, 100 ]
	});
	var imgGop = ChartApi.sparkline({
		width: width,
		height: height,
		solid: 'bg,s,FFC4C4',
		colors: [ 'DD0000' ],
		data: [ '50,50' ],
		scale: [ 0, 100 ]
	});

	return S(
		'<div class="legend">',
			'<div>',
				'<div style="margin-left:4px; width:24px;">18</div>',
				'<div style="width:30px;">35</div>',
				'<div style="width:21px;">65+</div>',
				'<div style="width:12px;"> </div>',
			'</div>',
			'<div style="margin:0 4px 0 12px; width:', width, 'px;">',
				'<img style="width:', width, 'px; height:', height, 'px;" src="', imgDem, '" />',
			'</div>',
			'<div>',
				'Democratic',
			'</div>',
			'<div style="margin:0 4px 0 12px; width:', width, 'px;">',
				'<img style="width:', width, 'px; height:', height, 'px;" src="', imgGop, '" />',
			'</div>',
			'<div>',
				'Republican',
			'</div>',
			'<div style="float:right;">',
				infoIcon,
			'</div>',
		'</div>',
		'<div style="clear:both;">',
		'</div>',
		'<div style="padding-bottom:4px; border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div id="content-scroll">',
			html,
		'</div>'
	);
}

function listReligion() {
	var colors = [ '5A1F00', 'D1570D', 'FDE792', '477725', 'A9CC66', 'CCCCCC' ];
	var width = 75, height = 22;
	var html = Demographics.places.mapjoin( function( place ) {
		var img = ChartApi.rainbow({
			width: width,
			height: height,
			colors: colors,
			data: place.religion.percents
		});
		return S(
			'<div class="placerow" id="place-', place.name.replace( ' ', '+' ), '" style="vertical-align:middle;">',
				'<div>',
					'<div style="float:left; margin-right:8px;">',
						img,
					'</div>',
					'<div style="float:left;">',
						' ', place.name, ' County',
					'</div>',
					'<div style="clear:left;">',
					'</div>',
				'</div>',
			'</div>'
		);
	});
	
	function label( i ) {
		return S(
			'<td>',
				'<div style="width:16px; height:16px; margin:0 4px 4px 0; background-color:#', colors[i], ';">',
					' ',
				'</div>',
				'<div style="margin:0 18px 4px 0;">',
					Demographics.labels.religion[i],
				'</div>',
			'</td>'
		);
	}
	
	return S(
		'<div class="legend">',
			'<div>',
				'<table cellspacing="0" cellpadding="0">',
					'<tr>',
						label(0), label(1), label(2),
					'</tr>',
					'<tr>',
						label(3), label(4), label(5),
					'</tr>',
				'</table>',
			'</div>',
			'<div style="float:right;">',
				infoIcon,
			'</div>',
		'</div>',
		'<div style="clear:both;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div id="content-scroll">',
			html,
		'</div>'
	);
}

function listEthnic() {
	var colors = [ '18A221', 'EFBA00', '1851CE', 'AD1400' ];
	var width = 75, height = 22;
	var html = Demographics.places.mapjoin( function( place ) {
		var ethnic = place.ethnic;
		var total = 0;
		for( var i = 0, n = ethnic.length;  i < n;  ++i )
			total += ethnic[i];
		var img = ChartApi.rainbow({
			width: width,
			height: height,
			colors: colors,
			data: ethnic,
			scale: [ 0, total ]
		});
		return S(
			'<div class="placerow" id="place-', place.name.replace( ' ', '+' ), '" style="vertical-align:middle;">',
				'<div>',
					'<div style="float:left; margin-right:8px;">',
						img,
					'</div>',
					'<div style="float:left;">',
						' ', place.name, ' County',
					'</div>',
					'<div style="clear:left;">',
					'</div>',
				'</div>',
			'</div>'
		);
	});
	
	function label( i ) {
		return S(
			'<td>',
				'<div style="width:16px; height:16px; margin:0 4px 4px 0; background-color:#', colors[i], ';">',
					' ',
				'</div>',
				'<div style="margin:0 18px 4px 0;">',
					Demographics.labels.ethnic[i],
				'</div>',
			'</td>'
		);
	}
	
	return S(
		'<div class="legend">',
			'<div>',
					label(0), label(1), label(2), label(3),
			'</div>',
			'<div style="float:right;">',
				infoIcon,
			'</div>',
		'</div>',
		'<div style="clear:both;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div id="content-scroll">',
			html,
		'</div>'
	);
}

function listPopulation() {
	var colors = [ '18A221', '0000DD', 'DD0000' ];
	var labels = [ 'Population', 'Democratic', 'Republican' ];
	var width = 125, height = 22;
	var limits = Demographics.limits.population, scale = [ limits.minPercent, limits.maxPercent ];
	var left = -scale[0] / ( scale[1] - scale[0] ), right = 1 - left;
	var html = Demographics.places.mapjoin( function( place ) {
		var pop = place.population;
		var img = ChartApi.sparkbar({
			width: width,
			height: height,
			barHeight: 6,
			barSpace: 2,
			colors: colors,
			data: [ pop.all.change, pop.dem.change, pop.gop.change ],
			scale: scale,
			background: S( 'c,ls,0,E0E0E0,', left, ',F4F4F4,', right )
			//,
			//alt: S(
			//	place.name, ': Population 
		});
		return S(
			'<div class="placerow" id="place-', place.name.replace( ' ', '+' ), '" style="vertical-align:middle;">',
				'<div>',
					'<div style="float:left; margin-right:8px; padding:2px; background-color:#F4F4F4; border:1px solid #DDD;">',
						img,
					'</div>',
					'<div style="float:left; margin-top:3px;">',
						' ', place.name, ' County',
					'</div>',
					'<div style="clear:left;">',
					'</div>',
				'</div>',
			'</div>'
		);
	});
	
	function label( i ) {
		return S(
			'<td>',
				'<div style="width:16px; height:16px; margin:0 4px 4px 0; background-color:#', colors[i], ';">',
					' ',
				'</div>',
				'<div style="margin:0 18px 4px 0;">',
					labels[i],
				'</div>',
			'</td>'
		);
	}
	
	return S(
		'<div class="legend">',
			'<div>',
					label(0), label(1), label(2),
			'</div>',
			'<div style="float:right;">',
				infoIcon,
			'</div>',
		'</div>',
		'<div style="clear:both;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div class="legend">',
			'<div>',
				'<div style="width:39px;">-25%</div>',
				'<div style="width:59px;">0</div>',
				'<div style="width:46px;">+70%</div>',
				'<div>Changes from 2000 to 2008</div>',
			'</div>',
		'</div>',
		'<div style="clear:left;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div id="content-scroll">',
			html,
		'</div>'
	);
}

function listGub2002() {
	var colors = [ 'EFBA00', '18A221' ];
	var labels = Demographics.labels.gub2002;
	var width = 125, height = 22;
	var html = Demographics.places.mapjoin( function( place ) {
		var gub = place.gub2002;
		var img = ChartApi.sparkbar({
			width: width,
			height: height,
			barHeight: 10,
			barSpace: 2,
			colors: colors,
			data: gub,
			scale: [0, gub[0] + gub[1] ],
			background: S( 'c,s,F4F4F4' )
			//,
			//alt: S(
			//	place.name, ': Population 
		});
		return S(
			'<div class="placerow" id="place-', place.name.replace( ' ', '+' ), '" style="vertical-align:middle;">',
				'<div>',
					'<div style="float:left; margin-right:8px; padding:2px; background-color:#F4F4F4; border:1px solid #DDD;">',
						img,
					'</div>',
					'<div style="float:left; margin-top:3px;">',
						' ', place.name, ' County',
					'</div>',
					'<div style="clear:left;">',
					'</div>',
				'</div>',
			'</div>'
		);
	});
	
	function label( i ) {
		return S(
			'<td>',
				'<div style="width:16px; height:16px; margin:0 4px 4px 0; background-color:#', colors[i], ';">',
					' ',
				'</div>',
				'<div style="margin:0 18px 4px 0;">',
					labels[i],
				'</div>',
			'</td>'
		);
	}
	
	return S(
		'<div class="legend">',
			'<div>',
					label(0), label(1),
			'</div>',
			'<div style="float:right;">',
				infoIcon,
			'</div>',
		'</div>',
		'<div style="clear:both;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div class="legend">',
			'<div>',
				'<div style="margin-left:4px; width:96px;">0%</div>',
				'<div style="width:45px;">100%</div>',
				'<div>2002 Gubernatorial Primary</div>',
			'</div>',
		'</div>',
		'<div style="clear:left;">',
		'</div>',
		'<div style="border-bottom:1px solid #DDD; margin-bottom:4px;">',
		'</div>',
		'<div id="content-scroll">',
			html,
		'</div>'
	);
}

//function loadVotes() {
//	return;
//		//loadScript( S( opt.dataUrl, 'elections/2008/primary/states/', opt.state, '/results_', party.name, '.js' ) );
//		
//	var contentBase = window.contentBase || 'http://primary-maps-2008-data.googlecode.com/svn/trunk/miniresults/';
//
//	var party = ( Math.random() < .5 ? 'dem' : 'gop' );
//	
//	setTimeout( reload, 1 );
//	
//	refresh = function( p) {
//		$('#chkFollow')[0].checked = false;
//		loadParty( p );
//	}
//	
//	changePartyIfFollowing = function( p ) {
//		if( following() )  loadParty( p );
//	}
//	
//	loadParty = function( p ) {
//		party = p || party;
//		reload();
//	}
//	
//	function reload() {
//		var url = contentBase + 'miniresults-map-' + party + '.html';
//		_IG_FetchContent( url, function( html ) {
//			var follow = following();
//			$('#resultlist').html( html );
//			$('#chkFollow')[0].checked = follow;
//			$('#spanFollow').css({ display:'inline' });
//			$('#attribution').show();
//			adjustHeight();
//			setTimeout( reload, 120000 ); 
//		},
//		{
//			refreshInterval: 120
//		});
//	}
//}

//var tileSeq = new Date().getTime();
var tileLayerOverlay;
function loadTiles( state, party ) {
	if( tileLayerOverlay ) map.removeOverlay( tileLayerOverlay );
	var abbr = state.abbr.toLowerCase();
	tileLayerOverlay = new GTileLayerOverlay(
		new GTileLayer( null, 1, 1, {
			tileUrlTemplate: S( opt.tileUrl, abbr, '/', abbr, '-{Z}-{Y}-{X}.png' ),
			isPng:true,
			opacity:1.0
		})
	);
	
	map.addOverlay( tileLayerOverlay );
}

function placeBalloon( state, place ) {
	var method = 'zoomToState';
	var base = opt.frameUrl + 'infoframe.html';
	var id = 'LinkFrameForMapplet';
	if( place.type == 'state' ) {
		var abbr = state.abbr.toLowerCase();
		var linktext = 'View ' + state.name + ' local results';
	}
	else {
		var abbr = 'us';
		var linktext = 'View nationwide results';
	}
	
	function makeUrl( type ) {
		return cacheUrl( S( base, '?', type, '|', method, '|', abbr, '|', linktext.replace( / /g, '+' ) ), null, true );
	}
	
	function makeFrame( type, style ) {
		return S(
			'<iframe id="', id, '" name="', id, '" frameborder="0" style="', style, '" src="', makeUrl(type), '">',
			'</iframe>'
		);
	}
	
	if( ! mapplet ) {
		var link = S( '<a href="#" onclick="GoogleElectionMap.', method, '(\'', abbr, '\');">', linktext, '</a>' );
		var iframe = '';
	}
	else if( $.browser.mozilla ) {
		var link = S( '<a href="', makeUrl('timer') + '#go', '" target="', id, '">', linktext, '</a>' );
		var iframe =makeFrame( 'timer', 'display:none;' );
	}
	else {  // IE, Safari
		var link = '';
		var iframe = makeFrame( 'link', 'height:3.2em; width:20em;' );
	}
	
	return S(
		'<div style="font-size:10pt;">',
			placeTable( state, place, true ),
			'<div style="margin-top:10px;">',
				link,
				iframe,
			'</div>',
		'</div>'
	);
}

function localityName( state, place ) {
	var name = place.name.replace( / County$/, '' );
	if( place.type == 'county'  &&  ! state.votesby  &&  ! name.match(/ City$/) ) name += ' County';
	return name;
}

function primaryTitle( state, party ) {
	return S(
		state.name, ' ', curParty.shortName,
		party.type == 'caucus' ? ' Caucus ' : ' Primary '
	);
}

function placeTable( state, place, balloon ) {
	var fontsize = 'font-size:10pt;';
	var pad = balloon ? '8px' : '4px';
	var party = state.parties[curParty.name];
	var header = S(
		'<div style="font-size:120%">',
			primaryTitle( state, curParty ),
		'</div>',
		'<div style="font-size:110%">',
			fmtDate(party.date), ', 2008',
		'</div>'
	);
	if( place.type != 'state' ) {
		header += S(
			'<div style="font-size:120%">',
				localityName( state, place ), ', ', state.abbr,
			'</div>'
		);
	}
	var none = S(
		header,
		'<div>',
			'No votes reported',
		'</div>'
	);
	var delegateHeader = place.type != 'state' ? '' : S(
		'<th>',
			'Delegates',
		'</th>'
	);
	function delegateCol( delegates ) {
		return place.type != 'state' ? '' : S(
			'<td style="', fontsize, 'text-align:center;">',
				'<div>',
					formatNumber( delegates || '' ),
				'</div>',
			'</td>'
		);
	}
	try {
		var votes = ( place.type == 'state' ? stateUS : state ).votes[curParty.name].locals[place.name];
	}
	catch( e ) {
	}
	if( ! votes ) return none;
	var lines = [];
	var tallies = votes.votes;
	var total = 0;
	var leader = tallies[0];
	if( leader ) {
		tallies.forEach( function( tally ) {
			total += tally.votes;
		});
		tallies.forEach( function( tally, i ) {
			if( i >= 3 ) return;
			var candidate = candidates.all.by.name[tally.name];
			lines.push(
				'<tr>',
					'<td style="width:1%;">',
						'<div class="contentbox">',
							'<img src="', getPinImage(candidate.color), '" />',
						'</div>',
					'</td>',
					'<td style="', fontsize, 'xpadding-right:8px; white-space:pre;">',
						'<div>',
							candidate.fullName,
						'</div>',
					'</td>',
					delegateCol(tally.delegates),
					'<td style="', fontsize, 'text-align:right; xwidth:5em; padding-right:', pad, ';">',
						'<div>',
							formatNumber(tally.votes),
						'</div>',
					'</td>',
					'<td style="', fontsize, 'text-align:right; width:2em; padding-right:', pad, ';">',
						'<div style="font-size:80%; color:red;">',
							percent( tally.votes / total ),
						'</div>',
					'</td>',
					//'<td style="', fontsize, 'padding-right:8px;">',
					//	'<img class="favicon" src="', imgUrl(tally.name), '" />',
					//'</td>',
				'</tr>'
			);
		});
	}
	//else if( ! county.precincts ) {
	//	//lines.push( '<tr><td>' + county.name + ' residents vote in a nearby town.</td></tr>' );
	//}
	
	//var wikilink = ! balloon ? '' : S(
	//	'<a href="http://en.wikipedia.org/wiki/',
	//			countyName(county).replace( / /g, '_' ),
	//			'" target="_blank">',
	//		'County information',
	//	'</a>'
	//);
	
	return ! total ? none : S(
		header,
		//'<div style="', fontsize, 'font-weight:bold;">', countyName(county), '</div>',
		//'<div>',	wikilink, '</div>',
		'<table style="width: 350px; margin-top:8px;">',
			'<thead>',
				'<th>',
				'</th>',
				'<th style="text-align:left;">',
					'Candidate',
				'</th>',
				delegateHeader,
				'<th>',
					'Votes',
				'</th>',
				'<th>',
				'</th>',
			'</thead>',
			'<tbody>',
				lines.join(''),
			'</tbody>',
		'</table>'
	);
}

function imgUrl( name ) {
	return imgBaseUrl + name + '.png';
}

function candidateIcons( text, style ) {
	var names = text.toLowerCase().match(reCandidates) || [ 'generic' ];
	return names.mapjoin( function( name ) {
		return S(
			'<img ',
				style != null ? 'style="' + style + '"' : 'class="favicon"',
				' src="', imgUrl(name), '" />'
		);
	});
}

function download( url, ready ) {
	if( mapplet ) {
		_IG_FetchXmlContent( url, ready );
	}
	else {
		//GDownloadUrl( 'proxy.php?url=' + encodeURIComponent(url), function( data ) {
		//	ready( GXml.parse(data) );
		//});
	}
}

$(window).bind( 'load', load ).bind( 'onunload', GUnload );

if( opt.state  &&  opt.state != 'us' ) {
	document.write(
		'<script type="text/javascript" src="', opt.dataUrl, 'shapes/coarse/us.js', '">',
		'<\/script>'
	);
}

})( jQuery );
