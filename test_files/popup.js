addLoadEvent(prepareGalleryAnchors);

function prepareGalleryAnchors() {

var links = document.getElementsByTagName("a");
  for (var j=0; j<links.length; j++) {
	var link_class = links[j].className;
	var description = "opens in new window";
	if (link_class.match("popup")) {
		links[j].setAttribute("title", description);
		links[j].onclick = function() {
		popup(this.getAttribute("href")) 
		return false;
		}
	} if (link_class.match("smallPopup")) {
		links[j].setAttribute("title", description);
		links[j].onclick = function() {
		smallPopup(this.getAttribute("href")) 
		return false; 
		}
	} if (link_class.match("bigPopup")) {
		links[j].setAttribute("title", description);
		links[j].onclick = function() {
		bigPopup(this.getAttribute("href")) 
		return false; 
		}
	} if (link_class.match("biggerPopup")) {
		links[j].setAttribute("title", description);		
		links[j].onclick = function() {
		biggerPopup(this.getAttribute("href")) 
		return false;
		}
	} if (link_class.match("popupWideTall")) {
		links[j].setAttribute("title", description);
		links[j].onclick = function() {
		popupWideTall(this.getAttribute("href"))
		return false;
		}
	} if (link_class.match("popupscroll")) {
		links[j].setAttribute("title", description);
		links[j].onclick = function() {
		popupscroll(this.getAttribute("href")) 
		return false; 
		}
	}
  }
 $('a[href*=".pdf"]').addClass("pdf");
 
}

function triggerSlideshow(el){
	if ($(el).hasClass("slideshow_popup") || $(el).hasClass("popup")) {
		slideshow_popup(el.getAttribute("href"));
	}
	else if ($(el).hasClass("pdf")) {
		pdfPopup(el.getAttribute("href"));
	}
	else {
		open_url(el.getAttribute("href"));
	}
}


function pdfPopup(winURL) {
  window.open(winURL); 
}

function slideshow_popup(winURL) {
  window.open(winURL,"slideshow_popup","width=740,height=640, top=10, left=25"); 
}

function bigPopup(winURL) {
  window.open(winURL,"bigpopup","width=740,height=640, top=10, left=25"); 
}

function smallPopup(winURL) {
  window.open(winURL,"smallpopup","width=750,height=600, top=10, left=25"); 
}

function popup(winURL) {
  window.open(winURL,"popup","width=740,height=620, scrollbars=no, top=10, left=25"); 
}

function popupscroll(winURL) {
  window.open(winURL,"popup","width=740,height=620, scrollbars=yes, top=10, left=25"); 
}

function biggerPopup(winURL) {
  window.open(winURL,"biggerpopup","width=740,height=660, top=10, left=25"); 
}

function popupWideTall(winURL) {
  window.open(winURL,"popupWideTall","width=900,height=650, top=10, left=25"); 
}

function open_url(url) {
  window.open(url, "_self");
}
