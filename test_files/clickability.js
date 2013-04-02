/* Copyright 2000-2004 Clickability Inc.  */
/* Clickability ButtonServer v4.01         */

document.write('<script language="JavaScript"> \n');
document.write('window.onerror=function(){clickURL=document.location.href;return true;} \n');
document.write('if(!self.clickURL) clickURL=parent.location.href; \n');
document.write('<\/script> \n');

var partnerID=nymag.domains.domain.match("vulture.com") ? 1088742 : 73272;
var custom=1;
var popWin="width=510,height=480,resizable=1,scrollbars=1";
var commonLoc="&fb=Y&url="+escape(getClickURL())+"&title="+escape(getClickTitle())+"&random="+Math.random()+"&partnerID="+partnerID+"&expire="+escape(getClickExpire());

var inpop  = ( (document.domain.indexOf("printthis.clickability.com")>-1)?true:false);
var _b=new Image();
var clickRan=Math.random();
var clickFac = 1;
if(clickFac==0)clickFac=1;
if(!inpop && clickRan>(1-(1/clickFac))){
    var _ti=900;
    var _qb='http://s.clickability.com/s?';
    _qb+="&7="+partnerID;
    _qb+="&8="+escape(getClickURL());
    _qb+="&10="+escape(getClickTitle());
    _qb+="&19="+_ti;
    _qb+="&21="+clickFac;
    _qb+="&18="+Math.random();
    _b.src=_qb;

}

/****************Don't Change Below****************/
var IMG="http://a449.g.akamai.net/f/449/1776/1d/button.clickability.com/img/com/";
var stT, etT, ptT, mpT, altST, altET, altPT, altMP, altIR, altIR, textWrap, iCol, tCol;
var spons, sponLoc, sponIntro, sponCol, sponTagTop, sponTagBot, sponFunc;
var bLay=new Array(), sponLay=new Array();

/*Functions*/
function ST () {
	window.open('http://www.savethis.clickability.com/st/saveThisApp?clickMap=saveThis'+commonLoc,'click',popWin);
	return false;
}

function STMouseOver () {
	window.status='SAVE THIS';
	return true;
}

function STMouseOut () {
	window.status='';
	return true;
}
function ET () {
	window.open('http://www.emailthis.clickability.com/et/emailThis?clickMap=create'+commonLoc+'&summary='+escape(getClickSummary())+'&image='+escape(getClickImage()),'click',popWin);
	return false;
}

function ETMouseOver () {
	window.status='EMAIL THIS';
	return true;
}

function ETMouseOut () {
	window.status='';
	return true;
}
function PT () {
    //Logic for if we're on an article we should print
	if(document.location.href.match("/daily/") || document.location.href.match("grubstreet")) window.open('http://www.printthis.clickability.com/pt/printThis?clickMap=printThis'+commonLoc,'click',popWin);
	else document.location = nymag.domains.domain + "/print/?" + document.location.pathname;
	return false;
}

function PTMouseOver () {
	window.status='PRINT THIS';
	return true;
}

function PTMouseOut () {
	window.status='';
	return true;
}
function MP () {
		window.open('http://www.emailthis.clickability.com/et/emailThis?clickMap=topTen&fb=Y&MPbut=Y&popularType=1&partnerID='+partnerID,'click',popWin);
		return false;
}

function MPMouseOver () {
	window.status='MOST POPULAR';
	return true;
}

function MPMouseOut () {
	window.status='';
	return true;
}


function IR () {
	window.open('http://imware.clickability.com/imware/imware?action=rss.feeds&button=Y&destID='+partnerID,'click',popWin);
	return false;
}

function IRMouseOver () {
	window.status='RSS FEEDS';
	return true;
}

function IRMouseOut () {
	window.status='';
	return true;
}


function drawBtn(type,text) {
	if(type=='h' || type =='H') type='h';
	if(type=='v' || type =='V') type='v';
	var i=bLay.length;
	sponLay[i]=sponTagBot;
	bLay[i]="";

		if (!textWrap) {
		var sIconImg=IMG+iCol+"/"+type+"-s-icon-l.gif";
		var sTextImg=IMG+tCol+"/"+type+"-s-text-l.gif";
		var eIconImg=IMG+iCol+"/"+type+"-e-icon-l.gif";
		var eTextImg=IMG+tCol+"/"+type+"-e-text-l.gif"; 
		var pIconImg=IMG+iCol+"/"+type+"-p-icon-l.gif";
		var pTextImg=IMG+tCol+"/"+type+"-p-text-l.gif";
		var mpIconImg=IMG+iCol+"/"+type+"-mp-icon-l.gif";
		var mpTextImg=IMG+tCol+"/"+type+"-mp-text-l.gif";
		var irIconImg=IMG+iCol+"/"+type+"-ir-icon-l.gif";
		var irTextImg=IMG+tCol+"/"+type+"-ir-text-l.gif";
		if (type=='h') {
			var iconHeight=18,sIconWidth=34,eIconWidth=30,pIconWidth=31,sTextWidth=50,eTextWidth=56,pTextWidth=55,mpIconWidth=30,mpTextWidth=77,irIconWidth=30,irTextWidth=77;
		}
		else {
			var iconHeight=23,sIconWidth=35,eIconWidth=35,pIconWidth=35,sTextWidth=55,eTextWidth=55,pTextWidth=55,mpIconWidth=35,mpTextWidth=77,irIconWidth=30,irTextWidth=77;
		}
	
	}
		
		if (textWrap) {
		var sIconImg=IMG+iCol+"/"+type+"-s-icon-s.gif";
		var sTextImg=IMG+tCol+"/"+type+"-s-text-s.gif";
		var eIconImg=IMG+iCol+"/"+type+"-e-icon-s.gif";
		var eTextImg=IMG+tCol+"/"+type+"-e-text-s.gif"; 
		var pIconImg=IMG+iCol+"/"+type+"-p-icon-s.gif";
		var pTextImg=IMG+tCol+"/"+type+"-p-text-s.gif";
		var mpIconImg=IMG+iCol+"/"+type+"-mp-icon-s.gif";
		var mpTextImg=IMG+tCol+"/"+type+"-mp-text-s.gif";
		var irIconImg=IMG+iCol+"/"+type+"-ir-icon-s.gif";
		var irTextImg=IMG+tCol+"/"+type+"-ir-text-s.gif";
		if (type=='h') {
			var iconHeight=24,sIconWidth=35,eIconWidth=30,pIconWidth=32,sTextWidth=30,eTextWidth=34,pTextWidth=31,mpIconWidth=31,mpTextWidth=53,irIconWidth=31,irTextWidth=53;
		}
		else {
			var iconHeight=32,sIconWidth=35,eIconWidth=35,pIconWidth=35,sTextWidth=32,eTextWidth=32,pTextWidth=32,mpIconWidth=35,mpTextWidth=50,irIconWidth=35,irTextWidth=50;
		}
	}
		
		if (spons) {
		if (type=='h') {
			if (sponLoc=="top") {
				document.write('<table><tr><td align="right"><table><tr><td><font size="1" face="Arial,Helvetica" color="#000000">'+sponIntro+'</font> </td><td>');
				eval(sponTagTop);
				document.write('</td></tr></table></td></tr><tr><td>');	
			}
			else {
				document.write('<table><tr><td>');	
			}
		}
	}
		
	if (type=='h') document.write('<nobr>');
	
		if (stT) {
		if (type=='v') bLay[i]+="<div>";
		bLay[i]+="<A HREF=\"#\" ONCLICK=\"return(ST());\" onMouseOver=\"return(STMouseOver());\" onMouseOut=\"return(STMouseOut());\">";
		bLay[i]+="<IMG src=\""+sIconImg+"\" width=\""+sIconWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altST+"\" title=\""+altST+"\">";
		if (text) bLay[i]+="<IMG src=\""+sTextImg+"\" width=\""+sTextWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altST+"\" title=\""+altST+"\">";
		if (type=='h') bLay[i]+="</a>&nbsp;&nbsp;";
		if (type=='v') bLay[i]+="</a></div>";
	}
			if (etT) {
		if (type=='v') bLay[i]+="<div>";
		bLay[i]+="<A HREF=\"#\" ONCLICK=\"return(ET());\" onMouseOver=\"return(ETMouseOver());\" onMouseOut=\"return(ETMouseOut());\">";
		bLay[i]+="<IMG src=\""+eIconImg+"\" width=\""+eIconWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altET+"\" title=\""+altET+"\">";
		if (text) bLay[i]+="<IMG src=\""+eTextImg+"\" width=\""+eTextWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altET+"\" title=\""+altET+"\">";
		if (type=='h') bLay[i]+="</a>&nbsp;&nbsp;";
		if (type=='v') bLay[i]+="</a></div>";		
	}
			if (ptT) {
		if (type=='v') bLay[i]+="<div>";
		bLay[i]+="<A HREF=\"#\" ONCLICK=\"return(PT());\" onMouseOver=\"return(PTMouseOver());\" onMouseOut=\"return(PTMouseOut());\">";
		bLay[i]+="<IMG src=\""+pIconImg+"\" width=\""+pIconWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altPT+"\" title=\""+altPT+"\">";
		if (text) bLay[i]+="<IMG src=\""+pTextImg+"\" width=\""+pTextWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altPT+"\" title=\""+altPT+"\">";
		if (type=='h') bLay[i]+="</a>&nbsp;&nbsp;";
		if (type=='v') bLay[i]+="</a></div>";
	}
			if (mpT) {
		if (type=='v') bLay[i]+="<div>";
		bLay[i]+="<A HREF=\"#\" ONCLICK=\"return(MP());\" onMouseOver=\"return(MPMouseOver());\" onMouseOut=\"return(MPMouseOut());\">";
		bLay[i]+="<IMG src=\""+mpIconImg+"\" width=\""+mpIconWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altMP+"\" title=\""+altMP+"\">";
		if (text) bLay[i]+="<IMG src=\""+mpTextImg+"\" width=\""+mpTextWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altMP+"\" title=\""+altMP+"\">";
		if (type=='h') bLay[i]+="</a>&nbsp;&nbsp;";
		if (type=='v') bLay[i]+="</a></div>";
	}
			if (irT) {
		if (type=='v') bLay[i]+="<div>";
		bLay[i]+="<A HREF=\"#\" ONCLICK=\"return(IR());\" onMouseOver=\"return(IRMouseOver());\" onMouseOut=\"return(IRMouseOut());\">";
		bLay[i]+="<IMG src=\""+irIconImg+"\" width=\""+irIconWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altIR+"\" title=\""+altIR+"\">";
		if (text) bLay[i]+="<IMG src=\""+irTextImg+"\" width=\""+irTextWidth+"\" height=\""+iconHeight+"\" border=\"0\" alt=\""+altIR+"\" title=\""+altIR+"\">";
		if (type=='h') bLay[i]+="</a>&nbsp;&nbsp;";
		if (type=='v') bLay[i]+="</a></div>";
	}
	
	document.write(bLay[i]);
	if (type=='h') document.write('</nobr>');
	
		if (spons) {
		if (sponLoc=="top") {
			document.write('</td></tr></table>');	
		}
		else if (type=='h') {
			document.write('</td><td valign="top">');
			if (sponIntro && sponIntro != ' ') document.write('<font size="1" face="Arial,Helvetica" color="#000000">'+sponIntro+'</font><br>');
			eval(sponTagTop);
			document.write('</td></tr></table>');	
		}
		else {
			document.write('<div><table><tr><td> ');
			if (sponIntro && sponIntro != ' ') document.write('<font size="1" face="Arial,Helvetica" color="#000000">'+sponIntro+'</font><br> ');
			eval(sponTagTop);
			document.write('</td></tr></table></div>');
		}
	}
	}
function initBtn() {
	var a=initBtn.arguments;
	stT=a[0]; etT=a[1]; ptT=a[2]; mpT=a[3]; irT=a[4]
	textWrap=a[5]; iCol=a[6]; tCol=a[7];
}
function initSponsor() {
	var a=initSponsor.arguments;
	spons=a[0]; sponLoc=a[1]; sponIntro=a[2]; sponCol=a[3]; sponTagTop=a[4]; sponTagBot=a[5]; sponFunc=a[6];
}
function initAlt(s,e,p,m,i) {
	altST = (s) ? "Save a link to this article and return to it at www.savethis.com":"";
	altET = (e) ? "Email a link to this article":"";
	altPT = (p) ? "Printer-friendly version of this article":"";
	altMP = (m) ? "View a list of the most popular articles on our site":"";
	altIR = (i) ? "Get RSS feeds of the most popular articles on our site":"";
}
function btnDone() {
	for (i=0;i<sponLay.length;i++) {
		if (sponLay[i]) eval(sponLay[i]);
	}
}


function getClickURL() {
	var url = document.getElementById("canonical");
	if (url) {
		url = url.href;
		return url;
	} else {
		var url = self.clickURL || document.location.href;
		url = url.replace(/\?.*/, "");
		return url.replace(/[&?]$/, "");
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

function getMetaOg(prop) {
	var meta = document.getElementsByTagName("meta");
	for (var i=0; i<meta.length; i++) {
		var property = $(meta[i]).attr("property");
		if (prop == property) {
			return meta[i].content;
		}
	}
}



var utility = {
	// Converting Unicode characters to HTML entities
	symbolsToEntities : function(str) {
		var newstr = "";
		for (i=0; i<str.length; i++) {
			var code = str.charCodeAt(i);
			newstr += (code > 256? "&#" + code + ";": str.charAt(i));
		}
		return newstr;
	}
}



function getClickTitle() {

	var title = getMetaOg("og:title");
	
	if (!title) {
		title = getMeta("headline");
	}	

	if (!title) {
		title = document.title.replace(/(.*?)\s*(\-\-?\s*)?new york magazine\s*$/i, "$1");
	}

	title = title.replace(/^\s*|\s*$/g, "");
	
	var safeTitle;
	
	try{
		//try and convert to html entity
		safeTitle = utility.symbolsToEntities(title);
	  }catch(e){
	  	//if fail, return un-altered title
	  	safeTitle = title;
		}
	return safeTitle;
}

function getClickExpire() {
	if (self.clickExpire) return clickExpire; 
	return "";
}


function getClickSummary() {
	if (self.clickSummary) return clickSummary;
	return "";
}

function getClickImage() {
	if (self.clickImage) return clickImage; 
	return "";
}


window.onresize = function () {
    for (var i=0; i<document.links.length; i++) {
        document.links[i].onclick = document.links[i].onclick;
    }
}

if (!custom && !inpop) {
            
            
            
            
        
	initBtn(1,1,1,0,0,0,'990000','000000');
	
	initSponsor(0,'right',' ','000000',' ',' ',' ');
	
	initAlt(1,1,1,1,1);
	
	eval(sponFunc);
	
	drawBtn('H',1);
}
