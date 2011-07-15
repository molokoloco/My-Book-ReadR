// Remixed by @molokoloco 2011 - http://b2bweb.fr

var db = function() { 'console' in window && console.log.call(console, arguments); } // Debug tool

/* DISQUS comment system, must by global */
var disqus_url 			= 'http://www.b2bweb.fr/bonus/piratons-la-democratie.html'
	disqus_identifier 	= 'pirate',
	disqus_domain 		= 'disqus.com',
	disqus_shortname 	= 'piratonsladmocratie',
	disqus_title 		= 'Piratons la démocratie';

$(document).ready(function() {
	
	// ----------- VARS ---------------------------------------------------------------------------------- //
	
	var container  		= '#section', // Main text box
		titlesChapter 	= container+' h4', // Choose your HTML tags for the summary
		$titlesChapter 	= $(titlesChapter),
		sectionPrgh 	= container+' article > p',
		sectionPrghActif= container+' > p.p-actif',
		$summary 		= $('#summary'), // Box who print summary
		$summaryUl 		= $summary.find('ul'), // keep a ref to UL
		$summary_links	= null,
		$disqus_thread 	= $('#disqus_thread'),
		debounce 		= null,
		scrollElement 	= 'html, body',
		currentZoom 	= 62.50; // %, let's say that 1em == 10px
		$resizeHandle 	= $('#resizeHandle');
	
	// ----------- ITERATE <h4> AND <p>, build summary ---------------------------------------------------------------------------------- //
	
	$titlesChapter // Create summary based on the H4 tags
		.each(function(i) {
			$(this)
				.data({id:i}) // Attach menu_id to chapters
				.prepend('<a name="chapter_'+(i+1)+'" id="chapter_'+(i+1)+'"></a>') // Add anchors
			$('<li><a href="#chapter_'+(i+1)+'">'+$(this).text()+'</a></li>')
				.appendTo($summaryUl); // Build summary links
		})
		.waypoint({offset:'5%'}); // Create Waypoint obj, foreach H4 // http://imakewebthings.github.com/jquery-waypoints/
	
	$summary_links = $summaryUl.find('a'); // Stock summary links
	
	$(sectionPrgh)
		.waypoint({offset: '35%'}) // highlight continuously current <p>, when scrolling
		.each(function(i) { // Add infobulle comments for each <P> - Disqus system // BECAREFULL : Editing the HTML <p> could lead to comments crash disorder !!!
			$(this).prepend('<span class="comment"><a href="'+disqus_url+'?pirate='+i+'#disqus_thread" data-disqus-identifier="pirate='+i+'" title="Commenter le texte (P#'+i+')">-</a></span>');
		});
	
	// Focus current <p>
	var setParaphActif = function($e) {
		$(sectionPrghActif).removeClass('p-actif'); // reeset
		$e.addClass('p-actif').prev('p').addClass('p-actif').end().next('p').addClass('p-actif');
	};
	
	// ----------- BODY EVENTS ---------------------------------------------------------------------------------- //
	
	$('body') // YES move your body ;)
		.delegate(sectionPrgh, 'waypoint.reached', function(event, direction) { // Waypoint obj, listening viewport scrolling, detecting <p>
			var $active = $(this);
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(function($a, d) {
				if (d === 'up') $a = $a.prev('p');
				if (!$a.length) $a.end();
				setParaphActif($a);
			}, 1250, $active, direction);
		})
		.delegate(sectionPrgh, 'mouseenter', function(event) { // Subtelly(?) hightlight paragraph // Focus with scroll or mouseenter...
			var $active = $(this);
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(function($a) {
				setParaphActif($a);
			}, 1400, $active);
		})
		.delegate(sectionPrgh, 'mouseleave', function(event) {
			if (debounce) clearTimeout(debounce);
		})
		.delegate(titlesChapter, 'waypoint.reached', function(event, direction) { // Waypoint obj, detecting <h4>
			var i = $(this).data('id');
			$summary_links
				.removeClass('current')
				.eq(i).addClass('current'); // set selected summary link
		})
		.delegate(container+' span.comment > a', 'click', function(event) { // Call Disqus comment system
			event.preventDefault();
			setParaphActif($(this).closest('p'));
			embedDisqus($(this).attr('href'), $(this).data('disqus-identifier'));
		})
		.bind('mousewheel', function(event, delta) { // Catch user WHEEL (and intent to set custom ZOOM with ctrl + wheel, but fail in Chrome)
			event.preventDefault();
			if (event.ctrlKey) {
				if (delta > 0) setZoom(currentZoom + 5.00);
				else setZoom(currentZoom - 5.00);
			}
			else if (delta > 0) goToScreen(-0.45); // $(this).roundabout_adjustBearing(10.00 * delta);
			else goToScreen(0.45);
		})
		.bind('click', function() {
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
	
	// ----------- PAGE ZOOM ---------------------------------------------------------------------------------- //
	
	// Global Text zoom
	var setZoom = function(zoom) {
		currentZoom = (zoom < 30.00 ? 30.00 : zoom); // not readable
		currentZoom = (currentZoom > 60.00 && currentZoom <= 65.00 ? 62.50 : currentZoom); // Set normal
		$('body').css('font-size', zoom+'%'); // $('html,body').css('zoom', currentZoom);
		$.waypoints('refresh');
	};
	
	$('#zoomplus').bind('click', function() { setZoom(currentZoom + 5.00); });
	$('#zoomdefault').bind('click', function() { setZoom(62.50); });
	$('#zoommoins').bind('click', function() { setZoom(currentZoom - 5.00); });
	
	// ----------- PAGE SCROLL ---------------------------------------------------------------------------------- //
	
	// Scroll viewport page by page
	var goToScreen = function(dir) { // 1, -1 or factor
		var currentOffset = $(window).scrollTop(),
			winH = parseInt($(window).height() * 0.75 * dir);
		$(scrollElement).stop(true).animate({scrollTop: currentOffset + winH}, 800, 'swing');
	};
	
	// extend jQuery, scroll to element
	$.fn.scrollToMe = function(event) {
		return this.each(function() {
			$(scrollElement).stop(true).animate({scrollTop: $(this).offset().top - 20}, 800, 'swing'); // scrollElement == 'html, body'
		});
	};
	
	// http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
	$(scrollElement).each(function () { // 'html, body'
		var initScrollTop = $(this).attr('scrollTop'); // Produce NaN on my #FF4 / Chrome 11, but works...
		$(this).attr('scrollTop', initScrollTop + 1);
		if ($(this).attr('scrollTop') == initScrollTop + 1) {
			scrollElement = this.nodeName.toLowerCase();
			$(this).attr('scrollTop', initScrollTop);
			return false;
		}
	});
	
	// Smooth scrolling for ALL links to anchors
	$('a[href^="#"]').click(function(event) {
		event.preventDefault();
		var $this = $(this), target = this.hash, $target = $(target);
		if (!$target) return;
		$target.scrollToMe();
		window.location.hash = target;
	});
	
	// ----------- WINDOW EVENTS ---------------------------------------------------------------------------------- //
	
	// Show/hide goto Top link
	var iddle = null;
	$(window)
		.bind('scroll', function() {
			$summary.addClass('highlight');
			if (iddle) clearTimeout(iddle);
			iddle = setTimeout(function() {
				$('a.top').toggleClass('fade', ($(this).scrollTop() < $(window).height()));
				$summary.removeClass('highlight');
			}, 250);
		})
		.bind('resize', function() {
			$(container).stop(true).animate({width: '60%'}, 50);
		});
	
	// ----------- DOCUMENT EVENTS & RESIZE ---------------------------------------------------------------------------------- //
	
	// Listen to key UP and DOWN
	var event2key = {'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown'},
		e2key = function(e) { return event2key[(e.which || e.keyCode)] || ''; };
		pageKey = function(event) {
			switch(e2key(event)) {
				case 'up': event.preventDefault(); goToScreen(-1); break;
				case 'down': case 'space': event.preventDefault(); goToScreen(1); break;
				case 'left': event.preventDefault(); setZoom(currentZoom - 5.00); break;
				case 'right': event.preventDefault(); setZoom(currentZoom + 5.00); break;
				case 'enter': event.preventDefault(); $('a#top').scrollToMe(); break;
			}
		};
	
	// RESIZER, Listening mouse move only when mouse down...
	var mouseIsMove = function(event) {
			event.preventDefault();
			var newW = event.pageX * 0.7; // Container (section) letf+width == 70% width
			newW = (newW > 1200 ? 1200 : (newW < 420 ? 420 : newW));
			$(container).stop(true).animate({width: newW+'px'}, 30);
		},
		mouseIsDown = function(event) {
			if ($(event.target).is($resizeHandle)) $('body').bind('mousemove', mouseIsMove);
		},
		mouseIsUp = function(event) { 
			$('body').unbind('mousemove', mouseIsMove);
		};
	
	// Allo Doc ?
	$(document)
		.focus()
		.bind('keydown', pageKey)
		.bind('mousedown', mouseIsDown)
		.bind('mouseup click ', mouseIsUp);
	
	// ----------- THIRD PARTY ---------------------------------------------------------------------------------- //
	
	// Call async scripts
	var callScript = function(src) { $.ajax({url:src, dataType:'script', async:true, cache:true}); };
	
	// Load plugins...
	callScript('http://'+disqus_shortname+'.disqus.com/count.js'); // get <p> comments counter
	callScript('https://apis.google.com/js/plusone.js'); // Social API...
	callScript('http://platform.twitter.com/widgets.js');
	callScript('http://connect.facebook.net/en_US/all.js#appId=235087756512662&amp;xfbml=1');
	
});