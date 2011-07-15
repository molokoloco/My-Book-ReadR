// Remixed by @molokoloco 2011 - http://b2bweb.fr
// Src : https://github.com/molokoloco/My-Book-ReadR/ - V0.93

var db = function() { 'console' in window && console.log.call(console, arguments); } // Debug tool

/* DISQUS comments system, must by global */
var disqus_url 			= 'http://www.b2bweb.fr/bonus/piratons-la-democratie.html'
	disqus_identifier 	= 'pirate',
	disqus_domain 		= 'disqus.com',
	disqus_shortname 	= 'piratonsladmocratie',
	disqus_title 		= 'Piratons la démocratie';

$(document).ready(function() {
	
	// ----------- VARS ---------------------------------------------------------------------------------- //
	
	var container  		= '#section', // Main text box
		$container 		= $(container),
		titlesChapter 	= container+' h1,'+container+' h2,'+container+' h4', // Choose your HTML tag(s) for the summary, jquery render back in the correct DOM order
		$titlesChapter 	= $(titlesChapter),
		sectionPrgh 	= container+' p',
		sectionPrghActif= container+' p.p-actif',
		$summary 		= $('#aside'), // Box who print summary
		$summaryUl 		= $summary.find('ul#summary'), // keep a ref to UL
		$summary_links	= null,
		$paginettesUl 	= $summary.find('ul#paginettes'), // keep a ref to UL
		$paginettes_links= null,
		$disqus_thread 	= $('#disqus_thread'),
		scrollElement 	= 'html, body',
		$resizeHandle 	= $('#resizeHandle');
	
	var currentZoom 	= 62.50, // %, let's say that 1em == 10px
		totalH 			= 0,
		screenH			= 0,
		totalPages		= 0,
		debounce 		= null;
		
	// ----------- JS DEPENDENCY ---------------------------------------------------------------------------------- //
	
	// Call external scripts
	var callScript = function(src, async) { $.ajax({url:src, dataType:'script', async:async, cache:true}); };
	
	// Load plugins...
	callScript('./js/waypoints.min.js', 0);
	callScript('./js/jquery.mousewheel.min.js', 0);
	
	// ----------- BROWSER SET BASE ---------------------------------------------------------------------------------- //
	
	var windowHeight = function() {
		return ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $(window).height());
	};
	
	// http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
	$(scrollElement).each(function (i) { // 'html, body'
		var initScrollTop = $(this).scrollTop(); // Produce NaN on my #FF4 / Chrome 11, but works...
		$(this).scrollTop(initScrollTop + 1);
		if ($(this).scrollTop() == initScrollTop + 1) {
			scrollElement = this.nodeName.toLowerCase();
			$(this).scrollTop(initScrollTop);
			return false;
		}
	});

	// ----------- ITERATE <h4> AND <p>, build summary ---------------------------------------------------------------------------------- //
	var titles = '';
	$titlesChapter // Create summary based on the H4 tags
		.each(function(i) {
			$(this)
				.data({id:i}) // Attach menu_id to chapters
				.prepend('<a name="chapter_'+(i+1)+'" id="chapter_'+(i+1)+'"></a>') // Add anchors
			// indentation == <H[x]> * 3px >>> (parseInt(this.nodeName[1])-1)*3
			titles += '<li style="padding-left:'+((parseInt(this.nodeName[1])-1)*3)+'px;"><a href="#chapter_'+(i+1)+'">'+$(this).text()+'</a></li>'; // Build summary links
		})
		.waypoint({offset: '10%'}); // Create Waypoint obj, foreach H4 // http://imakewebthings.github.com/jquery-waypoints/
	
	$(titles).appendTo($summaryUl); titles = null;
	$summary_links = $summaryUl.find('a'); // Stock summary links

	$(sectionPrgh)
		.waypoint({offset: '35%'}) // highlight continuously current <p>, when scrolling
		.each(function(i) { // Add infobulle comments for each <P> - Disqus system // BECAREFULL : Editing the "STATIC" HTML <p> could lead to comments crash disorder !!!
			$(this).prepend('<span class="comment"><a href="'+disqus_url+'?pirate='+i+'#disqus_thread" data-disqus-identifier="pirate='+i+'" title="Commenter le texte (P#'+i+')">-</a></span>');
		});
	
	// Focus current <p>
	var setParaphActif = function($e) {
		$(sectionPrghActif).removeClass('p-actif'); // reset
		$e.addClass('p-actif').prev('p').addClass('p-actif').end().next('p').addClass('p-actif');
	};
	
	// ----------- BODY EVENTS ---------------------------------------------------------------------------------- //
	
	$('body') // YES move your body ;)
		.delegate(titlesChapter, 'waypoint.reached', function(event, direction) { // Waypoint obj, detecting <h4>
			var i = $(this).data('id'),
				newHash =  $summary_links
										.removeClass('current') // reset
										.eq(i) // current
											.addClass('current')
											.attr('href'); // get selected summary link anchor
			window.location.hash = newHash; // upadte location
		})
		.delegate(sectionPrgh, 'waypoint.reached', function(event, direction) { // Waypoint obj, listening viewport scrolling, detecting <p>
			var $active = $(this);
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(function($a, d) { // hightlighted <p> keep persistent when you scroll
				if (d === 'up') $a = $a.prev('p');
				if (!$a.length) $a.end();
				setParaphActif($a);
			}, 1250, $active, direction);
		})
		.delegate(sectionPrgh, 'mouseenter.readr', function(event) { // Subtelly(?) hightlight paragraph // Focus with scroll or mouseenter...
			var $active = $(this);
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(function($a) {
				setParaphActif($a);
			}, 1400, $active);
		})
		.delegate(sectionPrgh, 'mouseleave.readr', function(event) { //  We SET the EVENT with our plugin NAMESPACE .readr so we can UNSET all with unbind('.readr')
			if (debounce) clearTimeout(debounce);
		})
		.delegate(container+' span.comment > a', 'click.readr', function(event) { // Call Disqus comment system
			event.preventDefault();
			setParaphActif($(this).closest('p'));
			embedDisqus($(this).attr('href'), $(this).data('disqus-identifier'));
		})
		.bind('mousewheel.readr', function(event, delta) { // Catch user WHEEL (and intent to set custom ZOOM with ctrl + wheel, but fail in Chrome)
			event.preventDefault();
			if (event.ctrlKey) {
				if (delta > 0) setZoom(currentZoom + 5.00);
				else setZoom(currentZoom - 5.00);
			}
			else if (delta > 0) goToScreen(-0.45); // $(this).roundabout_adjustBearing(10.00 * delta);
			else goToScreen(0.45);
		})
		.bind('click.readr', function() {
			killDisqus();
		});
	
	// ----------- DISCUS ---------------------------------------------------------------------------------- //
	
	$disqus_thread.click(function(event){
		event.stopPropagation(); // Stop hidding comment if body click event
	});	
	
	// Prepare Disqus call from <p>
	var killDisqus = function(identifier) {
			$disqus_thread.addClass('fade').empty();
		},
		req = null,
		embedDisqus = function(url, identifier) {
			killDisqus();
			disqus_identifier = identifier || 'pirate';
			disqus_url = url ||  'http://www.b2bweb.fr/bonus/piratons-la-democratie.html';
			if (req) req.abort();
			req = $.ajax({ // Query comments for this <p>
				url: 'http://'+disqus_shortname+'.'+disqus_domain+'/embed.js',
				dataType:'script', async:false, cache:false,
				success: function(XMLHttpRequest, textStatus) {
					$disqus_thread.removeClass('fade');
				}
			});
		};
	
	// ----------- SET PAGINETTES ---------------------------------------------------------------------------------- //
	
	// Focus current page view link
	var setPageActive = function() {
		var currentScroll = $(window).scrollTop(),
			index = ( currentScroll < 1 ? 0 : Math.floor(totalPages / ((totalH + screenH) / currentScroll)) );
		index = (index > 0 ? index : 0);
		$paginettes_links.removeClass('current'); // reset
		$paginettes_links.eq(index).addClass('current');
	};
	
	// Page link click lead to corresponding screen scroll
	var pageClick = function(event) {
		event.preventDefault();
		$(scrollElement).stop(true).animate({scrollTop: (parseInt($(this).text())-1) * screenH}, 1200, 'swing');
		return false; // don't set screen anchor in url, bescause we are relative to window size...
	};
	
	// Build paginettes // One page for each screen that user need to scroll to get to the bottom of the HTML page
	var setPaginette = function() {
		totalH = $container.height();
		screenH = windowHeight();
		totalPages = Math.ceil((totalH + screenH) / screenH);
		
		$paginettesUl.empty();
		if ($paginettes_links) $paginettes_links.unbind('click.readr', pageClick);
		
		var ginettes = '';
		for (var i = 0; i < totalPages; i++) { // one page more, we never know ;)
			ginettes += '<li><a href="#screen_'+(i+1)+'">'+(i+1)+'</a></li>';
		}
		$(ginettes).appendTo($paginettesUl); ginettes = null;
		$paginettes_links = $paginettesUl.find('a');
		$paginettes_links.bind('click.readr', pageClick);
		
		setPageActive();
	};
	
	setPaginette();
	
	// ----------- PAGE ZOOM ---------------------------------------------------------------------------------- //
	
	// Global Text zoom
	var setZoom = function(zoom) {
		currentZoom = (zoom < 30.00 ? 30.00 : zoom); // not readable
		currentZoom = (currentZoom > 60.00 && currentZoom <= 65.00 ? 62.50 : currentZoom); // Set normal
		$('body').css('font-size', zoom+'%'); // $('html,body').css('zoom', currentZoom);
		setTimeout(function(){ // little timeout waiting all the doc text to resize...
			$.waypoints('refresh');
			setPaginette();
		}, 500);
	};
	
	$('#zoomplus').bind('click.readr', function() { setZoom(currentZoom + 5.00); });
	$('#zoomdefault').bind('click.readr', function() { setZoom(62.50); });
	$('#zoommoins').bind('click.readr', function() { setZoom(currentZoom - 5.00); });
	
	// ----------- PAGE/WINDOW SCROLL ---------------------------------------------------------------------------------- //
	
	// Smooth scrolling for ALL links to anchors
	$('a[href^="#"]').live('click.readr', function(event) {
		if (event.isDefaultPrevented()) return;
		event.preventDefault();
		var $this = $(this), target = this.hash, $target = $(target);
		if (!$target) return;
		$target.scrollToMe();
		window.location.hash = target;
	});
	
	// Scroll viewport page by page
	var goToScreen = function(dir) { // 1, -1 or factor
		var currentOffset = $(window).scrollTop(),
			winH = parseInt(windowHeight() * 0.75 * dir);
		$(scrollElement).stop(true).animate({scrollTop: currentOffset + winH}, 800, 'swing');
	};
	
	// extend jQuery, scroll to element
	$.fn.scrollToMe = function(event) {
		return this.each(function() {
			$(scrollElement).stop(true).animate({scrollTop: $(this).offset().top - 30}, 800, 'swing'); // scrollElement == 'html, body'
		});
	};
	
	// Show/hide goto Top link
	var iddle = null;
	$(window)
		.bind('scroll.readr', function(event) {
			$summary.addClass('highlight');
			setPageActive();
			if (iddle) clearTimeout(iddle);
			iddle = setTimeout(function() {
				$('a.top').toggleClass('fade', ($(this).scrollTop() < windowHeight()));
				$summary.removeClass('highlight');
			}, 250);
		})
		.bind('resize.readr', function(event) {
			if (iddle) clearTimeout(iddle);
			iddle = setTimeout(function() {
				setPaginette();
				$summary.addClass('highlight');
				iddle = setTimeout(function() { $summary.removeClass('highlight'); }, 2000);
			}, 250);
		})
	
	// ----------- DOCUMENT MOUSE & KEYS ---------------------------------------------------------------------------------- //
	
	// Listen to key UP and DOWN
	var event2key = {'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown',
					'96':0, '97':1, '98':2, '99':3, '100':4, '101':5, '102':6, '103':7, '104':8, '105':9, // pavé numérique
					'48':0, '49':1, '50':2, '51':3, '52':4, '53':5, '54':6, '55':7, '56':8, '57':9}, // &é"'(-è_çà)=
		pageKey = function(event) {
			var key = event2key[(event.which || event.keyCode)] || '';
			switch(key) {
				case 'up': event.preventDefault(); goToScreen(-1); break;
				case 'down': case 'space': event.preventDefault(); goToScreen(1); break;
				case 'left': event.preventDefault(); setZoom(currentZoom - 5.00); break;
				case 'right': event.preventDefault(); setZoom(currentZoom + 5.00); break;
				case 'enter': event.preventDefault(); $('a#top').scrollToMe(); break;
				default : if (key > 0) $paginettes_links.eq(key-1).trigger('click.readr'); break;
			}
		};
	
	// RESIZER, Listening mouse move only when mouse down...
	var mouseIsMove = function(event) {
			event.preventDefault();
			var newW = event.pageX * 0.7; // Container (section) letf+width == 70% width
			newW = (newW > 1200 ? 1200 : (newW < 420 ? 420 : newW));
			$container.stop(true).animate({width: newW+'px'}, 30);
		},
		returnFalse = function () { return false; },
		mouseIsDown = function(event) {
			if (!$(event.target).is($resizeHandle)) return;
			$('body').bind('mousemove.readr', mouseIsMove);
			//$('*').bind('selectstart.disableTextSelect mousedown.disableTextSelect', returnFalse); // little bug ? so we unset text select
			return false;
		},
		mouseIsUp = function(event) { 
			$('body').unbind('mousemove.readr', mouseIsMove);
			//$('*').unbind('selectstart.disableTextSelect mousedown.disableTextSelect', returnFalse);
		};

	// Allo Doc ?
	$(document)
		.focus()
		.bind('keydown.readr', pageKey)
		.bind('mousedown.readr', mouseIsDown)
		.bind('mouseup.readr click.readr ', mouseIsUp);
	
	// ----------- THIRD PARTY ---------------------------------------------------------------------------------- //
	
	// Load plugins...
	callScript('http://'+disqus_shortname+'.disqus.com/count.js', 1); // get <p> comments counter
	callScript('https://apis.google.com/js/plusone.js', 1); // Social API...
	callScript('http://platform.twitter.com/widgets.js', 1);
	$('iframe#facebook')
		.load(function() { callScript('http://connect.facebook.net/en_US/all.js#appId=235087756512662&amp;xfbml=1', 1); })
		.attr('src', 'http://www.facebook.com/plugins/like.php?app_id=235087756512662&amp;href&amp;send=false'+
			 		'&amp;layout=button_count&amp;width=120&amp;height=20&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font');
	
});