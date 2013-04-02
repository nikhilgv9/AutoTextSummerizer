// bundled echo plugins 

// vim: set ts=8 sts=8 sw=8 noet:
/*
 * Copyright (c) 2006-2010 Echo <support@aboutecho.com>. All rights reserved.
 * You may copy and modify this script as long as the above copyright notice,
 * this condition and the following disclaimer is left intact.
 * This software is provided by the author "AS IS" and no warranties are
 * implied, including fitness for a particular purpose. In no event shall
 * the author be liable for any damages arising in any way out of the use
 * of this software, even if advised of the possibility of such damage.
 * $Id: form-auth.js 28468 2010-11-02 10:20:31Z jskit $
 */
 
 
 // Curation
 
 (function($) {

var plugin = Echo.createPlugin({
	"name": "Curation",
	"applications": ["Stream"],
	"dependencies": [{
		"application": "QueryPalette",
		"url": "//cdn.echoenabled.com/clientapps/v2.3.3/curation.js"
	}],
	"init": function(plugin, application) {
		plugin.set(application, "queue", []);
		plugin.addCss(plugin.assembleCss());
		plugin.extendRenderer("Item", "status", plugin.statusItemRenderer);
		plugin.extendRenderer("Item", "statusIcon", plugin.statusIconItemRenderer);
		plugin.extendRenderer("Item", "statusCheckbox", plugin.statusCheckboxItemRenderer);
		plugin.extendTemplate("Item", plugin.statusItemTemplate,
			"insertAfter", "echo-item-avatar");
		plugin.extendRenderer("Stream", "curate", plugin.curateStreamRenderer);
		plugin.extendTemplate("Stream", plugin.curateStreamTemplate,
			"insertAsFirstChild", "echo-stream-header");
		plugin.listenEvents(application);
		plugin.addItemControl(application, plugin.assembleControl("Approve", application));
		plugin.addItemControl(application, plugin.assembleControl("Spam", application));
		plugin.addItemControl(application, plugin.assembleControl("Delete", application));
	}
});

plugin.statusItemTemplate = 
	'<div class="echo-item-status">' +
		'<input type="checkbox" class="echo-item-statusCheckbox">' +
		'<div class="echo-item-statusIcon"></div>' +
		'<div class="echo-clear"></div>' +
	'</div>';

plugin.curateStreamTemplate = '<div class="echo-stream-curate echo-linkColor"></div>';

plugin.addLabels({
	"approveControl": "Approve",
	"deleteControl": "Delete",
	"spamControl": "Spam",
	"changingStatusToCommunityFlagged": "Flagging...",
	"changingStatusToModeratorApproved": "Approving...",
	"changingStatusToModeratorDeleted": "Deleting...",
	"changingStatusToModeratorFlagged": "Marking as spam...",
	"queries": "Queries",
	"actions": "Actions",
	"curate": "Curate",
	"curation": "Curation",
	"statusCommunityFlagged": "Flagged by Community",
	"statusModeratorApproved": "Approved by Moderator",
	"statusModeratorDeleted": "Deleted by Moderator",
	"statusModeratorFlagged": "Flagged by Moderator",
	"statusSystemFlagged": "Flagged by System",
	"statusUntouched": "New"
});

plugin.statuses = [
	"Untouched",
	"ModeratorApproved",
	"ModeratorDeleted",
	"CommunityFlagged",
	"ModeratorFlagged",
	"SystemFlagged"
];

plugin.control2status = {
	"Spam": "ModeratorFlagged",
	"Delete": "ModeratorDeleted",
	"Approve": "ModeratorApproved"
};

plugin.statusItemRenderer = function(element) {
	var item = this;
	if (!item.user.isAdmin()) {
		element.hide();
		return;
	}
	if (item.depth) {
		element.addClass('echo-item-status-child');
	}
	var status = item.data.object.status || "Untouched";
	element.addClass("echo-item-status-" + status);
};

plugin.statusIconItemRenderer = function(element) {
	var item = this;
	if (!item.user.isAdmin()) return;
	var status = item.data.object.status || "Untouched";
	var title = plugin.label("status" + status);
	element.addClass("echo-item-status-icon-" + status).attr("title", title);
};

plugin.statusCheckboxItemRenderer = function(element) {
	var item = this;
	if (!item.user.isAdmin()) return;
	$(element).click(function() {
		plugin.set(item, "selected", !plugin.get(item, "selected"));
		item.publish(plugin.topic("internal.Item", "onSelect"), {"item": item});
	}).attr("checked", plugin.get(item, "selected"));
};

plugin.curateStreamRenderer = function(element, dom) {
	var stream = this;
	if (!stream.user.isAdmin() || !Echo.QueryPalette) {
		element.hide();
		return;
	}
	element.empty()
		.append('<span class="echo-stream-curate-label">' + plugin.label("curate") + '</span>')
		.show()
		.click(function() {
			plugin.assembleDialog(stream);
			plugin.get(stream, "dialog").open();
		});
};

plugin.extractURI = function(query) {
	var path = query.match(/(?:url|scope|childrenof):(\S+)(?: |$)/);
	return path ? path[1] : window.location.protocol + "//" + window.location.host + "/*";
};

plugin.assembleDialog = function(application) {
	if (plugin.get(application, "dialog")) return;
	var assembleQueryPalette = function(target) {
		var config = plugin.assembleConfig(application, {
			"target": target,
			"query": {
				"path": plugin.extractURI(application.config.get("query")),
				"states": [
					"Untouched",
					"SystemFlagged",
					"CommunityFlagged",
					"ModeratorFlagged"
				],
				"itemsPerPage": application.config.get("itemsPerPage"),
				"sortOrder": application.config.get("sortOrder")
			}
		});
		plugin.set(application, "palette", new Echo.QueryPalette(config));
		application.subscribe("QueryPalette.onApply", function(event, data) {
			application.config.set("query", data.query);
			application.refresh();
		});
	};
	var assembleBulkActions = function(target) {
		var config = plugin.assembleConfig(application, {
			"target": target,
			"data": {
				"items": plugin.get(application, "queue")
			}
		});
		plugin.set(application, "bulk", new Echo.BulkActions(config));
	};
	var assembleTabs = function(target) {
		plugin.set(application, "tabs", new Echo.UI.Tabs({
			"target": $(target),
			"content": $(target),
			"addUIClass": false,
			"idPrefix": "curation-tabs-",
			"tabs": [{
				"id": "queries",
				"label": plugin.label("queries"),
				"icon": true,
				"content": assembleQueryPalette
			}, {
				"id": "actions",
				"label": plugin.label("actions"),
				"icon": true,
				"content": assembleBulkActions
			}]
		}));
	};
	plugin.set(application, "dialog", new Echo.UI.Dialog({
		"content": assembleTabs,
		"hasTabs": true,
		"config": {
			"autoOpen": false,
			"open": function() {
				plugin.get(application, "palette").refresh();
			},
			"title": plugin.label("curation"),
			"width": 500,
			"height": 550,
			"minWidth": 450,
			"minHeight": 415,
			"maxHeight": 600
		}
	}));
};

plugin.listenEvents = function(application) {
	application.subscribe(application.namespace + ".onRerender", function() {
		application.rerender("curate");
	});
	application.subscribe(plugin.topic("internal.Item", "onSelect"), function(event, data) {
		var item = data.item;
		if (plugin.get(item, "selected")) {
			plugin.get(application, "queue").push(item);
			plugin.assembleDialog(application);
			plugin.get(application, "dialog").open();
			plugin.get(application, "tabs").select("actions");
		} else {
			var queue = plugin.get(application, "queue");
			plugin.set(application, "queue",
				$.foldl([], queue, function(element, acc) {
					if (element.data.unique != item.data.unique) {
						acc.push(element);
					}
				}));
		}
		if (plugin.get(application, "bulk")) {
			plugin.get(application, "bulk").refresh(plugin.get(application, "queue"));
		}
		var action = plugin.get(item, "selected") ? "Select" : "Unselect";
		application.publish(plugin.topic(application.namespace + ".Item", "on" + action),
			application.prepareBroadcastParams({
				"item": {
					"data": item.data,
					"target": item.dom.content
				}
			}));	
	});
	application.subscribe("BulkActions.onStatusChange", function(event, data) {
		var queue = [];
		$.each(plugin.get(application, "queue"), function(i, item) {
			item.block(plugin.label("changingStatusTo" + data.state));
			plugin.set(item, "selected", false);
			queue.push(item);
		});
		plugin.set(application, "queue", []);
		if (plugin.get(application, "bulk")) {
			plugin.get(application, "bulk").refresh([]);
		}
		if (!queue.length) return;
		var activities = $.map(queue, function(item) {
			return {
				"verb": "update",
				"target": item.id,
				"author": item.data.actor.id,
				"field": "state",
				"value": data.state
			};
		});
		$.sendPostRequest(plugin.getSubmissionProxyURL(application), {
			"appkey": application.config.get("appkey"),
			"content": $.object2JSON(activities),
			"sessionID": application.user.get("sessionID", "")
		}, function() {
			application.startLiveUpdates(true);
		});
	});
};

plugin.changeItemStatus = function(item, status) {
	plugin.set(item, "selected", false);
	item.data.object.status = status;
	item.rerender("controls");
	// rerender status recursive
	// since it contains other renderers
	item.rerender("status", true);
};

plugin.getSubmissionProxyURL = function(application) {
	return application.config.get(plugin.config("submissionProxyURL"),
			application.config.get("submissionProxyURL"));
};

plugin.assembleControl = function(name, application) {
	var callback = function() {
		var item = this;
		var status = plugin.control2status[name];
		item.block(plugin.label("changingStatusTo" + status));
		$.get(plugin.getSubmissionProxyURL(application), {
			"appkey": application.config.get("appkey"),
			"content": $.object2JSON({
				"verb": "update",
				"target": item.id,
				"author": item.data.actor.id,
				"field": "state",
				"value": status
			}),
			"sessionID": item.user.get("sessionID", "")
		}, function(data) {
			if (data.result == "error") {
				item.unblock();
			} else {
				plugin.changeItemStatus(item, status);
				application.startLiveUpdates(true);
			}
		}, "jsonp");
	};
	return function() {
		var item = this;
		return {
			"name": name,
			"label": plugin.label(name.toLowerCase() + "Control"),
			"visible": item.user.isAdmin() &&
					item.data.object.status != plugin.control2status[name],
			"callback": callback
		};
	};
};

plugin.assembleCss = function() {
	var msieCss = "";
	if ($.browser.msie) {
		msieCss =
			'.echo-item-status { zoom: 1; }' +
			'.echo-item-statusCheckbox { margin: 1px; }';
	}
	return '.echo-item-status { width: 48px; height: 24px; }' +
		'.echo-item-status-child { width: 24px; height: 48px; }' +
		'.echo-item-statusCheckbox { float: left; margin: 4px; }' +
		'.echo-item-status-child .echo-item-statusCheckbox { display: block; }' +
		'.echo-item-statusIcon { float: right; margin: 4px; width: 16px; height: 16px; }' +
		// statuses
		'.echo-item-status-Untouched { background: #00aaff; }' +
		'.echo-item-status-ModeratorApproved { background: #bdfb6d; }' +
		'.echo-item-status-ModeratorDeleted { background: #f20202; }' +
		'.echo-item-status-SystemFlagged, .echo-item-status-CommunityFlagged, .echo-item-status-ModeratorFlagged { background: #ff9e00; }' +
		'.echo-stream-curate { float: right; margin-left: 15px; cursor: pointer; font-family: Arial; font-size: 11px; }' +
		'.echo-curation-tabs-queries span { background: no-repeat center left url("//c0.echoenabled.com/images/curation/tabs/queries.png"); }' +
		'.echo-curation-tabs-actions span { background: no-repeat center left url("//c0.echoenabled.com/images/curation/tabs/actions.png"); }' +
		// status icons
		$.map(plugin.statuses, function(name) {
			return '.echo-item-status-icon-' + name + '{ background: url("//c0.echoenabled.com/images/curation/status/' + name.toLowerCase() + '.png") no-repeat; }';
		}).join("") + msieCss;
};

})(jQuery);

 // Community Flag
 
(function($) {

var plugin = Echo.createPlugin({
	"name": "CommunityFlag",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.addItemControl(application, plugin.assembleControl("Flag", application));
		plugin.addItemControl(application, plugin.assembleControl("Unflag", application));
	}
});

plugin.addLabels({
	"flagControl": "Flag",
	"unflagControl": "Unflag",
	"flagProcessing": "Flagging...",
	"unflagProcessing": "Unflagging..."
});

plugin.getSubmissionProxyURL = function(application) {
	return application.config.get(plugin.config("submissionProxyURL"),
			application.config.get("submissionProxyURL"));
};

plugin.assembleControl = function(name, application) {
	var callback = function() {
		var item = this;
		item.controls[plugin.name + "." + name].element
			.empty()
			.append(plugin.label(name.toLowerCase() + "Processing"));
		$.get(plugin.getSubmissionProxyURL(application), {
			"appkey": application.config.get("appkey"),
			"content": $.object2JSON({
				"verb": name.toLowerCase(),
				"target": item.id
			}),
			"sessionID": item.user.get("sessionID", "")
		}, function() {
			var topic = plugin.topic(application, "on" + name + "Complete");
			application.publish(topic, application.prepareBroadcastParams({
				"item": {
					"data": item.data,
					"target": item.dom.content
				}
			}));
			application.startLiveUpdates(true);
		}, "jsonp");
	};
	return function() {
		var item = this;
		var count = item.data.object.flags.length;
		var action =
			($.map(item.data.object.flags, function(entry) {
				if (item.user.hasIdentity(entry.actor.id)) return entry;
			})).length > 0 ? "Unflag" : "Flag";
		return {
			"name": name,
			"label": plugin.label(name.toLowerCase() + "Control") +
				(item.user.isAdmin() && count ? " (" + count + ")" : ""),
			"visible": item.user.logged() && action == name,
			"onetime": true,
			"callback": callback
		};
	};
};

})(jQuery);
 
 // Edit
 
 (function($) {

var plugin = Echo.createPlugin({
	"name": "Edit",
	"applications": ["Stream"],
	"dependencies": [{
		"application": "Submit",
		"url": "//cdn.echoenabled.com/clientapps/v2.3.3/submit.js"
	}],
	"init": function(plugin, application) {
		plugin.addCss(plugin.css);
		plugin.listenEvents(application);
		plugin.addItemControl(application, plugin.assembleControl(application));
	}
});

plugin.addLabels({
	"edit": "Edit",
	"editControl": "Edit",
	"updating": "Updating..."
});

plugin.assembleControl = function(application) {
	var callback = function() {
		var item = this;
		if (plugin.get(item, "popup")) {
			plugin.get(item, "popup").close();
		}
		var popup = new Echo.UI.Dialog({
			"content": function(target) {
				$(target).addClass("echo-edit-item-container");
				new Echo.Submit(plugin.assembleConfig(application, {
					"target": target,
					"data": item.data,
					"mode": "edit",
					"targetURL": item.id
				}));
			},
			"config": {
				"autoOpen": true,
				"title": plugin.label("edit"),
				"width": 400,
				"height": 320,
				"minWidth": 300,
				"minHeight": 320
			}
		});
		plugin.set(item, "popup", popup);
	};
	return function() {
		var item = this;
		return {
			"name": "Edit",
			"label": plugin.label("editControl"),
			"visible": item.user.isAdmin(),
			"callback": callback
		};
	};
};

plugin.listenEvents = function(application) {
	var safelyExecute = function(unique, callback) {
		var item = application.items[unique];
		if (item && plugin.get(item, "popup")) {
			callback(item, plugin.get(item, "popup"));
		};
	};
	application.subscribe("Submit.onEditInit", function(event, args) {
		safelyExecute(args.data.unique, function(item) {
			item.block(plugin.label("updating"));
		});
	});
	application.subscribe("Submit.onEditComplete", function(event, args) {
		safelyExecute(args.data.unique, function(item, popup) { popup.close(); });
	});
};

plugin.css = '.echo-edit-item-container .echo-submit-container { margin: 10px; }';

})(jQuery);

 // Likes
 
(function($) {

var plugin = Echo.createPlugin({
	"name": "Like",
	"applications": ["Stream", "UserList"],
	"dependencies": [{
		"application": "UserList",
		"url": "//cdn.echoenabled.com/clientapps/v2/user-list.js"
	}],
	"init": function(plugin, application) {
		if (application instanceof Echo.Stream) {
			plugin.extendRenderer("Item", "likes", plugin.renderers.Item.likes);
			plugin.extendTemplate("Item", plugin.templates.likeList,
				"insertAsLastChild", "echo-item-data");
			plugin.addItemControl(application, plugin.assembleControl("Like", application));
			plugin.addItemControl(application, plugin.assembleControl("Unlike", application));
			plugin.subscribe(application, plugin.topic("internal.Item", "onUnlike"), function(topic, data) {
				plugin.sendRequest(application, {
					"verb": "unlike",
					"target": data.item.object.id,
					"author": data.actor.id
				}, function() {
					application.startLiveUpdates(true);
				});
			});
			plugin.addItemControl(application, plugin.assembleControl("anonLike", application));
		} else if (application instanceof Echo.UserList) {
			plugin.extendRenderer("UserList", "container",
				plugin.renderers.UserList.container);
			plugin.extendRenderer("UserListItem", "adminUnlike",
				plugin.renderers.UserListItem.adminUnlike);
			plugin.extendTemplate("UserListItem", plugin.templates.adminUnlike,
				"insertAsLastChild", "echo-user-list-item-container");
		}
		plugin.addCss(plugin.css);
	}
});



plugin.addLabels({
	"likeThis": " like this.",
	"likesThis": " likes this.",
	"likeControl": "Like",
	"unlikeControl": "Unlike",
	"unlikeOnBehalf": "Unlike on behalf of this user",
	"likeProcessing": "Liking...",
	"unlikeProcessing": "Unliking..."
});

plugin.templates = {
	"likeList": '<div class="echo-item-likes"></div>',
	"adminUnlike": '<img class="echo-user-list-item-adminUnlike" src="//cdn.echoenabled.com/images/container/closeWindow.png" title="' + plugin.label("unlikeOnBehalf") + '" width="10" height="9">'
};

plugin.sendRequest = function(application, data, callback) {
	$.get(plugin.config.get(application, "submissionProxyURL", "", true), {
		"appkey": application.config.get("appkey"),
		"content": $.object2JSON(data),
		"sessionID": application.user.get("sessionID", "")
	}, callback, "jsonp");
};

plugin.getMembership = function(application) {
        return application.config.get(plugin.config("membership"), "");
};

plugin.assembleControl = function(name, application) {


	var membership = plugin.getMembership(application);
        if (name == "anonLike") {
                var callback = function() {
                    var item = this;
	var likeSubmit = Echo.Broadcast.subscribe("User.onInvalidate", function() {
                $.get(plugin.getSubmissionProxyURL(application), {
                        "appkey": application.config.get("appkey"),
                        "content": $.object2JSON({
                                "verb": "like",
                                "target": item.id
                        }),
                        "sessionID": item.user.get("sessionID", "")
                }, function() {
			Echo.Broadcast.unsubscribe("User.onInvalidate", likeSubmit);
                        application.startLiveUpdates(true);
                }, "jsonp");
		
         });
		    if (membership == "nym") {
		        NYM.echo.loadLogin({
               			 membership: "nym"
        		});

		    } else {

        var appendSessionID = function(url) {
                var id = encodeURIComponent(application.user.get("sessionID", ""));
                var parts = $.parseUrl(url);
                var session = parts["query"]
                        ? parts["query"].match(/=$/) ? id : "&sessionID=" + id
                        : "sessionID=" + id;
                return application.substitute("{Data:scheme}://{Data:domain}{Data:path}?{Data:query}{Data:fragment}", {
                        "scheme": parts["scheme"] || "http",
                        "domain": parts["domain"],
                        "path": parts["path"],
                        "query": (parts["query"] || "") + session,
                        "fragment": parts["fragment"] ? ("#" + parts["fragment"]) : ""
                });
        };

	NYM.echo.loadLogin({
		membership: "janrain",
		appendSessionID: appendSessionID
	});

		}


                 };
		return function() {
                    var item = this;
                    return {
                        "name": "anonLike",
                         "label": 'Like',
                        "visible": item.user.logged() == false,
                        "callback": callback
                   };
                 };
	}



	var callback = function() {
		var item = this;
		item.controls[plugin.name + "." + name].element
			.empty()
			.append(plugin.label(name.toLowerCase() + "Processing"));
		plugin.sendRequest(application, {
			"verb": name.toLowerCase(),
			"target": item.id
		}, function() {
			var topic = plugin.topic(application, "on" + name + "Complete");
			plugin.publish(application, topic, application.prepareBroadcastParams({
				"item": {
					"data": item.data,
					"target": item.dom.content
				}
			}));
			application.startLiveUpdates(true);
		});
	};
	return function() {
		var item = this;
	        var User = item.user.account.id;
       		var Commenter = item.data.actor.id;
	        if (User == Commenter) { var sameUser = true; }

		var action =
			($.map(item.data.object.likes, function(entry) {
				if (item.user.hasIdentity(entry.actor.id)) return entry;
			})).length > 0 ? "Unlike" : "Like";
		return {
			"name": name,
			"label": plugin.label(name.toLowerCase() + "Control"),
			"visible": item.user.logged() && action == name && sameUser !=true,
			"onetime": true,
			"callback": callback
		};
	};
};

plugin.renderers = {"Item": {}, "UserList": {}, "UserListItem": {}};

plugin.renderers.Item.likes = function(element) {
	var item = this;
	if (!item.data.object.likes.length) {
		element.hide();
		return;
	}
	var likesPerPage = 2;
	var visibleUsersCount = plugin.get(item, "userList")
		? plugin.get(item, "userList").getVisibleUsersCount()
		: likesPerPage;
	var youLike = false;
	var userId = item.user.get("id");
	var users = item.data.object.likes;
	$.each(users, function(i, like) {
		if (like.actor.id == userId) {
			youLike = true;
			return false; // break
		}
	});
	var config = plugin.assembleConfig(item, {
		"target": element.get(0),
		"data": {
			"itemsPerPage": likesPerPage,
			"entries": users
		},
		"initialUsersCount": visibleUsersCount,
		"totalUsersCount": item.data.object.accumulators.likesCount,
		"suffixText": plugin.label(users.length > 1 || youLike ? " " : " ")
	});
	config.plugins.push({"name": "Like"});
	var userList = new Echo.UserList(config);
	plugin.set(item, "userList", userList);
	element.show();
	item.subscribe(plugin.topic("internal.UserListItem", "onUnlike"), function(topic, data) {
		if (data.target != element.get(0)) return;
		item.publish(plugin.topic("internal.Item", "onUnlike"), {
			"actor": data.actor,
			"item": item.data
		});
	});
};

plugin.renderers.UserList.container = function(element) {
	var item = this;
	item.parentRenderer("container", arguments);
	if (!item.user.isAdmin()) return;
	element.addClass("echo-user-list-highlight");
};

plugin.renderers.UserListItem.adminUnlike = function(element) {
	var item = this;
	if (!item.user.isAdmin()) {
		element.remove();
		return;
	}
	element.one("click", function() {
		item.dom.get("container").css("opacity", 0.3);
		plugin.publish(item, plugin.topic("internal.UserListItem", "onUnlike"), {
			"actor": item.data,
			"target": item.config.get("target").get(0)
		});
	});
};

plugin.css = '.echo-item-likes { background: url(//c0.echoenabled.com/images/likes.png) no-repeat 0px 4px; padding: 0px 0px 4px 21px; }' +
	'.echo-item-likes .echo-user-list-highlight { line-height: 23px; }' +
	'.echo-item-likes .echo-user-list-highlight .echo-user-list-item-container { display: inline-block; line-height: 16px; background-color: #EEEEEE; padding: 1px 3px; border: 1px solid #D2D2D2; border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px; margin: 0px 2px; }' +
	'.echo-item-likes .echo-user-list-highlight .echo-user-list-delimiter { display: none; }' +
	'.echo-item-likes .echo-user-list-item-adminUnlike { cursor: pointer; margin-left: 3px; }' +
	($.browser.msie ?
		'.echo-item-likes .echo-user-list-highlight span { vertical-align: middle; }' +
		'.echo-item-likes { background-position: 0px 2px; }'
		: ''
	);

})(jQuery);


 // Form Auth
 
 (function($) {

var plugin = Echo.createPlugin({
	"name": "FormAuth",
	"applications": ["Submit"],
	"dependencies": [{
		"application": "Auth",
		"url": "//cdn.echoenabled.com/clientapps/v2.3.3/auth.js"
	}],
	"init": function(plugin, application) {
		plugin.extendTemplate("Submit", "<div class=\"echo-submit-auth\"></div>",
			"insertBefore", "echo-submit-header");
		plugin.extendRenderer("Submit", "auth", plugin.authRenderer);
		plugin.extendRenderer("Submit", "header", plugin.headerRenderer);
		plugin.extendRenderer("Submit", "container", plugin.containerRenderer);
		plugin.extendRenderer("Submit", "postButton", plugin.postButtonRenderer);
		plugin.extendRenderer("Submit", "forcedLoginUserInfo",
			plugin.forcedLoginUserInfoRenderer);
		plugin.addCss(plugin.css);
	}
});

plugin.css = '.echo-submit-forcedLoginUserInfoMessage { font-size: 14px; font-weight: bold; }';

plugin.addLabels({
	"youMustBeLoggedIn": "You must be logged in to comment"
});

plugin.authRenderer = function(element, dom) {
	var application = this;
	if (!application.user.get("sessionID") || application.config.get("mode") == "edit") return;
	var identityManager = $.foldl({}, ["Edit", "Login", "Signup"], function(name, acc) {
		acc[name.toLowerCase()] = application.config.get(plugin.config("identityManager" + name));
	});
	new Echo.Auth(plugin.assembleConfig(application, {
		"target": element,
		"identityManager": identityManager
	}));
};

plugin.containerRenderer = function(element, dom) {
	var application = this;
	application.parentRenderer("container", arguments);
	element.removeClass("echo-submit-logged echo-submit-nonymous echo-submit-forcedLogin");
	element.addClass("echo-submit-" + plugin.getStatus(application));
	var admin = application.user.isAdmin();
	if (admin == true) element.addClass("echo-submit-moderator");
};

plugin.headerRenderer = function(element, dom) {
	var application = this;
	var status = plugin.getStatus(application);
	if (status == "forcedLogin") {
		return application.render("forcedLoginUserInfo", element, dom);
	}
	if (status == "logged") {
		element.empty();
		return;
	}
	return application.parentRenderer("header", arguments);
};

plugin.postButtonRenderer = function(element, dom) {
	var application = this;
	var handler = plugin.get(application, "postButtonHandler");
	if (!handler) {
		handler = function(ev) {
			if (application.user.logged()) {
				ev.stopImmediatePropagation();
				if (!application.highlightMandatory(application.dom.get("text"))) {
					application.post();
				}
			} else if (application.config.get("mode") != "edit"
					&& plugin.getPermissions(application) == "forceLogin") {
				ev.stopImmediatePropagation();
				application.dom.get("forcedLoginUserInfoMessage").css({"color": "red"});
			}
		};
		plugin.set(application, "postButtonHandler", handler);
	}
	element.unbind("click", handler).bind("click", handler);
	application.parentRenderer("postButton", arguments);
};

plugin.forcedLoginUserInfoRenderer = function(element, dom) {
	var prefix = "echo-submit-forcedLoginUserInfo";
	var template = 
		'<div class="echo-submit-userInfoWrapper echo-primaryFont">' +
			'<span class="{Data:prefix}Message echo-secondaryColor">' +
				'{Data:label}' +
			'</span>' +
		'</div>';
	var descriptors = {
		"Message": function(element){
			dom.set("forcedLoginUserInfoMessage", element);
		}
	};
	var template = this.substitute(template, {
		"prefix": prefix,
		"label": plugin.label("youMustBeLoggedIn")
	});
	return $.toDOM(template, prefix, descriptors).content;
};

plugin.getPermissions = function(application) {
	return application.config.get(plugin.config("submitPermissions"), "allowGuest");
};

plugin.getStatus = function(application) {
	if (application.user.logged()) {
		return "logged";
	}
	if (plugin.getPermissions(application) == "forceLogin") {
		return "forcedLogin";
	}
	return "anonymous";
};

})(jQuery);

// Reply Plugin - Custom Modifications Made for NYMAG

(function($) {

var plugin = Echo.createPlugin({
	"name": "Reply",
	"applications": ["Stream"],
	"dependencies": [{
		"application": "Submit",
		"url": "//cdn.echoenabled.com/clientapps/v2.3.3/submit.js"
	}],
	"init": function(plugin, application) {
		plugin.vars = plugin.vars || {};
		plugin.extendRenderer("Item", "children", plugin.childrenItemRenderer);
		plugin.extendRenderer("Item", "replyForm", plugin.replyFormItemRenderer);
		plugin.extendRenderer("Item", "container", plugin.containerItemRenderer);
		plugin.extendTemplate("Item", plugin.template, "insertBefore", "echo-item-childrenMarker");
		plugin.extendTemplate("Item", plugin.replyMarkerTemplate, "insertBefore", "echo-item-replyForm");
		plugin.listenEvents(application);
		plugin.addItemControl(application, plugin.assembleControl("Reply", application));
	}
});

plugin.template = '<div class="echo-item-replyForm"></div>';

plugin.replyMarkerTemplate = '<div class="replyMarker"></div>';

plugin.addLabels({
	"replyControl": "Reply"
});

plugin.assembleControl = function(name, application) {
	var callback = function() {
	NYM.echo.EchoStream.stopLiveUpdates();
		var item = this;
		var target = item.dom.get("replyForm");
		var element = item.dom.content;
		if (!plugin.get(item, "form")) {
			element.addClass("click-init");
			plugin.createForm(item, target);
		}
		if (plugin.get(item, "form.initialized")) {
				plugin.view(item, "toggle");
				item.rerender("container");
				element.addClass("show-reply");
				element.find(".replyMarker:first").addClass("active");
		} else {
			item.rerender("replyForm");
			element.find(".replyMarker:first").addClass("active");
		}
		var form = plugin.get(item, "form");
		form.instance.switchMode("standard");
		if (form.visible) {
			text = form.instance.dom.get("text");
			if (text && text.is(":visible")) {
				element.find(".replyMarker:first").addClass("active");
				text.focus();
			} else {
				target.get(0).scrollIntoView(false);
				element.find(".replyMarker:first").removeClass("active");
			}
		}
	};
	return function() {
		var item = this;
		return {
			"name": "Reply",
			"label": plugin.label("replyControl"),
			"callback": callback
		};
	};
};

plugin.childrenItemRenderer = function(element, dom) {
	var item = this;
	item.rerender("replyForm");
	item.parentRenderer("children", arguments);
		if (element.html().length == 0) {
			element.addClass("empty");		
		}
};

plugin.replyFormItemRenderer = function(element, dom) {
	var item = this;
	element.attr("id",item.timestamp);
	item.parentRenderer("replyForm", arguments);
	var clicked = element.parents(".echo-item-content").hasClass("click-init");
	if (clicked == false) {
        if (plugin.get(plugin, plugin.getFormKey(item)) && !plugin.get(item, "form.initialized")) {
                plugin.createForm(item, element);
		element.prev(".replyMarker").addClass("active");
	}
	}
	if (!item.depth && item.children.length && !plugin.get(item, "form")) {
		return;
	} else if (!plugin.get(item, "form")) return;
	if (!plugin.get(item, "form.initialized")) {
		plugin.set(item, "form.initialized", true);
                element.addClass("echo-item-container echo-item-container-child " +
                        "echo-trinaryBackgroundColor echo-item-depth-1");
			
		if (!item.children.length) {
			item.rerender("container");
			if (element.find("textarea").val().length == 0) {
				setTimeout(function(){
					element.find("textarea").val("@" + item.data.actor.title + " - ");
				},400);
			}
		}
	} else {
		var visible = plugin.get(item, "form.visible");
		if (visible && (!item.children.length || item.children.length == 1 && item.children[0].deleted)) {
			plugin.view(item, "hide");
		} else if (!visible && item.children.length) {
			plugin.view(item, "show");
		}
	}
};

plugin.containerItemRenderer = function(element, dom) {
	var item = this;
	var threading = item.threading;
	item.parentRenderer("container", arguments);
	item.threading = threading;
};

plugin.prepareParams = function(application, item) {
	return application.prepareBroadcastParams({
		"plugin": plugin.name,
		"form": plugin.get(item, "form"),
		"item": {
			"data": item.data,
			"target": item.dom.content
		}
	});
};

plugin.listenEvents = function(application) {
	$.map(["Expand", "Collapse"], function(action) {
		application.subscribe("Submit.on" + action, function(event, args) {
			var item = application.items[args.data.unique];
			if (action == "Collapse" && !item.children.length) {
				plugin.view(item, "hide");	
				item.rerender("container");
			}
			
			var topic = plugin.topic(application, "onForm" + action);
			application.publish(topic, plugin.prepareParams(application, item));
		});
	});
	application.subscribe("Submit.onPostComplete", function(topic, args) {
		var item = application.items[args.data.unique];
		var element = item.dom.content;
		element.find(".replyMarker:first").removeClass("active");
		
		if (!item) return;
		plugin.view(item, "toggle");
	});
};

plugin.createForm = function(item, target) {
	var config = plugin.assembleConfig(item, {
		"target": target.get(0),
		"data":  {"unique": item.data.unique},
		"mode": "standard",
		"targetURL": item.id
	});

	var key = plugin.getFormKey(item);
	var form = (plugin.get(plugin, key) || {}).instance;
	if (form) {
		var text = form.dom.get("text").val();
		form.config.set("target", target);
		target.empty().append(form.render());
		if (text) {
			form = new Echo.Submit(config);
			form.dom.get("text").val(text);
		}
	} else {
		form = new Echo.Submit(config);
	}
	var data = {
		"instance": form,
		"initialized": false,
		"visible": false
	};
	plugin.set(plugin, key, data);
	plugin.set(item, "form", data);
};

plugin.getFormKey = function(item) {
	return "forms." + item.data.unique + "-" + item.getContextId();
};

plugin.view = function(item, action) {
	var visibility = action == "toggle"
		? !plugin.get(item, "form.visible")
		: action == "hide";
	plugin.set(item, "form.visible", visibility);
	plugin.get(item, "form.instance").config.get("target")[action]();
	
};


})(jQuery);

// NYMAG Custom Plugins

//Add Markers as Class Names to comment elements - also adds editors pick

 (function($) {

var plugin = Echo.createPlugin({
	"name": "markerClass",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Item", "content", plugin.contentItemRenderer);
		plugin.extendTemplate("Item", plugin.counterTemplate, "insertAfter", "echo-item-authorName");
	}
});


plugin.contentItemRenderer = function(element, dom) {
	var item = this;
	var markers = item.data.object.markers;
	if (markers != undefined) {
		$.each(markers, function(i, marker) {
			element.addClass(marker);
		});
	}
};

plugin.counterTemplate = 
	"<div class='editors-picks'><img src='http://images.nymag.com/gfx/comments/editors-picks.png'></div>"
;

})(jQuery);

// Plugin for customizing the See More Button that Appears at the very bottom of the comments, in order to go to the next page

(function($) {
var plugin = Echo.createPlugin({
	"name": "moreMods",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Stream", "more", plugin.moreButtonRenderer);
	}
});


plugin.moreButtonRenderer = function(element, dom) {
        var self = this;
        if (this.isViewComplete || !this.threads.length) {
                element.empty().hide();
                return;
        }
        var getPageAfter = function() {
                return self.nextPageAfter || "0";
        };
        element.empty()
                .append(this.label("more"))
                .bind({
                        'mouseenter': function() {
                                element.addClass("echo-stream-more-hover");
                        },
                        'mouseleave': function() {
                                element.removeClass("echo-stream-more-hover");
                        }
                })
                .show()
                .unbind('click')
                .one('click', function() {
                        nymag_recordLink(this, "Comments - Show More", "event13");
                        $(".echo-stream-more-hover").addClass("clicked");
                        self.publish("Stream.onMoreButtonPress", self.prepareBroadcastParams());
                        element.html(self.label("loading"));
                        self.requestItems({
                                "pageAfter": '"' + getPageAfter() + '"'
                        }, function(items) {
                                if (items.length) {
                                        self.isInitialRequest = false;
                                        self.requestItemsData = items;
                                        self.render("body");
                                } else {
                                        element.html(self.label("emptyStream")).delay(1000).fadeOut(1000);
                                }
                        });
                });
};

})(jQuery);


//Plugin for limiting visible replies to 2, then expanding if the user chooses

(function($) {


var plugin = Echo.createPlugin({
	"name": "secondaryMods",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendRenderer("Item", "children", plugin.secondaryChildrenRenderer);
	}
});


plugin.secondaryChildrenRenderer = function(element, dom) {
	var self = this;
	// we cannot use element.empty() because it will remove children's event handlers
	
	$.each(element.children(), function(i, child) {
		$(child).detach();
	});
	$.map(this.children, function(child) {
		element.append(child.dom ? child.dom.content : child.render());
		if (child.deleted) {
			self.publish("internal.Item.onDelete", {"item": child});
		} else if (child.added) {
			self.publish("internal.Item.onAdd", {"item": child});
		}
	});
		var totalItems = element.children().length;
		
		if (totalItems > 0) {
			element.parent().addClass("threading");
		}
		var showSecondary = element.hasClass("show-secondary");
		$.each(element.children(), function(i, child) {
		if (showSecondary = true) {
			$(child).removeClass("pre-last last")
		}
		if (i > 1) {
			$(child).addClass("secondary");
			$(child).removeClass("last pre-last");
		} if (i == 1) {
			$(child).addClass("pre-last");
		} if (i == (totalItems - 1)) {
			$(child).addClass("last");
		}
	});
		
		var totalItemsLeft = totalItems - 2;
		if (totalItemsLeft == 1) {
			element.append("<div class=\'echo-item-content last\'><div class=\'echo-stream-more echo-stream-more-secondary\'>+ <span>Show <span class=\'secondary-highlight\'>" + totalItemsLeft + "</span> Other Reply</span></div></div>");
			element.find(".echo-stream-more").bind("click", function() {
				element.addClass("show-secondary");
			});		
		}
		if (totalItemsLeft > 1) {
			element.append("<div class=\'echo-item-content last\'><div class=\'echo-stream-more echo-stream-more-secondary\'>+ <span>Show <span class=\'secondary-highlight\'>" + totalItemsLeft + "</span> Other Replies</span></div></div>");
			element.find(".echo-stream-more").bind("click", function() {
				element.addClass("show-secondary");
			});
		}
		
}

})(jQuery);


// Plugin for adding the pipe between like/reply controls

(function($) {

var plugin = Echo.createPlugin({
      "name": "controlMods",
      "applications": ["Stream"],
      "init": function(plugin, application) {
              plugin.extendRenderer("Item", "controls", plugin.controlsRenderer);
      }
});

plugin.controlsRenderer = function(element) {
      this.parentRenderer("controls", arguments);
      $(".echo-item-control-delim", element).html("|");
}

})(jQuery);

// Report Abuse plugin - will need to be modified with users can submit tags.

(function($) {

var plugin = Echo.createPlugin({
	"name": "reportAbuse",
	"applications": ["Stream"],
	"init": function(plugin, application) {
		plugin.extendTemplate("Item", plugin.counterTemplate, "insertBefore", "echo-item-authorName");
		plugin.extendRenderer("Item", "reportAbuse", plugin.reportAbuseRenderer);
	}
});

plugin.getMembership = function(application) {
        return application.config.get(plugin.config("membership"), "");
};

plugin.counterTemplate = 
	"<div class='echo-item-reportAbuse'><div class='report-flag'><span>Flag</span></div>" +
		"<ul>" + 
		"<li id='report-cancel'>Cancel</li>" +
		"<li id='report-spam' class='report-button'>Spam</li>" +
		"<li id='report-offensive22' class='report-button'>Offensive</li>" +
		"<li id='report-duplicate' class='report-button'>Duplicate</li>" +
		"<li id='report-offtopic' class='report-button'>Off Topic</li>" +		
		"</ul>" +	
		"<div class='report-thanks'>Thank you for alerting us to a possible problem" + 
		"</div>" +
	"</div>"
;
       
plugin.getSubmissionProxyURL = function(application) {
			return application.config.get(plugin.config("submissionProxyURL"),
			application.config.get("submissionProxyURL"));
};

plugin.login = function(element, dom, application,report,item) {
        var membership = plugin.getMembership(application);
        var appendSessionID = function(url) {
                var id = encodeURIComponent(application.user.get("sessionID", ""));
                var parts = $.parseUrl(url);
                var session = parts["query"]
                        ? parts["query"].match(/=$/) ? id : "&sessionID=" + id
                        : "sessionID=" + id;
                return application.substitute("{Data:scheme}://{Data:domain}{Data:path}?{Data:query}{Data:fragment}", {
                        "scheme": parts["scheme"] || "http",
                        "domain": parts["domain"],
                        "path": parts["path"],
                        "query": (parts["query"] || "") + session,
                        "fragment": parts["fragment"] ? ("#" + parts["fragment"]) : ""
                });
        };
        if (membership == "janrain") {
	        NYM.echo.loadLogin({
       	             membership: "janrain",
                     appendSessionID: appendSessionID
    	        });
        }  else {
		NYM.echo.loadLogin({
			membership: "nym"
		});
        }
        var submitReport = Echo.Broadcast.subscribe("User.onInvalidate", function() {
                $.get(plugin.getSubmissionProxyURL(application), {
                                "appkey": application.config.get("appkey"),
                                "content": $.object2JSON({
                                        "verb": "tag",
                                        "target": item.id,
                                        "tags": report
                                }),
                                "sessionID": item.user.get("sessionID", "")
                        }, function(data) {
                                application.startLiveUpdates(true);
                        }, "jsonp");
			var addReportFlag = Echo.Broadcast.subscribe("Stream.onReady", function (topic, data, contextId) {
				$(".report-" + item.timestamp).addClass("active").addClass("thankyou");  
				Echo.Broadcast.unsubscribe("Stream.onReady",addReportFlag);
			});

			Echo.Broadcast.unsubscribe("User.onInvalidate",submitReport);
         });
};

plugin.reportAbuseRenderer = function(element, dom) {
        var item = this;
        var application = this;
	element.addClass("report-" + item.timestamp);
        element.find(".report-flag").bind("click", function() {
        	$(this).parent().addClass("active");
		$(this).parents("#echo-stream").addClass("report-click");
        });

        element.find("li.report-button").bind("click", function() {
		var report = $(this).attr("id");
		if (item.user.logged() == false) {
			plugin.login(element,dom,application,report,item);
			return;
		}
        	$.get(plugin.getSubmissionProxyURL(application), {
				"appkey": application.config.get("appkey"),
				"content": $.object2JSON({
					"verb": "tag",
					"target": item.id,
					"tags": report
				}),
				"sessionID": item.user.get("sessionID", "")
			}, function(data) {
                                application.startLiveUpdates(true);
			}, "jsonp");
			$(this).parents(".echo-item-reportAbuse").addClass("thankyou");
        });
        
        element.find("li#report-cancel").bind("click", function() {
		$(this).parents("#echo-stream").removeClass("report-click");
        	$(this).parents(".echo-item-reportAbuse").removeClass("active");
        });
};

})(jQuery);

// Custom post button modifications for top level submit form

(function($) {

var plugin = Echo.createPlugin({
	"name": "postButtonMods",
	"applications": ["Submit", "Stream"],
	"dependencies": [{
		"application": "Auth",
		"url": "//cdn.echoenabled.com/clientapps/v2.3.3/auth.js"
	}],
	"init": function(plugin, application) {
		plugin.extendRenderer("Submit", "postButton", plugin.newPostButtonRenderer);
	}
});

plugin.getTargetDom = function(application) {
        return application.config.get(plugin.config("targetDom"), "");
};

plugin.newPostButtonRenderer = function(element, dom) {
	var application = this;
	var self = this, isEditMode = this.config.get("mode") == "edit";
	
/* session ID function taken from auth.js */

var isUserLoggedIn = self.user.data.logged;

	var appendSessionID = function(url) {
		var id = encodeURIComponent(self.user.get("sessionID", ""));
		var parts = $.parseUrl(url);
		var session = parts["query"]
			? parts["query"].match(/=$/) ? id : "&sessionID=" + id
			: "sessionID=" + id;
		return self.substitute("{Data:scheme}://{Data:domain}{Data:path}?{Data:query}{Data:fragment}", {
			"scheme": parts["scheme"] || "http",
			"domain": parts["domain"],
			"path": parts["path"],
			"query": (parts["query"] || "") + session,
			"fragment": parts["fragment"] ? ("#" + parts["fragment"]) : ""
		});
	};
		
	
	var type = "login";
	var button = new Echo.UI.Button(element, {
		"normal": {
			"icons": false,
			"disabled": false,
			"label": self.label(isEditMode ? "update" : "")
		},
		"posting": {
			"icons": {
				"primary": "ui-icon-waiting"
			},
			"disabled": true,
			"label": self.label(isEditMode ? "updating" : "posting")
		}
	});
	this.postAction = this.postAction || function() {
	
	/* Validation for maximum characters in body*/
	
	var targetDom = plugin.getTargetDom(application);

	if (targetDom == "bottom-submit-form") {

	var slideTop = Echo.Broadcast.subscribe("Submit.onPostComplete", function (topic, data, contextId) {
		if (NYM.echo.sortOptions == "newest")  {
			var target = $("#comment-total").offset().top - 200;
			$('html,body').animate({scrollTop: target}, 1000);
			$("#submit-form .echo-submit-container").hide();
		}
			Echo.Broadcast.unsubscribe("Submit.onPostComplete", slideTop);
	});

	}

	var overLimit = element.parents(".echo-submit-container").find(".echo-submit-textCounter").hasClass("over-limit");
		if (overLimit == true) {
			element.parents(".echo-submit-container").addClass("validate").find(".validation-error").html("You are over the 2500 character limit. Please shorten your comment.");
			
			return;
		} else {
			element.parents(".echo-submit-container").removeClass("validate");
		}

		var get = function(name) {
			return self.dom.get(name);
		};
		var publish = function(stage, data) {
			var mode = isEditMode ? "Edit" : "Post";
			element.addClass("post-loading").append("<div class=\'postbutton-loader\'></div>");
			self.publish("Submit.on" + mode + stage, self.prepareBroadcastParams({
				"postData": data
			}));
		};
		var highlightMandatory = function(element) {
			if (element && !$.trim(element.val())) {
				element.parent().addClass("echo-submit-mandatory");
				element.focus(function() {
					$(this).parent().removeClass("echo-submit-mandatory");
				});
				return true;
			}
			return false;
		};
		if (highlightMandatory(get("text")) ||
			highlightMandatory(get("anonymousUserInfoName"))) return;
		var content;
		if (isEditMode) {
			content = [].concat(
				self.getContentUpdate(get("text").val()),
				self.getMetaDataUpdates("tag", "tags", get("tags").val()),
				self.getMetaDataUpdates("mark", "markers", get("markers").val())
			);
			if (!content.length) {
				publish("Complete", []);
				return;
			}
		} else {
			content = {
				"avatar" : self.user.get("avatar", ""),
				"content" : get("text").val(),
				"markers" : $.trim(get("markers").val()),
				"name" : self.user.get("name", (self.user.logged()
						? ""
						: get("anonymousUserInfoName").val())),
				"tags" : $.trim(get("tags").val()),
				"target" : self.config.get("targetURL"),
				"url" : self.user.get("domain", (self.user.logged()
						? ""
						: get("anonymousUserInfoUrl").val())),
				"verb" : "post"
			};
		};
		var entry = {
			"appkey" : self.config.get("appkey"),
			"content" : $.object2JSON(content),
			"sessionID": self.user.get("sessionID", "")
		};
		var callback = function() {
			button.setState("normal");
			get("text").val("").trigger("blur");
			self.rerender(["tagsContainer", "markersContainer"]);
			publish("Complete", content);
			nymag_recordLink(this, "Comments - Comment Posted", "event11");
			element.removeClass("post-loading").find(".postbutton-loader").remove();
			element.bind("click.postAction", application.postAction);
		};
		var textfield = get("text").val();
		var badWords = NYM.echo.checkBadWords({
			textBody: textfield
		});
		
		if (badWords != true) {
			badWords.join(',')
			element.parents(".echo-submit-container").addClass("validate").find(".validation-error").html("Please remove the following bad words: " + badWords)
			return;
		}
		var currUser = new Echo.User({
		    "appkey": NYM.echo.apiKey()
		});
		var probation = false;
		currUser.init(function () {
		    probation = currUser.account.markers.nymProbation;
		});
                if (probation) {
			element.parents(".echo-submit-container").addClass("validate").find(".validation-error").html("This account has been temporarily blocked from making comments.")
                        return;
                }
		publish("Init", content);
		element.unbind("click.postAction", this.postAction);
		$.get(self.config.get("submissionProxyURL"), entry, callback, "jsonp");
	};
	
		if (isUserLoggedIn == false) {

		var currLocation = plugin.getSection(application);
		element.unbind("click.postAction");

		if (currLocation == "nym") {
			element.bind("click.nymagLogin", function() {
				Backplane.expectMessagesWithin(30);
	                        NYM.echo.loadLogin({
       		                      membership: "nym"
               		        });
					var currDiv = element.parents(".nymag-submit-form").attr("id");
					var stagesPassed = 0;
					var subscriptions = {};
					var checkAsyncOperationCompletion = function() {
						stagesPassed++;
						if (stagesPassed < 2) return;
						// reset counter
						stagesPassed = 0;
						setTimeout(function(){
							$("#" + currDiv + " .echo-submit-postButton").trigger("click");
						},1000);
						$.each(subscriptions, function(topic, context) {
							Echo.Broadcast.unsubscribe(topic, context);
						}); 
					};
					$.map(["User.onInvalidate", "Stream.onRerender"], function(topic) {
						subscriptions[topic] = Echo.Broadcast.subscribe(topic, function () {
							checkAsyncOperationCompletion();
						});
					});
			});

			Echo.Broadcast.subscribe("User.onInvalidate", function() {
				$("#add-comment").hide();
			});
		} else {

		element.bind("click.janrainLogin", function() {
		        NYM.echo.loadLogin({
               			membership: "janrain",
		                appendSessionID: appendSessionID
		        });
		});

		}

		} else {
			element.unbind("click.janrainLogin");
			element.unbind("click.nymagLogin");
			element.unbind("click.postAction", this.postAction).bind("click.postAction", this.postAction);
		}	
};

plugin.getSection = function(application) {
	return application.config.get(plugin.config("section"), "janrain");
};


})(jQuery);

// Custom modifications for post buttons on replies, expands replies on submit and kicks off janrain if not logged in

(function($) {

var plugin = Echo.createPlugin({
	"name": "secondaryPostButtonMods",
	"applications": ["Submit"],
	
	"init": function(plugin, application) {
		plugin.extendRenderer("Submit", "postButton", plugin.newPostButtonRenderer);
	}
});



plugin.newPostButtonRenderer = function(element, dom) {

	var self = this, isEditMode = this.config.get("mode") == "edit";
	var isUserLoggedIn = self.user.data.logged;
	var button = new Echo.UI.Button(element, {
		"normal": {
			"icons": false,
			"disabled": false,
			"label": self.label(isEditMode ? "update" : "Post")
		},
		"posting": {
			"icons": {
				"primary": "ui-icon-waiting"
			},
			"disabled": true,
			"label": self.label(isEditMode ? "updating" : "posting")
		}
	});

/* session ID function taken from auth.js */

	var appendSessionID = function(url) {
		var id = encodeURIComponent(self.user.get("sessionID", ""));
		var parts = $.parseUrl(url);
		var session = parts["query"]
			? parts["query"].match(/=$/) ? id : "&sessionID=" + id
			: "sessionID=" + id;
		return self.substitute("{Data:scheme}://{Data:domain}{Data:path}?{Data:query}{Data:fragment}", {
			"scheme": parts["scheme"] || "http",
			"domain": parts["domain"],
			"path": parts["path"],
			"query": (parts["query"] || "") + session,
			"fragment": parts["fragment"] ? ("#" + parts["fragment"]) : ""
		});
	};
	
	
	this.postAction = this.postAction || function() {
	var overLimit = element.parents(".echo-submit-container").find(".echo-submit-textCounter").hasClass("over-limit");
		if (overLimit == true) {
			element.parents(".echo-submit-container").find(".validation-error").html("You are over the 2500 character limit. Please shorten your comment.");
			element.parents(".echo-submit-container").find(".validation-error").fadeIn("slow");
			return;
		} else {
			element.parents(".echo-submit-container").find(".validation-error").fadeOut("fast");
		}
	
		var get = function(name) {
			return self.dom.get(name);
		};
		var publish = function(stage, data) {
			var mode = isEditMode ? "Edit" : "Post";
			element.addClass("post-loading").append("<div class=\'postbutton-loader\'></div>");
			self.publish("Submit.on" + mode + stage, self.prepareBroadcastParams({
				"postData": data
			}));
		};
		var highlightMandatory = function(element) {
			if (element && !$.trim(element.val())) {
				element.parent().addClass("echo-submit-mandatory");
				element.focus(function() {
					$(this).parent().removeClass("echo-submit-mandatory");
				});
				return true;
			}
			return false;
		};
		if (highlightMandatory(get("text")) ||
			highlightMandatory(get("anonymousUserInfoName"))) return;
		var content;
		if (isEditMode) {
			content = [].concat(
				self.getContentUpdate(get("text").val()),
				self.getMetaDataUpdates("tag", "tags", get("tags").val()),
				self.getMetaDataUpdates("mark", "markers", get("markers").val())
			);
			if (!content.length) {
				publish("Complete", []);
				return;
			}
		} else {
			content = {
				"avatar" : self.user.get("avatar", ""),
				"content" : get("text").val(),
				"markers" : $.trim(get("markers").val()),
				"name" : self.user.get("name", (self.user.logged()
						? ""
						: get("anonymousUserInfoName").val())),
				"tags" : $.trim(get("tags").val()),
				"target" : self.config.get("targetURL"),
				"url" : self.user.get("domain", (self.user.logged()
						? ""
						: get("anonymousUserInfoUrl").val())),
				"verb" : "post"
			};
		};
		var entry = {
			"appkey" : self.config.get("appkey"),
			"content" : $.object2JSON(content),
			"sessionID": self.user.get("sessionID", "")
		};
		var callback = function() {
			nymag_recordLink(this, "Comments - Comment Posted","event11");
			nymag_recordLink(this, "Comments - Reply Posted","event12");
			button.setState("normal");
			get("text").val("").trigger("blur");
			self.rerender(["tagsContainer", "markersContainer"]);
			publish("Complete", content);
			element.removeClass("post-loading").find(".postbutton-loader").remove();
			element.bind("click.postAction", application.postAction);
			if (element.parents(".echo-item-children").length > 0) {
				element.parents(".echo-item-children").addClass("show-secondary");
				var target = element.parents(".echo-item-children").find(".echo-item-content:last").offset().top - 200;
			} else {
				element.parents(".echo-item-content").addClass("show-secondary");
				var target = element.parents(".echo-item-content").find(".echo-item-content:last").offset().top - 200;
			}
		};
		
		var textfield = get("text").val();
		var badWords = NYM.echo.checkBadWords({
			textBody: textfield
		});
		
		if (badWords != true) {
			badWords.join(',')
			element.parents(".echo-submit-container").addClass("validate").find(".validation-error").html("Please remove the following bad words: " + badWords)
			return;
		}
                var currUser = new Echo.User({
                    "appkey": NYM.echo.apiKey()
                });
                var probation = false;
                currUser.init(function () {
                    probation = currUser.account.markers.nymProbation;
                });
                if (probation) {
                        element.parents(".echo-submit-container").addClass("validate").find(".validation-error").html("This account has been temporarily blocked from making comments.")
                        return;
                }
		publish("Init", content);
		element.unbind("click.postAction", this.postAction);

		$.get(self.config.get("submissionProxyURL"), entry, callback, "jsonp");
	};
	
                if (isUserLoggedIn == false) {
		var application = this;
                var currLocation = plugin.getSection(application);
                element.unbind("click.postAction");

                if (currLocation == "nym") {
                        element.bind("click.nymagLogin", function() {
                                Backplane.expectMessagesWithin(30);
				element.parents(".echo-submit-container").attr("id","active-form");
                                NYM.echo.loadLogin({
                                      membership: "nym"
                                });
                                        var currDiv = element.parents(".echo-item-replyForm").attr("id");
                                        var stagesPassed = 0;
                                        var subscriptions = {};
                                        var checkAsyncOperationCompletion = function() {
                                                stagesPassed++;
                                                if (stagesPassed < 2) return;
                                                // reset counter
                                                stagesPassed = 0;
                                                setTimeout(function(){
                                                        $("#" + currDiv + " .echo-submit-postButton").trigger("click");
                                                },1000);
                                                $.each(subscriptions, function(topic, context) {
                                                        Echo.Broadcast.unsubscribe(topic, context);
                                                });
                                        };
                                        $.map(["User.onInvalidate", "Stream.onRerender"], function(topic) {
                                                subscriptions[topic] = Echo.Broadcast.subscribe(topic, function () {
                                                        checkAsyncOperationCompletion();
                                                });
                                        });
                        });

                        Echo.Broadcast.subscribe("User.onInvalidate", function() {
                                $("#add-comment").hide();
                        });
                } else {

                element.bind("click.janrainLogin", function() {
                        NYM.echo.loadLogin({
                                membership: "janrain",
                                appendSessionID: appendSessionID
                        });
                });

                }

                } else {
                        element.unbind("click.janrainLogin");
                        element.unbind("click.nymagLogin");
                        element.unbind("click.postAction", this.postAction).bind("click.postAction", this.postAction);
                }
};

plugin.getSection = function(application) {
        return application.config.get(plugin.config("section"), "janrain");
};

})(jQuery);

// Custom Likes behavior

(function($) {

var plugin = Echo.createPlugin({
	"name": "likeMods",
	"applications": ["Stream", "UserList"],
	"dependencies": [{
		"application": "UserList",
		"url": "http://cdn.echoenabled.com/clientapps/v2/user-list.js"
	}],
	"init": function(plugin, application) {
		plugin.extendRenderer("UserList", "more", plugin.MoreRenderer);
		plugin.extendRenderer("UserList", "actors", plugin.ActorsRenderer);
		plugin.parentPlugin = Echo.Plugins.Like;
	}
});

plugin.MoreRenderer = function(element) {
	var self = this;
	if (!this.isMoreButtonVisible()) {
		element.hide();
		return;
	}
	element.empty().show();
	var count = this.count.total - this.count.visible;
	var caption = (count > 0 ? count + " " : "") + this.label("more");
	var linkable = !this.fromExternalData() || this.count.visible < this.users.length;
	if (linkable) {
		element.addClass("echo-linkColor").append(this.hyperlink({"caption": caption}));
	} else {
		element.removeClass("echo-linkColor").append(caption);
	}
	this.moreRequestInProgress = false;
	if (linkable) {
		element.click(function(e) {
				element.append("<div style=\'display:none;\'><div id=\'likes-all\'><ul></ul></div></div>");
				$.each(self.users , function (i,item) {
					if (item.instance.data.avatar != undefined) {
						var avatar = "<img src=\'" + item.instance.data.avatar + "\' height=\'50\' width=\'50\'>"
					} else {
						var avatar = "<img src=\'http://c0.echoenabled.com/images/avatar-default.png\' height=\'50\' width=\'50\'>"
					}
					$("#likes-all ul").append("<li><a href=\'"+item.instance.data.id+"\'>" + avatar + "</a><a href=\'"+item.instance.data.id+"\'>" + item.instance.data.title + "</a></li>");
				});		
				$.fancybox({
					'autoDimensions': false,
					'height': 410,
					'width': 365,
					'href': '#likes-all',
					'transitionIn'	:	'fade',
					'transitionOut'	:	'fade',
					'speedIn'		:	600, 
					'speedOut'		:	600, 
					'overlayOpacity' : 0,
					'overlayShow'	:	true,
					'onClosed': function() {
						element.find("#likes-all").remove();
					},
					'title': 'People who like this',
					'titlePosition': 'inside'
				});
				$("#fancybox-wrap").addClass("likes");
		});
	}
};

plugin.ActorsRenderer = function(element) {
	var self = this;
	element.prepend("Liked By ");
	if (!this.users.length) return;
	var usersDOM = [];
	var userLabel = this.config.get("userLabel");
	if (!this.users.length || !userLabel.avatar && !userLabel.text) return;

	var action = (userLabel.avatar && !userLabel.text ? "addClass" : "removeClass");
	element[action]("echo-user-list-only-avatars");
	var wrap = function(text, name) {
		var classAttr = name ? ' class="echo-user-list-' + name + '"' : '';
		return "<span" + classAttr + ">" + text + "</span>";
	};
	$.map(this.users.slice(0, this.count.visible), function(user) {
		usersDOM.push(user.instance.render());
	});
	var delimiter = this.config.get("userLabel.text") ? ", " : "";
	var last;
	if (!this.isMoreButtonVisible()) last = usersDOM.pop();
	if (usersDOM.length) {
		usersDOM = delimiter
			? $.intersperse(usersDOM, wrap(delimiter, "delimiter"))
			: usersDOM;
		// use &nbsp; instead of simple space because IE will cut off simple one after <span>
		usersDOM.push(wrap("&nbsp;" + this.label("and") + " ", "and"));
	}
	if (!this.isMoreButtonVisible()) usersDOM.push(last);
	$.map(usersDOM, function(chunk) {
		element.append(chunk);
	});
};



})(jQuery);



// Custom Character Counter Plugin


(function($) {
    var plugin = Echo.createPlugin({
        "name": "SubmitTextCounter",
        "applications": ["Submit"],
        "init": function(plugin, application) {
            plugin.extendRenderer("Submit", "text", plugin.textRenderer);
            plugin.extendRenderer("Submit", "typedCharsCounter", plugin.typedCharsCounterRenderer);
            plugin.extendTemplate("Submit", plugin.counterTemplate, "insertBefore", "echo-submit-content");
            plugin.extendTemplate("Submit", plugin.loginPromptTemplate, "insertAfter", "echo-submit-header");
            plugin.extendTemplate("Submit", plugin.cancelButton, "insertAfter", "echo-submit-post-container");
            plugin.extendTemplate("Submit", plugin.byText, "insertBefore", "echo-submit-auth"); 
	    plugin.extendTemplate("Submit", plugin.validationError, "insertAfter", "echo-submit-auth");
            plugin.extendRenderer("Submit", "cancel-button", plugin.cancelButtonRenderer);
            plugin.set(application, "typed", 0);
        }

    });

    plugin.addLabels({
        "numCharsTyped": "&nbsp;out of 2500 characters allowed."
    });  
    
	plugin.loginPromptTemplate =
	"<div id='echo-login-prompt'>You will be prompted to sign in before your comment publishes.</div>" +
	"<div id='echo-comment-prompt'>COMMENT</div>"
	;

	plugin.validationError = "<div class='validation-error'>You are over the 2500 character Limit</div>";
	
	plugin.cancelButton = "<div class='echo-submit-cancel-button'>Cancel</div>";
	
    plugin.cancelButtonRenderer = function(element, dom) {
    	element.bind("click", function() {
		if (element.parents(".nymag-submit-form").length > 0) {
			element.parents(".echo-submit-container").find(".echo-submit-text").val("");
			if (element.parents(".nymag-submit-form").attr("id") == "submit-form") {
				element.parents(".nymag-submit-form").removeClass("active");
			}
		} else {
			element.parents(".echo-item-replyForm").hide();
			element.parents(".echo-item-container").find(".replyMarker").removeClass("active");
			NYM.echo.EchoStream.startLiveUpdates();
		}
    	});
    
    }
	
	plugin.byText = "<div class='by-text'>By</div>";
	
    plugin.counterTemplate =

        '<div id="submit-header"><div class="echo-submit-textCounter">' +

            '<span class="echo-submit-typedCharsCounter"></span>' +
            
            plugin.label("numCharsTyped") +
            
            '<span class="echo-submit-userGuide"><a href="http://nymag.com/newyork/commentguidelines/">&raquo; User guidelines</a></span>' +

        '</div></div>';

    plugin.textRenderer = function(element, dom) {
        var application = this;
        application.parentRenderer("text", arguments);

        element.bind("keyup keypress", function() {
        	var maxCount = 2500;
        	var charCount = element.val().length;
        	var formContent = element.val();
        	if (charCount > 0) {
        		element.parents(".echo-submit-container").find(".echo-submit-cancel-button").addClass("active");
        	} else {
        		element.parents(".echo-submit-container").find(".echo-submit-cancel-button").removeClass("active");
        	}
        	
        		if (charCount > maxCount) {
        			if ($(".echo-submit-textCounter").hasClass("over-limit") == false) {
        				$(".echo-submit-textCounter").addClass("over-limit");	
        			}
        		} else {
        			$(".echo-submit-textCounter").removeClass("over-limit");
        			element.parents(".echo-submit-container").removeClass("validate");;
        		}

            plugin.set(application, "typed", element.val().length);
            application.rerender("typedCharsCounter");

        });

    };

    plugin.typedCharsCounterRenderer = function(element, dom) {
        var application = this;
        return plugin.get(application, "typed");
    };

})(jQuery);

// plugin for stripping out embedded video elements

(function($) {

var plugin = Echo.createPlugin({
       "name": "ItemContentNormalizer",
       "applications": ["Stream"],
       "init": function(plugin, application) {
               plugin.extendRenderer("Item", "body", plugin.bodyItemRenderer);
       }
});

plugin.bodyItemRenderer = function(element) {
       var application = this;
       var item = this;
       item.data.object.content = item.data.object.content.replace(/<object(.*?)<\/object>/g, "");
       item.data.object.content = item.data.object.content.replace(/<img(.*?)>/g, "");
       var template = plugin.getTemplate(application);
           if (template == "articles-truncated") {
               var fullComment = item.data.object.content;
	       if (fullComment.length > 180) {
                   var truncComment = (item.data.object.content).substring(0,180);
                   var lastFullWord = truncComment.lastIndexOf(" ");
                   truncComment = (item.data.object.content).substring(0,lastFullWord);
                   item.data.object.content = "<p class=\'full-comment\'>" + item.data.object.content + "<\/p><p class=\'trunc-comment\'>" + truncComment + " <a href=\'javascript:void(0);\' class=\'show-full\'>...<\/a><\/p>";
               }
           }
       item.parentRenderer("body", arguments);
	element.find(".show-full").bind("click", function() {
		$(this).parent().hide();
		$(this).parent().prev(".full-comment").show();
	});
};

plugin.getTemplate = function(application) {
        return application.config.get(plugin.config("template"), "");
};

})(jQuery);

// plugin for adding marker class in moderator view

(function($) {

var plugin = Echo.createPlugin({
       "name": "moderatorMarkerClass",
       "applications": ["Stream"],
       "init": function(plugin, application) {
               plugin.extendRenderer("Item", "extraField", plugin.markerClassRenderer);
       }
});

plugin.markerClassRenderer = function(element,dom,extra) {
	var self = this;
	var type = (extra || {}).type;
	if (!this.data.object[type] || !this.user.isAdmin()) {
		element.remove();
		return;
	}
	var items = $.foldl([], this.data.object[type], function(item, acc){
		var template = (item.length > self.config.get("limits." + type))
			? "<span title={Data:item}>{Data:truncatedItem}</span>"
			: "<span class=\'data-{Data:item}'\>{Data:item}</span>";
		var truncatedItem = $.htmlTextTruncate(item, self.config.get("limits." + type), "...");
		acc.push(self.substitute(template, {"item": item, "truncatedItem": truncatedItem}));
	});
	element.prepend(items.sort().join(", "));
};

})(jQuery);


// plugin for stripping the re on retags

(function($) {

var plugin = Echo.createPlugin({
       "name": "reTagMods",
       "applications": ["Stream"],
       "init": function(plugin, application) {
               plugin.extendRenderer("Item", "re", plugin.retagItemRenderer);
       }
});

plugin.retagItemRenderer = function(element) {
	if (!this.config.get("reTag")) return;
	var self = this;
	var context = this.data.object.context;
	var re = "";
	//XXX use normalized permalink and location instead
	var permalink = this.data.object.permalink;

	var getDomain = function(url) {
		var parts = $.parseUrl(url);
		return (parts && parts.domain) ? parts.domain : url;
	};

	var reOfContext = function(c) {
		var maxLength = self.config.get("limits.reTitle");
		if (!c.title) {
			maxLength = self.config.get("limits.reLink");
			c.title = c.uri.replace(/^https?:\/\/(.*)/ig, '$1');
		}
		if (c.title.length > maxLength) {
			c.title = c.title.substring(0, maxLength) + "...";
		}
		return "<div><span class=\'commenton\'>Comment on<\/span> " + self.hyperlink({
			"class": "echo-primaryColor",
			"href": c.uri,
			"caption": $.stripTags(c.title)
		}, {
			"openInNewWindow": self.config.get("openLinksInNewWindow")
		}) + "</div>";
	};

	var pageHref = document.location.href;
	var pageDomain = getDomain(pageHref);

	if (permalink == pageHref || this.depth || !context || !context.length) {
		return;
	}
	var mustSkipContext = false;
	$.each(context, function(i, c) {
		//XXX use normalized uri
		if (c.uri == pageHref) {
			mustSkipContext = true;
			return false; //break
		}
	});

	if (mustSkipContext) return;

	if (this.config.get("optimizedContext")) {
		var primaryContext = context[0];
		$.each(context, function(i, c) {
			if (getDomain(c.uri) == pageDomain) {
				primaryContext = c;
				return false; //break
			}
		});
		if (primaryContext) re = reOfContext(primaryContext);
	} else {
		$.each(context, function(i, c) {
			re += reOfContext(c);
		});
	}

	return $(re);
};

})(jQuery);

//Add Template Class Name to echo stream

 (function($) {

var plugin = Echo.createPlugin({
        "name": "templateClass",
        "applications": ["Stream"],
        "init": function(plugin, application) {
		var currLoc = plugin.getSection(application);
		$("#echo-stream").addClass(currLoc);
        }
});

plugin.getSection = function(application) {
        return application.config.get(plugin.config("template"), "");
};

})(jQuery);

// Adds another username by the datestamp for Krang Truncated Stream

(function($) {
var plugin = Echo.createPlugin({
        "name": "subUserNameMods",
        "applications": ["Stream"],
        "init": function(plugin, application) {
                var currLoc = plugin.getSection(application);
		if (currLoc == "articles-truncated") {
			var username = application.user.data.name;
			plugin.extendRenderer("Item", "subusername", plugin.subUserRenderer);
			plugin.extendTemplate("Item", plugin.subUserName,"insertAfter", "echo-item-metadata");
		}
        }
});

plugin.getSection = function(application) {
        return application.config.get(plugin.config("template"), "");
};

plugin.subUserName = '<div class="echo-item-subusername"></div>';

plugin.subUserRenderer = function(element) {
	var item = this;
	var profileLink = this.data.actor.id;
	var username = item.data.actor.title;
	element.html("<span>By<\/span> <a href=\'"+profileLink+"\'>" +  username + "<\/a>");
};

})(jQuery);


// Links username to MYNY profile page and adds NYMAG employee if applicable

(function($) {
var plugin = Echo.createPlugin({
        "name": "userNameMods",
        "applications": ["Stream"],
        "init": function(plugin, application) {
                        plugin.extendRenderer("Item", "authorName", plugin.userModRenderer);
        }
});

plugin.userModRenderer = function(element) {
	var application = this;
	var userName = this.data.actor.title;
	if (this.data.actor.markers == "nym") {
        	userName = this.data.actor.title + " (NYMAG)";
	}
	var membership = plugin.getMembership(application);
	if (membership == "nym") {
		var profileLink = this.data.actor.id;
		userName = "<a href=\'" + profileLink + "\'>" + userName + "<\/a>";
	}
	return (userName || this.label("guest"));
};

plugin.getMembership = function(application) {
        return application.config.get(plugin.config("membership"), "");
};

})(jQuery);

// links avatar to profile page
(function($) {
var imagenumber = Math.floor(Math.random()*11111);
var plugin = Echo.createPlugin({
        "name": "avatarMods",
        "applications": ["Stream"],
        "init": function(plugin, application) {
		var membership = plugin.getMembership(application);
		if (membership == "nym") {
                        plugin.extendRenderer("Item", "avatar", plugin.avatarModRenderer);
		}
        }
});

plugin.avatarModRenderer = function() {
	var self = this;
	var profileLink = this.data.actor.id;
	var profileImage = profileLink + "/picture?type=square&ord="+ imagenumber;
	var size = (!this.depth ? 48 : 24);
	var url = $.htmlize(this.data.actor.avatar || this.user.get("defaultAvatar"));
	return $("<img>", { "src": profileImage, "width": size, "height": size }).css("cursor","pointer").bind({
			"error" : function(){
				$(this).attr("src", self.user.get("defaultAvatar"));
			},
			"click" : function() {
				window.location.href = profileLink;
			}
		})
};

plugin.getMembership = function(application) {
        return application.config.get(plugin.config("membership"), "");
};

})(jQuery);

// Edit Timer

(function($) {
var plugin = Echo.createPlugin({
        "name": "EditTimer",
        "applications": ["Stream"],
        "dependencies": [{
                "application": "Submit",
                "url": "//cdn.echoenabled.com/clientapps/v2.3.3/submit.js"
        }],
        "init": function(plugin, application) {
		plugin.extendTemplate("Item", plugin.template,"insertAsLastChild", "echo-item-frame");
		plugin.extendRenderer("Item", "editTimer", plugin.EditTimerRenderer);
		
        }
});

plugin.template = '<div class="echo-item-editTimer"></div>';

plugin.EditTime = function(element,time) {
        if (time == 0) {
                element.remove()
                return;
        }
        var displayMinute = time/60;
        displayMinute = parseInt(displayMinute);
        var displaySecond = (time - (displayMinute*60));
        if (displaySecond < 10) { displaySecond = "0" + displaySecond; }
        element.html('<span>Edit Comment <span class="editTime">('+displayMinute+':' + displaySecond + ')</span></span>');
        time = parseFloat(time);
        var newTime = time -1;
        setTimeout(function(){plugin.EditTime(element,newTime)},1000);

};

plugin.EditTimerRenderer = function(element) {
        var item = this;
	if (item.user.logged() == false) { element.remove(); }
	var application = this;
        var User = item.user.account.id;
        var Commenter = item.data.actor.id;
	var postedTime = item.timestamp;
	var currentTime = new Date();
	currentTime = currentTime.getTime();
	currentTime = parseInt(currentTime/1000);
	var timeDiff = currentTime - postedTime;
	var timeLeft = 180 - timeDiff;
	if (timeDiff > 180) {
		element.remove();
		return;
	}
        if (User == Commenter) {
		plugin.EditTime(element,timeLeft);
		element.bind("click", function() {
		element.remove();
                var popup = new Echo.UI.Dialog({
                        "content": function(target) {
                                $(target).addClass("echo-editTimer-item-container");
                                new Echo.Submit(plugin.assembleConfig(application, {
                                        "target": target,
                                        "data": item.data,
                                        "mode": "edit",
                                        "targetURL": item.id
                                }));
				$(target).find('.echo-button .echo-submit-postButton').before('<button class="echo-submit-cancelButton echo-primaryFont ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Cancel</span></button>');
                                $(target).find('.echo-submit-cancelButton').bind('click', function() {
					$(this).parents(".ui-dialog").remove();
                                });

                        },
                        "config": {
				"draggable": false,
                                "autoOpen": true,
                                "title": plugin.label("Edit Your Comment"),
                                "width": 500,
                                "height": 230,
                                "minWidth": 500,
                                "minHeight": 230
                        }
		});
		application.subscribe("Submit.onEditInit", function(event, args) {
                        item.block(plugin.label("updating"));
		application.unsubscribe("Submit.onEditInit");
        });

        application.subscribe("Submit.onEditComplete", function(event, args) {
		popup.close();
		application.unsubscribe("Submit.onEditComplete");
        });
		});
	} else {
		element.remove();
	}
};
})(jQuery);


// Editor's Pick One Click
(function($) {

var plugin = Echo.createPlugin({
        "name": "edPicks",
        "applications": ["Stream"],
        "init": function(plugin, application) {
                plugin.addItemControl(application, plugin.assembleControl("edPicks", application));
        }
});

plugin.assembleControl = function(name,application) {
        var callback = function() {
        var item = this;
        item.controls[plugin.name + ".edPicks"].element
                        .empty()
                        .append(plugin.label("Marking Pick"));

                $.get(plugin.getSubmissionProxyURL(application), {
                        "appkey": application.config.get("appkey"),
                        "content": $.object2JSON({
                                "verb": "mark",
                                "target": item.id,
                                "markers": "ep"
                        }),
                        "sessionID": item.user.get("sessionID", "")
                }, function(data) {
                                application.startLiveUpdates(true);
                }, "jsonp");
        };
        return function() {
                var item = this;
            return {
                "name": "edPicks",
                "label": '<span class="echo-clickable">Make Editors Pick</span>',
                "visible": item.user.isAdmin(),
                "callback": callback
            }

        };

};

plugin.getSubmissionProxyURL = function(application) {
        return application.config.get(plugin.config("submissionProxyURL"),
        application.config.get("submissionProxyURL"));
};

})(jQuery);
