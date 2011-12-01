// Remixed by @molokoloco 2011 - http://b2bweb.fr
// Src : https://github.com/molokoloco/My-Book-ReadR/ - V1.12

var readr = function() { // Your welcome to the events-o-drome !

    // ----------- PUBLIC VARS

    var _db_                = false, // DEBUG ? Log all functions and events... very consuming, but also very helpfull !!!
        name                = 'readr', // This namespace
        margin              = 16, // Default margin (body padding)
        disqusEnabled       = (disqus_url ? true : false); // Enable DISQUS ? Externals vars...

    var jqueryUiJs          = './js/jquery-ui-1.8.14.custom.min.js', // jQuery UI Dialog + Draggable
        waypointJs          = './js/waypoints.min.js', // Trigger event when element scrollTo view
        mousewheelJs        = './js/jquery.mousewheel.min.js', // Your mouse, the wheel
        zeroJs              = './js/jquery.zclip.min.js', // Copy to clipboard
        //selectTextJs      = './js/textinputs_jquery.js', // Wrap tag around text selection, TODO for highlight notes
        zeroSwf             = './js/ZeroClipboard.swf', // Flash copy to clipboard
        tinyJqueryJs        = './tiny_mce/jquery.tinymce.js', // TinyMCE jQuery WYSIWYG plugin
        tinyMceJs           = './tiny_mce/tiny_mce.js', // main TinyMCE
        tinyContentCss      = './css/styles_tinymce.css';

    // Main container
    var container           = '#article', // Main text box
        $container          = $(container),
        titlesChapter       = container+' h1,'+container+' h2,'+container+' h4', // Choose your <Hx> tag(s) for summary, jquery render back in the correct DOM order
        $titlesChapter      = $(titlesChapter),
        articlePrgh         = container+' > p:not(:empty)', //  Select all article child p : mini forum DISCUS sur chaque element
        $articlePrgh        = $(articlePrgh),
        articlePrghActif    = container+' > p.p-actif';

    // Aside widget
    var $aside              = $('#aside'), // Main Nav (Dialog) Box who print summary + viewport
        $asideDialogue      = $(), // jQuery UI Dialog()
        $summaryUl          = $aside.find('ul#summary'), // keep a ref to UL
        $summaryLinks       = $(),
        $viewportUl         = $aside.find('ul#viewport'), // keep a ref to UL
        $viewportLinks      = $(),
        $help               = $('#help');

    // Others UX elements
    var disqus_thread       = '#disqus_thread', // ID element + HASH url, imposed by Disqus
        $disqus_thread      = $(disqus_thread),
        $resizeHandle       = $('#resizeHandle'),
        $dragLeft           = $('#dragLeft'),
        $dragRight          = $('#dragRight'),
        $aTop               = $('a.top'),
        $zoomplus           = $('#zoomplus'),
        $zoomdefault        = $('#zoomdefault'),
        $zoomminus          = $('#zoomminus'),
        $fullscreen         = $('#fullscreen'),
        $autoplay           = $('#autoplay'),
        $helpPanel          = $('#helpPanel'),
        minibar             = '#minibar',
        $minibar            = $(minibar),
        $copier             = $minibar.find('#copier'),
        $editer             = $minibar.find('#editer'),
        $noter              = $minibar.find('#noter'),
        $notes              = $('#notes'),
        $notesList          = $notes.find('#notesList'),
        $saveNotes          = $notes.find('#saveNotes'),
        overlay             = '#overlay',
        $overlay            = $();

    // ----------- KIND OF PRIVATES

    var $window             = $(window), // Set in cache, intensive use !
        $document           = $(document),
        $body               = $('body'),
        scrollElement       = 'html, body',
        $scrollElement      = $();

    var isChrome            = /chrome\//.test(navigator.userAgent.toLowerCase()),
        _d_b_               = true; // Helper, change "_db_" by "_d_b_" inside specific function when debugging...

    var totalViews          = 0,
        newAnchror          = '', // #chapter_6 || #chapter_6_screen || #screen_12
        waypoinTmr          = null,
        prghTmr             = null,
        isAnimated          = false,
        isAutoPlay          = false;

    // ----------- DEBUG ---------------------------------------------------------------------------------- //

    if (_db_ && 'console' in window && 'time' in console) {
        console.warn('Hello, here the logs for : jquery.'+name+'.js, welcome'); console.time('jquery.'+name+'.js');
    }

    // ----------- FUNCTIONS ---------------------------------------------------------------------------------- //

    var db = function() { 'console' in window && console.log.call(console, arguments); }, // Save Our Soul // Debug tool // Comment inside in prod
        html2input = function(str) { return unescape(str+'').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
        input2html = function(str) { return (str+'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'); },
        getCss = function(stylePath) { $('head').append('<'+'link rel="stylesheet" type="text/css" href="'+stylePath+'"/>'); },
        getJs = function(jsPath) { // getJs('http://other.com/other.js'); // Native external link
            var s = document.createElement('script');
            s.setAttribute('type', 'text/javascript');
            s.setAttribute('src', jsPath);
            document.getElementsByTagName('head')[0].appendChild(s);
        },
        callJs = function(src, async, callback) { // callJs('./other.js', function() { ok(); }); // On-demand same domain JS
            if (_db_) db('callJs(src)', src);
            $.ajax({
                   url:src, async:async || 0, dataType:'script', cache:1,
                   error:function(){ alert('Sorry, some JS file not found : '+src); },
                   success:function(response) { if (callback && typeof callback == 'function') callback(); }
            });
        },
        getTextSelect = function() { // Get user text selection string, on mouseup
            var textSelected = '';
            if ('getSelection' in window)            textSelected = window.getSelection();
            else if ('getSelection' in document)    textSelected = document.getSelection();
            else if ('selection' in document)        textSelected = document.selection.createRange().text;
            return $.trim(textSelected)+''; // Cast $() to string
        };

    // ----------- JS DEPENDENCY ---------------------------------------------------------------------------------- //

    callJs(jqueryUiJs, 0);
    callJs(waypointJs, 0);
    callJs(mousewheelJs, 0);

    // ----------- SCROLLTOP element - BROWSER SET BASE ---------------------------------------------------------------------------------- //

    // Find scrollElement // inspired by http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
    $(scrollElement).each(function (i) { // 'html, body' for setter... window for getter... // window.scrollBy(0,0) is native also
        var initScrollTop = parseInt($(this).scrollTop(), 10);
        $window.scrollTop(initScrollTop + 1);
        if ($(this).scrollTop() == initScrollTop + 1) {
            scrollElement = this.nodeName.toLowerCase(); // html OR body
            if (_db_) db('scrollElement=', scrollElement);
            return false; // Break
        }
    });
    $scrollElement = $(scrollElement);

    // UTILITIES...
    var getHash             = function() { return window.location.hash || ''; },
        setHash             = function(hash) { if (hash && getHash() != hash) window.location.hash = hash; },
        getUrlVars          = function() { // index.html?var=foo -> myVal = getUrlVars()['var'];
            if (_urlVars.length < 1) window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { _urlVars[key] = value; });
            return _urlVars;
        }, _urlVars = {},
        getWinWidth         = function() { return $window.width(); }, // iphone ? ((window.innerWidth && window.innerWidth > 0) ? window.innerWidth : $window.width());
        getWinHeight        = function() { return $window.height(); }, // iphone ? ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $window.height());
        getPageWidth        = function() { return $document.width(); },
        getPageHeight       = function() { return $document.height(); },
        getScrollTop        = function() { return parseInt($scrollElement.scrollTop() || $window.scrollTop(), 10); },
        setScrollTop        = function(y) { $scrollElement.stop(true, false).scrollTop(y); },
        myScrollTo          = function(y) { // Call page scrolling to a value (like native window.scrollBy(x, y)) // Can be flooded
            if (_db_) db('myScrollTo(scrollTop)', y);
            isAnimated = true; // kill waypoint AUTO hash
            var duration = 360 + (Math.abs(y -  getScrollTop()) * 0.42); // Duration depend on distance...
            if (duration > 2222) duration = 0; // Instant go !! ^^
            $scrollElement
                .stop(true, false)
                .animate({scrollTop: y}, {
                    duration: duration,
                    complete: function() { // Listenner of scroll finish...
                        if (_db_) db('myScrollTo.complete');
                        setHash(newAnchror); // If new anchor
                        newAnchror = '';
                        isAnimated = false;
                    }
                });
        },
        goToScreen          = function(dir) { // Scroll viewport page by paginette // 1, -1 or factor
            if (_db_) db('goToScreen(dir)', dir);
            var winH = parseInt((getWinHeight() * 0.75) * dir, 10); // 75% de la hauteur visible comme unite
            myScrollTo(getScrollTop() + winH);
        };

    // ----------- JQUERY EXTEND ---------------------------------------------------------------------------------- //

    $.fn.extend({
        scrollToMe: function(target) { // Extend jQuery, call page scrolling to a element himself
            return this.each(function() {
                if (_db_) db('scrollToMe(target)', target);
                if (target) newAnchror = target; // Update hash, but after scroll anim
                myScrollTo(parseInt($(this).offset().top, 10));
            });
        },
        center: function () { // I have added the (expanded) source here : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.center.mlklc.js
            return this.each(function() { // Presently, work with fixed elements
                var $t = $(this),
                    top = (getWinHeight() - $t.outerHeight()) / 2,
                    left = (getWinWidth() - $t.outerWidth()) / 2;
                $t.css({/*margin:0, */top:(top > margin ? top : margin)+'px', left:(left > margin ? left : margin)+'px'});
             });
        }/* ,
       selectRange: function(start, end) { // $('#myInput').selectRange(searchVal.indexOf('{'), (searchVal.indexOf('}')+1))
            var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
            if (e && e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } // WebKit
            else if (e && e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } // IE
            else if (e && e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
        },
        styleSwitch: function (stylePath) { // I have added the (expanded) source here : http://plugins.jquery.com/project/AddOrSwitchStylesheet
            var exist = false, disabled = [];
            $('link[@rel*=style][id]').each(function () {
                if (stylePath == $(this).attr('href')) { $(this).removeAttr('disabled'); exist = true; }
                else disabled.push(this);
            });
            if (exist === false) $('head').append('<link rel="stylesheet" type="text/css" href="'+stylePath+'" id="theme'+Math.random()+'"/>');
            setTimeout(function () { $(disabled).each(function () { $(this).attr('disabled', 'disabled'); }); }, 900);
            if ($.cookie) $.cookie('css', stylePath, cookieOptions);
        },
        styleInit: function () {
            if ($.cookie && $.cookie('css')) {
                var isSet = false;
                $('link[rel*=style][id]').each(function () { if ($.cookie('css') == $(this).attr('href')) isSet = true; });
                if (isSet === false) $.fn.styleSwitch($.cookie('css'));
            }
            return $(this).click(function (event) {
                event.preventDefault();
                $.fn.styleSwitch($(this).attr('rel'));
                $(this).blur();
            });
        } */
    });

    // ----------- ITERATE <h4> AND <p>, build summary, init Waypoint ---------------------------------------------------------------------------------- //

    // $articlePrgh.find('br').after('<span class="indent"></span>'); // Typo polish for paragraphes ?

    $.waypoints.settings.scrollThrottle = 200; // Don't flood
    $.waypoints.settings.resizeThrottle = 200;

    var titles = '';
    $titlesChapter // Create summary based on the H4 tags
        .each(function(i) {
            // Indentation (based on h1, h2, ...) : <H[x]> * 3px >>> (parseInt(this.nodeName[1])-1)*3
            titles += '<li style="padding-left:'+((parseInt(this.nodeName[1], 10)-1)*3)+'px;"><a href="#chapter_'+(i+1)+'" data-id="'+i+'">'+$(this).text()+'</a></li>'; // Build summary links
        })
        .waypoint({offset:'10%'}); // Create Waypoint obj, foreach H4 // http://imakewebthings.github.com/jquery-waypoints/

    $(titles).appendTo($summaryUl); titles = null;
    $summaryLinks = $summaryUl.find('a'); // Stock summary links
    if (_db_) db('$titlesChapter=', $titlesChapter.length);

    $summaryLinks.bind('click.'+name, function(event) {
        setTimeout(function(i) { // Normally waypoint trigger with offset of 10%, but scrollToMe scroll to offset 30px, with 800ms delay
            $titlesChapter.eq(i).trigger('waypoint.reached'); //  Force event if summary click
        }, 1000, $(this).data('id'));
    });

    $articlePrgh.waypoint({offset:'35%'}); // highlight continuously current <p>, when scrolling
    if (_db_) db('$articlePrgh=', $articlePrgh.length);

    // Focus current <p>
    var setParaphActif = function($e) {
        if (_db_) db('setParaphActif()');
        $(articlePrghActif).removeClass('p-actif'); // reset
        $e.addClass('p-actif').prev('p').addClass('p-actif').end().next('p').addClass('p-actif');
    };

    // ----------- DISCUS ---------------------------------------------------------------------------------- //

    // Prepare Disqus call from <P> ?
    if (disqusEnabled) {
        var $req = null;
        var killDisqus = function(identifier) {
                if (_db_) db('killDisqus()');
                $disqus_thread.addClass('fade').empty();
                $document.unbind('click.'+name, killDisqus);
                $disqus_thread.unbind('click.'+name, notKillDisqus);
            },
            notKillDisqus = function(event) {
                if (_db_) db('notKillDisqus()');
                event.stopPropagation(); // Stop hidding comment if body click event
            },
            embedDisqus = function(url, identifier) {
                if (_db_) db('embedDisqus(url, identifier)', url, identifier);
                killDisqus();
                window.disqus_identifier = identifier || 'pirate';
                window.disqus_url = url ||  'http://www.b2bweb.fr/bonus/piratons-la-democratie.html';
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
    }
    else $disqus_thread.remove(); // Plus HTML "static" recents comment to check...

    // ----------- ADD some UI elements to CONTENT ---------------------------------------------------------------------------------- //

    var textCleanup = function() {
            if (_db_) db('textCleanup()');
            $container.find("a[name^='chapter_']").remove(); // FILTER JS content HTML before edit...
            $container.find('span.comment').remove(); // Discuss <p>
        },
        textEnhance = function() {
            if (_db_) db('textEnhance()');
            $titlesChapter // Create summary based on the H4 tags
                .each(function(i) {
                    $(this)
                        .data({id:i}) // Attach menu_id to chapters
                        .before('<a name="chapter_'+(i+1)+'" id="chapter_'+(i+1)+'"></a>'); // Add anchors, anchor position is important because we go exactly to this offset
                });
            if (disqusEnabled) {
                $articlePrgh.each(function(i) { // Add infobulle comments for each <P> - Disqus system // BE CAREFULL : Editing the "STATICS" HTML <P> could lead to comments serious disorder !!!
                    // This link open the Discuss Comment form related to a <P>
                    // href : page.html?pirate=78#disqus_thread // Create fake var "pirate" : force Discus beliving that it's a new page, so a new forum...
                    $(this).append('<span class="comment"><a href="'+disqus_url+'?pirate='+i+disqus_thread+'" data-disqus-identifier="pirate='+i+'" id="pirate_'+i+'" title="Commenter le texte (P#'+i+')">-</a></span>');
                    // don't prepend, because <p> have CSS :first-letter setted
                });
            }
        };

    textEnhance();

    // ----------- BODY EVENTS (WAYPOINTs + Delegate) ---------------------------------------------------------------------------------- //

    var chapterWaypointReached = function(event, direction) { // Waypoint obj, detecting <h4> // Rate came from $.waypoints.settings.scrollThrottle
            var i = $(this).data('id'),
                target = $summaryLinks
                                    .removeClass('current')
                                    .eq((direction == 'up' && i > 1 ? i - 1 : i)) // Detect Chaper below when scrolling to top
                                    .addClass('current')
                                    .attr('href'); // Get selected summary link anchor
            if (_db_) db('body.chapterWaypointReached i', i);
            if (waypoinTmr) clearTimeout(waypoinTmr);
            if (isAnimated) return; // Prevent when myScrollTo is called before
            waypoinTmr = setTimeout(function(t) { // waypoinTmr, if user is scrolling from bottom to top, we are flooded !
                if (_db_) db('titlesChapter.waypoint.waypoinTmr target ? ', t, 'current', getHash());
                if (getHash() != t) setHash(t+'_screen'); // AUTO-update location while scrolling, with fake hash, preventing automatic scroll, when reloading we detect it
            }, 400, target);
        },
        prghWaypointReached = function(event, direction) { // Waypoint obj, listening viewport scrolling, detecting <p>
            if (_db_) db('body.prghWaypointReached');
            var $active = $(this);
            if (prghTmr) clearTimeout(prghTmr);
            prghTmr = setTimeout(function($a, d) { // hightlighted <p> keep persistent when you scroll
                if (_db_) db('body.prghWaypointReached prghTmr');
                if (d === 'up') $a = $a.prev('p');
                if (!$a.length) $a.end();
                setParaphActif($a);
            }, 1250, $active, direction); // p have time to wait...
        },
        prghMouseenter = function(event) { // Subtelly(?) hightlight paragraph // Focus with scroll or mouseenter...
            if (_db_) db('body.prghMouseenter');
            var $active = $(this);
            if (prghTmr) clearTimeout(prghTmr);
            prghTmr = setTimeout(function($a) {
                if (_db_) db('body.prghMouseenter prghTmr');
                setParaphActif($a);
            }, 1400, $active);
        },
        prghMouseleave = function(event) { //  We SET !ALL! the EVENT with our plugin NAMESPACE '.readr' so we can UNSET all with $.unbind('.readr')
            if (_db_) db('body.prghMouseleave');
            if (prghTmr) { clearTimeout(prghTmr); prghTmr = null; }
        },
        commentClick = function(event) { // Call Disqus comment system
            if (_db_) db('body.commentClick');
            event.preventDefault();
            setParaphActif($(this).closest('p'));
            if (disqusEnabled) embedDisqus($(this).attr('href'), $(this).data('disqus-identifier'));
            return false;
        };

    // Yes listen your body
    var attachBodyEvents = function () {
            if (_db_) db('attachBodyEvents()');
            $container // Since we work with a lot of element, we're delegating...
                .delegate(titlesChapter,        'waypoint.reached',    chapterWaypointReached)
                .delegate(articlePrgh,          'waypoint.reached',    prghWaypointReached)
                .delegate(articlePrgh,          'mouseenter.'+name,    prghMouseenter)
                .delegate(articlePrgh,          'mouseleave.'+name,    prghMouseleave)
                .delegate('span.comment a',     'click.'+name,         commentClick);
        },
        removeBodyEvents = function () {
            if (_db_) db('removeBodyEvents()');
            $container
                .undelegate(titlesChapter,      'waypoint.reached',    chapterWaypointReached)
                .undelegate(articlePrgh,        'waypoint.reached',    prghWaypointReached)
                .undelegate(articlePrgh,        'mouseenter.'+name,    prghMouseenter)
                .undelegate(articlePrgh,        'mouseleave.'+name,    prghMouseleave)
                .undelegate('span.comment a',   'click.'+name,         commentClick);
        };

    // ----------- JQUERY UI DIALOG for Aside ---------------------------------------------------------------------------------- //

    var asideOffset         = $aside.offset(), // Stock initial CSS positionning
        asideWidth          = $aside.width(),
        asideHeight         = $aside.height(),
        asideLeft           = parseInt($asideDialogue.css('left'), 10),
        asideTop            = parseInt($asideDialogue.css('top'), 10),
        asideRight          = parseInt($asideDialogue.css('right'), 10),
        asideBottom         = parseInt($asideDialogue.css('bottom'), 10),
        asideHeaderH        = 23; // Dialog Header Toolbar height

    var setAsidePos = function() { // FIX jQuery UI draggable : reverse top/left with bottom/right (keep aligned when window resize)
            if (_db_) db('setAsidePos()');
            asideWidth      = $asideDialogue.outerWidth();
            asideHeight     = $asideDialogue.outerHeight();
            asideLeft       = parseInt($asideDialogue.css('left'), 10); // refresh
            asideTop        = parseInt($asideDialogue.css('top'), 10);
            $asideDialogue.css({
                top:'', left:'', // position:'fixed',
                bottom:(getWinHeight() - (asideTop + asideHeight))+'px',
                right:( getWinWidth() - (asideLeft + asideWidth))+'px'
            });
            protectAsidePos();
        },
        protectAsidePos = function() { // Event window resize // are we outside the bounding box ?
            if (_db_) db('protectAsidePos()');
            $aside.height('');
            asideWidth      = $asideDialogue.outerWidth();
            asideHeight     = $asideDialogue.outerHeight(); // aside Height can change because viewport are living on resize
            asideRight      = parseInt($asideDialogue.css('right'), 10);
            asideBottom     = parseInt($asideDialogue.css('bottom'), 10);
            if (asideRight < margin) asideRight = margin; // intent to keep margin
            if (asideBottom < margin) asideBottom = margin;
            if ((asideBottom + asideHeight + margin) > getWinHeight()) { // Untoggle when top positionned
                asideBottom = getWinHeight() - asideHeight - margin;
            }
            if ((asideHeight + (margin * 2)) > getWinHeight()) { // To big, skrink it and apply vertical scroll
                    asideHeight = getWinHeight() - (margin * 2) - asideHeaderH;
                    $aside.height(asideHeight+'px');
                    asideBottom = margin;
            }
            $asideDialogue.css({bottom:asideBottom+'px', right:asideRight+'px'}); // jQueryUi want z-index 1003+
        },
        toggleAside = function(event){ // Toggle aside...
            if (_db_) db('toggleAside()');
            event.preventDefault();
            if (parseInt($asideDialogue.height(), 10) <= asideHeaderH) {
                $asideDialogue.height(''); // reset, animated through CSS transition...
                setTimeout(function() { protectAsidePos(); }, 1000); // so we wait
                $(this).removeClass('toggled');
                protectAsidePos();
            }
            else {
                $asideDialogue.height(asideHeaderH+'px');
                $(this).addClass('toggled');
            }
            return false;
        },
        openAside = function() { // We hack default jQuery UI...
            if (_db_) db('openAside()');
            $asideDialogue = $aside.parent('div.ui-dialog').eq(0).addClass('roundered').css('z-index','250'); // Select current Dialog Box, switch roudered class to the new Dialog Box
            $asideDialogue
                .find('.ui-dialog-titlebar-close')
                .replaceWith('<a href="javascript:void(0)" class="ui-dialog-titlebar-toggle" role="button" title="Reduire/Agrandir">Toggle</a>'); // Hack default close()
            $asideDialogue
                .find('.ui-dialog-titlebar-toggle')
                .bind('click.'+name, toggleAside);
            $help
                .detach()
                .appendTo($asideDialogue.find('.ui-dialog-titlebar')); // Attach "help" link to title-bar
            $aside.height('').width('100%'); // Adapt to content
            setAsidePos();
        };

    $aside
        .removeClass('aside roundered') // Reset initial CSS positionning
        .dialog({ // CREATE - Draggable
            dialogClass:    'aside', // Apply CSS fixed positionning
            resizable:      false, // Ok, i made it for you ;)
            position:       [asideOffset.left, asideOffset.top - asideHeaderH],
            scroll:         false, // Don't scroll since we are fixed // not work ?
            width:          asideWidth,
            height:         asideHeight + asideHeaderH, // + .ui-dialog-titlebar
            stack:          false, // Don't touch to z-index, only widget
            open:           openAside,
            dragStop:       setAsidePos
        });

    // ----------- VIEWPORT SCREEN THUMBS ---------------------------------------------------------------------------------- //
    // Made as a plugin here : http://jsfiddle.net/molokoloco/Atj8Z/
    
    var setCurrentViewport = function() { // Focus current page view link
            var page = 0, // ?
                currentScroll = getScrollTop(),
                maxScroll = (totalViews-1) * getWinHeight();
            if (_db_) db('setCurrentViewport() currentScroll maxScroll', currentScroll, maxScroll);
            if (currentScroll < getWinHeight()) page = 1; // Current page is processed relatively to view's bottom
            else if (currentScroll >= maxScroll) page = totalViews; // Last page..
            else page = Math.ceil(totalViews * (currentScroll / maxScroll)); // page 1 == < winHeight : ceil
            $viewportLinks
                .removeClass('current') // reset
                .eq(page - 1).addClass('current'); // -1 : Page (1 , 2 , 3, ...) to #id eq(0, 1, 2, ...)
        },
        viewportClick = function(event) { // Paginette links click lead to corresponding screen scroll
            if (_db_) db('viewportClick()');
            event.preventDefault(); // set screen anchor in url for Screen can flood history
            var index = parseInt($(this).text(), 10) - 1, // Pages (1,2,3) to id (0,1,2)
                scrollTarget = index * getWinHeight();
            if (index == totalViews-1) scrollTarget = (totalViews-1) * getWinHeight(); // To be certain to reach the end...
            myScrollTo(scrollTarget);
            // printInfos('&Eacute;cran n&deg;'+(index+1));
            isAnimated = false; // Let's waypoint set automatic anchor
            return false;
        },
        createViewport = function() { // Build viewport // One page for each screen that user need to scroll to get to the bottom of the HTML page
            if (_db_) db('createViewport()');
            totalViews = Math.ceil(getPageHeight() / getWinHeight());
            if ($viewportLinks.length > 0) $viewportLinks.unbind('click.'+name, viewportClick);
            $viewportUl.empty();
            if (totalViews < 1) return; // Never now...
            for (var i = 0, views = ''; i < totalViews; i++)
                views += '<li><a href="#screen_'+(i+1)+'">'+(i+1)+'</a></li>';
            $(views).appendTo($viewportUl); views = null;
            $viewportLinks = $viewportUl.find('a');
            $viewportLinks.bind('click.'+name, viewportClick);
            setCurrentViewport();
            protectAsidePos(); // If paginette grows, say aside to redim
        };

    createViewport();

    // ----------- SMOOTH ANCHORs SCROLL ---------------------------------------------------------------------------------- //

    // For ALL links with Anchors - We're using LIVE, for some update later...
    $('a[href^="#"]').live('click.'+name, function(event) {
        if (event.isDefaultPrevented()) return;    // Link #top want special event...
        var target    = this.hash, // #anchor
            $target    = $(target);
        if (_db_) db('a#hash.click', target, 'SET?');
        if (!$target) return;
        event.preventDefault();
        $target.scrollToMe(target);
        return false; // don't open a#hash
    });

    // ----------- ZOOM TEXT ---------------------------------------------------------------------------------- //

    var currentZoom         = 62.50; // %, let's say that 1em == 10px

    // Aside tool buttons
    var setZoom = function(zoom) { // Global Text zoom
            if (_db_) db('setZoom(zoom)', zoom);
            currentZoom = (zoom < 30.00 ? 30.00 : zoom); // less is not readable
            currentZoom = (currentZoom > 60.00 && currentZoom <= 65.00 ? 62.50 : currentZoom); // Round to normal default size
            $body.css('font-size', zoom+'%'); // We deal text in .em so don't need to zoom all with : $('html,body').css('zoom', currentZoom);
            printInfos('Taille du texte : '+parseInt((zoom/62.50) * 100, 10)+'%');
            setTimeout(resizeRefreshEvent, 500); // Some timeout waiting all the doc text to resize...
        },
        fullScreen = function (event) { // Intent resize the browser to full screen
            if (_db_) db('fullScreen()');
            if (!('resizeTo' in window) || !('screen' in window) || !('availHeight' in window.screen) || isChrome)
                return alert("Votre navigateur n'autorise pas la page a activer cette fonction...\n\nTouche F11 pour lire confortablement !");
            window.moveTo(0, 0);
            return window.resizeTo(window.screen.availHeight * 0.85, window.screen.availWidth * 0.85); // Take 85% of screen
        };

    $zoomplus.bind('click.'+name,       function zoomPlus() { setZoom(currentZoom + 5.00); });
    $zoomdefault.bind('click.'+name,    function zoomDefault() { setZoom(62.50); }); // Reset
    $zoomminus.bind('click.'+name,      function zoomMoins() { setZoom(currentZoom - 5.00); });
    $fullscreen.bind('click.'+name,     fullScreen);

    // ----------- Screen AUTO SCROLLING ---------------------------------------------------------------------------------- //
    var playTmr             = null,
        playSpeed           = 5, // from 0 to 9 avec les touches - default 5
        playDist            = 12, // We increment by 12px (half <p> line height, so eye don't lose the text)
        playTimer           = 150; // 150(ms) * 5(speed) * 3 (factor) = 2250ms, default time to read a 1/2 line
    
    var callAutoPlay = function(event) {
            if (_db_) db('callAutoPlay() playSpeed', playSpeed, 'isAutoPlay', isAutoPlay);
            if (!isAutoPlay) { // Toggle when is called
                isAutoPlay = true;
                var delay = playTimer * (10 - playSpeed) * 3; // PaySpeed from 1 to 9, 9 is faster // db('delay', delay, 'playTimer', playTimer, 'playSpeed', playSpeed);
                autoPlayOffset();
                if (playTmr) clearInterval(playTmr);
                playTmr = setInterval(autoPlayOffset, delay); // Play speed max == 9 and we want 9 to be speed and 1 slow
                printInfos('D&eacute;filement automatique, vitesse : '+playSpeed+'/10');
            }
            else killAutoPlay(); // reset
        },
        killAutoPlay = function() {
            if (!isAutoPlay) return;
            if (_db_) db('killAutoPlay()');
            if (playTmr) clearInterval(playTmr);
            playTmr = null;
            isAutoPlay = false;
            printInfos('D&eacute;filement automatique stopp&eacute;');
        },
        autoPlayOffset = function() { // Indent current scrollTop from top (0) to bottom (xxxxx)
            if (_db_) db('autoPlayOffset()');
            var y = getScrollTop() + playDist;
            if (y + getWinHeight() < getPageHeight()) myScrollTo(y); // Animate
            else killAutoPlay(); // We've reach the end of the world
        },
        autoPlaySpeed = function(speed) { //
            if (_db_) db('autoPlaySpeed(speed)', speed);
            if (speed < 1) killAutoPlay();
            else {
                playSpeed = speed;
                callAutoPlay();
            }
        };

    $autoplay.bind('click.'+name, callAutoPlay); // + Enter key, with Toggle

    // ----------- CHECK USER BROWSER ZOOM ---------------------------------------------------------------------------------- //
    // When user make a zoom on the page and came back later, the page init with user prefered zoom
    // Need to detect it and set it on the text only

    var $refEm              = $('<div/>').css({width:'10em',position:'absolute',right:'-10em'}).appendTo($body), // If zoom is 100% then both must be 100px width
        $refPix             = $('<div/>').css({width:'100px',position:'absolute',right:'-100px'}).appendTo($body),
        counterZoom         = 0;
        //keyPressed        = false;

    // TODO, undone and very bugged for now...

    var checkZooming = function() { // With Chrome ctrl+wheeling don't trigger nothing, so check if ref DIV have be resized
            if (_db_) db('checkZooming()');
            
            return; ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TODO
            
            // if (!isChrome) return;
            // em width size change with user zoom, but pix width only change visualy, not the value given by Chrome
            if (counterZoom % 2 === 0 && $refEm.width() != $refPix.width()) { // Detect user zoom in Chrome, it keep 120% but we reduce here to conterbalance and
                var userZoom = $refPix.width() / $refEm.width(), // User current zoom
                    userUnZoom = $refEm.width() / $refPix.width(); // User anti-zoom, give back 100%
                if (_db_) db('userZoom', userZoom, 'userUnZoom', userUnZoom);
                $scrollElement.css('zoom', (userUnZoom * 100) +'%'); // Reverse zoom
                setZoom(62.5 * userZoom); // Give back zoom to text..., base size = 62.5
            }
            counterZoom++; // Be carefull, give back resizeRefreshEvent() !
        };

    // checkZooming();

    // ----------- WHEELING ---------------------------------------------------------------------------------- //

    var wheelFactor         = 0.25,
        wheelCounter        = 0,
        wheelDeltaBack      = 0,
        wheelTmr            = null,
        wheelTime           = null;

    var wheelReset = function() {
            if (_db_) db('wheelReset()');
            wheelFactor     = 0.50;
            wheelCounter    = 0;
            wheelDeltaBack  = 0;
            wheelTmr        = null;
            wheelTime       = null;
        },
        wheeling = function(event, delta) { // Assisted wheeling ! Driving user WHEEL
            if (_db_) db('wheeling(delta) event.ctrlKey', delta, event.ctrlKey);
            event.preventDefault();
            if (wheelTmr) clearTimeout(wheelTmr);
            wheelTmr = setTimeout(wheelReset, (!wheelDeltaBack || wheelDeltaBack == delta ? 2400 : 0)); // If no scroll after 2" or reverse dir, reset factor and decelerate
            if (!wheelTime) wheelTime = new Date();
            var now = new Date(),
                diff = now.getSeconds() - wheelTime.getSeconds();
            
            // Tunnig of the mouseWheel scroll distance factor
            if ((wheelCounter > 10 && diff <= 3) || wheelCounter > 18 || wheelFactor == 20) wheelFactor = 15;
            else if (wheelCounter > 4 && diff <= 2) wheelFactor = 1.8;
            else if (wheelCounter > 2) wheelFactor = 1.2;
            wheelDeltaBack = delta;
            wheelCounter++;
            
            // if (event.ctrlKey || keyPressed) { // Intent to set custom ZOOM with ctrl + wheel, but fail in Chrome, like ghost, nothing trigger
                // if (_db_) db('setZoom(currentZoom)+ctrlKey');
                // if (delta > 0) setZoom(currentZoom + 5.00);
                // else setZoom(currentZoom - 5.00);
            // } else
            if (delta > 0) goToScreen(-wheelFactor);
            else goToScreen(wheelFactor);
            return false;
        };

    // ----------- WINDOW EVENTS ---------------------------------------------------------------------------------- //

    var windowTmr        = null,
        windowViewTmr    = null;

    var scrollRefreshEvent = function() {
            if (_db_) db('scrollRefreshEvent()');
            clearInterval(windowViewTmr);
            windowViewTmr = null;
            setCurrentViewport();
            $aTop.toggleClass('fade', (getScrollTop() < getWinHeight())); // Show/hide goto Top link if scroll > viewport height
            $asideDialogue.removeClass('highlight');
            killMiniBar();
        },
        scrollling = function(event) {
            // if (_db_) db('body.scrollling'); // Flood
            if (!isAutoPlay) $asideDialogue.addClass('highlight');
            if (!windowViewTmr) windowViewTmr = setInterval(setCurrentViewport, 150); // Optimize, pageView rendering, interval of 150ms
            if (windowTmr) clearTimeout(windowTmr);
            windowTmr = setTimeout(scrollRefreshEvent, 333); //trottle resize : Wait a pause of 300ms before triggering
        },
        resizeRefreshEvent = function() { // Global EVENT.RESIZE dispatcher, ok TODO with pub/sub pattern...
            if (_db_) db('resizeRefreshEvent()');
            setResizeRepos();
            createViewport(); // < moved protectAsidePos();
            killAutoPlay();
            $helpPanel.center();
            $.waypoints('refresh'); // OK already done, internaly, but want it when text resize/zoom too...
            checkZooming(); // Chrome zoom also trigger resize event... so cheking here
        },
        resizing = function(event) { // Resize Event
            // if (_db_) db('body.resizing'); // Flood
            if (windowTmr) clearTimeout(windowTmr);
            windowTmr = setTimeout(resizeRefreshEvent, 333); // trottle resize
        };

    var attachWindowEvents = function () {
            if (_db_) db('attachWindowEvents()');
            $window
                .bind('scroll.'+name, scrollling)
                .bind('resize.'+name, resizing)
                .bind('mousewheel.'+name, wheeling);
        },
        removeWindowEvents = function () {
            if (_db_) db('removeWindowEvents()');
            $window
                .unbind('scroll.'+name, scrollling)
                .unbind('resize.'+name, resizing)
                .unbind('mousewheel.'+name, wheeling);
        };

    // ----------- TINYMCE EDITOR ---------------------------------------------------------------------------------- //

    var $textEdit = $();

    var buildEditable = function() {
            if (_d_b_) db('buildEditable()');
            textCleanup();
            var contentHtml = $container.html();
            contentHtml = html2input(contentHtml); // Entities < and
            $textEdit = $('<textarea name="textEdit" id="textEdit" cols="80" rows="100">'+contentHtml+'</textarea>').appendTo($body);
            $textEdit.wrap('<form method="post" name="formEdit" id="formEdit" action="actions.php?action=saveText" target="_blank"/>'); // Attach form to editor, so user can submit & save content
            $('#formEdit').prepend('<button type="submit" id="saveNotes" title="Téléhargez vos notes dans un fichier .txt" accesskey="s 0">Sauver</button>');
            $textEdit.tinymce({
                script_url:tinyMceJs,
                content_css:tinyContentCss,
                theme:'advanced', skin:'o2k7', theme_advanced_resizing:false, width:'80%', height:'90%',
                plugins: 'save,autolink,pagebreak,table,advhr,advimage,advlink,iespell,inlinepopups,preview,searchreplace,print,contextmenu,paste,noneditable,visualchars,nonbreaking',//save,
                theme_advanced_buttons1:'save,|,newdocument,print,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,removeformat,cleanup,|,tablecontrols,|,iespell,visualaid,visualchars,|,search,replace,|,help,|,code',//save,
                theme_advanced_buttons2:'formatselect,styleselect,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,link,unlink,|,image,|,bullist,numlist,outdent,indent,blockquote,|,sub,sup,|,pagebreak,hr,charmap,nonbreaking,|,forecolor,backcolor',
                theme_advanced_buttons3:'',
                theme_advanced_toolbar_location:'top', theme_advanced_toolbar_align:'left', theme_advanced_statusbar_location:'bottom'
            });
            setTimeout(function() {
                // $textEdit.tinymce().execCommand('mceFullScreen');
                $('iframe#textEdit_ifr').css({width:'100%',height:'100%'});
                $('form#formEdit').bind('submit', saveText);
            }, 900);
            // NOWAY... :-/
            // var edit = ($container.attr('contenteditable') != 'true' ? true : false);
            // $container
                //.attr('contenteditable', (edit ? 'true' : 'false'));
                //.toggleClass('editable', edit)
                //.attr('title', (edit ? 'Vous pouvez maintenant editer le texte (Double clic pour sortir)' : ''));
            // $body.surroundSelectedText('<span class="highlight">', '</span>');
        },
        saveText = function(event) {
            if (_d_b_) db('saveText()');
            $container.html($textEdit.val());
            return removeEditable(event);
        },
        callEditable = function(event) {
            if (_db_) db('callEditable()');
            removeEvents();
            showOverlay();
            popCallBack = 'removeEditable';
            printInfos('&Eacute;diteur HTML');
            if (typeof $().tinymce != 'function') callJs(tinyJqueryJs, 0, buildEditable); // On-demand load WYSIWYG TinyMce JS plugin
            else buildEditable();
        },
        removeEditable = function(event) {
            if (_d_b_) db('removeEditable()');
            if (event) event.preventDefault();
            $('form#formEdit').unbind('submit', saveText);
            $textEdit.animate({opacity:0}, 600, function() {
                $textEdit.tinymce().destroy();
                $('form#formEdit').remove();
                $textEdit = $();
            });
            textEnhance();
            attachEvents();
            return false;
        };

    // ----------- KEYBOARD ---------------------------------------------------------------------------------- //

    // Listen to key UP and DOWN
    var event2key = {'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '17':'ctrl', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown',
                    '96':'0', '97':1, '98':2, '99':3, '100':4, '101':5, '102':6, '103':7, '104':8, '105':9, // NumPad
                    '48':'0', '49':1, '50':2, '51':3, '52':4, '53':5, '54':6, '55':7, '56':8, '57':9}, // &é"'(-è_çà // Azerty
        pageKey = function(event) { // Can flood when user keep pressed...
            // keyPressed = true;
            var key = event2key[(event.which || event.keyCode)] || '',
                action = false;
            if (_db_) db('pageKey() key, event.which, event.keyCode', key, event.which, event.keyCode);
            switch(key) {
                case '+':        setZoom(currentZoom + 5.00); action = true; break;
                case '-':        setZoom(currentZoom - 5.00); action = true; break;
                case 'up':       goToScreen(-1); action = true; break;
                case 'down':     goToScreen(1); action = true; break;
                case 'left':     goToScreen(-0.1); action = true; break;
                case 'right':    goToScreen(0.1); action = true; break;
                case 'pageUp':   // Intercept but wait keyup...
                case 'pageDown':
                case 'space':
                case 'enter':    action = true; break;
                default :        if (key && key >= 0) action = true;
            }
            if (action) {
                event.preventDefault();
                return false;
            }
        },
        pageUnKey = function(event) { // Validate key
            // keyPressed = false;
            if ('activeElement' in document && $(document.activeElement).attr('editable')) return; // Don't intercept content edit
            var key = event2key[(event.which || event.keyCode)] || '',
                action = false;
            if (_db_) db('pageUnKey(key) event.which, event.keyCode', key, event.which, event.keyCode);
            switch(key) {
                case 'pageUp':      myScrollTo(0); action = true; break; // Override default browser scrollTo pageUp/Down, because Waypoint break it
                case 'pageDown':    myScrollTo(getPageHeight()); action = true; break;
                case 'space':       // AutoPlay
                case 'enter':       callAutoPlay(event);  action = true; break;
                default :           if (key && key >= 0) { autoPlaySpeed(key); action = true; }
            }
            if (action) {
                event.preventDefault();
                return false;
            }
        };

    // ----------- USERS ANNOTATIONS ---------------------------------------------------------------------------------- //

    var $targetSelect       = $(),
        $noteToKill         = $(),
        numNotes            = 0,
        noteNotSaved        = false,
        notesTmr            = null;

    var saveNotes = function(event) {
            event.preventDefault();
            var saveText = '';
            $notesList.find('div.note').each(function(i) { saveText += '\n---\n'+(i+1)+') '+$(this).text()+'\n'; });
            if (_db_) db('saveNotes()', saveText);
            $('input#saveText').val(saveText);
            document.formNotes.submit(); // Native <form> submit() // Target iframe for download
            noteNotSaved = false;
            $window.unbind('unload', saveNotesAlert);
            printInfos('Notes sauv&eacute;es');
            return false;
        },
        saveNotesAlert = function(event) {
            if (_db_) db('saveNotesAlert()');
            if (noteNotSaved && confirm("Voulez vous telecharger vos notes avant de quitter la page ?")) return saveNotes(event);
        },
        addNote = function(event) {
            if (_db_) db('addNote()');
            numNotes++;
            if (!noteNotSaved) {
                noteNotSaved = true;
                $window.bind('unload', saveNotesAlert);
                $notes.show();
            }
            $('<li><a href="#note_'+numNotes+'">'+textSelected.substr(0,6)+'</a><div class="note roundered" contenteditable="true">'+textSelected+'</div></li>')
                .appendTo($notesList);
            if ($targetSelect.parents(container).length > 0) // Verify that the element is inside the container, need to ameliorate with a span wrap around Text selection // TODO !!!
                $targetSelect
                    .addClass('hightlight')
                    .prepend('<a name="note_'+numNotes+'" id="note_'+numNotes+'"></a>');
            printInfos('Note ajout&eacute;e');
        },
        killNoteTmr = function() {
            if (notesTmr) clearTimeout(notesTmr);
            notesTmr = null;
        },
        killNoteOver = function() {
            killNoteTmr();
            $noteToKill.fadeOut(300);
        };

    $notesList
        .delegate('a', 'mouseenter', function(event){
            killNoteOver();
            $(this).next('div.note').fadeIn(600);
        })
        .delegate('a', 'mouseleave', function(event){
            $noteToKill = $(this).next('div.note');
            notesTmr = setTimeout(killNoteOver, 1000);
        })
        .delegate('div.note', 'mouseenter', function(event){
            killNoteTmr();
        })
        .delegate('div.note', 'mouseleave', function(event){
            $noteToKill = $(this);
            notesTmr = setTimeout(killNoteOver, 1000);
        });

    $saveNotes.bind('click.'+name, saveNotes);

    // ----------- MINIBAR ---------------------------------------------------------------------------------- //

    // Copy to Clipboard !!! Need Flash : jquery.zclip.js // http://www.steamdev.com/zclip/
    var attachClipboard = function() {
        if (_db_) db('attachClipboard() textSelected', textSelected);
        $copier.zclip({
            path:zeroSwf,
            copy:textSelected,
            afterCopy:function(){
                $copier.zclip('remove');
                printInfos('Texte copi&eacute;');
                killMiniBar();
            }
        });
    };

    // Minibar show when mouse is up and some text is selected...
    var showMiniBar = function(pageX, pageY) {
            if (_db_) db('showMiniBar(pageX,pageY)', pageX, pageY, textSelected);
            protectMiniBar();
            $minibar
                .stop(true, false)
                .css({top:(parseInt(pageY, 10)+10)+'px', left:(parseInt(pageX, 10)+5)+'px'})
                .show().fadeIn(500);
            if (typeof $().zclip != 'function') { // On-demand load JS plugin
                callJs(zeroJs, 0, attachClipboard);
            }
            else attachClipboard();
            delayKillMiniBar();
        },
        killMiniBar = function() {
            if (_db_) db('killMiniBar()');
            $minibar.fadeOut(500, function(){ $(this).hide(); $(this).find('div.zclip').remove(); });
        },
        delayKillMiniBar = function() {
            if (_db_) db('delayKillMiniBar()');
            barTmr = setTimeout(killMiniBar, 2600);
        },
        protectMiniBar = function() {
            if (_db_) db('protectMiniBar()');
            if (barTmr) clearTimeout(barTmr);
            barTmr = null;
        },
        getSelectedText = function(event) { // Capture selected text...
            textSelected = getTextSelect(); // Get user text selection string
            if (_db_) db('getSelectedText() textSelected', textSelected);
            if (textSelected !== '') {
                $targetSelect = $(event.target); // Stock <p> that made event
                showMiniBar(event.pageX, event.pageY); // Show text tools
            }
        };

    $minibar
        .bind('mouseover.'+name, protectMiniBar)
        .bind('mouseleave.'+name, delayKillMiniBar)
        .hide();

    // $copier.bind('click.'+name, function(){}); //  Overided by ZeroClipboard.swf // check attachClipboard()
    $editer.bind('click.'+name, function(event) { callEditable(event); killMiniBar(); });
    $noter.bind('click.'+name, function(event) { addNote(event); killMiniBar(); });

    // ----------- BOOK WIDTH RESIZE AND DRAG ---------------------------------------------------------------------------------- //

    // Section RESIZER, Listening mouse move only when mouse down...
    var mouseTmr            = null,
        barTmr              = null,
        handleW             = $resizeHandle.width(),
        newW                = 0,
        gesturesY           = 0,
        textSelected        = '';

    var initResize = function(event) { // onMouseDown
            if (_db_) db('initResize()');
            $resizeHandle.addClass('actif');
            $body.bind('mousemove.'+name, mouseIsMoveResize);
        },
        unInitResize = function(event) { // onMouseUp
            if (_db_) db('unInitResize()');
            if (!mouseTmr) return; // Called by document.mouseIsUp so we are not always concerned */
            clearInterval(mouseTmr);
            mouseTmr = null;
            $body.unbind('mousemove.'+name, mouseIsMoveResize);
            $resizeHandle.removeClass('actif');
            callResize(parseInt(event.pageX, 10));
        },
        mouseIsMoveResize = function(event) {
            // if (_db_) db('document.mouseIsMoveResize()'); // Flood !
            $resizeHandle.css({left: (parseInt(event.pageX, 10) - (handleW/2))+'px'});
            if (mouseTmr) clearInterval(mouseTmr);
            mouseTmr = setInterval(callResize, 500,  parseInt(event.pageX, 10));
        },
        callResize = function(mouseY) {
            if (_db_) db('callResize(mouseY)', mouseY);
            /*    1) Work with : #article { position:absolute; top:5%; left:8%; width:60%; }
                newW = (mouseY - parseInt($container.offset().left) - 100 + (handleW/2)); // Container (article) : 100 == 50px padding * 2
                newW = (newW > 1000 ? 1000 : (newW < 280 ? 280 : newW)); $container.width(newW+'px');
                2)  Work with : #article { position:relative; margin:5% 25% 5% 8%; } */
            newW =  100 - (((mouseY + (handleW/2)) /  getWinWidth()) * 100);
            newW = (newW > 70 ? 70 : (newW < 2 ? 2 : newW)); // MIN / MAX right margin %
            $container.css({marginRight:newW+'%'}); // CAREFULL : This value can be overided by CSS #container min/max-width + Media query
            setResizeRepos();
            resizeRefreshEvent(); // update view with new text height
        },
        setResizeRepos = function() { // Attach resize Handle to Book
            if (_db_) db('setResizeRepos()');
            $resizeHandle.css({
                top: (parseInt($container.offset().top, 10))+'px',
                left: (parseInt($container.offset().left, 10) + $container.outerWidth() - handleW)+'px',
                height:($container.outerHeight() - 2)+'px'
            });
            $dragRight.css({width:(getWinWidth() - parseInt($resizeHandle.css('left'), 10) - handleW)+'px'});
        };

    setResizeRepos();

    // Clic to drag and scroll
    var mouseIsMoveScrollY = function(event) { // Mouse drag window vertical scroll
            if (_db_) db('body.mouseIsMoveScrollY()');
            // window.scrollBy(0, gesturesY - parseInt(event.pageY, 10)); // Native
            // myScrollTo(getScrollTop() + ((gesturesY - parseInt(event.pageY, 10))* 1.5)); // Animated
            setScrollTop(getScrollTop() + (gesturesY - parseInt(event.pageY, 10))); // Direct
        },
        mouseInitScrollY = function(event) {
            if (_db_) db('document.mouseInitScrollY()');
            gesturesY = parseInt(event.pageY, 10); // Stock init point
            $body.bind('mousemove.'+name, mouseIsMoveScrollY);
        },
        mouseUnInitScrollY = function(event) {
            if (_db_) db('document.mouseUnInitScrollY()');
            $body.unbind('mousemove.'+name, mouseIsMoveScrollY);
        },
        mouseIsDown = function(event) {
            if (_db_) db('document.mouseIsDown()');
            killAutoPlay(); // We kill autoscroll player...
            var $target = $(event.target);
            if ($target.is($resizeHandle)) {
                if (_db_) db('document.mouseIsDown().resize');
                event.preventDefault();
                initResize(event);
                return false;
            }
            else if ($target.is($dragLeft) || $target.is($dragRight) || $target.is($container)) { // Catch doc clic for vertical scroll
                if (_db_) db('document.mouseIsDown().drag');
                event.preventDefault();
                mouseInitScrollY(event);
                return false;
            }
        },
        mouseIsUp = function(event) {
            if (_db_) db('document.mouseIsUp()');
            // event.preventDefault();
            unInitResize(event);
            mouseUnInitScrollY(event);
            if ($(event.target).is(container) || $(event.target).parents(container).length > 0) // Copy/Edit text only in main article
                getSelectedText(event); // Show minibar ?
            // return false;
        };

    // ----------- DOCUMENT EVENTS ---------------------------------------------------------------------------------- //

    // Allo Doc ?
    var attachDocumentEvents = function () {
            if (_db_) db('attachDocumentEvents()');
            $document
                .bind('keydown.'+name, pageKey)
                .bind('keyup.'+name, pageUnKey)
                .bind('mousedown.'+name, mouseIsDown)
                .bind('mouseup.'+name+' click.'+name, mouseIsUp) // We catch also click because mouseup don't fire outside window ;)
                .focus(); // Bing !
        },
        removeDocumentEvents = function () {
            if (_db_) db('removeDocumentEvents()');
            $document
                .unbind('keydown.'+name, pageKey)
                .unbind('keyup.'+name, pageUnKey)
                .unbind('mousedown.'+name, mouseIsDown)
                .unbind('mouseup.'+name+' click.'+name, mouseIsUp); // We catch also click because mouseup don't fire outside window ;)
        };

    // ----------- SCREENSAVER ---------------------------------------------------------------------------------- //

    // Don't want user screensaver ! So say we're here.
    // setInterval(function() { if (_db_) db('No screensaver !!'); $document.trigger('keydown'); }, 60000); // Finaly i don't think this is possible in JS...

    // ----------- DOCUMENT LOCATION INIT ---------------------------------------------------------------------------------- //

    var initTarget = getHash();

    // Catch DISCUS comment back link, http://www.b2bweb.fr/bonus/piratons-la-democratie.html?pirate=3
    if (getUrlVars()['pirate']) {
        if (_db_) db('getUrlVars()', getUrlVars());
        $('a#pirate_'+getUrlVars()['pirate']).scrollToMe('#pirate_'+getUrlVars()['pirate']); // Scroll to corresponding Praragraphe Forum iID comment
    }
    else if (initTarget) { // #chapter_4_screen (fake) == #chapter_4 (real one)
        initTarget = initTarget.split('_screen'); // Catch fake hash setted with waypoint chapters scroll
        if (initTarget.length > 0) {
            if (_db_) db('auto init target', initTarget[0]);
            $(initTarget[0]).scrollToMe(initTarget[0]);
        }
    }

    // ----------- DIALOGUE ---------------------------------------------------------------------------------- //

    var popCallBack = ''; // Stock function to call with hideOverlay()
    

    var showHelp = function(event) { // Show Help div (#helpPanel) // You call a pop, overlay close it...
            if (_db_) db('showHelp()');
            event.preventDefault();
            showOverlay();
            $helpPanel
                .css({opacity:0}).show()
                .center().animate({opacity:1}, 1600);
            return false;
        },
        hideHelp = function() {
            if (_db_) db('hideHelp()');
            $helpPanel.animate({opacity:0}, 800, function() { $helpPanel.hide(); });
        },
        showOverlay = function(timeout) {
            if (_db_) db('showOverlay(timeout)', timeout);
    		if (!$overlay.lenght || $overlay.lenght < 1) { // Create overlay
				$overlay = $('<div id="'+overlay.slice(1)+'" title="Fermer"/>').appendTo($body); // Create
                $overlay.bind('click.'+name, hideOverlay);
            }
            $overlay.show().animate({opacity:1}, 900);
            if (timeout > 0) setTimeout(hideOverlay, timeout);
        },
        hideOverlay = function() {
            if (_db_) db('hideOverlay() popCallBack ?', popCallBack);
            if (popCallBack) {
                eval(popCallBack+'()'); // hum
                popCallBack = '';
            }
            hideHelp();
            $overlay.animate({opacity:0}, 900, function() { $overlay.hide(); });
        };

    $help.bind('click.'+name, showHelp);

    // Let know to the user that help board exist... :D
    var counter = 5,
        blinkHelp = function() {
            if (_db_) db('blinkHelp()');
            if ($help.is(':visible')) $help.fadeOut(300);
            else $help.fadeIn(300);
            counter--;
            if (counter >= 0) setTimeout(blinkHelp, 600);
            else $help.fadeIn(300); // Be sur to finish by show
        };

    setTimeout(blinkHelp, 600); // We wait a little before blinking the help link

    // ----------- USER NOTIFS ---------------------------------------------------------------------------------- //

    // Print a little message to the user
    var printInfos = function(message, delay) {
        if (_db_) db('printInfos()');
        delay = delay || 4000;
        $('div#message').remove();
        $('<div id="message"/>')
            .html('<p>'+message+'</p>')
            .appendTo($body)
            .animate({top:'-2px'}, 700)
            .delay(( delay ? delay : message.length * 80))
            .animate({top:'-20px'}, 400, function(){ $(this).remove(); });
    };

    // ----------- EVENTS-O-DROME ---------------------------------------------------------------------------------- //

    var attachEvents = function () {
            if (_db_) db('attachEvents()');
            attachBodyEvents();
            attachWindowEvents();
            attachDocumentEvents();

        },
        removeEvents = function () {
            if (_db_) db('removeEvents()');
            removeBodyEvents();
            removeWindowEvents();
            removeDocumentEvents();
        };

    attachEvents(); // GO !

    // ----------- END DEBUG ---------------------------------------------------------------------------------- //

    // LOG end time for reading this...
    if (_db_ && 'console' in window && 'time' in console) {
        console.warn('End of script reached in :');
        console.timeEnd('jquery.'+name+'.js');
    }

    // ----------- VERY END : THIRD PARTY ---------------------------------------------------------------------------------- //

    $(window).bind('load', function() { // Load plugins...
        if (disqusEnabled) callJs('http://'+disqus_shortname+'.disqus.com/count.js', 1); // get <p> comments counter
        // "Social" APIs
        callJs('https://apis.google.com/js/plusone.js', 1);
        callJs('http://platform.twitter.com/widgets.js', 1);
        $('iframe#facebook')
            .load(function() { callJs('http://connect.facebook.net/en_US/all.js#appId=235087756512662&amp;xfbml=1', 1); })
            .attr('src', 'http://www.facebook.com/plugins/like.php?app_id=235087756512662&amp;href&amp;send=false'+
                        '&amp;layout=button_count&amp;width=120&amp;height=20&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font');
    });
};

$(document).ready(readr);