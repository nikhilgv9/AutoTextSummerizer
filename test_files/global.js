if(!window.console){ window.console = {log:function(){}}; }
if(typeof window.nymag == 'undefined') window.nymag = {};
var $nymag_j = $;


//NYMag non-jQuery helper lib
window.nym = {
    hasClass: function(elem,c){ return !(elem.className.match(new RegExp('(^|\\s)'+c+'(\\s|$)')) == null); },
    addClass: function(elem,c){ if(!nym.hasClass(elem,c)) elem.className = elem.className + " " + c; },
    removeClass: function(elem,c){ elem.className = elem.className.replace(new RegExp('(^|\\s)'+c+'(\\s|$)'),""); },
    trim: function(s) { return s.replace(/^[ \t\n]+|[ \t\n]+$/,""); },
    getParameterByName : function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},
    convertToArray: function(obj,classNames){
        var arr = new Array();
        if(classNames) classNames = classNames.split(" ");
        for(i=0; i<obj.length; i++){
            if(typeof classNames == "object"){
                for(j=0;j<classNames.length;j++)
                    if(classNames[j] != "" && obj[i].className && obj[i].className.match(new RegExp('\\b'+classNames[j]+'\\b'))){ arr.push(obj[i]); break; }
            } else {
                arr.push(obj[i]);
            }
        }
        return arr;
    },
    extend: function(s,o){
        for(n in o){
            if(o[n] !== undefined )
                s[n] = o[n]
        }
        return s;
    },
    serialize: function(elem) {
        var inputs = nym.convertToArray(elem.getElementsByTagName("input"));
        var rVal="";
        for(var i=0; i<inputs.length; i++){
            if(inputs[i].getAttribute("type") != "image" && inputs[i].getAttribute("type") != "submit"){
                if(i!=0) rVal += "&";
                rVal += inputs[i].name + "=" + inputs[i].value.replace(/ /g,"+");
            }
        }
        return rVal;
    },
    loadAJAX: function(url,elem,callback){
    	var AJAX;
     	try {  
      		AJAX = new XMLHttpRequest(); 
     	} catch(e) {  
      		try {    
       			AJAX = new ActiveXObject("Msxml2.XMLHTTP");    
      		} catch(e) {    
       			try {
        			AJAX = new ActiveXObject("Microsoft.XMLHTTP");      
       			} catch(e) {      
        			return false;      
       			}    
      		}  
     	}

     	AJAX.onreadystatechange = function() {
      		if(AJAX.readyState == 4) {
       			if(AJAX.status == 200) {
        			elem.innerHTML = AJAX.responseText;

					if(callback){
						callback();
						return false;
					}

    			} else {
       			}
      		}  
     	}
     	AJAX.open("get", url, true);
     	AJAX.send(null);
    },
    origValidate: function(elem, o){
        o = nym.extend({
            form: null,
            errorMsg: false,
            origText: true,
            searchText: null,
            onSubmit: null,
            onError: null
        }, o || {});

        if(!elem) return;
        if(!o.searchText) o.searchText=elem.value;
        if (o.form) {
            o.form.onsubmit = function () {
                if ((elem.value != o.searchText) && (o.errorMsg ? (elem.value != o.errorMsg) : true)) {
                    if (typeof o.onSubmit == "function") {
                        return o.onSubmit.call(elem, elem.form);
                    } else {
                        return true;
                    }
                } else {
                    if (typeof o.onError == "function") {
                        var msg = o.errorMsg ? o.errorMsg : "";
                        o.onError.call(this, elem, msg);
                    } else if (o.errorMsg) {
                        nym.addClass(elem,"error");
                        elem.value = o.errorMsg;
                    }
                    return false;
                }
            };
        }
        if (o.origText) {
            elem.onfocus = function () {
                elem.value = ((elem.value == o.searchText) || (elem.value == o.errorMsg)) ? '' : elem.value;
                if (o.errorMsg) nym.removeClass(elem,"error");
            };
            elem.onblur = function () {
                elem.value = (elem.value == '') ? o.searchText : elem.value;
            };
            elem.value = o.searchText;
        }
    },
    loader: {
		init: function(a) {
		    var initStart = this.all.length;
			for(selector in a){
				var func = a[selector];
				this.all.push({"selector":selector,"func":func,"completed":false});
			}

			if(!this.on){ this.on=true; this.check(initStart); }
    	},
		check: function(curr){
			this.count++;
		    if(curr==this.all.length) curr=0;
		    while(this.all[curr].completed){
		        curr++;
		        if(curr==this.all.length) curr=0;
		    }
		    
		    node = document.getElementById(this.all[curr].selector.substring(1));
			while(node && !node.nextSibling){
				node = node.parentNode;
			}
			if(node && node.nextSibling){
				if(typeof this.all[curr].func != "undefined"){
				    if(typeof this.all[curr].func == "function") this.all[curr].func.call();
				    else this.all[curr].func.func.call(this.all[curr].func.context);

				    this.all[curr].completed=true;
				    this.completed++;
				}
			}
			if(this.completed != this.all.length && this.on) this.initTimer = setTimeout("nym.loader.check(" + (curr+1) + ")",1);
			else this.on = false
			delete node;
		},
		kill: function(){ clearTimeout(this.initTimer); this.on=false; },
		all: new Array(),
		count: 0,
		on: false,
		initTimer: "",
		completed:0
	},
	echo: {
    apiKey: function() {
      var currDomain = window.nymag.domains.domain;
      var key="";
			if (currDomain.indexOf("dev.") > -1 || currDomain.indexOf("stg.") > -1 || currDomain.indexOf("qa.") > -1) {
	       			key = "dev.nymag.com";
			} else {
	       			key = "prod.nymag.com";
			}
			return key;
		},
    loadCommentTouts: function (o) {
      o = $.extend({
        threshold: 1,
        displayLink: false,
        template: "",
        permalink: "",
        start: 0
      }, o || {});
      
      if($.browser.msie) {
        var muxEnd = o.start + 4;
      } else {
        var muxEnd = o.start + 10;
      }
      
      var entryTotal = $('.entry').length;
      if (o.template == "vulture") { entryTotal = $('.tout').length; }
      if (o.template == "nym-home") { entryTotal = $('i.info .comments-count').length; }
      var commentCounts = new Array();
      var queryStr = 'childrenof:';
      var domain = 'http://api.echoenabled.com/v2/mux';
      var appkey = "appkey=" + nym.echo.apiKey();
      var method = '"method":"count",';
      var queryFilters = " type:comment -state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned";
	        
      
	        
	    // vulture comment counts
      if (o.template == "vulture") {
        $('a.tout').each(function (x, end) {
          var domain = window.nymag.domains.domain;
          x = parseFloat(x);
          if (x == muxEnd) {
            return false;
          }
          
          if ($(this).attr('href') && !$(this).hasClass("mux")) {
            var echoCountId = 'echo-count-' + x;
            $(this).addClass(echoCountId).addClass("mux");
            var id = '"id":"' + echoCountId + '",';
            var blogPermaLink = $(this).attr('href');
            var hashMark = blogPermaLink.indexOf("#");
            if (hashMark != -1) { blogPermaLink = blogPermaLink.substring(0,hashMark); }
            blogPermaLink = blogPermaLink.substring(0,hashMark)
            if (blogPermaLink.indexOf("http") == -1) { blogPermaLink = (domain + blogPermaLink); } 

            if(blogPermaLink.match("vulture.com")) {
              blogPermaLink = blogPermaLink.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
            } else if(blogPermaLink.match("/daily/intelligencer/")) {
              blogPermaLink = blogPermaLink.replace("/daily/intelligencer/", "/daily/intel/");
            } else if(blogPermaLink.match("/thecut/")) {
              blogPermaLink = blogPermaLink.replace("/thecut/", "/daily/fashion/");
            }

            var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
            commentCounts.push(commentQuery);
          }
        });   
          
      // nymag homepage comment counts
      } else if (o.template == "nym-home") {	
	        
        $('i.info .comments-count').each(function (x, end) {
          var domain = window.nymag.domains.domain;
          x = parseFloat(x);
          if (x == muxEnd) {
            return false;
          }
          if (!$(this).hasClass("mux") || !$(this).parents(".mux")) {
            var echoCountId = 'echo-count-' + x;
            $(this).addClass(echoCountId).addClass("mux");
            var id = '"id":"' + echoCountId + '",';
            var blogPermaLink;
            blogPermaLink = $(this).parent().prev("a").attr("href");
            if (!blogPermaLink) { 
              if ($(this).parents(".unit").hasClass("feature")) { blogPermaLink = $(this).parents(".unit").find("a").attr("href"); }
              if (!blogPermaLink) {
                blogPermaLink = "http://nymag.com/none/";	
              }
            }

            if(blogPermaLink.match("vulture.com")) {
              blogPermaLink = blogPermaLink.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
            } else if(blogPermaLink.match("/daily/intelligencer/")) {
              blogPermaLink = blogPermaLink.replace("/daily/intelligencer/", "/daily/intel/");
            } else if(blogPermaLink.match("/thecut/")) {
              blogPermaLink = blogPermaLink.replace("/thecut/", "/daily/fashion/");
            }

            $(this).attr("data-permalink", blogPermaLink)
            var hashMark = blogPermaLink.indexOf("#");
            if (hashMark != -1) { blogPermaLink = blogPermaLink.substring(0,hashMark); }
            if (blogPermaLink.indexOf("http") == -1) { blogPermaLink = (domain + blogPermaLink); } 
            
            blogPermaLink = blogPermaLink.replace(nymag.domains.domain,nymag.domains.domain.match("vulture.com")?"http://nymag.com/daily/entertainment":nymag.domains.domain);
            var commentQueary = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
            commentCounts.push(commentQuery);
	                
          }
        });      

      } else {
        
        $('.entry').each(function (x, end) {
          var domain = window.nymag.domains.domain;
          x = parseFloat(x);
          if (x == muxEnd) {
            return false;
          }
          if ($(this).attr('data-permalink') && !$(this).hasClass("mux")) {
            var echoCountId = 'echo-mcount-' + x;
            $(this).addClass(echoCountId).addClass("mux");;
            var id = '"id":"' + echoCountId + '",';
            var blogPermaLink = $(this).attr('data-permalink');
            if (blogPermaLink.indexOf("http") == -1) { blogPermaLink = domain + blogPermaLink; }

            if(blogPermaLink.match("vulture.com")) {
              blogPermaLink = blogPermaLink.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
            } else if(blogPermaLink.match("/daily/intelligencer/")) {
              blogPermaLink = blogPermaLink.replace("/daily/intelligencer/", "/daily/intel/");
            } else if(blogPermaLink.match("/thecut/")) {
              blogPermaLink = blogPermaLink.replace("/thecut/", "/daily/fashion/");
            }
                  
            var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
            commentCounts.push(commentQuery);
          }
        });	        
      }


      if (o.permalink != "") {
        var echoCountId = 'echo-count-1';
        $("." + echoCountId).attr("data-permalink", o.permalink + "comments.html");
        var id = '"id":"' + echoCountId + '",';
        var blogPermaLink = o.permalink;
        blogPermaLink = blogPermaLink.replace(nymag.domains.domain,nymag.domains.domain.match("vulture.com")?"http://nymag.com/daily/entertainment":nymag.domains.domain);
        var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
        commentCounts.push(commentQuery);
      }

      commentCounts = commentCounts.join('},{');
      var urlQuery = domain + '?' + appkey + '&requests=[{' + commentCounts + '}]&callback=?';
      urlQuery = encodeURI(urlQuery);
      $.getJSON(urlQuery, function (data) {
        $.each(data, function (i) {
          var permalink = $("." + i).attr("data-permalink").replace("http://nymag.com/daily/entertainment",nymag.domains.domain.match("vulture.com")?nymag.domains.domain:"http://nymag.com/daily/entertainment");
          if ($("body").hasClass("individual-entry-archive")) { permalink = ""; }
          var countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>";
          if (o.template == "vulture" || o.template == "nym-home") { countText = this.count; }
          if (o.displayLink) {
            if (this.count == 0) {
              if (o.template == "articles-truncated") {
                countText = "Add Comment";
              } else {
                countText = "Comment";
              }
            } else if (this.count == 1) {
              countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>Comment";
            } else {
              countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>Comments";
            }
            $("." + i + " .comment-tout").html("<span><a class=\'extra\' href=\'" + permalink + "#comments\'>" + countText + "</a></span>");
          } else {
            if (this.count >= o.threshold) {
              if (o.template == "vulture") {
                $("." + i + " .article_comment_count").html(countText).show();
              } else if (o.template == "nym-home") {
                $("." + i).append("<a class=\'comment-count\' href=\'" + permalink + "#comments\'><i>" + countText + "</i></a>").show();
              } else {
                $("." + i + " .comment-tout").html("<span><a class=\'extra\' href=\'" + permalink + "#comments\'>" + countText + "</a></span>");	
              }
            }
          }
        });
      });
      
      if (muxEnd < entryTotal) {
        this.loadCommentTouts({
          start: muxEnd,
          displayLink: o.displayLink,
          threshold: o.threshold,
          template: o.template,
          permalink: o.permalink.replace(nymag.domains.domain,nymag.domains.domain.match("vulture.com")?"http://nymag.com/daily/entertainment":nymag.domains.domain)
        });
      }
    },
    
    loadMostCommented: function(o) {
        o = $.extend({
          domain:"(scope:http://www.nymag.com/*)",
          timeframe: "3 days ago",
          elementId: "most-commented ul",
          section: "source:DailyIntel,TheCut,TheSportsSection,Vulture,NewYorkMagazine,GrubStreetBoston,GrubStreetChicago,GrubStreetLosAngeles,GrubStreetNewYork,GrubStreetPhiladelphia,GrubStreetSanFrancisco",
          items: 5,
          dot: "."
          }, o || {});
          
        if($.browser.msie) {
          var asplit = 3;
        } else {
          var asplit = 10;
        }
        
        $("#"+o.elementId).parents("#most-commented").addClass("loading");
        
        var appkey = "appkey=" + nym.echo.apiKey();
        
			// temporaraly setting everythign to 3 days
        o.timeframe = "3 days ago";
        var urlQuery = "http://api.echoenabled.com/v1/search?q=";
            urlQuery += o.domain;
            urlQuery += " type:article sanitizeHTML:false";
            urlQuery += " after:\'" + o.timeframe + "\'";
            urlQuery += " source:" + o.section;
            urlQuery += " -state:ModeratorDeleted sortOrder:repliesDescending itemsPerPage:20 children:0";
            urlQuery += " &" + appkey;
            urlQuery += "&callback=?";
        
        var articleList = new Array();
        var queryStr = 'childrenof:';
        var domain = 'http://api.echoenabled.com/v2/mux';
        var method = '"method":"count",';
        var queryFilters = " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)";
        var muxList = new Array();
        $("#" + o.elementId).empty();

        $.getJSON(urlQuery, function (data) {
          $.each(data.entries, function(i,x) {
            var article = {};
            article.div = "mc-" + i;
            article.url = x.object.id;
            article.title = x.object.title;
            articleList.push(article);      
          });
            	
          $.each(articleList, function(index, value) {
            var id = '"id":"' + index + '",';
            var blogPermaLink = value.url.replace("http://vulture.com","http://www.vulture.com").replace("www.vulture.com","nymag.com/daily/entertainment");
            var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
            muxList.push(commentQuery);
          });

          var muxCalls = muxList.length/asplit;
          muxCalls = parseInt(muxCalls) + 1;
          
          function nextCall(i) {
            if (i < muxCalls) {
              var smallMux = muxList.slice(i*asplit,(i+1)*asplit);
              smallMux = smallMux.join('},{');
              var muxQuery = domain + '?' + appkey + '&requests=[{' + smallMux + '}]';
              muxQuery = encodeURI(muxQuery);
              
              $.ajax({url:muxQuery,
                dataType:"jsonp",
                type: "GET",
                success: function(data) {
                  $.each(data, function(i,x) {
                    if (x.count >=0) { articleList[i].commentCount = x.count;}  
                  });
                },
                complete: function() {
                  nextCall(i+1);
                  if (i+1 == muxCalls) {
                    loadMC();
                  }
                }
              });
            }
          }
          nextCall(0);

          function loadMC() {
            articleList = articleList.sort(nym.echo.sortNumber);
            $.each(articleList, function(i,x) {
              if (i==o.items) { return false; }
              var num = i+1,listClass = "";
              
              if(num == o.items) { listClass = "last"; }
              x.url = x.url.replace("http://nymag.com/daily/entertainment","http://www.vulture.com");
              x.url = x.url.replace("http://vulture.com","http://www.vulture.com");

              $("#"+o.elementId).parents("#most-commented").removeClass("loading");
              $("#" + o.elementId).append("<li id=\'number-"+num+"\' class="+listClass+"><span class=\'num\'>"+num+o.dot+"</span><a class=\'hed\' href=\'" + x.url + "\'>" + x.title + "</a>  <a href=\'" + x.url + "\' class=\'tout\'><strong class=\'article_comment_count\'>" + x.commentCount + "</strong></a>");
            });

          }
        });
      },
	    sortNumber: function(a,b) {
	    	return b.commentCount - a.commentCount;
	    }
    }
  }


//addClickEvent takes an object and a function and returns void
//		its purose is to safely add a onclick event handled by function func to the thing object
function addClickEvent(thing, func) {
    if(!thing) return;
	var oldclick = thing.onclick;
	if(typeof thing.onclick != 'function') {
		thing.onclick = func;
	} else {
		thing.onclick = function() {
			oldclick();
			func();
		}
	}
}

function addHoverEvent(elem, funcIn, funcOut) {
	var oldmouseover = elem.onmouseover, oldmouseenter = elem.onmouseenter, oldmouseleave = elem.onmouseleave, oldmouseout = elem.onmouseout;

    if(typeof funcIn == 'function'){
        elem.onmouseover = function(e){
            if (!e) var e = window.event;
            var parent = e.relatedTarget || e.fromElement;
        	try {
        		// Traverse up the tree
        		while ( parent && parent != elem ) {
        			parent = parent.parentNode;
        		}

        		if ( parent != elem ) {
        			if(typeof oldmouseover == 'function') oldmouseover();
            	    funcIn();
        		}
        	} catch(e) { }
        }
    }
    
    if(typeof funcOut == 'function'){
    	elem.onmouseout = function(e){
    	    if (!e) var e = window.event;
        	var parent = e.relatedTarget || e.toElement;
        	try {
        		// Traverse up the tree
        		while ( parent && parent != elem ) {
        			parent = parent.parentNode;
        		}

        		if ( parent != elem ) {
        			if(typeof oldmouseout == 'function') oldmouseout();
            	    funcOut();
        		}
        	} catch(e) { }
     	}
    }
}

function setMYNYDropdownWidth() {
	// DROPDOWN WIDTH
	$('body.vulture #utilities #logged_in_bar .mynewyork').css("width", "auto");
	$('body.politics #utilities #logged_in_bar .mynewyork').css("width", "auto");	

	var dropdownWidth = $('body.vulture #utilities #logged_in_bar .mynewyork').width() || $('body.politics #utilities #logged_in_bar .mynewyork').width();
	if ( dropdownWidth > 50 && dropdownWidth < 120 ) { 
		dropdownWidth = 120;
		// $('#utilities #logged_in_bar .mynewyork').css("width", dropdownWidth + "px");	
	}				
	$('body.vulture #sub_nav_mynewyork ul').css("width", dropdownWidth + "px");
	$('body.politics #sub_nav_mynewyork ul').css("width", dropdownWidth + "px");
}

window.nymag.nav = {
	set: function(){
	    var navPrimary = document.getElementById("nav-primary");
	    var navSecondary = document.getElementById("nav-secondary");
        var utilities = document.getElementById("utilities");
        
        if(navPrimary){
            navPrimary = nym.convertToArray(navPrimary.getElementsByTagName("li"),"top");
            for(i=0; i<navPrimary.length; i++)
                this.hover(navPrimary[i],true);            
        }
        if(navSecondary){
            navSecondary = nym.convertToArray(navSecondary.getElementsByTagName("li"),"top");            
            for(i=0; i<navSecondary.length; i++)
                this.hover(navSecondary[i],false);
        }
        if(utilities){
            utilities = nym.convertToArray(utilities.getElementsByTagName("li"),"top mynewyork");            
            for(i=0; i<utilities.length; i++)
                this.hover(utilities[i],false);            
        }

        var clickFunc = function(e){
            if((e.target.nodeName=="A") && (e.target.href.match(nymag.domains.domain)))
                e.target.href = e.target.href.replace(nymag.domains.domain,"http://"+nymag.domains.cookie.substring(1));
        };
        addClickEvent(document.getElementById("nav"),clickFunc);
        addClickEvent(document.getElementById("utilities"),clickFunc);
	},
	hover: function(elem, delay){
		

		
		addHoverEvent(elem,
			function(){
				nym.addClass(elem,"hover");
				mID = elem.getElementsByTagName("div")[0].id;

				if(elem.id=="ny-sitemap") nym.addClass(elem,"open");				
				if(delay){
					window.nymag.nav.navTimer = setTimeout("window.nymag.nav.showNav('" + mID + "')",150);
					
				} else{
					window.nymag.nav.showNav(mID);
				}


			},
			function(){
			    clearTimeout(window.nymag.nav.navTimer);
				if(elem.id=="ny-sitemap") nym.removeClass(elem,"open");
				nym.removeClass(elem,"hover");
				elem.getElementsByTagName("div")[0].style.left="-1000em";
			}
		);
	},
	showNav: function(id){
		var m=document.getElementById(id);
		m.style.left="auto";
		if(!nym.trim(m.innerHTML).length) nym.loadAJAX("/includes/components/mast/nav/" + m.id + ".txt",m, function() {
			// DROPDOWN WIDTH
			setMYNYDropdownWidth();
        	addClickEvent(document.getElementById("ny-sitemap-content"),clickTrackr);
						
		});

		
		// DROPDOWN WIDTH
		setMYNYDropdownWidth();
	},
	navTimer: ""
}

window.nymag.search = {
	set: function(){
		var txtSearch = document.getElementById("txt-ny-search");
		txtSearch.setAttribute("autocomplete","off");
		nym.origValidate(txtSearch,{"form":document.getElementById("ny-search"),"errorMsg":"Search"});
		this.setDropdown();
	},
	setDropdown: function(){
	    if(jQuery && !this.dropdown){
	        var s = this;
	        
		    $("#ny-search").hover(
		        function(){ clearTimeout(s.searchTimer); },
    			function(){ s.searchTimer = setTimeout("window.nymag.search.hideSearch()",500); }
    		);
		    
		    var i = $("#search-scope").css("height","auto").children().hide().find("input:radio").focus(function(){ $("#txt-ny-search").focus }); 
		    $("#txt-ny-search").focus(function(e){
    			this.click();
    		}).click(function(e){
    			nym.addClass(document.getElementById("ny-search"),"focus");
    			$("#search-scope").children().slideDown(250);
    		}).keydown(function(e){
    			var key = e.keyCode;
    			if(e.keyCode == 40){
    				s.curr_radio = (s.curr_radio == i.length-1) ? 0 : s.curr_radio+1;
    				i[s.curr_radio].click().focus();
    			} else if(e.keyCode == 38) {
    				s.curr_radio = (s.curr_radio == 0) ? i.length-1 : s.curr_radio-1;
    				i[s.curr_radio].click().focus();
    			}
    		});
    		this.dropdown = true;
		}
	},
	hideSearch: function(){
	    $("#search-scope").children().slideUp(400,function(){ $("#ny-search").removeClass("focus"); });
	},
	searchTimer: "",
	curr_radio: 0,
	dropdown: false
}

window.nymag.skinTakeover = {
	init: function(){
		ads = new Array();
		ads['schedule'] = new Array();
		addTS = new Date().getTime();
	},
	set: function(){
		
		var location = window.location;
		var domain = document.domain;
		
		for(var i=0; i<ads['schedule'].length; i++){			

			sD = new Date(ads['schedule'][i].start);
			eD = new Date(ads['schedule'][i].end);
		
			var validURL = false;
			if(ads['schedule'][i].location != undefined){
				
				var host = location.host;
				var path = location.pathname;
				var currentLoc = host + path;

				if( currentLoc.match( ads['schedule'][i].location ) ){
					validURL = true;
				}
				
			} else if(ads['schedule'][i].blog != undefined) {
					
				if(location.pathname.match("/daily/" + ads['schedule'][i].blog) || domain.match(ads['schedule'][i].blog)){
				
					if(document.getElementsByName('content.type').length){
						validURL = document.getElementsByName('content.type')[0].content == "Index" ? true : false;
						validURL = document.getElementsByName('content.type')[0].content == "Homepage" ? true : validURL;
					}

					if(document.getElementsByName('content.subtype').length){
						validURL = document.getElementsByName('content.subtype')[0].content == "Blog Index" ? true : validURL;
						validURL = document.getElementsByName('content.subtype')[0].content == "Blog Homepage" ? true : validURL;
					}
				
				}
			
			}

			if(currDate >= sD && currDate < eD && validURL){

				window.nymag.dcads.takeover = true;

				var NYM_linkStyle = "";
				var NYM_altLinkStyle = "";
				var NYM_takeoverPadding = "";
	
				document.write("<style>");

				if(location.pathname.match("/daily/entertainment") || domain.match("vulture")){
					
					//takeover styles specific to Vulture
					$(document).ready(function(){$("#wrap-wrap").addClass("skin-takeover")});
					if(ads['schedule'][i].padding){
						NYM_takeoverPadding = ads['schedule'][i].padding;
					}else{
						NYM_takeoverPadding = "173px";
					}
					document.write("body{padding-top:" + NYM_takeoverPadding + ";background: transparent url(" + ads['schedule'][i].background + ") no-repeat center top;}");
					document.write("#wrap{background:#fff url(http://cache.nymag.com/gfx/sect/vulture/body-bg.png) repeat-x;}");
					document.write("#wrap-wrap{padding-top:7px;background: transparent url(http://cache.nymag.com/gfx/sect/vulture/skinTakeover-bg.png) no-repeat center top;}");
				
				} else if(domain.match("grubstreet")){
				
					//takeover styles specific to Grubstreet
					$(document).ready(function(){$("#wrap-wrap").addClass("skin-takeover")});
					if(ads['schedule'][i].padding){
						NYM_takeoverPadding = ads['schedule'][i].padding;
					}else{
						NYM_takeoverPadding = "173px";
					}
					document.write("body{padding-top:" + NYM_takeoverPadding + ";background: transparent url(" + ads['schedule'][i].background + ") no-repeat center top;}");
					document.write("#wrap{background:#fff url(http://cache.nymag.com/gfx/grubst/body-bg.png) repeat-x;padding-top:25px;}");
					document.write(".grubstreet-home #wrap{padding-top:17px;}");
					document.write("#wrap-wrap{padding-top:7px;background: transparent url(http://cache.nymag.com/gfx/grubst/skinTakeover-bg.png) no-repeat center top;}");

				
				} else {
					//all other NYMAG blogs

					if(ads['schedule'][i].padding){
						NYM_takeoverPadding = ads['schedule'][i].padding;
					}else{
						NYM_takeoverPadding = "180px";
					}
					document.write("body{padding-top:" + NYM_takeoverPadding + ";background: transparent url(" + ads['schedule'][i].background + ") no-repeat center top;}");
					document.write("#wrap-wrap{background:transparent url(http://cache.nymag.com/gfx/bg/skinTakeover-bg.png) no-repeat center -7px} #wrap{border-top:none}");
				}
				
				if(ads['schedule'][i].padding) {NYM_takeoverPadding = ads['schedule'][i].padding }
				if(ads['schedule'][i].link_style) {NYM_linkStyle = ads['schedule'][i].link_style }
				if(ads['schedule'][i].altLink_style){NYM_altLinkStyle = ads['schedule'][i].altLink_style }
			
				document.write("#wrap p a.skinTakeoverLink {background: url(http://cache.nymag.com/gfx/px/x.gif)repeat;text-indent:-9999px;display:block;position:absolute;cursor:pointer;}");
				document.write("#wrap p a.skinTakeoverLink:hover {text-decoration:none;}");
				document.write("#wrap p a.ad_link {top:-181px;left:0px;width:980px;height:180px;" + NYM_linkStyle + "}");
				document.write("#wrap p a.altLink {z-index:100;" + NYM_altLinkStyle + " }");
				
				document.write("</style>");
	
				ads['schedule'].curr = i;
				$(function(){
					var currAd = ads['schedule'].curr;
					if(ads['schedule'][currAd].tracking){$("#tracking").append("<img src='" + ads['schedule'][currAd].tracking + "' />");}
					if(ads['schedule'][currAd].link){$("#wrap").prepend("<p><a class='skinTakeoverLink ad_link' href='" + ads['schedule'][currAd].link + "'>Click Here to Follow Url</a></p>");}
					if(ads['schedule'][currAd].altLink){$("#wrap").prepend("<p><a class='skinTakeoverLink altLink' href='" + ads['schedule'][currAd].altLink + "'>Click Here to Follow Url</a></p>");}
				});
				break;

			}
		}
	}
}
window.nymag.skinTakeover.init();

/*-  Sitewide Search Widget Script (for site navigation 2008)
----------------------------------------------------------------------*/
function swapSearchType( widget_name, search_type ) {
    var searchWidget = document.getElementById( widget_name );
    
    if (search_type == 'all') {
        searchWidget.action = "http://nymag.com/search/search.cgi";
        searchWidget.search_type.value = 'sw';
        searchWidget.N.value = 0;
    }
    
    
    if (search_type == 'magazine') {
        searchWidget.action = "/search/search.cgi";
        searchWidget.search_type.value = 'sw';
        searchWidget.N.value = 22;
    }
    
    if (search_type == 'blog') {
        searchWidget.action = "/search/search.cgi";
        searchWidget.search_type.value = 'sw';
        searchWidget.N.value = 23;
    }
    
    if (search_type == 'vulture') {
        searchWidget.action = "http://nymag.com/search/search.cgi";
        searchWidget.search_type.value = 'sw';
        searchWidget.N.value = 272;
    }
    
    if (search_type == 'restaurant' || 
        search_type == 'bar' ||
        search_type == 'hotel' ||
        search_type == 'event' ||
        search_type == 'attraction' ||
        search_type == 'beauty_fitness' ||
        search_type == 'business_shopping' ||
        search_type == 'movie' 
    ) {
        searchWidget.action = "/search/search.cgi";
        searchWidget.search_type.value = search_type;
    }

    if (search_type == 'movie') {
        searchWidget.fd.value = 'name';
    }
}

function swapSearchTop( search_type ) {
    swapSearchType( 'ny-search', search_type );
}

function swapSearchBottom( search_type ) {
    swapSearchType( 'sitewide-bottom-widget-form', search_type );
}


/*
	Add Load Event (aka "Simon Willison is a rockstar")
*/
function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

//addMouseoverEvent takes an object and a function and returns void
//		its purose is to safely add a onmouseover event handled by function func to the thing object
function addMouseoverEvent(thing, func) {
	var oldmouseover = thing.onmouseover;
	if(typeof thing.onmouseover != 'function') {
		thing.onmouseover = func;
	} else {
		thing.onmouseover = function() {
			oldmouseover();
			func();
		}
	}
}

// detect Mobile OS w/ Touch UI
function detectTouchUI(){
	var e = $(document.documentElement);
	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){e.addClass("iOS touchUI");}
	else if (navigator.userAgent.match(/Android/i)){e.addClass("android touchUI");}
	else if (navigator.userAgent.match(/webOS/i)){e.addClass("webOS touchUI");}
}

window.nymag.set = function(){
	detectTouchUI();
	$("html").addClass("can-has-js");
	window.nymag.domains.set();
	window.nymag.dcads.set();
	$(function (){
		//window.nymag.dcads.fix_target_creatives();
		window.nymag.dcads.set_data();
		nymag_subscriptionsByChannel();
	});
}

window.nymag.randomSet = {
 random: 0
};

window.nymag.domains = {
	set: function(){
		var domainLevels = document.domain.split(".")
		this.prod = ((document.domain.search(/nymag\.com/) >= 0) || (document.domain.indexOf("www.vulture.") > -1)) ? true : false;
		var subDomain = false;
		var domain = "";


		if(domainLevels.length >= 3 && this.prod) subDomain = 2;
		else if(domainLevels.length > 3) subDomain = 3;		
		if(subDomain){
			for(var i=domainLevels.length-subDomain; i<=domainLevels.length-1; i++ ){
				domain += domainLevels[i];
				if(i!=domainLevels.length-1) domain += ".";
			}			
		} else {
			domain = document.domain;
		}
		this.domain = "http://" + document.domain;
		//console.log("this domain" + this.domain + " domain: " + domain);
		this.cookie = "." + domain.replace("www.","");
		//this.secure = domain.match("vulture.com") ? "https://"+domain.replace("www","secure") : "https://secure." + domain;
		this.secure = (this.prod && nymag.domains.domain.match('vulture')) ? "https://secure.vulture.com" : "https://secure." + domain;
		// console.log("secure "+this.secure);
		this.my = "http://my." + domain.replace("www.","").replace("vulture.com",(domain.indexOf("dev.") > -1 || domain.indexOf("stg.") > -1 || domain.indexOf("qa.") > -1) ? "nymetro.com" : "nymag.com");
		this.myfashion = "http://myfashion." + domain;
	},
	domain: "",
	secure:"",
	my:"",
	myfashion:"",
	prod: false
}

window.nymag.dcads = {
	set: function(){
		this.levels = this.get_url_levels(document.location.pathname.replace("//","/"));
		this.type = (document.getElementsByName('content.type').length) ? document.getElementsByName('content.type')[0].content : "";
		this.type = (document.getElementsByName('document_type').length) ? document.getElementsByName('document_type')[0].content : this.type;
		this.subtype = (document.getElementsByName('content.subtype').length) ? document.getElementsByName('content.subtype')[0].content : "";
		this.keywords = (document.getElementsByName('keywords').length) ? document.getElementsByName('keywords')[0].content.split(",") : this.get_page_keywords();
        this.keywords = (this.levels.l1=="tv") ? document.getElementsByName('keywords')[0].content.split(", ") : this.keywords;
		this.splash = this.levels.l1=="homepage" || (this.levels.l2=="null" && this.levels.pageName=="index.html") || (this.levels.l3=="null" && this.levels.pageName=="index.html");

		if(this.levels.pageName == "index.html" && this.path.match("index.html") == null) this.path += "index.html";
		
		if(!this.keywords) this.keywords = new Array();
		
		var term = document.location.href.match(/t=(\w*(\-\w*)*)/);
		if(term != null){
			this.search_type = term[1];
		} else {
			term = document.location.href.match(/search_type=(\w*)/);
			this.search_type = (term != null) ? term[1] : "";
		}
		

		var kw_len = (this.keywords.length > 25) ? 25 : this.keywords.length;
		for(var i=0; i<kw_len; i++)
			this.keyVal += "kw=" + this.keywords[i].replace(/^\s+|\s+$/, '').replace(/[^\w- ]/g,"").replace(/ /g,'-') + ";";
	},
	get_page_keywords: function(){
		var tags;
		if(this.type == "Blog") tags = $("span.entry-tags a");
		else tags = $("h2, h1");

		this.keywords = new Array();
		tags.each(function(i){
			if(this.keywords != "") this.keywords += ",";
			if(this.children.length && this.children[0].tagName=="A") this.keywords.push(this.children[0].innerHTML);
			else this.keywords.push(this.innerHTML);
		});
	},
	set_data: function(){
		if(typeof this.dc_tiles["flex"] != "undefined"){
			for(i=0; i<this.dc_tiles["flex"].length; i++){
				var container = $('#ad-flex-' + (i+1));
				var first_tag = $.browser.msie ? container.parent().find("iframe,span,object,embed,a img,img")[0] : container.find("iframe,span,object,embed,a img,img")[0];
				if(typeof first_tag != "undefined"){
				    var height = (typeof first_tag.height == "undefined" || first_tag.height=="")  ? parseInt(first_tag.style.height) : first_tag.height;
				    var width = (typeof first_tag.height == "undefined" || first_tag.height=="") ? parseInt(first_tag.style.width) : first_tag.width;
                    container.data("iframe-size",width + "x" + height);
				}
			}
		}

		if(typeof this.dc_tiles["hidden"] != "undefined"){
			for(i=0; i<this.dc_tiles["hidden"].length; i++){
				var container = $(this.dc_tiles["hidden"][i].id);
				container.data("iframe-src", this.dc_tiles["hidden"][i].url);
			}
		}
	},
	write_dc_ad: function(o){
		o = $.extend({
			sz: "",
			printWrap: false,
			wrapHead: true,
			keyVal:"",
			name:"",
			hidden:false,
			exclusion:"",
			returnIFrame:false,
			loadHiddenOnScroll:false,
			writeCapture:false,
			tile:-1,
			flex_sz:false
	    }, o || {});

		//Check to see if Ad should be run by Name
		if(typeof ad_on[o.name] != "undefined" && !this.match_urls(this.path, ad_on[o.name])){
			if(o.name=="pencil_pushdown" && !o.flex_sz){ 
				$("#pushdown").hide();
				return;
			} else if(o.name=="pencil_pushdown" && o.flex_sz){ 
				$("#pushdown").addClass("flexSize");
				o.sz = o.flex_sz;
			} else {
				return;
			}
		};
		
		if(o.exclusion == "" && this.match_urls(this.path, ad_on['pencil_pushdown'])) o.exclusion = "noist";

		if(this.dc_numads==0) this.set_zone();
		if(dc_size == "flex") o.hidden = false;
		
		var dc_size = (o.sz.split(",").length == 1) ? o.sz : "flex";
		var adCode="";
		var url="";
		var hid_count=0;
		var pos;
		var tile_num = o.tile < 0 ? ++this.dc_numads : o.tile;

		if ( this.dc_tiles[dc_size] == "undefined" || this.dc_tiles[dc_size] == null ) this.dc_tiles[dc_size] = new Array();
		this.dc_tiles[dc_size].push({"tile":tile_num,"keyVal":o.keyVal,"name":o.name,"writeCapture":o.writeCapture});
		
		var tileLength = this.dc_tiles[dc_size].length;

		if ( this.dc_tiles['hidden'] != "undefined" && this.dc_tiles['hidden'] != null ){
			for(i=0; i<this.dc_tiles['hidden'].length; i++)
				if(this.dc_tiles['hidden'][i].sz == o.sz) hid_count++;
		}
		pos = o.hidden ? hid_count+1 : tileLength-hid_count;

		url = this.writeUrl(o.sz, pos, tile_num, "j", o.keyVal, o.exclusion, o.name);
		this.dc_tiles[dc_size][tileLength-1].url = url;
		this.dc_tiles[dc_size].hid_count = this.dc_tiles[dc_size].hid_count ? 0 : this.dc_tiles[dc_size].hid_count++;


		if(o.printWrap){
			adCode += "<div class='ad-" + dc_size + " adContainer block'>";
			if(o.wrapHead) adCode += "<div class='head'><h5>Advertising</h5></div>";
			adCode += "<div id='ad-" + dc_size + "-" + this.dc_tiles[dc_size].length + "' class='content'>";
		} 
		else adCode += "<div id='ad-" + dc_size + "-" + this.dc_tiles[dc_size].length + "'>";
		
		if(!o.hidden){
			if(!o.writeCapture){
				if(window.nymag.domains.domain.match("localhost") || window.nymag.domains.domain.match("author")){
					adCode += "<img src='http://quickimage.it/"+dc_size+"/ec1a76/ffffff/&text="+dc_size+"ad' alt='ad placeholder'>";
				} else {
				    adCode += "<script type='text/javascript' src='" + url + "' type='text/javascript'></scr" + "ipt>";			
				}

			} else {
			    this.anyWriteCapture = true;
			}
		} else {
			if ( this.dc_tiles['hidden'] == "undefined" || this.dc_tiles['hidden'] == null ) this.dc_tiles['hidden'] = new Array();
			this.dc_tiles['hidden'].push({"url":url.replace(/\/adj\//,"/adi/"), "pos":pos, "sz":dc_size, "id":"#ad-" + dc_size + "-" + this.dc_tiles[dc_size].length });
			
			adCode += "<iframe src='' width='"+o.sz.split("x")[0]+"' height='"+o.sz.split("x")[1]+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' class='hidden-ad'></iframe>";
		}

		if(o.printWrap) adCode += "</div></div>";
		else adCode += "</div>";
		
		if(o.returnIFrame){
		    return "<iframe src='" + url.replace(/\/adj\//,"/adi/") + "' width='"+o.sz.split("x")[0]+"' height='"+o.sz.split("x")[1]+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' class='hidden-ad'></iframe>";
		}
		document.write(adCode);
		
		if(o.hidden && o.loadHiddenOnScroll){
		    var self = this;
		    var adInfo = dc_size + "-" + self.dc_tiles[dc_size].length;
		    var containerTop = $("#ad-"+adInfo).parent().offset().top;
		
		    window.JK = 1;
			window["loadAd_"+adInfo] = function(){
			    window.JK++;
			    var winHeight = $(window).scrollTop()+$(window).height();
                if(winHeight >= containerTop){
                       $(function(){ self.reloadAd(dc_size,self.dc_tiles[dc_size].length,true,true) });
                    $(window).unbind('scroll',window["loadAd_"+adInfo])
                }
			}
			$(window).bind('scroll',window["loadAd_"+adInfo])
		}
		
	},
	write_google_ad: function(o, o_dc, swappable){
		o = $.extend({
			sz: "",
			position: "horizontal",
			ad_type: "text_html_flash_image",
			num_ads: 4,
			adv_with_us: "right",
			"name": ""
	    }, o || {});

		var print_dc = (typeof swappable == "undefined" || !swappable) ? false : this.check_swapable(o.name);
		if(print_dc){ this.write_dc_ad(o_dc); return; }
		
		var adCode = "";
		adCode += "<div class='head'>";
		adCode += "<div class='left'><a id='google_ad_" + o.position + "_" + o.ad_type + "_feedback' style='text-decoration: underline'>Ads by Google</a></div>";
		if(o.adv_with_us == "right") adCode += "<div class='right'><a style='text-decoration: underline' href='https://adwords.google.com/select/OnsiteSignupLandingPage?client=pub-9464321798359467&referringUrl=nymag.com&hl=en&gl=US'>Advertise on this Site</a></div>";
		adCode += "<br /></div><div id='google_ad_" + o.position + "_" + o.ad_type + "'></div>";
		if(o.adv_with_us != "right") adCode += "<div><a style='color: #3C6583' href='https://adwords.google.com/select/OnsiteSignupLandingPage?client=pub-9464321798359467&referringUrl=nymag.com&hl=en&gl=US'>Advertise on this Site</a></div></div>";

		adCode += "<script language='javascript'>";
		adCode += "google_ad_request_done = function(google_ads) {";
		adCode += "nym_google_ad_request_done({";
		adCode += "'ad_container_id': 'google_ad_" + o.position + "_" + o.ad_type + "',";
		adCode += "'google_ads': google_ads});};";

		adCode += "google_ad_client = 'pub-9464321798359467';";
		adCode += "google_ad_output = 'js';";
		adCode += "google_max_num_ads = '" + o.num_ads + "';";
		adCode += "google_image_size = '" + o.sz + "';";
		adCode += "google_feedback = 'on';";
		adCode += "google_ad_type = '" + o.ad_type + "';";
		adCode += "</script>";
		adCode += "<script type='text/javascript' src='http://pagead2.googlesyndication.com/pagead/show_ads.js'></script>";
		
		document.write(adCode);		
	},
	get_url_levels: function(url){
		var levels = {}
		var paths = url.split('/');
		
		levels.pageName = (paths[paths.length-1] == "") ? "index.html" : paths[paths.length-1];
		levels.l1 = (paths[1] == "") ? "homepage" : paths[1];
		levels.l2 = (paths.length>3 && paths[2] != "") ? paths[2] : (levels.pageName=="*") ? "*" : "null";
		levels.l3 = (paths.length>4 && paths[3] != "") ? paths[3] : (levels.pageName=="*") ? "*" : "null";
		levels.l4plus = (paths.length>5 && paths[4] != "") ? paths.slice(4,paths.length-1).join("-") : (levels.pageName=="*") ? "*" : "null";

		return levels;	
	},
	match_urls: function(curr_url, match){
		if(typeof match == "object" && typeof match.l1 == "undefined"){
			for(i in match)
				if(i != 'rest' && this.match_urls(curr_url,i))	return match[i];

			return (typeof match['rest'] != "undefined") ? match['rest'] : true;
		} else if(typeof match == "boolean"){
			return match;
		}

		if(curr_url.match(match) != null) return true;
		else return false;
	},
	check_swapable: function(name_check){		
		return (typeof swap_dc[name_check] == "undefined") ? false : swap_dc[name_check];
	},
	set_zone: function(){
		if(this.sect != "") return;
		
		if(document.getElementsByName('content.hierarchy').length){
		 	this.sect = document.getElementsByName('content.hierarchy')[0].content.split(":")[0].replace("Channel","").replace(/ /g, "").replace(/&/g,"-").toLowerCase();
			return;
		}
		
		var classes = document.body.className.split(" ");
		for(i in classes){
			if(jQuery.inArray(classes[i],this.zones) > 0){
				this.sect = classes[i];
				return;
			}
		}
		
		this.sect = this.levels.l1;
	},
	loadWriteCapture: function(){
	    if(!this.anyWriteCapture) { return; }
	    
	    var rand_num = Math.round( Math.random()*1000000000);
	    writeCapture.writeOnGetElementById=true;
		for(sz in this.dc_tiles){
			// Don't go through the hidden array since they will be reloaded when visible
			if(sz != 'hidden'){
				for(i=0; i<=this.dc_tiles[sz].length-1; i++){
				    if(this.dc_tiles[sz][i].writeCapture){
				        this.dc_tiles[sz][i].url = this.dc_tiles[sz][i].url.replace(/ord=\d+/,"ord="+rand_num);
				        $("#ad-"+sz+"-"+(i+1)).html(writeCapture.sanitize("<script type='text/javascript' src='" + this.dc_tiles[sz][i].url + "'></script>"));
				    }
				}
			}
		}
	},
	reloadAds: function(sz, hidden){
		$("body").data("new_ord",Math.round( Math.random()*1000000000));
		if(typeof sz == "undefined"){
			for(sz in this.dc_tiles){
				// Don't go through the hidden array since they will be reloaded when visible
				if(sz != 'hidden'){
					for(i=0; i<=this.dc_tiles[sz].length-1; i++)
						this.reloadAd(sz,i+1,false);
				}
			}
		} else {
			for(i=0; i<=this.dc_tiles[sz].length-1; i++){
				if(sz=='hidden') this.reloadAd(this.dc_tiles[sz][i].sz,this.dc_tiles[sz][i].pos, hidden);
				else this.reloadAd(sz,i+1, hidden);
			}
		}
		$("body").removeData("new_ord");
	},
	reloadAd: function(sz,pos,hidden,onScroll){
		if(typeof this.dc_tiles[sz] =="undefined") return; //make sure ad is there so no errors are thrown
		hidden = ((typeof hidden == "undefined") || (hidden == null)) ? false : hidden;
		
		if(typeof pos == "string"){
			for(i=0; i<=this.dc_tiles[sz].length-1; i++){
				if(this.dc_tiles[sz][i].name == pos){
					pos = i+1;
					break;
				}
			}
			if(typeof pos == "string") return;
		}
		
		
		if(this.dc_tiles[sz][pos-1].name=="pencil_pushdown") return; //Don't refresh pencil pushdown just now
		var tile = this.dc_tiles[sz][pos-1].tile;
		var element = document.getElementById("ad-" + sz + "-" + pos);
		if(element == null) return; //make sure ad is there so no errors are thrown
		
		var element_jq = $(element);
		var rand_num = $("body").data("new_ord") ? $("body").data("new_ord") : Math.round( Math.random()*1000000000 );
		
		if (onScroll) {
		   rand_num = window.nymag.randomSet.random;
		}
		var first_child = element.children ? element.children[0] : element.childNodes[0];
		while(first_child.nodeName != "IFRAME" && first_child.nodeName != "SCRIPT"){
		    first_child = first_child.nextSibling;
		    if(first_child==null) return;
		}
		var new_src = first_child.src.replace(/ord=\d+/,"ord="+rand_num);
		var visible = $.browser.msie ? element.parentNode.offsetHeight : element.offsetHeight;

		/* For Ajax calls on Vulture */
		var hash = document.location.hash.match(/\/([a-zA-Z0-9 \%\-\']*)\/?/);
		if(hash){
		    if(hash[1]=="")
        		new_src = new_src.replace(/l3=[a-zA-Z0-9 \%\-\']*;/,"l3=null;"); //for ajax calls on vulture 
        	else
    		    new_src = new_src.replace(/l3=[a-zA-Z0-9 \%\-\']*;/,"l3=" + escape(hash[1]) + ";"); //for ajax calls on vulture 
		}
		/* End Ajax calls on Vulture */
		
		if(!hidden && !visible) return;
        
        if(sz=="flex"){
            sz = $("#ad-flex-"+pos).data("iframe-size");
            new_src = new_src.replace(/sz=[0-9x,]+;/,"sz="+sz+";");
        }
		if(element_jq.data("iframe-src")){
			new_src = element_jq.data("iframe-src").replace(/ord=\d+/,"ord="+rand_num);;
			element_jq.removeData("iframe-src");
			first_child.width = sz.split("x")[0];
			first_child.height = sz.split("x")[1];
		}
		
		if($.browser.msie) element_jq.siblings().remove();

		element.innerHTML = "<iframe src='" + new_src.replace(/\/adj\//,"/adi/") + "' width='"+sz.split("x")[0]+"' height='"+sz.split("x")[1]+"' frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no'></iframe>";
	},
	hideAds: function(){
		for(sz in this.dc_tiles){
			// Don't go through the hidden array since they aren't shown
			if(sz != 'hidden'){
				for(i=1; i<=this.dc_tiles[sz].length; i++){
					$("#ad-" + sz + "-" + i).hide();
				}
			}
		}		
	},
	showAds: function(){
		for(sz in this.dc_tiles){
			// Don't go through the hidden array since they aren't shown
			if(sz != 'hidden'){
				for(i=1; i<=this.dc_tiles[sz].length; i++)
					$("#ad-" + sz + "-" + i).show();
			}
		}		
	},
	writeUrl: function(sz, pos, tile, iframeMode, moreKeyVal, exclusion, name){
		moreKeyVal = (typeof moreKeyVal == "undefined") ? "" : moreKeyVal;

        if(this.change_dc_site && (typeof NYM != "undefined") && (typeof NYM.config != "undefined") && (typeof NYM.config.advertising != "undefined") && (typeof NYM.config.advertising.sitename != "undefined")){
            this.dc_site = NYM.config.advertising.sitename;
        } else if(document.location.href.match('daily/entertainment')) {
            this.dc_site = "nym.vulture";
        } else {
            this.dc_site = "nym.nymag";
        }
        
        if(document.location.href.match('daily/fashion')) {
            this.dc_site = "nym.thecut";
        }
        

		var ad_url = document.location.protocol + "//ad.doubleclick.net/ad" + iframeMode + "/" + this.dc_site + "/" + this.sect + ";";
		ad_url += "sect="  + this.sect + ";";
		ad_url += "pos="  + pos + ";";

		ad_url += "l1="   + this.levels.l1 + ";";
		ad_url += "l2=" + ((this.levels.l2=="*") ? "null" : this.levels.l2) + ";";
		ad_url += "l3=" + ((this.levels.l3=="*") ? "null" : this.levels.l3) + ";";
		ad_url += "l4plus=" + ((this.levels.l4plus=="*") ? "null" : this.levels.l4plus) + ";";
		ad_url += "pN="   + this.levels.pageName + ";";
		ad_url += this.keyVal;
		ad_url += moreKeyVal;
		if(document.location.search.match(/testkw=(\w+)/)) ad_url += "kw=" + document.location.search.match(/testkw=(\w+)/)[1] + ";";
		if(document.location.href.match(/menswear|menrunway/)) ad_url += "kw=menswear;"; // Fashion Week, targeting menswear collections
		if(name != "") ad_url += "name=" + name + ";";
		if(this.search_type != "") ad_url += "srch=" + this.search_type + ";";
		//console.log(window.nymag.domains.prod);
		if(!window.nymag.domains.prod) ad_url += "test=true;";
		if(window.nymag.dcads.article) ad_url += "opa=true;";
		if(exclusion != "") ad_url += "!c=" + exclusion + ";";
		if(this.dc_numads == 1 && !(document.domain.match(/author/))) ad_url += "dcopt=ist;";
		if(nymag.dcads.keyVal.match(/9-11|ground zero|ground zero mosque|september-11|9\/11/g)) ad_url += "!category=airline;"; //REMOVE airlines from 9-11 pages
		ad_url += "sz="   + sz + ";";
		ad_url += "tile=" + tile + ";";
		ad_url += "ord="  + this.rand + "?";
        window.nymag.randomSet.random = this.rand;
		return ad_url.toLowerCase();
	},
	fix_target_creatives: function() {
   			var adContainers= $("div.adContainer div");
   			for(k=0;k<adContainers.length;k++) {
   				var targetElement = $(adContainers[k]);
   				if (targetElement.css("zIndex") > 5000) {
   					$(targetElement).addClass("FixCreativeForNav").css("z-index","1");
   				}
   			}
    		/* 
				This function creates an array of all the problematic creatives on our site. It then checks the page to see if this ID exists. 
				If the ID exists it adds a class of "fixAdLayeringForNav" which ties into function "hideProblemElements" and "showProblemElements" in global.js
				Basically upon recieving this class the problematic creatives get set to more friendly CSS z-index and position values when the navigation dropdowns are triggered
			*/	
			
			var FixTargetCreativeIDs = new Array(
				"#DIV_26241364_11209419530405",  //Don Julio leaderboard 4/28/08
				"div#OUTER_DIV_26241364_11209419530405", //Don Julio leaderboard 4/28/08
				"div#OUTER_DIV_26241581_11209425416231", //Don Julio 160x600 4/28/08
				"DIV_26241581_11209425416231",//Don Julio 160x600 4/28/08
				"div#OUTER_DIV_26241397_11209502942084", //Don Julio rectangle 4/29/08
				"div#OUTER_DIV_26215228_11209568054102", // American Express inside the festival rectangle 4/30/08
				"div#VwP23603Div2"
			); // last line should not have a comma

			for(i=0;i<FixTargetCreativeIDs.length;i++) {
			   $(FixTargetCreativeIDs[i]).addClass("FixCreativeForNav");
			}
	},
	write_node: function(){
		//For Survey Nodes and NOT DoubleClick/Google Ads
		if(this.sect == "homepage" || this.match_urls(this.path, ad_on['pencil_pushdown']) || this.takeover) return;

		var nID = (typeof ad_on['nodes'][this.sect] != "undefined") ? ad_on['nodes'][this.sect] : 3241;
		document.write('<script src="http://content.dl-rms.com/rms/' + nID + '/nodetag.js"></script>');
	},	
	scheduler: function(){
		this.set_zone();
		for(var i=0; i<layouts['scheduler'].length; i++){
			sD = new Date(layouts['scheduler'][i].start);
			eD = new Date(layouts['scheduler'][i].end);
			if(currDate >= sD && currDate < eD && jQuery.inArray(this.sect,layouts['scheduler'][i].sect.split(",")) >=0 ){
				layouts[this.sect] = layouts['default'];
				if(layouts['scheduler'][i].top) layouts[this.sect]['top'] = layouts['scheduler'][i].top;
				if(layouts['scheduler'][i].leaderboard) layouts[this.sect]['leaderboard'] = layouts['scheduler'][i].leaderboard;
				if(layouts['scheduler'][i].right) layouts[this.sect]['right'] = layouts['scheduler'][i].right;

				break;
			}
		}
	},
	path: document.domain+document.location.pathname.replace("//","/"),
	sect: "",
 	zones: ['bestofny','bestdoctors','holidays','lawyers','magazine','guides', 'guides', 'travel', 'arts', 'news', 'fashionshows', 'fashion', 'homedesign', 'movies', 'nightlie', 'restaurants', 'shopping', 'weddings', 'everything', 'family', 'beauty', 'myny', 'test', 'homepage', 'kids'],
	dc_site: "nym.nymag",
	change_dc_site: true,
	levels: {
		l1:"",
		l2:"",
		l3:"",
		l4plus:"",
		pageName:""
	},
	keywords:"",
	keyVal:"",
	type:"",
	subtype:"",
	splash: false,
	dc_tiles: new Array(),
	dc_numads: 0,
	search_type: "",
	takeover: false,
	anyWriteCapture: false,
	rand: Math.round( Math.random()*1000000000 )
}
window.nymag.set();

if (typeof NYM == "undefined") window.NYM = {};
NYM.utils = {
	slugify: function(text) {
		text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
		text = text.replace(/-/gi, "_");
		text = text.replace(/\s/gi, "-");
		return text;
	}
}

/*
	tabs for jquery (most popular, etc. tabbed modules)
*/

function initTabbedModule(container_id) {
	var tabContainers = $('#' + container_id + ' div.tabs > div');
	tabContainers.hide().filter('.tab-open').show();
	
	$('#' + container_id + ' div.tabs ul.tabNav a').click(function () {
		tabContainers.hide();
		tabContainers.filter(this.hash).show();
		$('#' + container_id + ' div.tabs ul.tabNav a').removeClass('selected');
		$(this).addClass('selected');
		return false;
	}).filter('.tab-open').click();
}

function uberSelect () {
	$(".uberselect").hover(function(){
		$(this).addClass("uberselect-hover");
		},function(){
		$(this).removeClass("uberselect-hover");
		});
	$(".uberselect .head").toggle(function(){
		$(this).parent('.uberselect').addClass("uberselect-selected");
		},function(){
		$(this).parent('.uberselect').removeClass("uberselect-selected");
	});
}
$(uberSelect);


/*
	New Navigation
*/
window.nymag.circ = {
	"News & Features Channel" : { "subscribe" : "IBJE#f=subs-news", "gift" : "03921IGG9#f=subs-news" },
	"Food Channel" : { "subscribe" : "IBJF#f=subs-food", "gift" : "03921IGH2#f=subs-food" },
	"Nightlife Channel" : { "subscribe" : "IBJG#f=subs-bars", "gift" : "03921IGH3#f=subs-bars" },
	"Entertainment Channel" : { "subscribe" : "IBJH#f=subs-arts", "gift" : "03921IGH4#f=subs-arts" },
	"Fashion Channel" : { "subscribe" : "IBJJ#f=subs-fashion", "gift" : "03921IGH5#f=subs-fashion" },
	"Shopping Channel" : { "subscribe" : "IBJK#f=subs-shop", "gift" : "03921IGH6#f=subs-shop" }
}


/* debug for mymag */

if(typeof window.D == 'undefined') window.D = {};

  
window.D.debug = 
	// debug set to false if Prod and true otherwise
	 function() {
	 // all targeted environments
	   debugSites = new Array();
	   debugSites[0]="nymetro."; debugSites[1]="krang."; debugSites[2]="nymag.biz"; debugSites[3]="qa.grubstreet"; debugSites[4]="stg.grubstreet";
	   debugSites[5]="menupages."; debugSites[6]="author1."; debugSites[7]="qa.vulture"; debugSites[8]="stg.vulture"; debugSites[9]="dev.vulture";  
	   debugSites[10]="publish01."; debugSites[11]="publish02.";   debugSites[12]="local."; debugSites[13]="localhost";
	   debugSitesSize = debugSites.length;
	   currTestEnv = document.location.href;
	    for (i=0;i<debugSitesSize; i++) {
			if (currTestEnv.indexOf(debugSites[i]) > -1) {
				return true;
			}
		 }  
		 return false;
	}

	
window.D.log = 
     function(msg) {
	     if (typeof window.D === 'undefined' || !window.D.debug())
         return;
         if ((typeof console == 'object') && (window.D.debug())) {
           console.log("nymag debug: " + new Date().toLocaleTimeString() + " " + msg);
         }
         else if (typeof java == 'object' && typeof java.lang == 'object') {
            java.lang.System.out.println(msg);
         }
     }    
 
/* test run */
/* jQuery(document).ready(function() {
D.log(D.debug());
D.log("test");
D.log;
}); */
	
function nymag_subscriptionsByChannel() {
	var subs = $("#nav-secondary ul.subscribe li a");
	if((typeof s == "object") && (typeof s.hier1 == "string")) {
		var channel = s.channel.split(":")[0];
		var this_channel = window.nymag.circ[channel];
		if(typeof this_channel == "undefined" || (channel=="Fashion Channel" && nymag.dcads.levels.l1=="fashion")) return;

		if((typeof subs[0] != "undefined") && (typeof subs[1] != "undefined")) {
			subs[0].href = "http://nymag.com/redirects/circ_subscribe/orderform.html";
			subs[1].href = "http://nymag.com/redirects/circ_gifts/gift-A.html";
		}
	}
}

var ssLinks=[]; //Slideshow Links Variable

/* Get MYNY Links */
function getLink(whereTo){
	if (whereTo == 'albums') {
		window.location = nymag.domains.my+"/"+getUserName()+"/myfashion/All-Saved-Looks/";
		return;
	}
	var tmp=nymag.domains.my+"/";
	tmp+=getUserName();
	tmp+="/"+whereTo+"/";
	 window.location=tmp;
}

//.toggleText
jQuery.fn.origText = function(a) {
	return this.each(function() {
		var t = this.value;
		$(this).bind("blur",function(){ if(this.value=="") this.value=t; });
		$(this).bind("focus",function(){ if(this.value==t) this.value=""; });
	});
};

function omnitureClick(element,msg){
    $(element).click(function(e){
        while(e.target.nodeName != "A"){
	        if(e.target==this) return;
	        e.target = e.target.parentNode;
		}
		nymag_recordLink(this,msg);

		var date = new Date(), curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 200);
		
		return true;
	});
}

/* LEGACY AD FUNCTION CALLS */
function SetSection(){}
function InsertBanner2(){ window.nymag.dcads.write_dc_ad({"sz":"728x90", "printWrap":false}); }
function InsertBigSquare2(){ window.nymag.dcads.write_dc_ad({"sz":"300x250,300x251", "printWrap":false}); }
function InsertTower2(){ window.nymag.dcads.write_dc_ad({"sz":"160x600", "printWrap":false}); }
function InsertTower2_2(){ window.nymag.dcads.write_dc_ad({"sz":"160x600", "printWrap":false}); }
function Insert260x60(){ window.nymag.dcads.write_dc_ad({"sz":"260x60", "printWrap":false}); }
function InsertRight_160x600() { window.nymag.dcads.write_dc_ad({"sz":"160x600", "printWrap":false}); }


/* Welcome Mat/Ad Mask JS Functions */
function nymKillAdMask() {
	$("div").remove("#admask");
	$("body").removeClass("welcome-mat");
	setTimeout('initTabbedModule("mostpopular")',500);
}

function nymAdLoadCallback() {
	$("#admask .head").remove();
}

function nymAdMaskFallback(){
	$("#admask .kill").html("<a href=\"#\" onclick=\"nymKillAdMask()\">Continue &rsaquo;</a>").fadeIn(300);
}

function fadeHomeBtn() {

	$("#admask .kill").fadeOut();
	setTimeout('nymAdMaskFallback()',400);
}

function nymLoadAdMask() {
	if(jQuery("#admask").length > 0) { $("div").remove("#admask");}
	if ((navigator.appName == "Microsoft Internet Explorer" 
	&& navigator.appVersion.indexOf("Mac") == -1 
	&& navigator.appVersion.indexOf("3.1") == -1) 
	|| (navigator.plugins && navigator.plugins["Shockwave Flash"])
    || navigator.plugins["Shockwave Flash 2.0"]){
		$("body").addClass("welcome-mat");
		$("body").prepend("<div id=\"admask\" class=\"jqmOverlay\"><div class=\"head\"><h1>NYMag.com</h1><span class=\"kill\">Loading &hellip;</span></div></div>");
		setTimeout('fadeHomeBtn()',5000);
	}
}

function nymLoadEmptyAdMask() {
	if(jQuery("#admask").length > 0) { $("div").remove("#admask");}
	if ((navigator.appName == "Microsoft Internet Explorer" 
	&& navigator.appVersion.indexOf("Mac") == -1 
	&& navigator.appVersion.indexOf("3.1") == -1) 
	|| (navigator.plugins && navigator.plugins["Shockwave Flash"])
    || navigator.plugins["Shockwave Flash 2.0"]){
		$("body").addClass("welcome-mat");
		$("body").prepend("<div id=\"admask\"></div>");
	}
}

function lbPop(o){
    o = nym.extend({name:null,height:null,width:null,divClass:"lbPop",url:null,bg:true,closeBtn:false,htmlText:null,overlay:50,overlayBG:null}, o || {});
    if(!o.name && !o.height && !o.width && (!o.url && !o.htmlText)) return;
    
    var lb = $("#lb-"+o.name);
	var topPos = 0;
	if(window.scrollY){
	    topPos = window.scrollY + (window.innerHeight-o.height)/2;
	    topPos = (topPos < window.scrollY) ? window.scrollY : topPos;	    
	}
	else{
	    topPos = document.documentElement.scrollTop + (document.documentElement.clientHeight-o.height)/2;
	    topPos = (topPos < document.documentElement.scrollTop) ? document.documentElement.scrollTop : topPos;
	}
	if(topPos<23) { topPos=23; }
	if(o.closeBtn) { topPos+=17; }

    if(!lb.length){
        lb = $("<div>").attr("id","lb-"+o.name).addClass(o.divClass).css({"height":o.height,"width":o.width});
        if(!o.bg) lb.css({"background-color":"transparent","-moz-box-shadow":"none","-webkit-box-shadow":"none","box-shadow":"none"});
        if(o.htmlText) lb.append(o.htmlText);
        lb.prependTo("body").hide().jqm({
            overlay:o.overlay,
            onShow: function(h){
                var left = ($(window).width()-o.width)/2;
                left = (left<0) ? 0 : left;
                lb.css({"left":left});
    			h.w.show();
    			if(o.overlayBG){
    			    h.o.css("background",o.overlayBG);
    			}
    			if(!lb.html().length){
    				lb.load(o.url,function(){
    					$(this).css("background-image","none");
        				if(o.closeBtn){
                            lb.append("<a class='gen-close' href='#'>close</a>");
                            $("a.gen-close",lb).click(function(){
                                lb.jqmHide();
                                return false;
                            });
        				}
    				});
    			}
            }
        });
        $("a.close",lb).click(function(){
            lb.jqmHide();
            return false;
        });
    }
    lb.css({"top":topPos});
	lb.jqmShow();
}

function adOverlay(o){
    o = nym.extend({name:null,adSize:"300x250",adText:"",dark:false}, o || {});
    if(!o.name) return;
    
    var lb = $("#lb-"+o.name);

    if(!lb.length){
        lb = $("<div>").attr("id","lb-"+o.name).addClass("lbOverlay");
        if(o.dark) lb.addClass("dark");
        lb.append("<div class='hp-overlay-container'><div class='head'><p>" + o.adText + "</p><a class='skip' href='#'>Continue in to nymag.com &raquo;</a></div><div class='ad-container'></div></div>")
        lb.prependTo("body").hide().fadeIn("fast");
        $("a.skip",lb).click(function(){
            if($.browser.version<=7 && $.browser.msie){
                lb.remove();
            } else {
                lb.fadeOut("fast",function(){
                    lb.remove();
                });                
            }
            
            return false;
        });
        $("div.ad-container",lb).append(nymag.dcads.write_dc_ad({"sz":o.adSize, "returnIFrame":true,"name":o.name}));
        setTimeout(function(){ $("a.skip",lb).click(); },15000);
    }
}

function adPop(o){
    o = nym.extend({name:null,adSize:"300x250",adText:"",dark:false,overlay:88,overlayBG:null}, o || {});
    if(!o.name) return;
    
    lbPop({
        "name":o.name,
        "height":parseInt(o.adSize.split("x")[1])+70,
        "width":parseInt(o.adSize.split("x")[0])+80,
        "divClass":"blog-interstitial" + (o.dark ? " dark":""),
        "htmlText":"<h2>" + o.adText + "</h2>" + nymag.dcads.write_dc_ad({"sz":o.adSize, "returnIFrame":true,"name":o.name}) + "<a href='#' class='close' title='Close'>Close</a>",
        "overlay":o.overlay,
        overlayBG:o.overlayBG
    });
}

function convertMBox(element,mbox){
    $(element).unbind("click").click(function(e){
        while(e.target.nodeName != "A"){
            if(e.target.nodeName=="BODY") return;
            e.target = e.target.parentNode;
        }
		$("body").append("<div id='" + mbox + "' class='mboxDefault'></div>");
		mboxDefine(mbox,mbox);
		mboxUpdate(mbox);

		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < 200);

		return true;
	});
}

/* IE6 Z-Index Fix!!! */
var iaz_preserved_elements = [];
var iaz_preserved_zindexes = [];
function ie_apply_zindex(element_id, zindex, context_id) {
   // default values
   if (undefined == zindex) { zindex = 1; }
   var context = (undefined == context_id) ? $(context_id) : $("body");
   var element = $(element_id);

   for (i = iaz_preserved_elements.length-1; i >= 0; i--) {
      iaz_preserved_elements[i].css({'z-index': iaz_preserved_zindexes[i]});
   }
   iaz_preserved_elements = [];
   iaz_preserved_zindexes = [];


   // find relative-positioned ancestors of element within context
   element.parents().each(
      function(ancestor) {
         if ('relative' == $(this).css('position')) {
            // apply z-index to ancestor
			iaz_preserved_elements.push($(this));
			iaz_preserved_zindexes.push( $(this).css('z-index') );

 			$(this).css({'z-index': zindex});
         }
         if ($(this) == context) { throw $break; }
      }
   );
}

//caches jquery getscripts in browser
(function($){
$.getScript = function(url, callback, cache){
	$.ajax({
			type: "GET",
			url: url,
			success: callback,
			dataType: "script",
			cache: cache
	});
};
})(jQuery);

(function ($) {
    $.nymAnalytics = $.fn.nymAnalytics = function (o) {
		o = $.extend({
		    page_view: false,
		    page_meta: {},
		    events: "",
		    link_name: "",
		    return_link:false,
		    link_track:false
		},
		o || {});
		
		if(o.link_track){
            $(this).attr("name","&lpos="+o.link_track);
            return true;
		}
		
		var funcCall = function(data) {
		       if(data.page_view){
		           trk_setMetadata(data.page_meta);
               	   trk_pageView();
		       } else {
                    if(data.link_name!="")
                        trk_recordLink(this,data.link_name,data.events);
		       }
		       return true;
		};
        if(this.selector.length){
    		this.live("click",function(){    		    
                funcCall(o);
                
                if(data.return_link){
                    var date = new Date(), curDate = null;
            		do { curDate = new Date(); }
            		while(curDate-date < 200);
                }
                
                return data.return_link;
		    });
            return this;
        }

        return funcCall(o);
    }
})(jQuery);

if (typeof window.NYM === 'undefined') {
    window.NYM = {};
}


if (window.nymag.dcads.levels.l1 === 'homepage' && 
    NYM.config.advertising.sitename === 'nym.nymag' && 
    NYM.dates.inRange(date, 'March 5, 2013 23:59', 'March 6, 2013 23:59')) {
  
  NYM.config.takeovers.openingCreditsVideo({
    'campaign': 'Bravo',
    'skipMessage': 'Skip to NYMag',
    'frequencyName': 'BravoRachelZoeOpeningCredits-nymagHP',
    'frequencyValue': 'cw',
    'frequencyInHours': 8,
    'video': 'http://images.nymag.com/images/2/ads/takeovers/bravo3-6.mp4',
    'link': 'http://ad.doubleclick.net/clk;268640296;94453680;v',
    "track": "http://ad.doubleclick.net/ad/N4518.NYMag/B7390658.12;sz=1x1;ord=" + addTS + "?"
  });

}
