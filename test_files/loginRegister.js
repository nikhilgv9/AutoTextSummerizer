if (typeof window.nymag === "undefined") {
    window.nymag = {};
}

window.nymag.domains = {
    domain: "",
    secure: "",
    my: "",
    prod: false,
    set: function () {
        var domainLevels = document.domain.split("."),
            subDomain = false,
            domain = "";

        if (document.domain.search(/nymag\.com/) >= 0 || document.domain.indexOf("www.vulture.") > -1) {
            this.prod = true;
        } else if (document.domain.search(/grubstreet\.com/) >= 0 && document.domain.split('.').length === 3) {
            this.prod = true;
        } else {
            this.prod = false;
        }
	
        if (domainLevels.length >= 3 && this.prod) {
            subDomain = 2;
        } else if (domainLevels.length > 3) {
            subDomain = 3;
        }

        if (subDomain) {
            for (var i = domainLevels.length - subDomain; i <= domainLevels.length - 1; i++) {
                domain += domainLevels[i];
                if (i != domainLevels.length - 1) domain += ".";
            }
        } else {
            domain = document.domain;
        }
        
        this.domain = "http://" + document.domain;
        this.cookie = "." + domain.replace("www.", "");
        this.my = "http://my." + domain.replace("www.", "").replace("vulture.com", (domain.indexOf("dev.") > -1 || domain.indexOf("stg.") > -1 || domain.indexOf("qa.") > -1) ? "nymetro.com" : "nymag.com");
        
        if (this.prod && nymag.domains.domain.match('vulture')) {
            this.secure = "https://secure.vulture.com";
        } else if (this.prod && nymag.domains.domain.match('grubstreet')) {
            this.secure = "https://secure.grubstreet.com";
        } else {
            this.secure = "https://secure." + domain;
        }
        
        if (this.prod) {
            this.my = "http://my.nymag.com";
        }
    }
};
window.nymag.domains.set();


//updated login reg file
if (nymag.domains.domain.match("grubstreet")) $ = $;
window.nymag.loginRegister = {};

var getDomains = function () {
    if (nymag.domains.domain.indexOf('dev.') > 0) {
        return ["dev.nymag.biz", "dev.vulture.com", "dev.grubstreet.com"];
    } else if (nymag.domains.domain.indexOf('qa.') > 0) {
        return ["qa.nymetro.com", "qa.vulture.com", "qa.grubstreet.com"];
    } else if (nymag.domains.domain.indexOf('stg.') > 0) {
        return ["stg.nymetro.com", "stg.vulture.com", "stg.grubstreet.com"];
    }

    return ["nymag.com", "vulture.com", "grubstreet.com"];
};

window.nymag.loginRegister = {
    in_ajax: 0,
    validateTimer: 0,
    register_email: "",
    register_username: "",
    login_user: "",
    curr_container: "",
    callback: "",
    cookie_other_domain: nymag.domains.cookie.match("grubstreet") ? nymag.domains.cookie.replace("grubstreet", (nymag.domains.cookie.split(".").length > 3) ? "nymetro" : "nymag") : nymag.domains.cookie.replace((nymag.domains.cookie.split(".").length > 3) ? "nymetro" : "nymag", "grubstreet"),
    domains: getDomains(),
    fb_appid: function () {
        // set FB app id
        var appid;
        if (nymag.domains.domain.match(".dev")) {
            if (nymag.domains.domain.match(".vulture.com")) {
                appid = "219204411496650";
            } else {
                appid = "164574351267";
            }
        } else if (nymag.domains.domain.match(".qa")) {
            if (nymag.domains.domain.match(".grubstreet.com")) {
                appid = "123010931104252";
            } else if (nymag.domains.domain.match(".vulture.com")) {
                appid = "217988618287532";
            } else {
                appid = "357847397554";
            }
        } else if (nymag.domains.domain.match(".stg")) {
            if (nymag.domains.domain.match(".grubstreet.com")) {
                appid = "grubstg_appid";
            } else if (nymag.domains.domain.match(".vulture.com")) {
                appid = "162498493853207";
            } else {
                appid = "134556739904777";
            }
        } else {
            if (nymag.domains.domain.match(".grubstreet.com")) {
                appid = "206283005644";
            } else if (nymag.domains.domain.match(".vulture.com")) {
                appid = "158902697551841";
            } else {
                appid = "120608177953522";
            }
        }
        return appid;
    },
    sso: function () {
        for (var d = 0; d < nymag.loginRegister.domains.length; d++) {
            domain = nymag.loginRegister.domains[d];

            if (nymag.domains.cookie.lastIndexOf(domain) < 0) {

                var post;
                var session = readCookie("nymag_session");
                if (session != null) {
                    var bpChannel = readCookie("backplane-channel");

                    var iframe = $("<iframe src='' id='sso_iframe' style='height: 1px; width: 1px; visibility: hidden;'></iframe>");
                    var src = 'https://secure.' + domain + '/login/sso/?nymag_session=' + session;
                    if (bpChannel != null && bpChannel != '') {
                        src = src + "&backplane-channel=" + bpChannel;
                    }

                    iframe.attr("src", src);
                    $("body").append(iframe);
                    setTimeout(function(){
                        $('#sso_iframe').remove();
                    }, 5000);
                }
            }
        }
    } // endfunc

}

//////// SHARED FUNCTIONS

/* Legacy function calls - need to be removed at some point */

// Read the cookie
function readCookie(name) {
    var needle = name + "=";
    var cookieArray = document.cookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var pair = cookieArray[i];
        while (pair.charAt(0) == ' ') {
            pair = pair.substring(1, pair.length);
        }
        if (pair.indexOf(needle) == 0) {
            return pair.substring(needle.length, pair.length);
        }
    }
    return null;
}

function setCookie(name, value, days, domain) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = ";expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    if (domain) var dom = ";domain=" + domain;
    else dom = "";
    document.cookie = name + "=" + value + expires + dom + ";path=/;";
}


function eraseCookie(name, domain) {
    setCookie(name, "", - 1, domain);
}


/*
	Membership-related functions
*/

//Facebook Global Vars
var FB_id;
var FB_username;
var FB_email;

function setMYNYDropdownWidth() {
    // DROPDOWN WIDTH
    $('body.vulture #utilities #logged_in_bar .mynewyork').css("width", "auto");
    $('body.politics #utilities #logged_in_bar .mynewyork').css("width", "auto");

    var dropdownWidth = $('body.vulture #utilities #logged_in_bar .mynewyork').width() || $('body.politics #utilities #logged_in_bar .mynewyork').width();
    if (dropdownWidth > 50 && dropdownWidth < 120) {
        dropdownWidth = 120;
        // $('#utilities #logged_in_bar .mynewyork').css("width", dropdownWidth + "px");	
    }
    $('body.vulture #sub_nav_mynewyork ul').css("width", dropdownWidth + "px");
    $('body.politics #sub_nav_mynewyork ul').css("width", dropdownWidth + "px");
}

function isLoggedInUser() {
    var session = readCookie("nymag_session");
    var session_state = readCookie("nymag_session_state");
    return (session && session_state == 1) ? true : false;
}

function getUserName() {
    var name = readCookie("nymag_session_user");
    return isLoggedInUser() ? unescape(readCookie("nymag_session_user")) : "";
}

function getUserId() {
    return isLoggedInUser() ? readCookie("nymag_session_user_id") : "";
}

function updateLoginMessage(refresh) {
    NYM.loginReg.updateLoginMessage({
        "refresh": refresh
    });
}

function loadLegacyRegister(container, callback) { /* FB */
    NYM.loginReg.loadRegister();
    return false;
}

function loadLogin(container, callback) {
	var optionsObj = '';
	if(container) { 
		optionsObj = {
			container: container,
			callback: callback
		};
	}
	NYM.loginReg.loadLogin(optionsObj);
	return false;
}

function hideJQM() {
    $("#popup-lightbox").jqmHide();
}

$(function () {
    $("a.register-lightbox").unbind("click").click(function () {
        return NYM.loginReg.loadRegister();
    });
});

function closeLightbox() { /* FB */
    $(nymag.loginRegister.curr_container).jqmHide();
    window.parent.hideJQM();
    updateLoginMessage(true);
}

function bpUrlParam() {
    return (window.Backplane != undefined && Backplane.getChannelID() != false) ? "&bp_channel_id=" + encodeURIComponent(window.Backplane.getChannelID()) : "";
}

function logout(data) {
    NYM.loginReg.logout();
}

function logoutAll() {
    NYM.loginReg.logout();
}


//.toggleText
jQuery.fn.origText = function (a) {
    return this.each(function () {
        var t = this.value;
        $(this).bind("blur", function () {
            if (this.value == "") this.value = t;
        });
        $(this).bind("focus", function () {
            if (this.value == t) this.value = "";
        });
    });
};

//---- convert json to string
jQuery.extend({
    stringify  : function stringify(obj) {         
        if ("JSON" in window) {
            return JSON.stringify(obj);
        }

        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';

            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") {
                        v = '"' + v + '"';
                    } else if (t == "object" && v !== null){
                        v = jQuery.stringify(v);
                    }

                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

//// ----------- /// FACEBOOK \\\ ----------- \\\\

function initMembership() {
    NYM.loginReg.initMembership();
}


// OMNITURE TRACKING
$(document).unbind("click").click(function (e) {
    if ((e.target.nodeName == "SPAN" && e.target.className == "FBConnectButton_Text") || e.target.nodeName == "FB:INTL" || $(e.target).parent().attr('id') == "fb-suggestlogin" || $(e.target).parent().attr("class") == "fb-link") {

        var p = $(e.target).parents();
        var pos = "";
        if (p.filter("#empty_review_container").length) pos = "URR Login";
        else if (p.filter("#registration").length) pos = "Login Page";
        else if (p.filter("#login-litebx").length) pos = "Login Lightbox";
        else if (p.filter("#logged_out_bar").length) pos = "Top Nav";
        else if (p.filter("#add-comment").length) pos = "Comment Login";
        else if (p.filter("#fb-connect").length) pos = "MYNY Account Tab";
        else if (p.filter("#fbpromo-litebx").length) pos = "Registration FBC Prompt";
        else if (p.filter("#myny-promo-wrp").length) pos = "MYNY Right FBC Promo";
        else if (p.filter("#fb-suggestlogin").length) pos = "MYNY Account Pink Login";
        else pos = "(Unknown Button Location)";

        //omnitureCall("Service:Membership:Login:FBC:Connect to Facebook @ "+pos, "Connect with Facebook @ "+pos, document.location.href);
    }
});

function omnitureCall(heirarchy, heirarchyTitle, pagename, event) {
    $(document).ready(function () {
        nymag_setMetadata({
            'content.hierarchy': heirarchy
        });
        nymag_setMetadata({
            'content.hierarchy.title': heirarchyTitle
        });
        nymag_setMetadata({
            'content.pagename': pagename
        });
        nymag_pageView();
    });
}

// New login Reg Namespaced JS

if (typeof NYM == "undefined") window.NYM = {};
NYM.loginReg = {};
NYM.loginReg = {
    fbpopup: "",
    initMembership: function () {
        $("#logged_out_bar").after("<div id='popup-lightbox'></div>");
        NYM.loginReg.updateLoginMessage();
        NYM.loginReg.initPopup();
        $("#logged_out_bar a.register-lightbox").click(function (e) {
            e.preventDefault();
            return NYM.loginReg.loadRegister();
            return false;
        }).attr('href', nymag.domains.secure + '/registration/');
        $("#logged_out_bar ul a.login-lightbox").click(function (e) {
            e.preventDefault();
            return NYM.loginReg.loadLogin();
            return false;
        }).attr('href', nymag.domains.secure + '/accountcenter/login.cgi');
        $("#logged_out_bar .fb_login a.login-lightbox").click(function () {
            return NYM.loginReg.launchFBLogin();
            return false;
        }).attr('href', nymag.domains.secure + '/accountcenter/login.cgi');
        $("#utility_logout").live("click", function () {
            NYM.loginReg.logout();
            return false;
        });
        $("#nav-mynewyork").mouseenter(function () {
            setTimeout(function () {
                $("#utility_logout").attr('href', nymag.domains.secure + '/accountcenter/logout.cgi');
            }, 100);

        });
    }, // end init Membership
    updateLoginMessage: function (o) {

        o = $.extend({
            refresh: false
        }, o || {});
        if (o.refresh && (document.location.href.match(nymag.domains.secure) || document.location.href.match(nymag.domains.my))) {
            window.location.href = window.location.href;
        }
        var logged_in = isLoggedInUser();
        $('.vulture #utilities #logged_in_bar .mynewyork').css("width", "auto");

        var user_name = document.getElementById("user_name");
        if (user_name) user_name.innerHTML = getUserName();
        setMYNYDropdownWidth();
        var logged_out_bar = document.getElementById("logged_out_bar");
        if (logged_out_bar) {
            logged_out_bar.style.display = logged_in ? "none" : "block";
        }
        var logged_in_bar = document.getElementById("logged_in_bar");
        if (logged_in_bar) {
            logged_in_bar.style.display = logged_in ? "block" : "none";
            var userName = getUserName();
            $(document).ready(function () {
                $.ajax({
                    url: window.nymag.domains.secure + "/login/displayProfilePic/",
                    dataType: 'jsonp',
                    cache: true,
                    success: function (data) {
                        $('.vulture #utilities #logged_in_bar .mynewyork').css("width", "auto");
                        var displayStatus = data.status;
                        var mynyUserName = readCookie("nymag_session_user");
                        if (displayStatus == 1) {
                            $('#utilities').removeClass("fb_hide").addClass("fb_show").addClass('fb_connected').removeClass('fb_notconnected');
                            $('#fb-suggestlogin').hide();
                            var fbid = readCookie("fb_id");
                            if (fbid) {
                                $('#utilities .fbpic').html("<img src='http://graph.facebook.com/" + fbid + "/picture' width='14' height='14' alt=''>");
                            } else {
                                NYM.loginReg.getFBInfo();
                            }
                            $('#nav-mynewyork').attr("href", window.nymag.domains.my + "/" + mynyUserName + "/profile");
                        } else {
                            $('#utilities').addClass("fb_hide").removeClass("fb_show");
                            $('#utilities .fbpic').html("");
                        }
                        // DROPDOWN WIDTH
                        setMYNYDropdownWidth();
                    }
                });

                $('#nav-mynewyork').attr("href", window.nymag.domains.my + "/" + userName + "/profile");
            });
        }
        if (logged_in) {
            $("#utilities .fb_login").hide();
        } else {
            $("#utilities .fb_login").show();
        }
        if (window.Backplane != undefined) {
            Backplane.expectMessagesWithin(8);
        }
        
        if (window.nymag.nav === undefined) {
            $('#utilities').find('.mynewyork').hover(function() {
                $(this).addClass('hover');
                $(this).find('#sub_nav_mynewyork').css('left','auto');
                if ($('#sub_nav_mynewyork').html().length < 1) {
                    $.get('/includes/components/mast/nav/sub_nav_mynewyork.txt', function(data) {
                        $('#sub_nav_mynewyork').html(data);
                    });
                }
            },function () {
                $(this).removeClass('hover');
                $(this).find('#sub_nav_mynewyork').css('left','-1000em');
            });
        }
    }, // end updateLoginMessage()

    logout: function () {
        bp_param = (window.Backplane != undefined && Backplane.getChannelID() != false) ? "&bp_channel_id=" + encodeURIComponent(window.Backplane.getChannelID()) : "";
        setCookie("backplane-channel", "");
        if ($("#content #echo-comments").length > 0) {
            var user = new Echo.User({
                "appkey": NYM.echo.apiKey()
            });
            user.logout();
        }

        for (var d = 0; d < nymag.loginRegister.domains.length; d++) {
            domain = nymag.loginRegister.domains[d];
            if (nymag.domains.cookie.lastIndexOf(domain) < 0) {
                var iframe = $("<iframe src='' id='cookie_iframe' style='height: 1px; width: 1px; visibility: hidden;'></iframe>");
                iframe.attr("src", "https://secure." + domain + "/logout/remove_cookies/?domain=." + domain + bp_param);
                $("body").append(iframe);
                setTimeout(function(){
                    $('#cookie_iframe').remove();
                }, 5000);
            }
        }

        eraseCookie("nymag_session_user", window.nymag.domains.cookie);
        eraseCookie("nymag_session_user_id", window.nymag.domains.cookie);
        eraseCookie("nymag_session_remember_me", window.nymag.domains.cookie);
        eraseCookie("nymag_session_state", window.nymag.domains.cookie);
        eraseCookie("nymag_session", window.nymag.domains.cookie);

        if ($('body').hasClass('myny')) {
            NYM.loginReg.updateLoginMessage();
            setTimeout(function(){
                window.location.reload();
            }, 5200);
        } else {
            updateLoginMessage(true);
        }
        return false;
    }, //end NYM.loginReg.logout()

    initPopup: function () {
        $("#popup-lightbox").jqm({
            modal: true,
            onShow: function (h) {
                if ($.browser.msie) {
                    $(h.w).css("left", document.getElementById("wrap").offsetLeft + 44);
                    if (window.nymag.popupInline == 'on') {
                        var topValue = $('#comment-meta textarea').offset().top + 35;
                        $(h.w).css("top", topValue);
                        $(h.w).css("left", document.getElementById("wrap").offsetLeft + 54);
                        $('#popup-lightbox').after('<div id="fb-box-shadow"></div>');
                        $('#fb-box-shadow').css("top", topValue - 6);
                        $('#fb-box-shadow').css("left", document.getElementById("wrap").offsetLeft + 47);
                    } else {
                        var topOffset = document.documentElement.scrollTop + 111;
                        $(h.w).css("top", topOffset);
                        $('#fb-box-shadow').remove();
                    }
                } else {
                    if (window.nymag.popupInline == 'on') {
                        var topValue = $('#comment-meta textarea').offset().top + 35;
                        $(h.w).css("top", topValue);
                        $(h.w).css("left", 54);
                        $('#popup-lightbox').after('<div id="fb-box-shadow"></div>');
                        $('#fb-box-shadow').css("top", topValue - 6);
                        $('#fb-box-shadow').css("left", 47);
                    } else {
                        var topOffset = window.pageYOffset;
                        topOffset = parseInt(topOffset) + 111;
                        $(h.w).css("top", topOffset);
                        $('#fb-box-shadow').remove();
                    }
                }
                $(h.w).show();
            }
        });

        if (($.browser.msie && (navigator.userAgent.search("MSIE 8.0") < 0)) || ($.browser.msie && $("meta")[1].content == "IE=EmulateIE7")) {
            $("#popup-lightbox").insertBefore("#wrap");
            $("#mast #popup-lightbox").remove();
        }
    }, // end initPopup()

    loadLogin: function (o) {
        o = $.extend({
            container: "#popup-lightbox",
            callback: function() {} //callback function
        }, o || {});

        $("#popup-lightbox").html("");
        $popup = $(o.container);
        $popup.jqmShow();
        $popup.load("/includes/components/registration/login.txt", function () {
            NYM.loginReg.popupClasses();
            $("h5.closelightbox", $popup).click(function () {
                $popup.jqmHide();
            });


            $(".form-wrp a.forgot", $popup).click(function () {
                NYM.loginReg.loadForgotPass();
                return false;
            });
            $(".form-wrp a.more", $popup).click(function () {
                return NYM.loginReg.loadRegister()
            });
            $("#reg-login-form").submit(function () {
                var div = $(this);
                bp_param = (window.Backplane != undefined && Backplane.getChannelID() != false) ? "&bp_channel_id=" + encodeURIComponent(window.Backplane.getChannelID()) : "";
                var error = false;

                if ($("#id_password").val() == "") {
                    error = true;
                    $("#login_status").html("Please enter your password.").removeClass("status-ok").addClass("status-error").fadeIn();
                } else if (error == false) {
                    $("#login_status").fadeOut();
                }
                if ($("#id_login").val() == "") {
                    error = true;
                    $("#login_status").html("Please enter your username/email.").removeClass("status-ok").addClass("status-error").fadeIn();
                } else if (error == false) {
                    $("#login_status").fadeOut();
                }
                if (!error) {
                    $popup.find("img.register-ajax").fadeIn();
                    $.ajax({
                        url: window.nymag.domains.secure + '/login/json/?callback=?&' + $(div).serialize() + bpUrlParam(),
                        dataType: 'jsonp',
                        cache: true,
                        success: function (data) {
                            if (data.status == 0) {
                                nymag.loginRegister.sso();
                                $popup.find("div.head").css("background-image", "none");
                                $popup.find("div.form-wrp-right").css("display", "none");
                                $popup.find("h1").html("Thanks!");
                                $popup.find("div.form-wrp").addClass("thanks").html('<h4>You are now logged in.</h4> <a id="return-page" href="javascript:;">Return to page &raquo;</a>');
                                var closeBox = setTimeout("closeLightbox()", 4000);
                                $("h5.closelightbox, #return-page", $popup).unbind("click").click(function (e) {
	                                e.preventDefault();
                                    closeLightbox();
                                    clearTimeout(closeBox);
                                });
								o.callback.call(this);
								NYM.loginReg.loginCallback();
                            } else {
                                $("#login_status").html("Username and/or password are incorrect. Please try again.").removeClass("status-ok").addClass("status-error").fadeIn();
                                $("#password_status").html("").removeClass("status-ok");
                                $("img.register-ajax").fadeOut();
                            }
                        }
                    });
                }
                return false;
            });
        });

        omnitureCall("Service:Membership:Login:NYM Login", "NYM Login", window.nymag.domains.secure + "/login/lightbox");
        return false;
    }, // end loadLogin()

	loginCallbackArray: [],
	loginCallback: function(){ 
	    var arr = NYM.loginReg.loginCallbackArray;
		if(arr.length <= 0) return;

		for(var i=0; i<arr.length; i++){
			if(typeof arr[i] == 'function'){
				arr[i]();
			}
		}
		NYM.loginReg.loginCallbackArray = [];
	},

    launchFBLogin: function () {
        //console.log("NYM.loginReg.loadFBLogin");
        var screenHeight = window.screen.height / 2 - 500;
        var screenWidth = window.screen.width / 2 - 500;
        
        eraseCookie("fbs_" + window.nymag.loginRegister.fb_appid(), window.nymag.domains.cookie);
        NYM.loginReg.checkSessionState();

        var oauthWin = '';
            oauthWin += 'https://www.facebook.com/dialog/oauth?';
            oauthWin += 'client_id=' + window.nymag.loginRegister.fb_appid();
            oauthWin += '&redirect_uri=' + window.nymag.domains.secure + '/login/fbhandle/';
            oauthWin += '&scope=email,publish_stream,offline_access';
            oauthWin += '&display=popup';

        var winParams = 'width=500,height=500,scrollbars=no,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=' + screenWidth + ',top=' + screenHeight;
        NYM.loginReg.fbpopup = window.open(oauthWin, 'popup', winParams);
        return false;

    }, //end launchFBLogin()

    loadRegister: function (o) {
        //console.log("NYM.loginReg.loadRegister");
        o = $.extend({
            container: "#popup-lightbox",
            callback: ""
        }, o || {});

        var validateTimer = window.nymag.loginRegister.validateTimer;
        window.nymag.loginRegister.isNYM = '';
        window.nymag.popupInline = 'off';
        $('#fb-box-shadow').remove();
        $("#popup-lightbox").html("");

        $popup = $(o.container);
        $popup.jqmShow();
        $popup.load("/includes/components/registration/registrationform.txt", function () {
            NYM.loginReg.popupClasses();
            $.getScript('http://www.google.com/recaptcha/api/js/recaptcha_ajax.js', function () {
                Recaptcha.create("6LcdWscSAAAAAK1pt3RzfZYsUv_Os5djKZjCZDha", "captcha_id", {
                    theme: "clean",
                    callback: Recaptcha.focus_response_field
                });
            });
            $("#id_captcha").origText();
            var input_wrp = $("div.input-wrp:not(.input-skip)", $popup);

            $("input[type=text],input[type=password]", input_wrp).keydown(function (e) {

            });
            $("input[type=text],input[type=password]", input_wrp).keydown(function (e) {
                if (e.keyCode != 9) {
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                }
            }).keyup(function (e) {
                if (e.keyCode != 9 && validateTimer == 0) {
                    var id = this.id;
                    if ((this.id == 'id_membername') || (this.id == 'id_display_name') || (this.id == 'id_email_address')) {
                        validateTimer = setTimeout(function () {
                            NYM.loginReg.validateAjax({
                                "item": id
                            });
                        }, 1500);
                    } else {
                        validateTimer = setTimeout(function () {
                            NYM.loginReg.validateField({
                                "id": id
                            });
                        }, 1500);
                    }
                }
            }).blur(function () {
                if (this.value != '') {
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                    var id = this.id;
                    if ((this.id == 'id_membername') || (this.id == 'id_display_name') || (this.id == 'id_email_address')) {
                        NYM.loginReg.validateAjax({
                            "item": id
                        });
                    } else {
                        NYM.loginReg.validateField({
                            "id": id
                        });
                    }

                } else {
                    $("#" + this.id.substring(3) + "_status").removeClass("status-error").removeClass("status-ok").html("").fadeOut();
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                }
            });

            $("h5.closelightbox", $popup).click(function () {
                $popup.jqmHide();
            });
            $("#submit1").css("cursor", "pointer").click(function () {
                NYM.loginReg.submitRegister();
            });

        });
        //omnitureCall("Service:Membership:Registration:NYM Registration Form", "NYM Registration", window.nymag.domains.secure + "/registration/lightbox");
        return false;
    }, //end loadRegister()

    loadForgotPass: function (o) {
        //console.log("NYM.loginReg.loadForgotPass");
        o = $.extend({
            container: "#popup-lightbox",
            callback: ""
        }, o || {});

        $("#popup-lightbox").html("");
        $popup = $(o.container);
        $popup.jqmShow();
        $popup.load("/includes/components/registration/forgot.txt", function () {
            NYM.loginReg.popupClasses();
            $("h5.closelightbox", $popup).click(function () {
                $popup.jqmHide();
            });
            $("#submit1").click(function () {
                NYM.loginReg.submitForgotPass();
            });
            $(".form-wrp a.more", $popup).click(function () {
                return NYM.loginReg.loadRegister()
            });
        });

        //omnitureCall("Service:Membership:Login:Lost Password Big", "Lost Password Screen Big", window.nymag.domains.secure + "/forgot-password/lightbox");
        return false;
    }, // end loadForgotPass() 

    submitForgotPass: function () {
        //console.log("NYM.loginReg.submitForgotPass");
        var container = $("#popup-lightbox");
        var error = false;
        var input_wrp = container.find("div.input-wrp:not(.input-skip)");
        $("input[type=text],input[type=password]", input_wrp).each(function () {
            if (!NYM.loginReg.validateField({
                "id": this.id
            })) error = true;
            else $("#email_address_status").html("").addClass("status-ok").removeClass("status-error").hide();
        });
        if (!error) {
            window.nymag.loginRegister.login_user = $("#id_login").val();
            container.find("img.register-ajax").fadeIn();
            $.ajax({
                url: window.nymag.domains.secure + "/send_password/json/?callback=?&" + $("#reg-login-form").serialize(),
                dataType: 'jsonp',
                cache: true,
                success: function (data) {
                    window.nymag.loginRegister.in_ajax = 0;
                    container.find("img.register-ajax").hide();
                    if (data.status == 0) {
                        container.find("div.form-wrp").addClass("forgot-thanks").html("<h2>The password has been sent.</h2><p>Please check your inbox.</p><div class='submit-btn'><div class='input-wrp'><input type='submit' name='submit' class='submit' id='submit1' value='Log In'></div>");
                        $(".form-wrp #submit1").click(function () {
                            NYM.loginReg.loadLogin();
                        });
                    } else if (data.status == 2) $("#email_address_status").html(data.message).removeClass("status-ok").addClass("status-error").fadeIn();
                }
            });
        }
        return false;
    }, // end submitForgotPass

    popupClasses: function (o) {
        //console.log("popupClasses");
        o = $.extend({
            selector: null
        }, o || {});

        $popup.removeClass("fb-box-wrp");
        $popup.removeClass("reg-box-wrp");
        $popup.removeClass("conf-box-wrp");
        if (!o.selector) {
            o.selector = "first";
        }
        // CLASS TO ADD
        var classToAdd = $popup.children("div:" + o.selector).attr("class");
        classToAdd = classToAdd.replace(/-box/g, "-box-wrp");
        $popup.addClass(classToAdd);
        $popup.removeClass("litebx-content");

        // RESET LEFT OFFSET
        if (($.browser.msie && (navigator.userAgent.search("MSIE 8.0") < 0)) || ($.browser.msie && $("meta")[1].content == "IE=EmulateIE7")) {
            var addOffset = document.getElementById("wrap").offsetLeft;
        } else {
            var addOffset = 0;
        }
        if (window.nymag.popupInline == 'on') {
            $("#popup-lightbox").css("left", 54 + addOffset);
            $('#fb-box-shadow').css("left", 47 + addOffset);
        } else if (classToAdd.indexOf('reg-box') > -1) {
            $("#popup-lightbox").css("left", 44 + addOffset);
        } else {
            $("#popup-lightbox").css("left", 213 + addOffset);
        }
    }, //end popupClasses()

    validateAjax: function (o) {
        //console.log("validateAjax new");
        o = $.extend({
            item: null
        }, o || {});
        var value = $("#" + o.item).val();
        var name = o.item.substring(3);
        if ((value != '') && (window.nymag.loginRegister.in_ajax != 1)) {
            window.nymag.loginRegister.in_ajax = 1;
            var path = "";
            var params;
            switch (name) {
            case "display_name":
                path = window.nymag.domains.secure + "/check_username/json/?callback=?";
                params = {
                    "membername": value
                };
                break;
            case "membername":
                path = window.nymag.domains.secure + "/check_username/json/?callback=?";
                params = {
                    "membername": value
                };
                break;
            case "email_address":
                path = window.nymag.domains.secure + "/check_email/json/?callback=?";
                params = {
                    "email_address": value
                };
                break;
            }
            $("#" + name + "_status").removeClass("status-error").removeClass("status-ok").html('<img src="/gfx/ico/ajax-load.gif" />').show();
            $.ajax({
                url: path,
                data: params,
                dataType: 'jsonp',
                cache: true,
                success: function (data) {
                    if (data.status == 5 && data.message == "NYM employee") {
                        $("#id_employeefirst, #id_employeelast").focus(function () {
                            $(this).parent().addClass('focus');
                            ("#fb-displayname-litebx .skip").hide();
                        });
                        $("#nymemployee-wrp-wrp").fadeIn();
                        $("#" + name + "_status").addClass("status-ok").html("");
                    } else if (data.status != 0) {
                        $("#" + name + "_status").addClass("status-error").html(data.message);
                    } else {
                        $("#" + name + "_status").addClass("status-ok").html("");
                    }
                    window.nymag.loginRegister.in_ajax = 0;
                }
            });
        } else {
            $("#" + name + "_status").removeClass("status-error").removeClass("status-ok").html("");
        }
    }, // end validateAjax();

    validateField: function (o) {
        //console.log("NYM.loginReg.validateField");
        o = $.extend({
            id: null,
            statusBox: null
        }, o || {});

        var item = $("#" + o.id);
        var regText = "";
        var reg;
        var status = item.parent().next();
        if (o.statusBox) {
            status = $("#" + o.statusBox);
        }
        var value = item.val();
        if (status.length == 0) status = item.parent().parent().next();
        if ((item[0].id == "id_password") || (item[0].id == "id_zip")) {
            status.html("").addClass("status-ok").removeClass("status-error").fadeIn();
        }
        switch (item[0].id) {
        case "id_display_name":
            reg = /[A-Za-z0-9_]*/;
            regText = "Username Invalid";
            break;
        case "id_membername":
            reg = /[A-Za-z0-9_]*/;
            regText = "Username Invalid";
            break;
        case "id_email_address":
            reg = /^([a-z0-9_\-\.]+)@([a-z0-9_\-\.]+)\.([a-z]{2,5})$/i;
            regText = "E-Mail Address Invalid.";
            break;
        case "id_password":
            reg = /^[A-Za-z0-9]*[0-9][A-Za-z0-9]*$/;
            regText = "Password must contain at least 1 number.";
            break;
        case "id_zip":
            reg = /^\d{5}(-\d{4})?$/;
            regText = "Zip Code Invalid.";
            break;
        case "id_captcha":
            return true;
            break;
        default:
            reg = "";
            regText = "";
            break;
        }

        if ((reg != "") && !eval(reg + ".test(value)")) {
            if (status.html() == "") status.html(regText).removeClass("status-ok").addClass("status-error").fadeIn();
            return false;
        }
        if (item[0].id == "id_password") {
            reg = /[A-Za-z0-9]{6,}$/;
            regText = "Password must be at least 6 characters long.";
            if (!eval(reg + ".test(value)")) {
                if (status.html() == "") status.html(regText).removeClass("status-ok").addClass("status-error").fadeIn();
                return false;
            }
        }

        if (item[0].id == "id_confirm_password") {
            if ($("#id_password").val() == '') return true;
            if ($("#id_password").val() != $("#id_confirm_password").val()) {
                $("#confirm_password_status").html("Confirmation password not the same.").removeClass("status-ok").addClass("status-error").fadeIn();
                return false;
            } else {
                if ($(window.nymag.loginRegister.curr_container + " form").attr("id") != "fb-connectnym-form") {
                    status.html("").addClass("status-ok").removeClass("status-error").fadeIn();
                }
            }
        }

        if (value == '') {
            status.html("You must enter a value.").removeClass("status-ok").addClass("status-error").fadeIn();
            return false;
        }
        return true;
    }, // end validateField();

    submitRegister: function () {
        //console.log("NYM.loginReg.submitRegister");
        var error = false;
        if (window.nymag.loginRegister.isNYM == 1) {
            var input_wrp = $(window.nymag.loginRegister.curr_container + " div.input-wrp");
        } else {
            var input_wrp = $(window.nymag.loginRegister.curr_container + " div.input-wrp:not(.input-skip)");
        }
        $("input[type=text],input[type=password]", input_wrp).each(function () {
            if (!NYM.loginReg.validateField({
                "id": this.id
            })) error = true;
        });

        $("#gender_status").html("").removeClass("status-error").fadeIn();
        if (!$("#id_gender_0")[0].checked && !$("#id_gender_1")[0].checked) {
            error = true;
            $("#gender_status").html("Please select a gender.").removeClass("status-ok").addClass("status-error").fadeIn();
        } else {
            $("#gender_status").html("Ok").addClass("status-ok").removeClass("status-error").fadeIn();
        }

        $("#tos_status").html("").removeClass("status-error").fadeOut();
        if (!$("#id_tos")[0].checked) {
            error = true;
            $("#tos_status").html("Required").removeClass("status-ok").addClass("status-error").fadeIn();
        }

        if (!error) {
            window.nymag.loginRegister.login_user = $("#id_membername").val();
            window.nymag.loginRegister.register_email = $("#id_email_address").val();
            window.nymag.loginRegister.from_reg = 1;
            $("#get_challenge").val(Recaptcha.get_challenge());
            $("#get_response").val(Recaptcha.get_response());
            // window.nymag.loginRegister.from_reg = document.getElementById('id_from_reg').checked;
            $("#popup-lightbox img.register-ajax").fadeIn();
            $.ajax({
                url: window.nymag.domains.secure + "/register/register?callback=?&" + $("#reg-login-form").serialize(),
                dataType: 'jsonp',
                cache: true,
                success: function (data) {
                    var name = "id_" + data.name;
                    if (data.status != 0 && data.status != 4) {
                        $("#" + name + "_status").addClass("status-error").html(data.message);
                        $("#popup-lightbox img.register-ajax").fadeOut();

                    } else if (data.status == 4) {
                        var thisMsg = data.message;
                        if (thisMsg == "Captcha mismatch error") {
                            thisMsg = "Security code doesn't match. Please try again.";
                            Recaptcha.reload();
                            $("#popup-lightbox img.register-ajax").fadeOut();
                        }
                        $("#captcha_status").html(thisMsg).removeClass("status-ok").addClass("status-error").fadeIn();
                    } else {
                        NYM.loginReg.loadStandardNewsletters();
                    }
                    window.nymag.loginRegister.in_ajax = 0;
                }
            });
        }

        return false;

    },

    loadFBNewsletters: function () {
        updateLoginMessage();
        $("#popup-lightbox").load("/includes/components/registration/newsletterform-inline.txt", function () {
            NYM.loginReg.popupClasses();
            var userName = getUserName();
            $("#fb-newsletter-small .fb-pic").html("<img src='https://graph.facebook.com/" + FB_id + "/picture'/>");
            $("#fb-newsletter-small #fb-username").html(userName);
            $("#fb-newsletter-small #newsletter_email_address").val(window.nymag.loginRegister.register_email);
            $("#fb-newsletter-small #link-settings").click(function () {
                window.location.href = window.nymag.domains.my + "/" + userName + "/profile";
            });
            $("h5.closelightbox").click(function () {
                closeLightbox();
            });

            $("#fb-newsletter-small #submit1").click(function () {
                if ($("#newsletter_130").attr("checked") || $("#newsletter_40").attr("checked")) {
                    $("#reg_newsletter_status").hide();
                    $(window.nymag.loginRegister.curr_container + " img.register-ajax").fadeIn();

                    $.ajax({
                        url: window.nymag.domains.secure + "/register/newsletter_process?callback=?&type=reg&" + $("#reg-newsletter").serialize(),
                        dataType: 'jsonp',
                        cache: true,
                        success: function (data) {
                            closeLightbox();
                        }
                    });

                } else {
                    $("#reg_newsletter_status").html("You must select a newsletter to subscribe").show();
                }
            });

        });
    }, // end loadFBNewsletters()

    loadStandardNewsletters: function () {
        updateLoginMessage();
        NYM.loginReg.popupClasses();
        $("#popup-lightbox").load("/includes/components/registration/newsletterform.txt", function () {
            NYM.loginReg.popupClasses();
            var userName = getUserName();
            $("#reg-newsletter-litebx #newsletter_email_address").val(window.nymag.loginRegister.register_email);
            $("h5.closelightbox").click(function () {
                closeLightbox();
            });

            $("#reg-newsletter-litebx #submit1").click(function () {
                if ($("#newsletter_130").attr("checked") || $("#newsletter_40").attr("checked") || $("#newsletter_20").attr("checked")) {
                    $("#reg_newsletter_status").hide();
                    $(window.nymag.loginRegister.curr_container + " img.register-ajax").fadeIn();

                    $.ajax({
                        url: window.nymag.domains.secure + "/register/newsletter_process?callback=?&type=reg&" + $("#reg-newsletter").serialize(),
                        dataType: 'jsonp',
                        cache: true,
                        success: function (data) {
                            closeLightbox();
                        }
                    });

                } else {
                    $("#reg_newsletter_status").html("You must select a newsletter to subscribe").show();
                }
            });

        });
    }, // end loadStandardNewsletters()

    initNewsletterSignUp : function(emailInputSelector, formSelector, recordLinkMsg) {
        function callError(input, msg){
            input.val(msg).addClass("error").effect("highlight", {color: "#ffe400"}, 1200).focus(function(){
                this.value = "";
                input.removeClass("error");
            });
        }
 
        function callSuccess(input, msg){
            input.val(msg).addClass("success").effect("highlight", {color: "#ffe400"}, 1200).focus(function(){
                this.value = "";
                input.removeClass("success");
            });
        }
 
        var input = jQuery(emailInputSelector);
        var form = jQuery(formSelector);
        if (input.length < 1 || form.length < 1) {
            //can't find such <input> and <form>. silently give up.
            return;
        }
 
        input.origValidate({
            form: formSelector, 
            searchText: "Enter your e-mail address",
            errorMsg: "E-mail address is required",
            onError: callError,
            onSubmit: function() {
                var checkboxes = form.find("input:checkbox");
                var checked = checkboxes.filter(":checked");
 
                var email = input.val().trim();
                var isValidEmail = /^[^@]+@[^@]+$/.exec(email);
 
                var source = form.find('input[name="source"]').val();
 
                if (!isValidEmail) {
                    callError(input, "Please enter valid email");
                } else if (checkboxes.length > 0 && checked.length < 1) {
                    callError(input, "Please check a newsletter");
                } else {
                    
                    var url = window.nymag.domains.secure + "/register/newsletter_process";
                    var data = {
                        newsletter_email_address: email,
                        source: source
                    };
                    checked.each(function() {
                        data['newsletter_' + this.value] = 1;
                    });   
 
                    if (recordLinkMsg) {
                        nymag_recordLink(this, recordLinkMsg);
                    }
 
                    jQuery.ajax({
                        url: url,
                        method: 'GET',
                        dataType: 'jsonp',
                        data: data,
                        success: function(data) {
                            callSuccess(input, data.message);
                        }
                    });
                }
 
                return false;
            }
        });
    },

    getFBInfo: function () {
        //console.log("NYM.loginReg.getFBInfo");
        var token = NYM.loginReg.getFBAccessToken();
        $.getJSON("https://graph.facebook.com/me?access_token=" + token + "&callback=?", function (data) {
            FB_id = data.id;
            if (data.username) {
                FB_username = data.username;
            } else {
                FB_username = data.name;
                FB_username = FB_username.replace(" ", "_");
            }
            FB_email = data.email;
            setCookie("fb_id", FB_id, "", window.nymag.domains.cookie);
			NYM.loginReg.fbCallback();
        });
    }, //end getFBInfo()

	fbCallbackArray: [],

	fbCallback: function(){ 
	    var arr = NYM.loginReg.fbCallbackArray;
		if(arr.length <= 0) return;

		for(var i=0; i<arr.length; i++){
			if(typeof arr[i] == 'function'){
				arr[i]();
			}
		}
		NYM.loginReg.fbCallbackArray = [];
	},

    getFBAccessToken: function () {
        //console.log("NYM.loginReg.getFBAccessToken");
        var token = readCookie("fbs_" + window.nymag.loginRegister.fb_appid());
        return token;
    }, //end getFBAccessToken()

    checkSessionState: function () {
        //console.log("NYM.loginReg.checkSessionState");
        var sessionState = readCookie("nymag_session_state");
        if (sessionState == 1 && NYM.loginReg.fbpopup) {
            nymag.loginRegister.sso();
            NYM.loginReg.closeFBLogin();
            closeLightbox();
            updateLoginMessage(true);
            NYM.loginReg.getFBInfo();
            return false;
        } else if (sessionState == 2 && NYM.loginReg.fbpopup) {
            NYM.loginReg.getFBInfo();
            NYM.loginReg.loadConnectNYM();
            return false;
        } else {
            setTimeout(function(){
                NYM.loginReg.checkSessionState();
            }, 1000);
        }
    }, //end checkSessionState()

    closeFBLogin: function () {
        if (NYM.loginReg.fbpopup) {
            //console.log("NYM.loginReg.closeFBLogin");
            NYM.loginReg.fbpopup.close();
        }
    }, //end closeFBLogin()

    loadConnectNYM: function (o) {
        //console.log("NYM.loginReg.loadConnectNYM");
        NYM.loginReg.closeFBLogin();
        $("#popup-lightbox").html("");
        $popup = $("#popup-lightbox");
        $popup.jqmShow();
        $popup.load("/includes/components/registration/fb_connectnym.txt", function () {
            NYM.loginReg.popupClasses();
            $("h5.closelightbox", $popup).click(function () {
                closeLightbox();
                NYM.loginReg.revokeAuthorization();
            });
            $("#skipconnectaccount-signin").click(function () {
                NYM.loginReg.loadFBChooseName();
            });
            var input_wrp = $("div.input-wrp:not(.input-skip)", $popup);
            $("#password-wrp a", $popup).click(function () {
                NYM.loginReg.loadForgotPass();
                return false;
            });
            $("#fb-connectnym-form #submit1").click(function () {
                NYM.loginReg.submitFBConnectNYM();
                return false;
            });
        });
        //omnitureCall("Service:Membership:Login:FBC:Yes Connect My Accounts", "FBC Yes Connect My Accounts", window.nymag.domains.secure + "/facebook-connectnym/lightbox");=
        return false;
    }, //end loadConnectNYM()

    submitFBConnectNYM: function () {
        //console.log("NYM.loginReg.submitFBConnectNYM");
        var error = false;
        if ($("#id_login").val() == "") {
            error = true;
            $("#login_status").html("Please enter your username/email.").removeClass("status-ok").addClass("status-error").fadeIn();
        } else {
            $("#login_status").html("").addClass("status-ok").removeClass("status-error").fadeIn();
        }

        if ($("#id_password").val() == "") {
            error = true;
            $("#login_status").html("Please enter your password.").removeClass("status-ok").addClass("status-error").fadeIn();
        } else {
            $("#login_status").html("").addClass("status-ok").removeClass("status-error").fadeIn();
        }


        if (!error) {
            window.nymag.loginRegister.fb_from_reg = '';
            window.nymag.loginRegister.submit_fb_from = 'Yes';
            $(window.nymag.loginRegister.curr_container + " img.register-ajax").fadeIn();
            var popup = $("#popup-lightbox");

            $.ajax({
                url: window.nymag.domains.secure + "/login/link/?type=facebook" + bpUrlParam() + "&callback=?&" + $("#fb-connectnym-form").serialize(),
                dataType: 'jsonp',
                cache: true,
                success: function (data) {
                    var name = "id_" + data.name;
                    if (data.status != 1) {
                        $("#login_status").addClass("status-error").html(data.message);
                        $("#popup-lightbox img.register-ajax").fadeOut();
                    } else {
                        updateLoginMessage();
                        $popup.find("div.head").css("background-image", "none");
                        $popup.find(".content").html("");
                        $popup.find(".content").append("<div class='form-wrp thanks'></div>");
                        $popup.find("div.form-wrp").html("<h4>You are now logged in.</h4> <a onclick='closeLightbox();' href='javascript:;'>Return to page &raquo;</a>");
                        $popup.find("h1").html("Thanks!");
                        $popup.find("#connectnym-litebx").removeClass("existing create-account");
                        $popup.find("#connectnym-litebx").attr("id", "login-litebx");
                        $popup.find("h5.closelightbox").unbind("click");
                        $popup.find("h5.closelightbox").click(function () {
                            closeLightbox();
                        });
                    }
                }
            });
        }

    }, // end submitFBConnectNYM

    loadFBChooseName: function () {
        //console.log("NYM.loginReg.loadFBChooseName");
        var validateTimer = window.nymag.loginRegister.validateTimer;
        $("#popup-lightbox").html("");

        $popup = $("#popup-lightbox");
        $popup.jqmShow();
        $popup.load("/includes/components/registration/fb_choosename.txt", function () {
            $("#skipcreateaccount-signin").click(function () {
                NYM.loginReg.loadConnectNYM("#popup-lightbox", "inline");
            });
            NYM.loginReg.popupClasses();
            $("#fb-displayname-litebx .fb-pic").html("<img src='https://graph.facebook.com/" + FB_id + "/picture'/>");
            if (FB_email.indexOf("proxymail.facebook.com") == -1) {
                //$("#fb-choosename-form li#email_address-wrp").hide();
                $("#fb-choosename-form li#email_address-wrp").show();
                $("#fb-choosename-form input#id_email_address").val(FB_email);
            } else {
                $("#fb-choosename-form li#email_address-wrp").show();
            }
            $("#fb-choosename-form input#id_display_name").val(FB_username);

            var input_wrp = $("div.input-wrp:not(.input-skip)", $popup);
            $("input[type=text],input[type=password]", input_wrp).keydown(function (e) {
                if (e.keyCode != 9) {
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                }
            }).keyup(function (e) {
                if (e.keyCode != 9 && validateTimer == 0) {
                    var id = this.id;
                    if ((this.id == 'id_membername') || (this.id == 'id_display_name') || (this.id == 'id_email_address')) {
                        validateTimer = setTimeout(function () {
                            NYM.loginReg.validateAjax({
                                "item": id
                            });
                        }, 1500);
                    }
                }
            }).blur(function () {
                if (this.value != '') {
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                    var id = this.id;
                    if ((this.id == 'id_membername') || (this.id == 'id_display_name') || (this.id == 'id_email_address')) {
                        NYM.loginReg.validateAjax({
                            "item": id
                        });
                    } else {
                        NYM.loginReg.validateField({
                            "id": id
                        });
                    }
                } else {
                    $("#" + this.id.substring(3) + "_status").removeClass("status-error").removeClass("status-ok").html("").fadeOut();
                    clearTimeout(validateTimer);
                    validateTimer = 0;
                }
            });

            $("h5.closelightbox", $popup).click(function () {
                closeLightbox();
                $("p.skip a", $popup).click(function () {
                    restartLogin();
                });
            });

            $("#fb-choosename-form #submit1").click(function () {
                NYM.loginReg.submitFBChooseName();
            });



        });

        //omnitureCall("Service:Membership:Login:FBC:No Create Account", "FBC No Create New NYM Account", window.nymag.domains.secure + "/facebook-createaccount/lightbox");

        return false;


    }, //end loadFBChooseName()

    submitFBChooseName: function () {
        //console.log("NYM.loginReg.submitFBChooseName");
        var error = false;
        var input_wrp = $(window.nymag.loginRegister.curr_container + " div.input-wrp:not(.input-skip)");
        $("input[type=text],input[type=password]", input_wrp).each(function () {
            if (!NYM.loginReg.validateField({
                "id": this.id,
                "statusBox": "login_status"
            })) error = true;
        });

        if ($("#id_display_name").val() == "") {
            error = true;
            $("#login_status").html("Please enter your username.").removeClass("status-ok").addClass("status-error").fadeIn();
        } else {
            // $("#login_status").html("Ok").addClass("status-ok").removeClass("status-error").fadeIn();
        }

        if ($("#id_email_address").val() == "") {
            error = true;
            $("#login_status").html("Please enter your email address.").removeClass("status-ok").addClass("status-error").fadeIn();
        } else {
            // $("#login_status").html("Ok").addClass("status-ok").removeClass("status-error"),fadeIn();
        }

        // $("#tos_status").html("").removeClass("status-error").fadeOut();
        if (!$("#id_tos")[0].checked) {
            error = true;
            $("#login_status").html("Terms of Service/Privacy Policy required.").removeClass("status-ok").addClass("status-error").fadeIn();
        }
        if (!error) {
            window.nymag.loginRegister.fb_from_reg = '';
            window.nymag.loginRegister.submit_fb_from = 'No';
            window.nymag.loginRegister.register_email = $("#id_email_address").val();
            $(window.nymag.loginRegister.curr_container + " img.register-ajax").fadeIn();

            $.ajax({
                url: window.nymag.domains.secure + "/login/link/?type=facebook&callback=?" + bpUrlParam() + "&" + $("#fb-choosename-form").serialize(),
                dataType: 'jsonp',
                //jsonpCallback: 'registerValidate',
                cache: true,
                success: function (data) {
                    if (data.status == 1) {
                        NYM.loginReg.loadFBNewsletters();
                    } else {
                        $("#login_status").html(data.message).removeClass("status-ok").addClass("status-error").fadeIn();
                    }
                }
            });
        }
        return false;
    }, //end submitFBChooseName()

    revokeAuthorization: function () {
        //console.log("NYM.loginReg.revokeAuthorization");
        eraseCookie("fb_id", window.nymag.domains.cookie);
//        eraseCookie("fbs_164574351267", window.nymag.domains.cookie);
        eraseCookie("fbs_" + window.nymag.loginRegister.fb_appid(), window.nymag.domains.cookie);
        eraseCookie("nymag_session", window.nymag.domains.cookie);
        eraseCookie("nymag_session_state", window.nymag.domains.cookie);
        updateLoginMessage();
    }
};

//----------------------------- TV recap user ratings
$(document).ready(function () {
	
	var episodeId = getClickURL();
	var nymag_session_user = readCookie('nymag_session_user');
	var sessionId = readCookie('session');
	var timestamp = Number(new Date());
	var ratingsUrl = $('#rate-wrap').attr('data-ratingsUrl');
	var userSubmitRating = false;
	
	// save omniture cookies/show id/login user name to localstorage.
	function checkLocalstorage(){
		if (!Modernizr.localstorage) { 
			alert("Sorry, we don't support this browser anymore please upgrade to the latest.")
			return; 
		}
	}
	
	function saveRatingLocal(rating) {
		var json = {
			"nymagUser" : nymag_session_user,
			"sessionId" : sessionId,
			"timestamp" : timestamp,
			"user_rating" : rating	
		};

		var jsonString = jQuery.stringify(json);
		localStorage.setItem(episodeId, jsonString);
		updateRatings(json);	
	}
	
	// get omniture cookies/show id/login user name to localstorage.
	function getRatingLocal() {
		var data = localStorage.getItem(episodeId);
		if(data){
			data = jQuery.parseJSON(data);
			updateRatings(data);
		}
	}
	
	// update user rating class and message
	function updateRatings(data){
        if(data.group_rating && data.group_rating.num_ratings > 0){
            $("#rate-wrap .readers-rating").html('Readers:&nbsp;<span class="rating">' +  (Math.round(data.group_rating.average * 2) / 2).toFixed(1) + '</span>');
        }
        if(data.user_rating){
			$('#rate-wrap').addClass('just-rated');
            $('#rate-wrap h4').html("Your Rating");
			$("#rating-stars").attr('class','rating-' + data.user_rating);
			$("#rating-stars").attr('data-rating','rating-' + data.user_rating);
        }
    }
	
	function showSocialShare()
	{
		
		var showTitle = $(".recap-nav header h3").text();
		var showName = $(".recap-nav header h2").text();
		var shareContent = '<div class="socialShare" style="display:none;" data-title="' + showTitle + '" data-showname="' + showName + '">Share Rating:<span class="shareTools facebook" data-share="facebook" data-category="tvRating"></span><span class="shareTools twitter" data-share="twitter" data-category="tvRating"></span></div>';
		
		if ($('.socialShare').length == 0)
		{
			$('.rating-content').after(shareContent);
		}
	}

	// inti rating, attach mouseover/out/click events
    function initRatings() {
        var msgtimeout;

        $('#rating-stars').mousemove(function(e){//mouse over/out stars
            var x = e.pageX - $(this).offset().left;
            if( x <= 18 ) {
                // 1 star
                $(this).attr('class','rating-1');
            } else if( x > 18 && x <= 37 ) {
                // 2 stars
                $(this).attr('class','rating-2');
            } else if( x > 37 && x <= 56 ) {
                // 3 stars
                $(this).attr('class','rating-3');
            } else if( x > 56 && x <= 75 ) {
                // 4 stars
                $(this).attr('class','rating-4');
            } else if( x > 75 ) {
                // 5 stars
                $(this).attr('class','rating-5');
            }
        }).mouseout(function(e){
            var thisDataRating = $(this).attr('data-rating');
            $(this).attr('class',thisDataRating);
        });

        $('#rating-stars').click(function(e){//use select ratings			
            var thisClass = $(this).attr('class');
			NYM.ratingNum = thisClass.slice('rating-'.length);
			userSubmitRating = true;
			
			$('.rating-login-msg').fadeOut();
			showSocialShare();
			$('#rate-wrap .socialShare').fadeIn();
			
            /* should be remove once hookup with ajax*/
            $(this).attr('data-rating',thisClass);

            $('#rate-wrap').fadeOut('fast',function() {
                $('#rate-wrap').fadeIn();
                $('#rate-wrap h4').html("Your Rating");
                $('#rate-wrap').addClass('just-rated');
            });
            /*end rating class*/

            G.readOmnitureOnPage(this, '19', 'TV Recap Rating', episodeId);		  

            saveRatingLocal(NYM.ratingNum);//save to localstorage
            	
            $.ajax({
                url: ratingsUrl + '&rating=' + NYM.ratingNum,//save to database
                dataType:'jsonp', 
                cache:true,
                success: function(data){ 
		            updateRatings(data);
            	},
            	fail:function(e){
            		console.log(e);
            	}
             });
            
        });

		if(!Modernizr.touch){
			$('#rate-wrap .rating-content').mouseover(function() {//mouseover/out to show login/register tooltips if not login
			   if(!isLoggedInUser()) { 
			        clearTimeout(msgtimeout);
					if(!userSubmitRating){
				    	$('.rating-login-msg').show(); 
					}
			    }
			}).mouseout(function(){
		    	msgtimeout = setTimeout(function(){
				    $('.rating-login-msg').fadeOut();
			    }, 3000)
			});
		}

		$('.rating-login-msg a').click(function(e){//open login/register forms
		    e.preventDefault();
		    G.readOmnitureOnPage(this, '40', 'Recap Login', episodeId);
		    //s.events = 'event40';
		    //s.prop39 = 'Recap Login';
		    //s.t();
		    var href = $(this).attr('href');
		    if(href == '#login'){
			    loadLogin();
		    } else if(href == '#register') {
			    loadLegacyRegister();
		    } else {}
		})
    }//end initRatings
    
    // if #rate-wrap element exsits
    if($('#rate-wrap').length > 0) {
	     checkLocalstorage();
	
		$.ajax({
	        url: ratingsUrl,
	        dataType:'jsonp', 
	        cache:true,
	        success: function(data){ 
				updateRatings(data); 
			},
	        error: function(){ 
				//alert('Please refresh browser and try again!'); 
			} 
	    });
		
		//if not login, get user rating data from localstorage
	    if(!isLoggedInUser()) {
		    getRatingLocal();
		}
		
    	initRatings();
    }
	
});

