if (typeof NYM == "undefined") window.NYM = {};
NYM.echo = {
    apiKey: function () {
        var currDomain = window.nymag.domains.domain;
        var key = "";
        if (currDomain.indexOf("dev.") > -1 || currDomain.indexOf("stg.") > -1 || currDomain.indexOf("qa.") > -1) {
            key = "dev.nymag.com";
        } else {
            key = "prod.nymag.com";
        }
        return key;
    },
    initStream: function (o) {
        o = $.extend({
          sortOrder: NYM.echo.getSortOrder(),
          userID: "",
          markers: "",
          targetDom: "echo-stream",
          template: "",
          threadType: NYM.echo.getThreadType(),
          itemsPerPage: "25",
          children: "100",
          reTag: false,
          membership: "nym"
        }, o || {});
        if (o.userID != "") {
            o.userID = "user.id:" + o.userID;
        }
        if (o.markers == "ep") {
            o.markers = "markers:ep";
        } else if (o.sortOrder == "likesDescending") {
            o.markers = "-markers:ep";
        }
        if (o.template == "articles-truncated") {
            o.threadType = "scope:";
            o.itemsPerPage = "3";
            o.children = "0";
        }
        if (o.threadType == "scope:") {
          o.children = 0;
        }
		
        var domain = nymag.domains.domain;
        if (typeof canonicalUrl == "undefined" && o.template != "myny-comments") {
          var linkRels = document.getElementsByTagName("link");
          for (var i = 0; i < linkRels.length; i ++) {
            if (linkRels[i].getAttribute("rel") === "canonical") {
              canonicalUrl = linkRels[i].getAttribute("href");
            }
          }
        } else if (o.template == "myny-comments") { 
          canonicalUrl = "";
          var currLoc = nymag.domains.domain;
          if (currLoc.indexOf("dev.") > -1 ) {
            canonicalUrl = "((scope:http://dev.nymag.biz/*) OR (scope:http://newyork.grubstreet.dev.nymag.biz/*))";
          } else if (currLoc.indexOf("qa.") > -1 ) {
            canonicalUrl = "((scope:http://qa.nymetro.com/*) OR (scope:http://newyork.qa.grubstreet.com/*))";
          } else if (currLoc.indexOf("stg.") > -1 ) {
            canonicalUrl = "((scope:http://stg.nymetro.com/*) OR (scope:http://newyork.stg.grubstreet.com/*))";
          } else  {
            canonicalUrl = "((scope:http://nymag.com/*) OR (scope:http://newyork.grubstreet.com/*))";
          }
        } else if ((canonicalUrl.indexOf("http:") == -1)) {
          canonicalUrl = domain + canonicalUrl.split('?')[0];
        }
        

        if(nymag.domains.domain.match("vulture.com")){
          var url = canonicalUrl.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
          canonicalUrl = url;
        } else if (document.URL.match("/daily/intelligencer/")) {
          var url = canonicalUrl.replace("/daily/intelligencer/", "/daily/intel/");
          canonicalUrl = url;
        } else {
          canonicalUrl.replace(nymag.domains.domain, nymag.domains.domain);
        }

        NYM.echo.EchoStream = new Echo.Stream({
          "streamStateLabel": {
            "icon": false,
            "text": false
          },
          "itemControlsOrder": ["Reply", "Like", "Edit", "edPicks"],
          "contentTransformations": {
            "text": ["urls", "newlines"],
            "html": ["urls", "newlines"],
            "xhtml": ["urls"]
          },
          "target": document.getElementById(o.targetDom),
          "flashColor": "#fff",
          "reTag": o.reTag,
          "appkey": NYM.echo.apiKey(),
          "query": o.threadType + canonicalUrl + " itemsPerPage:" + o.itemsPerPage + " " + o.userID + " " + "type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)" + o.markers + " sortOrder:" + o.sortOrder + " safeHTML:aggressive children:" + o.children + " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted) childrenSortOrder:chronological childrenItemsPerPage:500",
          "children": {
            "additionalItemsPerPage": 1,
            "moreButtonSlideTimeout": 400,
            "itemsSlideTimeout": 400
          },
            "plugins": [{
                "name": "Reply",
                "actionString": "Write reply here...",
                "nestedPlugins": [{
                    "name": "FormAuth",
                    "submitPermissions": "forceLogin",
                    "identityManagerLogin": {
                        "width": 400,
                        "height": 240,
                        "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                    },
                    "identityManagerEdit": {
                        "width": 400,
                        "height": 240,
                        "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                    },
                    "identityManagerSignup": {
                        "width": 400,
                        "height": 240,
                        "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                    }
                },
                {
                    "name": "SubmitTextCounter"
                },
                {
                    "name": "controlMods"
                },
                {
                    "name": "secondaryPostButtonMods",
                    "section": o.membership
                },
                {
                    "name": "postButtonMods"
                }] // end Reply nested plugins
            },
            {
                "name": "Like",
		"membership": o.membership,
                "nestedPlugins": [{
                    "name": "likeMods",
		    "membership": o.membership
                }]
            },
            {
                "name": "markerClass"
            },
            {
		"name": "reTagMods"
            },
            {
                "name": "likeMods"
            },
            {
                "name": "controlMods"
            },
            {
                "name": "reportAbuse",
		"membership": o.membership
            },
            {
                "name": "moreMods"
            },

            {
                "name": "secondaryMods"
            },
            {
                "name": "CommunityFlag"
            },
            {
                "name": "Curation"
            },
            {
                "name": "Edit"
            },
            {
                "name": "ItemContentNormalizer",
		"template": o.template
            },
            {
                "name": "moderatorMarkerClass"
            },
	    {
		"name": "templateClass",
		"template": o.template
	    },
            {
		"name": "userNameMods",
		"membership": o.membership
	    },
	    {
		"name": "avatarMods",
		"membership": o.membership
	    },
	    {
		"name": "truncateComment",
		"template": o.template
	    },
	    {
		"name": "edPicks",
		"membership": o.membership
	    },
	    {
		"name": "EditTimer"
	    },
            {
		"name": "subUserNameMods",
		"template": o.template
	    }] // end Stream Plugins
        }); // end Echo.Stream
    },

    initSubmit: function (o) {
        o = $.extend({
            membership: "nym",
    	targetDom: "submit-form"
        }, o || {});
        var domain = nymag.domains.domain;
		if (typeof canonicalUrl == "undefined") {
			var linkRels = document.getElementsByTagName("link");
			for (var i = 0; i < linkRels.length; i ++) {
				if (linkRels[i].getAttribute("rel") === "canonical") {
					canonicalUrl = linkRels[i].getAttribute("href");
				}
			}
			
		} else if ((canonicalUrl.indexOf("http:") == -1)) {
			canonicalUrl = domain + canonicalUrl; 
		}
        new Echo.Submit({
	    	"target": document.getElementById(o.targetDom),
            "appkey": NYM.echo.apiKey(),
            "targetURL": canonicalUrl,
            "plugins": [{
                "name": "FormAuth",
                "submitPermissions": "forceLogin",
                "identityManagerLogin": {
                    "width": 400,
                    "height": 240,
                    "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                },
                "identityManagerEdit": {
                    "width": 400,
                    "height": 240,
                    "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                },
                "identityManagerSignup": {
                    "width": 400,
                    "height": 240,
                    "url": "https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                }
            },
            {
                "name": "SubmitTextCounter"
            },
            {
                "name": "postButtonMods",
                "section": o.membership,
			"targetDom": o.targetDom
            }] // end Submit plugins
        });
        Echo.Broadcast.subscribe("User.onInvalidate", function (topic, data, contextId) {
            var logged = data.data.logged;
            if (logged == false) {
				$("#sort-mine").hide();
                logoutAll();
            } else {
				$("#sort-mine").show();
	    	}
        });

        Echo.Localization.extend({
            "more": "Show More Comments"
        }, "Stream");

        Echo.Localization.extend({
            "logout": "<span>|<\/span>Not You?"
        }, "Auth");
    },
    initCounter: function (o) {
        o = $.extend({
            sortOrder: "reverseChronological",
            userID: "",
            markers: "",
            targetDom: "echo-stream",
            template: "",
            threadType: "childrenof:",
            children: "100",
            reTag: false
        }, o || {});
        if (o.userID != "") {
            o.userID = "user.id:" + o.userID;
        }
        if (o.markers == "ep") {
            o.markers = "markers:ep";
        } else if (o.sortOrder == "likesDescending") {
            o.markers = "-markers:ep";
        }
        if (o.template == "articles-truncated") {
            o.threadType = "scope:";
            o.itemsPerPage = "3";
            o.children = "0";
        }
        var domain = nymag.domains.domain;
		if (typeof canonicalUrl == "undefined" && o.template !="myny-comments") {
			var linkRels = document.getElementsByTagName("link");
			for (var i = 0; i < linkRels.length; i ++) {
				if (linkRels[i].getAttribute("rel") === "canonical") {
					canonicalUrl = linkRels[i].getAttribute("href");
				}
			}
                } else if (o.template == "myny-comments") {
                        canonicalUrl = "";
                        var currLoc = nymag.domains.domain;
                        if (currLoc.indexOf("dev.") > -1 ) {
                                canonicalUrl = "((scope:http://dev.nymag.biz/*) OR (scope:http://newyork.grubstreet.dev.nymag.biz/*))";
                        } else if (currLoc.indexOf("qa.") > -1 ) {
                                canonicalUrl = "((scope:http://qa.nymetro.com/*) OR (scope:http://newyork.qa.grubstreet.com/*))";
                        } else if (currLoc.indexOf("stg.") > -1 ) {
                                canonicalUrl = "((scope:http://stg.nymetro.com/*) OR (scope:http://newyork.stg.grubstreet.com/*))";
                        } else  {
                                canonicalUrl = "((scope:http://nymag.com/*) OR (scope:http://newyork.grubstreet.com/*))";
                        }
		} else if ((canonicalUrl.indexOf("http:") == -1)) { 
			canonicalUrl = domain + canonicalUrl; 
		}
        var counter = new Echo.Counter({
            "target": document.getElementById("echo-counter"),
            "appkey": NYM.echo.apiKey(),
            "query": o.threadType + canonicalUrl + " " + o.userID + " " + "type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted) " + o.markers + " sortOrder:" + o.sortOrder + " safeHTML:aggressive children:" + o.children + " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)"
        });

        counter.subscribe("Counter.onUpdate", function (topic, args) {
            var count = args.data.count;
            var counterText = "";
	    if (o.template == "articles-truncated") {
		if (count == 0) {
			$(".start-discussion:last a.extra:first").html("Start the Discussion");
			$(".start-discussion:last a.extra:last").html("Add a Comment");
			$("#echo-stream").remove();
			$(".start-discussion").css("display", "block");
		} else {
			$(".start-discussion").css("display", "block");
			$("#echo-comments, .section-headline, .section-headline p, .section-headline h2, h3.all").show();
		}
	    }
            if (count == 1) {
                counterText = "Comment";
            } else {
                counterText = "Comments";
            }
            if (count > 5) {
                $("#sort-buttons").removeClass("hide-buttons");
                NYM.echo.activateFilters(o);
            }
            $("#counter-text").html(counterText);
            $("#counter-text-top").html(count);
       
        });

    },
    loadCounter: function (o) {
        //$.getScript("http://cdn.echoenabled.com/clientapps/v2.3.3/counter.js", function () {
            NYM.echo.initCounter(o);
        //});
    },
    activateFilters: function (o) {
        o = $.extend({
		template: "nym-blogs"
        }, o || {});
		if (o.template == "myny-comments") {
			o.threadType = "scope:",
			o.children = 0
		}

	$("#sort-threaded input[name=threaded]").change(function() {
	    if ($("#sort-threaded input[name=threaded]").is(":checked") == true) {
		var threadType = "childrenof:";
		var children = o.children;
		setCookie("nymag_comments_threadType","childrenof");
	    } else {
		var threadType = "scope:";
		var children = 0;
		setCookie("nymag_comments_threadType","scope");
	    }
	    var currSort = NYM.echo.sortOptions;
	    if (currSort == "popular") {
            	NYM.echo.initStream({
			sortOrder: "likesDescending",
	                targetDom: "echo-substream",
       		        threadType: NYM.echo.getThreadType(),
	                children: o.children,
       			reTag: o.reTag
            });
	    } else if (currSort =="most-replies") {
	            NYM.echo.initStream({
       		         sortOrder: "repliesDescending",
               		threadType: threadType,
	                children: o.children,
	                reTag: o.reTag,
        	        userID: o.userID
	            });	
	    } else {
            	NYM.echo.initStream({
	                sortOrder: NYM.echo.getSortOrder(),
	                threadType: threadType,
	                children: children,
	                reTag: o.reTag,
       		        userID: o.userID
            	});
	    }
	});
	$("#sort-threaded span").bind("click",function() {
		$("#sort-threaded input").trigger("change");
		if ($("#sort-threaded input").attr("checked") == true) {
			$("#sort-threaded input").removeAttr("checked");
		} else {
			$("#sort-threaded input").attr("checked", true);
		}
	});

        $("#sort-oldest a").bind("click", function () {
            NYM.echo.initStream({
                sortOrder: "chronological",
		threadType: NYM.echo.getThreadType(),
		children: o.children,
		reTag: o.reTag,
		userID: o.userID
            });
            $(this).parents("#sort-buttons").find(".active").removeClass("active");
            $(this).parent().addClass("active");
            $("#echo-substream").empty();
	    NYM.echo.sortOptions = "oldest";
	    $("#sort-threaded input").removeAttr("disabled");
	    setCookie("nymag_comments_sortPref","chronological");
        });

        $("#sort-active a").bind("click", function () {
	    NYM.echo.sortOptions = "most-replies";
            NYM.echo.initStream({
                sortOrder: "repliesDescending",
                threadType: NYM.echo.getThreadType(),
                children: o.children,
		reTag: o.reTag,
		userID: o.userID
            });
            $(this).parents("#sort-buttons").find(".active").removeClass("active");
            $(this).parent().addClass("active");
	    $("#sort-threaded input").attr("disabled",true);
            $("#echo-substream").empty();
        });


        $("#sort-popular a").bind("click", function () {
	    NYM.echo.sortOptions = "popular";
            var epcounter = new Echo.Counter({
                "target": document.getElementById("echo-counter-recommends"),
                "appkey": NYM.echo.apiKey(),
                "query": o.threadType + canonicalUrl + " " + o.userID + " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted) markers:ep children:"+o.children+" type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged markers:ep -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)"
            });

            epcounter.subscribe("Counter.onUpdate", function (topic, args) {
                $("#echo-stream").empty();
                var epcount = args.data.count;
                if (epcount > 0) {
                    NYM.echo.initStream({
                        markers: "ep",
			sortOrder: "reverseChronological",
	                threadType: NYM.echo.getThreadType(),
       		        children: o.children,
			userID: o.userID,
			retag: o.reTag
                    });
                }
                epcounter.unsubscribe("Counter.onUpdate");
            });
            NYM.echo.initStream({
                sortOrder: "likesDescending",
                targetDom: "echo-substream",
                threadType: NYM.echo.getThreadType(),
                children: o.children,
                reTag: o.reTag,
                userID: o.userID
            });
            $(this).parents("#sort-buttons").find(".active").removeClass("active");
            $(this).parent().addClass("active");
	    $("#sort-threaded input").removeAttr("disabled");
        });

        $("#sort-newest a").bind("click", function () {
            NYM.echo.initStream({
                sortOrder: "reverseChronological",
                threadType: NYM.echo.getThreadType(),
                children: o.children,
		reTag: o.reTag,
		userID: o.userID
            });
            $(this).parents("#sort-buttons").find(".active").removeClass("active");
            $(this).parent().addClass("active");
            $("#echo-substream").empty();
	    NYM.echo.sortOptions = "newest";
	    $("#sort-threaded input").removeAttr("disabled");
	    setCookie("nymag_comments_sortPref","reverseChronological");
        });

        $("#sort-mine a").bind("click", function () {
            var user = new Echo.User({
                "appkey": NYM.echo.apiKey()
            });
            user.init(function () {
                var accounts = user.getActiveAccounts();
                var userID = accounts[0].identityUrl;
                NYM.echo.initStream({
                sortOrder: "reverseChronological",
                threadType: NYM.echo.getThreadType(),
                children: o.children,
                userID: userID
                });
                $("#echo-substream").empty();
            });
            $(this).parents("#sort-buttons").find(".active").removeClass("active");
            $(this).parent().addClass("active");
	    $("#sort-threaded input").removeAttr("disabled");
	    NYM.echo.sortOptions = "mine";
        });

    },
    loadCommentTouts: function (o) {
      o = $.extend({
        threshold: 1,
        displayLink: false,
        template: "",
        permalink: "",
        start: 0
      }, o || {});

        
      if($.browser.msie) { var muxEnd = o.start + 5; } else { var muxEnd = o.start + 10; }
      var muxEnd = o.start + 4;
      var entryTotal = $('.entry').length;
      var commentCounts = new Array();
      var queryStr = 'childrenof:';
      var domain = 'http://api.echoenabled.com/v1/mux';
      var appkey = "appkey=" + NYM.echo.apiKey();
      var method = '"method":"count",';
      var queryFilters = " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)";

      $('.entry').each(function (x, end) {
        x = parseFloat(x);
        if (x == muxEnd) {
          return false;
        }
        if ($(this).attr('data-permalink') && !$(this).hasClass("mux")) {
          var echoCountId = 'echo-count-' + x;
          $(this).addClass(echoCountId).addClass("mux");
          var id = '"id":"' + echoCountId + '",';
          var blogPermaLink = $(this).attr('data-permalink');
          var currDomain = window.nymag.domains.domain;
          if (blogPermaLink.indexOf("http:") == -1) { blogPermaLink = currDomain + blogPermaLink; }			

          if(nymag.domains.domain.match("vulture.com")) {
            blogPermaLink = blogPermaLink.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
          } else if(document.URL.match("/daily/intelligencer/")) {
            blogPermaLink = blogPermaLink.replace("/daily/intelligencer/", "/daily/intel/");
          }
            
          var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
          commentCounts.push(commentQuery);
        }
      });

      if (o.permalink != "") {
        var echoCountId = 'echo-count-1';
        $("." + echoCountId).attr("data-permalink", o.permalink + "comments.html");
        var id = '"id":"' + echoCountId + '",';
        var blogPermaLink = o.permalink;
        var currDomain = window.nymag.domains.domain;
        if (blogPermaLink.indexOf("http:") == -1) { blogPermaLink = currDomain + blogPermaLink; }
        
        if(nymag.domains.domain.match("vulture.com")) {
          blogPermaLink = blogPermaLink.replace(nymag.domains.domain, "http://nymag.com/daily/entertainment");
        } else if(document.URL.match("/daily/intelligencer/")) {
          blogPermaLink = blogPermaLink.replace("/daily/intelligencer/", "/daily/intel/");
        }
        
        var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
        commentCounts.push(commentQuery);
      }
      
      commentCounts = commentCounts.join('},{');
      var urlQuery = domain + '?' + appkey + '&requests=[{' + commentCounts + '}]&callback=?';
      urlQuery = encodeURI(urlQuery);
      $.getJSON(urlQuery, function (data) {
        $.each(data, function (i) {
          var commentLink = $("." + i).attr("data-commentlink");
          var permalink = $("." + i).attr("data-permalink");
          var countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>";
          if (commentLink === "false") {
            if (this.count >= o.threshold) {
              $("." + i + " .comment-tout").html("<span>" + countText + "</span>");
            }
          } else if ((o.displayLink)) {
            if (this.count == 0) {
              if (o.template == "articles-truncated") {
                countText = "Add Comment";
              } else {
                countText = "Comment";
              }
            } else if (this.count == 1) {
              if (o.template == "articles-truncated") {
                countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>&nbsp;Comment&nbsp;Add Yours";
              } else {
                countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>Comment";
              }
            } else {
              if (o.template == "articles-truncated") {
                countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>&nbsp;Comments&nbsp;Add Yours";
              } else {
                countText = "<strong class=\'article_comment_count\'>" + this.count + "</strong>Comments";
              }
            }
            $("." + i + " .comment-tout").html("<span><a class=\'extra\' href=\'" + permalink + "#comments\'>" + countText + "</a></span>");
          } else {
            if (this.count >= o.threshold) {
              $("." + i + " .comment-tout").html("<span><a class=\'extra\' href=\'" + permalink + "#comments\'>" + countText + "</a></span>");
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
          permalink: o.permalink
        });

      }
    },
    loadEcho: function (o) {
        o = $.extend({
			membership: "nym",
            template: "nym-blogs",
	    	commentStatus: "Enabled"
        }, o || {});

		o.commentStatus = o.commentStatus.toLowerCase();

		if (o.commentStatus == "disabled") { 
		 	$("#comments").remove();
		 	return false;
		}

        if (o.commentStatus == "frozen") {
			$("#bottom-submit-form, #submit-form, .echo-add").remove();
		 	$("#counter-text").css("border","none"); 
        }
		NYM.echo.initStream(o);
		var initRender = Echo.Broadcast.subscribe("Stream.onReady", function (topic, data, contextId) {
			if (o.template != "articles-truncated" && o.commentStatus != "frozen") {
				NYM.echo.initSubmit(o);
			}
		 	
			// initiate second Submit Form
		 	var o2 = o;
		
		 	o2.targetDom = "bottom-submit-form";
		
		 	if (o.template != "articles-truncated" && o.commentStatus != "frozen") {
				NYM.echo.initSubmit(o2);
			}

			$("#bottom-submit-form, #bottom-submit-form .echo-submit-container").show();
			if ($("#comment-total").hasClass("counter-inited") == false) {
				NYM.echo.loadCounter(o);
		        $("#comment-total").addClass("counter-inited");
		        $(".echo-add").bind("click", function(){
					$("#submit-form").toggleClass("active");
				});
			}
			Echo.Broadcast.unsubscribe("Stream.onReady",initRender);
			if (o.template == "articles-truncated") {
				$(".nymag-submit-form, #comment-total, #sort-buttons, .echo-stream-more, .echo-item-reportAbuse").remove();
		        $(".echo-item-content:last").addClass("last-comment");
		        $("#echo-comments").hide();
			}
			if (o.template == "myny-comments") {
				$(".nymag-submit-form, .echo-item-controls, #comment-total .divider, #comment-total .echo-add").remove();
			}
		});
		$("#submit-form").show().removeClass("loading");
		$("#comment-total").show();
		$("#echo-stream").show();
		$("#sort-buttons").css("display", "inline");

		var user = new Echo.User({
			"appkey": NYM.echo.apiKey()
		});
		user.init(function () {
			var accounts = user.getActiveAccounts();
		    var moderator = user.isAdmin();
		    var userLogged = accounts[0].loggedIn;
		    if (userLogged == "true") {
				$("#sort-mine").show();
		        $("#echo-stream").addClass("logged-in");
		        $("#echo-substream").addClass("logged-in");
		    }
		    if (moderator == true) {
		        $("#echo-stream").addClass("moderator");
		    }
		});
    },
    loadLogin: function (o) {
        o = $.extend({
            membership: "nym",
	    appendSessionID: ""
        }, o || {});

	if (o.membership == "nym") {
		loadLogin("#popup-lightbox");
	} else {
                $.fancybox({
                        'autoScale': false,
                        'height': 240,
                        'href': o.appendSessionID("https://nymag.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fapi.echoenabled.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="),
                        'onClosed': function() {
                                // remove dynamic height/width calculations for overlay
                                if ($.browser.msie && document.compatMode != 'CSS1Compat') {
                                        var style = $('#fancybox-overlay').get(0).style;
                                        style.removeExpression('height');
                                        style.removeExpression('width');
                                }
                        },
                        'onComplete': function() {
                                // fix dimensions of frame in IE in quirks mode
                                if ($.browser.msie && document.compatMode != 'CSS1Compat') {
                                        $('#fancybox-frame').css({
                                                width: 400 - 40,
                                                height: 240 - 40
                                        });
                                }
                        },
                        'onStart': function() {
                                Backplane.expectMessagesWithin(30);
                                // dynamical calculation of overlay height/width
                                if ($.browser.msie && document.compatMode != 'CSS1Compat') {
                                        var style = $('#fancybox-overlay').get(0).style;
                                        style.setExpression('height', 'Math.max(document.body.clientHeight, document.body.scrollHeight)');
                                        style.setExpression('width', 'Math.max(document.body.clientWidth, document.body.scrollWidth)');
                                }

                        },
                        'padding': 0,
                        'transitionIn': 'elastic',
                        'transitionOut': 'elastic',
                        'type': 'iframe',
                        'width': 400
                });

	}
   },
   checkBadWords: function (o) {
        o = $.extend({
	    textBody: ""
        }, o || {});
        var text = o.textBody.toLowerCase();
        var text = text.split(/\W+/);
        var caughtWords = new Array();
   		var badWords = new Array();
		badWords = ["arsehole","assh0le","assh0les","asshole","assholes","asswipe","bytchassnigga","chink","chinks","cock","cockhead","cocks","cocksuck","cocksucker","cocksuckers","cocksucking","coksucker","cum","cums","cunt","cuntree","cuntry","cunts","c*unt","d0uchebag","dickface","dickhead","dipshit","dipshits","doosh","dooshbag","dooshbags","dothead","douchbag","douchbags","douchebag","douchebags","douches","dovchebag","dumbfuck","dumbfuck","dumbfucks","dumbshit","dumbshits","f8ck","f8cked","f8cking","fag","fagg","fagg0t","fagg0ts","fagget","faggit","faggot","faggotry","faggots","faggy","fagit","fags","fcking","fckn","fcuk","fcuking","fkn","fuck","fucka","fucke","fucked","fucken","fucker","fuckers","fuckface","fuckhead","fuckheads","fuckhed","fuckin","fucking","fuckn","fucks","fuckup","fuckups","fuk","fukin","fukk,fukker,f*ck","fukka","fullmalls","fuqing","fuuck","fvck","fvcking","golem","goniff","gook","gooks","japs","jordaner","kike","kikes","kunt","kuntree","kuntry","kunts","leftard ","lesbo","lesbos","lezbo","libtard","libtarded","libtardism","libtards","motherfuck","motherfucken","motherfucker","motherfuckers","motherfuckin","motherfucking","n1gger","negress","ni99er","nigga","niggah","niggahs","niggard","niggardly","niggas","niggaz","nigger","niggers","niggger","nigguh","nigguhs","nigs","niguhs","nigers","penisenlargement","phag","phags","phuck","phucking","phuk","phuking","pussies","pussy","raghead","ragheads","repiblitarded","republitard","republitards","republiturd","republotard","republotarded","republotards","repuglitard","repuglitards","repuglotard","repuglotarded","repuglotards","sandniggers","shiitehead","shithead","shitheads","shithed","spic","spics","teatard","teatarded","teatards","towelhead","twat","homos","skanks"];
   		$.each(badWords, function(index,value) {
   			var badWordStart = $.inArray(value,text)
   			if (badWordStart != -1) { 
   				caughtWords.push(value);
   			}
   		})
   		if (caughtWords.length > 0) { return caughtWords; } else { return true; }
   		
   		
   },
           loadMostCommented: function(o) {
                o = $.extend({
                        domain:"(scope:http://www.nymag.com/*)",
                                        timeframe: "3 day ago",
                                        elementId: "most-commented ul",
                                        section: "source:DailyIntel,TheCut,TheSportsSection,Vulture,NewYorkMagazine,GrubStreetBoston,GrubStreetChicago,GrubStreetLosAngeles,GrubStreetNewYork,GrubStreetPhiladelphia,GrubStreetSanFrancisco",
					items: 5,
					dot: "."
                }, o || {});
			if($.browser.msie) {var asplit = 3;} else {var asplit = 10;}
                        $("#"+o.elementId).parents("#most-commented").addClass("loading");
                        var appkey = "appkey=" + NYM.echo.apiKey();
                        // temporaraly setting everythign to 3 days
			            o.timeframe = "3 days ago";
			var urlQuery = "http://api.echoenabled.com/v1/search?q=" + o.domain + " type:article sanitizeHTML:false after:\'" + o.timeframe + "\' source:" +o.section+" -state:ModeratorDeleted sortOrder:repliesDescending itemsPerPage:20 children:0 &" + appkey + "&callback=?";
                        var articleList = new Array();
                        var queryStr = 'childrenof:';
                        var domain = 'http://api.echoenabled.com/v1/mux';
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
					var blogPermaLink = value.url;
					var currDomain = window.nymag.domains.domain;
					if (blogPermaLink.indexOf("http:") == -1) { blogPermaLink = currDomain + blogPermaLink; }
					blogPermaLink = blogPermaLink.replace("http://vulture.com","http://www.vulture.com").replace("www.vulture.com","nymag.com/daily/entertainment");
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
                                $.ajax({url:muxQuery,dataType:"jsonp",type: "GET",success: function(data) {
                                        $.each(data, function(i,x) {
						if (x.count >=0) {articleList[i].commentCount = x.count;}
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
                articleList = articleList.sort(NYM.echo.sortNumber);
                        $.each(articleList, function(i,x) {
                        if (i==o.items) { return false; }
                        var num = i+1,listClass = "";

 						if(num == o.items) { listClass = "last";}
						x.url = x.url.replace("http://nymag.com/daily/entertainment", "http://www.vulture.com");				
						x.url = x.url.replace("http://vulture.com", "http://www.vulture.com");

                        $("#"+o.elementId).parents("#most-commented").removeClass("loading");
                        $("#" + o.elementId).append("<li id=\'number-"+num+"\' class="+listClass+"><span class=\'num\'>"+num+o.dot+"</span><a name='&lpos=" + NYM.config.blogName + ": HomePage: Most Popular: Most Commented' class=\'hed\' href=\'" + x.url + "\'>" + x.title + "</a>  <a name='&lpos=" + NYM.config.blogName + ": HomePage: Most Popular: Most Commented' href=\'" + x.url + "\' class=\'tout\'><strong class=\'article_comment_count\'>" + x.commentCount + "</strong></a>");
                       });
                }
                });

            },
	    loadTopStories: function(o) {
        	o = $.extend({
            	threshold: 0,
           	 	displayLink: false,
            	template: "",
            	permalink: "",
            	start: 0
            }, o || {});
            
        	if($.browser.msie) { var muxEnd = o.start + 5; } else { var muxEnd = o.start + 10; }
        	var muxEnd = o.start + 4;
        	var entryTotal = $('#top-stories-promo ul .image a').length;
        	var commentCounts = new Array();
        	var queryStr = 'childrenof:';
        	var domain = 'http://api.echoenabled.com/v1/mux';
        	var appkey = "appkey=" + NYM.echo.apiKey();
        	var method = '"method":"count",';
       	 	var queryFilters = " type:comment source:nymag.com (-state:ModeratorDeleted,ModeratorFlagged,SystemFlagged -user.state:ModeratorBanned OR user.roles:administrator -state:ModeratorDeleted)";
			$("#top-stories-promo ul .image a").each(function(x,end) {		
            	x = parseFloat(x);
            	if (x == muxEnd) {
                	return false;
            	}
            	if (!$(this).hasClass("mux")) {
                	var echoCountId = 'echo-counttop-' + x;
                	$(this).attr("id",echoCountId)
                	$(this).addClass("mux");;
                	var id = '"id":"' + echoCountId + '",';
					var blogPermaLink = $(this).attr("href");
					if (blogPermaLink.indexOf("http:") == -1) { blogPermaLink = nymag.domains.domain + blogPermaLink; }
					blogPermaLink = blogPermaLink.replace(nymag.domains.domain,nymag.domains.domain.match("vulture.com")?"http://nymag.com/daily/entertainment":nymag.domains.domain);
                	var commentQuery = id + method + '"q":"' + queryStr + blogPermaLink + ' ' + queryFilters + ' children:100 ' + queryFilters + '"';
                	commentCounts.push(commentQuery);
            	}
	
			});
			

        	commentCounts = commentCounts.join('},{');
       		 var urlQuery = domain + '?' + appkey + '&requests=[{' + commentCounts + '}]&callback=?';
        	urlQuery = encodeURI(urlQuery);
        	$.getJSON(urlQuery, function (data) {
            	$.each(data, function (i) {
					if (this.count >= o.threshold) {
						$("#"+ i).parent().next("a").attr("name","&lpos="+NYM.config.blogName+": Story: Top Stories").append("<b class=\'info\'>&nbsp;&nbsp;<i class=\'comment-tout\' style=\'display:inline;\'>"+this.count+"</i></b>");
					}
            	});
       		 });
       		 
       		 
        	if (muxEnd < entryTotal) {
         	   this.loadTopStories({
           	     start: muxEnd,
           	     displayLink: o.displayLink,
            	    threshold: o.threshold,
            	    template: o.template,
             	   permalink: o.permalink
           	 });
        }



	    },
            sortNumber: function(a,b) {
                return b.commentCount - a.commentCount;
            },
	    getSortOrder: function(o) {
		var sortOrder = readCookie("nymag_comments_sortPref");
		var currentSort = NYM.echo.sortOptions;
		if (currentSort !="popular" && currentSort != "most-replies" && currentSort != "mine") {
			if (!sortOrder) {
				setCookie("nymag_comments_sortPref","reverseChronological");
				$("#sort-buttons #sort-newest").addClass("active");
				$("#sort-threaded input").removeAttr("disabled");
				return "reverseChronological";
			} else {
				if (sortOrder == "reverseChronological") $("#sort-buttons #sort-newest").addClass("active");
				if (sortOrder == "chronological") $("#sort-buttons #sort-oldest").addClass("active"); 
				$("#sort-threaded input").removeAttr("disabled");
				return sortOrder;
			}
		}
	    },
	    getThreadType: function(o) {
                var threadType = readCookie("nymag_comments_threadType");
                if (!threadType) {
                        setCookie("nymag_comments_threadType","childrenof");
			$("#sort-threaded input[name=threaded]").attr("checked",true);
			$("#sort-active").show();
                        return "childrenof:";
                } else {
                        if (threadType == "childrenof") {
				$("#sort-threaded input[name=threaded]").attr("checked",true);
				$("#sort-active").show();
			} else if (threadType == "scope") {
				$("#sort-threaded input[name=threaded]").attr("checked",false);
				$("#sort-active").hide();
			}
                        return threadType + ":";
                }
return "childrenof:";
	    },
   sortOptions: "newest"
};
