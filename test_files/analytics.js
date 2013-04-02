/********************************************************************/
//	New York Media
//	analytics.js - Analytics JavaScript - $Id: analytics.js 16326 2012-07-06 16:08:53Z veremeeva $
//
//	Description:
//		This script creates a request to send client data to Omniture
//
//	Updated:	2013.02.22
//
//	Revisions:
//		2007.10.26 DB: Updated to use Symantec-like version comments.
//		2008.03.27 DB: Added backward compatibility section.
//		2008.07.17 DB: Enabled <meta /> hierarchy support.
//		2008.08.13 DB: Restructured the request code.
//		2008.09.23 DB: Added <meta /> update capabilities.
//		2008.12.29 DB: Mapped 'content.tags' to s.products.
//		2009.02.02 DB: Added sanitize functionality. Updated year.
//		2009.03.23 DB: Added nymag_param, Comscore AJAX request.
//		2009.03.26 DB: Mapped 'content.modules' to s.prop10.
//		2009.04.22 DB: Added Quantcast page view, labels API hooks.
//		2009.05.07 DB: Added nymag_event, upgraded Omniture to H.20.2.
//		2009.06.30 DB: Added content.tags.primary and comScore Beacon.
//		2012.12.18 DB: Removed Quantcast references. No longer used.
//		2013.02.22 DB: Started excluding more pages to move away from this Omniture tracking version.
/* 20090507 H.20.2. */
/************************* PAGE VIEW API ****************************/
//nymag_pageView takes a reportsuite and a tfracking object and returns a tracking object
//	its purpose is to execute an Omniture 'Page View'/'Pageview' request
function nymag_pageView (reportsuite, s) {
    return trk_pageView(reportsuite,s);
}

function trk_pageView (reportsuite, s) {
	if(typeof(s_gi) != 'function') return;
	if(typeof(reportsuite)=='undefined') var reportsuite = window.reportsuite;
	if(typeof(s)!="object") var s=s_gi(reportsuite);
	if(typeof(s.t)!="function") return;
	s = nymag_config(s);
	//NOTE: s.pagename, s.prop26, s.eVar2, s.eVar20 are all handled by
	//	nymag_collectMetadata(). These values (other than s.prop26) should NOT
	//	be populated here! This is because 'content.pagename' is mapped to
	//	s.prop26 and any special handling of this variable should remain in
	//	nymag_collectMetadata() to allow for on the fly updates.
	var url = window.location.href.match("/print/?") ? window.location.href.replace("/print/?","") : window.location.href; //Change URL for print pages so it looks like normal Page
	var track = nymag_classify(url, s, pattern_array, exclude_array, info_array);
	 s.channel = track.channel;
	   s.hier1 = track.hier1;
	   s.prop1 = track.prettyname;
	   s.prop2 = track.horiz1;
	   s.prop3 = track.horiz2;
	  s.prop22 = track.centralized;
	  s.prop25 = nymag_getUserId();
	  s.prop26 = url;
	  s.prop30 = nymag_param({"url":url, "param":"textquery"});
      s.prop36=s.getQueryParam('mid');
	  s.prop37=s.getQueryParam('rid');
	  if ((document.getElementsByName("Byline")) && (document.location.href.match("videos.") == null)){
	     s.prop41 = document.getElementsByName("Byline").length ? nym.trim(document.getElementsByName("Byline")[0].content) : "";
	     s.prop41 = document.getElementsByName("author").length ? nym.trim(document.getElementsByName("author")[0].content) : s.prop41;
	     s.prop41 = document.getElementsByName("content.author").length ? nym.trim(document.getElementsByName("content.author")[0].content) : s.prop41;
	  }

	  s.prop42 = document.getElementsByName("content.form").length ? nym.trim(document.getElementsByName("content.form")[0].content) : "";
	  
	  if ( (typeof window.NYM !== 'undefined') && NYM.mobileListings){
  		s.prop43 = "Yes";
  	}
  	
	  s.prop47 = document.getElementsByName("content.lengthofarticle").length ? nym.trim(document.getElementsByName("content.lengthofarticle")[0].content) : "";
	  s.prop48 = document.getElementsByName("content.featurename").length ? nym.trim(document.getElementsByName("content.featurename")[0].content) : "";

	  s.eVar1 = nymag_param({"url":url, "param":"f"});
	  s.eVar9 = nymag_param({"url":url, "param":"om_u"});
	  s.eVar10 = nymag_param({"url":url, "param":"om_i"});
	  s.eVar11 = nymag_param({"url":url, "param":"aid"});
	  s.eVar12 = nymag_param({"url":url, "param":"mid"});
	  s.eVar13 = nymag_param({"url":url, "param":"time"});
	  s.campaign = s.eVar12;

	 s = nymag_collectMetadata(s);

	 //Subsections Level 1-3 pulled from hier1 variable
	 s.a1=new Array();
	 s.a1=s.hier1.split(',');
	 if (s.a1[0]) {s.prop31=s.eVar14=s.a1[0];}
	 if (s.a1[1]) {s.prop32=s.eVar15=s.a1[1];}
	 if (s.a1[2]) {s.prop33=s.eVar16=s.a1[2];}


	 if(document.location.href.match("/embed/") == null){
		 //Omniture Page View
		 s.t();
		 //ComScore Page View
		 nymag_comscore();
		 if(window.nymag.ajaxy) {
			 nymag_ajaxyPageView();
			 nymag_nielson_ajax();
			 window.nymag._qoptions["event"] = "refresh";
		 }
	 }

	 return s;
}

//nymag_event takes an object and returns void
//	its purpose to execute a custom event request
function nymag_event(input) {
	if(!input || (typeof input == "undefined")) return false;
	if(!input.name || (typeof input.name != "string")) return false;
	if(!input.type || (typeof input.type != "string")) return false;
	if(!input.este || (typeof input.type == "undefined")) return false;

	var omniture = window.nymag["omniture"];
	if(typeof omniture != "object") return false;

	var reportsuite = omniture["reportsuite"];
	if(typeof reportsuite != "string") return false;

	var events = omniture["events"];
	if(typeof events != "object") return false;

	var eventConfig = events[input.type];
	if(typeof eventConfig != "object") return false;

	var s = omniture["s"];
	if(typeof s != "object") {
		s = s_gi(reportsuite);
	}

	for(var property in eventConfig) {
		s[property] = eventConfig[property];
	}

	nymag_setMetadata({"content.campaign.internal" : "event." + input.type });
	s = nymag_collectMetadata(s);
	s.tl(input.este, 'o', input.name);
}

function nymag_recordLink( target, linkName, customEvent ){
    trk_recordLink(target,linkName,customEvent);
}
function trk_recordLink( target, linkName, customEvent ){
    s_gi(reportsuite);
    s.linkTrackVars="prop34,eVar8,events";
    s.linkTrackEvents = s.events = "event20";
    s.prop34=s.eVar8=document.location.href;
    if(typeof customEvent != "undefined"){
        s.linkTrackEvents += "," + customEvent;
        s.events += "," + customEvent;
    }
    s.tl(target, 'o', linkName);
}

function omnitureClick(element,msg){
    element.onclick = function(e){
        while(e.target.nodeName != "A"){
	        if(e.target==this) return;
	        e.target = e.target.parentNode;
		}
		nymag_recordLink(this,msg);

		var date = new Date(), curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 200);

		return true;
	};
}


//nymag_setMetadata takes an object metadata and returns void
//	its purpose is to enable updating the metadata on a page
function nymag_setMetadata( metadata ) {
    trk_setMetadata(metadata);
}
function trk_setMetadata( metadata ) {
	if(document.getElementsByTagName('head')[0].nodeName!='HEAD') return;
	var head = document.getElementsByTagName('head')[0];
	var metas = document.getElementsByTagName('meta');
	var metacontent = {};
	for(var i in metas) {
		metacontent[metas[i].name] = metas[i].content;
	}
	for(var nom in metadata) {
		if(typeof metacontent[nom] != "string") {
			newmeta = document.createElement('META');
			newmeta.name = nom;
			newmeta.content = metadata[nom];
			//IE will not see this new element in the names array, so we need to help it out.
			if(typeof document.getElementsByName(nom)[0] == 'undefined') newmeta.id = 'nymag_setMetadata_' + nom;
			head.appendChild(newmeta);
			metacontent[nom] = metadata[nom];
			continue;
		}
		metacontent[nom] = metadata[nom];
	}
	for(var i in metas) {
		metas[i].content = metacontent[metas[i].name];
	}
}

/************************** CONFIGURATION ***************************/
//Assign server-side globals.
if(typeof window.nymag == 'undefined') window.nymag = {};
window.nymag["temp"] = {
	"year" : "2009",
	"ajaxy" : false,
	"comscore" : {
		"account" : "6034623"
	},
	"_qoptions" : {
		 "qacct" : "p-52tlJ-QdbVwC-",
		 "media" : "webpage",
		 "event" : "load",
		"labels" : ""
	},
	"omniture" : {
		"reportsuite" : "nymcom",
		"events" : {
			"ajaxscroll" : {
				"linkTrackVars" : "events",
				"linkTrackEvents" : "events20",
				"events" : "event20"
			},
			"addtab" : {
				"linkTrackVars" : "events",
				"linkTrackEvents" : "events20",
				"events" : "event20"
			},
			"click" : {
				"linkTrackVars" : "events",
				"linkTrackEvents" : "events20",
				"events" : "event20"
			}
		}
	}
};
for(var i in window.nymag["temp"]) {
	window.nymag[i] = window.nymag["temp"][i];
}
delete window.nymag["temp"];

var reportsuite = window.nymag["omniture"]["reportsuite"];
var s=s_gi(reportsuite);
window.nymag["omniture"]["s"] = s;

//nymag_config takes and returns a tracking objects
//	its purpose is to configure the given analytics services for nymag.com
function nymag_config(s) {
	nymag_configOmniture(s);
	return s;
}

//nymag_configOmniture takes and returns a tracking objects
//	its purpose is to configure our Omniture Analytics
function nymag_configOmniture(s) {
	s.charSet="ISO-8859-1";
	s.currencyCode="USD";
	s.trackDownloadLinks=true;
	s.trackExternalLinks=true;
	s.trackInlineStats=true;
	s.linkDownloadFileTypes="exe,zip,wav,mp3,mov,mpg,avi,wmv,doc,pdf,xls";
	s.linkInternalFilters="javascript:,nymag.com,#,localhost,nymetro.com";
	s.linkLeaveQueryString=false;
    s.linkTrackVars="eVar2,eVar17,eVar18,eVar19,prop39,prop40,events";
    s.linkTrackEvents="event14,event15,event16,event17";

	s.visitorNamespace="newyorkmagazine";
	s.dc=112;
	s.trackingServer="stats.nymag.com";
	s.trackingServerSecure="sstats.nymag.com";
	s = nymag_configOmniturePlugins(s);
	return s;
}

//nymag_configOmniturePlugins takes and returns a tracking objects
//	its purpose is to configure Omniture written plugins
function nymag_configOmniturePlugins(s) {
	//Plugin Config
	//Form Analysis Config (should be above doPlugins section)
	s.formList="";
	s.trackFormList=true;
	s.trackPageName=true;
	s.useCommerce=false;
	s.varUsed="prop23";
	s.eventList=""; //Abandon,Success,Error
	s.usePlugins=true;
	return s;
}

function s_doPlugins(s) {
	var nymag = window.nymag;
	//Set the campaign variable if it has not yet been set
	if(!s.campaign) s.campaign=s.getQueryParam('cmp_id')
	//getValOnce used to deflate campaign click-throughs
	s.campaign=s.getValOnce(s.campaign,"ctc",0)
	//Set event 1 (page view) on every page
	if(s.events){if(s.events.indexOf("event1")==-1){s.events=s.events + ',event1'}}else{s.events='event1'}
	//Set days since last visit
	s.prop21=s.eVar6=s.getDaysSinceLastVisit();
	s.prop21=s.getAndPersistValue(s.prop21,'o_dslv',0);
	//Set Channel, pageName and Content Hierarchy as the appropriate eVars
	//s.eVar2=s.pageName;
	s.eVar3=s.channel;
	s.eVar4=s.hier1;
	s.prop6=s.hier1;
	//gather client time information
	if(nymag.year && (typeof nymag.year != "undefined")) {
	    var currYear = (new Date()).getYear()+1900;
		timed   = s.getTimeParting('d','-5',currYear);
		timeh   = s.getTimeParting('h','-5',currYear);
		timew   = s.getTimeParting('w','-5',currYear);
		s.prop7 = timed.toLowerCase();
		s.prop8 = timeh.toLowerCase();
		s.prop9 = timew.toLowerCase();
	}
	s.setupFormAnalysis();

        s.hbx_lt = "manual" // manual, auto
        s.setupLinkTrack("prop34,,,prop39","SC_LINKS");
}


/************************* FUNCTION OMNITURE TRACKING ON THE SAME PAGE ************************/


if(!window.G) {
  window.G = {};
}


function charEncodeSpaces(someText) {
	 var encodedText = "";
	 if (someText == "") return false;
	 encodedText = someText.replace(/\s+/g,'%20');
	 return encodedText;
};
window.G.charEncodeSpaces = charEncodeSpaces;

function readOmnitureOnPage(element,eventNumber,linkName,currentTargetLink,crossDomain) {

// BASIC SETTINGS
		_r   = "";  // redirect site
		var _r = "&r=" + Math.random()*10000000000000000;
		_eventNumber = "";
		_ch = ""; _h1 = ""; _pageName = "";
        _pid = ""; _cid = ""; _oid = "";
		_c1 = ""; _c2 = ""; _c6 = "";	_c7 = ""; _c8 = "";	_c9 = ""; _c21 = "";_c22 = "";	_c26 = "";	_c31 = "";	_c32 = "";	_c33 = "";
		_c34 = ""; // prev page ( convention for NY MAG - the current page ex. http://nymag.com/)
		_c39 = ""; // link name (ex. Homepage:Middle:The Vulture Logo )
		_c43 = ""; // next page (ex. http://www.vulture.com/ )
		_c44= "";

		_v1 = ""; _v2 = "";	_v3 = "";_v4 = "";	_v14 = "";	_v15 = "";	_v16 = "";	_v20 = "";	_v24 = "";
		// global setting
		 tm = new Date, sed = Math && Math.random ? Math.floor(Math.random() * 10000000000000) : tm.getTime(),
		 sess = "s" + Math.floor(tm.getTime() / 10800000) % 10 + sed, y = tm.getYear(),
         vt = tm.getDate() + "/" + tm.getMonth() + "/" + (y < 1900 ? y + 1900 : y) + " " + tm.getHours() + ":" + tm.getMinutes() + ":" + tm.getSeconds() + " " + tm.getDay() + " " + tm.getTimezoneOffset();
		_t = "&t="+vt;
		s_random = Math.random()*10000000000000000;

		if(nymag.year && (typeof nymag.year != "undefined")) {
		    var currYear = (new Date()).getYear()+1900;
			timed   = s.getTimeParting('d','-5',currYear);
			timeh   = s.getTimeParting('h','-5',currYear);
			timew   = s.getTimeParting('w','-5',currYear);
			s.prop7 = timed.toLowerCase();
			s.prop8 = timeh.toLowerCase();
			s.prop9 = timew.toLowerCase();
			_c7 = "&c7="+s.prop7;
		    _c8 = "&c8="+s.prop8;
		    _c9 = "&c9="+s.prop9;
		}

		_ns = "&ns=" + s.visitorNamespace;
        _ce = "&ce=UTF-8";
        _cc = "&cc=USD";
        url = window.location.href;
        prop30 = s.prop30?s.prop30:url;
        _gn = "?gn="+encodeURIComponent(prop30);
        _sv = "&sv=" + encodeURIComponent(s.channel);
        _v0 = "&v0=" + encodeURIComponent(s.channel);

        _pageName = "&pageName=" + prop30;
        _pid = "&pid="+ prop30;
        _oid = "&oid="+ currentTargetLink;
         _g = "&g=" + encodeURIComponent(prop30);
        _ch = "&ch=" + s.channel;
        _h1 = "&h1=" + s.hier1;

		// eVars setting
		if (s.eVar1) {
	      _v1 = "&v1=" + s.eVar1;
	    }
	    _v2 = "&v2=" + s.eVar2;  _v3 = "&v3=" + s.eVar3;   _v4 = "&v4=" + s.eVar4;  _v9 = "&v9=" + s.eVar9; _v10 = "&v10=" + s.eVar10; _v11 = "&v11=" + s.eVar11;
	    _v12 = "&v12=" + s.eVar12;  _v13 = "&v13=" + s.eVar13;  _v14 = "&v14=" + s.eVar14;   _c31 = "&c31=" + s.prop31;
	    if (s.eVar15) {   _v15 = "&v15=" + s.eVar15;   _c32 = "&c32=" + s.prop32;   }
	    if (s.eVar16) {   _v16 = "&v16=" + s.eVar16;   _c33 = "&c33=" + s.prop33;   }
	     _v20 = "&v20=" + s.eVar20;
	    // props setting
         _c1 = "&c1=" + s.prop1; _c2 = "&c2=" + s.prop2; _c6 = "&c6=" + s.prop6; s.prop21=s.eVar6=s.getDaysSinceLastVisit();
         if (s.prop21 && (s.prop21 !="")) {  _c21 = "&c21=" + s.prop21; }
  	     _c30 = "&c30=" + s.prop30; _c36 = "&c36=" + s.prop36; _c37 = "&c37=" + s.prop37; _c41 = "&c41=" + s.prop41;

		var omniture = window.nymag["omniture"];
        if(typeof omniture != "object") return false;

        var reportsuite = omniture["reportsuite"];
        if(typeof reportsuite != "string") return false;


	// MODIFIED SECTION

	     testlink = encodeURIComponent(currentTargetLink);

		/* cross domain page */
		if ((crossDomain) && (crossDomain !="")) {
		 currentPageUrl = encodeURIComponent(prop30);
		  s.prop43 = encodeURIComponent(crossDomain);
		  testlink = encodeURIComponent(currentTargetLink);
		  _c43 = "&c43="+testlink;
	   	  crossDomainPage = encodeURIComponent(prop30);
		  _c44 = "&c44="+ crossDomainPage;
		  _v24 = "&v24="+ crossDomainPage;
		  _c39 = "&c39="+encodeURIComponent(linkName);
		  _c34 = "&c34=" + currentPageUrl;
		}
		/* link positioning */
        else {
        currentPageUrl = prop30;
         _c34 = "&c34=" + encodeURIComponent(currentPageUrl);
         _c39 = "&c39="+encodeURIComponent(linkName);
         _c43 = "&c43=" + testlink;
         // Facebook Like fp
         if (eventNumber == "28") {
            _c39 = "&c39="+encodeURIComponent(linkName);
         }
        }

        _pe = "&pe=lnk_o";
        _pev1 = "&pev1=" + testlink;
        _pev2 = "&pev2=NewYorkMagLinkTracking";
         var eventsTracking ="event1";
         if ((eventNumber) && (eventNumber!="")) {
             eventsTracking = eventsTracking + ",event"+eventNumber;
         }

    	_events = "&events="+ eventsTracking;

        	_srcURL = "http://stats.nymag.com/b/ss/nymcom/5/415306" + _gn + _ch + _sv + _v0 +  _t + _ce + _ns + _cc + _pageName + _c1 + _c2 + _c6 +  _c21 + _c22 + _c31 + _c32 + _c33 + _c39 +  _c34 + _c43 + _c44 + _events + _pe + _pev1 + _pev2 + _g +  _v1 + _v2 + _v3 + _v4 + _v14 + _v15 + _v16 + _v24 + _r;

		escapedURL = charEncodeSpaces(_srcURL);
		imgTest = new Image();
		imgTest.src = _srcURL;
}

window.G.readOmnitureOnPage = readOmnitureOnPage;

(function( $ ) {
  $.addOmnitureToTarget = function(element,omnitureParam, event) {
	    this.options = "";
	    this.event = {};
	    element.data("addOmnitureToTarget",this);
	    this.init = function(element,omnitureParam, event) {
	       this.options = omnitureParam;
	       this.event = event;
	       getTargetedElements(element, this.options, this.event);
	     };

      // public
      this.init(element,omnitureParam,event);
  };

  $.fn.addOmnitureToTarget = function(omnitureParam) {
      if (typeof options == 'undefined'){
	  		var options = {

			};
	  }

	  var target = this;
      var $this = $(this);

   	    if (typeof omnitureParam == "string") {

	    jQuery(target).live("click",function(e) {
	         if (!e)
		      e = window.event;

		     if (e.cancelBubble)
		       e.cancelBubble = true;
		     else
		      e.stopPropagation();
	         var self = this;
	         (new $.addOmnitureToTarget($(this),omnitureParam,e));
             return false;
			 });
			  }
        return false;
   };

   $.addOmnitureToTarget.defaultOptions = "";

  function getTargetedElements(element, omnitureParam, e) {
      e.preventDefault();
      var currentTarget = "";
      var currentTitle ="";
      if (!e) e = window.event;  // Get event details for IE
      currentTarget = e.target || e.srcElement;
      if (currentTarget) {
          if ($(currentTarget).text() != "") {
          currentTitle = $(currentTarget).text();
          }
         else  currentTitle = "image";
      }
       var omniturePassedParam = omnitureParam;
       if (currentTarget && currentTarget.nodeName == "A") {
           currentTarget = currentTarget;
       }
       else {
	       while ((currentTarget && currentTarget.nodeName != "A") && (currentTarget != element)) {
	          // adjust omniture parameter for spec cases - no css selectors/based on <b> inside of <a>

	          // tweak for Top Stories - CAN't Make difference based on selectors for Secondary and Tertiary Stories
	           if ($("body").hasClass("sect-home")) {
					if ($(element).attr("class") == "cover-stories") {
					   if (currentTarget.nodeName == "B") omniturePassedParam = "Homepage: Middle: Secondary Top Stories";
					}
			   }
			    currentTarget = currentTarget.parentNode;
	       }
	      if (currentTarget == element) { return false; }
       }
     var regexExp = new Array();
     regexExp[0] = 'vulture.com'; // vulture.com
     regexExp[1] = "nymag.com";
     regexExp[2] = "grubstreet.com";
     regexExp[3] = "/daily/food";           // grubstreet
     regexExp[4] = "/daily/entertainment";  // vulture site
     regexExp[5] = "menupages.com";  // vulture site
     regexExp[6] = "nymag.streeteasy";  //  http://nymag.streeteasy.com/nyc/rentals/nyc/
     regexTarget = currentTarget.href;
     currentTargetHref = currentTarget.href;
     regexArrSize = regexExp.length;
     crossDomain = '';
     url = document.location.href;
     currentUrl = s.prop30?s.prop30:url;
     for (i=0;i<regexArrSize; i++) {
       if ((currentUrl.indexOf(regexExp[i]) == -1) && (regexTarget.indexOf(regexExp[i]) > -1)) {
          crossDomain = regexTarget;
          if (regexExp[i] == "/daily/food") {
             currentTargetHref = regexTarget.replace("nymag.com\/daily\/food","newyork.grubstreet.com");
             crossDomain = currentTargetHref;
          }
          if (regexExp[i] == "/daily/entertainment") {
             currentTargetHref = regexTarget.replace("nymag.com\/daily\/entertainment","vulture.com");
             crossDomain = currentTargetHref;
          }
       }
     }
     if (crossDomain !='') {
        G.readOmnitureOnPage(element,'',omniturePassedParam,currentTargetHref,crossDomain.toString());
     }

     else {
      G.readOmnitureOnPage(element,'',omniturePassedParam,currentTargetHref);
     }

    setTimeout(function(){
         document.location = currentTarget.href;
    }, 250);
     
 }
})( jQuery );


jQuery(document).ready(function() {

// temporary implemented only for NYMAG home page
     var homePage = false;
     var currentPageOn = window.location.href;
     var currPage = new Array();
     currPage[0] = 'http://nymag.com';
     currPage[1] = 'http://www.nymetro.com';
     currPage[2] = 'http://www.nymag.com';
     currPage[3] = 'http://nymag.com/';
     currPage[4] = 'http://www.nymag.com/';

     var currPageSize = currPage.length;
     for (i=0;i<currPageSize; i++) {
       if (currPage[i].toString() == currentPageOn.toString()) {
          homePage = true;
       }
     }
     if (currentPageOn.indexOf("nymag.com/\?") > -1) {
        homePage = true;
     }

if (homePage) {
	 // the left rail
	  $("#blog-promo > h2").addOmnitureToTarget("Homepage: Left: Daily Intel: Logo");
	  $("#blog-promo div.entry").addOmnitureToTarget("Homepage: Left: Daily Intel: Stories");
	  $("#blog-promo div.foot").addOmnitureToTarget("Homepage: Left: Daily Intel: Stories");
	  $(".early-often-promo").addOmnitureToTarget("Homepage: Left: Politics Logo");
	  $("#sports-section .head").addOmnitureToTarget("Homepage: Left: Sports Section: Logo");
	  $("#sports-section .entry").addOmnitureToTarget("Homepage: Left: Sports Section: Story");
	  $("#sports-section .foot").addOmnitureToTarget("Homepage: Left: Sports Section: Story");
	  $("#marketing-guides").addOmnitureToTarget("Homepage: Left: Marketing: Guides");
	  $("#marketing-marketplace").addOmnitureToTarget("Homepage: Left: Marketing:  Marketplace");
	  $("#nym-apps").addOmnitureToTarget("Homepage: Left: Marketing: Apps");
	  $("#back-issues").addOmnitureToTarget("Homepage: Left: Marketing: The Magazine");
	  $("#newsletters").addOmnitureToTarget("Homepage: Left: Marketing: Cut Promo");
	  $("#sponsored").addOmnitureToTarget("Homepage: Left: Marketing: Sponsored");
	  $("#deals").addOmnitureToTarget("Homepage: Left: Marketing: Deals");
	  $("#events").addOmnitureToTarget("Homepage: Left: Marketing Events");

     // middle Top Stories
	 $("#top-stories .lead").addOmnitureToTarget("Homepage: Middle: Top 1");
	 $("#top-stories .cover-stories").addOmnitureToTarget("Homepage: Middle: Tertiary Top Stories");

	// vulture module
	 $(".blog-sections > h2.vulture").addOmnitureToTarget("Homepage: Middle: Vulture Logo");
	 $(".blog-vulture .blogcol").addOmnitureToTarget("Homepage: Middle: Vulture Stories");
	 $(".blog-vulture .footer").addOmnitureToTarget("Homepage: Middle: Vulture Stories");

	 $(".blog-sections > h2.cut").addOmnitureToTarget("Homepage: Middle: The Cut Logo");
	 $(".blog-the-cut").addOmnitureToTarget("Homepage: Middle: The Cut Stories");

	 $(".blog-sections > h2.grub").addOmnitureToTarget("Homepage: Middle: GrubStreet Logo");
	 $(".blog-grub-street .content").addOmnitureToTarget("Homepage: Middle: GrubStreet Stories");

	 $(".clickables-app-feed-promo").addOmnitureToTarget("Homepage: Middle: Marketing: Clickable Banner");

	 $(".featured-videos").addOmnitureToTarget("Homepage: Middle: Top Video");
     $(".sting .sting-left").addOmnitureToTarget("Homepage: Middle: The List");
     $(".sting .sting-right").addOmnitureToTarget("Homepage: Middle: The Photo Gallery");

	 $("#mostpopular #most-viewed").addOmnitureToTarget("Homepage: Right: Most Popular Stories: Most viewed");
	 $("#mostpopular #most-commented").addOmnitureToTarget("Homepage: Right: Most Popular Stories: Most commented");
	 $("#mostpopular #most-emailed").addOmnitureToTarget("Homepage: Right: Most Popular Stories: Most e-mailed");

	 // news module
	  $(".main-feature  .main.news").addOmnitureToTarget("Homepage: Middle: News and Features");
	 $(".main-feature  #chait").addOmnitureToTarget("Homepage: Middle Right: Columns and Essays");

	 // restaurant module
	 $(".main-feature  .main.restaurant").addOmnitureToTarget("Homepage: Middle: Restaurants");
	 $(".main-feature  #restaurant-content").addOmnitureToTarget("Homepage: Middle Right: First Look");

	 // entertainment module
	 $(".main-feature  .main.entertainment").addOmnitureToTarget("Homepage: Middle: Entertainment");
	 $(".main-feature  #tvrecap-content").addOmnitureToTarget("Homepage: Middle: Entertainment: TV Recaps");

	 // fashion module
	 $(".main-feature  .main.fashion").addOmnitureToTarget("Homepage: Middle: Fashion");
     $("#fashion-content").addOmnitureToTarget("Homepage: Middle Right: Fashion");

    // shopping module
	 $(".main-feature  .main.shopping").addOmnitureToTarget("Homepage: Middle: Shopping");
     $("#shopping-content").addOmnitureToTarget("Homepage: Middle Right: Shopping");

     $(".main-feature  .highlights .unit.feature.real-estate").addOmnitureToTarget("Homepage: Middle: Real Estate");
     $(".main-feature  .highlights .unit.feature.travel").addOmnitureToTarget("Homepage: Middle: Travel");
     $(".main-feature  .highlights .unit.feature.bars").addOmnitureToTarget("Homepage: Middle: Bars");
     $("#realestate-content").addOmnitureToTarget("Homepage: Middle Right: Real Estate Finds");

     // navigation
	 $("#nav-news > .top").addOmnitureToTarget("Homepage:  Top:  News And Features");
	 $("#sub_nav_news li").addOmnitureToTarget("Homepage:  Top:  News And Features:  Subnav");
	 $("#nav-rest > .top").addOmnitureToTarget("Homepage: Top: Restaurants");
	 $("#sub_nav_rest  li").addOmnitureToTarget("Homepage: Top: Restaurants: Subnav");
	 $("#nav-bars > .top").addOmnitureToTarget("Homepage: Top: Bars");
	 $("#sub_nav_bars  li").addOmnitureToTarget("Homepage: Top: Bars: Subnav");
	 $("#nav-entr > .top").addOmnitureToTarget("Homepage: Top: Entertainment");
	 $("#sub_nav_entr  li").addOmnitureToTarget("Homepage: Top: Entertainment: Subnav");
	 $("#nav-fash > .top").addOmnitureToTarget("Homepage: Top: Fashion");
	 $("#sub_nav_fash  li").addOmnitureToTarget("Homepage: Top: Fashion: Subnav");
	 $("#nav-shop > .top").addOmnitureToTarget("Homepage: Top: Shopping");
	 $("#sub_nav_shop  li").addOmnitureToTarget("Homepage: Top: Shopping: Subnav");
	 $("#nav-agenda").addOmnitureToTarget("Homepage: Top: Agenda");
     $("#nav-home").addOmnitureToTarget("Homepage: Top: Home");

	 //subnavigation
	 $("#nav-real").addOmnitureToTarget("Homepage: Top: Real Estate");
	 $("#sub_nav_real li").addOmnitureToTarget("Homepage: Top: Real Estate: Subnav");
	 $("#nav-trav").addOmnitureToTarget("Homepage: Top: Travel");
	 $("#sub_nav_trav li").addOmnitureToTarget("Homepage: Top: Travel: Subnav");
	 $("#nav-visit").addOmnitureToTarget("Homepage: Top: Visitor's Guide");
	 $("#sub_nav_visit li").addOmnitureToTarget("Homepage: Top: Visitor's Guide: Subnav");
	 $("#nav-beauty").addOmnitureToTarget("Homepage: Top: Beauty");
	 $("#sub_nav_beauty li").addOmnitureToTarget("Homepage: Top: Beauty: Subnav");
	 $("#nav-design").addOmnitureToTarget("Homepage: Top: Design");
	 $("#nav-weddings").addOmnitureToTarget("Homepage: Top: Weddings");
	 $("#nav-bestdocs").addOmnitureToTarget("Homepage: Top: Best Doctors");
	 $("#nav-dating").addOmnitureToTarget("Homepage: Top: Dating");
	 $("#nav-bony").addOmnitureToTarget("Homepage: Top: Best Of New York");
	 $("#sub_nav_bony li").addOmnitureToTarget("Homepage: Top: Best Of New York: Subnav");
	 $("#subscribe-today li > a").addOmnitureToTarget("Homepage: Top: Subscribe Now");
	 $("#subscribe-today li a.last").addOmnitureToTarget("Homepage: Top: Give A Gift");



	 // right modules
	  $(".utility.of-interest").addOmnitureToTarget("Homepage: Right: Top Right Module");
	  $(".current-issue").addOmnitureToTarget("Homepage: Right: The Current Issue");

 }
 
 // navigation
 $("#nav-news > .top").addOmnitureToTarget("Homepage:  Top:  News And Features");
 $("#sub_nav_news li").addOmnitureToTarget("Homepage:  Top:  News And Features:  Subnav");
 $("#nav-rest > .top").addOmnitureToTarget("Homepage: Top: Restaurants");
 $("#sub_nav_rest  li").addOmnitureToTarget("Homepage: Top: Restaurants: Subnav");
 $("#nav-bars > .top").addOmnitureToTarget("Homepage: Top: Bars");
 $("#sub_nav_bars  li").addOmnitureToTarget("Homepage: Top: Bars: Subnav");
 $("#nav-entr > .top").addOmnitureToTarget("Homepage: Top: Entertainment");
 $("#sub_nav_entr  li").addOmnitureToTarget("Homepage: Top: Entertainment: Subnav");
 $("#nav-fash > .top").addOmnitureToTarget("Homepage: Top: Fashion");
 $("#sub_nav_fash  li").addOmnitureToTarget("Homepage: Top: Fashion: Subnav");
 $("#nav-shop > .top").addOmnitureToTarget("Homepage: Top: Shopping");
 $("#sub_nav_shop  li").addOmnitureToTarget("Homepage: Top: Shopping: Subnav");
 $("#nav-agenda").addOmnitureToTarget("Homepage: Top: Agenda");
 $("#nav-home").addOmnitureToTarget("Homepage: Top: Home");

 //subnavigation
 $("#nav-real").addOmnitureToTarget("Homepage: Top: Real Estate");
 $("#sub_nav_real li").addOmnitureToTarget("Homepage: Top: Real Estate: Subnav");
 $("#nav-trav").addOmnitureToTarget("Homepage: Top: Travel");
 $("#sub_nav_trav li").addOmnitureToTarget("Homepage: Top: Travel: Subnav");
 $("#nav-visit").addOmnitureToTarget("Homepage: Top: Visitor's Guide");
 $("#sub_nav_visit li").addOmnitureToTarget("Homepage: Top: Visitor's Guide: Subnav");
 $("#nav-beauty").addOmnitureToTarget("Homepage: Top: Beauty");
 $("#sub_nav_beauty li").addOmnitureToTarget("Homepage: Top: Beauty: Subnav");
 $("#nav-design").addOmnitureToTarget("Homepage: Top: Design");
 $("#nav-weddings").addOmnitureToTarget("Homepage: Top: Weddings");
 $("#nav-bestdocs").addOmnitureToTarget("Homepage: Top: Best Doctors");
 $("#nav-dating").addOmnitureToTarget("Homepage: Top: Dating");
 $("#nav-bony").addOmnitureToTarget("Homepage: Top: Best Of New York");
 $("#sub_nav_bony li").addOmnitureToTarget("Homepage: Top: Best Of New York: Subnav");
 $("#subscribe-today li > a").addOmnitureToTarget("Homepage: Top: Subscribe Now");
 $("#subscribe-today li a.last").addOmnitureToTarget("Homepage: Top: Give A Gift");
 
 
});

/************************* FUNCTION WRAPPERS ************************/
//nymag_ajaxyPageView takes and returns void
//	its purpose is to provide "AJAX-like" page views with an AJAX request
function nymag_ajaxyPageView() {
	//If jQuery is unavailable, don't break the JavaScript.
	try {
		$.getJSON("/includes/components/tracking/ajaxy.txt?" + Math.random());
	}
	catch (e) {};
}

//nymag_getUserId takes and returns void
//	its purpose is to safely wrap the getUserId function
function nymag_getUserId() {
	if(typeof getUserId == "function")
		return getUserId();
	return "";
}

function nymag_nielson_ajax(){
    var d = new Image(1, 1);
    d.src = ["//secure-us.imrworldwide.com/cgi-bin/m?ci=us-703858h&cg=0&cc=1&si=", escape(window.location.href), "&rp=", escape(document.referrer), "&c0=usergen,1&rnd=", (new Date()).getTime()].join('');
}

//nymag_comscore takes and returns void
//	its purpose is to safely make a comScore page view
function nymag_comscore() {
	var comscoreMeta = window.nymag.comscore;
	var account = comscoreMeta.account;
	var title = comscoreMeta.title;
	if((typeof title == "undefined")) {
		title = "Uncategorized";
	}
	var this_url = nymag_sanitizePageName(document.location.href);
	var comscore = (document.location.protocol == "https:" ? "https://sb" : "http://b") +
	".scorecardresearch.com/b" +
	"?c1=2&c2=" + account + "&c3=nymag.dev&c4=" + this_url + "&c5=&c6=" +
	"&c7=" + escape(document.location.href) +
	"&c8=" + escape(title) +
	"&c9=" + escape(document.referrer) +
	"&c10=" + escape(screen.width+'x'+screen.height) +
	"&c15=&rn=" + (new Date()).getTime();
	var i = new Image();
	i.src = comscore;
}

//nymag_readCookie takes and returns a string
//	its purpose is to safely wrap the readCookie function
function nymag_readCookie(cookie) {
	if(typeof readCookie == "function")
		return readCookie(cookie);
	return "";
}

/************************* FUNCTION LIBRARY *************************/
//nymag_param takes an object input and returns a string
//	its purpose is to get a parameter from input["param"] from input["url"]
function nymag_param( input ) {
	if(!input || (typeof input == "undefined")) return false;
	if(!input.url || (typeof input.url != "string")) return false;
	if(!input.param || (typeof input.param != "string")) return false;
	var url = input.url;
	regex = new RegExp(".*(\\\?|#|&)" + input.param + "=([^?#&]*)");
	var matches = regex.exec(url);
	if(!matches || (typeof matches == "undefined")) return "";
	var result = matches[2];
	return result;
}

//nymag_sanitize takes an object input and returns a string
//	its purpose is to make input['value'] safe for the input['name'] datatype
function nymag_sanitize(input) {
	if(!input || (typeof input == 'undefined')) return false;
	if(!input.name || (typeof input.name != 'string')) return false;
	//Allow at most 15 'content.tags', 'content.modules'.
	if(input.name == 'content.tags' || input.name == 'content.modules') {
		return nymag_sanitizeTags(input.value);
	}
	//Ensure exactly one pageview (event1) is fired.
	if(input.name == 'content.events') {
		return nymag_sanitizeEvents(input.value);
	}
	//Note 'content.pagename' is distinguished and should NOT be sanitized here.
	//No sanitization necessary at this point.
	return input.value;
}

//nymag_sanitizePageName takes and returns a string
//	its purpose is to make a url suitable for the Most Popular Pages report
function nymag_sanitizePageName(url) {
	var anchor = url.indexOf("#");
	var query = url.indexOf("?");
	if((anchor == -1) && (query == -1))
		return url;
	if(0 < anchor && (anchor < query || query == -1))
		return url.substr(0, anchor);
	return url.substr(0, query);
}

//nymag_sanitizeTags takes and returns a string
//	its purpose is to reduce the number of tags to 15
function nymag_sanitizeTags(tags) {
	//content.tags.primary value should not change on a page and should
	//be prepended to other tags here
	var primarytags = document.getElementsByName("content.tags.primary")[0];
	if(typeof primarytags != "undefined") {
		tags = primarytags.content + "," + tags;
	}
	return tags.split(',').slice(0,15).join(',');
}

//nymag_sanitizeEvents takes and returns a string
//	its purpose is to ensure the correct events are fired
function nymag_sanitizeEvents(events) {
	temp = events.replace(
		/event1\b/g,
		''
	).replace(
		/(^,|,$)/g,
		''
	).replace(
		/,+/g,
		','
	);
	/**
	 * These replacements sanitize the events string.
	 * /event1\b/g	Strip out all instances of 'event1'. The \b means
	 *            		word boundary and so will match [^A-Za-z0-9].
	 *  /(^,|,$)/g	Strip leading and trailing commas.
	 *       /,+/g	Merge consecutive commas into a single one.
	 */
	sanitized = 'event1,' + temp;
	return sanitized;
}

//nymag_comscoreMeta takes an object and returns void
//	its purpose is to manage comscore metadata
function nymag_comscoreMeta(input){
	if(!input || (typeof input == 'undefined')) return false;
	var hierarchyInput = input["hierarchy"];
	if((typeof hierarchyInput == "undefined")) {
		window.nymag.comscore["title"] = "Uncategorized";
		return;
	}
	window.nymag.comscore["title"] = hierarchyInput;
	return;
}

//nymag_collectMetadata takes an object tracking_object and returns a tracking object
//	its purpose is to read the meta tags of a document and set the appropriate parameters in the tracking_object
function nymag_collectMetadata(tracking_object) {
	var metatags = {
		         "content.campaign" : "campaign",
		        "content.hierarchy" : "channel",
		           "content.events" : "events",
		             "content.tags" : "products",
		"content.hierarchy.primary" : "hier1",
		  "content.hierarchy.title" : "prop1",
		             "content.type" : "prop2",
		          "content.subtype" : "prop3",
		          "content.modules" : "prop10",
		         "content.pagename" : "prop26",
		"content.campaign.internal" : "eVar1",
					 "content.form" : "Prop42",
		  "content.lengthofarticle" : "Prop47",
			  "content.featurename" : "Prop48"
	};
	for(var name in metatags) {
		if(typeof document.getElementsByName(name)[0] == 'undefined') {
			var alternate = document.getElementById('nymag_setMetadata_' + name);
			//alternate could be null. In JavaScript null evaluates to false in Boolean context.
			if(alternate && (typeof alternate.content == 'string')) {
				tracking_object[metatags[name]] = nymag_sanitize({
					 "name" : name,
					"value" : alternate.content
				});
			}
			continue;
		}
		tracking_object[metatags[name]] = nymag_sanitize({
			 "name" : name,
			"value" : document.getElementsByName(name)[0].content
		});
	}
	var channel_split = tracking_object.channel.split(":");
	tracking_object.hier1 = channel_split.join(",");
	//The value 'content.pagename' is special and is treated here instead of
	//	nymag_sanitize(). We track this information as props and eVars to
	//	ensure consistency within certain reports.
	tracking_object.pageName = nymag_sanitizePageName(tracking_object.prop26);
	   tracking_object.eVar2 = tracking_object.pageName;
	  tracking_object.eVar20 = tracking_object.prop26;
	//Populate comScore meta data.
	nymag_comscoreMeta({
		"hierarchy" : tracking_object.channel
	});
	return tracking_object;
}

//nymag_recordEvent takes an object what_happen and returns a boolean
//	its purpose is to execute an Omniture event request
function nymag_recordEvent( what_happen ) {
	//main screen turn on
	//note that the s object is already available in the global scope
	s=s_gi(what_happen.reportsuite);
	for(zig in what_happen) {
		if((zig == 'name') || (zig == 'reportsuite'))
			continue;
		s[zig] = what_happen[zig];
	}
	//we get signal
	s.tl(what_happen.origin,'o',what_happen.name);
	return true;
}

//nymag_guidFromRequest takes and returns a string
//	its purpose is to turn a request uri into a blog guid
function nymag_guidFromRequest( request ) {
	var guid = request.replace(
		/(.*:\/\/[^?#]*)(\?.*|#.*|)/,
		"$1"
	);
	/**
	 * This replacement strips the query string and anchor links from urls.
	 * /(.*:\/\/[^?#]*)	match must begin with a string followed by '://'
	 *                 		and then collect all that is not a '?' or '#'
	 *     (\?.*|#.*|)/	also match any query string or anchor link (to erase)
	 */
	return guid;
}

//nymag.com site section hierarchy
pattern_array = new Array("qa.nymetro.com\/", "nymag.com\/weddings\/listings", "nymag.com\/weddings", "nymag.com\/weather\/", "nymag.com\/visitorsguide\/index.htm", "nymag.com\/visitorsguide\/(|\\?.*)$", "nymag.com\/visitorsguide", "nymag.com\/urr\/urr.pl\\?rm=view_review&urr_review_id=", "nymag.com\/urr\/urr.pl\\?rm=rm_request_form", "nymag.com\/urr\/urr.pl\\?rm=new_review_form", "nymag.com\/urr\/urr.pl\\?rm=all_reviews.*&listing_id=", "nymag.com\/urr\/fhl.pl\\?rm=listings_page&list=", "nymag.com\/urr\/fhl.pl", "nymag.com\/urr.*nyml_venue_restaurant", "nymag.com\/urr.*nyml_venue_business_shopping", "nymag.com\/urr.*nyml_venue_beauty_fitness", "nymag.com\/urr.*nyml_venue_bar", "nymag.com\/urr.*nyml_event_theater", "nymag.com\/urr.*nyml_event_sports", "nymag.com\/urr.*nyml_event_reading", "nymag.com\/urr.*nyml_event_nightlife", "nymag.com\/urr.*nyml_event_kids", "nymag.com\/urr.*nyml_event_foodwine", "nymag.com\/urr.*nyml_event_community", "nymag.com\/urr.*nyml_event_classical", "nymag.com\/urr.*nyml_event_art", "nymag.com\/urban\/guides\/nyonthecheap\/", "nymag.com\/urban\/guides\/family", "nymag.com\/urban\/guides\/bestofny\/neighborhoods\/index.htm", "nymag.com\/urban\/guides\/bestofny\/az", "nymag.com\/urban\/guides\/bestofny", "nymag.com\/urban\/articles\/schools01\/school9.htm", "nymag.com\/urban\/articles\/schools01\/school10.htm", "nymag.com\/urban\/articles\/schools01\/school1.htm", "nymag.com\/urban\/articles\/charityguide\/", "nymag.com\/urban\/articles\/02\/spas\/bestspas2.htm", "nymag.com\/urban\/articles\/02\/spas\/bestspas.htm", "nymag.com\/urban\/articles\/02\/holidays\/recipes\/cookies.htm", "nymag.com\/urban\/articles\/02\/holidays\/recipes\/classics.htm", "nymag.com\/urban\/", "nymag.com\/travel\/weekends", "nymag.com\/travel\/index.html", "nymag.com\/travel\/(|\\?.*)$", "nymag.com\/travel", "nymag.com\/taste\/", "nymag.com\/sitemap\/", "nymag.com\/shopping\/thefind\/", "nymag.com\/shopping\/shopamatic", "nymag.com\/shopping\/openings", "nymag.com\/shopping\/index.htm", "nymag.com\/shopping\/guides\/weddings\/", "nymag.com\/shopping\/fashion", "nymag.com\/shopping\/bestbets", "nymag.com\/shopping\/askaclerk", "nymag.com\/shopping\/articles\/sb\/", "nymag.com\/shopping\/articles\/bestbets\/", "nymag.com\/shopping\/(|\\?.*)$", "nymag.com\/shopping", "nymag.com\/shopamatic\/products\/wshoesf07\/", "nymag.com\/shopamatic\/products\/wouterwearf07\/", "nymag.com\/shopamatic\/products\/womensbandsf07\/", "nymag.com\/shopamatic\/products\/wbootsf07\/", "nymag.com\/shopamatic\/products\/sofas\/", "nymag.com\/shopamatic\/products\/rugs\/", "nymag.com\/shopamatic\/products\/pillows\/", "nymag.com\/shopamatic\/products\/mshoesf07\/", "nymag.com\/shopamatic\/products\/mirrors\/", "nymag.com\/shopamatic\/products\/mensbandsf07\/", "nymag.com\/shopamatic\/products\/mbootsf07\/", "nymag.com\/shopamatic\/products\/lamps\/", "nymag.com\/shopamatic\/products\/engagementringsf07\/", "nymag.com\/shopamatic\/products\/diningtables\/", "nymag.com\/shopamatic\/products\/coffeetables\/", "nymag.com\/shopamatic\/products\/chairs\/", "nymag.com\/shopamatic\/products\/bridesmaiddressesf07\/", "nymag.com\/shopamatic\/products\/bridaldressesf07\/", "nymag.com\/shopamatic\/products\/bookshelves\/", "nymag.com\/shopamatic\/products\/beds\/", "nymag.com\/shopamatic\/products\/", "nymag.com\/search\/sitewide-search.cgi", "nymag.com\/search\/search.cgi\\?.*t=shopamatic", "nymag.com\/search\/fashion-slideshow.cgi", "nymag.com\/search\/assets\/includes\/slideshow_nielsen.html", "nymag.com\/search\/assets\/includes\/slideshow_models.html", "nymag.com\/rnc\/", "nymag.com\/restaurants\/wheretoeat\/", "nymag.com\/restaurants\/reviews\/", "nymag.com\/restaurants\/recipes\/index.html", "nymag.com\/restaurants\/recipes\/(|\\?.*)$", "nymag.com\/restaurants\/recipes", "nymag.com\/restaurants\/index.htm", "nymag.com\/restaurants\/cheapeats\/", "nymag.com\/restaurants\/articles\/recipes\/", "nymag.com\/restaurants\/articles\/diningin\/", "nymag.com\/restaurants\/articles\/cheap_eats\/", "nymag.com\/restaurants\/articles\/05\/wheretoeat\/", "nymag.com\/restaurants\/articles\/04\/wheretoeat\/", "nymag.com\/restaurants\/articles\/03\/wheretoeat\/", "nymag.com\/restaurants\/(|\\?.*)$", "nymag.com\/restaurants", "nymag.com\/relationships\/", "nymag.com\/realestate\/realestatecolumn", "nymag.com\/realestate\/map", "nymag.com\/realestate\/listings\/.*photos", "nymag.com\/realestate\/listings\/", "nymag.com\/realestate\/index.html", "nymag.com\/realestate\/articles\/neighborhoods", "nymag.com\/realestate\/app", "nymag.com\/realestate\/(|\\?.*)$", "nymag.com\/realestate", "nymag.com\/promo\/directory\/", "nymag.com\/personals\/articles\/", "nymag.com\/partners\/feedroom\/nymag-nav_restaurants.html", "nymag.com\/partners\/feedroom\/nymag-nav_realestate.html", "nymag.com\/partners\/feedroom\/nymag-nav_fashion.html", "nymag.com\/partners\/feedroom\/nymag-nav_default.html", "nymag.com\/partners\/feedroom\/nymag-nav_arts-events.html", "nymag.com\/nyxny", "nymag.com\/nymetro\/urban\/strategist\/everything\/", "nymag.com\/nymetro\/urban\/family", "nymag.com\/nymetro\/urban\/", "nymag.com\/nymetro\/travel", "nymag.com\/nymetro\/shopping\/fashion\/", "nymag.com\/nymetro\/shopping\/columns\/bestbets\/", "nymag.com\/nymetro\/realestate\/neighborhoods\/maps\/", "nymag.com\/nymetro\/realestate\/columns\/realestate\/", "nymag.com\/nymetro\/realestate", "nymag.com\/nymetro\/nightlife\/barbuzz\/", "nymag.com\/nymetro\/nightlife\/", "nymag.com\/nymetro\/news\/politics\/columns\/citypolitic\/", "nymag.com\/nymetro\/news\/people\/columns\/intelligencer\/", "nymag.com\/nymetro\/news\/columns\/powergrid\/", "nymag.com\/nymetro\/news\/columns\/imperialcity\/", "nymag.com\/nymetro\/news\/bizfinance\/columns\/bottomline\/", "nymag.com\/nymetro\/news", "nymag.com\/nymetro\/movies\/", "nymag.com\/nymetro\/health\/bestdoctors\/", "nymag.com\/nymetro\/health", "nymag.com\/nymetro\/food\/reviews\/", "nymag.com\/nymetro\/food\/openings\/", "nymag.com\/nymetro\/food\/inseason\/", "nymag.com\/nymetro\/food\/homeent\/", "nymag.com\/nymetro\/food\/guides\/wheretoeat2005\/", "nymag.com\/nymetro\/food\/guides\/wheretoeat2004\/", "nymag.com\/nymetro\/food\/guides\/wheretoeat2003\/", "nymag.com\/nymetro\/food\/guides\/cheapeats2004\/", "nymag.com\/nymetro\/food\/guides\/cheapeats2003\/", "nymag.com\/nymetro\/food\/", "nymag.com\/nymetro\/bony\/shopping", "nymag.com\/nymetro\/bony\/services", "nymag.com\/nymetro\/bony\/nightlife", "nymag.com\/nymetro\/bony\/fun", "nymag.com\/nymetro\/bony\/food\/", "nymag.com\/nymetro\/bony\/beauty", "nymag.com\/nymetro\/bony", "nymag.com\/nymetro\/arts\/tv\/", "nymag.com\/nymetro\/arts\/theater", "nymag.com\/nymetro\/arts\/music\/pop\/", "nymag.com\/nymetro\/arts\/music\/newyorksound\/", "nymag.com\/nymetro\/arts\/music\/features\/", "nymag.com\/nymetro\/arts\/music\/classical\/", "nymag.com\/nymetro\/arts\/music\/", "nymag.com\/nymetro\/arts\/dance\/", "nymag.com\/nymetro\/arts\/comics\/", "nymag.com\/nymetro\/arts\/books", "nymag.com\/nymetro\/arts\/art", "nymag.com\/nymetro\/arts\/architecture", "nymag.com\/nymetro\/arts", "nymag.com\/nymag\/toc\/", "nymag.com\/nymag\/advertorial\/", "nymag.com\/nymag", "nymag.com\/nightlife\/partylines", "nymag.com\/nightlife\/index.htm", "nymag.com\/nightlife\/barbuzz\/", "nymag.com\/nightlife\/(|\\?.*)$", "nymag.com\/nightlife", "nymag.com\/newyork\/mediakit ", "nymag.com\/newyork\/", "nymag.com\/newsletters\/index.htm", "nymag.com\/newsletters\/", "nymag.com\/news\/politics\/powergrid\/", "nymag.com\/news\/politics\/citypolitic\/", "nymag.com\/news\/intelligencer\/", "nymag.com\/news\/index.html", "nymag.com\/news\/imperialcity\/", "nymag.com\/news\/businessfinance\/bottomline\/", "nymag.com\/news\/(|\\?.*)$", "nymag.com\/news", "nymag.com\/movies", "nymag.com\/metrotv\/", "nymag.com\/marketplace\/", "nymag.com\/listings\/theater\/.*\/photo_gallery", "nymag.com\/listings\/theater\/", "nymag.com\/listings\/stores\/.*\/photo_gallery", "nymag.com\/listings\/stores", "nymag.com\/listings\/sports\/.*\/photo_gallery", "nymag.com\/listings\/sports", "nymag.com\/listings\/restaurant\/.*\/photo_gallery", "nymag.com\/listings\/restaurant.*\/menus", "nymag.com\/listings\/restaurant", "nymag.com\/listings\/recipe\/.*\/photo_gallery", "nymag.com\/listings\/recipe\/", "nymag.com\/listings\/readings", "nymag.com\/listings\/reading\/.*\/photo_gallery", "nymag.com\/listings\/reading\/", "nymag.com\/listings\/nightlife\/.*\/photo_gallery", "nymag.com\/listings\/nightlife", "nymag.com\/listings\/movietheater\/.*\/photo_gallery", "nymag.com\/listings\/movietheater", "nymag.com\/listings\/movie\/.*\/photo_gallery", "nymag.com\/listings\/movie", "nymag.com\/listings\/kids\/.*\/photo_gallery", "nymag.com\/listings\/kids", "nymag.com\/listings\/hotel\/.*\/photo_gallery", "nymag.com\/listings\/hotel", "nymag.com\/listings\/foodwine\/.*\/photo_gallery", "nymag.com\/listings\/foodwine", "nymag.com\/listings\/community\/.*\/photo_gallery", "nymag.com\/listings\/community", "nymag.com\/listings\/classical\/.*\/photo_gallery", "nymag.com\/listings\/classical", "nymag.com\/listings\/beauty\/.*\/photo_gallery", "nymag.com\/listings\/beauty", "nymag.com\/listings\/bar\/.*\/photo_gallery", "nymag.com\/listings\/bar", "nymag.com\/listings\/attraction\/.*\/photo_gallery", "nymag.com\/listings\/attraction", "nymag.com\/listings\/art\/.*\/photo_gallery", "nymag.com\/listings\/art\/", "nymag.com\/lifestyle", "nymag.com\/index.htm", "nymag.com\/includes\/tableofcontents.htm", "nymag.com\/includes\/2\/ads\/iframes\/shopamatic_slideshow.html", "nymag.com\/homedesign\/index.html", "nymag.com\/homedesign\/greatrooms\/", "nymag.com\/homedesign\/(|\\?.*)$", "nymag.com\/homedesign", "nymag.com\/health\/bestdoctors\/", "nymag.com\/health\/", "nymag.com\/guides\/valentines\/", "nymag.com\/guides\/usopen\/", "nymag.com\/guides\/summer\/", "nymag.com\/guides\/stpatricksday\/", "nymag.com\/guides\/holidays\/gifts", "nymag.com\/guides\/holidays", "nymag.com\/guides\/halloween\/", "nymag.com\/guides\/gaypride\/", "nymag.com\/guides\/fallpreview", "nymag.com\/guides\/everything\/", "nymag.com\/guides\/cheap\/", "nymag.com\/guides", "nymag.com\/fashion\/models\/index.html", "nymag.com\/fashion\/models\/(|\\?.*)$", "nymag.com\/fashion\/models", "nymag.com\/fashion\/lookbook\/", "nymag.com\/fashion\/index.html", "nymag.com\/fashion\/fashionshows\/seasons\/", "nymag.com\/fashion\/fashionshows\/search\/", "nymag.com\/fashion\/fashionshows\/myfashion\/index.html", "nymag.com\/fashion\/fashionshows\/myfashion\/(|\\?.*)$", "nymag.com\/fashion\/fashionshows\/men\/index.html", "nymag.com\/fashion\/fashionshows\/men\/(|\\?.*)$", "nymag.com\/fashion\/fashionshows\/index.html", "nymag.com\/fashion\/fashionshows\/designers\/", "nymag.com\/fashion\/fashionshows\/couture\/index.html", "nymag.com\/fashion\/fashionshows\/couture\/(|\\?.*)$", "nymag.com\/fashion\/fashionshows\/(|\\?.*)$", "nymag.com\/fashion\/fashionshows.*\/womenrunway", "nymag.com\/fashion\/fashionshows.*\/schedule", "nymag.com\/fashion\/fashionshows.*\/runway", "nymag.com\/fashion\/fashionshows.*\/resort", "nymag.com\/fashion\/fashionshows.*\/partyflash", "nymag.com\/fashion\/fashionshows.*\/menrunway", "nymag.com\/fashion\/fashionshows.*\/details", "nymag.com\/fashion\/fashionshows.*\/couturerunway", "nymag.com\/fashion\/fashionshows.*\/bridalrunway", "nymag.com\/fashion\/fashionshows.*\/backstage", "nymag.com\/fashion\/fashionshows", "nymag.com\/fashion\/fashioncalendar\/", "nymag.com\/fashion\/(|\\?.*)$", "nymag.com\/fashion", "nymag.com\/family\/kids\/index.html", "nymag.com\/family\/kids\/(|\\?.*)$", "nymag.com\/family\/", "nymag.com\/error.htm", "nymag.com\/daily\/politics", "nymag.com\/daily\/movies\/", "nymag.com\/daily\/intel", "nymag.com\/daily\/food", "nymag.com\/daily\/fashion\/", "nymag.com\/daily\/entertainment", "nymag.com\/content\/02\/wk27\/review.htm", "nymag.com\/content\/02\/wk22\/review.htm", "nymag.com\/contactus\/", "nymag.com\/cheap", "nymag.com\/bestofny\/shopping\/", "nymag.com\/bestofny\/services", "nymag.com\/bestofny\/nightlife\/", "nymag.com\/bestofny\/neighborhoods", "nymag.com\/bestofny\/kids\/", "nymag.com\/bestofny\/index.html", "nymag.com\/bestofny\/food\/", "nymag.com\/bestofny\/beauty", "nymag.com\/bestofny\/atoz", "nymag.com\/bestofny\/(|\\?.*)$", "nymag.com\/bestofny", "nymag.com\/bestlawyers", "nymag.com\/bestdoctors\/", "nymag.com\/bestbets\/", "nymag.com\/beauty\/index.html", "nymag.com\/beauty\/(|\\?.*)$", "nymag.com\/beauty", "nymag.com\/arts\/tv\/index.html", "nymag.com\/arts\/tv\/(|\\?.*)$", "nymag.com\/arts\/tv", "nymag.com\/arts\/theater\/index.html", "nymag.com\/arts\/theater\/(|\\?.*)$", "nymag.com\/arts\/theater", "nymag.com\/arts\/popmusic\/", "nymag.com\/arts\/music\/index.html", "nymag.com\/arts\/music\/(|\\?.*)$", "nymag.com\/arts\/music", "nymag.com\/arts\/index.html", "nymag.com\/arts\/comics\/", "nymag.com\/arts\/classicaldance\/index.html", "nymag.com\/arts\/classicaldance\/(|\\?.*)$", "nymag.com\/arts\/classicaldance", "nymag.com\/arts\/books\/index.html", "nymag.com\/arts\/books\/(|\\?.*)$", "nymag.com\/arts\/books", "nymag.com\/arts\/arts\/art\/", "nymag.com\/arts\/arts\/architecture", "nymag.com\/arts\/art\/index.html", "nymag.com\/arts\/art\/(|\\?.*)$", "nymag.com\/arts\/art", "nymag.com\/arts\/architecture\/", "nymag.com\/arts\/all\/approvalmatrix\/", "nymag.com\/arts", "nymag.com\/approvalmatrix", "nymag.com\/alist\/invitations\/", "nymag.com\/agenda\/(|\\?.*)$", "nymag.com\/agenda", "nymag.com\/.*view_top_reviewers", "nymag.com\/.*search_type=shopamatic", "nymag.com\/.*search_type=restaurant", "nymag.com\/.*search_type=movie_theater", "nymag.com\/.*search_type=movie", "nymag.com\/.*search_type=hotel", "nymag.com\/.*search_type=food_events", "nymag.com\/.*search_type=event", "nymag.com\/.*search_type=business_shopping", "nymag.com\/.*search_type=beauty_fitness", "nymag.com\/.*search_type=bar", "nymag.com\/.*search_type=attraction", "nymag.com\/.*personals.newyorkmetro.com\/", "nymag.com\/.*nyml_venue_attraction", "nymag.com\/.*nyml_movie", "nymag.com\/.*autonomy_fieldvalue=theater", "nymag.com\/.*autonomy_fieldvalue=sports", "nymag.com\/.*autonomy_fieldvalue=readings", "nymag.com\/.*autonomy_fieldvalue=other", "nymag.com\/.*autonomy_fieldvalue=nightlife", "nymag.com\/.*autonomy_fieldvalue=kids", "nymag.com\/.*autonomy_fieldvalue=classical and dance", "nymag.com\/.*autonomy_fieldvalue=art", "my.nymag.com\/.*\/myfashion", "my.nymag.com\/.*\/comments\/", "map_view", "listing_beauty_photo_galleries", "https:\/\/secure.palmcoastd.com", "https:\/\/secure.nymag.com\/registration\/", "https:\/\/secure.nymag.com\/accountcenter", "http:\/\/www.castleconnolly.com\/doctors\/results.cfm\\?", "http:\/\/www.bestlawyers.com\/nymetro\/", "http:\/\/video.nymag.com\/", "http:\/\/personals.nymag.com", "fashion-search.cgi", "comment_reader", "comment_general", "\/urr.*nyml_venue_hotel", "\/nymetro\/shopping", "\/nymag.com\/(|\\?.*)$",".*howaboutwe\.com.*");
exclude_array = new Array();
exclude_array[349] = "nymag.com/*nyml_subtype";
exclude_array[378] = "comment_reader";
exclude_array[15] = "nymag.com/urr.*nyml_venue_beauty_fitness";
exclude_array[109] = "nymag.com/realestate";
exclude_array[221] = "nymag.com/listings/beauty/.*/photo_gallery";
exclude_array[222] = "nymag.com/listings/beauty";
exclude_array[368] = "listing_beauty_photo_galleries";
info_array = new Array(); info_array[0] = new Array("Internal", "QA", "", "", "QA", "", ""); info_array[1] = new Array("Wedding Guide", "Wedding Listings", "", "", "Wedding Listings", "Listings", ""); info_array[2] = new Array("Wedding Guide", "", "", "", "Wedding Guide", "", ""); info_array[3] = new Array("Services", "", "", "", "Weather", "", ""); info_array[4] = new Array("Travel Channel", "Visitors Guide ", "Visitors Guide Splash", "", "Visitors Guide Splash", "Splash", ""); info_array[5] = new Array("Travel Channel", "Visitors Guide ", "Visitors Guide Splash", "", "Visitors Guide Splash", "Splash", ""); info_array[6] = new Array("Travel Channel", "Visitors Guide ", "", "", "Visitors Guide Section", "", ""); info_array[7] = new Array("Service", "Reader Reviews", "", "", "Individual Reader Reviews", "Listings", ""); info_array[8] = new Array("Service", "Reader Reviews", "Remove Review", "", "Remove a Reader Review", "Listings", ""); info_array[9] = new Array("Service", "Reader Reviews", "New Review", "", "New Reader Review", "Listings", ""); info_array[10] = new Array("Service", "Reader Reviews", "", "", "Reader Reviews by Listings", "Listings", ""); info_array[11] = new Array("Fashion Channel", "Fashion Shows", "Runway Ratings", "", "Runway Ratings Search Results", "", ""); info_array[12] = new Array("Fashion Channel", "Fashion Shows", "Runway Ratings", "", "Runway Ratings", "", ""); info_array[13] = new Array("Food Channel", "Restaurant Listings", "Restaurant Reader Reviews", "", "Restaurant Reader Reviews", "Listings", "Reader Reviews"); info_array[14] = new Array("Shopping Channel", "Store Listings", "Store Reader Reviews", "", "Store Reader Reviews", "Listings", "Reader Reviews"); info_array[15] = new Array("Beauty Channel", "Beauty Listings", "Beauty Reader Reviews", "", "Beauty Reader Reviews", "Listings", "Reader Reviews"); info_array[16] = new Array("Nightlife Channel", "Bar Listings", "Bar Reader Reviews", "", "Bar Reader Reviews", "Listings", ""); info_array[17] = new Array("Entertainment Channel", "Theater ", "Theater Events", "Theater Reader Reviews", "Theater  Detail Pages", "Listings", ""); info_array[18] = new Array("Entertainment Channel", "Other Events", "Sports Listings", "Sports  Reader Reviews", "Sports  Reader Reviews", "Listings", ""); info_array[19] = new Array("Entertainment Channel", "Books", "Reading Events", "Reading Reader Reviews", "Reading Reader Reviews", "Listings", ""); info_array[20] = new Array("Entertainment Channel", "Music", "Music/Nightlife Events", "Music  Reader Reviews", "Music  Reader Reviews", "Listings", ""); info_array[21] = new Array("Family & Kids Channel", "Events", "Kids Event Reader Reviews", "", "Kids Event Reader Reviews", "Listings", ""); info_array[22] = new Array("Entertainment Channel", "Other Events", "Food & Wine Listings", "Food & Wine Reader Reviews", "Food & Wine Reader Reviews", "Listings", ""); info_array[23] = new Array("Entertainment Channel", "Other Events", "Community Listings", "Community  Reader Reviews", "Community  Reader Reviews", "Listings", ""); info_array[24] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Events", "Classical Reader Reviews", "Classical Reader Reviews", "Listings", ""); info_array[25] = new Array("Entertainment Channel", "Art", "Art Events", "Art Reader Reviews", "Art Reader Reviews", "Listings", ""); info_array[26] = new Array("Guides Channel", "Cheap Guide", "", "", "Cheap Guide", "", ""); info_array[27] = new Array("Family & Kids Channel", "", "", "", "Family Features", "", ""); info_array[28] = new Array("Best of New York", "BoNY Neighborhoods", "", "", "Best of New York Neighborhoods", "", ""); info_array[29] = new Array("Best of New York", "BoNY A-Z", "", "", "Best of New York A-Z", "", ""); info_array[30] = new Array("Best of New York", "", "", "", "Best of New York Channel", "", ""); info_array[31] = new Array("Family & Kids Channel", "", "", "", "Family Features", "", ""); info_array[32] = new Array("Family & Kids Channel", "", "", "", "Family Features", "", ""); info_array[33] = new Array("Family & Kids Channel", "", "", "", "Family Features", "", ""); info_array[34] = new Array("Guides", "Charity Guide", "", "", "Charity Guide", "", ""); info_array[35] = new Array("Guides", "Charity Guide", "", "", "Charity Guide", "", ""); info_array[36] = new Array("Guides", "Spas", "", "", "Spa Guide", "", ""); info_array[37] = new Array("Guides", "Spas", "", "", "Spa Guide", "", ""); info_array[38] = new Array("Guides", "Holidays", "", "", "Holiday Guide", "", ""); info_array[39] = new Array("Guides", "Holidays", "", "", "Holiday Guide", "", ""); info_array[40] = new Array("Travel Channel", "Weekend Travel", "", "", "Weekend Travel", "", ""); info_array[41] = new Array("Travel Channel", "Travel Splash", "", "", "Travel Splash", "Splash", ""); info_array[42] = new Array("Travel Channel", "Travel Splash", "", "", "Travel Splash", "Splash", ""); info_array[43] = new Array("Travel Channel", "", "", "", "Travel Channel", "", ""); info_array[44] = new Array("Service", "Event Promos", "Taste of NY", "", "Taste of NY Event Promo", "", ""); info_array[45] = new Array("Service", "About New York Section", "", "", "Site Map", "", ""); info_array[46] = new Array("Shopping Channel", "The Find", "", "", "The Find", "", ""); info_array[47] = new Array("Shopping Channel", "Shop A Matic", "", "", "Shop A Matic", "", ""); info_array[48] = new Array("Shopping Channel", "Store Openings", "", "", "Store Openings Column", "", ""); info_array[49] = new Array("Shopping Channel", "Shopping Splash", "", "", "Shopping Splash Page", "Splash", ""); info_array[50] = new Array("Wedding Guide", "", "", "", "Wedding Guide", "", ""); info_array[51] = new Array("Fashion Channel", "", "", "", "Fashion Features", "", ""); info_array[52] = new Array("Shopping Channel", "Best Bets", "", "", "Best Bets", "", ""); info_array[53] = new Array("Shopping Channel", "Ask a Clerk", "", "", "Ask a Clerk", "", ""); info_array[54] = new Array("Shopping Channel", "Sales & Bargains", "", "", "Sales & Bargains", "", ""); info_array[55] = new Array("Shopping Channel", "Best Bets", "", "", "Best Bets", "", ""); info_array[56] = new Array("Shopping Channel", "Shopping Splash", "", "", "Shopping Splash Page", "Splash", ""); info_array[57] = new Array("Shopping Channel", "", "", "", "Shopping Channel", "", ""); info_array[58] = new Array("Shopping Channel", "Shop A Matic", "Womens Shoes Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[59] = new Array("Shopping Channel", "Shop A Matic", "Womens Outerwear Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[60] = new Array("Shopping Channel", "Shop A Matic", "Womens Wedding Bands Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[61] = new Array("Shopping Channel", "Shop A Matic", "Womens Boots Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[62] = new Array("Shopping Channel", "Shop A Matic", "Sofas", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[63] = new Array("Shopping Channel", "Shop A Matic", "Rugs", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[64] = new Array("Shopping Channel", "Shop A Matic", "Pillows", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[65] = new Array("Shopping Channel", "Shop A Matic", "Mens Shoes Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[66] = new Array("Shopping Channel", "Shop A Matic", "Mirrors", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[67] = new Array("Shopping Channel", "Shop A Matic", "Mens Wedding Bands Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[68] = new Array("Shopping Channel", "Shop A Matic", "Mens Boots Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[69] = new Array("Shopping Channel", "Shop A Matic", "Lamps", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[70] = new Array("Shopping Channel", "Shop A Matic", "Engagement Rings Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[71] = new Array("Shopping Channel", "Shop A Matic", "Dining Tables", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[72] = new Array("Shopping Channel", "Shop A Matic", "Coffee Tables", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[73] = new Array("Shopping Channel", "Shop A Matic", "Chairs", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[74] = new Array("Shopping Channel", "Shop A Matic", "Brides Maid Dresses Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[75] = new Array("Shopping Channel", "Shop A Matic", "Bridal Dresses Fall 2007", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[76] = new Array("Shopping Channel", "Shop A Matic", "Bookshelves", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[77] = new Array("Shopping Channel", "Shop A Matic", "Beds", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[78] = new Array("Shopping Channel", "Shop A Matic", "", "", "Shop A Matic Feature Intro", "Slideshow", ""); info_array[79] = new Array("", "", "", "", "Sitewide Search Results", "", ""); info_array[80] = new Array("Shopping Channel", "Shop A Matic", "", "", "Shop A Matic Search Results", "Slideshow", ""); info_array[81] = new Array("Fashion Channel", "Fashion Shows", "Fashion Galleries", "", "Fashion Galleries", "Slideshow", ""); info_array[82] = new Array("Fashion Channel", "Fashion Shows", "Runway Search & Archives", "", "Runway Show Search Galleries", "Slideshow", ""); info_array[83] = new Array("Fashion Channel", "Model Guide", "", "", "Model Off the Runway Slideshow", "", ""); info_array[84] = new Array("News & Features", "", "", "", "RNC Coverage", "", ""); info_array[85] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[86] = new Array("Food Channel", "Restaurant Reviews", "", "", "Restaurant Reviews", "", ""); info_array[87] = new Array("Food Channel", "Recipes", "Recipes Splash", "", "Recipes Splash", "Splash", ""); info_array[88] = new Array("Food Channel", "Recipes", "Recipes Splash", "", "Recipes Splash", "Splash", ""); info_array[89] = new Array("Food Channel", "Recipes", "", "", "Recipes Section", "", ""); info_array[90] = new Array("Food Channel", "Restaurants Splash", "", "", "Restaurants Splash", "Splash", ""); info_array[91] = new Array("Food Channel", "Cheap Eats", "", "", "Food Channel", "", ""); info_array[92] = new Array("Food Channel", "Recipes", "", "", "Recipes", "", ""); info_array[93] = new Array("Food Channel", "Recipes", "", "", "Recipes", "", ""); info_array[94] = new Array("Food Channel", "Cheap Eats", "", "", "Food Channel", "", ""); info_array[95] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[96] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[97] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[98] = new Array("Food Channel", "Restaurants Splash", "", "", "Restaurants Splash", "Splash", ""); info_array[99] = new Array("Food Channel", "", "", "", "Food Channel", "", ""); info_array[100] = new Array("Sex & Relationships", "", "", "", "Sex & Relationships Features", "", ""); info_array[101] = new Array("Real Estate Channel", "Real Estate Features", "Real Estate Column", "", "Real Estate Column", "", ""); info_array[102] = new Array("Real Estate Channel", "Real Estate Features", "Map Feature", "", "Map Feature", "", ""); info_array[103] = new Array("Real Estate Channel", "Real Estate Listings", "Real Estate Photo Galleries", "", "Real Estate Photo Galleries", "Listings", "Slideshow"); info_array[104] = new Array("Real Estate Channel", "Real Estate Listings", "Real Estate Propery Details", "", "Real Estate Propery Details", "Listings", ""); info_array[105] = new Array("Real Estate Channel", "", "", "", "Real Estate Splash", "Splash", ""); info_array[106] = new Array("Real Estate Channel", "Real Estate Features", "Neighborhood Guides", "", "Neighborhood Guides", "", ""); info_array[107] = new Array("Real Estate Channel", "Real Estate Listings", "Real Estate Listings Application", "", "Real Estate Listings Application", "Listings", ""); info_array[108] = new Array("Real Estate Channel", "", "", "", "Real Estate Splash", "Splash", ""); info_array[109] = new Array("Real Estate Channel", "", "", "", "Real Esate Channel", "", ""); info_array[110] = new Array("Service", "Advertorials", "", "", "Sponsor Directory", "", ""); info_array[111] = new Array("Sex & Relationships", "", "", "", "Sex & Relationships Features", "", ""); info_array[112] = new Array("Video", "", "", "", "Video Restaurants", "", ""); info_array[113] = new Array("Video", "", "", "", "Video Real Estate", "", ""); info_array[114] = new Array("Video", "", "", "", "Video Fashion", "", ""); info_array[115] = new Array("Video", "", "", "", "Video Default", "", ""); info_array[116] = new Array("Video", "", "", "", "Video Entertainment", "", ""); info_array[117] = new Array("Service", "Event Promos", "NYxNY", "", "NYxNY Promo", "", ""); info_array[118] = new Array("Guides Channel", "Everything Guides", "", "", "Everything Guides", "", ""); info_array[119] = new Array("Family & Kids Channel", "", "", "", "Family Features", "", ""); info_array[120] = new Array("Guides Channel", "", "", "", "Guides Features", "", ""); info_array[121] = new Array("Travel Channel", "Travel Features", "", "", "Travel Features", "", ""); info_array[122] = new Array("Fashion Channel", "", "", "", "Fashion Features", "", ""); info_array[123] = new Array("Shopping Channel", "Best Bets", "", "", "Best Bets", "", ""); info_array[124] = new Array("Real Estate Channel", "Real Estate Features", "Map Feature", "", "Map Feature", "", ""); info_array[125] = new Array("Real Estate Channel", "Real Estate Features", "Real Estate Column", "", "Real Estate Column", "", ""); info_array[126] = new Array("Real Estate Channel", "Real Estate Features", "", "", "Real Estate Features", "", ""); info_array[127] = new Array("Nightlife Channel", "Bar Buzz", "", "", "Bar Buzz", "", ""); info_array[128] = new Array("Nightlife Channel", "", "", "", "Nightlife Features", "", ""); info_array[129] = new Array("News & Features Channel", "City Politic", "", "", "City Politic", "", ""); info_array[130] = new Array("News & Features Channel", "Intelligencer", "", "", "Intelligencer", "", ""); info_array[131] = new Array("News & Features Channel", "Power Grid", "", "", "Power Grid", "", ""); info_array[132] = new Array("News & Features Channel", "Imperial City", "", "", "Imperial City", "", ""); info_array[133] = new Array("News & Features Channel", "Bottom Line", "", "", "Bottom Line", "", ""); info_array[134] = new Array("News & Features Channel", "", "", "", "News & Features Channel", "", ""); info_array[135] = new Array("Entertainment Channel", "Movies", "", "", "Movies Features", "", ""); info_array[136] = new Array("Health Channel", "Best Doctors", "Best Doctors Features", "", "Best Doctors Features", "", ""); info_array[137] = new Array("Health Channel", "", "", "", "Health Channel", "", ""); info_array[138] = new Array("Food Channel", "Restaurant Reviews", "", "", "Restaurant Reviews", "", ""); info_array[139] = new Array("Food Channel", "Restaurant Openings", "", "", "Restaurant Openings", "", ""); info_array[140] = new Array("Food Channel", "Recipes", "In Season", "", "In Season", "", ""); info_array[141] = new Array("Food Channel", "Recipes", "", "", "Home Entertainment Features", "", ""); info_array[142] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[143] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[144] = new Array("Food Channel", "Where to Eat", "", "", "Where to Eat", "", ""); info_array[145] = new Array("Food Channel", "Cheap Eats", "", "", "Food Channel", "", ""); info_array[146] = new Array("Food Channel", "Cheap Eats", "", "", "Food Channel", "", ""); info_array[147] = new Array("Food Channel", "", "", "", "Food Features", "", ""); info_array[148] = new Array("Best of New York", "BoNY Shopping", "", "", "Best of New York Shopping", "", ""); info_array[149] = new Array("Best of New York", "BoNY Services", "", "", "Best of New York Services", "", ""); info_array[150] = new Array("Best of New York", "BoNY Nightlife", "", "", "Best of New York Nightlife", "", ""); info_array[151] = new Array("Best of New York", "BoNY Kids/Fun", "", "", "Best of New York Kids/Fun", "", ""); info_array[152] = new Array("Best of New York", "BoNY Food", "", "", "Best of New York Food", "", ""); info_array[153] = new Array("Best of New York", "BoNY Beauty", "", "", "Best of New York Beauty", "", ""); info_array[154] = new Array("Best of New York", "", "", "", "Best of New York Channel", "", ""); info_array[155] = new Array("Entertainment Channel", "TV", "", "", "TV Features", "", ""); info_array[156] = new Array("Entertainment Channel", "Theater ", "", "", "Theater Section", "", ""); info_array[157] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[158] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[159] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[160] = new Array("Entertainment Channel", "Classical & Dance", "", "", "Classical & Dance Section", "", ""); info_array[161] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[162] = new Array("Entertainment Channel", "Classical & Dance", "", "", "Classical & Dance Section", "", ""); info_array[163] = new Array("Entertainment Channel", "Books", "", "", "Books Section", "", ""); info_array[164] = new Array("Entertainment Channel", "Books", "", "", "Books Section", "", ""); info_array[165] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[166] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[167] = new Array("Entertainment Channel", "", "", "", "Entertainment Features", "", ""); info_array[168] = new Array("Service", "Magazine Archives", "Table of Contents", "", "Table of Contents", "", ""); info_array[169] = new Array("Service", "Advertorials", "", "", "Advertorials", "", ""); info_array[170] = new Array("Service", "Magazine Archives", "", "", "Magazine Archives", "", ""); info_array[171] = new Array("Entertainment Channel", "Party Lines", "", "", "Party Lines", "Slideshow", ""); info_array[172] = new Array("Nightlife Channel", "Nightlife Splash", "", "", "Nightlife Splash", "Splash", ""); info_array[173] = new Array("Nightlife Channel", "Bar Buzz", "", "", "Bar Buzz", "", ""); info_array[174] = new Array("Nightlife Channel", "Nightlife Splash", "", "", "Nightlife Splash", "Splash", ""); info_array[175] = new Array("Nightlife Channel", "", "", "", "Nightlife Channel", "", ""); info_array[176] = new Array("Service", "About New York Section", "Media Kit", "", "Media Kit", "", ""); info_array[177] = new Array("Service", "About New York Section", "", "", "About New York Section", "", ""); info_array[178] = new Array("Service", "Newsletters", "", "", "Newsletter Splash", "", ""); info_array[179] = new Array("Service", "Newsletters", "", "", "Newsletters", "", ""); info_array[180] = new Array("News & Features Channel", "Power Grid", "", "", "Power Grid", "", ""); info_array[181] = new Array("News & Features Channel", "City Politic", "", "", "City Politic", "", ""); info_array[182] = new Array("News & Features Channel", "Intelligencer", "", "", "Intelligencer", "", ""); info_array[183] = new Array("News & Features Channel", "News Splash", "", "", "News Splash", "Splash", ""); info_array[184] = new Array("News & Features Channel", "Imperial City", "", "", "Imperial City", "", ""); info_array[185] = new Array("News & Features Channel", "Bottom Line", "", "", "Bottom Line", "", ""); info_array[186] = new Array("News & Features Channel", "News Splash", "", "", "News Splash", "Splash", ""); info_array[187] = new Array("News & Features Channel", "", "", "", "News & Features Channel", "", ""); info_array[188] = new Array("Entertainment Channel", "Movies", "", "", "Movies Section", "", ""); info_array[189] = new Array("Other", "MetroTV", "", "", "MetroTV Shows", "", ""); info_array[190] = new Array("Service", "Classifieds", "", "", "Marketplace Classifieds", "", ""); info_array[191] = new Array("Entertainment Channel", "Theater ", "Theater Events", "Theater Photo Galleries", "Theater Event Search Results", "Listings", "Slideshow"); info_array[192] = new Array("Entertainment Channel", "Theater ", "Theater Events", "Theater  Detail Pages", "Theater Event Search Results", "Listings", ""); info_array[193] = new Array("Shopping Channel", "Store Listings", "Store Photo Galleries", "", "Store Photo Galleries", "Listings", "Slideshow"); info_array[194] = new Array("Shopping Channel", "Store Listings", "Store Detail Pages", "", "Store Detail Pages", "Listings", "Detail Pages"); info_array[195] = new Array("Entertainment Channel", "Other Events", "Sports Listings", "Sports Photo Galleries", "Sports Detail Pages", "Listings", "Slideshow"); info_array[196] = new Array("Entertainment Channel", "Other Events", "Sports Listings", "Sports Detail Pages", "Sports Detail Pages", "Listings", ""); info_array[197] = new Array("Food Channel", "Restaurant Listings", "Restaurant Photo Galleries", "", "Restaurant Listing Photos", "Listings", "Slideshow"); info_array[198] = new Array("Food Channel", "Restaurant Listings", "Restaurant Menus", "", "Restaurant Menus", "Listings", ""); info_array[199] = new Array("Food Channel", "Restaurant Listings", "Restaurant Detail Pages & Schedules", "", "Restaurant Detail Pages", "Listings", "Detail Pages"); info_array[200] = new Array("Food Channel", "Recipes", "Recipes Photo Galleries", "", "Recipe Detail Pages", "Listings", "Slideshow"); info_array[201] = new Array("Food Channel", "Recipes", "Recipe Detail Pages", "", "Recipe Detail Pages", "Listings", ""); info_array[202] = new Array("Entertainment Channel", "Books", "Reading Events", "Reading Detail Pages", "Reading Detail Pages", "Listings", ""); info_array[203] = new Array("Entertainment Channel", "Books", "Reading Events", "Reading Photo Galleries", "Reading Detail Pages", "Listings", "Slideshow"); info_array[204] = new Array("Entertainment Channel", "Books", "Reading Events", "Reading Detail Pages", "Reading Detail Pages", "Listings", ""); info_array[205] = new Array("Entertainment Channel", "Music", "Music/Nightlife Events", "Nightlife Photo Galleries", "Music Detail Pages", "Listings", "Slideshow"); info_array[206] = new Array("Entertainment Channel", "Music", "Music/Nightlife Events", "Music Detail Pages", "Music Detail Pages", "Listings", ""); info_array[207] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Theater Photo Galleries", "Movie Theater Detail Pages", "Listings", "Slideshow"); info_array[208] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Theater Detail Pages", "Movie Theater Detail Pages", "Listings", ""); info_array[209] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Photo Galleries", "Movie Photo Galleries", "Listings", "Slideshow"); info_array[210] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Detail Pages", "Movie Detail Pages", "Listings", ""); info_array[211] = new Array("Family & Kids Channel", "Events", "Kids Event Detail Pages", "", "Kids Event Detail Pages", "Listings", "Slideshow"); info_array[212] = new Array("Family & Kids Channel", "Events", "Kids Event Detail Pages", "", "Kids Event Detail Pages", "Listings", ""); info_array[213] = new Array("Shopping Channel", "Store Listings", "Store Photo Galleries", "", "Store Photo Galleries", "Listings", "Slideshow"); info_array[214] = new Array("Travel Channel", "Visitors Guide ", "Hotel Listings", "Hotel Listings", "Hotel Listings", "Listings", ""); info_array[215] = new Array("Entertainment Channel", "Other Events", "Food & Wine Listings", "Food & Wine Photo Galleries", "Food & Wine Detail Pages", "Listings", "Slideshow"); info_array[216] = new Array("Entertainment Channel", "Other Events", "Food & Wine Listings", "Food & Wine Detail Pages", "Food & Wine Detail Pages", "Listings", ""); info_array[217] = new Array("Entertainment Channel", "Other Events", "Community Listings", "Community Photo Galleries", "Community Detail Pages", "Listings", "Slideshow"); info_array[218] = new Array("Entertainment Channel", "Other Events", "Community Listings", "Community Detail Pages", "Community Detail Pages", "Listings", ""); info_array[219] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Events", "Classical Photo Galleries", "Classical Detail Pages", "Listings", "Slideshow"); info_array[220] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Events", "Classical Detail Pages", "Classical Detail Pages", "Listings", ""); info_array[221] = new Array("Beauty Channel", "Beauty Listings", "Beauty Photo Galleries", "", "Beauty Listing Photos", "Listings", "Slideshow"); info_array[222] = new Array("Beauty Channel", "Beauty Listings", "Beauty Detail Pages", "", "Beauty Detail Pages", "Listings", "Detail Pages"); info_array[223] = new Array("Nightlife Channel", "Bar Listings", "Bar Photo Galleries", "", "Bar Photo Galleries", "Listings", "Slideshow"); info_array[224] = new Array("Nightlife Channel", "Bar Listings", "Bar Detail Pages", "", "Bar Detail Pages", "Listings", ""); info_array[225] = new Array("Entertainment Channel", "Attractions", "Attraction Photo Galleries", "", "Attraction Photo Galleries", "Listings", "Slideshow"); info_array[226] = new Array("Entertainment Channel", "Attractions", "Attraction Detail Pages", "", "Attraction Listings", "Listings", ""); info_array[227] = new Array("Entertainment Channel", "Art", "Art Events", "Art Photo Galleries", "Art Detail Pages", "Listings", "Slideshow"); info_array[228] = new Array("Entertainment Channel", "Art", "Art Events", "Art Detail Pages", "Art Detail Pages", "Listings", ""); info_array[229] = new Array("News & Features Channel", "", "", "", "News & Features Channel", "", ""); info_array[230] = new Array("Home", "", "", "", "Home Page", "Splash", ""); info_array[231] = new Array("Service", "Redirects", "", "", "Redirect", "", ""); info_array[232] = new Array("Shopping Channel", "Shop A Matic", "", "", "Shop A Matic Gallery", "Slideshow", ""); info_array[233] = new Array("Real Estate Channel", "Home Design", "Home Design Splash", "", "Home Design Splash", "Splash", ""); info_array[234] = new Array("Real Estate Channel", "Home Design", "Great Room", "", "Great Room", "", ""); info_array[235] = new Array("Real Estate Channel", "Home Design", "Home Design Splash", "", "Home Design Splash", "Splash", ""); info_array[236] = new Array("Real Estate Channel", "Home Design", "", "", "Home Design Section", "", ""); info_array[237] = new Array("Health Channel", "Best Doctors", "Best Doctors Features", "", "Best Doctors Features", "", ""); info_array[238] = new Array("Health Channel", "", "", "", "Health Channel", "", ""); info_array[239] = new Array("Guides Channel", "Valentine's Day Guide", "", "", "Valentine's Day Guide", "", ""); info_array[240] = new Array("Guides Channel", "US Open", "", "", "US Open", "", ""); info_array[241] = new Array("Guides Channel", "Summer Guide", "", "", "Summer Guide", "", ""); info_array[242] = new Array("Guides Channel", "St. Patrick's Day Guide", "", "", "St. Patrick's Day Guide", "", ""); info_array[243] = new Array("Guides Channel", "Holidays", "Holiday Gift Guide", "", "Holiday Gift Guide", "", ""); info_array[244] = new Array("Guides Channel", "Holidays", "", "", "Holidays", "", ""); info_array[245] = new Array("Guides Channel", "Halloween", "", "", "Halloween", "", ""); info_array[246] = new Array("Guides Channel", "Gay Pride", "", "", "Gay Pride", "", ""); info_array[247] = new Array("Guides Channel", "Fall Preview", "", "", "Fall Preview", "", ""); info_array[248] = new Array("Guides Channel", "Everything Guides", "", "", "Everything Guides", "", ""); info_array[249] = new Array("Guides Channel", "Cheap Guide", "", "", "Cheap Guide", "", ""); info_array[250] = new Array("Guides Channel", "", "", "", "Guides Channel", "", ""); info_array[251] = new Array("Fashion Channel", "Model Guide", "Model Splash", "", "Model Splash", "Splash", ""); info_array[252] = new Array("Fashion Channel", "Model Guide", "Model Splash", "", "Model Splash", "Splash", ""); info_array[253] = new Array("Fashion Channel", "Model Guide", "", "", "Model Guide", "", ""); info_array[254] = new Array("Fashion Channel", "Look Book", "", "", "Look Book", "", ""); info_array[255] = new Array("Fashion Channel", "Fashion Splash", "", "", "Fashion Splash", "Splash", ""); info_array[256] = new Array("Fashion Channel", "Fashion Shows", "Runway Search & Archives", "", "Fashion Shows by Season", "Splash", ""); info_array[257] = new Array("Fashion Channel", "Fashion Shows", "Runway Search & Archives", "", "Fashion Search Splash", "Splash", ""); info_array[258] = new Array("Fashion Channel", "Fashion Shows", "My Fashion", "", "My Fashion Splash", "Splash", ""); info_array[259] = new Array("Fashion Channel", "Fashion Shows", "My Fashion", "", "My Fashion Splash", "Splash", ""); info_array[260] = new Array("Fashion Channel", "Fashion Shows", "Menswear Collections", "", "Fashion Shows Menswear Splash", "Splash", ""); info_array[261] = new Array("Fashion Channel", "Fashion Shows", "Menswear Collections", "", "Fashion Shows Menswear Splash", "Splash", ""); info_array[262] = new Array("Fashion Channel", "Fashion Shows", "Fashion Shows Splash", "", "Fashion Shows Splash", "Splash", ""); info_array[263] = new Array("Fashion Channel", "Fashion Shows", "Designers - Guide & Bios", "", "Designers - Guide & Bios", "", ""); info_array[264] = new Array("Fashion Channel", "Fashion Shows", "Couture Collections", "", "Fashion Shows Couture Splash", "Splash", ""); info_array[265] = new Array("Fashion Channel", "Fashion Shows", "Couture Collections", "", "Fashion Shows Couture Splash", "Splash", ""); info_array[266] = new Array("Fashion Channel", "Fashion Shows", "Fashion Shows Splash", "", "Fashion Shows Splash", "Splash", ""); info_array[267] = new Array("Fashion Channel", "Fashion Shows", "Women's RTW Collections", "", "Women's RTW Collections", "Slideshow", ""); info_array[268] = new Array("Fashion Channel", "Fashion Shows", "Fashion Show Schedule", "", "Fashion Show Schedule", "", ""); info_array[269] = new Array("Fashion Channel", "Fashion Shows", "Women's RTW Collections", "", "Women's RTW Collections", "Slideshow", ""); info_array[270] = new Array("Fashion Channel", "Fashion Shows", "Resort Collections", "", "Resort Collections", "Slideshow", ""); info_array[271] = new Array("Fashion Channel", "Fashion Shows", "Party Flash Galleries", "", "Party Flash Galleries", "Slideshow", ""); info_array[272] = new Array("Fashion Channel", "Fashion Shows", "Menswear Collections", "", "Menswear Collections", "Slideshow", ""); info_array[273] = new Array("Fashion Channel", "Fashion Shows", "Women's RTW Collections", "", "Women's RTW Collections", "Slideshow", ""); info_array[274] = new Array("Fashion Channel", "Fashion Shows", "Couture Collections", "", "Couture Collections", "Slideshow", ""); info_array[275] = new Array("Fashion Channel", "Fashion Shows", "Bridal Collections", "", "Bridal Collections", "Slideshow", ""); info_array[276] = new Array("Fashion Channel", "Fashion Shows", "Backstage Galleries", "", "Backstage Galleries", "Slideshow", ""); info_array[277] = new Array("Fashion Channel", "Fashion Shows", "", "", "Fashion Shows Section", "", ""); info_array[278] = new Array("Fashion Channel", "Fashion Calendar", "", "", "Fashion Calendar", "", ""); info_array[279] = new Array("Fashion Channel", "Fashion Splash", "", "", "Fashion Splash", "Splash", ""); info_array[280] = new Array("Fashion Channel", "", "", "", "Fashion Channel", "", ""); info_array[281] = new Array("Family & Kids Channel", "Kids Splash", "", "", "Kids Splash", "Splash", ""); info_array[282] = new Array("Family & Kids Channel", "Kids Splash", "", "", "Kids Splash", "Splash", ""); info_array[283] = new Array("Family & Kids Channel", "", "", "", "Family & Kids Channel", "", ""); info_array[284] = new Array("Service", "Error Pages", "", "", "404 Error", "", ""); info_array[285] = new Array("News & Features Channel", "Early & Often Blog", "", "", "Early & Often Blog", "Blog", ""); info_array[286] = new Array("Entertainment Channel", "Movies", "Projectionist", "", "Projectionist Blog", "Blog", ""); info_array[287] = new Array("News & Features Channel", "Daily Intelligencer Blog", "", "", "Daily Intelligencer Blog", "Blog", ""); info_array[288] = new Array("Food Channel", "Grub Street", "", "", "Grub Street", "Blog", ""); info_array[289] = new Array("Fashion Channel", "The Cut Blog", "", "", "The Cut Blog", "Blog", ""); info_array[290] = new Array("Entertainment Channel", "Vulture", "", "", "Vulture", "Blog", ""); info_array[291] = new Array("Food Channel", "Restaurant Reviews", "", "", "Restaurant Reviews", "", ""); info_array[292] = new Array("Food Channel", "Restaurant Reviews", "", "", "Restaurant Reviews", "", ""); info_array[293] = new Array("Service", "About New York Section", "", "", "Contact Us", "", ""); info_array[294] = new Array("Guides Channel", "Cheap Guide", "", "", "Cheap Guide", "", ""); info_array[295] = new Array("Best of New York", "BoNY Shopping", "", "", "Best of New York Shopping", "", ""); info_array[296] = new Array("Best of New York", "BoNY Services", "", "", "Best of New York Services", "", ""); info_array[297] = new Array("Best of New York", "BoNY Nightlife", "", "", "Best of New York Nightlife", "", ""); info_array[298] = new Array("Best of New York", "BoNY Neighborhoods", "", "", "Best of New York Neighborhoods", "", ""); info_array[299] = new Array("Best of New York", "BoNY Kids/Fun", "", "", "Best of New York Kids/Fun", "", ""); info_array[300] = new Array("Best of New York", "BoNY Splash Page", "", "", "Best of New York Splash Page", "Splash", ""); info_array[301] = new Array("Best of New York", "BoNY Food", "", "", "Best of New York Food", "", ""); info_array[302] = new Array("Best of New York", "BoNY Beauty", "", "", "Best of New York Beauty", "", ""); info_array[303] = new Array("Best of New York", "BoNY A-Z", "", "", "Best of New York A-Z", "", ""); info_array[304] = new Array("Best of New York", "BoNY Splash Page", "", "", "Best of New York Splash Page", "Splash", ""); info_array[305] = new Array("Best of New York", "", "", "", "Best of New York Channel", "", ""); info_array[306] = new Array("Guides Channel", "Best Lawyers", "", "", "Best Lawyers", "", ""); info_array[307] = new Array("Health Channel", "", "", "", "Health Channel", "", ""); info_array[308] = new Array("Service", "Event Promos", "Best Bets", "", "Best Bets Event Promo", "", ""); info_array[309] = new Array("Beauty Channel", "Beauty Splash", "", "", "Beauty Splash Page", "Splash", ""); info_array[310] = new Array("Beauty Channel", "Beauty Splash", "", "", "Beauty Splash Page", "Splash", ""); info_array[311] = new Array("Beauty Channel", "", "", "", "Beauty Channel", "", ""); info_array[312] = new Array("Entertainment Channel", "TV", "TV Splash", "", "TV Splash", "Splash", ""); info_array[313] = new Array("Entertainment Channel", "TV", "TV Splash", "", "TV Splash", "Splash", ""); info_array[314] = new Array("Entertainment Channel", "TV", "", "", "TV Section", "", ""); info_array[315] = new Array("Entertainment Channel", "Theater ", "Theater  Splash", "", "Theater Splash", "Splash", ""); info_array[316] = new Array("Entertainment Channel", "Theater ", "Theater  Splash", "", "Theater Splash", "Splash", ""); info_array[317] = new Array("Entertainment Channel", "Theater ", "", "", "Theater Section", "", ""); info_array[318] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[319] = new Array("Entertainment Channel", "Music", "Music Splash", "", "Music Splash", "Splash", ""); info_array[320] = new Array("Entertainment Channel", "Music", "Music Splash", "", "Music Splash", "Splash", ""); info_array[321] = new Array("Entertainment Channel", "Music", "", "", "Music Section", "", ""); info_array[322] = new Array("Entertainment Channel", "Entertainment Splash", "", "", "Entertainment Splash", "", ""); info_array[323] = new Array("Entertainment Channel", "Books", "", "", "Books Section", "", ""); info_array[324] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Splash", "", "Classical & Dance Splash", "Splash", ""); info_array[325] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Splash", "", "Classical & Dance Splash", "Splash", ""); info_array[326] = new Array("Entertainment Channel", "Classical & Dance", "", "", "Classical & Dance Section", "", ""); info_array[327] = new Array("Entertainment Channel", "Books", "Book Splash", "", "Books Splash", "Splash", ""); info_array[328] = new Array("Entertainment Channel", "Books", "Book Splash", "", "Books Splash", "Splash", ""); info_array[329] = new Array("Entertainment Channel", "Books", "", "", "Books Section", "", ""); info_array[330] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[331] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[332] = new Array("Entertainment Channel", "Art", "Art Splash", "", "Art Splash", "Splash", ""); info_array[333] = new Array("Entertainment Channel", "Art", "Art Splash", "", "Art Splash", "Splash", ""); info_array[334] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[335] = new Array("Entertainment Channel", "Art", "", "", "Art Section", "", ""); info_array[336] = new Array("Entertainment Channel", "Approval Matrix", "", "", "Approval Matrix", "", ""); info_array[337] = new Array("Entertainment Channel", "", "", "", "Entertainment Channel", "", ""); info_array[338] = new Array("Entertainment Channel", "Approval Matrix", "", "", "Approval Matrix", "", ""); info_array[339] = new Array("Service", "Advertorials", "A-Lists", "", "A List Invitations", "", ""); info_array[340] = new Array("Entertainment Channel", "Agenda Splash", "", "", "Agenda Splash", "Splash", ""); info_array[341] = new Array("Entertainment Channel", "Agenda Splash", "", "", "Agenda Splash", "Splash", ""); info_array[342] = new Array("Service", "Additional Listing Pages", "Top Reviewers", "", "Top Reviewers", "", ""); info_array[343] = new Array("Shopping Channel", "Shop A Matic", "", "", "Shop A Matic", "Slideshow", ""); info_array[344] = new Array("Food Channel", "Restaurant Listings", "Restaurant Search Results", "", "Restaurant Search Results", "Listings", "Search Results"); info_array[345] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Theater Search Results", "Movie Theater Search Results", "Listings", ""); info_array[346] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Search Results", "Movie Search Results", "Listings", ""); info_array[347] = new Array("Travel Channel", "Visitors Guide ", "Hotel Listings", "Hotel Search Results", "Hotel Search Results", "Listings", ""); info_array[348] = new Array("Entertainment Channel", "Other Events", "Food & Wine Listings", "Food & Wine Event Search Results", "Food & Wine Event Search Results", "Listings", ""); info_array[349] = new Array("Entertainment Channel", "Events", "Event Listings", "Event Search Results", "Event Search Results", "Listings", ""); info_array[350] = new Array("Shopping Channel", "Store Listings", "Store Search Results", "", "Store Search Results", "Listings", "Search Results"); info_array[351] = new Array("Beauty Channel", "Beauty Listings", "Beauty Search Results", "", "Beauty Search Results", "Listings", "Search Results"); info_array[352] = new Array("Nightlife Channel", "Bar Listings", "Bar Search Results", "", "Bar Search Results", "Listings", ""); info_array[353] = new Array("Entertainment Channel", "Attractions", "Attraction Search Results", "", "Attraction Search Results", "Listings", ""); info_array[354] = new Array("Service", "Personals", "", "", "Personal Listings", "", ""); info_array[355] = new Array("Entertainment Channel", "Attractions", "Attraction Reader Reviews", "", "Attraction Reader Reviews", "Listings", ""); info_array[356] = new Array("Entertainment Channel", "Movies", "Movie Listings", "Movie Reader Reviews", "Movie Reader Reviews", "Listings", ""); info_array[357] = new Array("Entertainment Channel", "Theater ", "Theater Events", "Theater Event Search Results", "Theater Splash", "Listings", ""); info_array[358] = new Array("Entertainment Channel", "Other Events", "Sports Listings", "Sports Event Search Results", "Sports Event Search Results", "Listings", ""); info_array[359] = new Array("Entertainment Channel", "Books", "Reading Events", "Reading Event Search Results", "Reading Event Search Results", "Listings", ""); info_array[360] = new Array("Entertainment Channel", "Other Events", "Community Listings", "Community Search Results", "Community Search Results", "Listings", ""); info_array[361] = new Array("Entertainment Channel", "Music", "Music/Nightlife Events", "Music Event Search Results", "Music Event Search Results", "Listings", ""); info_array[362] = new Array("Family & Kids Channel", "Events", "Kids Event Search Results", "", "Kids Event Search Results", "Listings", ""); info_array[363] = new Array("Entertainment Channel", "Classical & Dance", "Classical & Dance Events", "Classical Event Search Results", "Classical Event Search Results", "Listings", ""); info_array[364] = new Array("Entertainment Channel", "Art", "Art Events", "Art Event Search Results", "Art Event Search Results", "Listings", ""); info_array[365] = new Array("Fashion Channel", "Fashion Shows", "My Fashion", "", "My Fashion Galleries", "Slideshow", ""); info_array[366] = new Array("Service", "Commenting", "", "", "Comments by User", "", ""); info_array[367] = new Array("Service", "Additional Listing Pages", "Listing Maps", "", "Listing Maps", "Listings", ""); info_array[368] = new Array("Beauty Channel", "Beauty Listings", "BeautyListing Photos", "", "Beauty Listing Photos", "Listings", "Slideshow"); info_array[369] = new Array("Service", "Customer Service", "", "", "Magazine Subscription & Customer Service", "", ""); info_array[370] = new Array("Service", "Membership", "", "", "Registration & Member Center", "", ""); info_array[371] = new Array("Service", "Membership", "", "", "Registration & Member Center", "", ""); info_array[372] = new Array("Health Channel", "Best Doctors", "Best Doctors Listings", "", "Best Doctors Listings", "Listings", ""); info_array[373] = new Array("Guides Channel", "Best Lawyers", "", "", "Best Lawyers", "", ""); info_array[374] = new Array("Video", "", "", "", "Video", "", ""); info_array[375] = new Array("Service", "Personals", "", "", "Personal Listings", "Listings", ""); info_array[376] = new Array("Fashion Channel", "Fashion Shows", "Runway Search & Archives", "", "Runway Search Results", "Slideshow", ""); info_array[377] = new Array("Service", "Commenting", "", "", "Comments by User", "", ""); info_array[378] = new Array("Service", "Commenting", "", "", "Comments by Article", "", ""); info_array[379] = new Array("Travel Channel", "Visitors Guide ", "Hotel Listings", "Hotel Reader Reviews", "Hotel Reader Reviews", "Listings", ""); info_array[380] = new Array("Shopping Channel", "", "", "", "Shopping Features", "", ""); info_array[381] = new Array("Home", "", "", "", "Home Page", "Splash", ""); info_array[382] = new Array("Dating", "How about we", "", "", "How about we", "", "");
//nymag_classify takes several parameters and returns an object
//	its purpose is to find where in the hierarchy the current URL belongs
function nymag_classify(url, tracking_object, pattern_array, exclude_array, info_array) {
	for (match_url in pattern_array)
	{
		if(typeof pattern_array[match_url] != "string") continue;
		if(0<=url.search(pattern_array[match_url]))
		{
			if((typeof exclude_array[match_url] != "undefined") && (0<=url.search(exclude_array[match_url])))
				continue;

			tag = info_array[match_url];
			tracking_object.prettyname = tag[4];
			tracking_object.horiz1 = tag[5];
			tracking_object.horiz2 = tag[6];
			hierarchy = new Array(tag[0],tag[1],tag[2],tag[3])
			infos = hierarchy.length;
			hierarchy_string = "";
			channel_string = "";
			for(i=0;i<infos;i++) {
				if(hierarchy[i]) {
					hierarchy_string += hierarchy[i] + ",";
					channel_string += hierarchy[i] + ":";
				}
			}
			if(window.location.href.match("/print/?")){
			    hierarchy_string += "Print,";
				channel_string += "Print:";
			}

			less_one = hierarchy_string.length-1;
			tracking_object.hier1 = hierarchy_string.substring(0,less_one);
			tracking_object.channel = channel_string.substring(0,less_one);
			tracking_object.centralized = url;

			return tracking_object;
		}
	}
	//Default Case
	tracking_object.channel = "Uncategorized:" + url.replace(/^http:\/\//,"");
	tracking_object.prettyname = url;
	tracking_object.horiz1 = "Uncategorized";
	tracking_object.horiz2 = "Uncategorized";
	tracking_object.hier1 = url;
	tracking_object.centralized = "";
	return tracking_object;
}

/********************* OMNITURE PLUGINS *****************************/
s.doPlugins=s_doPlugins
//Plugin: Days since last Visit 1.0.H
s.getDaysSinceLastVisit=new Function(""
+"var s=this,e=new Date(),cval,ct=e.getTime(),c='s_lastvisit',day=24*"
+"60*60*1000;e.setTime(ct+3*365*day);cval=s.c_r(c);if(!cval){s.c_w(c,"
+"ct,e);return 'First page view or cookies not supported';}else{var d"
+"=ct-cval;if(d>30*60*1000){if(d>30*day){s.c_w(c,ct,e);return 'More t"
+"han 30 days';}if(d<30*day+1 && d>7*day){s.c_w(c,ct,e);return 'More "
+"than 7 days';}if(d<7*day+1 && d>day){s.c_w(c,ct,e);return 'Less tha"
+"n 7 days';}if(d<day+1){s.c_w(c,ct,e);return 'Less than 1 day';}}els"
+"e return '';}"
);

/*
 * Plugin: setupLinkTrack 2.0 - return links for HBX-based link
 *         tracking in SiteCatalyst (requires s.split and s.apl)
 */
s.setupLinkTrack=new Function("vl","c",""
+"var s=this;var l=s.d.links,cv,cva,vla,h,i,l,t,b,o,y,n,oc,d='';cv=s."
+"c_r(c);if(vl&&cv!=''){cva=s.split(cv,'^^');vla=s.split(vl,',');for("
+"x in vla)s._hbxm(vla[x])?s[vla[x]]=cva[x]:'';}s.c_w(c,'',0);if(!s.e"
+"o&&!s.lnk)return '';o=s.eo?s.eo:s.lnk;y=s.ot(o);n=s.oid(o);if(s.eo&"
+"&o==s.eo){while(o&&!n&&y!='BODY'){o=o.parentElement?o.parentElement"
+":o.parentNode;if(!o)return '';y=s.ot(o);n=s.oid(o);}for(i=0;i<4;i++"
+")if(o.tagName)if(o.tagName.toLowerCase()!='a')if(o.tagName.toLowerC"
+"ase()!='area')o=o.parentElement;}b=s._LN(o);o.lid=b[0];o.lpos=b[1];"
+"if(s.hbx_lt&&s.hbx_lt!='manual'){if((o.tagName&&s._TL(o.tagName)=='"
+"area')){if(!s._IL(o.lid)){if(o.parentNode){if(o.parentNode.name)o.l"
+"id=o.parentNode.name;else o.lid=o.parentNode.id}}if(!s._IL(o.lpos))"
+"o.lpos=o.coords}else{if(s._IL(o.lid)<1)o.lid=s._LS(o.lid=o.text?o.t"
+"ext:o.innerText?o.innerText:'');if(!s._IL(o.lid)||s._II(s._TL(o.lid"
+"),'<img')>-1){h=''+o.innerHTML;bu=s._TL(h);i=s._II(bu,'<img');if(bu"
+"&&i>-1){eval(\"__f=/ src\s*=\s*[\'\\\"]?([^\'\\\" ]+)[\'\\\"]?/i\")"
+";__f.exec(h);if(RegExp.$1)h=RegExp.$1}o.lid=h}}}h=o.href?o.href:'';"
+"i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h.substring(0,i);l"
+"=s.linkName?s.linkName:s._hbxln(h);t=s.linkType?s.linkType.toLowerC"
+"ase():s.lt(h);oc=o.onclick?''+o.onclick:'';cv=s.pageName+'^^'+o.lid"
+"+'^^'+s.pageName+' | '+(o.lid=o.lid?o.lid:'no &lid')+'^^'+o.lpos;if"
+"(t&&(h||l)){cva=s.split(cv,'^^');vla=s.split(vl,',');;for(x in vla)s"
+"._hbxm(vla[x])?s[vla[x]]=cva[x]:'';}else if(!t&&oc.indexOf('.tl(')<"
+"0){s.c_w(c,cv,0);}else return ''");
s._IL=new Function("a","var s=this;return a!='undefined'?a.length:0");
s._II=new Function("a","b","c","var s=this;return a.indexOf(b,c?c:0)"
);
s._IS=new Function("a","b","c",""
+"var s=this;return b>s._IL(a)?'':a.substring(b,c!=null?c:s._IL(a))");
s._LN=new Function("a","b","c","d",""
+"var s=this;b=a.href;b+=a.name?a.name:'';c=s._LVP(b,'lid');d=s._LVP("
+"b,'lpos');d=d?d:s._LVP(b,'amp;lpos');r"
+"eturn[c,d]");
s._LVP=new Function("a","b","c","d","e",""
+"var s=this;c=s._II(a,'&'+b+'=');c=c<0?s._II(a,'?'+b+'='):c;if(c>-1)"
+"{d=s._II(a,'&',c+s._IL(b)+2);e=s._IS(a,c+s._IL(b)+2,d>-1?d:s._IL(a)"
+");return e}return ''");
s._LS=new Function("a",""
+"var s=this,b,c=100,d,e,f,g;b=(s._IL(a)>c)?escape(s._IS(a,0,c)):esca"
+"pe(a);b=s._LSP(b,'%0A','%20');b=s._LSP(b,'%0D','%20');b=s._LSP(b,'%"
+"09','%20');c=s._IP(b,'%20');d=s._NA();e=0;for(f=0;f<s._IL(c);f++){g"
+"=s._RP(c[f],'%20','');if(s._IL(g)>0){d[e++]=g}}b=d.join('%20');retu"
+"rn unescape(b)");
s._LSP=new Function("a","b","c","d","var s=this;d=s._IP(a,b);return d"
+".join(c)");
s._IP=new Function("a","b","var s=this;return a.split(b)");
s._RP=new Function("a","b","c","d",""
+"var s=this;d=s._II(a,b);if(d>-1){a=s._RP(s._IS(a,0,d)+','+s._IS(a,d"
+"+s._IL(b),s._IL(a)),b,c)}return a");
s._TL=new Function("a","var s=this;return a.toLowerCase()");
s._NA=new Function("a","var s=this;return new Array(a?a:0)");
s._hbxm=new Function("m","var s=this;return (''+m).indexOf('{')<0");
s._hbxln=new Function("h","var s=this,n=s.linkNames;if(n)return s.pt("
+"n,',','lnf',h);return ''");


//Plugin: getQueryParam 2.0 - return query string parameter(s)
s.getQueryParam=new Function("p","d","u",""
+"var s=this,v='',i,t;d=d?d:'';u=u?u:(s.pageURL?s.pageURL:''+s.wd.loc"
+"ation);u=u=='f'?''+s.gtfs().location:u;while(p){i=p.indexOf(',');i="
+"i<0?p.length:i;t=s.p_gpv(p.substring(0,i),u);if(t)v+=v?d+t:t;p=p.su"
+"bstring(i==p.length?i:i+1)}return v");
s.p_gpv=new Function("k","u",""
+"var s=this,v='',i=u.indexOf('?'),q;if(k&&i>-1){q=u.substring(i+1);v"
+"=s.pt(q,'&','p_gvf',k)}return v");
s.p_gvf=new Function("t","k",""
+"if(t){var s=this,i=t.indexOf('='),p=i<0?t:t.substring(0,i),v=i<0?'T"
+"rue':t.substring(i+1);if(p.toLowerCase()==k.toLowerCase())return s."
+"epa(v)}return ''");

//Plugin Utility: appendList v1.0
s.appendList=new Function("L","v","d","u",""
+"var s=this,m=0;if(!L)L='';if(u){var i,n,a=s.split(L,d);for(i in a){"
+"n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCase()));}}if(!"
+"m)L=L?L+d+v:v;return L");

//Plugin: getValOnce 0.2 - get a value once per session or no. of days
 s.getValOnce=new Function("v","c","e",""
+"var s=this,k=s.c_r(c),a=new Date;e=e?e:0;if(v){a.setTime(a.getTime("
+")+e*86400000);s.c_w(c,v,e?a:0);}return v==k?'':v");

//Plugin: getAndPersistValue 0.3 - get a value on every page
s.getAndPersistValue=new Function("v","c","e",""
+"var s=this,a=new Date;e=e?e:0;a.setTime(a.getTime()+e*86400000);if("
+"v)s.c_w(c,v,e?a:0);return s.c_r(c);");

//Utility Function: split v1.5 - split a string (JS 1.0 compatible)
s.split=new Function("l","d",""
+"var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
+"++]=l.substring(0,i);l=l.substring(i+d.length);}return a");

/*
 * Plugin Utility: apl v1.1
 */
s.apl=new Function("l","v","d","u",""
+"var s=this,m=0;if(!l)l='';if(u){var i,n,a=s.split(l,d);for(i=0;i<a."
+"length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas"
+"e()));}}if(!m)l=l?l+d+v:v;return l");

//Plugin: getTimeParting 1.3 - Get time values based on time zone
s.getTimeParting=new Function("t","z","y",""
+"dc=new Date('1/1/2000');f=15;ne=8;if(dc.getDay()!=6||"
+"dc.getMonth()!=0){return'Data Not Available'}else{;z=parseInt(z);"
+"if(y=='2009'){f=8;ne=1};gmar=new Date('3/1/'+y);dsts=f-gmar.getDay("
+");gnov=new Date('11/1/'+y);dste=ne-gnov.getDay();spr=new Date('3/'"
+"+dsts+'/'+y);fl=new Date('11/'+dste+'/'+y);cd=new Date();"
+"if(cd>spr&&cd<fl){z=z+1}else{z=z};utc=cd.getTime()+(cd.getTimezoneO"
+"ffset()*60000);tz=new Date(utc + (3600000*z));thisy=tz.getFullYear("
+");var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Fr"
+"iday','Saturday'];if(thisy!=y){return'Data Not Available'}else{;thi"
+"sh=tz.getHours();thismin=tz.getMinutes();thisd=tz.getDay();var dow="
+"days[thisd];var ap='AM';var dt='Weekday';var mint='00';if(thismin>3"
+"0){mint='30'}if(thish>=12){ap='PM';thish=thish-12};if (thish==0){th"
+"ish=12};if(thisd==6||thisd==0){dt='Weekend'};var timestring=thish+'"
+":'+mint+ap;var daystring=dow;var endstring=dt;if(t=='h'){return tim"
+"estring}if(t=='d'){return daystring};if(t=='w'){return en"
+"dstring}}};"
);

// Plugin: Form Analysis 2.0 (Success, Error, Abandonment)
s.setupFormAnalysis=new Function(""
+"var s=this;if(!s.fa){s.fa=new Object;var f=s.fa;f.ol=s.wd.onload;s."
+"wd.onload=s.faol;f.uc=s.useCommerce;f.vu=s.varUsed;f.vl=f.uc?s.even"
+"tList:'';f.tfl=s.trackFormList;f.fl=s.formList;f.va=new Array('',''"
+",'','')}");
s.sendFormEvent=new Function("t","pn","fn","en",""
+"var s=this,f=s.fa;t=t=='s'?t:'e';f.va[0]=pn;f.va[1]=fn;f.va[3]=t=='"
+"s'?'Success':en;s.fasl(t);f.va[1]='';f.va[3]='';");
s.faol=new Function("e",""
+"var s=s_c_il["+s._in+"],f=s.fa,r=true,fo,fn,i,en,t,tf;if(!e)e=s.wd."
+"event;f.os=new Array;if(f.ol)r=f.ol(e);if(s.d.forms&&s.d.forms.leng"
+"th>0){for(i=s.d.forms.length-1;i>=0;i--){fo=s.d.forms[i];fn=fo.name"
+";tf=f.tfl&&s.pt(f.fl,',','ee',fn)||!f.tfl&&!s.pt(f.fl,',','ee',fn);"
+"if(tf){f.os[fn]=fo.onsubmit;fo.onsubmit=s.faos;f.va[1]=fn;f.va[3]='"
+"No Data Entered';for(en=0;en<fo.elements.length;en++){el=fo.element"
+"s[en];t=el.type;if(t&&t.toUpperCase){t=t.toUpperCase();var md=el.on"
+"mousedown,kd=el.onkeydown,omd=md?md.toString():'',okd=kd?kd.toStrin"
+"g():'';if(omd.indexOf('.fam(')<0&&okd.indexOf('.fam(')<0){el.s_famd"
+"=md;el.s_fakd=kd;el.onmousedown=s.fam;el.onkeydown=s.fam}}}}}f.ul=s"
+".wd.onunload;s.wd.onunload=s.fasl;}return r;");
s.faos=new Function("e",""
+"var s=s_c_il["+s._in+"],f=s.fa,su;if(!e)e=s.wd.event;if(f.vu){s[f.v"
+"u]='';f.va[1]='';f.va[3]='';}su=f.os[this.name];return su?su(e):tru"
+"e;");
s.fasl=new Function("e",""
+"var s=s_c_il["+s._in+"],f=s.fa,a=f.va,l=s.wd.location,ip=s.trackPag"
+"eName,p=s.pageName;if(a[1]!=''&&a[3]!=''){a[0]=!p&&ip?l.host+l.path"
+"name:a[0]?a[0]:p;if(!f.uc&&a[3]!='No Data Entered'){if(e=='e')a[2]="
+"'Error';else if(e=='s')a[2]='Success';else a[2]='Abandon'}else a[2]"
+"='';var tp=ip?a[0]+':':'',t3=e!='s'?':('+a[3]+')':'',ym=!f.uc&&a[3]"
+"!='No Data Entered'?tp+a[1]+':'+a[2]+t3:tp+a[1]+t3,ltv=s.linkTrackV"
+"ars,lte=s.linkTrackEvents,up=s.usePlugins;if(f.uc){s.linkTrackVars="
+"ltv=='None'?f.vu+',events':ltv+',events,'+f.vu;s.linkTrackEvents=lt"
+"e=='None'?f.vl:lte+','+f.vl;f.cnt=-1;if(e=='e')s.events=s.pt(f.vl,'"
+",','fage',2);else if(e=='s')s.events=s.pt(f.vl,',','fage',1);else s"
+".events=s.pt(f.vl,',','fage',0)}else{s.linkTrackVars=ltv=='None'?f."
+"vu:ltv+','+f.vu}s[f.vu]=ym;s.usePlugins=false;s.tl(true,'o','Form A"
+"nalysis');s[f.vu]='';s.usePlugins=up}return f.ul&&e!='e'&&e!='s'?f."
+"ul(e):true;");
s.fam=new Function("e",""
+"var s=s_c_il["+s._in+"],f=s.fa;if(!e) e=s.wd.event;var o=s.trackLas"
+"tChanged,et=e.type.toUpperCase(),t=this.type.toUpperCase(),fn=this."
+"form.name,en=this.name,sc=false;if(document.layers){kp=e.which;b=e."
+"which}else{kp=e.keyCode;b=e.button}et=et=='MOUSEDOWN'?1:et=='KEYDOW"
+"N'?2:et;if(f.ce!=en||f.cf!=fn){if(et==1&&b!=2&&'BUTTONSUBMITRESETIM"
+"AGERADIOCHECKBOXSELECT-ONEFILE'.indexOf(t)>-1){f.va[1]=fn;f.va[3]=e"
+"n;sc=true}else if(et==1&&b==2&&'TEXTAREAPASSWORDFILE'.indexOf(t)>-1"
+"){f.va[1]=fn;f.va[3]=en;sc=true}else if(et==2&&kp!=9&&kp!=13){f.va["
+"1]=fn;f.va[3]=en;sc=true}if(sc){nface=en;nfacf=fn}}if(et==1&&this.s"
+"_famd)return this.s_famd(e);if(et==2&&this.s_fakd)return this.s_fak"
+"d(e);");
s.ee=new Function("e","n",""
+"return n&&n.toLowerCase?e.toLowerCase()==n.toLowerCase():false;");
s.fage=new Function("e","a",""
+"var s=this,f=s.fa,x=f.cnt;x=x?x+1:1;f.cnt=x;return x==a?e:'';");

s.loadModule("Media")
s.Media.autoTrack=false
s.Media.trackWhilePlaying=true
s.Media.trackVars="None"
s.Media.trackEvents="None"

/* WARNING: Changing any of the below variables will cause drastic
changes to how your visitor data is collected.  Changes should only be
made when instructed to do so by your account manager.*/
s.visitorNamespace="newyorkmagazine"
s.trackingServer="newyorkmagazine.112.2o7.net"


/* Module: Media */
s.m_Media_c="var m=s.m_i('Media');m.cn=function(n){var m=this;return m.s.rep(m.s.rep(m.s.rep(n,\"\\n\",''),\"\\r\",''),'--**--','')};m.open=function(n,l,p,b){var m=this,i=new Object,tm=new Date,a='',"
+"x;n=m.cn(n);if(!l)l=-1;if(n&&p){if(!m.l)m.l=new Object;if(m.l[n])m.close(n);if(b&&b.id)a=b.id;if(a)for (x in m.l)if(m.l[x]&&m.l[x].a==a)m.close(m.l[x].n);i.n=n;i.l=l;i.o=0;i.x=0;i.p=m.cn(m.playerNa"
+"me?m.playerName:p);i.a=a;i.t=0;i.ts=0;i.s=Math.floor(tm.getTime()/1000);i.lx=0;i.lt=i.s;i.lo=0;i.e='';i.to=-1;i.tc=0;i.fel=new Object;i.vt=0;i.sn=0;i.sx=\"\";i.sl=0;i.sg=0;i.sc=0;i.us=0;i.lm=0;i.lo"
+"m=0;m.l[n]=i}};m._delete=function(n){var m=this,i;n=m.cn(n);i=m.l[n];m.l[n]=0;if(i&&i.m)clearTimeout(i.m.i)};m.close=function(n){this.e(n,0,-1)};m.play=function(n,o,sn,sx,sl){var m=this,i;i=m.e(n,1"
+",o,sn,sx,sl);if(i&&!i.m){i.m=new Object;i.m.m=new Function('var m=s_c_il['+m._in+'],i;if(m.l){i=m.l[\"'+m.s.rep(i.n,'\"','\\\\\"')+'\"];if(i){if(i.lx==1)m.e(i.n,3,-1);i.m.i=setTimeout(i.m.m,1000)}}"
+"');i.m.m()}};m.stop=function(n,o){this.e(n,2,o)};m.track=function(n){this.e(n,4,-1)};m.bcd=function(vo,i){var m=this,ns='a.media.',v=vo.linkTrackVars,e=vo.linkTrackEvents,pe='m_i',pev3,c=vo.context"
+"Data,x;c['a.contentType']='video';c[ns+'name']=i.n;c[ns+'playerName']=i.p;if(i.l>0){c[ns+'length']=i.l;}c[ns+'timePlayed']=Math.floor(i.ts);if(!i.vt){c[ns+'view']=true;pe='m_s';i.vt=1}if(i.sx){c[ns"
+"+'segmentNum']=i.sn;c[ns+'segment']=i.sx;if(i.sl>0)c[ns+'segmentLength']=i.sl;if(i.sc&&i.ts>0)c[ns+'segmentView']=true}if(i.lm>0)c[ns+'milestone']=i.lm;if(i.lom>0)c[ns+'offsetMilestone']=i.lom;if(v"
+")for(x in c)v+=',contextData.'+x;pev3='video';vo.pe=pe;vo.pev3=pev3;var d=m.contextDataMapping,y,a,l,n;if(d){vo.events2='';if(v)v+=',events';for(x in d){if(x.substring(0,ns.length)==ns)y=x.substrin"
+"g(ns.length);else y=\"\";a=d[x];if(typeof(a)=='string'){l=m.s.sp(a,',');for(n=0;n<l.length;n++){a=l[n];if(x==\"a.contentType\"){if(v)v+=','+a;vo[a]=c[x]}else if(y){if(y=='view'||y=='segmentView'||y"
+"=='timePlayed'){if(e)e+=','+a;if(c[x]){if(y=='timePlayed'){if(c[x])vo.events2+=(vo.events2?',':'')+a+'='+c[x];}else if(c[x])vo.events2+=(vo.events2?',':'')+a}}else if(y=='segment'&&c[x+'Num']){if(v"
+")v+=','+a;vo[a]=c[x+'Num']+':'+c[x]}else{if(v)v+=','+a;vo[a]=c[x]}}}}else if(y=='milestones'||y=='offsetMilestones'){x=x.substring(0,x.length-1);if(c[x]&&d[x+'s'][c[x]]){if(e)e+=','+d[x+'s'][c[x]];"
+"vo.events2+=(vo.events2?',':'')+d[x+'s'][c[x]]}}}vo.contextData=0}vo.linkTrackVars=v;vo.linkTrackEvents=e};m.bpe=function(vo,i,x,o){var m=this,pe='m_o',pev3,d='--**--';pe='m_o';if(!i.vt){pe='m_s';i"
+".vt=1}else if(x==4)pe='m_i';pev3=m.s.ape(i.n)+d+Math.floor(i.l>0?i.l:1)+d+m.s.ape(i.p)+d+Math.floor(i.t)+d+i.s+d+(i.to>=0?'L'+Math.floor(i.to):'')+i.e+(x!=0&&x!=2?'L'+Math.floor(o):'');vo.pe=pe;vo."
+"pev3=pev3};m.e=function(n,x,o,sn,sx,sl,pd){var m=this,i,tm=new Date,ts=Math.floor(tm.getTime()/1000),c,l,v=m.trackVars,e=m.trackEvents,ti=m.trackSeconds,tp=m.trackMilestones,to=m.trackOffsetMilesto"
+"nes,sm=m.segmentByMilestones,so=m.segmentByOffsetMilestones,z=new Array,j,t=1,w=new Object,x,ek,tc,vo=new Object;n=m.cn(n);i=n&&m.l&&m.l[n]?m.l[n]:0;if(i){if(o<0){if(i.lx==1&&i.lt>0)o=(ts-i.lt)+i.l"
+"o;else o=i.lo}if(i.l>0)o=o<i.l?o:i.l;if(o<0)o=0;i.o=o;if(i.l>0){i.x=(i.o/i.l)*100;i.x=i.x>100?100:i.x}if(i.lo<0)i.lo=o;tc=i.tc;w.name=n;w.length=i.l;w.openTime=new Date;w.openTime.setTime(i.s*1000)"
+";w.offset=i.o;w.percent=i.x;w.playerName=i.p;if(i.to<0)w.mediaEvent=w.event='OPEN';else w.mediaEvent=w.event=(x==1?'PLAY':(x==2?'STOP':(x==3?'MONITOR':(x==4?'TRACK':(x==5?'FLUSH':('CLOSE'))))));if("
+"!pd){if(i.pd)pd=i.pd}else i.pd=pd;w.player=pd;if(x>2||(x!=i.lx&&(x!=2||i.lx==1))) {if(!sx){sn=i.sn;sx=i.sx;sl=i.sl}if(x){if(x==1)i.lo=o;if(x<=3&&i.to>=0){t=0;v=e=\"None\";if(i.to!=o){l=i.to;if(l>o)"
+"{l=i.lo;if(l>o)l=o}z=tp?m.s.sp(tp,','):0;if(i.l>0&&z&&o>=l)for(j=0;j<z.length;j++){c=z[j]?parseFloat(''+z[j]):0;if(c&&(l/i.l)*100<c&&i.x>=c){t=1;j=z.length;w.mediaEvent=w.event='MILESTONE';i.lm=w.m"
+"ilestone=c}}z=to?m.s.sp(to,','):0;if(z&&o>=l)for(j=0;j<z.length;j++){c=z[j]?parseFloat(''+z[j]):0;if(c&&l<c&&o>=c){t=1;j=z.length;w.mediaEvent=w.event='OFFSET_MILESTONE';i.lom=w.offsetMilestone=c}}"
+"}}if(i.sg||!sx){if(sm&&tp&&i.l>0){z=m.s.sp(tp,',');if(z){z[z.length]='100';l=0;for(j=0;j<z.length;j++){c=z[j]?parseFloat(''+z[j]):0;if(c){if(i.x<c){sn=j+1;sx='M:'+l+'-'+c;j=z.length}l=c}}}}else if("
+"so&&to){z=m.s.sp(to,',');if(z){z[z.length]=''+(i.l>0?i.l:'E');l=0;for(j=0;j<z.length;j++){c=z[j]?parseFloat(''+z[j]):0;if(c||z[j]=='E'){if(o<c||z[j]=='E'){sn=j+1;sx='O:'+l+'-'+c;j=z.length}l=c}}}}i"
+"f(sx)i.sg=1}if((sx||i.sx)&&sx!=i.sx){i.us=1;if(!i.sx){i.sn=sn;i.sx=sx}if(i.to>=0)t=1}if(x>=2&&i.lo<o){i.t+=o-i.lo;i.ts+=o-i.lo}if(x<=2||(x==3&&!i.lx)){i.e+=(x==1||x==3?'S':'E')+Math.floor(o);i.lx=("
+"x==3?1:x)}if(!t&&i.to>=0&&x<=3){ti=ti?ti:0;if(ti&&i.ts>=ti){t=1;w.mediaEvent=w.event='SECONDS'}}if(x==5)v=e=\"None\";i.lt=ts;i.lo=o}if(!x||i.x>=100){x=0;m.e(n,2,-1,0,0,-1,pd);v=e=\"None\"}ek=w.medi"
+"aEvent;if(ek=='MILESTONE')ek+='_'+w.milestone;else if(ek=='OFFSET_MILESTONE')ek+='_'+w.offsetMilestone;if(!i.fel[ek]) {w.eventFirstTime=true;i.fel[ek]=1}else w.eventFirstTime=false;w.timePlayed=i.t"
+";w.segmentNum=i.sn;w.segment=i.sx;w.segmentLength=i.sl;if(m.monitor&&x!=4)m.monitor(m.s,w);if(x==0)m._delete(n);if(t&&i.tc==tc){vo=new Object;vo.contextData=new Object;vo.linkTrackVars=v;vo.linkTra"
+"ckEvents=e;if(!vo.linkTrackVars)vo.linkTrackVars='';if(!vo.linkTrackEvents)vo.linkTrackEvents='';if(m.trackUsingContextData)m.bcd(vo,i);else m.bpe(vo,i,x,o);m.s.t(vo);if(i.us){i.sn=sn;i.sx=sx;i.sc="
+"1;i.us=0}else if(i.ts>0)i.sc=0;i.e=\"\";i.lm=i.lom=0;i.ts-=Math.floor(i.ts);i.to=o;i.tc++}}}return i};m.ae=function(n,l,p,x,o,sn,sx,sl,pd,b){var m=this,r=0;if(n&&(!m.autoTrackMediaLengthRequired||("
+"length&&length>0)) &&p){if(!m.l||!m.l[n]){if(x==1||x==3){m.open(n,l,p,b);r=1}}else r=1;if(r)m.e(n,x,o,sn,sx,sl,pd)}};m.a=function(o,t){var m=this,i=o.id?o.id:o.name,n=o.name,p=0,v,c,c1,c2,xc=m.s.h,"
+"x,e,f1,f2='s_media_'+m._in+'_oc',f3='s_media_'+m._in+'_t',f4='s_media_'+m._in+'_s',f5='s_media_'+m._in+'_l',f6='s_media_'+m._in+'_m',f7='s_media_'+m._in+'_c',tcf,w;if(!i){if(!m.c)m.c=0;i='s_media_'"
+"+m._in+'_'+m.c;m.c++}if(!o.id)o.id=i;if(!o.name)o.name=n=i;if(!m.ol)m.ol=new Object;if(m.ol[i])return;m.ol[i]=o;if(!xc)xc=m.s.b;tcf=new Function('o','var e,p=0;try{if(o.versionInfo&&o.currentMedia&"
+"&o.controls)p=1}catch(e){p=0}return p');p=tcf(o);if(!p){tcf=new Function('o','var e,p=0,t;try{t=o.GetQuickTimeVersion();if(t)p=2}catch(e){p=0}return p');p=tcf(o);if(!p){tcf=new Function('o','var e,"
+"p=0,t;try{t=o.GetVersionInfo();if(t)p=3}catch(e){p=0}return p');p=tcf(o)}}v=\"var m=s_c_il[\"+m._in+\"],o=m.ol['\"+i+\"']\";if(p==1){p='Windows Media Player '+o.versionInfo;c1=v+',n,p,l,x=-1,cm,c,m"
+"n;if(o){cm=o.currentMedia;c=o.controls;if(cm&&c){mn=cm.name?cm.name:c.URL;l=cm.duration;p=c.currentPosition;n=o.playState;if(n){if(n==8)x=0;if(n==3)x=1;if(n==1||n==2||n==4||n==5||n==6)x=2;}';c2='if"
+"(x>=0)m.ae(mn,l,\"'+p+'\",x,x!=2?p:-1,0,\"\",0,0,o)}}';c=c1+c2;if(m.s.isie&&xc){x=m.s.d.createElement('script');x.language='jscript';x.type='text/javascript';x.htmlFor=i;x.event='PlayStateChange(Ne"
+"wState)';x.defer=true;x.text=c;xc.appendChild(x);o[f6]=new Function(c1+'if(n==3){x=3;'+c2+'}setTimeout(o.'+f6+',5000)');o[f6]()}}if(p==2){p='QuickTime Player '+(o.GetIsQuickTimeRegistered()?'Pro ':"
+"'')+o.GetQuickTimeVersion();f1=f2;c=v+',n,x,t,l,p,p2,mn;if(o){mn=o.GetMovieName()?o.GetMovieName():o.GetURL();n=o.GetRate();t=o.GetTimeScale();l=o.GetDuration()/t;p=o.GetTime()/t;p2=o.'+f5+';if(n!="
+"o.'+f4+'||p<p2||p-p2>5){x=2;if(n!=0)x=1;else if(p>=l)x=0;if(p<p2||p-p2>5)m.ae(mn,l,\"'+p+'\",2,p2,0,\"\",0,0,o);m.ae(mn,l,\"'+p+'\",x,x!=2?p:-1,0,\"\",0,0,o)}if(n>0&&o.'+f7+'>=10){m.ae(mn,l,\"'+p+'"
+"\",3,p,0,\"\",0,0,o);o.'+f7+'=0}o.'+f7+'++;o.'+f4+'=n;o.'+f5+'=p;setTimeout(\"'+v+';o.'+f2+'(0,0)\",500)}';o[f1]=new Function('a','b',c);o[f4]=-1;o[f7]=0;o[f1](0,0)}if(p==3){p='RealPlayer '+o.GetVe"
+"rsionInfo();f1=n+'_OnPlayStateChange';c1=v+',n,x=-1,l,p,mn;if(o){mn=o.GetTitle()?o.GetTitle():o.GetSource();n=o.GetPlayState();l=o.GetLength()/1000;p=o.GetPosition()/1000;if(n!=o.'+f4+'){if(n==3)x="
+"1;if(n==0||n==2||n==4||n==5)x=2;if(n==0&&(p>=l||p==0))x=0;if(x>=0)m.ae(mn,l,\"'+p+'\",x,x!=2?p:-1,0,\"\",0,0,o)}if(n==3&&(o.'+f7+'>=10||!o.'+f3+')){m.ae(mn,l,\"'+p+'\",3,p,0,\"\",0,0,o);o.'+f7+'=0}"
+"o.'+f7+'++;o.'+f4+'=n;';c2='if(o.'+f2+')o.'+f2+'(o,n)}';if(m.s.wd[f1])o[f2]=m.s.wd[f1];m.s.wd[f1]=new Function('a','b',c1+c2);o[f1]=new Function('a','b',c1+'setTimeout(\"'+v+';o.'+f1+'(0,0)\",o.'+f"
+"3+'?500:5000);'+c2);o[f4]=-1;if(m.s.isie)o[f3]=1;o[f7]=0;o[f1](0,0)}};m.as=new Function('e','var m=s_c_il['+m._in+'],l,n;if(m.autoTrack&&m.s.d.getElementsByTagName){l=m.s.d.getElementsByTagName(m.s"
+".isie?\"OBJECT\":\"EMBED\");if(l)for(n=0;n<l.length;n++)m.a(l[n]);}');if(s.wd.attachEvent)s.wd.attachEvent('onload',m.as);else if(s.wd.addEventListener)s.wd.addEventListener('load',m.as,false);if(m"
+".onLoad)m.onLoad(s,m)";
s.m_i("Media");

/************************** OMNITURE SECTION ************************/
var s_code='',s_objectID;function s_gi(un,pg,ss){var c="s.version='H.24.1';s.an=s_an;s.logDebug=function(m){var s=this,tcf=new Function('var e;try{console.log(\"'+s.rep(s.rep(m,\"\\n\",\"\\\\n\"),\""
+"\\\"\",\"\\\\\\\"\")+'\");}catch(e){}');tcf()};s.cls=function(x,c){var i,y='';if(!c)c=this.an;for(i=0;i<x.length;i++){n=x.substring(i,i+1);if(c.indexOf(n)>=0)y+=n}return y};s.fl=function(x,l){retur"
+"n x?(''+x).substring(0,l):x};s.co=function(o){if(!o)return o;var n=new Object,x;for(x in o)if(x.indexOf('select')<0&&x.indexOf('filter')<0)n[x]=o[x];return n};s.num=function(x){x=''+x;for(var p=0;p"
+"<x.length;p++)if(('0123456789').indexOf(x.substring(p,p+1))<0)return 0;return 1};s.rep=s_rep;s.sp=s_sp;s.jn=s_jn;s.ape=function(x){var s=this,h='0123456789ABCDEF',i,c=s.charSet,n,l,e,y='';c=c?c.toU"
+"pperCase():'';if(x){x=''+x;if(s.em==3)x=encodeURIComponent(x);else if(c=='AUTO'&&('').charCodeAt){for(i=0;i<x.length;i++){c=x.substring(i,i+1);n=x.charCodeAt(i);if(n>127){l=0;e='';while(n||l<4){e=h"
+".substring(n%16,n%16+1)+e;n=(n-n%16)/16;l++}y+='%u'+e}else if(c=='+')y+='%2B';else y+=escape(c)}x=y}else x=escape(''+x);x=s.rep(x,'+','%2B');if(c&&c!='AUTO'&&s.em==1&&x.indexOf('%u')<0&&x.indexOf('"
+"%U')<0){i=x.indexOf('%');while(i>=0){i++;if(h.substring(8).indexOf(x.substring(i,i+1).toUpperCase())>=0)return x.substring(0,i)+'u00'+x.substring(i);i=x.indexOf('%',i)}}}return x};s.epa=function(x)"
+"{var s=this;if(x){x=s.rep(''+x,'+',' ');return s.em==3?decodeURIComponent(x):unescape(x)}return x};s.pt=function(x,d,f,a){var s=this,t=x,z=0,y,r;while(t){y=t.indexOf(d);y=y<0?t.length:y;t=t.substri"
+"ng(0,y);r=s[f](t,a);if(r)return r;z+=y+d.length;t=x.substring(z,x.length);t=z<x.length?t:''}return ''};s.isf=function(t,a){var c=a.indexOf(':');if(c>=0)a=a.substring(0,c);c=a.indexOf('=');if(c>=0)a"
+"=a.substring(0,c);if(t.substring(0,2)=='s_')t=t.substring(2);return (t!=''&&t==a)};s.fsf=function(t,a){var s=this;if(s.pt(a,',','isf',t))s.fsg+=(s.fsg!=''?',':'')+t;return 0};s.fs=function(x,f){var"
+" s=this;s.fsg='';s.pt(x,',','fsf',f);return s.fsg};s.si=function(){var s=this,i,k,v,c=s_gi+'var s=s_gi(\"'+s.oun+'\");s.sa(\"'+s.un+'\");';for(i=0;i<s.va_g.length;i++){k=s.va_g[i];v=s[k];if(v!=unde"
+"fined){if(typeof(v)!='number')c+='s.'+k+'=\"'+s_fe(v)+'\";';else c+='s.'+k+'='+v+';'}}c+=\"s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';\";return c};s.c_d='';"
+"s.c_gdf=function(t,a){var s=this;if(!s.num(t))return 1;return 0};s.c_gd=function(){var s=this,d=s.wd.location.hostname,n=s.fpCookieDomainPeriods,p;if(!n)n=s.cookieDomainPeriods;if(d&&!s.c_d){n=n?pa"
+"rseInt(n):2;n=n>2?n:2;p=d.lastIndexOf('.');if(p>=0){while(p>=0&&n>1){p=d.lastIndexOf('.',p-1);n--}s.c_d=p>0&&s.pt(d,'.','c_gdf',0)?d.substring(p):d}}return s.c_d};s.c_r=function(k){var s=this;k=s.a"
+"pe(k);var c=' '+s.d.cookie,i=c.indexOf(' '+k+'='),e=i<0?i:c.indexOf(';',i),v=i<0?'':s.epa(c.substring(i+2+k.length,e<0?c.length:e));return v!='[[B]]'?v:''};s.c_w=function(k,v,e){var s=this,d=s.c_gd"
+"(),l=s.cookieLifetime,t;v=''+v;l=l?(''+l).toUpperCase():'';if(e&&l!='SESSION'&&l!='NONE'){t=(v!=''?parseInt(l?l:0):-60);if(t){e=new Date;e.setTime(e.getTime()+(t*1000))}}if(k&&l!='NONE'){s.d.cookie"
+"=k+'='+s.ape(v!=''?v:'[[B]]')+'; path=/;'+(e&&l!='SESSION'?' expires='+e.toGMTString()+';':'')+(d?' domain='+d+';':'');return s.c_r(k)==v}return 0};s.eh=function(o,e,r,f){var s=this,b='s_'+e+'_'+s."
+"_in,n=-1,l,i,x;if(!s.ehl)s.ehl=new Array;l=s.ehl;for(i=0;i<l.length&&n<0;i++){if(l[i].o==o&&l[i].e==e)n=i}if(n<0){n=i;l[n]=new Object}x=l[n];x.o=o;x.e=e;f=r?x.b:f;if(r||f){x.b=r?0:o[e];x.o[e]=f}if("
+"x.b){x.o[b]=x.b;return b}return 0};s.cet=function(f,a,t,o,b){var s=this,r,tcf;if(s.apv>=5&&(!s.isopera||s.apv>=7)){tcf=new Function('s','f','a','t','var e,r;try{r=s[f](a)}catch(e){r=s[t](e)}return "
+"r');r=tcf(s,f,a,t)}else{if(s.ismac&&s.u.indexOf('MSIE 4')>=0)r=s[b](a);else{s.eh(s.wd,'onerror',0,o);r=s[f](a);s.eh(s.wd,'onerror',1)}}return r};s.gtfset=function(e){var s=this;return s.tfs};s.gtfs"
+"oe=new Function('e','var s=s_c_il['+s._in+'],c;s.eh(window,\"onerror\",1);s.etfs=1;c=s.t();if(c)s.d.write(c);s.etfs=0;return true');s.gtfsfb=function(a){return window};s.gtfsf=function(w){var s=thi"
+"s,p=w.parent,l=w.location;s.tfs=w;if(p&&p.location!=l&&p.location.host==l.host){s.tfs=p;return s.gtfsf(s.tfs)}return s.tfs};s.gtfs=function(){var s=this;if(!s.tfs){s.tfs=s.wd;if(!s.etfs)s.tfs=s.cet"
+"('gtfsf',s.tfs,'gtfset',s.gtfsoe,'gtfsfb')}return s.tfs};s.mrq=function(u){var s=this,l=s.rl[u],n,r;s.rl[u]=0;if(l)for(n=0;n<l.length;n++){r=l[n];s.mr(0,0,r.r,r.t,r.u)}};s.flushBufferedRequests=fun"
+"ction(){};s.mr=function(sess,q,rs,ta,u){var s=this,dc=s.dc,t1=s.trackingServer,t2=s.trackingServerSecure,tb=s.trackingServerBase,p='.sc',ns=s.visitorNamespace,un=s.cls(u?u:(ns?ns:s.fun)),r=new Obje"
+"ct,l,imn='s_i_'+(un),im,b,e;if(!rs){if(t1){if(t2&&s.ssl)t1=t2}else{if(!tb)tb='2o7.net';if(dc)dc=(''+dc).toLowerCase();else dc='d1';if(tb=='2o7.net'){if(dc=='d1')dc='112';else if(dc=='d2')dc='122';p"
+"=''}t1=un+'.'+dc+'.'+p+tb}rs='http'+(s.ssl?'s':'')+'://'+t1+'/b/ss/'+s.un+'/'+(s.mobile?'5.1':'1')+'/'+s.version+(s.tcn?'T':'')+'/'+sess+'?AQB=1&ndh=1'+(q?q:'')+'&AQE=1';if(s.isie&&!s.ismac)rs=s.fl"
+"(rs,2047)}if(s.d.images&&s.apv>=3&&(!s.isopera||s.apv>=7)&&(s.ns6<0||s.apv>=6.1)){if(!s.rc)s.rc=new Object;if(!s.rc[un]){s.rc[un]=1;if(!s.rl)s.rl=new Object;s.rl[un]=new Array;setTimeout('if(window"
+".s_c_il)window.s_c_il['+s._in+'].mrq(\"'+un+'\")',750)}else{l=s.rl[un];if(l){r.t=ta;r.u=un;r.r=rs;l[l.length]=r;return ''}imn+='_'+s.rc[un];s.rc[un]++}im=s.wd[imn];if(!im)im=s.wd[imn]=new Image;im."
+"s_l=0;im.onload=new Function('e','this.s_l=1;var wd=window,s;if(wd.s_c_il){s=wd.s_c_il['+s._in+'];s.mrq(\"'+un+'\");s.nrs--;if(!s.nrs)s.m_m(\"rr\")}');if(!s.nrs){s.nrs=1;s.m_m('rs')}else s.nrs++;if"
+"(s.debugTracking){var d='AppMeasurement Debug: '+rs,dl=s.sp(rs,'&'),dln;for(dln=0;dln<dl.length;dln++)d+=\"\\n\\t\"+s.epa(dl[dln]);s.logDebug(d)}im.src=rs;if((!ta||ta=='_self'||ta=='_top'||(s.wd.na"
+"me&&ta==s.wd.name))&&rs.indexOf('&pe=')>=0){b=e=new Date;while(!im.s_l&&e.getTime()-b.getTime()<500)e=new Date}return ''}return '<im'+'g sr'+'c=\"'+rs+'\" width=1 height=1 border=0 alt=\"\">'};s.gg"
+"=function(v){var s=this;if(!s.wd['s_'+v])s.wd['s_'+v]='';return s.wd['s_'+v]};s.glf=function(t,a){if(t.substring(0,2)=='s_')t=t.substring(2);var s=this,v=s.gg(t);if(v)s[t]=v};s.gl=function(v){var s"
+"=this;if(s.pg)s.pt(v,',','glf',0)};s.rf=function(x){var s=this,y,i,j,h,p,l=0,q,a,b='',c='',t;if(x&&x.length>255){y=''+x;i=y.indexOf('?');if(i>0){q=y.substring(i+1);y=y.substring(0,i);h=y.toLowerCas"
+"e();j=0;if(h.substring(0,7)=='http://')j+=7;else if(h.substring(0,8)=='https://')j+=8;i=h.indexOf(\"/\",j);if(i>0){h=h.substring(j,i);p=y.substring(i);y=y.substring(0,i);if(h.indexOf('google')>=0)l"
+"=',q,ie,start,search_key,word,kw,cd,';else if(h.indexOf('yahoo.co')>=0)l=',p,ei,';if(l&&q){a=s.sp(q,'&');if(a&&a.length>1){for(j=0;j<a.length;j++){t=a[j];i=t.indexOf('=');if(i>0&&l.indexOf(','+t.su"
+"bstring(0,i)+',')>=0)b+=(b?'&':'')+t;else c+=(c?'&':'')+t}if(b&&c)q=b+'&'+c;else c=''}i=253-(q.length-c.length)-y.length;x=y+(i>0?p.substring(0,i):'')+'?'+q}}}}return x};s.s2q=function(k,v,vf,vfp,f"
+"){var s=this,qs='',sk,sv,sp,ss,nke,nk,nf,nfl=0,nfn,nfm;if(k==\"contextData\")k=\"c\";if(v){for(sk in v) {if((!f||sk.substring(0,f.length)==f)&&v[sk]&&(!vf||vf.indexOf(','+(vfp?vfp+'.':'')+sk+',')>="
+"0)){nfm=0;if(nfl)for(nfn=0;nfn<nfl.length;nfn++)if(sk.substring(0,nfl[nfn].length)==nfl[nfn])nfm=1;if(!nfm){if(qs=='')qs+='&'+k+'.';sv=v[sk];if(f)sk=sk.substring(f.length);if(sk.length>0){nke=sk.in"
+"dexOf('.');if(nke>0){nk=sk.substring(0,nke);nf=(f?f:'')+nk+'.';if(!nfl)nfl=new Array;nfl[nfl.length]=nf;qs+=s.s2q(nk,v,vf,vfp,nf)}else{if(typeof(sv)=='boolean'){if(sv)sv='true';else sv='false'}if(s"
+"v){if(vfp=='retrieveLightData'&&f.indexOf('.contextData.')<0){sp=sk.substring(0,4);ss=sk.substring(4);if(sk=='transactionID')sk='xact';else if(sk=='channel')sk='ch';else if(sk=='campaign')sk='v0';e"
+"lse if(s.num(ss)){if(sp=='prop')sk='c'+ss;else if(sp=='eVar')sk='v'+ss;else if(sp=='list')sk='l'+ss;else if(sp=='hier'){sk='h'+ss;sv=sv.substring(0,255)}}}qs+='&'+s.ape(sk)+'='+s.ape(sv)}}}}}}if(qs"
+"!='')qs+='&.'+k}return qs};s.hav=function(){var s=this,qs='',l,fv='',fe='',mn,i,e;if(s.lightProfileID){l=s.va_m;fv=s.lightTrackVars;if(fv)fv=','+fv+','+s.vl_mr+','}else{l=s.va_t;if(s.pe||s.linkType"
+"){fv=s.linkTrackVars;fe=s.linkTrackEvents;if(s.pe){mn=s.pe.substring(0,1).toUpperCase()+s.pe.substring(1);if(s[mn]){fv=s[mn].trackVars;fe=s[mn].trackEvents}}}if(fv)fv=','+fv+','+s.vl_l+','+s.vl_l2;"
+"if(fe){fe=','+fe+',';if(fv)fv+=',events,'}if (s.events2)e=(e?',':'')+s.events2}for(i=0;i<l.length;i++){var k=l[i],v=s[k],b=k.substring(0,4),x=k.substring(4),n=parseInt(x),q=k;if(!v)if(k=='events'&&"
+"e){v=e;e=''}if(v&&(!fv||fv.indexOf(','+k+',')>=0)&&k!='linkName'&&k!='linkType'){if(k=='timestamp')q='ts';else if(k=='dynamicVariablePrefix')q='D';else if(k=='visitorID')q='vid';else if(k=='pageURL"
+"'){q='g';v=s.fl(v,255)}else if(k=='referrer'){q='r';v=s.fl(s.rf(v),255)}else if(k=='vmk'||k=='visitorMigrationKey')q='vmt';else if(k=='visitorMigrationServer'){q='vmf';if(s.ssl&&s.visitorMigrationS"
+"erverSecure)v=''}else if(k=='visitorMigrationServerSecure'){q='vmf';if(!s.ssl&&s.visitorMigrationServer)v=''}else if(k=='charSet'){q='ce';if(v.toUpperCase()=='AUTO')v='ISO8859-1';else if(s.em==2||s"
+".em==3)v='UTF-8'}else if(k=='visitorNamespace')q='ns';else if(k=='cookieDomainPeriods')q='cdp';else if(k=='cookieLifetime')q='cl';else if(k=='variableProvider')q='vvp';else if(k=='currencyCode')q='"
+"cc';else if(k=='channel')q='ch';else if(k=='transactionID')q='xact';else if(k=='campaign')q='v0';else if(k=='resolution')q='s';else if(k=='colorDepth')q='c';else if(k=='javascriptVersion')q='j';els"
+"e if(k=='javaEnabled')q='v';else if(k=='cookiesEnabled')q='k';else if(k=='browserWidth')q='bw';else if(k=='browserHeight')q='bh';else if(k=='connectionType')q='ct';else if(k=='homepage')q='hp';else"
+" if(k=='plugins')q='p';else if(k=='events'){if(e)v+=(v?',':'')+e;if(fe)v=s.fs(v,fe)}else if(k=='events2')v='';else if(k=='contextData'){qs+=s.s2q('c',s[k],fv,k,0);v=''}else if(k=='lightProfileID')q"
+"='mtp';else if(k=='lightStoreForSeconds'){q='mtss';if(!s.lightProfileID)v=''}else if(k=='lightIncrementBy'){q='mti';if(!s.lightProfileID)v=''}else if(k=='retrieveLightProfiles')q='mtsr';else if(k=="
+"'deleteLightProfiles')q='mtsd';else if(k=='retrieveLightData'){if(s.retrieveLightProfiles)qs+=s.s2q('mts',s[k],fv,k,0);v=''}else if(s.num(x)){if(b=='prop')q='c'+n;else if(b=='eVar')q='v'+n;else if("
+"b=='list')q='l'+n;else if(b=='hier'){q='h'+n;v=s.fl(v,255)}}if(v)qs+='&'+s.ape(q)+'='+(k.substring(0,3)!='pev'?s.ape(v):v)}}return qs};s.ltdf=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase("
+"):'';var qi=h.indexOf('?');h=qi>=0?h.substring(0,qi):h;if(t&&h.substring(h.length-(t.length+1))=='.'+t)return 1;return 0};s.ltef=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';if(t&&h."
+"indexOf(t)>=0)return 1;return 0};s.lt=function(h){var s=this,lft=s.linkDownloadFileTypes,lef=s.linkExternalFilters,lif=s.linkInternalFilters;lif=lif?lif:s.wd.location.hostname;h=h.toLowerCase();if("
+"s.trackDownloadLinks&&lft&&s.pt(lft,',','ltdf',h))return 'd';if(s.trackExternalLinks&&h.substring(0,1)!='#'&&(lef||lif)&&(!lef||s.pt(lef,',','ltef',h))&&(!lif||!s.pt(lif,',','ltef',h)))return 'e';r"
+"eturn ''};s.lc=new Function('e','var s=s_c_il['+s._in+'],b=s.eh(this,\"onclick\");s.lnk=s.co(this);s.t();s.lnk=0;if(b)return this[b](e);return true');s.bc=new Function('e','var s=s_c_il['+s._in+'],"
+"f,tcf;if(s.d&&s.d.all&&s.d.all.cppXYctnr)return;s.eo=e.srcElement?e.srcElement:e.target;tcf=new Function(\"s\",\"var e;try{if(s.eo&&(s.eo.tagName||s.eo.parentElement||s.eo.parentNode))s.t()}catch(e"
+"){}\");tcf(s);s.eo=0');s.oh=function(o){var s=this,l=s.wd.location,h=o.href?o.href:'',i,j,k,p;i=h.indexOf(':');j=h.indexOf('?');k=h.indexOf('/');if(h&&(i<0||(j>=0&&i>j)||(k>=0&&i>k))){p=o.protocol&"
+"&o.protocol.length>1?o.protocol:(l.protocol?l.protocol:'');i=l.pathname.lastIndexOf('/');h=(p?p+'//':'')+(o.host?o.host:(l.host?l.host:''))+(h.substring(0,1)!='/'?l.pathname.substring(0,i<0?0:i)+'/"
+"':'')+h}return h};s.ot=function(o){var t=o.tagName;if(o.tagUrn||(o.scopeName&&o.scopeName.toUpperCase()!='HTML'))return '';t=t&&t.toUpperCase?t.toUpperCase():'';if(t=='SHAPE')t='';if(t){if((t=='INP"
+"UT'||t=='BUTTON')&&o.type&&o.type.toUpperCase)t=o.type.toUpperCase();else if(!t&&o.href)t='A';}return t};s.oid=function(o){var s=this,t=s.ot(o),p,c,n='',x=0;if(t&&!o.s_oid){p=o.protocol;c=o.onclick"
+";if(o.href&&(t=='A'||t=='AREA')&&(!c||!p||p.toLowerCase().indexOf('javascript')<0))n=s.oh(o);else if(c){n=s.rep(s.rep(s.rep(s.rep(''+c,\"\\r\",''),\"\\n\",''),\"\\t\",''),' ','');x=2}else if(t=='IN"
+"PUT'||t=='SUBMIT'){if(o.value)n=o.value;else if(o.innerText)n=o.innerText;else if(o.textContent)n=o.textContent;x=3}else if(o.src&&t=='IMAGE')n=o.src;if(n){o.s_oid=s.fl(n,100);o.s_oidt=x}}return o."
+"s_oid};s.rqf=function(t,un){var s=this,e=t.indexOf('='),u=e>=0?t.substring(0,e):'',q=e>=0?s.epa(t.substring(e+1)):'';if(u&&q&&(','+u+',').indexOf(','+un+',')>=0){if(u!=s.un&&s.un.indexOf(',')>=0)q="
+"'&u='+u+q+'&u=0';return q}return ''};s.rq=function(un){if(!un)un=this.un;var s=this,c=un.indexOf(','),v=s.c_r('s_sq'),q='';if(c<0)return s.pt(v,'&','rqf',un);return s.pt(un,',','rq',0)};s.sqp=funct"
+"ion(t,a){var s=this,e=t.indexOf('='),q=e<0?'':s.epa(t.substring(e+1));s.sqq[q]='';if(e>=0)s.pt(t.substring(0,e),',','sqs',q);return 0};s.sqs=function(un,q){var s=this;s.squ[un]=q;return 0};s.sq=fun"
+"ction(q){var s=this,k='s_sq',v=s.c_r(k),x,c=0;s.sqq=new Object;s.squ=new Object;s.sqq[q]='';s.pt(v,'&','sqp',0);s.pt(s.un,',','sqs',q);v='';for(x in s.squ)if(x&&(!Object||!Object.prototype||!Object"
+".prototype[x]))s.sqq[s.squ[x]]+=(s.sqq[s.squ[x]]?',':'')+x;for(x in s.sqq)if(x&&(!Object||!Object.prototype||!Object.prototype[x])&&s.sqq[x]&&(x==q||c<2)){v+=(v?'&':'')+s.sqq[x]+'='+s.ape(x);c++}re"
+"turn s.c_w(k,v,0)};s.wdl=new Function('e','var s=s_c_il['+s._in+'],r=true,b=s.eh(s.wd,\"onload\"),i,o,oc;if(b)r=this[b](e);for(i=0;i<s.d.links.length;i++){o=s.d.links[i];oc=o.onclick?\"\"+o.onclick"
+":\"\";if((oc.indexOf(\"s_gs(\")<0||oc.indexOf(\".s_oc(\")>=0)&&oc.indexOf(\".tl(\")<0)s.eh(o,\"onclick\",0,s.lc);}return r');s.wds=function(){var s=this;if(s.apv>3&&(!s.isie||!s.ismac||s.apv>=5)){i"
+"f(s.b&&s.b.attachEvent)s.b.attachEvent('onclick',s.bc);else if(s.b&&s.b.addEventListener)s.b.addEventListener('click',s.bc,false);else s.eh(s.wd,'onload',0,s.wdl)}};s.vs=function(x){var s=this,v=s."
+"visitorSampling,g=s.visitorSamplingGroup,k='s_vsn_'+s.un+(g?'_'+g:''),n=s.c_r(k),e=new Date,y=e.getYear();e.setYear(y+10+(y<1900?1900:0));if(v){v*=100;if(!n){if(!s.c_w(k,x,e))return 0;n=x}if(n%1000"
+"0>v)return 0}return 1};s.dyasmf=function(t,m){if(t&&m&&m.indexOf(t)>=0)return 1;return 0};s.dyasf=function(t,m){var s=this,i=t?t.indexOf('='):-1,n,x;if(i>=0&&m){var n=t.substring(0,i),x=t.substring"
+"(i+1);if(s.pt(x,',','dyasmf',m))return n}return 0};s.uns=function(){var s=this,x=s.dynamicAccountSelection,l=s.dynamicAccountList,m=s.dynamicAccountMatch,n,i;s.un=s.un.toLowerCase();if(x&&l){if(!m)"
+"m=s.wd.location.host;if(!m.toLowerCase)m=''+m;l=l.toLowerCase();m=m.toLowerCase();n=s.pt(l,';','dyasf',m);if(n)s.un=n}i=s.un.indexOf(',');s.fun=i<0?s.un:s.un.substring(0,i)};s.sa=function(un){var s"
+"=this;s.un=un;if(!s.oun)s.oun=un;else if((','+s.oun+',').indexOf(','+un+',')<0)s.oun+=','+un;s.uns()};s.m_i=function(n,a){var s=this,m,f=n.substring(0,1),r,l,i;if(!s.m_l)s.m_l=new Object;if(!s.m_nl"
+")s.m_nl=new Array;m=s.m_l[n];if(!a&&m&&m._e&&!m._i)s.m_a(n);if(!m){m=new Object,m._c='s_m';m._in=s.wd.s_c_in;m._il=s._il;m._il[m._in]=m;s.wd.s_c_in++;m.s=s;m._n=n;m._l=new Array('_c','_in','_il','_"
+"i','_e','_d','_dl','s','n','_r','_g','_g1','_t','_t1','_x','_x1','_rs','_rr','_l');s.m_l[n]=m;s.m_nl[s.m_nl.length]=n}else if(m._r&&!m._m){r=m._r;r._m=m;l=m._l;for(i=0;i<l.length;i++)if(m[l[i]])r[l"
+"[i]]=m[l[i]];r._il[r._in]=r;m=s.m_l[n]=r}if(f==f.toUpperCase())s[n]=m;return m};s.m_a=new Function('n','g','e','if(!g)g=\"m_\"+n;var s=s_c_il['+s._in+'],c=s[g+\"_c\"],m,x,f=0;if(!c)c=s.wd[\"s_\"+g+"
+"\"_c\"];if(c&&s_d)s[g]=new Function(\"s\",s_ft(s_d(c)));x=s[g];if(!x)x=s.wd[\\'s_\\'+g];if(!x)x=s.wd[g];m=s.m_i(n,1);if(x&&(!m._i||g!=\"m_\"+n)){m._i=f=1;if((\"\"+x).indexOf(\"function\")>=0)x(s);e"
+"lse s.m_m(\"x\",n,x,e)}m=s.m_i(n,1);if(m._dl)m._dl=m._d=0;s.dlt();return f');s.m_m=function(t,n,d,e){t='_'+t;var s=this,i,x,m,f='_'+t,r=0,u;if(s.m_l&&s.m_nl)for(i=0;i<s.m_nl.length;i++){x=s.m_nl[i]"
+";if(!n||x==n){m=s.m_i(x);u=m[t];if(u){if((''+u).indexOf('function')>=0){if(d&&e)u=m[t](d,e);else if(d)u=m[t](d);else u=m[t]()}}if(u)r=1;u=m[t+1];if(u&&!m[f]){if((''+u).indexOf('function')>=0){if(d&"
+"&e)u=m[t+1](d,e);else if(d)u=m[t+1](d);else u=m[t+1]()}}m[f]=1;if(u)r=1}}return r};s.m_ll=function(){var s=this,g=s.m_dl,i,o;if(g)for(i=0;i<g.length;i++){o=g[i];if(o)s.loadModule(o.n,o.u,o.d,o.l,o."
+"e,1);g[i]=0}};s.loadModule=function(n,u,d,l,e,ln){var s=this,m=0,i,g,o=0,f1,f2,c=s.h?s.h:s.b,b,tcf;if(n){i=n.indexOf(':');if(i>=0){g=n.substring(i+1);n=n.substring(0,i)}else g=\"m_\"+n;m=s.m_i(n)}i"
+"f((l||(n&&!s.m_a(n,g)))&&u&&s.d&&c&&s.d.createElement){if(d){m._d=1;m._dl=1}if(ln){if(s.ssl)u=s.rep(u,'http:','https:');i='s_s:'+s._in+':'+n+':'+g;b='var s=s_c_il['+s._in+'],o=s.d.getElementById(\""
+"'+i+'\");if(s&&o){if(!o.l&&s.wd.'+g+'){o.l=1;if(o.i)clearTimeout(o.i);o.i=0;s.m_a(\"'+n+'\",\"'+g+'\"'+(e?',\"'+e+'\"':'')+')}';f2=b+'o.c++;if(!s.maxDelay)s.maxDelay=250;if(!o.l&&o.c<(s.maxDelay*2)"
+"/100)o.i=setTimeout(o.f2,100)}';f1=new Function('e',b+'}');tcf=new Function('s','c','i','u','f1','f2','var e,o=0;try{o=s.d.createElement(\"script\");if(o){o.type=\"text/javascript\";'+(n?'o.id=i;o."
+"defer=true;o.onload=o.onreadystatechange=f1;o.f2=f2;o.l=0;':'')+'o.src=u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return o');o=tcf(s,c,i,u,f1,f2)}else{o=new Object;o"
+".n=n+':'+g;o.u=u;o.d=d;o.l=l;o.e=e;g=s.m_dl;if(!g)g=s.m_dl=new Array;i=0;while(i<g.length&&g[i])i++;g[i]=o}}else if(n){m=s.m_i(n);m._e=1}return m};s.voa=function(vo,r){var s=this,l=s.va_g,i,k,v,x;f"
+"or(i=0;i<l.length;i++){k=l[i];v=vo[k];if(v||vo['!'+k]){if(!r&&(k==\"contextData\"||k==\"retrieveLightData\")&&s[k])for(x in s[k])if(!v[x])v[x]=s[k][x];s[k]=v}}};s.vob=function(vo){var s=this,l=s.va"
+"_g,i,k;for(i=0;i<l.length;i++){k=l[i];vo[k]=s[k];if(!vo[k])vo['!'+k]=1}};s.dlt=new Function('var s=s_c_il['+s._in+'],d=new Date,i,vo,f=0;if(s.dll)for(i=0;i<s.dll.length;i++){vo=s.dll[i];if(vo){if(!"
+"s.m_m(\"d\")||d.getTime()-vo._t>=s.maxDelay){s.dll[i]=0;s.t(vo)}else f=1}}if(s.dli)clearTimeout(s.dli);s.dli=0;if(f){if(!s.dli)s.dli=setTimeout(s.dlt,s.maxDelay)}else s.dll=0');s.dl=function(vo){va"
+"r s=this,d=new Date;if(!vo)vo=new Object;s.vob(vo);vo._t=d.getTime();if(!s.dll)s.dll=new Array;s.dll[s.dll.length]=vo;if(!s.maxDelay)s.maxDelay=250;s.dlt()};s.track=s.t=function(vo){var s=this,trk="
+"1,tm=new Date,sed=Math&&Math.random?Math.floor(Math.random()*10000000000000):tm.getTime(),sess='s'+Math.floor(tm.getTime()/10800000)%10+sed,y=tm.getYear(),vt=tm.getDate()+'/'+tm.getMonth()+'/'+(y<1"
+"900?y+1900:y)+' '+tm.getHours()+':'+tm.getMinutes()+':'+tm.getSeconds()+' '+tm.getDay()+' '+tm.getTimezoneOffset(),tcf,tfs=s.gtfs(),ta=-1,q='',qs='',code='',vb=new Object;s.gl(s.vl_g);s.uns();s.m_l"
+"l();if(!s.td){var tl=tfs.location,a,o,i,x='',c='',v='',p='',bw='',bh='',j='1.0',k=s.c_w('s_cc','true',0)?'Y':'N',hp='',ct='',pn=0,ps;if(String&&String.prototype){j='1.1';if(j.match){j='1.2';if(tm.s"
+"etUTCDate){j='1.3';if(s.isie&&s.ismac&&s.apv>=5)j='1.4';if(pn.toPrecision){j='1.5';a=new Array;if(a.forEach){j='1.6';i=0;o=new Object;tcf=new Function('o','var e,i=0;try{i=new Iterator(o)}catch(e){"
+"}return i');i=tcf(o);if(i&&i.next)j='1.7'}}}}}if(s.apv>=4)x=screen.width+'x'+screen.height;if(s.isns||s.isopera){if(s.apv>=3){v=s.n.javaEnabled()?'Y':'N';if(s.apv>=4){c=screen.pixelDepth;bw=s.wd.in"
+"nerWidth;bh=s.wd.innerHeight}}s.pl=s.n.plugins}else if(s.isie){if(s.apv>=4){v=s.n.javaEnabled()?'Y':'N';c=screen.colorDepth;if(s.apv>=5){bw=s.d.documentElement.offsetWidth;bh=s.d.documentElement.of"
+"fsetHeight;if(!s.ismac&&s.b){tcf=new Function('s','tl','var e,hp=0;try{s.b.addBehavior(\"#default#homePage\");hp=s.b.isHomePage(tl)?\"Y\":\"N\"}catch(e){}return hp');hp=tcf(s,tl);tcf=new Function('"
+"s','var e,ct=0;try{s.b.addBehavior(\"#default#clientCaps\");ct=s.b.connectionType}catch(e){}return ct');ct=tcf(s)}}}else r=''}if(s.pl)while(pn<s.pl.length&&pn<30){ps=s.fl(s.pl[pn].name,100)+';';if("
+"p.indexOf(ps)<0)p+=ps;pn++}s.resolution=x;s.colorDepth=c;s.javascriptVersion=j;s.javaEnabled=v;s.cookiesEnabled=k;s.browserWidth=bw;s.browserHeight=bh;s.connectionType=ct;s.homepage=hp;s.plugins=p;"
+"s.td=1}if(vo){s.vob(vb);s.voa(vo)}if((vo&&vo._t)||!s.m_m('d')){if(s.usePlugins)s.doPlugins(s);var l=s.wd.location,r=tfs.document.referrer;if(!s.pageURL)s.pageURL=l.href?l.href:l;if(!s.referrer&&!s."
+"_1_referrer){s.referrer=r;s._1_referrer=1}s.m_m('g');if(s.lnk||s.eo){var o=s.eo?s.eo:s.lnk,p=s.pageName,w=1,t=s.ot(o),n=s.oid(o),x=o.s_oidt,h,l,i,oc;if(s.eo&&o==s.eo){while(o&&!n&&t!='BODY'){o=o.pa"
+"rentElement?o.parentElement:o.parentNode;if(o){t=s.ot(o);n=s.oid(o);x=o.s_oidt}}if(o){oc=o.onclick?''+o.onclick:'';if((oc.indexOf('s_gs(')>=0&&oc.indexOf('.s_oc(')<0)||oc.indexOf('.tl(')>=0)o=0}}if"
+"(o){if(n)ta=o.target;h=s.oh(o);i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h.substring(0,i);l=s.linkName;t=s.linkType?s.linkType.toLowerCase():s.lt(h);if(t&&(h||l)){s.pe='lnk_'+(t=='d'||t=='e'"
+"?t:'o');q+='&pe='+s.pe+(h?'&pev1='+s.ape(h):'')+(l?'&pev2='+s.ape(l):'');}else trk=0;if(s.trackInlineStats){if(!p){p=s.pageURL;w=0}t=s.ot(o);i=o.sourceIndex;if(s.gg('objectID')){n=s.gg('objectID');"
+"x=1;i=1}if(p&&n&&t)qs='&pid='+s.ape(s.fl(p,255))+(w?'&pidt='+w:'')+'&oid='+s.ape(s.fl(n,100))+(x?'&oidt='+x:'')+'&ot='+s.ape(t)+(i?'&oi='+i:'')}}else trk=0}if(trk||qs){s.sampled=s.vs(sed);if(trk){i"
+"f(s.sampled)code=s.mr(sess,(vt?'&t='+s.ape(vt):'')+s.hav()+q+(qs?qs:s.rq()),0,ta);qs='';s.m_m('t');if(s.p_r)s.p_r();s.referrer=s.lightProfileID=s.retrieveLightProfiles=s.deleteLightProfiles=''}s.sq"
+"(qs)}}else s.dl(vo);if(vo)s.voa(vb,1);s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';if(s.pg)s.wd.s_lnk=s.wd.s_eo=s.wd.s_linkName=s.wd.s_linkType='';return code"
+"};s.trackLink=s.tl=function(o,t,n,vo){var s=this;s.lnk=s.co(o);s.linkType=t;s.linkName=n;s.t(vo)};s.trackLight=function(p,ss,i,vo){var s=this;s.lightProfileID=p;s.lightStoreForSeconds=ss;s.lightInc"
+"rementBy=i;s.t(vo)};s.setTagContainer=function(n){var s=this,l=s.wd.s_c_il,i,t,x,y;s.tcn=n;if(l)for(i=0;i<l.length;i++){t=l[i];if(t&&t._c=='s_l'&&t.tagContainerName==n){s.voa(t);if(t.lmq)for(i=0;i<"
+"t.lmq.length;i++){x=t.lmq[i];y='m_'+x.n;if(!s[y]&&!s[y+'_c']){s[y]=t[y];s[y+'_c']=t[y+'_c']}s.loadModule(x.n,x.u,x.d)}if(t.ml)for(x in t.ml)if(s[x]){y=s[x];x=t.ml[x];for(i in x)if(!Object.prototype"
+"[i]){if(typeof(x[i])!='function'||(''+x[i]).indexOf('s_c_il')<0)y[i]=x[i]}}if(t.mmq)for(i=0;i<t.mmq.length;i++){x=t.mmq[i];if(s[x.m]){y=s[x.m];if(y[x.f]&&typeof(y[x.f])=='function'){if(x.a)y[x.f].a"
+"pply(y,x.a);else y[x.f].apply(y)}}}if(t.tq)for(i=0;i<t.tq.length;i++)s.t(t.tq[i]);t.s=s;return}}};s.wd=window;s.ssl=(s.wd.location.protocol.toLowerCase().indexOf('https')>=0);s.d=document;s.b=s.d.b"
+"ody;if(s.d.getElementsByTagName){s.h=s.d.getElementsByTagName('HEAD');if(s.h)s.h=s.h[0]}s.n=navigator;s.u=s.n.userAgent;s.ns6=s.u.indexOf('Netscape6/');var apn=s.n.appName,v=s.n.appVersion,ie=v.ind"
+"exOf('MSIE '),o=s.u.indexOf('Opera '),i;if(v.indexOf('Opera')>=0||o>0)apn='Opera';s.isie=(apn=='Microsoft Internet Explorer');s.isns=(apn=='Netscape');s.isopera=(apn=='Opera');s.ismac=(s.u.indexOf("
+"'Mac')>=0);if(o>0)s.apv=parseFloat(s.u.substring(o+6));else if(ie>0){s.apv=parseInt(i=v.substring(ie+5));if(s.apv>3)s.apv=parseFloat(i)}else if(s.ns6>0)s.apv=parseFloat(s.u.substring(s.ns6+10));els"
+"e s.apv=parseFloat(v);s.em=0;if(s.em.toPrecision)s.em=3;else if(String.fromCharCode){i=escape(String.fromCharCode(256)).toUpperCase();s.em=(i=='%C4%80'?2:(i=='%U0100'?1:0))}if(s.oun)s.sa(s.oun);s.s"
+"a(un);s.vl_l='dynamicVariablePrefix,visitorID,vmk,visitorMigrationKey,visitorMigrationServer,visitorMigrationServerSecure,ppu,charSet,visitorNamespace,cookieDomainPeriods,cookieLifetime,pageName,pa"
+"geURL,referrer,currencyCode';s.va_l=s.sp(s.vl_l,',');s.vl_mr=s.vl_m='charSet,visitorNamespace,cookieDomainPeriods,cookieLifetime,contextData,lightProfileID,lightStoreForSeconds,lightIncrementBy';s."
+"vl_t=s.vl_l+',variableProvider,channel,server,pageType,transactionID,purchaseID,campaign,state,zip,events,events2,products,linkName,linkType,contextData,lightProfileID,lightStoreForSeconds,lightInc"
+"rementBy,retrieveLightProfiles,deleteLightProfiles,retrieveLightData';var n;for(n=1;n<=75;n++){s.vl_t+=',prop'+n+',eVar'+n;s.vl_m+=',prop'+n+',eVar'+n}for(n=1;n<=5;n++)s.vl_t+=',hier'+n;for(n=1;n<="
+"3;n++)s.vl_t+=',list'+n;s.va_m=s.sp(s.vl_m,',');s.vl_l2=',tnt,pe,pev1,pev2,pev3,resolution,colorDepth,javascriptVersion,javaEnabled,cookiesEnabled,browserWidth,browserHeight,connectionType,homepage"
+",plugins';s.vl_t+=s.vl_l2;s.va_t=s.sp(s.vl_t,',');s.vl_g=s.vl_t+',trackingServer,trackingServerSecure,trackingServerBase,fpCookieDomainPeriods,disableBufferedRequests,mobile,visitorSampling,visitor"
+"SamplingGroup,dynamicAccountSelection,dynamicAccountList,dynamicAccountMatch,trackDownloadLinks,trackExternalLinks,trackInlineStats,linkLeaveQueryString,linkDownloadFileTypes,linkExternalFilters,li"
+"nkInternalFilters,linkTrackVars,linkTrackEvents,linkNames,lnk,eo,lightTrackVars,_1_referrer,un';s.va_g=s.sp(s.vl_g,',');s.pg=pg;s.gl(s.vl_g);s.contextData=new Object;s.retrieveLightData=new Object;"
+"if(!ss)s.wds();if(pg){s.wd.s_co=function(o){s_gi(\"_\",1,1).co(o)};s.wd.s_gs=function(un){s_gi(un,1,1).t()};s.wd.s_dc=function(un){s_gi(un,1).t()}}",
w=window,l=w.s_c_il,n=navigator,u=n.userAgent,v=n.appVersion,e=v.indexOf('MSIE '),m=u.indexOf('Netscape6/'),a,i,j,x,s;if(un){un=un.toLowerCase();if(l)for(j=0;j<2;j++)for(i=0;i<l.length;i++){s=l[i];x=s._c;if((!x||x=='s_c'||(j>0&&x=='s_l'))&&(s.oun==un||(s.fs&&s.sa&&s.fs(s.oun,un)))){if(s.sa)s.sa(un);if(x=='s_c')return s}else s=0}}w.s_an='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
w.s_sp=new Function("x","d","var a=new Array,i=0,j;if(x){if(x.split)a=x.split(d);else if(!d)for(i=0;i<x.length;i++)a[a.length]=x.substring(i,i+1);else while(i>=0){j=x.indexOf(d,i);a[a.length]=x.subst"
+"ring(i,j<0?x.length:j);i=j;if(i>=0)i+=d.length}}return a");
w.s_jn=new Function("a","d","var x='',i,j=a.length;if(a&&j>0){x=a[0];if(j>1){if(a.join)x=a.join(d);else for(i=1;i<j;i++)x+=d+a[i]}}return x");
w.s_rep=new Function("x","o","n","return s_jn(s_sp(x,o),n)");
w.s_d=new Function("x","var t='`^@$#',l=s_an,l2=new Object,x2,d,b=0,k,i=x.lastIndexOf('~~'),j,v,w;if(i>0){d=x.substring(0,i);x=x.substring(i+2);l=s_sp(l,'');for(i=0;i<62;i++)l2[l[i]]=i;t=s_sp(t,'');d"
+"=s_sp(d,'~');i=0;while(i<5){v=0;if(x.indexOf(t[i])>=0) {x2=s_sp(x,t[i]);for(j=1;j<x2.length;j++){k=x2[j].substring(0,1);w=t[i]+k;if(k!=' '){v=1;w=d[b+l2[k]]}x2[j]=w+x2[j].substring(1)}}if(v)x=s_jn("
+"x2,'');else{w=t[i]+' ';if(x.indexOf(w)>=0)x=s_rep(x,w,t[i]);i++;b+=62}}}return x");
w.s_fe=new Function("c","return s_rep(s_rep(s_rep(c,'\\\\','\\\\\\\\'),'\"','\\\\\"'),\"\\n\",\"\\\\n\")");
w.s_fa=new Function("f","var s=f.indexOf('(')+1,e=f.indexOf(')'),a='',c;while(s>=0&&s<e){c=f.substring(s,s+1);if(c==',')a+='\",\"';else if((\"\\n\\r\\t \").indexOf(c)<0)a+=c;s++}return a?'\"'+a+'\"':"
+"a");
w.s_ft=new Function("c","c+='';var s,e,o,a,d,q,f,h,x;s=c.indexOf('=function(');while(s>=0){s++;d=1;q='';x=0;f=c.substring(s);a=s_fa(f);e=o=c.indexOf('{',s);e++;while(d>0){h=c.substring(e,e+1);if(q){i"
+"f(h==q&&!x)q='';if(h=='\\\\')x=x?0:1;else x=0}else{if(h=='\"'||h==\"'\")q=h;if(h=='{')d++;if(h=='}')d--}if(d>0)e++}c=c.substring(0,s)+'new Function('+(a?a+',':'')+'\"'+s_fe(c.substring(o+1,e))+'\")"
+"'+c.substring(e+1);s=c.indexOf('=function(')}return c;");
c=s_d(c);if(e>0){a=parseInt(i=v.substring(e+5));if(a>3)a=parseFloat(i)}else if(m>0)a=parseFloat(u.substring(m+10));else a=parseFloat(v);if(a<5||v.indexOf('Opera')>=0||u.indexOf('Opera')>=0)c=s_ft(c);if(!s){s=new Object;if(!w.s_c_in){w.s_c_il=new Array;w.s_c_in=0}s._il=w.s_c_il;s._in=w.s_c_in;s._il[s._in]=s;w.s_c_in++;}s._c='s_c';(new Function("s","un","pg","ss",c))(s,un,pg,ss);return s}
function s_giqf(){var w=window,q=w.s_giq,i,t,s;if(q)for(i=0;i<q.length;i++){t=q[i];s=s_gi(t.oun);s.sa(t.un);s.setTagContainer(t.tagContainerName)}w.s_giq=0}s_giqf()

/************************** INITIAL PAGE VIEW ***********************/
try {
	s=nymag_pageView(reportsuite, s);
	//All subsequent page views are AJAX or "AJAX-like" page views.
	window.nymag.ajaxy = true;
} catch(e) {}