// JavaScript Document

// Display an appropriate article bottom block based on URL logic.

// default block div id
var ab_default_block_id = "news";

// Path-block mapping, grouped by block div id. A path that begins with a pattern will match.
// One block will be selected based on the pattern length (a longer pattern considered more
// specific).
var ab_config = {
	"culture": [
		"/arts/",
		"/movies/"  // no comma at the end of the last item
	],

	"services": [
		"/restaurants/",
		"/listings/restaurant/",
		"/listings/bar/",
		"/shopping/",
		"/fashion/",
		"/nightlife/",
		"/bestofny/"  // no comma at the end of the last item
	],

	/*
		"fashion-footer": [
			"/listings/stores/",
			"/listings/beauty/" // no comma at the end of the last item
		],
	*/

	"news": [
		"/news/",
		"/realestate/",
		"/travel/",
		"/family/kids",
		"/guides/",
		"/homedesign/"  // no comma at the end of the last item
	]  // no comma at the end of the last item
};

// Ignore above rules - the default block will be displayed.
// Whole path will be compared with these patterns.
var ab_config_exclusions = [
//	"/test/article/",
//	"/test/article2/"  // no comma at the end of the last item
];

var ab_excluded = false;
var ab_matched_rule = {};

//
// FIXME: remove the following 3 lines + replace "mywindow" with "window"
//
//var mypathname = { "pathname": unescape(window.location.search) };
//mypathname.pathname = mypathname.pathname.replace(/\?testpath=/, "");
//alert("Pathname: " + mypathname);
//var mywindow = { "location": mypathname };
//alert(window.location);

for (var i in ab_config_exclusions) {
	if (window.location.pathname == ab_config_exclusions[i]) {
		ab_excluded = true;
	}
}

if (!ab_excluded) {
	for (var section in ab_config) {
		for (var i in ab_config[section]) {
			var url = ab_config[section][i];
			if (url) {
				if (window.location.pathname.match(new RegExp("^" + url, "i"))) {
					if (!ab_matched_rule.url || url.length > ab_matched_rule.url.length) {
						ab_matched_rule = { "section": section, "url": url };
					}
				}
			}
		}
	}
}

var ab_block_id = ab_matched_rule.section ? ab_matched_rule.section : ab_default_block_id;
var ab_block = document.getElementById(ab_block_id);
if (ab_block) {
	ab_block.style.display = "block";
}

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


initTabbedModule("mostpopular");
