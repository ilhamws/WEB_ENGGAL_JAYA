jQuery( document ).ready(function( $ ) {

	"use strict";

	// Tambahkan fungsi smartresize
	(function($,sr){
		// debouncing function from John Hann
		// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
		var debounce = function (func, threshold, execAsap) {
			var timeout;
			return function debounced () {
				var obj = this, args = arguments;
				function delayed () {
					if (!execAsap)
						func.apply(obj, args);
					timeout = null;
				}
				if (timeout)
					clearTimeout(timeout);
				else if (execAsap)
					func.apply(obj, args);
				timeout = setTimeout(delayed, threshold || 100);
			};
		};
		// smartresize 
		jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
	})(jQuery,'smartresize');

	$('.owl-carousel').owlCarousel({
	    items:4,
	    lazyLoad:true,
	    loop:true,
	    dots:true,
	    margin:20,
	    responsiveClass:true,
		    responsive:{
		        0:{
		            items:1,
		        },
		        600:{
		            items:2,
		        },
		        1000:{
		            items:4,
		        }
		    }
	});

	// Cek apakah Isotope tersedia
	if (typeof $.fn.isotope !== 'undefined') {
		/* activate jquery isotope */
		var $container = $('.posts').isotope({
			itemSelector : '.item',
			isFitWidth: true
		});

		$(window).smartresize(function(){
			$container.isotope({
			columnWidth: '.col-sm-3'
			});
		});
		
		$container.isotope({ filter: '*' });

		// filter items on button click
		$('#filters').on( 'click', 'button', function() {
			var filterValue = $(this).attr('data-filter');
			$container.isotope({ filter: filterValue });
		});
	}

	// Cek apakah Flexslider tersedia
	if (typeof $.fn.flexslider !== 'undefined') {
		$('#carousel').flexslider({
			animation: "slide",
			controlNav: false,
			animationLoop: false,
			slideshow: false,
			itemWidth: 210,
			itemMargin: 5,
			asNavFor: '#slider'
		});
		 
		$('#slider').flexslider({
			animation: "slide",
			controlNav: false,
			animationLoop: false,
			slideshow: false,
			sync: "#carousel"
		});
	}
 
});
