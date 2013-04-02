/*
 * jQuery Print Preview Plugin v1.0.1
 *
 * Copyright 2011, Tim Connell
 * Licensed under the GPL Version 2 license
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Date: Wed Jan 25 00:00:00 2012 -000
 *
 * Appropriated and adapted by Viktoriya Veremeeva and Matt Ruby, New York Media 2012
 */
 
(function($) { 

	// Initialization
    $.fn.printPreview = function() {
        this.each(function() {
            $(this).bind('click', function(e) {
                e.preventDefault();
                if (!$('#print-modal').length) {
					$.printPreview.loadPrintPreview();
                }
            });
        });
        return this;
    };
    
    // Private functions
    var mask, size, print_modal, print_controls;
    $.printPreview = {
		loadPrintPreview: function() {
			
			// Load mask
			$.printPreview.loadMask();
			
            print_modal = $('<div id="print-modal"></div>');
            print_font_size =	'<div id="text-size"><ul><li class=""><span class="label">Text Size:</span><ul><li id="txt-small" class="">'+
								'<a href="javascript:textItPrint(\'txt-small\');" class="print-font-size" title="Make the story text small.">A</a></li><li id="txt-medium" class="current">'+
								'<a href="javascript:textItPrint(\'txt-medium\');" class="print-font-size" title="Make the story text medium.">A</a></li><li id="txt-large" class="">'+ 
								'<a href="javascript:textItPrint(\'txt-large\');" class="print-font-size" title="Make the story text large.">A</a></li></ul></li></ul></div>';
            print_controls =	$('<div id="print-modal-controls">' + 
								'<a href="#" class="print" title="Print page">Print</a>' + 
								'<a href="#" class="close" title="Close print preview">Close</a>' +
								'</div>').hide();                  

			var print_frame = $('<div id="print-modal-content"></div>');

			print_modal
				.hide()
				.append(print_controls)
                .append(print_frame)
                .appendTo('body');

            // add All content
            $.printPreview.appendContent();  
                             
            // Disable all links
			$('#print-modal-content').bind('click', 'a', function(e) {
				e.preventDefault();
				return false;
			});
  

			$("#print-modal-content").append('<style type="text/css" media="print">' +
				'#print-modal { height:auto !important; background: #fff; box-shadow: none;}' +
				'html { height: auto; overflow-y: visible; }' +
				'body { overflow-y: visible; height: auto; }' +
				'#print-modal-mask { display: none !important; }' +
				'#wrap { display: none !important }' + 
				'#print-modal { height:auto !important; top: 0px !important; position: absolute !important; overflow-y:visible; }' +  
				'#print-modal-controls { display: none !important; }' +
				'#print-modal #story p { width: 100%; height:auto; }' +
				'#print-modal-content { margin: 0; }' +
                '</style>'
			);

            // Disable scrolling
			$('body').css({overflowY: 'hidden', height: '100%'});
                    
            // Position modal            
            starting_position = $(window).height() + $(window).scrollTop();
            // temp
			var css = {
				top:         starting_position,
				height:      '100%',
				overflowY:   'auto',
				zIndex:      10000,
				display:     'block'
			}
			
            print_modal.css(css);

            print_controls.fadeIn('slow').focus();

            $("#print-modal").css({
				position: 'fixed',
				top: '0px'
			});
            var currentPagePrint = document.location.hash;
            if (currentPagePrint.indexOf("print") == -1) {
               document.location.hash = "print";
            }
           
            parentEl = document.getElementById("print-modal-content");  
            heightOfContent = getElementsByClass("main_test",parentEl,"div")[0].scrollHeight;
           
            if ($.browser.msie ) {
				$('head').append('<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />');
            } else {
				print_frame.height(heightOfContent);
            }
            // Bind closure
			$('a', print_controls).bind('click', function(e) {
				if ($(this).hasClass('print-font-size')) {
				
				} else {
					e.preventDefault();
					if ( $(this).hasClass('print') ) {
						window.print();
					} else {
						$.printPreview.destroyPrintPreview();
					}
				}
            });
         
        },
        
        appendContent: function() {        

			var b64Logo = '<img border="0" title="New York" alt="New York Magazine" src="data:image/jpg;base64,R0lGODdhUwAUAPQQAJGPj56dnWhlZiMfINbV1bq5uYSBglpXWDEtLj87PExJSqyrq8jHx3ZzdPHx8f///+Pj4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAUwAUAAAF/+AjjmRpnmiqrmwrFkAcQ6djHIbLyAsJyQCX8CQojAKDXolwADQEQmTDxBg0aMOsyFAwPgrWkkPg0D4QwRIEatYGBATRE1G6tgUHE7nNl4O9Dz8OMQwBAASED4Y9MAFHdCQBRgUGMSI7MVyBMQuDAIBaBT0JU1tlAGyceQ8LAyIQqyIEA3EiYw8NDac5Dwo9DgM0BlAOBwx9pQADZQ6lAo40DAyryiIAWCMDjnI/CiMMCYHLIrS9BQS6fRC8DmiKtcFrl97SrjYmB6WF7ceXrgurcokLUAoZNgAIbn1JgKqgqynLrpkAEO7WgnAjAOQRIMAAgn4BEAjAyAdCwQftGvBsa5CDgZEyAxj0OEDpRJUfcTSSYPggGD8Rz9opWeGAQZk6R4/EFJGg3wNEPUsdOADhh8RsBngBHHHRQQGMTsjRCEAyBawDbLhuK5GPFSRECXspabIAgINm2BQkONouDjgCY0r1RXJUwVoUAYzWksXLBAQ0QGJ4GXqusbERDZwGyhqgTF0A/T4D2EYAweIHhUgsAPX0QFITBeKyCICts6w0fdwuBrBg6IPLmwy8PrFAwesFaTMOR5ku94um33w7eCPgkIviSR0s0Iz6MMoDp53bqG7JOeoDQ5uT0PQCjvn3LBZUMhCeawMnvuHr38+/RAgAOw==" />';
			var $nymag_top_logo = '<h1 class="nymag-logo"><a href="http://nymag.com">' + b64Logo + '</a></h1>';

			$("#print-modal-content").append("<div id='content' class='iframe_content_display'><div id='content-primary'><div class='main_test' id='main'></div></div></div>");
        
			$("#print-modal-content #main").append($nymag_top_logo);
			var realURL = "";
			if (document.location.href.indexOf("#") == -1) {
				realURL =  document.location.href.substring(0);
			}  else {
				realURL = document.location.href.substring(0, document.location.href.indexOf("#") );
			}

			var urlPath = realURL.match(/index.[0-9]*\.html/) ? realURL.substring(0,realURL.indexOf("index")) : realURL;

			var pgNum = 0;
			var numPages = 0;

			var finished = false;

			function getPage(pgNum){

				if(finished == false) {
					
					var fullURL = (pgNum == 0) ? urlPath : urlPath+"index"+pgNum+".html";

					$.ajax({
						type: "GET",
						url: fullURL,
						dataType: "html",
						mimeType: 'text/xml; charset=iso-8859-1',
						success:function(d) {
							
							if(pgNum==0){
								var $iframe_story_header =  $(d).find('.header-spacing > *:not(#narrow-bubble):not(#ck_sharethis_top):not(script)').clone();
								$("#print-modal-content #main").append($iframe_story_header);
								$("#print-modal-content #main").append("<div id='story'></div>");
								$("#print-modal-content #main > #story").append("<div class='nextpage"+pgNum+"'></div>");
							} else {
								$("#print-modal-content #main > #story").append("<div class='nextpage"+pgNum+"'></div>");
							}
							var pageText = d.toString().substring(d.toString().search("<div id=\"story\">")+16,
							d.toString().search('\<\/div\>\<\!-- \/end \#story --\>')).replace(/\n/g,"");
				
							$('.nextpage'+pgNum).append('<div style="clear:both;padding-top:10px;">'+pageText+'</div>');
							$("#print-modal-content").css({height: "auto"});
							
							
							
						},
						complete: function() {
							getPage(pgNum+1);
						},
						error: function(jqXHR, textStatus, errorThrown) {
							finished = true;
						},
						statusCode: {
						    404: function() {
								finished = true;
						    }
						}
					});
				
				}
				
			} // END getPage()
	
			getPage(0);

//			return true;
        },
        
        destroyPrintPreview: function() {
	
			document.location.hash = '';			
            print_controls.fadeOut(100);

            print_modal.animate({
	//			top: $(window).scrollTop() - $(window).height(),	// ANIMATE THE PRINT SCROLLTOP
				opacity: 0											// ANIMATE THE PRINT OPACITY
			}, 400, 'linear', function(){
                print_modal.remove();
                $('body').css({
					overflowY: 'auto',
					height: 'auto'
				});
            });

            mask.fadeOut('slow', function()  {
                mask.remove();
            });             

			

            $(document).unbind("keydown.printPreview.mask");
            mask.unbind("click.printPreview.mask");
            $(window).unbind("resize.printPreview.mask");
        },
        
        /* -- Mask Functions --*/
        loadMask: function() {
            size = $.printPreview.sizeUpMask();
            mask = $('<div id="print-modal-mask" />').appendTo($('body'));
            mask.css({              
                width:              size[0],
                height:             size[1],
                display:            'none',
                opacity:            0,                          
            });
    
			mask.fadeIn('slow');
            mask.css({
				display: 'block'
			}).fadeTo('400', 0.75);
            
            $(window).bind("resize.printPreview.mask", function() {
                $.printPreview.updateMaskSize();
            });
            
            mask.bind("click.printPreview.mask", function(e)  {
                $.printPreview.destroyPrintPreview();
            });
            
            $(document).bind("keydown.printPreview.mask", function(e) {
                if (e.keyCode == 27) {
					$.printPreview.destroyPrintPreview();
				}
            });
        },
    
        sizeUpMask: function() {
            if ($.browser.msie) {
                // if there are no scrollbars then use window.height
                var d = $(document).height(), w = $(window).height();
                return [
                    window.innerWidth ||                        // ie7+
                    document.documentElement.clientWidth ||     // ie6  
                    document.body.clientWidth,                  // ie6 quirks mode
                    d - w < 20 ? w : d
                ];
            } else { return [$(document).width(), $(document).height()]; }
        },
    
        updateMaskSize: function() {
            var size = $.printPreview.sizeUpMask();
            mask.css({width: size[0], height: size[1]});
        }
    }

    
})(jQuery);


function textItPrint(str) {
	var wrap = document.getElementById("print-modal");
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

function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
		if ( tag == null )
		tag = '*';
  var els = node.getElementsByTagName(tag);
  var elsLen = els.length;
  var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
  for (i = 0, j = 0; i < elsLen; i++) {
    if ( pattern.test(els[i].className) ) {
      classElements[j] = els[i];
      j++;
    }
  }
  return classElements;
}



$(function() {
	var printTrue = false;
	
	$('a.print-preview').printPreview();

	$(document).keydown(function(e) {
		if( e.ctrlKey || e.keyCode == 17 || e.keyCode == 91) {
			printTrue = true;
		}
		
	    if(e.keyCode == 80 && !$('#print-modal').length && printTrue) {
			jQuery.printPreview.loadPrintPreview();
			return false;
		}		
	});
	$(document).keyup(function(e) {
		if( e.ctrlKey || e.keyCode == 17 || e.keyCode == 91) {
			printTrue = false;
		}
	});
            
	var currentPagePrint = document.location.hash;
	if (currentPagePrint.indexOf("print") != -1) {   
		if (!$('#print-modal').length) {
			jQuery.printPreview.loadPrintPreview();
		}
	}
});

