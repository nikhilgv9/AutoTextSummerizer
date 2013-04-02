/*-  Queue up functions to fire onload/onresize
----------------------------------------------------------------------*/
/*
	Text sizing
*/
addLoadEvent(buildTextSizer);
addLoadEvent(function() {
	if (readCookie("text-size")) {
		textIt(readCookie("text-size"));
	} else {
		textIt("txt-medium");
	}
});

/*
	"Current Issue" tabs
*/
addLoadEvent(buildCurrentIssueTabs);

/*
	Expand/collapse search navigation
*/
addLoadEvent(buildSearchNavigation);

/*
	IE fix for non-anchor hovers (top navigation, cover archive, etc.)
*/
if (document.all) {
	addLoadEvent(function() {
		ieHover($("#restaurant-menu table tr").get());
		ieHover($("#cover-archive ul li.cover").get());
		ieHover($("ul.agenda-calendar li.event").get());
		ieHover($("fieldset.newsletters div.info").get());
	});
}

/*
	Fix IE PNG transparency
*/
if (document.all && window.attachEvent) {
	addLoadEvent(fnLoadPngs);
}

/*
	Build search tabs
*/
addLoadEvent(buildSearchTabs);

/*
	Add striped rows to all tables with a class of "calendar"
*/
addLoadEvent(striped);

/*
	Add "remove text" handler to text fields
*/
addLoadEvent(initRemoveText);

/*
	Implement "smart" navigation hiding
*/
addLoadEvent(widthMonitor);
addResizeEvent(widthMonitor);

/*
	Column height patch
*/
addLoadEvent(sectionColumnFix);

/*
	"Splash" feature tabs
*/
addLoadEvent(initSplashFeature);

/*
	Travel navigation processing
*/
addLoadEvent(travelNav);

/*
	"The Find" navigation processing
*/
addLoadEvent(theFindNav);

/*
	Expand/collapse for "expand-collapse-list" class
*/
addLoadEvent(function() {
	classExpand("expand-collapse-list");
});


/*
	Expandable table!
*/
addLoadEvent(function() {
	expTable("agenda-week");
})

/*
	Textarea word counter
*/
addLoadEvent(function() {
	initTextareaCounter("comment-body");
});



/*-  Collapsible comments
		Arg:		id = ID of comments' containing DIV
----------------------------------------------------------------------*/
function collapseComments(id) {
	var previewLength = 25; // Number of words in each comment preview

	if (document.getElementById && document.getElementsByTagName) {
		var tmp;
		var content;

		var container = document.getElementById(id);
		if (container) {
			var items = container.getElementsByTagName("li");

			for (var i = 0; i < items.length; i++) {
			    if (findWord("comment", items[i].className)) {
					var divs = items[i].getElementsByTagName("div");
					for (var j = 0; j < divs.length; j++) {
						// Is this the comment's "content" div?
					    if (divs[j].className=="content") {
							// Let's build the preview
							var str = getInnerText(divs[j]);

							// .replace() doesn't seem to work, so let's use .split();
							var clean = str.replace(/^\s+|\s+$/g, "");
							var simpleSplit = clean.split(" ");
							var tmp = "";

							if (simpleSplit.length > previewLength) {
								for (var k = 0; k < previewLength; k++) {
									tmp += simpleSplit[k];
									if (k != (previewLength - 1)) {
										tmp += " ";
									}
								}
							}

							if (tmp.length > 0) {
								// Create preview block + "expand" link
								var a = document.createElement("a");
								a.setAttribute("href", "#");

								var p = document.createElement("p");

								// Content link
								var closeLink = a.cloneNode(false);
								var close = p.cloneNode(false);
								close.className = "close";

								var closeTxt = document.createTextNode("Close");

								closeLink.onclick = function() {
									closeComment(this);
									return false;
								}

								closeLink.appendChild(closeTxt);
								close.appendChild(closeLink);
								divs[j].appendChild(close);

								// Preview text & link
								var prevLink = a.cloneNode(false);
								var preview = p.cloneNode(false);
								preview.className = "preview";

								var txt = document.createTextNode(tmp);
								var aTxt = document.createTextNode("...");

								prevLink.onclick = function() {
									expandComment(this);
									return false;
								}

								prevLink.appendChild(aTxt);
								preview.appendChild(txt);
								preview.appendChild(prevLink);

								divs[j].parentNode.insertBefore(preview, divs[j]);

								items[i].className = safeAppend(items[i].className, "collapsed");
							}
						}
					}
				}
			}
		}
	}
}

function closeComment(el) {
	var comment = getParent(el, "li");
	comment.className = "comment collapsed";
}

function expandComment(el) {
	var comment = getParent(el, "li");
	comment.className = "comment";
}


/*-  Add a word counter to textarea
		Arg:		id = ID of textarea
		NB:		Relies on a label using the following markup:
				<label for="[Must match id argument]"><b>[Additional text here.]</b></label>
----------------------------------------------------------------------*/
function initTextareaCounter(id) {
	// WORD LIMIT -- Increase/decrease as needed (Instance 1/2 - needs to sync up below)
	var limit = 350;

	if (document.getElementById) {
		var label = false;
		var textarea = document.getElementById(id);

		if (textarea) {
			var labels = document.getElementsByTagName("label");
			for (var i = 0; i < labels.length; i++) {
				var thisFor = labels[i].getAttribute('for') || labels[i].getAttribute('htmlFor');
				// If we find the corresponding label, then attach the event handler
				if (thisFor == id) {
					var spans = labels[i].getElementsByTagName("span");

					if (spans.length == 0) {
						var newSpan = document.createElement("span");
						var target = labels[i].getElementsByTagName("b")[0];

						target.insertBefore(newSpan, target.childNodes[0]);
						var span = newSpan;
					} else {
						var span = spans[0];
					}

					// Clear out the span, then insert some text
					while (span.firstChild) {
						span.removeChild(span.firstChild);
					}

					var count = wordCount(textarea.value);

					var txt = document.createTextNode(count + " of " + limit + " words allowed. ");
					span.appendChild(txt);

					var slug = "label-" + i;
					labels[i].setAttribute("id", slug);
					textarea.setAttribute("label-id", slug);

					eventastic(textarea, "keyup", txtCounter, false);
				}
			}
		}
	}
}

var commenting_info = {

	count: 0
};

function txtCounter() {
	// WORD LIMIT -- Increase/decrease as needed (Instance 2/2 - needs to sync up below)
	var limit = 350;
	var badClass = "warning";
	var el = (document.attachEvent) ? event.srcElement : this;

	if (el.getAttribute("label-id")) {
		var label = document.getElementById(el.getAttribute("label-id"));

		if (label) {
			var count = wordCount(el.value);
			commenting_info.count = count;
			var span = label.getElementsByTagName("span")[0];


			if (span) {
				if (count > limit) {
					span.className = badClass;
				} else {
					span.className = "";
				}

				while (span.firstChild) {
					span.removeChild(span.firstChild);
				}

				var txt = document.createTextNode(count + " of " + limit + " words allowed. ");

				span.appendChild(txt);
			}
		}
	}
}

function wordCount(str) {
	var count = 0;
	var full = str;
	var clean = full.replace(/\s/g, " ");
	clean = clean.split(' ');

	for (var i = 0; i < clean.length; i++) {
		if (clean[i].length > 0) {
			count++;
		}
	}
	
	return count;
}


/*-  Expandable table functions
----------------------------------------------------------------------*/
var expCols = new Array;
var expColTiming = 1;
var expCurrentCell = "";
var expDebug = false;
var expT = null;

function expTable(id) {
	if (document.getElementById && document.getElementsByTagName) {
		var table = document.getElementById(id);

		if (table != null) {
			var expCells = new Array();

			// Grab all the TDs and THs.
			var tds = table.getElementsByTagName("td");
			var ths = table.getElementsByTagName("th");

			// Collate the TDs and THs into one array
			for (var i = 0; i < tds.length; i++) { expCells.push(tds[i]); }
			for (var i = 0; i < ths.length; i++) { expCells.push(ths[i]); }

			// Attach events to all TDs/THs
			for (var i = 0; i < expCells.length; i++) {
				eventastic(expCells[i], "mouseover", columnOn, false);
				eventastic(expCells[i], "mouseout", columnOff, false);
				eventastic(expCells[i], "click", columnClick, false);

				key = expCells[i].getAttribute("headers");
				if (!expCols[key]) {
					expCols[key] = new Array();
				}
				expCols[key].push(expCells[i]);

				// Grab the key of the first cell to expand
				if (i == 0) {
					cellKey = expCells[i].getAttribute("headers");
				}
			}

			// Expand the first column
			expCurrentCell = cellKey;
			colExpand(cellKey);
		}
	}
}

function columnOn(e) {
	var el = (document.attachEvent) ? event.srcElement : this;
	var key = el.getAttribute("headers");
	var delay = expColTiming * 500;

	if (key) {
		if (document.attachEvent) {
			var tag = el.tagName.toLowerCase;

			if (tag != "td" || tag != "th") {
				el = (getParent(el, "td")) ? getParent(el, "td") : getParent(el, "th");
			}		
		}

		if (expCols[key]) {
			expCurrentCol = key;

			for (var i = 0; i < expCols[key].length; i++) {
				var thisCell = expCols[key][i];
				thisCell.className = (!findWord("on", thisCell.className)) ? safeAppend(thisCell.className, "over") : thisCell.className;
			}

			expT = setTimeout("colExpand('" + key + "')", delay);
		}
	}
}

function columnOff(e) {
	// Clear out any existing values
	expReset();

	var el = (document.attachEvent) ? event.srcElement : this;
	var tag = el.tagName.toLowerCase;

	if (tag != "td" || tag != "th") {
		el = (getParent(el, "td")) ? getParent(el, "td") : getParent(el, "th");
	}

	key = el.getAttribute("headers");

	// Deactivate old hover
	if (key && expCols[key]) {
		for (var i = 0; i < expCols[key].length; i++) {
			var thisCell = expCols[key][i];
			thisCell.className = replaceWord("over", "", thisCell.className);
		}
	}
}

function columnClick(e) {
	var el = (document.attachEvent) ? event.srcElement : this;

	if (document.attachEvent) {
		var tag = el.tagName.toLowerCase;

		if (tag != "td" || tag != "th") {
			el = (getParent(el, "td")) ? getParent(el, "td") : getParent(el, "th");
		}		
	}

	key = el.getAttribute("headers");

	// Deactivate old hover
	if (key && expCols[key]) {
		colExpand(key);
	}
}

function colExpand(key) {
	if (expCols[expCurrentCell]) {
		for (var i = 0; i < expCols[expCurrentCell].length; i++) {
			var thisCell = expCols[expCurrentCell][i];
			thisCell.className = replaceWord("on", "", thisCell.className);
		}
	}

	for (var i = 0; i < expCols[key].length; i++) {
		var thisCell = expCols[key][i];
		thisCell.className = replaceWord("over", "", thisCell.className);
		thisCell.className = (!findWord("on", thisCell.className)) ? safeAppend(thisCell.className, "on") : thisCell.className;
	}

	expCurrentCell = key;
}

function expReset() {
	// expCurrentCell = "";
	window.clearTimeout(expT);
	expT = null;
}


/*-  Expand/collapse for "expand-collapse-list" class
----------------------------------------------------------------------*/
function classExpand(classname) {
	var targetIDs = getIDsByClass(classname);
	if (targetIDs.length > 0) {
		for (i=0; i<targetIDs.length; i++) {
			var thisID = document.getElementById(targetIDs[i]);
		
			if (thisID) {
				var header = thisID.getElementsByTagName("h3")[0];
				var wrap = thisID.getElementsByTagName("div")[0];

				if (wrap && header) {
					if (wrap.className != "open")
					 wrap.className = "closed";

					var text = document.createTextNode(getInnerText(header));

					var a = document.createElement("a");
					a.setAttribute("href", "#");
					a.appendChild(text);
					a.onclick = function() {
						toggleNav(this, "div");
						return false;
					}

					while (header.hasChildNodes()) {
						header.removeChild(header.firstChild);
					}

					header.appendChild(a);
				}
			
			}
		}
	}
}

/*  Function to return all element IDs that have class "theClass"   */
 
function getIDsByClass(theClass) {
	var myIDs = new Array();
	var j=0;
	//Populate the array with all the page tags
	var allPageTags=document.getElementsByTagName("*");
	//Cycle through the tags using a for loop
	for (i=0; i<allPageTags.length; i++) {
		//Pick out the tags with our class name
		if (allPageTags[i].className==theClass) {
		//Manipulate this in whatever way you want
			myIDs[j++] = allPageTags[i].getAttribute("id");
		}
	}
	return myIDs;
}


/*-  "The Find" navigation
----------------------------------------------------------------------*/
function theFindNav() {
	if (document.getElementById && document.getElementsByTagName) {
		var nav = document.getElementById("nav-thefind");

		if (nav) {
			var url = location.pathname;
			var items = nav.getElementsByTagName("li");
			var imgDir = "/images/2/shopping/thefind/"
			var img = document.createElement("img");
			img.setAttribute("alt", "");

			if (url.match(/^\/shopping\/thefind\/([A-Za-z]*)\/?(?:index?(\d)?\.html)?/i)) {
				// alert("hi");
				var cat = RegExp.$1;
				var current = (RegExp.$2) ? RegExp.$2 : 0;

				for (var i = 0; i < items.length; i++) {
					var newImg = img.cloneNode(false);
					newImg.setAttribute("src", imgDir + cat + "/btn_" + (i + 1) + ".gif");
					var link = items[i].getElementsByTagName("a")[0];
					link.insertBefore(newImg, link.childNodes[0]);

					if (i == current) {
						items[i].className = "current";
					}
				}
			}
		}
	}
}

/*-  "The Find" navigation
----------------------------------------------------------------------*/
var expCols = new Array;
var expCurrentCell = "";
var expDebug = false;
var expT = null;

function expTable2(id) {
	if (document.getElementById && document.getElementsByTagName) {
		var table = document.getElementById(id);

		if (table) {
			var url = location.pathname;

			// Grab all the TDs and THs.
			var tds = table.getElementsByTagName("td");
			var ths = table.getElementsByTagName("th");

			// Collate the TDs and THs into one array
			for (var i = 0; i < tds.length; i++) { expCells.push(tds[i]); }
			for (var i = 0; i < ths.length; i++) { expCells.push(ths[i]); }

			// Attach events to all TDs/THs
				// alert("hi");
				eventastic(expCells[i], "mouseover", columnOn, false);
				eventastic(expCells[i], "mouseout", columnOff, false);
				eventastic(expCells[i], "click", columnClick, false);

				key = expCells[i].getAttribute("headers");
					var newImg = img.cloneNode(false);
					expCols[key] = new Array();
				}
				expCols[key].push(expCells[i]);

				// Grab the key of the first cell to expand
						items[i].className = "current";
					}
				}
			// }
		// }
	// }
// }

/*-  Travel navigation
----------------------------------------------------------------------*/
function travelNav() {
	if (document.getElementById && document.getElementsByTagName) {
		var nav = document.getElementById("nav-travel");

		if (nav) {
			var url = location.pathname;
			var items = nav.getElementsByTagName("li");
			var imgDir = "/images/2/graphics/redesign06/travel/weekends/"
			var img = document.createElement("img");
			img.setAttribute("alt", "");

			if (url.match(/\/travel\/weekends\/([A-Za-z]*)\/?(?:index)?(\d)?(?:\.html)?/i)) {
				var city = RegExp.$1;
				var current = (RegExp.$2) ? RegExp.$2 : 0;

				for (var i = 0; i < items.length; i++) {
					var newImg = img.cloneNode(false);
					newImg.setAttribute("src", imgDir + city + "/btn_" + (i + 1) + ".gif");
					items[i].insertBefore(newImg, items[i].childNodes[0]);

					if (i == current) {
						items[i].className = "current";
					}
				}
			}

		}
	}
}


/*-  Text sizing
----------------------------------------------------------------------*/
/*
	Build controls text sizing
*/
function buildTextSizer() {
	if (document.getElementsByTagName) {
		var trigger = document.getElementsByTagName("body")[0];
		if (findWord("text-sizer", trigger.className) && document.createElement && document.getElementById) {
			if (document.getElementById("article-content")) {
				var container = document.getElementById("article-content");
			} else {
				var container = document.getElementById("content-primary");
			}

			if (container) {
				// Build elements
				var slugs = new Array("small", "medium", "large");
				var controlContainer = document.createElement("div");
				var topList = document.createElement("ul");
				var innerList = document.createElement("ul");
				var listItem = document.createElement("li");
				var span = document.createElement("span");
				var labelText = document.createTextNode("Text Size:")

				// Loop over the text size "slugs", and build a link for each one
				for (var i = 0; i < slugs.length; i++) {
					var text = document.createTextNode("A");
					var anchor = document.createElement("a");
					var item = document.createElement("li");

					anchor.appendChild(text);
					anchor.setAttribute("href", "javascript:textIt('txt-" + slugs[i] + "');");
					anchor.setAttribute("title", "Make the story text " + slugs[i] + ".");
					item.appendChild(anchor);
					item.setAttribute("id", "txt-" + slugs[i]);

					innerList.appendChild(item);
				}

				// Assemble everything, and insert it into the document
				span.className = "label";
				span.appendChild(labelText);
				listItem.appendChild(span);
				listItem.appendChild(innerList);
				topList.appendChild(listItem);
				controlContainer.setAttribute("id", "text-size");
				controlContainer.appendChild(topList);
				container.insertBefore(controlContainer, container.childNodes[0]);
			}
		}
	}
}


/*
	Text sizer function
*/
function textIt(str) {
	var wrap = document.getElementById("wrap");
	var textSize = document.getElementById("text-size");
	if (wrap && textSize) {
		wrap.className = str;

		var listItems = textSize.getElementsByTagName("li");
		for (var i = 0; i < listItems.length; i++) {
			listItems[i].className = "";	// IE5/Mac won't respect .removeAttribute("class"), for some reason.
			if (listItems[i].getAttribute("id") == str) {
				listItems[i].className = safeAppend(listItems[i].className, "current");
				setCookie("text-size", str, 365)
			}
		}
	}
}


/*-  Tabs for "Current Issue" module
----------------------------------------------------------------------*/
/*
	Build tabs for text sizing
*/
function buildCurrentIssueTabs() {
	var currentIssue = $(".module-current-issue").get();
	if (currentIssue && document.createElement) {
		var tabText = [];
		var tabIds = [];
		for (var i = 0; i < currentIssue.length; i++) {
			var forms = currentIssue[i].getElementsByTagName("form");
			for (var j = 0; j < forms.length; j++) {
				// Get the ids for our tabs
				tabIds.push(forms[j].getAttribute("id"));

				// Get the text for our tabs
				var legends = forms[j].getElementsByTagName("legend");
				for (var k = 0; k < legends.length; k++) {
					tabText.push(document.createTextNode(legends[k].innerHTML));
					legends[k].className = "ineffable";
				}
				if (j > 0) {
					forms[j].className = "ineffable";
				}
			}

			// Build the tabs
			var tabs = document.createElement("div");
			var list = document.createElement("ul");
			tabs.className = "tabs";

			for (var j = 0; j < tabText.length; j++) {
				var listItem = document.createElement("li");
				var anchor = document.createElement("a");

				anchor.setAttribute("href", "javascript:issueTab('" + tabIds[j] + "');");
				anchor.appendChild(tabText[j]);
				listItem.setAttribute("id", "tab-" + tabIds[j]);
				listItem.appendChild(anchor);
				if (j == 0) {
					listItem.className = "current first";
				} else if (j == (tabText.length - 1)) {
					listItem.className = "last";
				}
				list.appendChild(listItem);
			}

			tabs.appendChild(list);
			// Insert the tabs before the first form
			forms[0].parentNode.insertBefore(tabs, forms[0]);
		}
	}
}


/*
	Show/hide tabs for Current Issue
*/
function issueTab(id) {
	// Set some variables, and find out where we are in the document
	var cloak = "ineffable";
	var current = "current";
	var thisListItem = document.getElementById("tab-" + id);
	var tabDiv = getParent(thisListItem, "div");
	var contentDiv = tabDiv.parentNode;	// Not sure why getParent() returns tabDiv

	// Hide all of the forms, except the one that matches the id
	var forms = contentDiv.getElementsByTagName("form");
	for (var i = 0; i < forms.length; i++) {
		forms[i].className = safeAppend(forms[i].className, cloak);
		if (forms[i].getAttribute("id") == id) {
			forms[i].className = forms[i].className.replace(new RegExp("(( ?|^)" + cloak + "( |$))*"), "");
		}
	}

	// "Activate" the proper tab
	var listItems = tabDiv.getElementsByTagName("li");
	for (var i = 0; i < listItems.length; i++) {
		listItems[i].className = listItems[i].className.replace(new RegExp("( ?|^)current( |$)"), "");
		if ((listItems[i].getAttribute("id") == "tab-" + id)) {
			listItems[i].className = safeAppend(listItems[i].className, current);
		}
	}
}


/*-  Build search tabs
----------------------------------------------------------------------*/
function buildSearchTabs() {
	if (document.getElementById && document.getElementsByTagName && document.createElement) {
		var current = "";
		var body = document.getElementsByTagName("body")[0];
		if (findWord("search-tabs", body.className)) {
			var searchContent = document.getElementById("search-results-content");
			var tabBlocks = $("#search-results-content .tab-block").get();

			var tabDiv = document.createElement("div");
			tabDiv.setAttribute("id", "search-tabs");
			var tabList = document.createElement("ul");

			for (var i = 0; i < tabBlocks.length; i++) {
				var tabTitle = tabBlocks[i].getElementsByTagName("h2")[0];
				var tag = "tab-" + i;
				tabBlocks[i].setAttribute("id", tag);
				if (findWord("tab-title", tabTitle.className)) {
					tabTitle.className = "ineffable";

					var tabText = document.createTextNode(getInnerText(tabTitle));
					var listItem = document.createElement("li");
					var anchor = document.createElement("a");
					var shim = document.createTextNode(" ");

					listItem.className = "tab-item";

					anchor.onclick = function() {
						showSearchTabs(searchContent, this.href.split("#")[1]);
						return false;
					}

					if (findWord("current", tabBlocks[i].className)) {
						listItem.className += " current";
						current = tag;
					} else {
						tabBlocks[i].className += " ineffable";
					}

					anchor.setAttribute("href", "#" + tag);
					anchor.appendChild(tabText);
					listItem.appendChild(anchor);
					tabList.appendChild(listItem);
					tabList.appendChild(shim);
				}
			}

			tabDiv.appendChild(tabList);
			searchContent.insertBefore(tabDiv, tabBlocks[0]);
		}
	}
}

function showSearchTabs(container, tag) {
	var key = tag.split("-")[1];
	var content = document.getElementById(container);
	var tabBlocks = $("#" + container + ".tab-block").get();
	var tabs = $("#" + container + " .tab-item").get();

	for (var i = 0; i < tabs.length; i++) {
		tabBlocks[i].className = "tab-block ineffable";
		tabs[i].className = "tab-item";

		if (i == key) {
			tabBlocks[i].className = "tab-block";
			tabs[i].className = "tab-item current";
		}
	}

	var tabBlocks = $("#" + container + " .tab-block").get();
}

/*-  Sitewide Search Widget Script (for site navigation 2008)
----------------------------------------------------------------------*/
function swapSearchType( widget_name, search_type ) {
    var searchWidget = document.getElementById( widget_name );
    
    if (search_type == 'all') {
        searchWidget.action = "/search/search.cgi";
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

/*-  Expand/collapse functionality for search navigation
----------------------------------------------------------------------*/
function buildSearchNavigation() {
	var searchNav = document.getElementById("search-results-navigation");
	if (searchNav && document.getElementsByTagName) {
		var lists = searchNav.getElementsByTagName("ul");
		for (var i = 0; i < lists.length; i++) {
			if (findWord("search-nav", lists[i].className)) {
				// Collect all of the current list's <li> elements
				var items = lists[i].getElementsByTagName("li");
				for (var j = 0; j < items.length; j++) {
					// If a <li> has <ul>s beneath it, let's process it.
					if (items[j].getElementsByTagName("ul").length > 0) {
						// Unless the link has a class of "default", collapse it
						// do not collapse if class is "keep-open" either!
						if ((!findWord("default", items[j].className))&&(!findWord("keep-open", items[j].className))) {
							items[j].className = "off";
						}

						// Build the widget link
						var widget = document.createElement("a");
						var linkText = document.createTextNode("Expand/collapse this item");
						widget.appendChild(linkText);
						widget.setAttribute("href", "#");
						widget.className = "widget";
						widget.onclick = function() {
							toggleSearch(this);
							return false;
						}

						// Insert the widget link into the <li> (before all other items)
						items[j].insertBefore(widget, items[j].childNodes[0]);
					}
				}
			}

			// Do we need to build show more/fewer links into this list?
			if (findWord("show-more", lists[i].className)) {
				var children = lists[i].childNodes;
				var count = 1;
				var flag = 0;

				for (var k = 0; k < children.length; k++) {
					if (children[k].nodeType == 1 && children[k].tagName.toLowerCase() == "li") {
						if (count > 8) {
							children[k].className = (children[k].className.length > 0) ? safeAppend("gone", children[k].className) : "gone";
							flag++;
						}

						if (!findWord("info", children[k].className)) {
							count++;
						}
					}
				}

				if (flag > 0) {
					var listItem = document.createElement("li");
					var showLink = document.createElement("a");
					var linkText = document.createTextNode("Show more");
					showLink.appendChild(linkText);
					showLink.setAttribute("href", "#");
					showLink.onclick = function() {
						showLinks(this);
						return false;
					}

					listItem.appendChild(showLink);
					listItem.className = "show";
					lists[i].appendChild(listItem);
				}
			}
		}
	}
}

function showLinks(el) {
	var parent = getParent(el, "ul");
	var children = parent.childNodes;

	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() == "li" && findWord("gone", children[i].className)) {
			children[i].className = replaceWord("gone", "", parent.className);
		}
	}

	el.innerHTML = "Show fewer";
	el.onclick = function() {
		hideLinks(this);
		return false;
	}
}

function hideLinks(el) {
	var parent = getParent(el, "ul");
	var children = parent.childNodes;
	var count = 1;

	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() == "li") {
			if (count > 8) {
				if (children[i].className != "show") {
					children[i].className = (children[i].className.length > 0) ? safeAppend("gone", children[i].className) : "gone";
				}
			}

			if (!findWord("info", children[i].className)) {
				count++;
			}
		}
	}

	el.innerHTML = "Show more";
	el.onclick = function() {
		showLinks(this);
		return false;
	}
}

function toggleSearch(el) {
	var parent = getParent(el, "li");
	if (parent) {
		if (parent.className == "off") {
			parent.className = "on";	// Fix for IE/Win
		} else if (parent.className == "on" || parent.className == "default") {
			parent.className = "off";	// Fix for IE/Win
		} else {
			if (findWord("off", parent.className)) {
				parent.className = replaceWord("off", "on", parent.className);
			} else {
				parent.className = (parent.className.length > 0) ? safeAppend("on", parent.className) : "on";
			}
		}
	}
}

/*-  Splash feature show/hide functionality
----------------------------------------------------------------------*/
function initSplashFeature() {
	var imgPath = "/images/2/";
	var ext = "gif";

	// Which tab are we showing by default? The first tab shows at 8, the second at 12, and the third at 4.
	var time = new Date();
	var hour = time.getHours();
	hour = (hour > 12) ? hour - 12 : hour;

	var def = 0; // Let's default to the first tab.
//	if (hour == 12 || hour < 4) {
//		def = 1; // This is the second tab.
//	} else if (hour >= 4 && hour < 8) {
//		def = 2; // This is the third tab.
//	}

	// Now, let's build the tabs.
	if (document.getElementById && document.getElementsByTagName) {
		var container = document.getElementById("splash-features");
		var features = $("div#splash-features div.feature").get();

		if (container && features) {
			// Build the navigation tabs
			var list = document.createElement("ul");
			list.setAttribute("id", "splash-feature-nav");

			for (var i = 0; i < features.length; i++) {
				var thisId = features[i].getAttribute("id");

				var item = document.createElement("li");
				var anchor = document.createElement("a");
				var img = document.createElement("img");

				img.setAttribute("src", imgPath + "feat-" + thisId + "." + ext);
				img.setAttribute("alt", "");
				anchor.setAttribute("href", "javascript:showFeature('" + thisId + "');");
				anchor.onclick = function() {
					tagSiblings(getParent(this, "ul"), "li", "closed");
					toggleNav(this, "li");
				}

				anchor.appendChild(img);
				item.appendChild(anchor);
				list.appendChild(item);

				if (i == def) {
					toggleNav(anchor, "li");
					item.className = "open";
					showFeature(thisId);
				} else {
					item.className = "closed";
				}
			}

			container.appendChild(list);
		}
	}
}

function showFeature(id) {
	var features = $("div#splash-features div.feature").get();

	for (var i = 0; i < features.length; i++) {
		var thisId = features[i].getAttribute("id");
		if (thisId == id) {
			features[i].className = "feature";
		} else {
			features[i].className = "feature off";
		}
	}
}

function tagSiblings(parent, type, className) {
	var targets = parent.getElementsByTagName(type);
	if (targets) {
		for (var i = 0; i < targets.length; i++) {
			targets[i].className = className;
		}
	}
}

function toggleNav(el, target) {
	var parent = getParent(el, target);

	if (parent) {
		parent.className = (findWord("closed", parent.className)) ? "open" : "closed";
	}
}

/*-  When a user clicks on a text field, any default text should
	be removed.
----------------------------------------------------------------------*/
function initRemoveText() {
	if (document.getElementsByTagName) {
		var inputs = document.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i++) {
			var this_input = inputs[i];
			if (this_input.getAttribute("type") == "text" && this_input.className.match("smart_focus")) {
				this_input.setAttribute("previous", this_input.value);

				this_input.onclick = function() {
					this.value = "";
				}

				this_input.onblur = function() {
					if (this.value.length == 0) {
						this.value = this.getAttribute("previous");
					}
					this.setAttribute("previous", this.value);
				}
			}
		}
	}
}



/*-  Add stripes to all tables with a class of "calendar"
----------------------------------------------------------------------*/
function striped() {
	if (document.getElementsByTagName) {
		var calendars = $("table.calendar").get();

		if (calendars.length > 0) {
			for (var i = 0; i < calendars.length; i++) {
				var rows = calendars[i].getElementsByTagName("tr");
				for (var j = 0; j < rows.length; j++) {
					if ((j % 2) != 0) {
						rows[j].className = safeAppend(rows[j].className, "even");
					}
				}
			}
		}
	}
}


/*-  Monitor the width of the page
----------------------------------------------------------------------*/
function widthMonitor() {
	if (document.getElementById && document.getElementsByTagName) {
		var body = document.getElementsByTagName("body")[0];
		if (!findWord("fixed", body.className)) {
			var docWidth = getBrowserWidth();
			var nav = document.getElementById("navigation");

			if (nav) {
				if (docWidth > 990) {
					nav.className = "full";
				} else if (docWidth <= 990 && docWidth > 903) {
					nav.className = "medium";
				} else if (docWidth <= 903 && docWidth > 800) {
					nav.className = "mini";
				} else if (docWidth <= 800) {
					nav.className = "micro";
				}
			}
			/*
			var diagnostic = document.getElementById("text-size");
			diagnostic.innerHTML = docWidth;
			*/
		}
	}
}


/*-  Column height patch
----------------------------------------------------------------------*/
function sectionColumnFix() {
	if (document.getElementById && document.getElementsByTagName) {
		var body = document.getElementsByTagName("body")[0];

		if (findWord("section-4col", body.className)) {
			var section = document.getElementById("section");
			var modules = document.getElementById("content-secondary");
			if (section.offsetHeight < modules.offsetHeight) {
				section.style.height = (modules.offsetHeight - 8) + "px";
			}
		}
	}
}


/*-  Resize images
----------------------------------------------------------------------*/
/*
function fixImages() {
	if (document.all && document.getElementById && document.getElementsByTagName) {
		var content = document.getElementById("content");
		var imgs = content.getElementsByTagName("img");
		for (var i = 0; i < imgs.length; i++) {
			var parent = getParent(imgs[i], "div");

			if (imgs[i].offsetWidth > parent.offsetWidth) {
				originalWidth = imgs[i].offsetWidth;
				delta = (originalWidth - parent.offsetWidth) / originalWidth;
				newHeight = Math.floor(imgs[i].offsetHeight - (imgs[i].offsetHeight * delta));

				imgs[i].setAttribute("width", parent.offsetWidth);
				imgs[i].setAttribute("height", newHeight);
			}
		}
	}
}
*/

/*-  Utility Functions
----------------------------------------------------------------------*/
/*
	Cross-browser event handlers
*/
function eventastic(el, mode, func, bool) {
	bool = (bool) ? true : false;
	if (el.addEventListener) {
		el.addEventListener(mode, func, bool)
	} else if (el.attachEvent) {
		el.attachEvent("on" + mode, func);
	}
}

/*
	PNG transparency fix
*/
function fnLoadPngs() {
	var rslt = navigator.appVersion.match(/MSIE (\d+\.\d+)/, '');
	var itsAllGood = (rslt != null && Number(rslt[1]) >= 5.5 && Number(rslt[1]) < 7.0);
	for (var i = document.images.length - 1, img = null; (img = document.images[i]); i--) {
		if (itsAllGood && (img.src.match(/\.png$/i) != null) && !img.src.match("/captcha/")) {
			fnFixPng(img);
			img.attachEvent("onpropertychange", fnPropertyChanged);
		}
		img.style.visibility = "visible";
	}
}

function fnPropertyChanged() {
	if (window.event.propertyName == "src") {
		var el = window.event.srcElement;
		if (!el.src.match(/spacer\.gif$/i)) {
			el.filters.item(0).src = el.src;
			el.src = "/images/2/spacer.gif";
		}
	}
}

function fnFixPng(img) {
	var src = img.src;
	img.style.width = img.offsetWidth + "px";
	img.style.height = img.offsetHeight + "px";
	img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')"
	img.src = "/images/2/spacer.gif";
}


/*
	Insert node after referenceNode in parent
*/
function insertAfter(parent, node, referenceNode) {
	parent.insertBefore(node, referenceNode.nextSibling);
}

/*
	Find full word (needle) in a string (haystack)
*/
function findWord(needle, haystack) {
	return haystack.match(needle + "\\b");
}

/*
	Used to replace a word (oldNeedle) with a new word (newNeedle), as found in a string (haystack)
*/
function replaceWord(oldNeedle, newNeedle, haystack) {
	return haystack.replace(new RegExp(oldNeedle + "\\b", "g"), newNeedle);
}

/*
	Smart string concatenation
*/
function safeAppend(target, str) {
	//the next two lines added by NYMag
	if(typeof(target) == "undefined")
		target = "";
	target += (target.length > 0 ? " ": "") + str;
	return target;
}



	/* IE Fix: Son of Suckerfish (modified for IE5/Mac friendliness) */

function ieHover(els) {
	for (var i=0; i < els.length; i++) {
		els[i].onmouseover=function() {
			this.className = safeAppend(this.className, "ie-hover");
		}

		els[i].onmouseout = function() {
			this.className = this.className.replace(new RegExp("( ?|^)ie-hover\\b"), "");
		}
	}
}




/*
	Returns meta content value by name
*/
function getMeta(name) {
	var meta = document.getElementsByTagName("meta");
	for (var i=0; i<meta.length; i++) {
		if (meta[i].name && name && meta[i].name.toLowerCase() == name.toLowerCase()) {
			return meta[i].content;
		}
	}
}

/*
	Cookie functions
*/
// Set the cookie
function setCookie(name, value, days, domain) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = ";expires="+date.toGMTString();
	} else {
		expires = "";
	}
	if(domain) var dom = ";domain="+domain;
	else dom="";
	document.cookie = name+"="+value+expires+dom+";path=/;";
}

function readCookie(name) {
	var needle = name + "=";
	var cookieArray = document.cookie.split(';');
	for(var i=0;i < cookieArray.length;i++) {
		var pair = cookieArray[i];
		while (pair.charAt(0)==' ') {
			pair = pair.substring(1, pair.length);
		}
		if (pair.indexOf(needle) == 0) {
			return pair.substring(needle.length, pair.length);
		}
	}
	return null;
}

/*
	Get Browser Width
*/
function getBrowserWidth() {
	if (window.innerWidth) {
		return window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientWidth != 0) {
		return document.documentElement.clientWidth;
	} else if (document.body) {
		return document.body.clientWidth;
	}
	return 0;
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

/*
	Add Resize Event
*/
function addResizeEvent(func) {
	var oldresize = window.onresize;
	if (typeof window.onresize != 'function') {
		window.onresize = func;
	} else {
		window.onresize = function() {
			oldresize();
			func();
		}
	}
}


/*
	Get parent element
*/
function getParent(el, pTagName) {
	if (el == null) return null;
	else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase())	// Gecko bug, supposed to be uppercase
		return el;
	else
		return getParent(el.parentNode, pTagName);
}


/*
	Get Inner Text
*/
function getInnerText(el) {
	if (typeof el == "string") return el;
	if (typeof el == "undefined") { return el };
	if (el.innerText) return el.innerText;	//Not needed but it is faster
	var str = "";
	
	var cs = el.childNodes;
	var l = cs.length;
	for (var i = 0; i < l; i++) {
		switch (cs[i].nodeType) {
			case 1: //ELEMENT_NODE
				str += getInnerText(cs[i]);
				break;
			case 3:	//TEXT_NODE
				str += cs[i].nodeValue;
				break;
		}
	}
	return str;
}

/*
	Trim function
*/
function trim(str) {
	return str.replace(/^\s*|\s*$/g,"");
}

/*-  Show a send to phone element
----------------------------------------------------------------------*/
function show_send_to_phone(id) {
	var nyml_id = id;
	var element_name = "send_to_phone_" + nyml_id;
		var element = document.getElementById(element_name);

	if (element == null) {
		return;
	}

	// if this is visible, hide it
	if(element.style && element.style.display == 'block') {
		element.style.display = 'none';
		// reset global var that stores open send-to-phone box name
		visible_send_to_phone_name = 'undefined';
		return;
	}

	// make this box visible
	if(element.style && element.style.display != undefined) {

		// if there is another send-phone is open - close it (this uses a
		// global variable that is set elsewhere (search results template, for
		// example)
		if (visible_send_to_phone_name != 'undefined') {

				var open_box = document.getElementById(visible_send_to_phone_name);
			if(open_box.style && open_box.style.display == 'block') {
				open_box.style.display = 'none';
			}
		}

		element.style.display = 'block';
		// update global var that stores open send-to-phone box name
		visible_send_to_phone_name = element_name;
	}
}

/*-  Show a sent to phone element
----------------------------------------------------------------------*/
function show_sent_to_phone(id) {
	var nyml_id = id;
	var element_name = "sent_to_phone_" + nyml_id;
		var element = document.getElementById(element_name);

	if (element == null) {
		return;
	}

	// if this is visible, hide it
	if(element.style && element.style.display == 'block') {
		element.style.display = 'none';
		// reset global var that stores open send-to-phone box name
		visible_send_to_phone_name = 'undefined';
		return;
	}

	// make this box visible
	if(element.style && element.style.display != undefined) {

		// if there is another send-to-phone open - close it (this uses a
		// global variable that is set elsewhere (search results template, for
		// example)
		if (visible_send_to_phone_name != 'undefined') {

				var open_box = document.getElementById(visible_send_to_phone_name);
			if(open_box.style && open_box.style.display == 'block') {
				open_box.style.display = 'none';
			}
		}

		element.style.display = 'block';
		// update global var that stores open send-to-phone box name
		visible_send_to_phone_name = element_name;
	}
}


/*-  Send to phone using form values
----------------------------------------------------------------------*/
function send_to_phone(id, slug) {
	var nyml_id = id;
	// kill the html page in the slug, and leve the directory only
	slug = slug.replace(/\/\w+\.html$/,'');
	// now erase anything before the last slash to leave us with dir name only
	slug = slug.replace(/^.*\//,'');
	var form_name = "text_message_" + nyml_id;

	// do not do anything unless terms have been accepted
	if (document.forms[form_name].elements['terms'].checked == false) {
		alert("You must accept Terms and Conditions");
		return;
	}

	// verify phone format (simple)
	if ( document.forms[form_name].elements['areacode'].value.length < 3) {
		alert('Area code must be at least 3 digits long');
		return;
	}
	if ( document.forms[form_name].elements['prefix'].value.length < 3) {
		alert('Prefix must be at least 3 digits long');
		return;
	}
	if ( document.forms[form_name].elements['suffix'].value.length < 4) {
		alert('Suffix must be at least 4 digits long');
		return;
	}

	if ( document.forms[form_name].elements['areacode'].value.match(/\D/) ) {
		alert('Area code must be numeric');
		return;
	}
	if ( document.forms[form_name].elements['prefix'].value.match(/\D/) ) {
		alert('Prefix must be numeric');
		return;
	}
	if ( document.forms[form_name].elements['suffix'].value.match(/\D/) ) {
		alert('Suffix must be numeric');
		return;
	}

	var phone_to_send_to
		= document.forms[form_name].elements['areacode'].value
		+ document.forms[form_name].elements['prefix'].value
		+ document.forms[form_name].elements['suffix'].value;

	var target_url
		= 'http://juicewireless.com/nymag/txt_mobile.php?client=nymag&m0='
		+ phone_to_send_to
		+ '&slug=' + escape(slug);

	window.location = '/search/send_to_phone.cgi?t=' + escape(target_url);

	show_sent_to_phone(id);
}

/* 
	Dropdown redirects moved from dropdown.js
*/

function MM_jumpMenu(targ,selObj,restore){ //v3.0
  eval(targ+".location='"+selObj.options[selObj.selectedIndex].value+"'");
  if (restore) selObj.selectedIndex=0;
}
