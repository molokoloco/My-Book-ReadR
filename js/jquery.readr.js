// Remixed by @molokoloco 2011 - http://b2bweb.fr
// Src : https://github.com/molokoloco/My-Book-ReadR/ - V0.99


/* Optionnals DISQUS comments system, must by global */
var disqus_url 				= 'http://www.b2bweb.fr/bonus/piratons-la-democratie.html', // REMOVE url to kill Discuss
	disqus_identifier 		= 'pirate',
	disqus_domain 			= 'disqus.com',
	disqus_shortname 		= 'piratonsladmocratie',
	disqus_title 			= 'Piratons la d&eacute;mocratie';

$(document).ready(function() {
	
	// ---------------------------------------------------- Your welcome to the events-o-drome -----------//
	
	var name				= 'readr'; // this namespace
	
	// ----------- VARS ---------------------------------------------------------------------------------- //
	
	var _db_ 				= false, // Logs all functions and events... very consuming, but also very helpfull !!!
		disqusEnabled 		= (disqus_url ? true : false); // Enable DISQUS
	
	if (_db_ && 'console' in window && 'time' in console) { console.warn('Starting logs for : '+name); console.time(name); }
	
	var $window 			= $(window),
		$document 			= $(document),
		$body 				= $('body');
	
	var container  			= '#section', // Main text box
		$container 			= $(container),
			titlesChapter 	= container+' h1,'+container+' h2,'+container+' h4', // Choose your <Hx> tag(s) for summary, jquery render back in the correct DOM order
			$titlesChapter 	= $(titlesChapter),
			sectionPrgh 	= container+' article > p:not(:empty)', //  Select all section child p : mini forum DISCUS sur chaque element
			$sectionPrgh 	= $(sectionPrgh),
			sectionPrghActif= container+' article > p.p-actif',
		$aside 				= $('#aside'), // Main Nav (Dialog) Box who print summary + paginettes
			$asideDialogue	= '',
			$summaryUl 		= $aside.find('ul#summary'), // keep a ref to UL
			$summary_links	= '',
			$paginettesUl 	= $aside.find('ul#paginettes'), // keep a ref to UL
			$paginettes_links= '',
		disqus_thread 		= '#disqus_thread', // ID element + HASH url, imposed by Disqus
		$disqus_thread 		= $(disqus_thread),
		scrollElement 		= 'html, body',
		$resizeHandle 		= $('#resizeHandle'),
		$aTop 				= $('a.top'),
		$minibar 			= $('#minibar');
	
	var currentZoom 		= 62.50, // %, let's say that 1em == 10px
		totalH 				= 0,
		screenW				= 0,
		screenH				= 0,
		totalPages			= 0,
		factor				= 0,
		newAnchror 			= null,
		waypoinTmr 			= null,
		prghTmr 			= null,
		isAnimated			= false;	
	
	
	var db = function() { 'console' in window && console.log.call(console, arguments); } // Debug tool // Comment inside in prod
	
	// ----------- JS DEPENDENCY ---------------------------------------------------------------------------------- //
	
	// Call external scripts
	var callScript = function(src, async) { $.ajax({url:src, dataType:'script', async:async, cache:true, error:function(){ alert('Sorry, some JS file not found : '+src); }}); };
	
	// Load plugins...
	callScript('./js/waypoints.min.js', 0); // Trigger event when element scrollTo view
	callScript('./js/jquery.mousewheel.min.js', 0); // Your mouse, the wheel
	callScript('./js/jquery.zclip.min.js', 0); // Copy to clipboard
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////:callScript('./js/jquery.copy.js', 0);			
	
	// ----------- BROWSER SET BASE ---------------------------------------------------------------------------------- //
	
	var getWinWidth = function() {
			return $window.width(); // iphone ? ((window.innerWidth && window.innerWidth > 0) ? window.innerWidth : $window.width());
		},
		getWinHeight = function() {
			return $window.height(); // iphone ? ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $window.height());
		};
	
	screenW = getWinWidth();
	screenH = getWinHeight();
	
	// Find scrollElement // http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
	$(scrollElement).each(function (i) { // 'html, body'
		var initScrollTop = $(this).scrollTop(); // Produce NaN on my #FF4 / Chrome 11, but works...
		$(this).scrollTop(initScrollTop + 1);
		if ($(this).scrollTop() == initScrollTop + 1) {
			scrollElement = this.nodeName.toLowerCase();
			if (_db_) db('scrollElement=', scrollElement);
			return false;
		}
	});

	// ----------- ITERATE <h4> AND <p>, build summary ---------------------------------------------------------------------------------- //
	
	$sectionPrgh.find('br').after('<span class="indent"></span>'); // Typo polish for paragraphes

	$.waypoints.settings.scrollThrottle = 200; // Don't flood
	$.waypoints.settings.resizeThrottle = 200;
	
	var titles = '';
	$titlesChapter // Create summary based on the H4 tags
		.each(function(i) {
			$(this)
				.data({id:i}) // Attach menu_id to chapters
				.before('<a name="chapter_'+(i+1)+'" id="chapter_'+(i+1)+'"></a>') // Add anchors, anchor position is important because we go exactly to her browser offset
			// indentation (base on h1, h2, ...) : <H[x]> * 3px >>> (parseInt(this.nodeName[1])-1)*3
			titles += '<li style="padding-left:'+((parseInt(this.nodeName[1])-1)*3)+'px;"><a href="#chapter_'+(i+1)+'" data-id="'+i+'">'+$(this).text()+'</a></li>'; // Build summary links
		})
		.waypoint({offset:'10%'}); // Create Waypoint obj, foreach H4 // http://imakewebthings.github.com/jquery-waypoints/
	
	$(titles).appendTo($summaryUl); titles = null;
	$summary_links = $summaryUl.find('a'); // Stock summary links
	if (_db_) db('$titlesChapter=', $titlesChapter.length);
	
	$summary_links.bind('click.'+name, function(event) {
		setTimeout(function(i) { // Normally waypoint trigger with offset of 23%, but scrollToMe scroll to offset 30px, with 800ms delay
			$titlesChapter.eq(i).trigger('waypoint.reached'); //  Force event if summary click
		}, 1000, $(this).data('id'));
	});
	
	$sectionPrgh.waypoint({offset:'35%'}) // highlight continuously current <p>, when scrolling
	if (_db_) db('$sectionPrgh=', $sectionPrgh.length);
	
	// Focus current <p>
	var setParaphActif = function($e) {
		if (_db_) db('setParaphActif()');
		$(sectionPrghActif).removeClass('p-actif'); // reset
		$e.addClass('p-actif').prev('p').addClass('p-actif').end().next('p').addClass('p-actif');
	};
	
	// ----------- VIEWPORT SCREEN // SET PAGINETTES ---------------------------------------------------------------------------------- //
	
	// Focus current page view link
	var setPageActive = function() {
		if (_db_) db('setPageActive()');
		var currentScroll = $window.scrollTop(),
			index = ( currentScroll < 1 ? 0 : Math.floor(totalPages / ((totalH + screenH) / currentScroll)) );
		index = (index > 0 ? index : 0);
		$paginettes_links
			.removeClass('current') // reset
			.eq(index).addClass('current');
	};
	
	// Paginette links click lead to corresponding screen scroll
	var pageClick = function(event) {
		if (_db_) db('pageClick()');
		// event.preventDefault(); // Let's pageview update hash
		myScrollTo((parseInt($(this).text())-1) * screenH);
		// return false; // set screen anchor in url, even if we are relative to window size...
	};
	
	// Build paginettes // One page for each screen that user need to scroll to get to the bottom of the HTML page
	var setPaginette = function() {
		if (_db_) db('setPaginette()');
		totalH = $container.height();
		totalPages = Math.ceil((totalH + screenH) / screenH);
		
		$paginettesUl.empty();
		if ($paginettes_links) $paginettes_links.unbind('click.'+name, pageClick);
		
		var ginettes = '';
		for (var i = 0; i < totalPages; i++) { // one page more, we never know ;)
			ginettes += '<li><a href="#screen_'+(i+1)+'">'+(i+1)+'</a></li>';
		}
		$(ginettes).appendTo($paginettesUl); ginettes = null;
		$paginettes_links = $paginettesUl.find('a');
		$paginettes_links.bind('click.'+name, pageClick);
		
		setPageActive();
	};
	
	setPaginette();
	
	// ----------- BODY EVENTS ---------------------------------------------------------------------------------- //
	
	$body // YES listen your body ;)
		.delegate(titlesChapter, 'waypoint.reached', function(event, direction) { // Waypoint obj, detecting <h4>
			var i = $(this).data('id'),
				target = $summary_links
									.removeClass('current')
									.eq((direction == 'up' && i > 1 ? i - 1 : i)) // detect Chaper below when scrolling to top
									.addClass('current')
									.attr('href'); // get selected summary link anchor & 
			if (_db_) db('titlesChapter.waypoint.reached i', i);
			if (isAnimated) return; // Only set once with selected link
			if (waypoinTmr) clearTimeout(waypoinTmr);
			waypoinTmr = setTimeout(function(t) { // waypoinTmr, if we scroll from bottom to top, we are flooded !
				if (_db_) db('titlesChapter.waypoint.waypoinTmr target ', t, window.location.hash);
				if (window.location.hash == t) return; // Only set once !
				window.location.hash = t+'_screen'; // AUTO-upadte location while scrolling with fake hash, preventing scroll, when reloading we detect it
				$(scrollElement).stop();
				if (_db_) db('titlesChapter.waypoint.reached waypoinTmr target ', t, 'SET');	
			}, 300, target);
		})
		.delegate(sectionPrgh, 'waypoint.reached', function(event, direction) { // Waypoint obj, listening viewport scrolling, detecting <p>
			if (_db_) db('sectionPrgh.waypoint.reached');
			var $active = $(this);
			if (prghTmr) clearTimeout(prghTmr);
			prghTmr = setTimeout(function($a, d) { // hightlighted <p> keep persistent when you scroll
				if (_db_) db('sectionPrgh.waypoint.waypoinTmr');
				if (d === 'up') $a = $a.prev('p');
				if (!$a.length) $a.end();
				setParaphActif($a);
			}, 1250, $active, direction); // p have time to wait...
		})
		.delegate(sectionPrgh, 'mouseenter.'+name, function(event) { // Subtelly(?) hightlight paragraph // Focus with scroll or mouseenter...
			if (_db_) db('sectionPrgh.mouseenter');
			var $active = $(this);
			if (prghTmr) clearTimeout(prghTmr);
			prghTmr = setTimeout(function($a) {
				if (_db_) db('sectionPrgh.mouseenter.waypoinTmr');
				setParaphActif($a);
			}, 1400, $active);
		})
		.delegate(sectionPrgh, 'mouseleave.'+name, function(event) { //  We SET !ALL! the EVENT with our plugin NAMESPACE '.readr' so we can UNSET all with $.unbind('.readr')
			if (prghTmr) clearTimeout(prghTmr);
		})
		.delegate(container+' span.comment > a', 'click.'+name, function(event) { // Call Disqus comment system
			if (_db_) db('comment.click');
			event.preventDefault();
			setParaphActif($(this).closest('p'));
			if (disqusEnabled) embedDisqus($(this).attr('href'), $(this).data('disqus-identifier'));
		})
		.bind('mousewheel', function(event, delta) { // Catch user WHEEL (and intent to set custom ZOOM with ctrl + wheel, but fail in Chrome)
			if (_db_) db('body.mousewheel(delta)', delta);
			event.preventDefault();
			if (event.ctrlKey) {
				if (delta > 0) setZoom(currentZoom + 5.00);
				else setZoom(currentZoom - 5.00);
			}
			else if (delta > 0) goToScreen(-0.5); // $(this).roundabout_adjustBearing(10.00 * delta);
			else goToScreen(0.5);
		});
	
	// ----------- DISCUS ---------------------------------------------------------------------------------- //
	
	if (disqusEnabled) {		
		$sectionPrgh.each(function(i) { // Add infobulle comments for each <P> - Disqus system // BE CAREFULL : Editing the "STATICs" HTML <p> could lead to comments crash disorder !!!
			$(this).append('<span class="comment"><a href="'+disqus_url+'?pirate='+i+disqus_thread+'" data-disqus-identifier="pirate='+i+'" id="pirate_'+i+'" title="Commenter le texte (P#'+i+')">-</a></span>');
			// href == page.html?pirate=78#disqus_thread
		});
	}
	else $disqus_thread.remove();
	
	// Prepare Disqus call from <p>
	var killDisqus = function(identifier) {
			if (_db_) db('killDisqus()');
			$disqus_thread.addClass('fade').empty();
			$document.unbind('click.'+name, killDisqus);
			$disqus_thread.unbind('click.'+name, notKillDisqus);
		}
		notKillDisqus = function(event) {
			if (_db_) db('disqus.click');								  
			event.stopPropagation(); // Stop hidding comment if body click event
		},
		$req = null,
		embedDisqus = function(url, identifier) {
			if (_db_) db('embedDisqus()');
			killDisqus();
			disqus_identifier = identifier || 'pirate';
			disqus_url = url ||  'http://www.b2bweb.fr/bonus/piratons-la-democratie.html';
			if ($req) $req.abort();
			$req = $.ajax({ // Query comments for this <p>
				url: 'http://'+disqus_shortname+'.'+disqus_domain+'/embed.js',
				dataType:'script', async:false, cache:false,
				success: function(XMLHttpRequest, textStatus) {
					$disqus_thread.removeClass('fade');
					$disqus_thread.bind('click.'+name, notKillDisqus); // Attach event in good order... SO CLICKING OUSTSIDE close the popup
					$document.bind('click.'+name, killDisqus);
				}
			});
		};
	
	// ----------- PAGE ZOOM ---------------------------------------------------------------------------------- //
	
	// Global Text zoom
	var setZoom = function(zoom) {
		if (_db_) db('setZoom()');
		currentZoom = (zoom < 30.00 ? 30.00 : zoom); // not readable
		currentZoom = (currentZoom > 60.00 && currentZoom <= 65.00 ? 62.50 : currentZoom); // Set round Normal size
		$body.css('font-size', zoom+'%'); // $('html,body').css('zoom', currentZoom);
		setTimeout(function(){ // little timeout waiting all the doc text to resize...
			$window.trigger('resize.'+name);
		}, 500);
	};
	
	$('#zoomplus').bind('click.'+name, function() { setZoom(currentZoom + 5.00); });
	$('#zoomdefault').bind('click.'+name, function() { setZoom(62.50); });
	$('#zoommoins').bind('click.'+name, function() { setZoom(currentZoom - 5.00); });
	
	var fullScreen = function () { // Access from outside
		if (!window.screen || !window.screen.availHeight) alert('F11 pour naviger comfortablement ;)');
		self.moveTo(0, 0);
		self.resizeTo(window.screen.availHeight + 0.8, window.screen.availWidth * 0.8);
	};
	
	$('#fullscreen').bind('click.'+name, function() { fullScreen(); });
	
	// ----------- JQUERY UI DIALOG for Aside ---------------------------------------------------------------------------------- //
	
	var asideOffset 	= $aside.offset(), // Stock initial CSS positionning
		asideWidth 		= $aside.width(),
		asideHeight 	= $aside.height(),
		asideHeaderH	= 23; // Dialog Header Toolbar height
	
	var setAsidePos = function() { // FIX jQuery UI draggable : reverse top/left with bottom/right (keep aligned when window resize)
		if (_db_) db('setAsidePos()');
		asideWidth 		= $asideDialogue.outerWidth();
		asideHeight 	= $asideDialogue.outerHeight();
		asideLeft 		= parseInt($asideDialogue.css('left')); // refresh
		asideTop 		= parseInt($asideDialogue.css('top'));
		$asideDialogue.css({
			//position:'fixed',
			top:'',
			left:'',
			bottom:(screenH - (asideTop + asideHeight))+'px',
			right:(screenW - (asideLeft + asideWidth))+'px'
		});
		//if ($asideDialogue.height() > 0) $asideDialogue.height('');
		protectAsidePos();
	};
	
	var margin = 12;
	var protectAsidePos = function() { // Event window resize // are we outside the bounding box ?
		if (_db_) db('protectAsidePos()');
		asideWidth 		= $asideDialogue.outerWidth();
		asideHeight 	= $asideDialogue.outerHeight(); // aside Height can change because paginettes are living on resize
		asideRight 		= parseInt($asideDialogue.css('right'));
		asideBottom 	= parseInt($asideDialogue.css('bottom'));
		if (asideRight < margin) asideRight = margin; // intent to keep margin
		if (asideBottom < margin) asideBottom = margin;
		if ((asideHeight + (margin * 2)) > screenH) { // Vertical scroll in Dialog
				asideHeight = screenH - (margin * 2) - asideHeaderH;
				$aside.height(asideHeight+'px');
				asideBottom = margin;
		}
		else $aside.height('');
		$asideDialogue.css({bottom:asideBottom+'px', right:asideRight+'px'});
	};
	
	$aside
		.removeClass('aside roundered') // Reset initial CSS positionning
		.dialog({ // CREATE - Draggable + Resizable
			dialogClass: 	'aside', // apply CSS fixed positionning
			resizable:		false, // that ok
			position:		[asideOffset.left, asideOffset.top - asideHeaderH],
			scroll: 		false, // Don't scroll since we are fixed // not work ?
			width: 			asideWidth,
			height: 		asideHeight + asideHeaderH, // + .ui-dialog-titlebar
			autoOpen: true, show:'', hide:'',
			open: function() { // We hack default jQuery UI...
				if (_db_) db('aside.dialog.open()');
				$asideDialogue = $aside.parent('div.ui-dialog').eq(0).addClass('roundered'); // Select current Dialog Box, switch roudered class to the new Dialog Box
				$asideDialogue.find('.ui-dialog-titlebar-close').replaceWith('<a href="javascript:void(0)" class="ui-dialog-titlebar-toggle" role="button" title="Reduire/Agrandir">Toggle</a>'); // Hack default close()
				$aside.height('').width('100%');
				setAsidePos();
			},
			dragStop: setAsidePos
		});
	
	$('div.ui-dialog .ui-dialog-titlebar-toggle').bind('click.'+name, function(event){ // Toggle aside...
		if (_db_) db('dialog-titlebar-toggle.click');
		event.preventDefault();
		if (parseInt($asideDialogue.height()) <= asideHeaderH) {
			$asideDialogue.height(''); // reset, animated through CSS transition...
			setTimeout(function() { protectAsidePos(); }, 1000); // so we wait
			$(this).removeClass('toggled');
		}
		else {
			$asideDialogue.height(asideHeaderH+'px');
			$(this).addClass('toggled');
		}
		return false;
	});
	
	// ----------- PAGE/WINDOW SCROLL ---------------------------------------------------------------------------------- //
	
	// Call page scrolling to a value
	var myScrollTo = function(scrollTop) {
		if (_db_) db('myScrollTo(scrollTop)', scrollTop);
		isAnimated = true; // kill waypoint AUTO hash
		var currentS = $(scrollElement).scrollTop();
		$(scrollElement)
			.stop(true, false)
			.animate(
				{scrollTop: scrollTop},
				{
					duration: 250 + Math.min(3600, Math.abs(scrollTop - currentS) * 0.4), // Duration depend on distance...
					complete:function() { // Listenner of scroll finish...
						if (_db_) db('myScrollTo.complete');
						if (newAnchror) window.location.hash = newAnchror;
						newAnchror = null;
						isAnimated = false;
					}
				}
			);
	};
	
	// Scroll viewport page by paginette
	var goToScreen = function(dir) { // 1, -1 or factor
		if (_db_) db('goToScreen(dir)', dir);
		var currentOffset = parseInt($window.scrollTop(), 10),
			winH = parseInt(screenH * 0.75 * dir); // 75% de la hauteur visible comme unite
		myScrollTo(currentOffset + winH);
	};
	
	// Extend jQuery, call page scrolling to a element himself
	$.fn.scrollToMe = function(target) {
		return this.each(function() {
			if (_db_) db('scrollToMe(target)', target);
			if (target) newAnchror = target; // Update hash, but after scroll anim
			myScrollTo(parseInt($(this).offset().top, 10));
		});
	};
	
	// Smooth scrolling for ALL links with Anchors // We're not using LIVE, for performance, because all links are already created, normally...
	$('a[href^="#"]').bind('click.'+name, function(event) {
		if (event.isDefaultPrevented()) return;	// Link #top want special event...
		event.preventDefault();
		var $this = $(this), target = this.hash, $target = $(target);
		if (_db_) db('a.live hash ', target, 'SET?');
		if (!$target) return;
		$target.scrollToMe(target);
		return false; // don't open a#hash
	});
	
	
	// Global EVENT.RESIZE dispatcher, ok TODO with pub/sub pattern... // CALL IT with : $window.trigger('resize.'+name);
	var windowTmr = null,
		windowViewTmr = null;
	
	var resizeRefreshEvent = function() {
		if (_db_) db('resizeRefreshEvent() window.resize.waypoinTmr');
		screenW = getWinWidth(); // UPDATE window SIZE...
		screenH = getWinHeight();
		handleResizeRepos();
		setPaginette();
		protectAsidePos();
		$asideDialogue.addClass('highlight');
		$.waypoints('refresh');
		windowTmr = setTimeout(function() { $asideDialogue.removeClass('highlight'); }, 2000); //  HIGHTLIGH aside for 2s when repos
	};
	
	// Show/hide goto Top link
	$window
		.bind('scroll.'+name, function(event) {
			$asideDialogue.addClass('highlight');
			if (!windowViewTmr) windowViewTmr = setInterval(setPageActive, 100); // Optimize, pageView rendering, interval of 100ms
			if (windowTmr) clearTimeout(windowTmr);
			windowTmr = setTimeout(function(st, sh) { // Wait a pause of 300ms before triggering
				if (_db_) db('window.scroll.waypoinTmr');
				clearInterval(windowViewTmr);
				windowViewTmr = null;
				$aTop.toggleClass('fade', (st < sh));
				$asideDialogue.removeClass('highlight');
			}, 300, $(this).scrollTop(), screenH);
        	// if (screenH +  $(this).scrollTop() >= $document.height()) {} // We're at the PAGE bottom
		})
		.bind('resize.'+name, function(event) { // Resize Event
			if (windowTmr) clearTimeout(windowTmr);
			windowTmr = setTimeout(resizeRefreshEvent, 250); // trottle resize
		})
	
	// index.html?name=foo -> 	name = getUrlVars()['name']; 
	var _vars = {},
		getUrlVars = function() {
				if (_vars.length > 0) return _vars;
				window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { _vars[key] = value; });
				return _vars;
		},
		initTarget = window.location.hash;
	
	// Catch DISCUS comment back link, http://www.b2bweb.fr/bonus/piratons-la-democratie.html?pirate=3
	if (getUrlVars()['pirate']) {
		if (_db_) db('getUrlVars()', getUrlVars());
		$('a#pirate_'+getUrlVars()['pirate']).scrollToMe('#pirate_'+getUrlVars()['pirate']); // scroll to corrsponding Praragraphe Forum iID comment
	}
	else if (initTarget) { // #chapter_4_screen (fake) == #chapter_4 (real one)
		initTarget = initTarget.split('_screen'); // Catch fake hash setted with waypoint chapters scroll
		if (initTarget.length > 0) {
			if (_db_) db('auto init target', initTarget[0]);
			$(initTarget[0]).scrollToMe();
		}
	}
	
	// ----------- DOCUMENT MOUSE & KEYS ---------------------------------------------------------------------------------- //
	
	// Doubleclick set content editable ;)
	var makeEditable = function(event) {
		if (_db_) db('container.dblclick');
		var edit = ($container.attr('contenteditable') != 'true' ? true : false);
		$container
			.attr('contenteditable', (edit ? 'true' : 'false'))
			.toggleClass('editable', edit)
			.attr('title', (edit ? 'Vous pouvez maintenant editer le texte (Double clic pour sortir)' : ''));
	};
	$container.bind('dblclick.'+name,makeEditable);
	
	// Listen to key UP and DOWN
	var event2key = {'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown',
					'96':0, '97':1, '98':2, '99':3, '100':4, '101':5, '102':6, '103':7, '104':8, '105':9, // pavé numérique
					'48':0, '49':1, '50':2, '51':3, '52':4, '53':5, '54':6, '55':7, '56':8, '57':9}, // &é"'(-è_çà)=
		pageKey = function(event) {
			var key = event2key[(event.which || event.keyCode)] || '';
			if (_db_) db('pageKey(key)', key);
			switch(key) {
				case 'up': event.preventDefault(); goToScreen(-1); break;
				case 'down':
				case 'space': event.preventDefault(); goToScreen(1); break;
				case 'left': event.preventDefault(); setZoom(currentZoom - 5.00); break;
				case 'right': event.preventDefault(); setZoom(currentZoom + 5.00); break;
				case 'enter': event.preventDefault(); myScrollTo(0); break;
				default : if (key > 0) $paginettes_links.eq(key-1).trigger('click.'+name); break;
			}
		};
	
	// Copy to Clipboard !!! Need Flash : jquery.zclip.js // http://www.steamdev.com/zclip/
	var myClipboard = function() {
		if (_db_) db('clipboard()', textSelected);
		$('#copier').zclip({
			path:'./js/ZeroClipboard.swf',
			copy:textSelected,
			beforeCopy:function(){},
			afterCopy:function(){ $('#copier').zclip('remove'); }
		});	
	};
	
	// Minibar show when mouse is up and some text is selected...
	var showMiniBar = function(pageX, pageY) {
			if (_db_) db('showMiniBar(pageX,pageY)', pageX, pageY, textSelected);
			clearMiniBar();
			$minibar
				.stop(true, false)
				.css({top:(parseInt(pageY, 10)+25)+'px', left:(parseInt(pageX, 10)+5)+'px'})
				.show().fadeIn(500);
			barTmr = setTimeout(killMiniBar, 2600);
			myClipboard();
		}
		killMiniBar = function() { 
			$minibar.fadeOut(500, function(){ $(this).hide(); });
		},
		protectMiniBar = function() {
			clearMiniBar();
			barTmr = setTimeout(killMiniBar, 2600); // re-wait
		},
		clearMiniBar = function() {
			if (barTmr) clearTimeout(barTmr);
		};
	
	$minibar.bind('mouseover.'+name, protectMiniBar).fadeOut();
	// $('#copier').bind('click.'+name, function() {}); //  OverRided by ZeroClipboard.swf
	$('#editer').bind('click.'+name, makeEditable);
	
	// Section RESIZER, Listening mouse move only when mouse down...
	var mouseTmr = null, barTmr = null,
		handleW = $resizeHandle.width(),
		newW = 0, gesturesY = 0,
		textSelected = '';
	
	var handleResizeRepos = function() {
		if (_db_) db('resizeHandle.handleResizeRepos()');
		if (mouseTmr) clearInterval(mouseTmr);
		mouseTmr = setInterval(function() { // wait for all the texte to be resized...
			$resizeHandle.css({
				top: (parseInt($container.offset().top, 10))+'px',
				left: (parseInt($container.offset().left, 10) + $container.outerWidth() - handleW)+'px',
				height:($container.outerHeight() - 2)+'px'
			});
		}, 150);
	};
	
	var mouseIsMoveResize = function(event) {
			//if (_db_) db('resizeHandle.mouseIsMoveResize()');
			$resizeHandle.css({left: (parseInt(event.pageX, 10) - (handleW/2))+'px'});
			if (mouseTmr) clearInterval(mouseTmr);
			mouseTmr = setInterval(function(mouseY) {
				if (_db_) db('resizeHandle.mouseIsMoveResize.waypoinTmr');
				// Work with : #section position:absolute;top:5%;left:8%;width:60%;
				// newW = (mouseY - parseInt($container.offset().left) - 100 + (handleW/2)); /* / */ // Container (section) : 100 == 50px padding * 2
				// newW = (newW > 1000 ? 1000 : (newW < 280 ? 280 : newW));
				// $container.width(newW+'px');
				// Work with : #section position:relative;margin:5% 25% 5% 8%;
				newW =  100 - (((mouseY + (handleW/2)) / screenW) * 100);
				newW = (newW > 70 ? 70 : (newW < 2 ? 2 : newW));
				$container.css({marginRight:newW+'%'});
				$window.trigger('resize.'+name); // update view with new text height
			}, 800,  parseInt(event.pageX, 10));
		},
		mouseIsMoveScrollY = function(event) {
			if (_db_) db('resizeHandle.mouseIsMoveScrollY()');
			window.scrollBy(0, gesturesY - parseInt(event.pageY, 10)); // Mouse drag window vertical ccroll
		},
		mouseIsDown = function(event) {
			if (_db_) db('document.mouseIsDown()');
			if ($(event.target).is($resizeHandle)) {
				if (_db_) db('resizeHandle.mouseIsDown(resize)');
				event.preventDefault();
				$resizeHandle.css('background', 'rgba(0,0,0,0.2)');
				$body.bind('mousemove.'+name, mouseIsMoveResize);
				return false;
			}
			else if ($(event.target).is($document) || $(event.target).is($body) || $(event.target).is($container) || $(event.target).is('article')) { // Catch Doc clic for Vertical Scroll
				if (_db_) db('resizeHandle.mouseIsDown(section)');
				event.preventDefault();
				gesturesY = parseInt(event.pageY, 10);
				$body.bind('mousemove.'+name, mouseIsMoveScrollY);
				return false;
			}
		},
		mouseIsUp = function(event) { 
			if (_db_) db('document.mouseIsUp()');
			// event.preventDefault();
			$body.unbind('mousemove.'+name, mouseIsMoveResize);
			$resizeHandle.css('background', '');
			$body.unbind('mousemove.'+name, mouseIsMoveScrollY);
			// Show minibar ?
			if ($(event.target).parents(container).length < 1) return; // copy/Edit text only in main section
			textSelected = ''; // Capture selected text...
			if 		('getSelection' in window) 		textSelected = window.getSelection();
			else if ('getSelection' in document) 	textSelected = document.getSelection();
			else if ('selection' in document) 		textSelected = document.selection.createRange().text;
			textSelected = $.trim(textSelected)+'';
			if (textSelected != '') showMiniBar(event.pageX, event.pageY);
		};
	
	handleResizeRepos();
	
	// Allo Doc ?
	$document
		.focus() // bing !
		.bind('mousedown.'+name, mouseIsDown)
		.bind('keydown.'+name, pageKey)
		.bind('mouseup.'+name+' click.'+name, mouseIsUp);
	
	// LOG end time for reading this...
	if (_db_ && 'console' in window && 'time' in console) {
		console.warn('End of script reached in :');
		console.timeEnd(name);
	}
	
	// ----------- THIRD PARTY ---------------------------------------------------------------------------------- //
	
	// Load plugins...
	/*callScript('http://'+disqus_shortname+'.disqus.com/count.js', 1); // get <p> comments counter
	callScript('https://apis.google.com/js/plusone.js', 1); // Social API...
	callScript('http://platform.twitter.com/widgets.js', 1);
	$('iframe#facebook')
		.load(function() { callScript('http://connect.facebook.net/en_US/all.js#appId=235087756512662&amp;xfbml=1', 1); })
		.attr('src', 'http://www.facebook.com/plugins/like.php?app_id=235087756512662&amp;href&amp;send=false'+
			 		'&amp;layout=button_count&amp;width=120&amp;height=20&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font');*/
	//$('script#discusRecentsComments') // This one need to be loaded in-place ?
		//.attr('src', 'http://piratonsladmocratie.disqus.com/recent_comments_widget.js?num_items=5&hide_avatars=0&avatar_size=32&excerpt_length=500');

});