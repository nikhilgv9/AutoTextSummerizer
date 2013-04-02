// vim: set ts=8 sts=8 sw=8 noet:
/*
 * Copyright (c) 2006-2011 Echo <solutions@aboutecho.com>. All rights reserved.
 * You may copy and modify this script as long as the above copyright notice,
 * this condition and the following disclaimer is left intact.
 * This software is provided by the author "AS IS" and no warranties are
 * implied, including fitness for a particular purpose. In no event shall
 * the author be liable for any damages arising in any way out of the use
 * of this software, even if advised of the possibility of such damage.
 * $Id: stream.js 31855 2011-03-24 08:49:42Z jskit $
 */

(function($) {

// we should not clear the window.$ variable without reason
// if $._$ is undefined it means that no lib on the page except our one is using window.$ variable
// and we do not need to clear it in order to avoid libs\versions conflicts

if (typeof($._$) != "undefined") {
        $.noConflict();
}



if (!window.Echo) window.Echo = {};
if (!Echo.Vars) Echo.Vars = {
	"regexps": {
		"matchLabel": /{Label:([^:}]+[^}]*)}/g,
		"matchData": /{Data:(([a-z]+\.)*[a-z]+)}/ig,
		"parseUrl": /^((([^:\/\?#]+):)?\/\/)?([^\/\?#]*)?([^\?#]*)(\?([^#]*))?(#(.*))?/,
		"w3cdtf": /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)Z$/
	}
};

$.extend({
	"addCss": function(cssCode, id) {
		Echo.Vars.css = Echo.Vars.css || {
			"index": 1,
			"processed": {}
		};
		if (id) {
			if (Echo.Vars.css.processed[id]) return;
			Echo.Vars.css.processed[id] = true;
		}
		var curCssCode = "";
		var oldStyle = Echo.Vars.css.anchor;
		if (oldStyle && oldStyle.length) {
			curCssCode = oldStyle.html();
		}
		// IE limit is 4095 rules per style tag
		// so we limit it to 100000 characters
		// (2000 rules x 50 characters per rule)
		if (curCssCode.length + cssCode.length > 100000) {
			Echo.Vars.css.index++;
			oldStyle = null;
			curCssCode = "";
		}
		var newStyle = $('<style id="echo-css-' + Echo.Vars.css.index + '" type="text/css">' + curCssCode + cssCode + '</style>');
		if (oldStyle && oldStyle.length) {
			// use replacing instead of adding css to existing element
			// because IE doesn't allow it
			oldStyle.replaceWith(newStyle);
		} else {
			if (Echo.Vars.css.anchor) {
				Echo.Vars.css.anchor.after(newStyle);
			} else {
				$(document.getElementsByTagName("head")[0] || document.documentElement).prepend(newStyle);
			}
		}
		Echo.Vars.css.anchor = newStyle;
	},
	"foldl": function(acc, object, callback) {
		$.each(object, function(key, item) {
			result = callback(item, acc, key);
			if (result !== undefined) acc = result;
		});
		return acc;
	},
	"intersperse": function(object, separator) {
		return $.foldl([], object, function(item, acc, key) {
			if (acc.length) acc.push(separator);
			acc.push(item);
		});
	},
	"getNestedValue": function(key, data, defaults, callback) {
		if (typeof key == "string") {
			key = key.split(/\./);
		}
		if (!key.length) return data;
		var found = true;
		var iteration = function(_key, _data) {
			if (callback) callback(_data, _key);
			if (typeof _data[_key] == "undefined") {
				found = false;
			} else {
				return _data[_key];
			}
		};
		// avoid foldl usage for plain keys
		var value = key.length == 1
			? iteration(key.pop(), data)
			: $.foldl(data, key, iteration);
		return found ? value : defaults;
	},
	"setNestedValue": function(obj, key, value) {
		var keys = key.split(/\./);
		var field = keys.pop();
		var data = $.getNestedValue(keys, obj, undefined, function(acc, v) {
			if (typeof acc[v] == "undefined") acc[v] = {};
		});
		data[field] = value;
	},
	"htmlize": function(text) {
		if (!text) return '';
		return $('<div>').text(text).html();
	},
	"object2JSON": function(obj) {
		var encodeJSONLiteral = function(string) {
			var replacements = {
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'};
			return string.replace(/[\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff\\]/g,
				function (a) {
					return (replacements.hasOwnProperty(a))
						? replacements[a]
						: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}
			);
		}
		var out;
		switch (typeof obj) {
			case "number"  : out = isFinite(obj) ? obj : 'null'; break;
			case "string"  : out = '"' + encodeJSONLiteral(obj) + '"'; break;
			case "boolean" : out = '"' + obj.toString() + '"'; break;
			default :
				if (obj instanceof Array) {
					var container = $.map(obj, function(element) { return $.object2JSON(element); });
					out = '[' + container.join(",") + ']';
				} else if (obj instanceof Object) {
					var source = obj.exportProperties || obj;
					var container = $.foldl([], source, function(value, acc, property) {
						if (source instanceof Array) {
							property = value;
							value = obj[property];
						}
						acc.push('"' + property + '":' + $.object2JSON(value));
					});
					out = '{' + container.join(",") + '}';
				} else {
					out = 'null';
				}
		}
		return out;
	},
	"htmlTextTruncate": function(text, limit, postfix) {
		if (!limit || text.length < limit) return text;
		var tags = [], count = 0, finalPos = 0;
		var list = "br hr input img area param base link meta option".split(" ");
		var standalone = $.foldl({}, list, function(value, acc, key) {
			acc[value] = true;
		});
		for (var i = 0; i < text.length; i++) {
			var symbol = text.charAt(i);
			if (symbol == "<") {
				var tail = text.indexOf(">", i);
				if (tail < 0) return text;
				var source = text.substring(i + 1, tail);
				var tag = {"name": "", "closing": false};
				if (source[0] == "/") {
					tag.closing = true;
					source = source.substring(1);
				}
				tag.name = source.match(/(\w)+/)[0];
				if (tag.closing) {
					var current = tags.pop();
					if (!current || current.name != tag.name) return text;
				} else if (!standalone[tag.name]) {
					tags.push(tag);
				}
				i = tail;
			} else if (symbol == "&" && text.substring(i).match(/^(\S)+;/)) {
				i = text.indexOf(";", i);
			} else {
				if (count == limit) {
					finalPos = i;
					break;
				}
				count++;
			}
		}
		if (finalPos) {
			text = text.substring(0, finalPos) + (postfix || "");
			for (var i = tags.length - 1; i >= 0; i--) {
				text += "</" + tags[i].name + ">";
			}
		}
		return text;
	},
	"mapClass2Object": function(e, ctl) {
		ctl = ctl || {};
		e.find("*").andSelf().each(function(i, el) {
			if (el.className) {
				var arr = el.className.split(/[ ]+/);
				$.each(arr, function(i, c) { ctl[c] = el; });
			}
		});
		return ctl;
	},
	"stripTags": function(text) {
		return $('<div>').html(text).text();
	},
	"parseUrl": function(url) {
		var parts = url.match(Echo.Vars.regexps.parseUrl);
		return parts ? {
			"scheme": parts[3],
			"domain": parts[4],
			"path": parts[5],
			"query": parts[7],
			"fragment": parts[9]
		} : undefined;
	},
	"toDOM": function(template, prefix, renderer) {
		var content = $(template);
		var elements = $.mapClass2Object(content);
		var dom = {
			"set": function(name, element) {
				elements[prefix + name] = element;
			},
			"get": function(name, ignorePrefix) {
				var element = elements[(ignorePrefix ? "" : prefix) + name];
				return element && $(element);
			},
			"remove": function(element) {
				var name;
				if (typeof element == "string") {
					name = prefix + element;
				} else {
					name = element.echo.name;
				}
				$(elements[name]).remove();
				delete elements[name];
			},
			"content": content
		};
		var rendererFunction;
		if (typeof renderer == 'object') {
			rendererFunction = function(name, element, dom) {
				if (!renderer[name]) return;
				return renderer[name](element, dom);
			}
		} else {
			rendererFunction = renderer;
		}
		$.each(elements, function(id, element) {
			var pattern = id.match(prefix + "(.*)");
			var name = pattern ? pattern[1] : undefined;
			if (name && rendererFunction) {
				element = $(element);
				element.echo = element.echo || {};
				element.echo.name = id;
				var node = rendererFunction(name, element, dom);
				if (typeof node != "undefined") element.empty().append(node);
			}
		});
		return dom;
	},
	"loadScriptContent": function(url, callback) {
		Echo.Vars.scriptState = Echo.Vars.scriptState || {};
		if (Echo.Vars.scriptState[url] == "loaded") {
			callback();
			return;
		}
		var id = Echo.Broadcast.subscribe("internal.scriptLoaded",
			function(topic, scriptURL) {
				if (url != scriptURL) return;
				Echo.Broadcast.unsubscribe("internal.scriptLoaded", id);
				callback();
			});
		if (Echo.Vars.scriptState[url] == "loading") return;
		Echo.Vars.scriptState[url] = "loading";
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.src = url;
		var container = document.getElementsByTagName("head")[0] ||
				document.documentElement;
		container.insertBefore(script, container.firstChild);
		script.onload = script.onreadystatechange = function() {
			var state = script.readyState;
			if (!state || state == "loaded" || state == "complete") {
				Echo.Vars.scriptState[url] = "loaded";
				Echo.Broadcast.publish("internal.scriptLoaded", url);
				script.onload = script.onreadystatechange = null;
			}
		};
	},
	"sendPostRequest": function(url, data, callback){
		var id = "echo-post-" + Math.random();
		var container =
			$("#echo-post-request").length
				? $("#echo-post-request").empty()
				: $('<div id="echo-post-request"/>').css({"height": 0}).prependTo("body");
		// it won't work if the attributes are specified as a hash in the second parameter
		$('<iframe id="' + id + '" name="' + id + '" width="0" height="0" frameborder="0" border="0"></iframe>').appendTo(container);
		var form = $("<form/>", {
			"target" : id,
			"method" : "POST",
			"enctype" : "application/x-www-form-urlencoded",
			"acceptCharset" : "UTF-8",
			"action" : url
		})
			.appendTo(container);
		$.each(data, function(key, value) {
			$("<input/>", {
				"type" : "hidden",
				"name" : key,
				"value" : value
			})
			.appendTo(form);
		});
		form.submit();
		callback();
	},
	"getVisibleColor": function(elem) {
		// calculate visible color of element (transparent is not visible)
		var color;
		do {
			color = elem.css('backgroundColor');
			if (color != '' && color != 'transparent' || $.nodeName(elem.get(0), 'body')) {
				break;
			}
		} while (elem = elem.parent());
		return color || 'transparent';
	},
	"timestampFromW3CDTF": function(t) {
		var parts = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'];
		var dt = {};
		var matches = t.match(Echo.Vars.regexps.w3cdtf);
		$.each(parts, function(i, p) {
			dt[p] = matches[i + 1];
		});
		return Date.UTC(dt['year'], dt['month'] - 1, dt['day'],
			dt['hours'], dt['minutes'], dt['seconds']) / 1000;
	}
});



if (!Echo.Plugins) Echo.Plugins = {};

Echo.isExtended = function(plugin, unique, value) {
	if (!plugin) return false;
	value = value || true;
	var id = [plugin].concat(unique).join(".");
	Echo.Vars.extensions = Echo.Vars.extensions || {};
	if (Echo.Vars.extensions[id] == value) return true;
	Echo.Vars.extensions[id] = value;
	return false;
};

Echo.extendRenderer = function(component, method, renderer, plugin) {
	if (!component || !Echo[component] || !method || !renderer || !$.isFunction(renderer) ||
		Echo.isExtended(plugin, [component, "renderer", method])) return;
	var _renderer = Echo[component].prototype.renderers[method] || function() {};
	Echo[component].prototype.renderers[method] = function() {
		var config = plugin && this.config.get("plugins." + plugin);
		if (!config || !config.enabled) {
			return _renderer.apply(this, arguments);
		}
		var self = this;
		if (!this.parentRenderer) {
			this.parentRenderer = function(name, args) {
				return self.parentRenderers[name].apply(self, args);
			}
		}
		this.parentRenderers = this.parentRenderers || {};
		this.parentRenderers[method] = _renderer;
		return renderer.apply(this, arguments);
	};
};

Echo.extendTemplate = function(component, html, action, anchor, plugin) {
	if (!component || !Echo[component] || !action || !anchor || !html ||
		Echo.isExtended(plugin, [component, "template", anchor, action], html)) return;
	var _template = Echo[component].prototype.template;
	var template = $.isFunction(_template) ? _template : function() { return _template; };
	var classify = {
		"insertBefore": "before",
		"insertAfter": "after",
		"insertAsFirstChild": "prepend",
		"insertAsLastChild": "append",
		"replace": "replaceWith"
	};
	Echo[component].prototype.template = function() {
		var config = plugin && this.config.get("plugins." + plugin);
		if (!config || !config.enabled) {
			return template.call(this);
		}
		var dom = $('<div/>').html(template.call(this));
		$('.' + anchor, dom)[classify[action]](html);
		return dom.html();
	};
};

Echo.include = function(scripts, callback) {
	if (!scripts.length) return callback();
	var script = scripts.pop();
	Echo.include(scripts, function() {
		if (typeof script.loaded == "undefined") {
			if (script.application) {
				script.loaded = function() {
					return !!Echo[script.application];
				}
			} else {
				callback();
			}
		}
		if ($.isFunction(script.loaded) && !script.loaded()) {
			$.loadScriptContent(script.url, callback);
		} else {
			callback();
		}
	});
};

Echo.createPlugin = function(config) {
	if (!config || !config.name || !config.init || !config.applications) return {};
	var name = config.name;
	var configuration = function() {
		var config = function(key) {
			return "plugins." + name + (key ? "." + key : "");
		};
		config.get = function(component, key, defaults, askParent) {
			return component.config.get(
				config(key),
				askParent ? component.config.get(key, defaults) : defaults
			);
		};
		config.set = function(component, key, value) {
			component.config.set(config(key), value);
		};
		config.remove = function(component, key) {
			component.config.remove(config(key));
		};
		return config;
	};
	var init = config.init || function() {};
	Echo.Plugins[name] = Echo.Plugins[name] || $.extend(config, {
		"init": function(plugin, application) {
			var enabled = plugin.config.get(application, "enabled");
			if (typeof enabled == "undefined") {
				plugin.config.set(application, "enabled", true);
			}
			init(plugin, application);
		},
		"set": function(component, key, value) {
			component.vars[name] = component.vars[name] || {};
			$.setNestedValue(component.vars[name], key, value);
		},
		"get": function(component, key) {
			var data = component.vars[name] || {};
			if (!key) return data;
			return $.getNestedValue(key, data);
		},
		"addCss": function(text) {
			$.addCss(text, "plugins-" + name);
		},
		"label": function(key, data) {
			return Echo.Localization.label(key, "Plugins." + name, data);
		},
		"addLabels": function(data) {
			Echo.Localization.extend(data, "Plugins." + name);
		},
		"topic": function(prefix, action) {
			var namespace = typeof prefix == "string" ? prefix : prefix.namespace;
			return namespace + ".Plugins." + name + "." + action;
		},
		"config": configuration(),
		"subscribe": function(application, topic, handler) {
			var self = this;
			application.subscribe(topic, function() {
				if (!application.isPluginEnabled(self.name)) return;
				handler.apply(this, arguments);
			});
		},
		"publish": function(application, topic, data) {
			application.publish(topic, data);
		},
		"unsubscribe": function(application, topic, handlerId) {
			application.unsubscribe(topic, handlerId)
		},
		"extendRenderer": function(component, method, renderer) {
			Echo.extendRenderer(component, method, renderer, name);
		},
		"extendTemplate": function(component, html, action, anchor) {
			Echo.extendTemplate(component, html, action, anchor, name);
		},
		"addItemControl": function(application, control) {
			var controls = application.config.get("itemControls." + name, []);
			application.config.set("itemControls." + name, controls.concat(control));
		},
		"assembleConfig": function(component, data) {
			data.user = component.user;
			data.appkey = component.config.get("appkey", "");
			data.plugins = this.config.get(component, "nestedPlugins", []);
			data.contextId = component.config.get("contextId");
			data.apiBaseURL = component.config.get("apiBaseURL");
			return (new Echo.Config(data, this.config.get(component))).getAsHash();
		}
	});
	return Echo.Plugins[name];
};



if (!Echo.Broadcast) Echo.Broadcast = {};

Echo.Broadcast.initContext = function(topic, contextId) {
	contextId = contextId || 'empty';
	Echo.Vars.subscriptions = Echo.Vars.subscriptions || {};
	Echo.Vars.subscriptions[contextId] = Echo.Vars.subscriptions[contextId] || {};
	Echo.Vars.subscriptions[contextId][topic] = Echo.Vars.subscriptions[contextId][topic] || {};
	return contextId;
};

Echo.Broadcast.subscribe = function(topic, handler, contextId) {
	var handlerId = (new Date()).valueOf() + Math.random();
	contextId = Echo.Broadcast.initContext(topic, contextId);
	Echo.Vars.subscriptions[contextId][topic][handlerId] = handler;
	return handlerId;
};

Echo.Broadcast.unsubscribe = function(topic, handlerId, contextId) {
	contextId = Echo.Broadcast.initContext(topic, contextId);
	if (topic && handlerId) {
		delete Echo.Vars.subscriptions[contextId][topic][handlerId];
	} else if (topic) {
		delete Echo.Vars.subscriptions[contextId][topic];
	}
};

Echo.Broadcast.publish = function(topic, data, contextId) {
	contextId = Echo.Broadcast.initContext(topic, contextId);
	if (contextId == '*') {
		$.each(Echo.Vars.subscriptions, function(ctxId) {
			$.each(Echo.Vars.subscriptions[ctxId][topic] || {}, function(handlerId, handler) {
				handler.apply(this, [topic, data]);
			});
		});
	} else {
		if (Echo.Vars.subscriptions[contextId][topic]) {
			$.each(Echo.Vars.subscriptions[contextId][topic], function(handlerId, handler) {
				handler.apply(this, [topic, data]);
			});
		}
		if (contextId != 'empty') Echo.Broadcast.publish(topic, data, 'empty');
	}
};



if (!Echo.Object) Echo.Object = function() {};

Echo.Object.prototype.init = function(data) {
	$.extend(this, data || {});
};

Echo.Object.prototype.template = "";

Echo.Object.prototype.namespace = "";

Echo.Object.prototype.cssPrefix = "echo-";

Echo.Object.prototype.substitute = function(template, data) {
	var self = this;
	template = template.replace(Echo.Vars.regexps.matchLabel, function($0, $1) {
		return self.label($1);
	});
	template = template.replace(Echo.Vars.regexps.matchData, function($0, $1) {
		return $.getNestedValue($1, data, '');
	});
	return template;
};

Echo.Object.prototype.renderers = {};

Echo.Object.prototype.label = function(name, data) {
	var label = Echo.Localization.label(name, this.namespace, data);
	return label != name ? label : Echo.Localization.label(name, "", data);
};

Echo.Object.prototype.render = function(name, element, dom, extra) {
	var self = this;
	if (name) {
		if ($.isFunction(this.renderers[name])) {
			return this.renderers[name].call(this, element, dom, extra);
		}
	} else {
		var template = $.isFunction(this.template) ? this.template() : this.template;
		this.dom = $.toDOM(this.substitute(template, this.data || {}), this.cssPrefix, function() {
			return self.render.apply(self, arguments);
		});
		return this.dom.content;
	}
};

Echo.Object.prototype.rerender = function(name, recursive) {
	var self = this;
	if (!name) {
		if (this.dom) this.dom.content.replaceWith(this.render());
		return;
	}
	if (!this.dom) return;
	if (typeof name != "string") {
		$.map(name, function(element) {
			self.rerender(element, recursive);
		});
		return;
	} else if (!this.dom.get(name)) return;
	if (recursive) {
		var template = $.isFunction(this.template) ? this.template() : this.template;
		var html = this.substitute(template, this.data || {});
		var oldNode = this.dom.get(name);
		var newNode = $('.' + this.cssPrefix + name, $(html));
		newNode = $.toDOM(newNode, this.cssPrefix, function(name, element, dom) {
			self.dom.set(name, element);
			return self.render.apply(self, arguments);
		}).content;
		oldNode.replaceWith(newNode);
	} else {
		var element = this.dom.get(name);
		var node = this.renderers[name].call(this, element, this.dom);
		if (typeof node != "undefined") element.empty().append(node);
	}
};

Echo.Object.prototype.hyperlink = function(data, options) {
	options = options || {};
	if (options.openInNewWindow && !data.target) {
		data.target = '_blank';	
	}
	var caption = data.caption || "";
	delete data.caption;
	if (!options.skipEscaping) {
		data.href = $.htmlize(data.href);
	}
	data.href = data.href || "javascript:void(0)";
	var attributes = $.foldl([], data, function(value, acc, key) {
		acc.push(key + '="' + value + '"');
	});
	return "<a " + attributes.join(" ") + ">" + caption + "</a>";
};

Echo.Object.prototype.newContextId = function() {
	return (new Date()).valueOf() + Math.random();
};

Echo.Object.prototype.getContextId = function() {
	return this.config && this.config.get("contextId");
};

Echo.Object.prototype.subscribe = function(topic, handler) {
	return Echo.Broadcast.subscribe(topic, handler, this.getContextId());
};

Echo.Object.prototype.unsubscribe = function(topic, handlerId) {
	Echo.Broadcast.unsubscribe(topic, handlerId, this.getContextId());
};

Echo.Object.prototype.publish = function(topic, data) {
	Echo.Broadcast.publish(topic, data, this.getContextId());
};

Echo.Object.prototype.clearCache = function() {
	if (this.vars && this.vars.cache) this.vars.cache = {};
};



Echo.Application = function() {
	this.addCss();
};

Echo.Application.prototype = new Echo.Object();

Echo.Application.prototype.initApplication = function(callback) {
	var self = this;
	var appkey = this.config.get("appkey");
	if (!appkey) {
		this.showMessage({
			"type": "error",
			"message": "Incorrect or missing mandatory parameter appkey"
		});
		return;
	}
	this.user = this.config.get("user") || new Echo.User({
		"appkey": appkey,
		"apiBaseURL": this.config.get("apiBaseURL"),
		"contextId": this.config.get("contextId")
	});
	this.user.init(function() {
		self.initPlugins(callback);
	});
};

Echo.Application.prototype.messageTemplates = {
	'compact':
		'<span class="echo-application-message-icon echo-application-message-{Data:type}" title="{Data:message}">' +
		'</span>',
	'default':
		'<div class="echo-application-message">' +
			'<span class="echo-application-message-icon echo-application-message-{Data:type} echo-primaryFont">' +
				'{Data:message}' +
			'</span>' +
		'</div>'
};

Echo.Application.prototype.showMessage = function(data, target) {
	var template = this.messageTemplates[data.layout || this.messageLayout || "default"];
	(target || this.config.get("target")).empty().append(this.substitute(template, data));
};

Echo.Application.prototype.initPlugins = function(callback) {
	var self = this;
	var plugins = this.config.get("pluginsOrder");
	var scripts = $.foldl([], plugins, function(name, acc) {
		var plugin = Echo.Plugins[name];
		if (plugin && plugin.dependencies && plugin.dependencies.length) {
			return acc.concat(plugin.dependencies);
		}
	});
	Echo.include(scripts, function() {
		$.map(plugins, function(name) {
			var plugin = Echo.Plugins[name];
			if (plugin && plugin.init && self.isPluginApplicable(plugin)) {
				plugin.init(plugin, self);
			}
		});
		if (callback) callback();
	});
};

Echo.Application.prototype.enablePlugin = function(name) {
	this.config.set("plugins." + name + ".enabled", true);
};

Echo.Application.prototype.disablePlugin = function(name) {
	this.config.set("plugins." + name + ".enabled", false);
};

Echo.Application.prototype.isPluginEnabled = function(name) {
	return this.config.get("plugins." + name + ".enabled", true);
};

Echo.Application.prototype.isPluginApplicable = function(plugin) {
	var self = this, applicable = false;
	$.each(plugin.applications, function(i, application) {
		if (Echo[application] && self instanceof Echo[application]) {
			applicable = true;
			return false; // break
		}
	});
	return applicable;
};

Echo.Application.prototype.initConfig = function(data, defaults, normalizer) {
	var _normalizer = {};
	_normalizer.target = function(el) { return $(el); };
	_normalizer.plugins = function(list) {
		var data = $.foldl({"hash": {}, "order": []}, list || [],
			function(plugin, acc) {
				var pos = $.inArray(plugin.name, acc.order);
				if (pos >= 0) {
					acc.order.splice(pos, 1);
				}
				acc.order.push(plugin.name);
				acc.hash[plugin.name] = plugin;
			});
		this.set("pluginsOrder", data.order);
		return data.hash;
	};
	data = $.extend({
		"plugins": []
	}, data || {});
	defaults = $.extend({
		"appkey": "",
		"apiBaseURL": "http://api.echoenabled.com",
		"liveUpdates": true,
		"liveUpdatesTimeout": 10,
		"contextId": this.newContextId()
	}, defaults || {});
	this.config = new Echo.Config(data, defaults, function(key, value) {
		var handler = normalizer && normalizer[key] || _normalizer && _normalizer[key];
		return handler ? handler.call(this, value) : value;
	});
};

Echo.Application.prototype.sendAPIRequest = function(data, callback) {
	data.query.appkey = this.config.get("appkey");
	$.get(this.config.get("apiBaseURL") + "/v1/" + data.endpoint,
		data.query, callback, "jsonp");
};

Echo.Application.prototype.initLiveUpdates = function(requestParamsGetter, responseHandler) {
	var self = this;
	this.liveUpdates = {
		"originalTimeout": this.config.get("liveUpdatesTimeout"),
		"timers": {},
		"timeouts": [],
		"responseHandler": function(data) {
			if (self.liveUpdates.timers.watchdog) {
				clearTimeout(self.liveUpdates.timers.watchdog);
			}
			self.changeLiveUpdatesTimeout(data.liveUpdatesTimeout);
			responseHandler(data);
		},
		"requestParamsGetter": requestParamsGetter
	};
};

Echo.Application.prototype.changeLiveUpdatesTimeout = function(timeout) {
	timeout = parseInt(timeout);
	if (!timeout && this.liveUpdates.originalTimeout != this.config.get("liveUpdatesTimeout")) {
		this.config.set("liveUpdatesTimeout", this.liveUpdates.originalTimeout);
	} else if (timeout && timeout > this.config.get("liveUpdatesTimeout")) {
		this.config.set("liveUpdatesTimeout", timeout);
	}
};

Echo.Application.prototype.stopLiveUpdates = function() {
	if (this.liveUpdates.timers.regular) {
		clearTimeout(this.liveUpdates.timers.regular);
	}
	if (this.liveUpdates.timers.watchdog) {
		clearTimeout(this.liveUpdates.timers.watchdog);
	}
};

Echo.Application.prototype.startLiveUpdates = function(force) {
	var self = this;
	if (!force && !this.config.get("liveUpdates") && !this.liveUpdates.timeouts.length) return;
	this.stopLiveUpdates();
	if (force) {
		// if live updates requests were forced after some operation, we will
		// perform 3 attempts to get live updates: immediately, in 1 second
		// and in 3 seconds after first one
		this.liveUpdates.timeouts = [0, 1, 3];
	}
	var timeout = this.liveUpdates.timeouts.length
		? this.liveUpdates.timeouts.shift()
		: this.config.get("liveUpdatesTimeout");
	this.liveUpdates.timers.regular = setTimeout(function() {
		// if no response in the reasonable time just restart live updates
		self.liveUpdates.timers.watchdog = setTimeout(function() {
			self.startLiveUpdates();
		}, 5000);
		self.sendAPIRequest(
			self.liveUpdates.requestParamsGetter(),
			self.liveUpdates.responseHandler);
	}, timeout * 1000);
};

Echo.Application.prototype.addCss = function() {
	var id = 'echo-css-fancybox';
	if ($('#' + id).length) return;
	var container = document.getElementsByTagName("head")[0] || document.documentElement;
	$(container).prepend('<link rel="stylesheet" id="' + id + '" type="text/css" href="//c0.echoenabled.com/css/fancybox.css">');
	$.addCss(
		'.echo-application-message { padding: 15px 0px; text-align: center; -moz-border-radius: 0.5em; -webkit-border-radius: 0.5em; border: 1px solid #E4E4E4; }' +
		'.echo-application-message-icon { display: inline-block; height: 16px; padding-left: 16px; background: no-repeat left center; }' +
		'.echo-application-message .echo-application-message-icon { padding-left: 21px; height: auto; }' +
		'.echo-application-message-empty { background-image: url(//c0.echoenabled.com/images/information.png); }' +
		'.echo-application-message-loading { background-image: url(//c0.echoenabled.com/images/loading.gif); }' +
		'.echo-application-message-error { background-image: url(//c0.echoenabled.com/images/warning.gif); }'
	, 'application');
};



Echo.User = function(config) {
	this.data = {};
	this.config = new Echo.Config(config, {
		"appkey": "",
		"apiBaseURL": "http://api.echoenabled.com",
		"contextId": undefined
	});
};

Echo.User.prototype.init = function(callback) {
	var self = this;
	this.callback = callback || function() {};
	if (!this.config.get("appkey") || !window.Backplane || !Backplane.getChannelID()) {
		this.set({});
		this.callback();
		return;
	}
	this.listenEvents();
	var state = this._global("get", "state");
	if (state == "ready") {
		this.set($.extend({}, this._global("get", "data")));
		this.callback();
	} else {
		var handlerId = Echo.Broadcast.subscribe("User.onInit", function(topic, data) {
			if (data.appkey != self.config.get("appkey")) return;
			Echo.Broadcast.unsubscribe("User.onInit", handlerId);
			self.set($.extend({}, self._global("get", "data")));
			self.callback();
		});
		if (state == "init") {
			this.request();
		}
	}
}

Echo.User.prototype.listenEvents = function() {
	var self = this;
	if (this.backplaneSubscriptionID) return;
	var publish = function(global) {
		var topic = (global ? "" : "internal.") + "User.onInvalidate";
		var data = {
			"data": self.data,
			"appkey": self.config.get("appkey")
		};
		var contextId = global ? undefined : self.config.get("contextId");
		Echo.Broadcast.publish(topic, data, contextId);
	};
	this.backplaneSubscriptionID = Backplane.subscribe(function(message) {
		if (message.type == "identity/ack") {
			var global = false;
			if (self._global("get", "state") == "ready") {
				global = true;
				self._global("set", "state", "init");
			};
			self.init(function() {
				publish();
				if (global) publish(true);
			});
		}
	});
};

Echo.User.prototype._global = function(action, key, value) {
	var appkey = this.config.get("appkey");
	Echo.Vars.users = Echo.Vars.users || {};
	Echo.Vars.users[appkey] = Echo.Vars.users[appkey] || {"state": "init", "data": {}};
	if (action == "get") {
		return Echo.Vars.users[appkey][key];
	}
	Echo.Vars.users[appkey][key] = value;
};

Echo.User.prototype.set = function(data) {
	this._global("set", "data", data);
	this.data = this.normalize(data);
	this.account = this.assemble();
};

Echo.User.prototype.get = function(key, defaults) {
	return (this.account.hasOwnProperty(key) && typeof this.account[key] != "undefined")
		? this.account[key]
		: defaults;
};

Echo.User.prototype.logout = function(callback) {
	var self = this;
	$.get("http://echoenabled.com/apps/logout", {
		"sessionID": Backplane.getChannelID()
	}, function(data) {
		Backplane.expectMessages("identity/ack");
	}, "jsonp");
};

Echo.User.prototype.request = function(callback) {
	var self = this, appkey = this.config.get("appkey");
	this._global("set", "state", "waiting");
	$.get(this.config.get("apiBaseURL") + "/v1/users/whoami", {
		"appkey": appkey,
		"sessionID": Backplane.getChannelID()
	}, function(data) {
		if (data.result && data.result == "session_not_found") {
			data = {};
		}
		self._global("set", "state", "ready");
		self.set($.extend({}, data));
		Echo.Broadcast.publish("User.onInit", {"data": data, "appkey": appkey});
		if (callback) callback();
	}, "jsonp");
};

Echo.User.prototype.normalize = function(data) {
	var array2object = function(list) {
		return $.foldl({}, list || [], function(key, acc) { acc[key] = true; });
	};
	data = data || {};
	data.echo = data.echo || {};
	$.extend(data, data.echo);
	data.poco = data.poco || {"entry": {}};
	data.roles = array2object(data.echo.roles);
	data.markers = array2object(data.echo.markers);
	data.sessionID = window.Backplane && Backplane.getChannelID() || undefined;
	data.accounts = data.poco.entry.accounts || [];
	return data;
};

Echo.User.prototype.getActiveAccounts = function() {
	return $.map(this.data.accounts, function(entry) {
		if (entry.loggedIn) return entry;
	});
};

Echo.User.prototype.assemble = function() {
	var accounts = this.getActiveAccounts();
	var account = accounts[0] || {};
	return $.extend(this.data, {
		"id": account.identityUrl || this.data.poco.entry.id || account.userid,
		"name": this.data.poco.entry.displayName || account.username,
		"avatar": $.foldl(undefined, account.photos || [], function(img) {
			if (img.type == "avatar") return img.value;
		}),
		"state": this.data.echo.state || "Untouched",
		"domain": account.domain,
		"logged": !!account.loggedIn,
		"defaultAvatar": "//c0.echoenabled.com/images/avatar-default.png",
		"fakeIdentityURL": "http://api.echoenabled.com/ECHO/user/fake_user"
	});
};

Echo.User.prototype.hasIdentity = function(id) {
	var hasIdentity = false;
	$.each(this.data.accounts, function(i, account) {
		if (account.identityUrl && account.identityUrl == id) {
			hasIdentity = true;
			return false; // break
		}
	});
	return hasIdentity;
};

Echo.User.prototype.hasAny = function(field, values) {
	if (!this.account) return false;
	var self = this, satisfies = false;
	$.each(values, function(i, value) {
		var data = self.get(field, {});
		if ((typeof data == "string" && data == value) || data[value]) {
			satisfies = true;
			return false; // break
		}
	});
	return satisfies;
};

Echo.User.prototype.hasAnyRole = function(roles) {
	return this.hasAny("roles", roles);
};

Echo.User.prototype.isAdmin = function() {
	return this.hasAny("roles", ["administrator", "moderator"]);
};

Echo.User.prototype.logged = function() {
	return !!(this.account && this.account.logged);
};



Echo.Config = function(master, slave, normalizer) {
	var self = this;
	this.normalize = normalizer || function(key, value) { return value; };
	this.data = {};
	this.cache = {};
	if (!slave && !normalizer) {
		this.data = master;
	} else {
		$.each(this.combine(master, $.extend({}, slave)), function(key, value) {
			self.set(key, value);
		});
	}
};

Echo.Config.prototype.get = function(key, defaults) {
	var k = key;
	if (typeof k != "string") {
		k = k.join(".");
	}
	if (typeof this.cache[k] == "undefined") {
		this.cache[k] = $.getNestedValue(key, this.data, defaults);
	}
	return this.cache[k];
};

Echo.Config.prototype.set = function(key, value) {
	var keys = key.split(/\./);
	delete this.cache[key];
	if (typeof value == "object") {
		this.clearCacheByPrefix(key);
	}
	return $.setNestedValue(this.data, key, this.normalize(keys.pop(), value));
};

Echo.Config.prototype.remove = function(key) {
	var keys = key.split(/\./);
	var field = keys.pop();
	var data = $.getNestedValue(keys, this.data);
	delete data[field];
};

Echo.Config.prototype.combine = function(master, slave) {
	var self = this;
	return $.foldl(slave, master, function(value, acc, key) {
		acc[key] = $.isPlainObject(value) && slave.hasOwnProperty(key)
			? self.combine(value, slave[key])
			: value;
	});
};

Echo.Config.prototype.extend = function(extra) {
	var self = this;
	$.each(extra, function(key, value) {
		self.set(key, value);
	});
};

Echo.Config.prototype.getAsHash = function() {
	return this.data;
};

Echo.Config.prototype.clearCacheByPrefix = function(prefix) {
	var self = this;
	prefix += ".";
	$.each(this.cache, function(key, data) {
		// key starts with prefix
		if (!key.indexOf(prefix)) {
			delete self.cache[key];
		}
	});
};



if (!Echo.UI) Echo.UI = {
	cornersCss: function(radius, scopeClass) {
		return '{scope}.ui-corner-tl { -moz-border-radius-topleft: {radius}; -webkit-border-top-left-radius: {radius}; border-top-left-radius: {radius}; }' +
		'{scope}.ui-corner-tr { -moz-border-radius-topright: {radius}; -webkit-border-top-right-radius: {radius}; border-top-right-radius: {radius}; }' +
		'{scope}.ui-corner-bl { -moz-border-radius-bottomleft: {radius}; -webkit-border-bottom-left-radius: {radius}; border-bottom-left-radius: {radius}; }' +
		'{scope}.ui-corner-br { -moz-border-radius-bottomright: {radius}; -webkit-border-bottom-right-radius: {radius}-bottom-right-radius: {radius}; }' +
		'{scope}.ui-corner-top { -moz-border-radius-topleft: {radius}; -webkit-border-top-left-radius: {radius}; border-top-left-radius: {radius}; -moz-border-radius-topright: {radius}; -webkit-border-top-right-radius: {radius}; border-top-right-radius: {radius}; }' +
		'{scope}.ui-corner-bottom { -moz-border-radius-bottomleft: {radius}; -webkit-border-bottom-left-radius: {radius}; border-bottom-left-radius: {radius}; -moz-border-radius-bottomright: {radius}; -webkit-border-bottom-right-radius: {radius}; border-bottom-right-radius: {radius}; }' +
		'{scope}.ui-corner-right {  -moz-border-radius-topright: {radius}; -webkit-border-top-right-radius: {radius}; border-top-right-radius: {radius}; -moz-border-radius-bottomright: {radius}; -webkit-border-bottom-right-radius: {radius}; border-bottom-right-radius: {radius}; }' +
		'{scope}.ui-corner-left { -moz-border-radius-topleft: {radius}; -webkit-border-top-left-radius: {radius}; border-top-left-radius: {radius}; -moz-border-radius-bottomleft: {radius}; -webkit-border-bottom-left-radius: {radius}; border-bottom-left-radius: {radius}; }' +
		'{scope}.ui-corner-all { -moz-border-radius: {radius}; -webkit-border-radius: {radius}; border-radius: {radius}; }'.replace(/{scope}/g, scopeClass || "").replace(/{radius}/g, radius);
	}
};

(function() {
	$.addCss(
		'.echo-ui .ui-helper-hidden { display: none; }' +
		'.echo-ui .ui-helper-hidden-accessible { position: absolute; left: -99999999px; }' +
		'.echo-ui .ui-helper-reset { margin: 0; padding: 0; border: 0; outline: 0; line-height: 1.3; text-decoration: none; font-size: 100%; list-style: none; }' +
		'.echo-ui .ui-helper-clearfix:after { content: "."; display: block; height: 0; clear: both; visibility: hidden; }' +
		'.echo-ui .ui-helper-clearfix { display: inline-block; }' +
		'/* required comment for clearfix to work in Opera \\*/' +
		'* html .echo-ui .ui-helper-clearfix { height:1%; }' +
		'.echo-ui .ui-helper-clearfix { display:block; }' +
		'/* end clearfix */' +
		'.echo-ui .ui-helper-zfix { width: 100%; height: 100%; top: 0; left: 0; position: absolute; opacity: 0; filter:Alpha(Opacity=0); }' +
		'.echo-ui .ui-resizable-handle { position: absolute;font-size: 0.1px;z-index: 99999; display: block;}' +
		'.echo-ui .ui-resizable-disabled .ui-resizable-handle, .ui-resizable-autohide .ui-resizable-handle { display: none; }' +
		'.echo-ui .ui-resizable-n { cursor: n-resize; height: 7px; width: 100%; top: -5px; left: 0; }' +
		'.echo-ui .ui-resizable-s { cursor: s-resize; height: 7px; width: 100%; bottom: -5px; left: 0; }' +
		'.echo-ui .ui-resizable-e { cursor: e-resize; width: 7px; right: -5px; top: 0; height: 100%; }' +
		'.echo-ui .ui-resizable-w { cursor: w-resize; width: 7px; left: -5px; top: 0; height: 100%; }' +
		'.echo-ui .ui-resizable-se { cursor: se-resize; width: 12px; height: 12px; right: 1px; bottom: 1px; }' +
		'.echo-ui .ui-resizable-sw { cursor: sw-resize; width: 9px; height: 9px; left: -5px; bottom: -5px; }' +
		'.echo-ui .ui-resizable-nw { cursor: nw-resize; width: 9px; height: 9px; left: -5px; top: -5px; }' +
		'.echo-ui .ui-resizable-ne { cursor: ne-resize; width: 9px; height: 9px; right: -5px; top: -5px;}' +
		'.echo-ui .ui-state-disabled { cursor: default !important; }' +
		'.echo-ui .ui-icon { display: block; text-indent: -99999px; overflow: hidden; background-repeat: no-repeat; width: 16px; height: 16px; }' +
		'.echo-ui .ui-widget-header { font-weight: bold; border: 0px; }' +
		'.echo-ui, .echo-ui .ui-widget :active { outline: none; }' +
		'.echo-ui .ui-state-default { border: 1px solid #d3d3d3; background: #e6e6e6; color: #555555; }' +
		'.echo-ui .ui-state-default a, .echo-ui .ui-state-default a:link, .echo-ui .ui-state-default a:visited { color: #555555; text-decoration: none; }' +
		'.echo-ui .ui-state-hover, .echo-ui .ui-state-focus { border: 1px solid #999999; background: #dfebf2; color: #212121; }' +
		'.echo-ui .ui-state-hover a, .echo-ui .ui-state-hover a:hover { color: #212121; text-decoration: none; }' +
		'.echo-ui .ui-state-active { border: 1px solid #aaaaaa; background: #dfebf2; color: #212121; }' +
		'.echo-ui .ui-state-active a, .echo-ui .ui-state-active a:link, .echo-ui .ui-state-active a:visited { color: #212121; text-decoration: none; }' +

		'.echo-primaryBackgroundColor {  }' +
		'.echo-secondaryBackgroundColor { background-color: #F4F4F4; }' +
		'.echo-trinaryBackgroundColor { background-color: #ECEFF5; }' +
		'.echo-primaryColor { color: #3A3A3A; }' +
		'.echo-secondaryColor { color: #C6C6C6; }' +
		'.echo-primaryFont { font-family: Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 16px; }' +
		'.echo-secondaryFont { font-family: Arial, sans-serif; font-size: 11px; }' +
		'.echo-linkColor { color: #476CB8; }' +
		'.echo-clickable { cursor: pointer; }' +
		'.echo-relative { position: relative; }' +
		'.echo-clear { clear: both; }'
	, 'ui-general');
})();



Echo.UI.Dialog = function(data) {
	data.config = data.config || {};
	this.init(data);
	this.config.dialogClass = 'echo-ui echo-dialog ' + (this.config.dialogClass || '');
	this.addCss();
	this.contentElement = this.render().dialog(this.config).addClass('ui-corner-all');
	if (this.content) {
		if ($.isFunction(this.content)) {
			this.content(this.contentElement);
		} else {
			this.contentElement.append(this.content);
		}
	}
	this.widget = this.contentElement.dialog('widget');
	if (this.hasTabs) {
		// move tabs line to dialog header to prevent tabs scrolling
		$('.ui-dialog-titlebar', this.widget).after($('.echo-tabs-header', this.widget));
	}
};

Echo.UI.Dialog.prototype = new Echo.Object();

Echo.UI.Dialog.prototype.cssPrefix = "echo-dialog-";

Echo.UI.Dialog.prototype.template = "<div></div>";

Echo.UI.Dialog.prototype.open = function() {
	// hide contentElement for jquery to calculate dialog height correctly in IE
	this.contentElement.hide();
	this.contentElement.dialog('open');
	this.contentElement.show();
};

Echo.UI.Dialog.prototype.close = function() {
	this.contentElement.dialog('close');
};

Echo.UI.Dialog.prototype.addCss = function() {
	if ($.browser.msie) {
		$.addCss('.echo-dialog .ui-dialog-content { zoom: 1; }' , 'ui-dialog-ie');
	}
	$.addCss(
		'.echo-dialog { position: absolute; padding: 0px 7px 20px 7px; width: 300px; border: 1px solid #aaaaaa; background: #dfebf2; -moz-border-radius: 7px; -webkit-border-radius: 7px; border-radius: 7px;' + (!$.browser.msie ? ' overflow: hidden;' : '') + ' }' +
		'.echo-dialog .ui-dialog-titlebar { background: #dfebf2; cursor: move; padding: 7px 0px 10px 5px; position: relative; color: #4a4a4a; font: 18px Helvetica,sans-serif; }' +
		'.echo-dialog .ui-dialog-titlebar .ui-state-default, .echo-dialog .ui-dialog-titlebar .ui-state-active, .echo-dialog .ui-dialog-titlebar .ui-state-hover, .echo-dialog .ui-dialog-titlebar .ui-state-focus { border: 0px; background: none; }' +
		'.echo-dialog .ui-dialog-title { float: left; margin: .1em 16px .2em 0; } ' +
		'.echo-dialog .ui-dialog-titlebar-close { position: absolute; right: 0px; top: 50%; width: 19px; margin: -10px 0 0 0; padding: 0px; height: 18px; }' +
		'.echo-dialog .ui-dialog-titlebar-close span { display: block; margin: 1px; }' +
		'.echo-dialog .ui-dialog-titlebar-close:hover, .ui-dialog .ui-dialog-titlebar-close:focus { padding: 0px; }' +
		'.echo-dialog .ui-dialog-content { border: 0; padding: 0px; margin: 0px; background: #ffffff; overflow: auto; }' +
		'.echo-dialog .ui-resizable-se { width: 14px; height: 14px; right: 3px; bottom: 3px; }' +
		'.echo-dialog .ui-icon-closethick { background: no-repeat top right url(//c0.echoenabled.com/images/container/closeWindow.png); }' +
		'.echo-dialog .ui-icon-grip-diagonal-se { background: no-repeat bottom right url(//c0.echoenabled.com/images/container/resizeHandle.png); }' +
		Echo.UI.cornersCss('7px', '.echo-dialog ')
	, 'ui-dialog');
};



Echo.UI.Tabs = function(data) {
	var self = this;
	data.config = data.config || {};
	this.init(data);
	if (!this.tabs) return;
	var classPrefix = this.idPrefix;
	// add random part to get unique id
	this.idPrefix = this.idPrefix + Math.ceil(Math.random() * 999999999) + '-';
	this.addCss();
	var disabledTabs = $.foldl([], this.tabs, function(tab, acc, i) {
		tab.classPrefix = classPrefix;
		tab.idPrefix = self.idPrefix;
		if (tab.icon) {
			tab.label = '<span>' + tab.label + '</span>';
		}
		if (tab.disabled) {
			acc.push(i);
		}
	});
	this.target.append(this.render());
	this.tabIndexById = {};
	$.each(this.tabs, function(i, tab) {
		self.tabIndexById[tab.id] = i;
		if (tab.content) {
			var tgt = $('#' + tab.idPrefix + tab.id);
			if ($.isFunction(tab.content)) {
				tab.content(tgt);
			} else {
				tgt.append(tab.content);
			}
		}
	});
	// if tabs will be placed into another UI element (dialog, another tabs) better not to add another echo-ui class
	if (this.addUIClass !== false) {
		this.target.addClass('echo-ui');
	}
	$.extend(this.config, {
		"disabled": disabledTabs.concat(self.config.disabled || []),
		"select": function(event, ui) {
			self.content[ui.index ? 'addClass' : 'removeClass']('ui-corner-tl');
		}
	});
	this.headerElement = $('.echo-tabs-header', this.target).tabs(this.config);
	this.panelsElement = $('.echo-tabs-panels', this.target).tabs(this.config);
	$('.echo-tabs-header, .echo-tabs-header .ui-tabs-nav', this.target).removeClass('ui-corner-all');
	this.content = $(this.content || '.echo-tabs-panels', this.target);
	// top right corner of content panel should not be rounded while first tab is selected
	this.content.removeClass('ui-corner-all').addClass('ui-corner-tr ui-corner-bottom');
};

Echo.UI.Tabs.prototype = new Echo.Object();

Echo.UI.Tabs.prototype.cssPrefix = "echo-tabs-";

Echo.UI.Tabs.prototype.template = function() {
	var self = this;
	return '<div class="echo-tabs">' +
		'<div class="echo-tabs echo-tabs-header">' +
			'<ul>' +
				$.map(this.tabs, function(tab) {
					return self.substitute('<li><a class="echo-{Data:classPrefix}{Data:id}" href="#{Data:idPrefix}{Data:id}">{Data:label}</a></li>', tab);
				}).join("\n") +
			'</ul>' +
		'</div>' +
		'<div class="echo-tabs echo-tabs-panels"></div>' +
	'</div>';
};

Echo.UI.Tabs.prototype.renderers = {};

Echo.UI.Tabs.prototype.renderers.panels = function(element) {
	var self = this;
	$.each(this.tabs, function(i, tab) {
		var node = $.toDOM(self.substitute('<div id="{Data:idPrefix}{Data:id}" class="{Data:idPrefix}{Data:id}"></div>', tab));
		element.append(node.content);
	});
};

Echo.UI.Tabs.prototype.select = function(id) {
	this.headerElement.tabs('select', this.tabIndexById[id]);
}

Echo.UI.Tabs.prototype.addCss = function() {
	if ($.browser.msie) {
		$.addCss('.echo-ui .ui-tabs { zoom:  1; }', 'ui-tabs-ie');
	}
	$.addCss(
		'.echo-ui .ui-tabs { position: relative; padding: 0px; border: 0px; }' +
		'.echo-tabs .echo-tabs-panels { background: #ffffff; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav { margin: 0; padding: 0px; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li { list-style: none; float: left; position: relative; top: 1px; margin: 0 .2em 1px 0; border-bottom: 0 !important; padding: 0; white-space: nowrap; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li a { float: left; padding: .3em .7em; text-decoration: none; font-size: 12px; font-family: Helvetica,sans-serif; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li.ui-tabs-selected { margin-bottom: 0; padding-bottom: 1px; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li.ui-tabs-selected a, .echo-ui .ui-tabs .ui-tabs-nav li.ui-state-disabled a, .echo-ui .ui-tabs .ui-tabs-nav li.ui-state-processing a { cursor: text; color: #4a4a4a; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li a, .echo-ui .ui-tabs.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; color: #393939; }' +
		'.echo-ui .ui-tabs .ui-tabs-panel { display: block; border-width: 0; padding: 1em 1.4em; background: none; }' +
		'.echo-ui .ui-tabs .ui-tabs-hide { display: none !important; }' +
		'.echo-ui .echo-tabs-header .ui-state-hover, .echo-ui .echo-tabs-header .ui-state-focus { border: 0px; background: none; color: #212121; }' +
		'.echo-ui .echo-tabs-header .ui-state-default { border: 0px; background: none; font-weight: normal; }' +
		'.echo-ui .echo-tabs-header .ui-state-active { border: 0px; background: #ffffff; font-weight: bold; }' +
		'.echo-ui .ui-tabs .ui-tabs-nav li a span { display: inline-block; padding-left: 22px; }' +
		($.browser.opera ? '.echo-ui .ui-tabs-nav { height: 25px; overflow: hidden; }' : '') +
		Echo.UI.cornersCss('7px', '.echo-tabs ')
	, 'ui-tabs');
};



if (!Echo.Localization) Echo.Localization = { labels: {} };

Echo.Localization.key = function(name, namespace) {
	return (namespace ? namespace + "." : "") + name;
};

Echo.Localization.extend = function(labels, namespace) {
	$.each(labels, function(name, value) {
		Echo.Localization.labels[Echo.Localization.key(name, namespace)] = value;
	});
};

Echo.Localization.label = function(name, namespace, data) {
	var label = Echo.Localization.labels[Echo.Localization.key(name, namespace)] || name;
	$.each(data || {}, function(key, value) {
		label = label.replace(new RegExp("{" + key + "}", "g"), value);
	});
	return label;
};


Echo.Localization.extend({
	"defaultModeSwitchTitle": "Switch to metadata view",
	"guest": "Guest",
	"today": "Today",
	"yesterday": "Yesterday",
	"lastWeek": "Last Week",
	"lastMonth": "Last Month",
	"secondAgo": "Second Ago",
	"secondsAgo": "Seconds Ago",
	"minuteAgo": "Minute Ago",
	"minutesAgo": "Minutes Ago",
	"hourAgo": "Hour Ago",
	"hoursAgo": "Hours Ago",
	"dayAgo": "Day Ago",
	"daysAgo": "Days Ago",
	"weekAgo": "Week Ago",
	"weeksAgo": "Weeks Ago",
	"metadataModeSwitchTitle": "Return to default view",
	"monthAgo": "Month Ago",
	"monthsAgo": "Months Ago",
	"sharedThisOn": "I shared this on {service}...",
	"userID": "User ID:",
	"fromLabel": "from",
	"viaLabel": "via"
}, "Item");

Echo.Item = function(data) {
	this.vars = {};
	this.blocked = false;
	this.controlsOrder = [];
	this.controls = {}; 
	this.init(data);
	this.calcAge();
};

Echo.Item.prototype = new Echo.Object();

Echo.Item.prototype.cssPrefix = "echo-item-";

Echo.Item.prototype.namespace = "Item";

Echo.Item.prototype.template =
'<div class="echo-item-content">' +
	'<div class="echo-item-container">' +
		'<div class="echo-item-wrapper">' +
			'<div class="echo-item-subwrapper">' +
				'<div class="echo-item-subcontainer">' +
					'<div class="echo-item-frame">' +
						'<div class="echo-item-modeSwitch echo-clickable"></div>' +
						'<div class="echo-item-authorName echo-linkColor"></div>' +
						'<div class="echo-clear"></div>' +
						'<div class="echo-item-data">' +
							'<div class="echo-item-re"></div>' +
							'<div class="echo-item-body echo-primaryColor"></div>' +
							'<div class="echo-item-markers echo-secondaryFont echo-secondaryColor"></div>' +
							'<div class="echo-item-tags echo-secondaryFont echo-secondaryColor"></div>' +
						'</div>' +
						'<div class="echo-item-metadata">' +
							'<div class="echo-item-metadata-userID">' +
								'<span class="echo-item-metadata-title echo-item-metadata-icon echo-item-metadata-userID">' +
									'{Label:userID}' +
								'</span>' +
								'<span class="echo-item-metadata-value">{Data:actor.id}</span>' +
							'</div>' +
						'</div>' +
						'<div class="echo-item-footer echo-secondaryColor echo-secondaryFont">' +
							'<div class="echo-item-sourceIcon echo-clickable"></div>' +
							'<div class="echo-item-date"></div>' +
							'<div class="echo-item-from"></div>' +
							'<div class="echo-item-via"></div>' +
							'<div class="echo-item-controls"></div>' +
							'<div class="echo-clear"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="echo-clear"></div>' +
			'</div>' +
		'</div>' +
		'<div class="echo-clear"></div>' +
		'<div class="echo-item-childrenMarker"></div>' +
	'</div>' +
	'<div class="echo-item-children"></div>' +
'</div>';

Echo.Item.prototype.renderers = {};

Echo.Item.prototype.renderers.authorName = function(element) {
	return this.data.actor.title || this.label("guest");
};

Echo.Item.prototype.renderers.markers = function(element, dom) {
	this.render("extraField", element, dom, {"type": "markers"});
};

Echo.Item.prototype.renderers.tags = function(element, dom) {
	this.render("extraField", element, dom, {"type": "tags"});
};

Echo.Item.prototype.renderers.extraField = function(element, dom, extra) {
	var self = this;
	var type = (extra || {}).type;
	if (!this.data.object[type] || !this.user.isAdmin()) {
		dom.remove(element);
		return;
	}
	var limit = this.config.get("limits." + type);
	var items = $.foldl([], this.data.object[type], function(item, acc){
		var template = (item.length > limit)
			? "<span title={Data:item}>{Data:truncatedItem}</span>"
			: "<span>{Data:item}</span>";
		var truncatedItem = $.htmlTextTruncate(item, limit, "...");
		acc.push(self.substitute(template, {"item": item, "truncatedItem": truncatedItem}));
	});
	element.prepend(items.sort().join(", "));
};

Echo.Item.prototype.renderers.container = function(element, dom) {
	var self = this;
	element.removeClass($.map(["child", "root", "child-thread", "root-thread"],
		function(suffix) { return "echo-item-container-" + suffix; }).join(" "));
	var threadSuffix = this.threading ? '-thread' : '';
	if (this.depth) {
		element.addClass('echo-item-container-child' + threadSuffix);
		element.addClass('echo-trinaryBackgroundColor');
	} else {
		element.addClass('echo-item-container-root' + threadSuffix);
	}
	element.addClass('echo-item-depth-' + this.depth);
	var switchClasses = function(action) {
		$.map(self.controlsOrder, function(name) {
			if (!self.controls[name].element) return;
			self.controls[name].clickableElements[action + "Class"]("echo-linkColor");
		});
	};
	element.unbind("mouseleave").unbind("mouseenter").bind({
		"mouseleave": function() {
			if (self.user.isAdmin()) dom.get("modeSwitch").hide();
			switchClasses("remove");
		},
		"mouseenter": function() {
			if (self.user.isAdmin()) dom.get("modeSwitch").show();
			switchClasses("add");
		}
	});
};

Echo.Item.prototype.renderers.modeSwitch = function(element) {
	var self = this;
	if (!this.user.isAdmin()) return;
	var mode = "default";
	var setTitle = function(el) {
		el.attr("title", self.label(mode + "ModeSwitchTitle"));
	};
	setTitle(element);
	element.click(function() {
		mode = (mode == "default" ? "metadata" : "default");
		setTitle(element);
		self.dom.get("data").toggle();
		self.dom.get("metadata").toggle();
	});
};

Echo.Item.prototype.renderers.wrapper = function(element) {
	element.addClass('echo-item-wrapper' + (this.depth ? '-child' : '-root'));
};

Echo.Item.prototype.renderers.avatar = function() {
	var self = this;
	var size = (!this.depth ? 48 : 24);
	var url = this.data.actor.avatar || this.user.get("defaultAvatar");
	return $("<img>", { "src": url, "width": size, "height": size }).bind({
			"error" : function(){
				$(this).attr("src", self.user.get("defaultAvatar"));
			}
		})
};

Echo.Item.prototype.renderers.children = function(element, dom) {
	var self = this;
	// we cannot use element.empty() because it will remove children's event handlers
	$.each(element.children(), function(i, child) {
		$(child).detach();
	});
	$.map(this.children, function(child) {
		var initialRendering = !child.dom;
		element.append(initialRendering ? child.render() : child.dom.content);
		if (child.deleted) {
			self.publish("internal.Item.onDelete", {"item": child});
		} else if (child.added) {
			self.publish("internal.Item.onAdd", {"item": child});
		// don't publish events while rerendering or for Whirlpools
		} else if (initialRendering && child instanceof Echo.Item) {
			self.publish("internal.Item.onRender", {"item": child});
		}
	});
};

Echo.Item.prototype.renderers.control = function(element, dom, extra) {
	if (!extra || !extra.name) return;
	var template = extra.template ||
		'<a class="echo-item-control echo-item-control-{Data:name}">{Data:label}</a>';
	var data = {
		"label": extra.label || "",
		"name": extra.name
	};
	var control = $(this.substitute(template, data));
	var clickables = $('.echo-clickable', control);
	if (!clickables.length) {
		clickables = control;
		control.addClass('echo-clickable');
	}
	clickables[extra.onetime ? "one" : "bind"]({
		"click": function(event) {
			event.stopPropagation();
			if (extra.callback) extra.callback();
		}
	});
	return control;
};

Echo.Item.prototype.renderers.controlsDelimiter = function() {
	return $('<span class="echo-item-control-delim"> \u00b7 </span>');
};

Echo.Item.prototype.renderers.controls = function(element) {
	var self = this;
	this.assembleControls();
	this.sortControls();
	var container = element.empty();
	var delimiter = this.render("controlsDelimiter");
	$.map(this.controlsOrder, function(name) {
		var data = self.controls[name];
		if (!data || !data.visible()) return;
		var control = data.dom || self.render("control", undefined, undefined, data);
		if (control) {
			self.controls[name].element = control;
			self.controls[name].clickableElements = $('.echo-clickable', control);
			if (!self.controls[name].clickableElements.length) {
				self.controls[name].clickableElements = control;
			}
			container.append(delimiter.clone(true)).append(control);
		}
	});
};

Echo.Item.prototype.renderers.re = function() {
	if (!this.config.get("reTag")) return;
	var self = this;
	var context = this.data.object.context;
	var re = "";
	//XXX use normalized permalink and location instead
	var permalink = this.data.object.permalink;
	var limits = this.config.get("limits");
	var openLinksInNewWindow = this.config.get("openLinksInNewWindow");

	var getDomain = function(url) {
		var parts = $.parseUrl(url);
		return (parts && parts.domain) ? parts.domain : url;
	};

	var reOfContext = function(c) {
		var maxLength = limits.reTitle;
		if (!c.title) {
			maxLength = limits.reLink;
			c.title = c.uri.replace(/^https?:\/\/(.*)/ig, '$1');
		}
		if (c.title.length > maxLength) {
			c.title = c.title.substring(0, maxLength) + "...";
		}
		return "<div>" + self.hyperlink({
			"class": "echo-primaryColor",
			"href": c.uri,
			"caption": "Re: " + $.stripTags(c.title)
		}, {
			"openInNewWindow": openLinksInNewWindow
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

Echo.Item.prototype.renderers.sourceIcon = function(element, dom) {
	if (!this.config.get("viaLabel.icon") ||
		this.data.source.name == "jskit" ||
		this.data.source.name == "echo") {
			dom.remove(element);
	}
	element.css('backgroundImage',
			'url(' + $.htmlize(
					this.data.source.icon ||
					this.data.provider.icon ||
					this.config.get("providerIcon")
			) + ')'
		)
		.wrap(this.hyperlink({
			"href": this.data.source.uri || this.data.object.permalink
		}, {
			"openInNewWindow": this.config.get("openLinksInNewWindow")
		}));
};

Echo.Item.prototype.renderers.via = function(element, dom) {
	var self = this;
	var get = function(field) {
		return (self.data[field].name || "").toLowerCase();
	};
	if (get("source") == get("provider")) return;
	this.render("viaText", element, dom, {
		"label": "via",
		"field": "provider"
	});
};

Echo.Item.prototype.renderers.from = function(element, dom) {
	this.render("viaText", element, dom, {
		"label": "from",
		"field": "source"
	});
};

Echo.Item.prototype.renderers.viaText = function(element, dom, extra) {
	extra = extra || {};
	var data = this.data[extra.field];
	if (!this.config.get("viaLabel.text") || !data.name || data.name == "jskit"  || data.name == "echo") return;
	var a = this.hyperlink({
		"class": "echo-secondaryColor",
		"href": data.uri || this.data.object.permalink,
		"caption": data.name
	}, {
		"openInNewWindow": this.config.get("openLinksInNewWindow")
	});
	element.html('&nbsp;' + this.label(extra.label + 'Label') + '&nbsp;').append(a);
};

Echo.Item.prototype.renderers.body = function(element) {
	var self = this;
	var output = function(text) {
		return element.append('<span>' + text + '</span>');
	};
	// temporary fix because Firefox hides CDATA content
	var text = this.data.object.content.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
	var source = this.data.source.name;
	var contentTransformations = this.config.get("contentTransformations." +
							this.data.object.content_type, {});
	if (source && source == "Twitter" && this.config.get("aggressiveSanitization")) {
		output(this.label("sharedThisOn", {"service": source}));
		return;
	}

	var limits = this.config.get("limits");
	var wrap = function(tag) {
		var template = 
			(tag.length > limits.tags)
			? '<span class="echo-item-tag" title={Data:tag}>{Data:truncatedTag}</span>'
			: '<span class="echo-item-tag">{Data:tag}</span>';
		var truncatedTag = tag.substring(0, limits.tags) + "...";
		return (self.substitute(template, {"tag": tag, "truncatedTag": truncatedTag}));	
	};

	if (contentTransformations.hashtags) {
		text = text.replace(/(#|\uff03)(<a[^>]*>[^<]*<\/a>)/ig, function($0, $1, $2){
			return wrap($2);
		});
	}

	var insertHashTags = function(t) {
		if (!contentTransformations.hashtags) return t;
		return t.replace(/(^|[^\w&\/])(?:#|\uff03)([^\s\.,;:'"#@\$%<>!\?\(\)\[\]]+)/ig, function($0, $1, $2) {
			return $1 + wrap($2);
		});
	};
	var tags;
	var tags2meta = function(t) {
		tags = [];
		t = t.replace(/((<a\s+[^>]*>)(.*?)(<\/a>))|<.*?>/ig, function($0, $1, $2, $3, $4) {
			if ($1) $0 = $2 + insertHashTags($3) + $4;
			tags.push($0);
			return ' %%HTML_TAG%% ';
		});
		return t;
	};
	var meta2tags = function(t) {
		$.each(tags, function(i, v) {
			t = t.replace(' %%HTML_TAG%% ', v);
		});
		return t;
	};
	var urlMatcher = "((?:http|ftp|https):\\/\\/(?:[a-z0-9#:\\/\\;\\?\\-\\.\\+,@&=%!\\*\\'(){}\\[\\]$_|^~`](?!gt;|lt;))+)";
	text = tags2meta(text);
	if (source && source != 'jskit' && source != 'echo') {
		var url = this.depth
			? this.data.target.id
			: this.config.get("reTag")
				? this.data.object.permalink || this.data.target.id
				: undefined;
		if (url) {
			text = text.replace(new RegExp(url, "g"), "");
			if (!/\S/.test(text)) {
				output(this.label("sharedThisOn", {"service": source}));
				return;
			}
		}
	}
	var textBeforeAutoLinking = text = insertHashTags(text);
	if (contentTransformations.urls) {
		text = text.replace(new RegExp(urlMatcher, 'ig'), function($0, $1) {
			return self.hyperlink({
				'href': $1,
				'caption': $1
			}, {
				'skipEscaping': true,
				'openInNewWindow': self.config.get("openLinksInNewWindow")
			});
		})
	}
	if (contentTransformations.smileys) {
		if (text != textBeforeAutoLinking) {
			text = tags2meta(meta2tags(text));
		}
		var smileys = this.initSmileysConfig();
		if (text.match(smileys.regexps.test)) {
			$.each(smileys.codes, function(i, code) {
				text = text.replace(smileys.regexps[code], smileys.tag(smileys.hash[code]));
			});
		}
	}

	if (contentTransformations.newlines) {
		text = text.replace(/\n\n+/g, '\n\n');
		text = text.replace(/\n/g, '&nbsp;<br>');
	}

	text = meta2tags(text);
	if (contentTransformations.urls) {
		text = text.replace(new RegExp("(<a\\s+[^>]*>)" + urlMatcher + "(<\\/a>)", "ig"), function($0, $1, $2, $3) {
			if ($2.length > limits.bodyLink) {
				return $1 + $2.substring(0, limits.bodyLink) + "..." + $3;
			}
			return $0;
		});
	}
	if (limits.body) {
		text = $.htmlTextTruncate(text, limits.body, "...");
	}
	output(text);
};

Echo.Item.prototype.renderers.date = function(element) {
	var container = element || this.dom && this.dom.get("date");
	if (container) {
		container.html(this.age);
	}
};

Echo.Item.prototype.initSmileysConfig = function() {
	if (Echo.Vars.smileys) return Echo.Vars.smileys;
	var esc = function(v) { return v.replace(/([\W])/g, "\\$1"); };
	var smileys = Echo.Vars.smileys = {"codes": [], "regexps": []};
	smileys.hash = {
		':)':		{file: 'smile.png', title: 'Smile'},
		':-)':		{file: 'smile.png', title: 'Smile'},
		';)':		{file: 'wink.png', title: 'Wink'},
		';-)':		{file: 'wink.png', title: 'Wink'},
		':(':		{file: 'unhappy.png', title: 'Frown'},
		':-(':		{file: 'unhappy.png', title: 'Frown'},
		'=-O':		{file: 'surprised.png', title: 'Surprised'},
		':-D':		{file: 'grin.png', title: 'Laughing'},
		':-P':		{file: 'tongue.png', title: 'Tongue out'},
		'=)':		{file: 'happy.png', title: 'Happy'},
		'B-)':		{file: 'evilgrin.png', title: 'Evil grin'}
	};
	var escapedCodes = [];
	$.each(smileys.hash, function(code) {
		var escaped = esc(code);
		escapedCodes.push(escaped);
		smileys.codes.push(code);
		smileys.regexps[code] = new RegExp(escaped, "g");
	});
	smileys.regexps.test = new RegExp(escapedCodes.join("|"));
	smileys.tag = function(smiley) {
		return '<img class="echo-item-smiley-icon" src="//c0.echoenabled.com/images/smileys/emoticon_' + smiley.file + '" title="' + smiley.title + '" border="0" alt="' + smiley.title + '" />';
	};
	return smileys;
};

Echo.Item.prototype.assembleControls = function() {
	var self = this;
	var controlsOrder = [];
	$.each(this.config.get("itemControls", {}), function(plugin, controls) {
		$.map(controls, function(control) {
			var data = $.isFunction(control)
				? control.call(self)
				: $.extend({}, control);
			if (!data.name) return;
			var callback = data.callback || function() {};
			data.callback = function() {
				callback.call(self);
				self.publish("internal.Item.onControlClick", {
					"name": data.name,
					"plugin": plugin,
					"item": {
						"data": self.data,
						"target": self.dom.content
					}
				});
			};
			data.label = data.label || data.name;
			data.plugin = plugin;
			if (typeof data.visible == "undefined") {
				data.visible = true;
			}
			var visible = data.visible;
			data.visible = function() {
				return visible && self.config.get("plugins." + plugin + ".enabled");
			}
			var name = plugin + '.' + data.name;
			self.controls[name] = data;
			if ($.inArray(name, self.controlsOrder) < 0) {
				controlsOrder.push(name);
			}
		});
	});
	// keep correct order of plugins and controls
	self.controlsOrder = controlsOrder.concat(self.controlsOrder);
};

Echo.Item.prototype.sortControls = function() {
	var self = this;
	var defaultOrder = this.controlsOrder;
	var requiredOrder = this.config.get("itemControlsOrder");
	// if controls order is not specified in application config, use default order
	if (!requiredOrder) {
		this.config.set("itemControlsOrder", defaultOrder);
	} else if (requiredOrder != defaultOrder) {
		var push = function(name, acc, pos) {
			if (!self.controls[name]) return;
			acc.push(name);
			pos = pos || $.inArray(name, defaultOrder);
			if (pos >= 0) {
				delete defaultOrder[pos];
			}
		};
		var order = $.foldl([], requiredOrder, function(name, acc) {
			if (/^(.*)\./.test(name)) {
				push(name, acc);
			} else {
				var re = new RegExp("^" + name + "\.");
				$.map(defaultOrder, function(n, i) {
					if (n && n.match(re)) {
						push(n, acc, i);
					}
				});
			}
		});
		this.controlsOrder = order;
		this.config.set("itemControlsOrder", order);
	// if application config tells not to use controls
	} else if (!requiredOrder.length) {
		this.controlsOrder = [];
	}
};

Echo.Item.prototype.traverse = function(tree, callback, acc) {
	var self = this;
	$.each(tree || [], function(i, item) {
		acc = self.traverse(item.children, callback, callback(item, acc));
	});
	return acc;
};

Echo.Item.prototype.refreshDate = function() {
	this.calcAge();
	this.rerender("date");
	$.map(this.children || [], function(child) {
		child.refreshDate();
	});
};

Echo.Item.prototype.calcAge = function() {
	if (!this.timestamp) return;
	var self = this;
	var d = new Date(this.timestamp * 1000);
	var now = (new Date()).getTime();
	var when;
	var diff = Math.floor((now - d.getTime()) / 1000);
	var dayDiff = Math.floor(diff / 86400);

	function getAgo(ago, period) {
		var diff = '';
		if (1 == (ago % 10) && (11 != ago)) {
			diff = period + "Ago";
		} else {
			diff = period + "sAgo";
		}
		return ago + ' ' + self.label(diff);
	}

	if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 365) {
		when = d.toLocaleDateString() + ', ' + d.toLocaleTimeString();
	} else if (diff < 60) {
		when = getAgo(diff, 'second');
	} else if (diff < 60 * 60) {
		diff = Math.floor(diff / 60);
		when = getAgo(diff, 'minute');
	} else if (diff < 60 * 60 * 24) {
		diff = Math.floor(diff / (60 * 60));
		when = getAgo(diff, 'hour');
	} else if (diff < 60 * 60 * 48) {
		when = this.label("yesterday");
	} else if (dayDiff < 7) {
		when = getAgo(dayDiff, 'day');
	} else if (dayDiff < 14) {
		when = this.label("lastWeek");
	} else if (dayDiff < 30) {
		diff =  Math.floor(dayDiff / 7);
		when = getAgo(diff, 'week');
	} else if (dayDiff < 60) {
		when = this.label("lastMonth");
	} else if (dayDiff < 365) {
		diff =  Math.floor(dayDiff / 31);
		when = getAgo(diff, 'month');
	}
	if (this.age != when) {
		this.age = when;
	}
};

Echo.Item.prototype.block = function(label) {
	if (this.blocked) return;
	this.blocked = true;
	var content = this.dom.get("container");
	var width = content.width();
	//We should take into account that container has a 10px 0px padding value
	var height = content.outerHeight();
	this.blockers = {
		"backdrop": $('<div class="echo-item-blocker-backdrop"></div>').css({
			"width": width, "height": height
		}),
		"message": $(this.substitute('<div class="echo-item-blocker-message">{Data:label}</div>', {"label": label})).css({
			"left": ((parseInt(width) - 200)/2) + 'px',
			"top": ((parseInt(height) - 20)/2) + 'px'
		})
	};
	content.addClass("echo-relative")
		.prepend(this.blockers.backdrop)
		.prepend(this.blockers.message);
};

Echo.Item.prototype.unblock = function() {
	if (!this.blocked) return;
	this.blocked = false;
	this.blockers.backdrop.remove();
	this.blockers.message.remove();
	this.dom.get("container").removeClass("echo-relative");
};

Echo.Item.prototype.getAccumulator = function(type) {
	return this.data.object.accumulators[type];
}; 

Echo.Localization.extend({
	"guest": "Guest",
	"live": "Live",
	"paused": "Paused",
	"more": "More",
	"loading": "Loading...",
	"emptyStream": "No items at this time...",
	"waiting": "Building view, please wait...",
	"new": "new",
	"errorResultTooLarge": "This message stream is not available at this time."
}, "Stream");

Echo.Stream = function(config) {
	if (!config || !config.target) return;
	var self = this;
	this.vars = {"cache": {}};
	this.initVars();
	this.initConfig(config, {
		"aggressiveSanitization": false,
		"children": {
			"depth": 2,
			"sortOrder": "chronological"
		},
		"childrenMaxDepth": 1,
		"contentTransformations": {
			"text": ["smileys", "hashtags", "urls", "newlines"],
			"html": ["smileys", "hashtags", "urls", "newlines"],
			"xhtml": ["smileys", "hashtags", "urls"]
		},
		"fadeTimeout": 2800,
		"flashColor": "#ffff99",
		"itemsPerPage": 15,
		"maxBodyLinkLength": 50,
		"maxBodyCharacters": undefined,
		"maxReLinkLength": 30,
		"maxReTitleLength": 143,
		"maxTagLength": 16,
		"maxMarkerLength": 16,
		"openLinksInNewWindow": false,
		"optimizedContext": true,
		"itemControlsOrder": undefined,
		"providerIcon": "http://c0.echoenabled.com/images/favicons/comments.png",
		"reTag": true,
		"slideTimeout": 700,
		"sortOrder": "reverseChronological",
		"streamStateLabel": {
			"icon": true,
			"text": true
		},
		"submissionProxyURL": window.location.protocol + "//echoenabled.com/apps/esp/activity",
		"viaLabel": {
			"icon": false,
			"text": false
		}
	}, this.assembleConfigNormalizer());
	this.initApplication(function() {
		self.addCss();
		self.config.get("target").empty().append(self.render());
		self.recalcEffectsTimeouts();
		self.initLiveUpdates(function() {
			return {
				"endpoint": "search",
				"query": {
					"q": self.constructSearchQuery(),
					"since": self.nextSince || 0
				}
			};
		}, function(data) { self.handleLiveUpdatesResponse(data); });
		if (self.config.get("data")) {
			self.handleInitialResponse(self.config.get("data"), function(data) {
				self.isInitialRequest = true;
				self.requestItemsData = data;
				self.render("body");
			});
		} else {
			self.initialItemsRequest();
		}
		self.listenEvents();
		self.publish("Stream.onRender", self.prepareBroadcastParams());
	});
};

Echo.Stream.prototype = new Echo.Application();

Echo.Stream.prototype.namespace = "Stream";

Echo.Stream.prototype.cssPrefix = "echo-stream-";

Echo.Stream.prototype.template = 
	'<div class="echo-stream-container echo-primaryFont echo-primaryBackgroundColor">' +
		'<div class="echo-stream-header">'+
			'<div class="echo-stream-state echo-secondaryColor"></div>' +
			'<div class="echo-clear"></div>' +
		'</div>' +
		'<div class="echo-stream-body"></div>' +
		'<div class="echo-stream-more"></div>' +
		'<div class="echo-stream-brand">'+
			'<a class="echo-stream-brand-link" href="http://aboutecho.com" target="_blank">' +
				'<div class="echo-stream-brand-message">social networking by</div>' +
			'</a>' +
		'</div>' +
	'</div>';

Echo.Stream.prototype.renderers = {};

Echo.Stream.prototype.renderers.body = function(element) {
	element = element || this.dom.get("body");
	if (typeof this.isInitialRequest == "undefined") {
		var labelName = (this.error && this.error.errorCode == "waiting") ? "waiting" : "loading";
		this.showMessage({
			"type": "loading",
			"message": this.label(labelName)
		}, element);
		return;
	}

	var self = this;
	if (this.requestItemsData.length) {
		if (this.isInitialRequest) element.empty();
		this.appendRootItems(this.requestItemsData, element);
	} else {
		this.showMessage({
			"type": "empty",
			"message": this.label("emptyStream")
		}, element);
	}
	if (this.isInitialRequest) {
		element.bind({
			"mouseleave": function() {
				self.activities.paused = false;
				self.executeNextActivity();
				self.rerender("state");
			},
			"mouseenter": function() {
				self.activities.paused = true;
				self.rerender("state");
			}
		});
	}
	this.publish("Stream.onReady", this.prepareBroadcastParams({"initial": this.isInitialRequest}));
};

Echo.Stream.prototype.renderers.state = function(element) {
	var status = this.activities.paused ? 'paused' : 'live';
	element = (element || this.dom.get("state")).empty();
	var templates = {
		"picture" : '<span class="echo-stream-state-picture echo-stream-state-picture-' + status +'"></span>',
		"message" : '<span class="echo-stream-state-message">{Label:' + status + '}</span>',
		"count" : '<span class="echo-stream-state-count">({Data:count} {Label:new})</span>'
	};
	if (this.config.get("streamStateLabel.icon")) {
		element.append(templates.picture);
	}
	if (this.config.get("streamStateLabel.text")) {
		element.append(this.substitute(templates.message));
		var entries = $.foldl([], this.activities.queue, function(entry, acc) {
			if (entry.affectCounter) {
				acc.push(entry);
			}
		});
		if (entries.length > 0 && this.activities.paused) {
			element.append(this.substitute(
				templates.count,
				{"count": entries.length}
			));
		}
	}
};

Echo.Stream.prototype.renderers.more = function(element, dom) {
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

Echo.Stream.prototype.initVars = function() {
	this.activities = {
		"queue": [],
		"paused": false,
		"animations": 0
	};
	this.hasInitialData = false;
	this.items = {};   // items by unique key hash
	this.threads = []; // items tree
	if (this.waitingTimer) {
		clearTimeout(this.waitingTimer);
	}
};

Echo.Stream.prototype.listenEvents = function() {
	var self = this;
	this.subscribe("internal.User.onInvalidate", function() {
		self.refresh();
	});
	this.subscribe("internal.Item.onAdd", function(topic, data) {
		delete data.item.added;
		self.addItemSpotUpdate(data.item);
	});
	this.subscribe("internal.Item.onDelete", function(topic, data) {
		delete data.item.deleted;
		self.deleteItemSpotUpdate(data.item);
	});
	this.subscribe("internal.Item.onRender", function(topic, data) {
		self.publish("Stream.Item.onRender", self.prepareBroadcastParams({
			"item": {
				"data": data.item.data,
				"target": data.item.dom.content
			}
		}));
	});
	this.subscribe("internal.Item.onControlClick", function(topic, data) {
		var topic = self.namespace + ".Item.onControlClick";
		self.publish(topic, self.prepareBroadcastParams(data));
	});
	$.map(["Submit.onPostComplete", "Submit.onEditComplete"], function(topic) {
		Echo.Broadcast.subscribe(topic, function() {
			self.startLiveUpdates(true);
		});
	});
};

Echo.Stream.prototype.initialItemsRequest = function() {
	var self = this;
	this.requestItems({}, function(data) {
		self.isInitialRequest = true;
		self.requestItemsData = data;
		self.render("body");
	});
};

Echo.Stream.prototype.refresh = function() {
	this.stopLiveUpdates();
	this.initVars();
	delete this.isInitialRequest;
	this.clearCache();
	this.rerender();
	this.initialItemsRequest();
	this.publish("Stream.onRerender", this.prepareBroadcastParams());
};

Echo.Stream.prototype.extractPresentationConfig = function(data) {
	return $.foldl({}, ["sortOrder", "itemsPerPage", "safeHTML"], function(key, acc) {
		if (data[key]) acc[key] = data[key];
	});
};

Echo.Stream.prototype.extractTimeframeConfig = function(data) {
	var getComparator = function(value) {
		var m = value.match(/^(<|>)(.*)$/);
		var op = m[1];
		var v = m[2].match(/^'([0-9]+) seconds ago'$/);
		var getTS = v
			? function() { return Math.floor((new Date()).getTime() / 1000) - v[1]; }
			: function() { return m[2]; };
		var f;
		if (op == '<') {
			f = function(ts) {
				return ts < getTS()
			}
		} else if (op == '>') {
			f = function(ts) {
				return ts > getTS()
			}
		}
		return f;
	};
	var timeframe = $.foldl([], ["before", "after"], function(key, acc) {
		if (!data[key]) return;
		var cmp = getComparator(data[key]);
		if (cmp) acc.push(cmp);
	});
	return {"timeframe": timeframe};
};

Echo.Stream.prototype.assembleConfigNormalizer = function() {
	var self = this;
	var ensurePositiveValue = function(v) { return v < 0 ? 0 : v; };
	var normalizer = {
		"contentTransformations" : function(object) {
			$.each(object, function(contentType, options) {
				object[contentType] = $.foldl({}, options || [],
					function(option, acc) {
						acc[option] = true;
					});
			});
			return object;
		},
		"safeHTML" : function(value) {
			return "off" != value;
		},
		"fadeTimeout": ensurePositiveValue,
		"slideTimeout": ensurePositiveValue
	};
	var limits = {
		"body": "maxBodyCharacters",
		"reLink": "maxReLinkLength",
		"reTitle": "maxReTitleLength",
		"bodyLink": "maxBodyLinkLength",
		"tags": "maxTagLength",
		"markers": "maxMarkerLength"
	};
	$.each(limits, function(configKey, streamKey) {
		normalizer[streamKey] = function(value) {
			this.set("limits." + configKey, value);
			return value;
		};
	});
	return normalizer;
};

Echo.Stream.prototype.getRespectiveAccumulator = function(item, sort) {
	var accBySort = {
		"likesDescending": "likesCount",
		"flagsDescending": "flagsCount",
		"repliesDescending": "repliesCount"
	};
	return item.getAccumulator(accBySort[sort]);
};

Echo.Stream.prototype.appendRootItems = function(items, container) {
	var self = this;
	$.each(items || [], function(i, item) {
		container.append(item.render());
		self.publish("Stream.Item.onRender", self.prepareBroadcastParams({
			"item": {
				"data": item.data,
				"target": item.dom.content
			}
		}));
	});
	this.rerender("more");
};

Echo.Stream.prototype.prepareBroadcastParams = function(params) {
	params = params || {};
	params.target = this.config.get("target").get(0);
	params.query = this.config.get("query");
	if (params.item && params.item.target) {
		params.item.target = params.item.target.get(0);
	}
	return params;
};

Echo.Stream.prototype.constructSearchQuery = function(extra) {
	var after = extra && extra["pageAfter"] && "pageAfter:" + extra["pageAfter"] || "";
	return [this.config.get("query", ""), after].join(" ");
};

Echo.Stream.prototype.requestItems = function(extra, visualizer) {
	var self = this;
	this.sendAPIRequest({
		"endpoint": "search",
		"query": {"q": this.constructSearchQuery(extra)}
	}, function(data) {
		self.handleInitialResponse(data, visualizer);
	});
};

Echo.Stream.prototype.handleErrorResponse = function(data) {
	if (this.dom.get("more")) {
		this.dom.get("more").hide();
	}
	this.stopLiveUpdates();
	if (data.errorCode == 'result_too_large') {
		data.errorMessage = this.label('errorResultTooLarge');
	}
	var messageData = {
		"type": "error",
		"message": data.errorCode + (data.errorMessage ? ": " + data.errorMessage : "")
	};
	if (data.errorCode == 'waiting') {
		messageData = {
			"type": 'loading',
			"message": this.label('waiting')
		};
	}
	this.showMessage(messageData, this.dom.get('body'));
};

Echo.Stream.prototype.calcWaitingTimeout = function() {
	// interval is calculated as e^x, x=[1..4]
	if (this.waitingTimeoutStep > 0) {
		if (this.waitingTimeoutStep < 4) {
			this.waitingTimeoutStep++;
		}
	} else {
		this.waitingTimeoutStep = 1;
	}
	return Math.round(Math.exp(this.waitingTimeoutStep)) * 1000;
};

Echo.Stream.prototype.handleInitialResponse = function(data, visualizer) {
	var self = this, items = [], roots = [];
	data = data || {};
	if (data.result == 'error') {
		if (this.error != data) { //avoid rerendering of the same error message
			this.handleErrorResponse(data);
		}
		this.error = data;
		if (data.errorCode == 'waiting' || data.errorCode == 'busy') {
			this.waitingTimer = setTimeout(function() {
				self.refresh();
			}, this.calcWaitingTimeout());
		} else {
			this.waitingTimeoutStep = 0;
		}
		return;
	} else {
		this.waitingTimeoutStep = 0;
	}

	delete this.error;

	this.changeLiveUpdatesTimeout(data.liveUpdatesTimeout);
	this.nextSince = data.nextSince || 0;
	this.nextPageAfter = data.nextPageAfter;
	this.config.extend(this.extractPresentationConfig(data));
	this.config.extend(this.extractTimeframeConfig(data));
	var sortOrder = self.config.get("sortOrder");
	data.entries = data.entries || [];
	this.publish("Stream.onDataReceive", self.prepareBroadcastParams({
		"entries": data.entries,
		"initial": !this.hasInitialData
	}));
	$.each(data.entries, function(i, entry) {
		entry = self.normalizeEntry(entry);
		var item = self.initItem(entry);
		// avoiding problem when children can go before parents
		self.applyStructureUpdates("add", item);
		if (self.isRootItem(item)) {
			self.addItemToList(roots, item, sortOrder);
		}
	});

	this.hasInitialData = true;
	this.isViewComplete = roots.length != this.config.get("itemsPerPage");
	visualizer(roots);
	this.startLiveUpdates();
};

Echo.Stream.prototype.checkTimeframeSatisfy = function() {
	var self = this;
	var timeframe = this.config.get("timeframe");
	var unsatisfying = $.foldl([], this.threads, function(thread, acc) {
		var satisfy = $.foldl(true, timeframe, function(p, a) {
			return a ? p(thread.timestamp) : false;
		});
		if (!satisfy) acc.push(thread);
	});
	$.map(unsatisfying, function(item) {
		self.applySpotUpdates("delete", item);
	});
};

Echo.Stream.prototype.handleLiveUpdatesResponse = function(data) {
	var self = this;
	data = data || {};
	if (data.result == "error") {
		this.startLiveUpdates();
		return;
	}
	this.nextSince = data.nextSince || 0;
	this.refreshItemsDate();
	this.checkTimeframeSatisfy();
	this.applyLiveUpdates(data.entries);
	if (this.activities.paused) {
		this.rerender("state");
	}
	this.executeNextActivity();
	this.startLiveUpdates();
};

Echo.Stream.prototype.applyLiveUpdates = function(entries) {
	var self = this;
	$.each(entries || [], function(i, entry) {
		entry = self.normalizeEntry(entry);
		var item = self.items[entry.unique];
		var action = self.classifyAction(entry);
		if (!item && action != "post") return;
		switch (action) {
			case "post":
				if (item) {
					item.unblock();
					self.applySpotUpdates("replace", self.updateItem(entry));
				} else {
					item = self.initItem(entry, true);
					var satisfies = self.isRootItem(item)
						? self.withinVisibleFrame(item)
						: self.hasParentItem(item);
					if (satisfies) {
						self.publish("Stream.Item.onReceive",
							self.prepareBroadcastParams({
								"item": {"data": item.data}
							}));
						self.applySpotUpdates("add", item);
					} else {
						delete self.items[entry.unique];
					}
				}
				break;
			case "delete":
				self.applySpotUpdates("delete", item);
				break;
		}
	});
	this.recalcEffectsTimeouts();
};

Echo.Stream.prototype.recalcEffectsTimeouts = function() {
	// recalculating timeouts based on amount of items in activities queue
	var s = this;
	var maxTimeouts = {
		"fade": s.config.get("fadeTimeout"),
		"slide": s.config.get("slideTimeout")
	};
	s.timeouts = s.timeouts || {
		"fade": maxTimeouts.fade,
		"slide": maxTimeouts.slide
	};
	if (maxTimeouts.fade == 0 && maxTimeouts.slide == 0) return;
	s.timeouts.coeff = s.timeouts.coeff || {
		"fade": s.timeouts.fade / (maxTimeouts.fade + maxTimeouts.slide),
		"slide": s.timeouts.slide / (maxTimeouts.fade + maxTimeouts.slide)
	};
	var calc = function(timeout, value) {
		value = Math.round(value * s.timeouts.coeff[timeout]);
		if (value < 100) return 0; // no activities for small timeouts
		if (value > maxTimeouts[timeout]) return maxTimeouts[timeout];
		return value;
	};
	// reserving 80% of time between live updates for activities
	var frame = s.config.get("liveUpdatesTimeout") * 1000 * 0.8;
	var msPerItem = s.activities.queue.length ? frame / s.activities.queue.length : frame;
	s.timeouts.fade = calc("fade", msPerItem);
	s.timeouts.slide = calc("slide", msPerItem);
};

Echo.Stream.prototype.refreshItemsDate = function() {
	$.map(this.threads, function(item) {
		item.refreshDate();
	});
};

Echo.Stream.prototype.executeNextActivity = function() {
	var acts = this.activities;
	if (acts.animations > 0 || !acts.queue.length ||
		(acts.paused && acts.queue[0].action != "replace")) return;
	acts.queue.shift().handler();
};

Echo.Stream.prototype.applySpotUpdates = function(action, item) {
	var self = this;
	var handler = function(operation) {
		switch (operation) {
			case "add":
				self.applyStructureUpdates(operation, item);
				item.added = true;
				if (self.isRootItem(item)) {
					self.placeRootItem(item);
				} else {
					var parent = self.getParentItem(item);
					if (parent && parent.dom) {
						parent.rerender(["container", "children"]);
					}
				}
				break;
			case "replace":
				if (self.maybeMoveItem(item)) {
					var oldIdx = self.getItemListIndex(item, self.threads);
					self.applyStructureUpdates(operation, item);
					var newIdx = self.getItemListIndex(item, self.threads);
					if (oldIdx != newIdx) self.applySpotUpdates("move", item);
				}
				if (item && item.dom) {
					item.rerender("container", true);
				}
				self.executeNextActivity();
				break;
			case "delete":
				item.deleted = true;
				if (self.isRootItem(item)) {
					self.publish("internal.Item.onDelete", {"item": item});
					self.applyStructureUpdates(operation, item);
				} else {
					var parent = self.getParentItem(item);
					if (parent) {
						parent.rerender("children");
						self.applyStructureUpdates(operation, item);
						parent.rerender("container");
					}
				}
				break;
			case "move":
				self.moveItemSpotUpdate(item);
				break;
		}
	};
	if  (this.user.hasIdentity(item.data.actor.id)) {
               handler(action);
               return;
        }
	this.activities.queue.push({
		"action": action,
		"affectCounter": action == "add",
		"handler": function() { handler(action); }
	});
};

Echo.Stream.prototype.addItemSpotUpdate = function(item) {
	var self = this;
	this.activities.animations++;
	if (this.timeouts.slide) {
		//We should specify the element height explicitly to avoid element jumping during the animation effect
		var currentHeight = item.dom.content.css("height");
		item.dom.content.css("height", currentHeight).hide().animate({
			"height": "show", 
			"marginTop": "show", 
			"marginBottom": "show", 
			"paddingTop": "show", 
			"paddingBottom": "show"
		},
		this.timeouts.slide,
		function(){
			//After the animation effect we should remove explicitly set height
			item.dom.content.css("height", "");
		});
	} else {
		item.dom.content.show();
	}
	var publish = function() {
		self.publish("Stream.Item.onRender", self.prepareBroadcastParams({
			"item": {
				"data": item.data,
				"target": item.dom.content
			}
		}));
	};
	if (this.timeouts.fade) {
		var container = item.dom.get("container");
		var originalBGColor = $.getVisibleColor(container);
		container
		// delay fading out until content sliding is finished
		.delay(this.timeouts.slide)
		.css({"backgroundColor": this.config.get("flashColor")})
		// Fading out
		.animate(
			{"backgroundColor": originalBGColor},
			this.timeouts.fade,
			"linear",
			function() {
				container.css("backgroundColor", "");
				publish();
				self.activities.animations--;
				self.executeNextActivity();
			}
		);
	} else {
		publish();
		this.activities.animations--;
		this.executeNextActivity();
	}
};

Echo.Stream.prototype.deleteItemSpotUpdate = function(item, callback) {
	var self = this;
	this.activities.animations++;
	callback = callback || function() {
		item.dom.remove("content");
		delete item.dom;
		item.vars = {};
		var itemsCount = $.foldl(0, self.items, function(_item, acc) {
			return acc + 1;
		});
		if (!itemsCount) {
			self.showMessage({
				"type": "empty",
				"message": self.label("emptyStream")
			}, self.dom.get('body'));
		}
		self.activities.animations--;
		self.executeNextActivity();
	};
	if (this.timeouts.slide) {
		item.dom.content.slideUp(this.timeouts.slide, callback);
	} else {
		callback();
	}
};

Echo.Stream.prototype.moveItemSpotUpdate = function(item) {
	var self = this;
	self.deleteItemSpotUpdate(item, function() {
		self.activities.animations--;
		item.dom.content.detach();
		delete item.dom;
		// consider item as new so all plugin specific variables should be removed
		item.vars = {};
		self.placeRootItem(item);
	});
};

Echo.Stream.prototype.classifyAction = function(entry) {
	return (entry.verbs[0] == "http://activitystrea.ms/schema/1.0/delete") ? "delete" : "post";
};

Echo.Stream.prototype.isRootItem = function(item) {
	return !this.config.get("childrenMaxDepth") || item.id == item.conversation;
};

Echo.Stream.prototype.hasParentItem = function(item) {
	return !!this.getParentItem(item);
};

Echo.Stream.prototype.maybeMoveItem = function(item) {
	return this.isRootItem(item) && this.config.get("sortOrder").match(/flags|replies|likes/);
};

Echo.Stream.prototype.withinVisibleFrame = function(item) {
	var lastRoot = this.threads.length
		? this.threads[this.threads.length - 1]
		: undefined;
	if (this.isViewComplete || lastRoot == undefined) return true;
	return this.compareItems(lastRoot, item, this.config.get("sortOrder"));
};

Echo.Stream.prototype.getParentItem = function(item) {
	return this.isRootItem(item) ? undefined : this.items[item.data.parentUnique];
};

Echo.Stream.prototype.compareItems = function(a, b, sort) {
	var self = this;
	switch (sort) {
		case "chronological":
			return a.timestamp > b.timestamp;
		case "reverseChronological":
			return a.timestamp <= b.timestamp;
		case "likesDescending":
		case "repliesDescending":
		case "flagsDescending":
			var getCount = function(entry) {
				return self.getRespectiveAccumulator(entry, sort);
			};
			return (getCount(a) < getCount(b) ||
					(getCount(a) == getCount(b) &&
						this.compareItems(a, b, "reverseChronological")));
	};
};

Echo.Stream.prototype.placeRootItem = function(item) {
	var content = item.render();
	if (this.threads.length > 1) {
		var id = this.getItemListIndex(item, this.threads);
		var next = this.threads[id + 1], prev = this.threads[id - 1];
		if (next) {
			next.dom.content.before(content);
		} else {
			prev.dom.content.after(content);
		}
	} else {
		this.dom.get("body").empty().append(content);
	}
	this.publish("internal.Item.onAdd", {"item": item});
};

Echo.Stream.prototype.getItemListIndex = function(item, items) {
	var id;
	$.each(items || [], function(i, entry) {
		if (entry == item) {
			id = i;
			return false;
		}
	});
	return id;
};

Echo.Stream.prototype.initItem = function(entry, isLive) {
	var self = this;
	var item = new Echo.Item({
		"children": [],
		"config": new Echo.Config(this.config.getAsHash()),
		"conversation": entry.target.conversationID, // short cut for "conversationID" field
		"data": entry,
		"depth": 0,
		"id": entry.object.id, // short cut for "id" item field
		"live": isLive,
		"threading": false,
		"timestamp": $.timestampFromW3CDTF(entry.object.published),
		"user": this.user
	});
	// caching item template to avoid unnecessary work
	var template = item.template;
	item.template = function() {
		if (!self.vars.cache.itemTemplate) {
			self.vars.cache.itemTemplate = $.isFunction(template)
				? template.apply(this, arguments)
				: template;
		}
		return self.vars.cache.itemTemplate;
	};
	this.items[item.data.unique] = item;
	return item;
};

Echo.Stream.prototype.updateItem = function(entry) {
	var item = this.items[entry.unique];
	item.data = entry;
	return item;
};

Echo.Stream.prototype.addItemToList = function(items, item, sort) {
	var self = this;
	if (item.live || item.forceInject) {
		var inserted = false;
		$.each(items || [], function(i, entry) {
			if (self.compareItems(entry, item, sort)) {
				items.splice(i, 0, item);
				inserted = true;
				return false;
			}
		});
		if (!inserted) {
			items.push(item);
		}
		delete item.forceInject;
	} else {
		items.push(item);
	}
	this.items[item.data.unique] = item;
};

Echo.Stream.prototype.applyStructureUpdates = function(action, item, options) {
	var self = this;
	options = options || {};
	switch (action) {
		case "add":
			if (!this.isRootItem(item)) {
				var parent = this.getParentItem(item);
				// avoiding problem with missing parent
				if (!parent) {
					delete this.items[item.data.unique];
					return;
				}
				item.depth = parent.depth + 1;
				if (item.depth > this.config.get("childrenMaxDepth")) {
					item.depth = this.config.get("childrenMaxDepth");
					// replace parent of the item
					item.data.parentUnique = parent.data.parentUnique;
					item.data.target.id = parent.data.target.id;
					item.forceInject = true;
					this.applyStructureUpdates("add", item);
					return;
				}
				parent.threading = true;
				var childrenSortOrder = this.config.get("children.sortOrder");
				if (childrenSortOrder != "chronological") {
					item.forceInject = true;
				}
				this.addItemToList(parent.children, item, childrenSortOrder);
			} else {
				this.addItemToList(this.threads, item, this.config.get("sortOrder"));
			}
			break;
		case "delete":
			var container = null;
			if (this.isRootItem(item)) {
				container = this.threads;
			} else {
				container = this.items[item.data.parentUnique].children;
				if (container.length == 1) {
					var parent = this.getParentItem(item);
					if (parent) parent.threading = false;
				}
			}
			container.splice(this.getItemListIndex(item, container), 1);
			if (!options.keepChildren) {
				item.traverse(item.children, function(child) {
					delete self.items[child.data.unique];
				});
			}
			delete this.items[item.data.unique];
			break;
		case "replace":
			if (this.maybeMoveItem(item)) {
				// item may change its position during "replace" operation
				// if sortOrder is defined as
				// "repliesDescending" or "likesDescending"
				this.applyStructureUpdates("delete", item, {"keepChildren": true});
				item.forceInject = true;
				this.applyStructureUpdates("add", item);
			}
			break;
	};
};

Echo.Stream.prototype.normalizeEntry = function(entry) {
	if (entry.normalized) return entry;
	var self = this;
	entry.normalized = true;
	// detecting actual target
	$.each(entry.targets || [], function(i, target) {
		if ((target.id == target.conversationID) ||
			(target.id == entry.object.id) ||
			(self.items[target.id + target.conversationID])) {
				entry.target = target;
		}
	});
	entry.object.content_type = entry.object.content_type || "text";
	entry.object.accumulators = entry.object.accumulators || {};
	entry.object.accumulators.repliesCount =
				parseInt(entry.object.accumulators.repliesCount || "0");
	entry.object.accumulators.flagsCount =
				parseInt(entry.object.accumulators.flagsCount || "0");
	entry.object.accumulators.likesCount =
				parseInt(entry.object.accumulators.likesCount || "0");
	entry.object.context = entry.object.context || [];
	entry.object.flags = entry.object.flags || [];
	entry.object.likes = entry.object.likes || [];
	entry.target = entry.target || entry.targets[0] || {};
	entry.target.conversationID = entry.target.conversationID || entry.object.id;
	entry.source = entry.source || {};
	entry.provider = entry.provider || {};
	entry.unique = entry.object.id + entry.target.conversationID;
	entry.parentUnique = entry.target.id + entry.target.conversationID;
	return entry;
};

Echo.Stream.prototype.addCss = function() {
	var self = this;
	$.addCss(
		'.echo-stream-message-wrapper { padding: 15px 0px; text-align: center; -moz-border-radius: 0.5em; -webkit-border-radius: 0.5em; border: 1px solid #E4E4E4; }' +
		'.echo-stream-message-empty, .echo-stream-message-loading, .echo-stream-message-error { display: inline-block; height: 16px; padding-left: 21px; background: no-repeat left center; }' +
		'.echo-stream-message-empty { background-image: url(//c0.echoenabled.com/images/information.png); }' +
		'.echo-stream-message-loading { background-image: url(//c0.echoenabled.com/images/loading.gif); }' +
		'.echo-stream-message-error { background-image: url(//c0.echoenabled.com/images/warning.gif); }' +
		'.echo-stream-header { margin: 10px 0px 10px 20px; }' +
		'.echo-stream-state { float: right; }' +
		'.echo-stream-state-picture { display: inline-block; height: 9px; width: 8px; }' +
		'.echo-stream-state-picture-paused { background: url("//c0.echoenabled.com/images/control_pause.png") no-repeat center center; }' +
		'.echo-stream-state-picture-live { background: url("//c0.echoenabled.com/images/control_play.png") no-repeat center center; }' +
		'.echo-stream-state-message { margin-left: 5px;}' +
		'.echo-stream-brand { text-align: right; display: none; }' +
		'.echo-stream-brand-message { display: inline-block; height: 17px; line-height: 17px; border: none; padding-right: 48px; background: url(//c0.echoenabled.com/images/echo-brand.png) no-repeat right; font-size: 10px; font-family: Arial; }' +
		'.echo-stream-container a.echo-stream-brand-link { text-decoration: none; color: #666666; } ' +
		'.echo-stream-more-hover { background-color: #E4E4E4; }' +
		'.echo-stream-more { text-align: center; border: solid 1px #E4E4E4; margin-top: 10px; padding: 10px; -moz-border-radius: 0.5em; -webkit-border-radius: 0.5em; cursor: pointer; font-weight: bold; }'
	, 'stream');

	$.addCss(
		'.echo-item-container-root { padding: 10px 0px; }' +
		'.echo-item-container-root-thread { padding: 10px 0px 0px 0px; }' +
		'.echo-item-container-child { padding: 10px; margin: 0px 20px 2px 0px; }' +
		'.echo-item-container-child-thread { padding: 10px; margin: 0px 20px 2px 0px; }' +
		'.echo-item-avatar-wrapper { margin-right: -58px; }' +
		'.echo-item-children .echo-item-avatar-wrapper { margin-right: -34px; }' +
		'.echo-item-children .echo-item-subwrapper { margin-left: 34px; }' +
		'.echo-item-wrapper { float: left; width: 100%; }' +
		'.echo-item-subwrapper { margin-left: 58px; }' +
		'.echo-item-subcontainer { float: left; width: 100%; }' +
		'.echo-item-markers { line-height: 16px; background: url(//c0.echoenabled.com/images/curation/metadata/marker.png) no-repeat; padding: 0px 0px 4px 21px; margin-top: 7px; }' +
		'.echo-item-tags { line-height: 16px; background: url(//c0.echoenabled.com/images/tag_blue.png) no-repeat; padding: 0px 0px 4px 21px; }' +
		'.echo-item-metadata { display: none; }' +
		'.echo-item-metadata-title { font-weight: bold; line-height: 25px; height: 25px; margin-right: 5px; }' +
		'.echo-item-metadata-icon { display: inline-block; padding-left: 26px; }' +
		'div.echo-item-metadata-userID { border-bottom: 1px solid #e1e1e1; border-top: 1px solid #e1e1e1;}' +
		'span.echo-item-metadata-userID { background: url("//c0.echoenabled.com/images/curation/metadata/user.png") no-repeat left center; }' +
		'.echo-item-modeSwitch { display: none; float: right; width: 16px; height: 16px; background:url("//c0.echoenabled.com/images/curation/metadata/flip.png") no-repeat 0px 3px; }' +
		'.echo-item-childrenMarker { border-color: transparent transparent #ECEFF5; border-width: 0px 11px 11px; border-style: solid; margin: 3px 0px 0px 77px; height: 1px; width: 0px; display: none; }' + // This is magic "arrow up". Only color and margins could be changed
		'.echo-item-container-root-thread .echo-item-childrenMarker { display: block; }' +
		'.echo-item-avatar { width: 48px; height: 48px; }' +
		'.echo-item-children .echo-item-avatar { width: 24px; height: 24px; }' +
		'.echo-item-avatar-wrapper { float: left; position: relative; }' +
		'.echo-item-authorName { float: left; font-size: 15px; font-family: Arial, sans-serif; font-weight: bold; }' +
		'.echo-item-re { font-weight: bold; }' +
		'.echo-item-re a:link, a:visited, a:active { text-decoration: none; }' +
		'.echo-item-re a:hover { text-decoration: underline; }' +
		'.echo-item-body { padding-top: 4px; }' +
		'.echo-item-controls { float: left; margin-left: 3px; }' +
		'.echo-item-sourceIcon { float: left; height: 16px; padding-left: 21px; background: no-repeat; }' +
		'.echo-item-date, .echo-item-from, .echo-item-via { float: left; }' +
		'.echo-item-from a, .echo-item-via a { text-decoration: none; color: #C6C6C6; }' +
		'.echo-item-from a:hover, .echo-item-via a:hover { color: #476CB8; }' +
		'.echo-item-tag { display: inline-block; height: 16px; background: url("//c0.echoenabled.com/images/tag_blue.png") no-repeat; padding-left: 18px; }' +
		'.echo-item-blocker-backdrop { position: absolute; left: 0px; top: 0px; background: #FFFFFF; opacity: 0.7; z-index: 100; }' +
		'.echo-item-blocker-message { position: absolute; z-index: 200; width: 200px; height: 20px; line-height: 20px; text-align: center; background-color: #FFFF99; border: 1px solid #C6C677; opacity: 0.7; -moz-border-radius: 0.5em 0.5em 0.5em 0.5em; }'
	, 'item');

	var itemDepthRules = [];
	for (var i = 0; i <= this.config.get("childrenMaxDepth"); i++) {
		itemDepthRules.push('.echo-item-depth-' + i + ' { margin-left: ' + (i ? 68 + (i - 1) * 44 : 0) + 'px; }');
	}
	$.addCss(itemDepthRules.join('\n'), 'item-depths-' + this.config.get("childrenMaxDepth"));

	if ($.browser.msie) {
		$.addCss(
			'.echo-item-childrenMarker { font-size: 1px; line-height: 1px; filter: chroma(color=black); }' + // filter:chroma is needed to avoid transparent borders as black in ie6
			'.echo-item-blocker-backdrop, .echo-item-blocker-message { filter:Alpha(Opacity=70); }' +
			'.echo-stream-container { zoom: 1; }' +
			'.echo-item-content { zoom: 1; }' +
			'.echo-item-container { zoom: 1; }' +
			'.echo-item-subwrapper { zoom: 1; }'
		, 'stream-ie');
	}
};

})(jQuery);

