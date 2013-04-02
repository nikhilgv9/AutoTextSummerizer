/*  Different Page Layouts */
var layouts = new Array();
layouts['default'] = new Array();
layouts['default']['top'] = { on: true, adParams: { sz:"260x60", name:"", exclusion:"", printWrap:false } }
layouts['default']['leaderboard'] = { on: false }
layouts['default']['right'] = { on: true, hide_elements: "", adParams: { sz:"300x250", name:"", exclusion:"" } }
layouts['homepage'] = layouts['default'];

layouts['scheduler'] = new Array();



/*
    NYMag homepage leaderboard schedule
*/

layouts['scheduler'].push({
	start: "March 6, 2013",
	end: "March 7, 2013",
	sect: "homepage",
	top: { on: true, adParams: { sz:"260x60", name:"", exclusion:"noist", printWrap:false } },
	leaderboard: { on: true, hide_elements: "", adParams: { sz:"980x60,980x30,970x66,970x90", name:"", exclusion:"", printWrap: false } },
    right: { on: true, hide_elements: "#mostpopular", adParams: { sz:"300x600", name:"", exclusion:"", printWrap: false } }
});

layouts['scheduler'].push({
	start: "March 7, 2013",
	end: "March 9, 2013",
	sect: "homepage",
	top: { on: true, adParams: { sz:"260x60", name:"", exclusion:"noist", printWrap:false } },
	leaderboard: { on: true, hide_elements: "", adParams: { sz:"980x60,980x30,970x66,970x90", name:"", exclusion:"", printWrap: false } },
    right: { on: true, hide_elements: "", adParams: { sz:"300x250", name:"", exclusion:"", printWrap: false } }
});

layouts['scheduler'].push({
	start: "March 11, 2013",
	end: "March 12, 2013",
	sect: "homepage",
	top: { on: true, adParams: { sz:"260x60", name:"", exclusion:"noist", printWrap:false } },
	leaderboard: { on: true, hide_elements: "", adParams: { sz:"980x60,980x30,970x66,970x90", name:"", exclusion:"", printWrap: false } },
    right: { on: true, hide_elements: "", adParams: { sz:"300x250", name:"", exclusion:"", printWrap: false } }
});

/*
    end NYMag homepage leaderboard schedule
*/


var NYM_AD_Overrides = {};
//    NYM_AD_Overrides.lazyLoad = false;


/*
    Turning specific ads on and off
    Format: [name of ad] = true(on)/false(off)
    Format: [name of ad][url to match] = true(on)/false(off)
	    This NEEDS to have '[name of ad][url to match] = new Array()' value if you want to match
	    url to match = /XXXXXX/.* to show include all things underneath that directory
    *You can target ALL pages not matching any of the array values by setting this param [name of ad]['rest']
*/

var ad_on = new Array();
ad_on['pencil_pushdown'] = new Array();
ad_on['pencil_pushdown']['rest'] = false;
ad_on['pencil_pushdown']['schedule'] = new Array();






/*
    NYMag splash/index page leaderboard schedule
*/

ad_on['pencil_pushdown']['schedule'].push({
    start: "March 11, 2013",
    end: "March 14, 2013",
    urls: "/daily/intelligencer/"
});

ad_on['pencil_pushdown']['schedule'].push({
    start: "March 11, 2013",
    end: "March 12, 2013",
    urls: "/nightlife/index.html"
});


/*
    end NYMag splash/index page leaderboard schedule
*/

for(var i=0; i<ad_on['pencil_pushdown']['schedule'].length; i++){
    sD = new Date(ad_on['pencil_pushdown']['schedule'][i].start);
    eD = new Date(ad_on['pencil_pushdown']['schedule'][i].end);
    if(currDate >= sD && currDate < eD){
	if(ad_on['pencil_pushdown']['schedule'][i].urls){
	    var urls = ad_on['pencil_pushdown']['schedule'][i].urls.split(",");
	    for(var j=0; j<urls.length; j++)
		ad_on['pencil_pushdown'][urls[j]] = true;
	}
    }
}



ad_on['article_260x60_bottom'] = false;
ad_on['article_300x250_2nd'] = false;

ad_on['blog_index_aside'] = new Array();
ad_on['blog_index_aside']['rest'] = false;
// ad_on['blog_index_aside']['/daily/entertainment/index.html'] = true;
ad_on['blog_index_aside']['/daily/intel/index.html'] = true;

ad_on['nodes'] = new Array();
ad_on['nodes']['fashion'] = 8261;
ad_on['nodes']['magazine'] = 8262;
ad_on['nodes']['shopping'] = 8263;
ad_on['nodes']['weddings'] = 4646;

/* Check whether to swap double click ads instead of google ads */
var swap_dc = new Array();
swap_dc["footer-ad"] = false;
swap_dc["right-ad"] = false;


// fashion slideshows
var slideshow_refresh_ads = true;
var slideshow_refresh_freq = 10;
var slideshow_show_interstitials = true;
var slideshow_interstitial_freq = 12;

var fullScreen_slideshow_refresh_freq = 500;
var fullScreen_slideshow_ad_tag = "http://ad.doubleclick.net/pfadx/nym.nymag/fashionshows;sect=fashionshows;subs=fullscreen;comp=;sz=300x601;site=nymag";

//added 8-12-08
//maniuplation of fashion slideshow ads

var isBannerCampaign_static = false;    //adds a banner to top of slideshows
var isBannerCampaign_search = false;
var isHideous_fabulous_campaign = false;    //reloads ads after each hideous fabulous vote

//added 5/27/09
//shopamatic slideshow config options

var SHOPAMATIC_INTERSITIAL_INTERVAL = 12;  //number of slides to view before intersistal is shown
var SHOPAMATIC_INTERSITIAL_TIMER_DELAY = 10; //seconds to delay intersitial before moving on
var GLOBAL_SHOPAMATIC_INTERSITIAL_SWITCH = 1; //global turn on/off siwthc for shopamatic intersitials 
var SHOPAMATIC_INTERSITIAL_WHITELIST = [];
var INTERSITIAL_FIRST_DISPLAY_COUNT = 0; //displays the intersital for the first time after x slides
var TOTAL_SHOPAMATIC_INTERSITIAL_VIEWS = 0; //the total amount of times an intersital should be shown


/* Callback for Google Ads function */
function nym_google_ad_request_done(args) {
    var ad_container_id = args.ad_container_id;
    var google_ads = args.google_ads;
    var ad_code = '';

    if (!ad_container_id || !google_ads || google_ads.length == 0) {
	return;
    }

    if (google_ads[0].type == "flash") {
	ad_code += '<div class="google_ad_flash">' +
	    '<a href="' + google_info.feedback_url + '" style="color:000000">Ads by Google</a><br>' +
	    '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
	    ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" ' +
	    'WIDTH="' + google_ad.image_width + '" HEIGHT="' + google_ad.image_height + '">' +
	    '<PARAM NAME="movie" VALUE="' + google_ad.image_url + '">' +
	    '<PARAM NAME="quality" VALUE="high"><PARAM NAME="AllowScriptAccess" VALUE="never">' +
	    '<EMBED src="' + google_ad.image_url + '" WIDTH="' + google_ad.image_width +
	    '" HEIGHT="' + google_ad.image_height + '" TYPE="application/x-shockwave-flash" ' +
	    'AllowScriptAccess="never" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer">' +
	    '</EMBED></OBJECT></div>';
    } else if (google_ads[0].type == "image") {
	ad_code += '<div class="google_ad_image">' +
	    '<a href="' + google_ads[0].url + '" target="_top" title="go to ' +
	    google_ads[0].visible_url + '" onmouseout="window.status=\'\'" onmouseover="window.status=\'go to ' +
	    google_ads[0].visible_url + '\'; return true">' +
	    '<img border="0" src="' + google_ads[0].image_url +
	    ' "width="' + google_ads[0].image_width + ' "height="' + google_ads[0].image_height + '"></a>';
    } else if (google_ads[0].type == "html") {
        document.write(google_ads[0].snippet);
    	if( $("#content-promo > .google-bottom")[0] !== 'undefined' ) {
    	    $("#content-promo > .google-bottom")[0].style.textAlign="center";
    	}
	return;
    } else {
	if (google_ads.length == 1) {
	    ad_code += '<div class="googleads-expandable">' +
		'<a href="' + google_ads[0].url + '" ' +
		'onMouseOver="window.status=\'' + google_ads[0].visible_url + '\'" ' +
		'onMouseOut="window.status=\'\'" ' + 'title="' + google_ads[0].visible_url + '">' +
		'<b>' + google_ads[0].line1 + '</b></a><br />' +
		'<span>' + google_ads[0].line2 + ' ' + google_ads[0].line3 + '</span><br />' +
		'<span><small>' + '<a href="' + google_ads[0].url + '" ' +
		'onMouseOver="window.status=\'' + google_ads[0].visible_url + '\'" ' +
		'onMouseOut="window.status=\'\'" ' + 'title="' + google_ads[0].visible_url + '">' + google_ads[0].visible_url + '</small></span>' +
		'</a></span>';
	} else {
	    ad_code += '<div class="googleads"><ul>';

	    for (var i = 0; i < google_ads.length; ++i) {
		ad_code += '<li><a href="' + google_ads[i].url + '" ' +
		'onMouseOver="window.status=\'' + google_ads[i].visible_url + '\'" ' +
		'onMouseOut="window.status=\'\'" ' +
		'title="' + google_ads[i].visible_url + '">' +
		'<strong>' + google_ads[i].line1 + '</strong></a><p>' + google_ads[i].line2 + '<br />' + google_ads[i].line3 + '</p>' +
		'<a href="' + google_ads[i].url + '" ' +
		'onMouseOver="window.status=\'' + google_ads[i].visible_url + '\'" ' +
		'onMouseOut="window.status=\'\'" ' +
		'title="' + google_ads[i].visible_url + '">' + breakLongString(google_ads[i].visible_url, 24, "<wbr/>") +
		'</a></li>';
	    }

	    ad_code += '</ul><br /></div>';
	}
    }

    var ad_container = document.getElementById(ad_container_id);
    if (ad_container) {
	ad_container.innerHTML = ad_code;
    }

    var feedback_link = document.getElementById(ad_container_id + "_feedback");
    if (feedback_link) {
	feedback_link.href = google_info.feedback_url;
    }
}


function breakLongString(str, break_interval_chars, break_with_str) {
    if (typeof(str) == "string" && str.length > break_interval_chars) {
        str = str.match(new RegExp(".{1," + break_interval_chars + "}", "g")).join(break_with_str);
    }
    return str;
}

$(document).ready(function() {
    if (document.location.href === "http://nymag.com/deals/?mid=bsc_email") {
	lbPop({name:'deals-signup',height:460,width:720,url:'/includes/components/newsletter-signup/deals-signup.txt'});
    }
});


function createCookie(name, value, hours) {
    var expires, date;
    if (hours) {
	date = new Date();
	date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
	expires = '; expires=' + date.toGMTString();
    } else {
	expires = '';
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) === ' ') {
	    c = c.substring(1, c.length);
	}
	if (c.indexOf(nameEQ) === 0) {
	    return c.substring(nameEQ.length, c.length);
	}
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", - 1);
}

function nymTimeStamp() {
    return Math.round(Math.random() * 1000000000);
}

if (typeof window.NYM === 'undefined') {
    window.NYM = {};
}

NYM.dates = function () {
    return {
	convert: function (d) {
	    return (
	    d.constructor === Date ? d : d.constructor === Array ? new Date(d[0], d[1], d[2]) : d.constructor === Number ? new Date(d) : d.constructor === String ? new Date(d) : typeof d === "object" ? new Date(d.year, d.month, d.date) : NaN);
	},
	compare: function (a, b) {
	    return (
	    isFinite(a = this.convert(a)
		.valueOf()) && isFinite(b = this.convert(b)
		.valueOf()) ? (a > b) - (a < b) : NaN);
	},
	inRange: function (d, start, end) {
	    return (
	    isFinite(d = this.convert(d)
		.valueOf()) && isFinite(start = this.convert(start)
		.valueOf()) && isFinite(end = this.convert(end)
		.valueOf()) ? start <= d && d <= end : NaN);
	}
    };
}();

if (typeof window.NYM.config === 'undefined') {
    window.NYM.config = {};
}


NYM.config.takeovers = (function () {

    // global vars

    var transEndEventNames = {
	'WebkitTransition': 'webkitTransitionEnd',
	'MozTransition': 'transitionend',
	'OTransition': 'oTransitionEnd',
	'msTransition': 'MSTransitionEnd',
	'transition': 'transitionend'
    },
    transitionEndEvent = transEndEventNames[Modernizr.prefixed('transition')],
	style = document.createElement('style'),
	end1 = false,
	end2 = false,
	end3 = false,
	end4 = false,
	// this is necessary in case you want HTML5 video to appear on an iPad
	videoControls = (Modernizr.touch) ? 'controls="controls"' : '';

    //takeover functions

    var standardSkin = function (o) {

	if (Modernizr.mq('(max-width: 800px)') || Modernizr.touch) {
	    return;
	}

	var styles = 'body {background-image:url(' + o.img1x + ');}' + '@media only screen and (-webkit-device-pixel-ratio: 1.5),' + 'only screen and (-webkit-device-pixel-ratio: 2) {' + 'body {background-image:url(' + o.img2x + ');}' + '}',
	    html = '<a class="left" href="' + o.link + '"></a><a class="middle" href="' + o.link + '"></a><a class="right" href="' + o.link + '"></a>' + '<img class="track" src="' + o.track + '">',
	    img;

	$('html')
	    .addClass('standard-skin');

	//load css immediately, background image is available during page load
	if (window.matchMedia) {
	    style.innerHTML = styles;
	    document.head.appendChild(style);
	} else {
	    img = document.createElement('img');
	    img.src = o.img1x;
	    setTimeout(function () {
		document.body.style.backgroundImage = 'url(' + o.img1x + ')';
	    }, 400);
	}

	//load click elements after DOM is ready
	$(document)
	    .ready(function () {
	    document.getElementById('nymTakeover')
		.innerHTML = html;
	});
    };

    var interactiveSkin = function (o) {

	if (Modernizr.mq('(max-width: 800px)') || Modernizr.touch) {
	    return;
	}

	var styles = 'body {background-image:url(' + o.img1x + ');}' + '@media only screen and (-webkit-device-pixel-ratio: 1.5),' + 'only screen and (-webkit-device-pixel-ratio: 2) {' + 'body {background-image:url(' + o.img2x + ');}' + '}',
	    html = '<a class="left takeover-play" href="#"></a><a class="middle takeover-play" href="#"></a><a class="right takeover-play" href="#"></a>' + '<img class="track" src="' + o.track + '">',
	    video = '<video width="950" height="540" id="takeover-video" src="' + o.video + '" type="video/mp4" ' + videoControls + '></video><a class="takeover-click" href="' + o.link + '">',
	    campaignClass = (o.campaign) ? o.campaign.replace(/\s/g, '')
		.toLowerCase() : '',
	    img, billboardVideo;

	if (o.expandButton) {
	    $('html')
		.addClass('interactive-skin interactive-skin-expand-button ' + campaignClass);
	} else {
	    $('html')
		.addClass('interactive-skin ' + campaignClass);
	}

	//load css immediately, background image is available during page load
	if (window.matchMedia) {
	    style.innerHTML = styles;
	    document.head.appendChild(style);
	} else {
	    img = document.createElement('img');
	    img.src = o.img1x;
	    setTimeout(function () {
		document.body.style.backgroundImage = 'url(' + o.img1x + ')';
	    }, 400);
	}

	//load click and transition events after DOM ready
	$(document)
	    .ready(function () {

	    document.getElementById('nymTakeover')
		.innerHTML = html;
		
		$("#nymTakeover").on("click", ".takeover-click", function() {
        	_gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Billboard Click', o.campaign]);
        });
		
        _gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Impression', o.campaign]);

	    if (Modernizr.csstransitions) {

		$(document)
		    .on('click', '.takeover-play', function () {

		    $("#wrap-wrap-wrap")
			.addClass('interactive-skin-transition-1')
			.removeClass('interactive-skin-transition-fin');

		})
		    .on(transitionEndEvent, '.interactive-skin-transition-1 .middle', function () {

		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-1')
			.addClass('interactive-skin-transition-2');

		})
		    .on(transitionEndEvent, '#wrap-wrap-wrap.interactive-skin-transition-2', function () {

		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-2')
			.addClass('interactive-skin-transition-3');

		    // for some reason, Chrome is failing on the transition-2 transitionEnd event.
		    // we set a timer function as a fallback. adjust accordingly.
		    setTimeout(function () {

			if (!(end2)) {

			    $("#wrap-wrap-wrap")
				.removeClass('interactive-skin-transition-3')
				.addClass('interactive-skin-transition-4');
			    $('#takeover-player')
				.html(video);
			    if (Modernizr.touch) {
				$('#takeover-video')
				    .attr('controls', 'controls');
			    }
			    billboardVideo = new MediaElement('takeover-video', {
				success: function (mediaElement, domObject) {
				    mediaElement.play();
				    _gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Play', o.campaign]);
				}
			    });
			}

		    }, 500);

		})
		    .on(transitionEndEvent, '.interactive-skin-transition-3', function () {

		    end2 = true;
		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-3')
			.addClass('interactive-skin-transition-4');
		    $('#takeover-player')
			.html(video);
		    billboardVideo = new MediaElement('takeover-video', {
			success: function (mediaElement, domObject) {
			    mediaElement.play();
			    _gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Play', o.campaign]);
			    mediaElement.addEventListener('ended', function () {
				_gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Viewed', o.campaign]);
			    });
			}
		    });


		})
		    .on('click', '.takeover-close', function () {

		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-4')
			.addClass('interactive-skin-transition-5');
		    _gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Close', o.campaign]);

		})
		    .on(transitionEndEvent, '.interactive-skin-transition-5', function () {

		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-5')
			.addClass('interactive-skin-transition-6');

		})
		    .on(transitionEndEvent, '.interactive-skin-transition-6', function () {

		    $("#wrap-wrap-wrap")
			.removeClass('interactive-skin-transition-6')
			.addClass('interactive-skin-transition-fin');
		    $('#takeover-player')
			.html('');

		});

	    } else {

		//DOM ++ JavaScript animation for legacy browsers

		$(document)
		    .on('click', '.takeover-play', function () {

		    $('.takeover-play')
			.fadeOut();
		    $('#wrap-wrap-wrap')
			.delay(500)
			.animate({
			paddingTop: '675px'
		    }, 200, 'linear', function () {
			$(this)
			    .addClass('takeover-active');
			$('.takeover-close')
			    .fadeIn();
			$('#takeover-player')
			    .html(video);
			billboardVideo = new MediaElement('takeover-video', {
			    success: function (mediaElement, domObject) {
				mediaElement.play();
				_gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Play', o.campaign]);
			    }
			});
		    });

		})
		    .on('click', '.takeover-close', function () {

		    $('.takeover-close')
			.fadeOut();
		    $('#takeover-player')
			.html('');
		    $('#wrap-wrap-wrap')
			.removeClass('takeover-active')
			.delay(100)
			.animate({
			paddingTop: '160px'
		    }, 200, function () {
			$('.takeover-play')
			    .delay(400)
			    .fadeIn();
		    });
		    _gaq.push(['_trackEvent', 'The Cut: Interactive Skin Takeover', 'Close', o.campaign]);
		});
	    }

	}); // end $(document).ready
    };

    var openingCreditsVideo = function (o) {

      if (!window.location.toString().match(/testNymTakeover=/)) {
        if (readCookie(o.frequencyName) || Modernizr.mq('(max-width: 900px)') || Modernizr.touch) {
          return;
        } else {
          createCookie(o.frequencyName, o.frequencyValue, o.frequencyInHours);
        }
      }

      var html = '<a id="opening-credits-skip" class="opening-credits-button opening-credits-skip" href="#"><span>' + o.skipMessage + '</span></a><table class="opening-credits-inner"><tbody><tr><td><div id="opening-credits-billboard" class="opening-credits-billboard"><a id="opening-credits-billboard-click" class="opening-credits-billboard-click" href="' + o.link + '"></a><div id="opening-credits-video" class="opening-credits-video"></div><a id="opening-credits-audio" class="opening-credits-button opening-credits-audio" href="#" data-setmuted="true"><span>Sound Is <b>Off</b></span></a></div></td></tr></tbody></table><img class="track" src="' + o.track + '">',
	    video = '<video width="950" height="540" id="billboard-video" src="' + o.video + '" type="video/mp4" ' + videoControls + '></video>',
	    openingCreditsDiv, openingCreditsVideoDiv, billboardVideo;

      $('html').addClass('opening-credits').on("click", "#opening-credits-billboard-click", function() {
        _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Billboard Click', o.campaign]);
      });

      if (Modernizr.csstransitions) {

        $(document).ready(function () {
          
          document.getElementById('opening-credits').innerHTML = html;

          // cache selectors
          openingCreditsDiv = $('#opening-credits'),
          openingCreditsVideoDiv = $('#opening-credits-video');
          
          _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);

          setTimeout(function () {
            openingCreditsDiv.addClass('opening-credits-transition-1');
          }, 300);

          $('#opening-credits-skip').click(function (event) {
            event.preventDefault();
            billboardVideo = '';
            openingCreditsVideoDiv.html('');
            openingCreditsDiv.removeClass('opening-credits-transition-3').addClass('opening-credits-transition-fin');
            $('body').addClass('opening-credits-fin');
            document.getElementById('opening-credits').innerHTML = '';
            _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Skip', o.campaign]);
          });

        }).on(transitionEndEvent, '#opening-credits.opening-credits-transition-1', function () {

          openingCreditsDiv.removeClass('opening-credits-transition-1').addClass('opening-credits-transition-2');

        }).on(transitionEndEvent, '#opening-credits.opening-credits-transition-2', function () {

          openingCreditsVideoDiv.html(video);

          billboardVideo = new MediaElement('billboard-video', {
            success: function (mediaElement, domObject) {
              $('#opening-credits-audio').click(function (event) {
                event.preventDefault();
                if ($(this).data('setmuted')) {
                  $(this).data('setmuted', false).find('b').html('On');
                  mediaElement.setMuted(false);
                  mediaElement.setVolume(1);
                } else if (!($(this).data('setmuted'))) {
                  $(this).data('setmuted', true).find('b').html('Off');
                  mediaElement.setMuted(true);
                  mediaElement.setVolume(0);
                }
                _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Audio', o.campaign]);
              });

              mediaElement.setMuted(true);
              mediaElement.setVolume(0);
              mediaElement.play();
              _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Play', o.campaign]);
              mediaElement.addEventListener('ended', function () {
                _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Viewed', o.campaign]);
                openingCreditsDiv.delay(300).removeClass('opening-credits-transition-2').addClass('opening-credits-transition-3');
              });
            }
          });

        }).on(transitionEndEvent, '#opening-credits.opening-credits-transition-3', function () {

          billboardVideo = '';
          openingCreditsVideoDiv.html('');
          openingCreditsDiv.removeClass('opening-credits-transition-3').addClass('opening-credits-transition-fin');
          $('body').addClass('opening-credits-fin');
          document.getElementById('opening-credits').innerHTML = '';

	    }).on(transitionEndEvent, '#opening-credits.opening-credits-transition-4', function () {

        openingCreditsDiv.removeClass('opening-credits-transition-4').addClass('opening-credits-transition-fin');

      });

	} else {

	    $(document)
		.ready(function () {

		document.getElementById('opening-credits')
		    .innerHTML = html;

		// cache selectors
		openingCreditsDiv = $('#opening-credits'),
		openingCreditsVideoDiv = $('#opening-credits-video');

        _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);
        
		$('#opening-credits-skip')
		    .click(function (event) {
		    event.preventDefault();
		    billboardVideo = '';
		    openingCreditsVideoDiv.html('');
		    $('body')
			.addClass('opening-credits-fin');
		    openingCreditsDiv.html('')
			.removeClass('opening-credits-transition-2')
			.addClass('opening-credits-transition-fin');
		    _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Skip', o.campaign]);
		});

		openingCreditsDiv.addClass('opening-credits-transition-1');

		setTimeout(function () {

		    openingCreditsDiv.find('.opening-credits-inner')
			.fadeOut('slow')
			.delay(500)
			.fadeIn('slow', function () {

			openingCreditsDiv.removeClass('opening-credits-transition-1')
			    .addClass('opening-credits-transition-2');

			openingCreditsVideoDiv.html(video);

			billboardVideo = new MediaElement('billboard-video', {
			    success: function (mediaElement, domObject) {
				$('#opening-credits-audio')
				    .click(function (event) {
				    event.preventDefault();
				    if ($(this)
					.data('setmuted')) {
					$(this)
					    .data('setmuted', false)
					    .find('b')
					    .html('On');
					mediaElement.setMuted(false);
				    } else if (!($(this)
					.data('setmuted'))) {
					$(this)
					    .data('setmuted', true)
					    .find('b')
					    .html('Off');
					mediaElement.setMuted(true);
				    }
				    _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Audio', o.campaign]);
				});

				mediaElement.setMuted(true);
				mediaElement.play();
				mediaElement.addEventListener('ended', function () {
				    $(domObject)
					.fadeOut('fast');
				    billboardVideo = '';
				    openingCreditsVideoDiv.html('');
				    openingCreditsDiv.html('')
					.removeClass('opening-credits-transition-2')
					.addClass('opening-credits-transition-fin');
				    $('body')
					.addClass('opening-credits-fin');
				    _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Viewed', o.campaign]);
				});
			    }
			});

		    });

		}, 500);

	    });

	}

    };

    var openingCreditsImage = function (o) {
   
      if (!window.location.toString().match(/testNymTakeover=/)) {
        if (readCookie(o.frequencyName) || Modernizr.mq('(max-width: 900px)') || Modernizr.touch) {
          return;
        } else {	
          createCookie(o.frequencyName, o.frequencyValue, o.frequencyInHours);
        }
      }

      var styles = '.opening-credits-billboard-click {background-image:url(' + o.img1x + ');}' + '@media only screen and (-webkit-device-pixel-ratio: 1.5),' + 'only screen and (-webkit-device-pixel-ratio: 2) {' + '.opening-credits-billboard-click {background-image:url(' + o.img2x + ');}' + '}',
      html = '<a id="opening-credits-skip" class="opening-credits-button opening-credits-skip" href="#"><span>' + o.skipMessage + '</span></a><table class="opening-credits-inner"><tbody><tr><td><div id="opening-credits-billboard" class="opening-credits-billboard"></div></td></tr></tbody></table><img class="track" src="' + o.track + '">',
      image = '<a id="opening-credits-billboard-click" class="opening-credits-billboard-click" href="' + o.link + '"></a>',
      openingCreditsDiv, openingCreditsImageDiv;

      $('html').addClass('opening-credits-image').on("click", "#opening-credits-billboard-click", function() {
        _gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Billboard Click', o.campaign]);
      });

      if (Modernizr.mq('(min-width: 0px)')) {
        style.innerHTML = styles;
        document.head.appendChild(style);
      }

	if (Modernizr.csstransitions) {

	    $(document)
		.ready(function () {

		document.getElementById('opening-credits')
		    .innerHTML = html;

		// cache selectors
		openingCreditsDiv = $('#opening-credits');
		openingCreditsImageDiv = $('#opening-credits-billboard');
		
		_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);

		setTimeout(function () {
		    openingCreditsDiv.addClass('opening-credits-transition-1');
		}, 300);

		$('#opening-credits-skip')
		    .click(function (event) {
		    event.preventDefault();
		    openingCreditsDiv.removeClass()
			.addClass('opening-credits-transition-fin');
		    $('body')
			.addClass('opening-credits-fin');
		    document.getElementById('opening-credits')
			.innerHTML = '';
			_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Skip', o.campaign]);
		});


	    })
		.on(transitionEndEvent, '#opening-credits.opening-credits-transition-1', function () {

		openingCreditsDiv.removeClass('opening-credits-transition-1')
		    .addClass('opening-credits-transition-2');

	    })
		.on(transitionEndEvent, '#opening-credits.opening-credits-transition-2', function () {

		openingCreditsDiv.removeClass('opening-credits-transition-2')
		    .addClass('opening-credits-transition-3');

	    })
		.on(transitionEndEvent, '#opening-credits.opening-credits-transition-3', function () {

		openingCreditsImageDiv.html(image);

		openingCreditsDiv.removeClass('opening-credits-transition-3')
		    .addClass('opening-credits-transition-4');

	    })
		.on(transitionEndEvent, '#opening-credits.opening-credits-transition-4', function () {

		setTimeout(function () {
		    openingCreditsDiv.removeClass('opening-credits-transition-4')
			.addClass('opening-credits-transition-5');
		}, 5000);

	    })
		.on(transitionEndEvent, '#opening-credits.opening-credits-transition-5', function () {

		openingCreditsDiv.removeClass('opening-credits-transition-5')
		    .addClass('opening-credits-transition-fin');
		openingCreditsDiv.removeClass()
		    .addClass('opening-credits-transition-fin');
		$('body')
		    .addClass('opening-credits-fin');
		document.getElementById('opening-credits')
		    .innerHTML = '';
	    });

	} else {

	    $(document)
		.ready(function () {

		document.getElementById('opening-credits')
		    .innerHTML = html;

		// cache selectors
		openingCreditsDiv = $('#opening-credits');
		openingCreditsImageDiv = $('#opening-credits-billboard');
		
		_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);

		setTimeout(function () {
		    openingCreditsDiv.addClass('opening-credits-transition-1');
		}, 300);

		$('#opening-credits-skip')
		    .click(function (event) {
		    event.preventDefault();
		    openingCreditsDiv.removeClass()
			.addClass('opening-credits-transition-fin');
		    $('body')
			.addClass('opening-credits-fin');
		    document.getElementById('opening-credits')
			.innerHTML = '';
			_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Skip', o.campaign]);
		});

		setTimeout(function () {

		    openingCreditsDiv.find('.opening-credits-inner')
			.fadeOut('slow')
			.delay(500)
			.fadeIn('slow', function () {

			openingCreditsDiv.removeClass('opening-credits-transition-1')
			    .addClass('opening-credits-transition-2');

			openingCreditsImageDiv.html(image)
			    .fadeIn();

			setTimeout(function () {

			    openingCreditsImageDiv.html('')
				.fadeOut();
			    openingCreditsDiv.removeClass()
				.addClass('opening-credits-transition-fin');
			    $('body')
				.addClass('opening-credits-fin');
			    document.getElementById('opening-credits')
				.innerHTML = '';

			}, 5000);

		    });

		}, 500);


	    });

	}
    };

	var openingCreditsGatefold = function(o) {
		
		if (!window.location.toString().match(/testNymTakeover=/)) {
			if (readCookie(o.frequencyName) || Modernizr.mq('(max-width: 900px)') || Modernizr.touch) {
				return;
			}
			else {
				createCookie(o.frequencyName, o.frequencyValue, o.frequencyInHours);
			}
		}
		
		$("html").addClass("opening-credits");

		var html =
			"<div class=\"overlayAdContainer opening-credits-wrap\">\
				<a class=\"clickToCloseOpener quickTransitions\" href=\"#\" title=\"" + o.skipMessage + "\">" + o.skipMessage + "</a>\
				<a id=\"opening-credits-gatefold-billboard-click\" href=\"" + o.link + "\" title=\"" + o.linkTitle + " page\" target=\"_blank\">\
					<img class=\"presentedByImageTote quickTransitions\" src=\"" + o.brandTout + "\" alt=\"Presented by lettering\" />\
					<div class=\"leftAdGate quickTransitions\">\
						<img src=\"" + o.imageLeft + "\" alt=\"" + o.linkTitle + " logo\" />\
					</div>\
					<div class=\"rightAdGate quickTransitions\">\
						<img class=\"adImage\" src=\"" + o.imageRight + "\" />\
					</div>\
				</a>\
				<img class=\"track\" src=\"" + o.track + "\" />\
			</div>";
		
		// check for window resize and scale ad image accordingly
		$(window).on("resize", function() {
			$(".leftAdGate img").css("margin", Math.ceil(($(window).height() / 2) - $(".leftAdGate img").height()) + "px 25%");
		});
		
		// attach click event to skip message button
		$("html").on("click", ".clickToCloseOpener", function() {
			$(".overlayAdContainer").remove();
			$("body").addClass("opening-credits-fin");
			_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Skip', o.campaign]);
		});
	
		if (Modernizr.csstransitions) {
			$(document)
			// initially load the opening credits gatefold
			.ready(function() {
				
				$("body").append(html).on("click", "#opening-credits-gatefold-billboard-click", function() {
					_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Billboard Click', o.campaign]);
				});
				
				_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);
				
				// initiate the first animation (the presented by image tote)
				setTimeout(function () {
					$(".presentedByImageTote").css("opacity", 1);
				}, 500);
			})
			// initiate the skip message and button
			.on(transitionEndEvent, ".presentedByImageTote", function() {
				$(".clickToCloseOpener").css({
					"top": "30px",
					"opacity": 1
				});
			})
			// initiate the gatefold
			.on(transitionEndEvent, ".clickToCloseOpener", function() {
				setTimeout(function() {
					$(".presentedByImageTote").css("opacity", 0);
					$(".leftAdGate").css("opacity", 1);
					$(".rightAdGate").css("opacity", 1);
					$(window).resize();
				}, 1500);
			})
			// initiate the closing animation for the gatefold
			.on(transitionEndEvent, ".rightAdGate", function() {
				setTimeout(function() {
					$(".opening-credits-wrap").css("background", "none");
					$(".clickToCloseOpener").remove();
					$(".opening-credits #wrap-wrap-wrap").css({
						"position": "static",
						"left": "auto"
					});
					$(".leftAdGate").removeClass("quickTransitions").addClass("exitTransitions translateLeft");
					$(".rightAdGate").removeClass("quickTransitions").addClass("exitTransitions translateRight");
					$(".clickToCloseOpener").remove();
					
					$(this).on(transitionEndEvent, ".leftAdGate", function() {
						$(".overlayAdContainer").remove();
						$("body").addClass("opening-credits-fin");
					})
			
			
				}, 4000);
			});
		}
		else {
			$(document).ready(function() {
				$("body").append(html).on("click", "#opening-credits-gatefold-billboard-click", function() {
					_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Billboard Click', o.campaign]);
				});
				
				_gaq.push(['_trackEvent', 'The Cut: Opening Credits', 'Impression', o.campaign]);
				
				if (!Modernizr.opacity) {
					$(".presentedByImageTote").css({
						"opacity": 0,
						"margin-left": Math.ceil($(window).width() / 2 - ($(".presentedByImageTote").width() / 2))
					});
					$(".clickToCloseOpener").css("opacity", 0);
					$(".leftAdGate").css({
						"opacity": 0,
						"position": "absolute"
					});
					$(".rightAdGate").css("opacity", 0);
				}
				
				function displayGatefold() {
					$(window).resize();
					$(".presentedByImageTote").fadeTo(500, 0);
					$(".leftAdGate").fadeTo(500, 1);
					$(".rightAdGate").fadeTo(500, 1);
					setTimeout(function() {
						$(".opening-credits-wrap").css("background", "none");
						$(".clickToCloseOpener").remove();
						$(".opening-credits #wrap-wrap-wrap").css({
							"position": "static",
							"left": "auto"
						});
						$(".leftAdGate").animate({"left": -($(".leftAdGate").width())}, 1000);
						$(".rightAdGate").animate({"right": -($(".rightAdGate").width())}, 1000, function() {
							$(".overlayAdContainer").remove();
							$("body").addClass("opening-credits-fin");
						});
					}, 4000);
				};
				
				function displaySkipAndTote() {
					$(".presentedByImageTote").fadeTo(500, 1, function() {
						$(".clickToCloseOpener").fadeTo(500, 1).animate({"top": "30px"}, 500);
						setTimeout(displayGatefold, 2000);
					});
				};
				
				setTimeout(displaySkipAndTote, 500);
			});
		}
	};

    return {
      standardSkin: standardSkin,
      interactiveSkin: interactiveSkin,
      openingCreditsVideo: openingCreditsVideo,
      openingCreditsImage: openingCreditsImage,
      openingCreditsGatefold: openingCreditsGatefold
    };

})();