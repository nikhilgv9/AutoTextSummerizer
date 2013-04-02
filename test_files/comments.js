var article_comment_counts = new Array();
var is_logged_in = null;

$.ajaxSetup({ timeout: 10000 });

function open_win(url) {
	var qtwin = window.open(url,"login_win",'toolbar=,location=0, directories=0,status=0,menubar=0,scrollbars=1,resizable=1, width=770,height=700');
	qtwin.focus();
}

function open_win_small(url) {
	var qtwin = window.open(url,"login_win",'toolbar=,location=0, directories=0,status=0,menubar=0,scrollbars=1,resizable=1, width=770,height=350');
	qtwin.focus();
}

function update_form_login_state() {
	login_state_changed = is_logged_in == null ? true : (is_logged_in != isLoggedInUser());
	is_logged_in = isLoggedInUser();

	$("#comments_logged_in_user").html(unescape(getUserName()));

	if (login_state_changed) {
		show_error("");
		$("div.submit").show();
		$("#login_form").hide("slow");

		if (is_logged_in) {
			$("#login-message").hide();
			if(typeof FB != "undefined"){
			    if(FB.Connect.get_status().result == 1){
					$("#comments_logged_in_status").removeClass("no-pic");
					FB.XFBML.Host.parseDomElement(document.getElementById('comments_logged_in_status'));
				} else{
					$("#comments_logged_in_status").addClass("no-pic");
			    }
			}
			$("#comments_logged_in_status").show();
			$("#logged_out_bar").hide();
			$("#logged_in_bar").show();
			$("#user_name").html(unescape(getUserName()));
		} else {
			$("#comments_logged_in_status").hide();
			$("#login-message").show();
			$("#logged_out_bar").show();
			$("#logged_in_bar").hide();
		}
	}
}

function nym_login_failed(error_message) {
	show_error("<li>" + unescape(error_message) + "</li>");
}

function nym_logged_in() {
	$("#comment-form").submit();
}

function is_blog(url_or_path) {
	if (url_or_path.match(/^http/)) {
		return url_or_path.match(/^http:\/\/[^\/]+\/daily/) ? true : false;
	} else {
		return url_or_path.match(/^\/daily/) ? true : false;
	}
}

function get_article_id_by_url(url) {

    var orig_url = url;

    if (!url) {
            url = window.location.pathname;
    }
    if (url.match(/^http/)) {
        url = url.replace(/^http:\/\/[^\/]+/, "");
    }

    hostname = window.location.hostname;

    /*
     * commenting out spurious coersion for stg and qa
    if (hostname.match("nymetro")) {
        url = "/daily/food" + url;
    }
    */

    if (is_blog(url) || (orig_url && orig_url.match('grubstreet'))) { //always consider grubstreet domain to be a blog

        return url.replace(/^\//, "").replace(/\//g, "-");
    } else {
        return url.replace(/\/[^\/]*$/, "").replace(/^\//, "").replace(/\//g, "-");
    }
}

function get_article_title() {

    var title = $("meta[name='Headline']").attr("content");

    if (!title) {
        title = $("title").html().replace(/\-.*$/, "");
    }

    return title;
}

// args: { container_id, article_url }
function get_comment_count(args) {
	var container_id = args ? args.container_id : null;
	var article_id = get_article_id_by_url(args && args.article_url ? args.article_url : null);

	if (!isNaN(article_comment_counts[article_id])) {
		return;
	}

	article_comment_counts[article_id] = 0;

	$.ajax({
		type: "GET",
		url: "/comments/stories/" + article_id + "/comments/count",
		success: function(data) {
			show_comment_count(container_id, article_id, data);
		},
		error: function (error, msg) {
			if (error.status == 404) {
				article_comment_counts[article_id] = 0;
				show_comment_count(container_id, article_id, "0");
			}
		}
	});
}

// multi-comment count version, receives an array of the standard
// get_comment_count args
function get_comment_counts(args) {

        var articles = {};
        var article_ids = "";

        for (var i = 0; i < args.length; i++ ){
            var arg = args[i];
            var article_id = get_article_id_by_url(arg && arg.article_url ? arg.article_url : null);

            if (article_id){
                if(typeof articles[article_id] != "undefined"){
                    var c_id = articles[article_id].container_id;
                    if(typeof c_id == "object"){
                        articles[article_id].container_id = c_id.push(arg ? arg.container_id : null);
                    } else {
                        articles[article_id].container_id = [];
                        articles[article_id].container_id.push(c_id);
                        articles[article_id].container_id.push(arg ? arg.container_id : null);
                    }
                } else {
                    articles[article_id] = {container_id:  arg ? arg.container_id : null};
                }
                if(i!=0) article_ids += "&";
                article_ids += "ids=" + article_id;
            
            }
        }
            article_comment_counts[article_id] = 0;

            $.ajax({
                    type: "GET",
                    url: "/comments/get_all_comments",
                    data: article_ids,
		            type: 'POST',
                    dataType: "json",
                    success: function(data) {
                            var comments = data.comments;
                            for(var i=0; i < comments.length; i++){
                                var container_id = articles[comments[i].story_id].container_id;
                                if(typeof container_id == "object"){
                                    for(var j=0; j<container_id.length; j++)
                                        show_comment_count(container_id[j], comments[i].story_id, comments[i].count);
                                } else {
                                    show_comment_count(container_id, comments[i].story_id, comments[i].count);
                                }
                            }
                    },
                    error: function (error, msg) {
                            if (error.status == 404) {
                            }
                    }
            });
}
function show_comment_count(container_id, article_id, data) {
	if (data && data.match(/\d/)) {
		var container_selector = container_id ? "#" + container_id + " ": "";
		article_comment_counts[article_id] = data.replace(/\D/, "");

		$(container_selector + ".article_comment_count").each(function() {
			this.innerHTML = article_comment_counts[article_id];
			
			if(article_comment_counts[article_id] > 0){
			    this.style.display = "inline";
			} else if ( $(this).parents("#content-primary").length && !$(this).parents(".clickable").length ) {
			    this.style.display = "inline";
			}
		});

		if (article_comment_counts[article_id] == 0) {
			$(container_selector + ".no_comments").each(function() {
				this.style.display = "";
			});
		} else if (article_comment_counts[article_id] == 1) {
			$(container_selector + ".one_comment").each(function() {
				this.style.display = "";
			});
		} else {
			$(container_selector + ".multiple_comments").each(function() {
				this.style.display = "";
			});
		}
	}
}

function show_error(message) {
	$(".miniwarning").html(message ? '<ul class="warning">' + message + '</ul>' : '');

	if (isLoggedInUser()) {
		$("#login_form").hide();
		$("div.submit").show();
	}
}


// The minibrowser object
var minibrowserobj = {

	// Member Variables
	
	minibrowserbox: '#minibrowserbox',
	minibrowser_selector: '.minibrowser',
	article_id: '',
	onreload_enabled: false,

	// Member Functions
	
	//	init args: minibrowserbox, minibrowser_selector, path_prefix, path_postfix, href, onload, onreload
	init: function(args) {
		this.set_minibrowserbox(args.minibrowserbox);
		this.set_minibrowser_selector(args.minibrowser_selector);
		this.set_article_id();
		this.path_prefix = args.path_prefix;
		this.onload = args.onload;
		this.onreload = args.onreload;
		this.get(args.href ? args.href : (
			(args.path_prefix ? args.path_prefix : "") +
			"/stories/" + this.article_id + "/comments/" +
			(args.path_postfix ? args.path_postfix : "viewpost")
		));
		
		return this;
	},
	
	//set_minibrowserbox: set the id of the div which is this particular
	//minibrowser, or just go with the default.
	
	set_minibrowserbox: function(id)
	{
		if (id) {
			this.minibrowserbox = id;
		}
		
		return this;
	},
	
	//set_minibrowser_selector: this is the class name that you use to find
	//that a given anchor or a form should be handled by the minibrowser
	
	set_minibrowser_selector: function (selector) {
	
		if(selector)
		{
			this.minibrowser_selector = selector;
		}
		
		return this;
	},

	set_article_id: function() {
		this.article_id = get_article_id_by_url();
	},
		
	// binds: given an identifier, create the binds
	
	binds: function (identifier) {

		// invoke each of the identifiers.
		this.anchor_binds(identifier);
		this.post_binds(identifier);
	},
	
	//anchor_binds: do binds for anchor tags against an identifier
	
	anchor_binds: function (identifier) {
	
		minibrowser = this;
	
		$(identifier)
			.find( 'a' + minibrowser.minibrowser_selector )
			.each( function () { 
				if (minibrowser.path_prefix != null) {
					this.href = minibrowser.rewrite_url(this.href);
				}

				$(this).bind( 'click', function () {
					minibrowser.get(this.href);
					return false;
				});
			});
	},

	//post_binds: bind form posts against an identifier
	
	post_binds: function (identifier) {
	
		minibrowser = this;
		$(identifier)
			.find( 'form' + minibrowser.minibrowser_selector )
			.each( function () {
			
				form = this;
			
				if (minibrowser.path_prefix != null) {
					$(this).attr("action", minibrowser.rewrite_url($(this).attr("action")));
				}

				$(form)
					.find(':submit,input:image')
					.bind( 'click', function () {
					
						//alert('got click' + form.name);
						form.clk = this;
					})
					.end()
					.bind( 'submit', function () {
						minibrowser.post(this);
						return false;
					});
			});
	},

	// onload gets executed after minibrowser makes an http request (get or post) and 
	// updates its contents
	callback_onload: function() {
		if (typeof this.onload == "function") {
			this.onload();
		}

		if (this.onreload_enabled) {
			this.callback_onreload();
		}

		this.onreload_enabled = true;
	},

	// onreload callback is the same as onload but doesn't get executed at first time, when
	// minibrowser makes its initial request
	callback_onreload: function() {
		if (typeof this.onreload == "function") {
			this.onreload();
		}
	},

	// rewrite_url: makes relative urls and adds path prefix for proxy-passing
	rewrite_url: function (url) {
		return url.replace(/https?:\/\/[^\/]+/, this.path_prefix);
	},
	
	//  : serialize a form.  Watch out, this doesn't do file uploads
	// as far as I know.
	
	getformdata: function (form) {
		if (!form) return {};
		//if (form.match('bingshop.us') || form.match('clothes6.org')){
		//	return {}
		//}

		data = {};
		data[form.clk.name] = form.clk.value;

		data.href = window.location.href;
		data.title = get_article_title();

		for (var i=0; i<form.elements.length; i++) {
			var e = form.elements[i];
			if(e.name) {
				if(e.type =='checkbox' || e.type=='radio')
				{
					if(e.checked)
					{
						data[e.name] = e.value;
					}
				}
				else
				{
					data[e.name] = e.value;
				}
			}
		}

		return data;
	},
	
	// get: Perform a Get for a given href and insert the results 
	// into the minibrowser div.
	
	get: function(href) {
	
		minibrowser = this;
		if (!href) return; 
		$.ajax({
			type:'GET',
			url: href,
			success: function (response) {
				if (response.length) {
					$(minibrowser.minibrowserbox)[0].innerHTML = response;
					minibrowser.binds(minibrowser.minibrowserbox);
					minibrowser.callback_onload();
				}
			},
			error: function (error, msg) {
				/*
				//If it is a 404 style error, we need to get the title and the
				//urn and redo this as a post.  We should probably break this
				//out into a seperate area.
				if(error.status == 404)
				{
					$.ajax({
						type: 'PUT',
						url: href,
						data: { title: get_article_title(), href: window.location.href },
						success: function (response) {
							$(minibrowser.minibrowserbox).html(response)
							minibrowser.binds(minibrowser.minibrowserbox);
							minibrowser.callback_onload();
						}
					});
				}
				*/
			},
			complete: function( httpob, text) {
				scrollto = httpob.getResponseHeader('X-NYMAGCOMMENTING-SORTING');
				if(scrollto)
				{
					document.location.hash=scrollto;
				}
			}
		});
	},
	
	// post: gather form stuff and post.
	
	post: function(form) {
		minibrowser = this;
		if (!form) return;

		$.ajax({
			type:'POST',
			url: form.action,
			data: minibrowser.getformdata(form),
			success: function (response) {
				$(minibrowser.minibrowserbox)[0].innerHTML = response;
				minibrowser.binds(minibrowser.minibrowserbox);
				minibrowser.callback_onload();
			},
			error: function (error, msg, e) {
				errormsg = error.responseText;
				show_error(errormsg);
			},
			complete: function( httpob, text) {
				scrollto = httpob.getResponseHeader('X-NYMAGCOMMENTING-SORTING');
				
				if(scrollto)
				{
					document.location.hash=scrollto;
				}
			}
		});
	}
	
	// END.  Remember the last item shouldn't have a trailing ','!
};


// Create the plugin!

jQuery.fn.minibrowser = function(settings) {
	minibrowserbox = this;

	settings = jQuery.extend({  
		minibrowser_selector: '.minibrowser',
		path_prefix: null,
		href: null,
		onload: null,
		onreload: null
	}, settings);

	return minibrowserbox.each(function() { 
		minibrowser = minibrowserobj.init({
			minibrowserbox: minibrowserbox, 
			minibrowser_selector: settings.minibrowser_selector,
			path_prefix: settings.path_prefix,
			href: settings.href,
			onload: settings.onload,
			onreload: settings.onreload
		});		
	});
}


function initCommentForm() {

	if (!login_timer) 

		login_timer = window.setInterval(update_form_login_state, 1000);



    $("#comment-body").wordCount({counterElement:"#comment-meta label.comment-txt b"});

	var comment_form = {

	

		validate: function (form,submit) {

			this.form = form;
			this.submit = submit;
			errors = new Array;
			if(commenting_info && commenting_info.count>350) {

				errors.push('Too Wordy');

			}

			if(!form.elements['content'].value) {

				errors.push('Comment missing');

			}

			error = errors.join('. ');
			if( error ) {

				error += '.';

				$(submit)

					.find('div.warning p')
					.html( error )
					.end()
					.addClass('on');
				return false;
			}
			return true;
		}
	};

	$('a.abusemodal')
	.each(
		function () {
			this.href = minibrowser.rewrite_url(this.href);
			$(this)
			.click(
				function (){
					abuse_target = $(this).parent().find('.abuse_target');
					$('div').remove('#modal_box');
					$.get(
						this.href, 
						function(data) {
							$(abuse_target)
							.html(data)
							.ready( 
								function () {
									$(abuse_target)
									.find('#abuseform')
									.each( 
										function () {
											$('#abuseform')
											.attr(
												"action",
												minibrowser.rewrite_url($(this).attr("action"))
											)
											.submit(
												function () {
													return false;
												}
											);
											$('#abuseform')
											.find('input.letsgo')
											.each( 
												function () {
													$(this).bind(
														'click', 
														function () { 
															abusepost = {};
															abusepost[this.name]=1;
															$.ajax({
																type: 'POST',
																url: $('#abuseform').attr('action'),
																data: abusepost,
																success: function (response) {
																	$('#modal_box #reportAbusePopup')
																		.html('<div onclick="$(\'div\').remove(\'#modal_box\')" style="margin: 1.6em; margin-bottom: .5em">Thank you for alerting us to a possible problem.</div>');
																	$('#modal_box').fadeOut(1600);
																},
																error: function (response) {
																	$('div').remove('#modal_box');
																}
															});
														}
													);
												}
											);
										}	
									);	
								}
							);
						}
					 );
					return false;
				}
			);
		}
	);
	
	$('#comment-form')
		.each(
            function() {
			form = this;
			$(this)
				.find('div.submit')
				.each( function (){
					submit = this;
					$(this)
						.find('input')
						.hover(
							function () {
								comment_form.validate(form,submit);
							},
							function () {
								$(submit).removeClass('on');
							}
						)
						.click( 
                            function(event){
	                            event.preventDefault();

								if(!comment_form.validate(form,submit)) {
									return false;
								}
    
	                            var is_post = this.name == "btn_post";
	                            $("#comment_post").val(is_post ? "1" : "0");
	                            $("#comment_preview").val(is_post ? "0" : "1");

								if (!isLoggedInUser()) {
									$("div.submit").hide();
									$("#login_form").show('',refreshFBML);
									return false;
								}

	                            if (is_post && $('#facebook:checked').val() != null ){ 
									var headline = document.getElementsByName("headline");
                                    headline = headline[0] ? headline[0].content : document.getElementsByName("Headline")[0].content; 
							        var description = document.getElementsByName("description");
									description = (description.length) ? description[0].content : headline;
									var link = window.location.href; //todo: change me
							        link = link.split("#")[0];
							        
							        var attachment = {'name': headline, 'href': link, 'description': description};
							        
	                                sendToFacebook($('#comment-body').val(),function(){ $("#comment-form").submit(); $.getJSON(window.nymag.domains.secure + '/login/doesExternalUserExist/?callback=?'); },attachment,"This is how your comment will appear on Facebook");
	                            }
	                            else{
	                                $("#comment-form").submit();
	                            }
	
								return false;
                            }
                        );
				});
		}
    );
    
	//Attach nymag_pageView selectively (onreload is too indiscriminant).
	$(document).ready( function() {
		$('a.minibrowser').bind("click", function() {
			if((this.innerHTML.search('Newest')>=0) || (this.innerHTML.search('Oldest')>=0)) return;
			if((typeof nymag_setMetadata != 'function') || (typeof nymag_pageView != 'function')) return;
			nymag_setMetadata({'content.subtype' : 'Commenting'});
			nymag_pageView();
		})
	});
}

var commenting_info = {
	count: 0
};

jQuery.fn.wordCount = function(params)
{
    var p =  {counterElement:"display_count"};
    var total_words;
    if(params) {
        jQuery.extend(p, params);
    }

    jQuery(p.counterElement).prepend("<span>0 of 350 words allowed. </span>");
    //for each keypress function on text areas
    this.keypress(function(){
        commenting_info.count=this.value.split(/[\s\.\?]+/).length;

        var countSpan = jQuery(p.counterElement + " span");
        countSpan.html(commenting_info.count + " of 350 words allowed. ");

        if(commenting_info.count>350) countSpan.addClass("warning");
        else countSpan.removeClass("warning");
    });
};

