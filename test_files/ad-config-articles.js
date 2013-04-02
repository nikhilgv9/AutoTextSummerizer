var ratio_300x250 = 60; // percentage for rectangles
var ratio_300x600 = 20; // percentage for half pages
var ratio_160x600 = 0; // percentage for skyscraper
var ratio_opa = 20; // percentage for opa ads

var opa_ad_size = "336x850"; //defines the size of opa ads. Could be either 336x700 or 336x850
var hide_728x90_with_opa = true; // if set to true the 728x90 banner ad will be hidden when an opa is served
var hide_260x60_with_opa = false; // if set to true the 260x60 masthead ad will be hidden when an opa ad is served. 
var hide_all_modules_with_opa = true; //if set to true all modules in right column are hidden

var default_layout = "magpromo,mostemailed"; //no spaces, default modules that are show when flex template is in use. works on id containers

//var fixed_right_column = true;  // disable right column magic and init adArray with default layout
var double_rectangles = true;  // serve extra rectangle on article pages

var fixedtarget = [
				   
['/arts/cultureawards/2006/25317','160x600,magpromo,FIXED'],
['arts/cultureawards/2006/25309','160x600,magpromo,FIXED'],
['guides/everything/shoes/27345','160x600,FIXED,magpromo'],
['guides/halloween/extra160/22289','160x600,FIXED,magpromo'],
['guides/halloween/extra160/22290','160x600,FIXED,magpromo'],
['guides/holidays/gifts/24411','160x600,magpromo'],
['news/features/2007/cancer/32123','160x600,magpromo,FIXED'],
['news/features/27341/index7.html','160x600,FIXED,magpromo'],
['news/features/27845/index2.html','160x600,FIXED,magpromo'],
['news/intelligencer/27854','160x600,FIXED,magpromo'],
['news/people/18842/index4.html','160x600,magpromo'],
['news/people/31541','160x600,magpromo'],
['nightlife/partylines','160x600,FIXED'],
['realestate/features/21339/index1.html','160x600,magpromo'],
['realestate/map/25311/','160x600,magpromo'],
['restaurants/features/31268/index1.html','160x600,magpromo'],
['shopping/articles/sb','160x600,magpromo'],
['/special_wide_feature/','160x600,FIXED'], // Default category for setting an article to use a tower ad. 
['/fashion/fashionshows/seasons/2008/paris-wrtw/', '160x600,FIXED'],
['weddings','160x600,FIXED']
];

function showDefaultFlexModules(){
	$("div.modBlock").css("display","none");
	var defaultModules = fixed_targeting ? modBlocks : default_layout.split(",");

	for (var i=0; i < defaultModules.length; i++) {
		var selector = '#' + defaultModules[i];
		$(selector).show();
	}
	
	if (hide_all_modules_with_opa && opa_ad_served){
		$("div.modBlock").css("display","none");
	}
}

function changeClass(){
	if($("body").length) $("body").removeClass("fixed_right_column").addClass("ad-column-180");
	else timer = setTimeout(changeClass, 10);
}

var fixed_targeting = false;
var currenturl = document.location.href;
var adSize="";
for (var i=0; i < fixedtarget.length; i++) {
	var pattern = fixedtarget[i][0];
	if (!fixed_targeting && currenturl.match(pattern)) {
		targetString = fixedtarget[i][1];
		fixed_targeting = true;
		adSize = fixedtarget[i][1].split(",")[0];
		var modBlocks = targetString.split(",");
		rightColadSize = modBlocks[0];
	} 
}


if(fixed_targeting && adSize == "160x600"){
	$(document).ready(function() {
		changeClass();
	});
	
}