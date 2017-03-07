

// will contain "description boxes" located on the 4 quadrants
var descriptions = {}

// will contain "radial segments" spoked from the center
var segments = [];

var numSegments = 6;
var segmentSize = (2 * Math.PI) / numSegments;

// used for animation, going down from max to zero
var max = 15;

// "background radius" of background segments
var bradius = Math.sqrt( Math.pow(window.innerWidth/2, 2) + Math.pow(window.innerHeight/2, 2));

// radius of central segments
var radius = 100;

// traversal for animations of central segments
var radiusStep = bradius - radius;

// center
var startx = window.innerWidth/2;
var starty = window.innerHeight/2;

var clipWidth;

var tables = $('.qudrantTable');

// toggles used for animation locks
var city = null;
var exhibit = false;
var exhibitPreDelay = false;

var strokeColor = 'white';
var fillColor = 'rgba(255, 255, 255, 1)';
var backgroundOpacity = '0.5'
var exhibitBackgroundColor = 'rgba(255, 255, 255, ' + backgroundOpacity + ')';
var strokeWidth = 2;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

function init(){
	
	eventBindings()
	initSegments()
	
	setSegments();
	setImages();
	setClippers();
	hideTables();
	setStyles();
	
	initDescriptions();
	initDescriptionBorders('1');
	initDescriptionBorders('2');
	initDescriptionBorders('3');
	initDescriptionBorders('4');
	initDescriptionBorders('5');
	initDescriptionBorders('6');
}

window.onready = function(){
	setDescriptionAnimations();
//	setTimeout(function(){
	$('#screen').css('opacity', 0);
//	}, 1000);
}

window.onresize = function(){

	setSizes();
	setSegments();
	setImages();
	setClippers();
	hideTables();
	
	initDescriptionBorders('1');
	initDescriptionBorders('2');
	initDescriptionBorders('3');
	initDescriptionBorders('4');
	initDescriptionBorders('5');
	initDescriptionBorders('6');
	setDescriptionAnimations();
}

function eventBindings(){
	
	$('.segment').mouseover(function(event){
		anim(event, 'expand')
		descriptionShow(true, false, true, event);
	})
	.mouseleave(function(event){
		anim(event, 'contract')
		descriptionShow(false, false, true, event);
	})
	.click(function(event){
			
		if(!exhibit && !exhibitPreDelay){
			
			exhibitPreDelay = true;
			
			anim(event, 'contract')
			descriptionShow(true, true, false, event);
			
			$('#desbody6')
			.addClass('phase1')
			
			setTimeout(function(){
				
				$('#desbody6')
				.addClass('phase2')
				
				$('#thumb1').trigger('click');
				
				setTimeout(function(){
					
					$('#desbody6container, #des6imagebody, #des6imagebodycontents')
					.addClass('phase3')
					
					showSvg(descriptions[6], true);
					
					exhibit = true;
					
				}, 500)
				
			}, 500);
			
		}
	});
	
	$('#xbutton').click(function(event){

		if(exhibit){

			$('#desbody6container, #des6imagebody, #des6imagebodycontents')
			.removeClass('phase3');
			
			descriptionShow(false, true, true, event);	
			
			setTimeout(function(){
				$('#desbody6')
				.removeClass('phase2');

				setTimeout(function(){
					$('#desbody6')
					.removeClass('phase1');
					
					$('.segment')
					.css({
						pointerEvents: 'auto',
						opacity: 1
					});
					
					exhibit = false;
					exhibitPreDelay = false;
				}, 500);

			}, 500);
		}
		
	})

	$('.thumb').mouseenter(function(){
		$(this).css({
			width: '160px',
			height: '160px',
			top: '-40px'
		});
	})
	.mouseleave(function(){
		$(this).css({
			width: '80px',
			height: '80px',
			top: '0px'
		});
	})
	.click(function(event){
		var image = $(this).css('backgroundImage');
		$('#des6imagedisplay').css('backgroundImage', image)
	});
}

function initSegments(){
	var offset, radial, background;
	
	// initialize offset starting from 0 to 2PI
	// for <numSegment> segments
	for(var i = 0; i < numSegments; i++){
		offset = segmentSize * i;
		radial = document.getElementById('radial' + (i+1));
		background = document.getElementById('background' + (i+1));

		var segment = {
				offset: offset,
				anim: null,
				radial: radial,
				background: background
		};
		segments.push(segment)
	}
}

function setStyles(){
	$('#desbody6').css('backgroundColor', exhibitBackgroundColor)
}

// called for window resize;
function setSizes(){
	bradius = Math.sqrt( Math.pow(window.innerWidth/2, 2) + Math.pow(window.innerHeight/2, 2));

	radiusStep = bradius - radius;

	startx = window.innerWidth/2;
	starty = window.innerHeight/2;
}

function hideTables(){

	if(window.innerWidth < 1200 || (window.innerWidth < 1400 && isFirefox)){
		tables.hide();
	}
	else{
		tables.show();
	}
}

// initial draw for foreground and background radial
function setSegments(){
	var offset, radial, background;
	var phi, theta;
	var lx, ly, x, y;
	var blx, bly, bx, by;
	
	for(var i = 0; i < numSegments; i++){

		offset = segments[i].offset;
		radial = segments[i].radial;
		background = segments[i].background;
	
		phi = 0 + offset;
		theta = segmentSize + offset;

		lx = getx(phi, radius);
		ly = gety(phi, radius);

		x = getx(theta, radius) - lx;
		y = gety(theta, radius) - ly;
		
		blx = getx(phi, bradius);
		bly = gety(phi, bradius);

		bx = getx(theta, bradius) - blx;
		by = gety(theta, bradius) - bly;
		
		radial.style.stroke = strokeColor;
		radial.style.strokeWidth = strokeWidth;
		formRadialCircle(radial, startx, starty, lx, ly, x, y, radius, 0, 0, 1 );
		
		background.style.opacity = '0.1';
		background.style.stroke = strokeColor;
		background.style.strokeWidth = strokeWidth;
		formRadialCircle(background, startx, starty, blx, bly, bx, by, bradius, 0, 0, 1 );
	}
}

// align images embedded in the SVG
function setImages(){
	var images = document.getElementsByTagName('pattern');
	var dom, offset, id, x, y;
	var imageWidth = 960;
	for(var i = 0; i < images.length; i++){
		dom = images[i];
		id = parseInt(images[i].id.charAt(3));

		
		offset = 0;
		
		
		switch(id){
			case 1:
				x = window.innerWidth/2;
				y = window.innerHeight/2;
			break;
			
			case 2:
				offset -= imageWidth/2
				x = window.innerWidth/2 + offset;
				y = window.innerHeight/2;
			break;
			
			case 3:
				x = -250;
				if(window.innerWidth/2 > (imageWidth + x)){
					x = -Math.max(imageWidth - window.innerWidth/2, 0);
				}
				
				y = window.innerHeight/2;
			break;
			
			case 4:
				x = -250;
				if(window.innerWidth/2 > (imageWidth + x)){
					x = -Math.max(imageWidth - window.innerWidth/2, 0);
				}

				y = 0;
			break;
			
			case 5:
				offset -= imageWidth/2;
				x = window.innerWidth/2 + offset;
				y = window.innerHeight/2;
			break;
			
			case 6:
				x = window.innerWidth/2;
				y = window.innerHeight/2;
			break;
		}

			
		
			
		dom.setAttribute('x', x);
		dom.setAttribute('y', y);
	}
}



// set dimensions of invisible clip boxes used for "slanting" text
// through the css property "shape-outside" and "clip-path"
function setClippers(){
	var clip = document.getElementsByClassName('block');
	var height = window.innerHeight/2.5;
	var width, mod;
	
	clipWidth = (Math.tan(Math.PI/6)*height) * (1/0.6);

	for(var i = 0; i < clip.length; i++){
		if(i == 0)
			mod = 0.7;
		else if(i == 1)
			mod = 0.65;
		else if(i == 2)
			mod = 0.8;
		else
			mod = 0.85;
		width = (Math.tan(Math.PI/6)*height) * (1/mod);
		clip[i].style.height = height + 'px';
		clip[i].style.width = width + 'px';
	}
}


// launch function for the radial animations
function anim(event, method){
	var target = event.target.id.substring(6, event.target.id.length);
	var progress = max;

	if(method == 'expand'){
		segments[target-1].background.style.opacity = 1;
		segments[target-1].radial.style.opacity = 0.1;
	}
	else{
		segments[target-1].background.style.opacity = 0.1;
		if(!exhibitPreDelay){
			segments[target-1].radial.style.opacity = 1;
		}
	}
	
	var interval = setInterval(function(){
		
		var offset = segments[target-1].offset;
	
		
		if(segments[target-1].anim != method && progress == max){
			segments[target-1].anim = method;

		}
		else if(segments[target-1].anim != method &&segments[target-1].anim != null){
			clearInterval(interval);
		}


		var phi = offset;
		var theta = segmentSize + offset;
		var r;
		if(method == 'expand'){
//			phi -= Math.PI/180;
//			theta += Math.PI/180;
			r = radius + radiusStep * (1 - easing(progress, max));
		}
		else if(method == 'contract'){
//			phi += Math.PI/180;
//			theta -= Math.PI/180;
			r = radius + radiusStep * easing(progress, max);
		}

		
		var lx = getx(phi, r);
		var ly = gety(phi, r);
		
		var x = getx(theta, r) - lx;
		var y = gety(theta, r) - ly;
		
		var el = event.srcElement || event.target;
		
		formRadialCircle(el, startx, starty, lx, ly, x, y, r, 0, 0, 1);
	
		if(progress > 0){
			progress --;
		}
		else if(progress <= 0){
			clearInterval(interval);
			segments[target-1].anim = null;
		}
	},15);
}


function initDescriptionBorders(quadrant){
	
	var description;
	
	var padding = 30;

	var body = '';

	// corner1x is the corner of the arc in the border closest to the center horizontal
	// a y coordinate is not needed as it is simply <padding> off the center horizontal
	
	// corner2x and corner2y are the coordinates on the arc that are farther from the center horizontal
	// that is <padding> away from the radial circle, and <padding> away from the readial spokes in the background
	
	// corner3x is the corner farthest from the center horizontal that is <padding> away from the top or bottom
	// (depending on quadrant), and <padding> away from the radial spokes in the background
	var corner1x, corner2x, corner2y, corner3x;
	
	var left = padding;
	var top = padding;
	var bottom = window.innerHeight/2 - top*2;

	var hyp = Math.sqrt(2 * Math.pow(padding, 2));
	
	corner1x = window.innerWidth/2 - (radius + padding);
	
	var arc2 = Math.PI/3;
	var arc3 = Math.PI/3 - Math.PI/4;
	corner2x = window.innerWidth/2 - Math.cos(arc2)*radius - Math.cos(arc3) * hyp;
	corner3x = window.innerWidth/2 - (window.innerHeight/2 - padding) / Math.tan(arc2) - Math.cos(arc3) * hyp;
	
	
	// l1, l2, l3, l4, are the 4 straight borders
	// a is the arc in the corner
	// l5 is the line inside the description, not animated
	var d1, d2, d3, d4, d5, da;
	var l1, l2, l3, l4, l5, a;

	var rightOffset = window.innerWidth/2;
	

	if(quadrant == '1' || quadrant == '4'){
		corner2y = window.innerHeight/2 - Math.sin(arc2)*radius - Math.sin(arc3) * hyp;
		
		d5 = 'M ' + 0 + ' ' + 5;
		l5 = ' l ' + (corner3x - left - padding) + ' ' + 0;
	}
	else if(quadrant == '2' || quadrant == '3'){
		corner2y = Math.sin(arc2)*radius + Math.sin(arc3) * hyp;
		
		d5 = 'M ' + 0 + ' ' + 5;
		l5 = ' l ' + (corner3x - left - padding) + ' ' + 0;
	}
	else if(quadrant == '5'){
		d5 = 'M ' + 0 + ' ' + 5;
		l5 = ' l ' + 330 + ' ' + 0;
	}

	// upper left
	if(quadrant == '1'){
		d1 = 'M ' + left + ' ' + top;
		l1 = ' l ' + 0 + ' ' + bottom;
		
		d2 = 'M ' + left + ' ' + (top + bottom);
		l2 = ' l ' + (corner1x - left) + ' ' + 0;
		
		da = 'M ' + corner1x + ' ' + (top + bottom);
		a = ' A ' + radius + ' ' + radius + ' 0 0 1 ' + corner2x + ' ' + corner2y;
		
		d3 = 'M ' + corner2x + ' ' + corner2y;
		l3 = ' L ' + corner3x + ' ' + top;
		
		d4 = 'M ' + corner3x + ' ' + top;
		l4 = ' L ' + left + ' ' + top;
	}
	// bottom left
	else if(quadrant == '2'){
		d1 = 'M ' + left + ' ' + (top + bottom);
		l1 = ' l ' + 0 + ' ' + -bottom;
		
		d2 = 'M ' + left + ' ' + top;
		l2 = ' L ' + corner1x + ' ' + top;
		
		da = 'M ' + corner1x + ' ' + top;
		a = ' A ' + radius + ' ' + radius + ' 0 0 0 ' + corner2x + ' ' + corner2y;
		
		d3 = 'M ' + corner2x + ' ' + corner2y;
		l3 = ' L ' + corner3x + ' ' + (bottom + top);
		
		d4 = 'M ' + corner3x + ' ' + (bottom + top);
		l4 = ' L ' + left + ' ' + (bottom + top);
	}
	// bottom right
	else if(quadrant == '3'){
		d1 = 'M ' + (rightOffset - left) + ' ' + (top + bottom);
		l1 = ' l ' + 0 + ' ' + -bottom;
		
		d2 = 'M ' + (rightOffset - left) + ' ' + top;
		l2 = ' L ' + (rightOffset - corner1x) + ' ' + top;
		
		da = 'M ' + (rightOffset - corner1x) + ' ' + top;
		a = ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (rightOffset - corner2x) + ' ' + corner2y;
		
		d3 = 'M ' + (rightOffset - corner2x) + ' ' + corner2y;
		l3 = ' L ' + (rightOffset - corner3x) + ' ' + (bottom + top);
		
		d4 = 'M ' + (rightOffset - corner3x) + ' ' + (bottom + top);
		l4 = ' L ' + (rightOffset - left) + ' ' + (bottom + top);
	}
	// upper right
	else if(quadrant == '4'){
		d1 = 'M ' + (rightOffset - left) + ' ' + top;
		l1 = ' l ' + 0 + ' ' + bottom;
		
		d2 = 'M ' + (rightOffset - left) + ' ' + (top + bottom);
		l2 = ' L ' + (rightOffset - corner1x) + ' ' + (top + bottom);
		
		da = 'M ' + (rightOffset - corner1x) + ' ' + (top + bottom);
		a = ' A ' + radius + ' ' + radius + ' 0 0 0 ' + (rightOffset - corner2x) + ' ' + corner2y;
		
		d3 = 'M ' + (rightOffset - corner2x) + ' ' + corner2y;
		l3 = ' L ' + (rightOffset - corner3x) + ' ' + top;
		
		d4 = 'M ' + (rightOffset - corner3x) + ' ' + top;
		l4 = ' L ' + (rightOffset - left) + ' ' + top;
	}
	// description box when window width is small enough
	else if(quadrant == '5'){
		rightOffset = 450;
		d1 = 'M ' + left + ' ' + top;
		l1 = ' l ' + 0 + ' ' + bottom;
		
		d2 = 'M ' + left + ' ' + (top + bottom);
		l2 = ' l ' + (rightOffset - left*2) + ' ' + 0;
		
		d3 = 'M ' + (rightOffset - left) + ' ' + (bottom+top);
		l3 = ' L ' + (rightOffset - left) + ' ' + top;
		
		d4 = 'M ' + (rightOffset - left) + ' ' + top;
		l4 = ' L ' + left + ' ' + top;
		
		da = '';
		a = '';
	}
	// description box for the images when city is selected
	else if(quadrant == '6'){
		borderPadding = 1;
		width = parseInt($('#des6imagebody').css('width'));
		height = parseInt($('#des6imagebody').css('height'));
		left = borderPadding;
		top = borderPadding;
		bottom = height - borderPadding;
		right = width - borderPadding;
		
		d1 = 'M ' + left + ' ' + top;
		l1 = ' L ' + left + ' ' + bottom;
		
		d2 = 'M ' + left + ' ' + bottom;
		l2 = ' L ' + right + ' ' + bottom;
		
		d3 = 'M ' + right + ' ' + bottom;
		l3 = ' L ' + right + ' ' + top;
		
		d4 = 'M ' + right + ' ' + top;
		l4 = ' L ' + left + ' ' + top;
		
		da = '';
		a = '';
		
		d5 = 'M ' + (left + 30) + ' ' + 1;
		l5 = ' L ' + (right - 30) + ' ' + 1;
	}
	
	body += d1 + l1 + l2 + a + l3 + l4;

	description = descriptions[quadrant];
	
	description.des1.dom.setAttribute('d', d1 + l1);
	description.des2.dom.setAttribute('d', d2 + l2);
	description.desa.dom.setAttribute('d', da + a);
	description.des3.dom.setAttribute('d', d3 + l3);
	description.des4.dom.setAttribute('d', d4 + l4);
	description.des5.dom.setAttribute('d', d5 + l5);
	description.desback.dom.setAttribute('d', body);

	for(var dom in description){
		
		if(description[dom].type == 'svgborder' || description[dom].type == 'svginlet'){
			description[dom].dom.style.fill = 'none';
			description[dom].dom.style.stroke = strokeColor;
			description[dom].dom.style.strokeWidth = strokeWidth;
		}
		else if(description[dom].type == 'svgbackground'){
			description[dom].dom.style.fill = fillColor;
		}
	}
}

// help from https://jakearchibald.com/2013/animated-line-drawing-svg/
// setting a transition to strokeDashoffset and changing its value
// provides an animation for SVG lines
function setDescriptionAnimations(){
	
	var length, description;
	
	for(var key in descriptions){
		
		description = descriptions[key];
		
		for(var i in description){
			
			if(description[i].type == 'svgbackground'){
				dom = description[i].dom;
				dom.style.opacity = '0';

				dom.style.transition = 'opacity 0.5s ease-in-out';
				
			}
			else if(description[i].type == 'svgborder'){
			
				dom = description[i].dom;

				length = dom.getTotalLength();
			
				dom.style.strokeDasharray = length + ' ' + length;
				dom.style.strokeDashoffset = description[i].sdo = length;
				
				dom.getBoundingClientRect();

				dom.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
			}
		}
	}
}


function initDescriptions(){
	var des1, des2, desa, des3, des4, des5, desa, desback, desbody;
	
	for(var quadrant = 1; quadrant <= 6; quadrant++){
		des1 = document.getElementById('des' + quadrant + '1');
		des2 = document.getElementById('des' + quadrant + '2');
		desa = document.getElementById('des' + quadrant + 'a');
		des3 = document.getElementById('des' + quadrant + '3');
		des4 = document.getElementById('des' + quadrant + '4');
		des5 = document.getElementById('des' + quadrant + '5');
		desback = document.getElementById('des' + quadrant + 'b');
		desbody = document.getElementById('desbody' + quadrant);

		var description = {
			des1: {
				dom: des1,
				sdo: des1.style.strokeDashoffset,
				type: 'svgborder'
			},
			des2: {
				dom: des2,
				sdo: des2.style.strokeDashoffset,
				type: 'svgborder'
			},
			des3: {
				dom: des3,
				sdo: des3.style.strokeDashoffset,
				type: 'svgborder'
			},
			des4: {
				dom: des4,
				sdo: des4.style.strokeDashoffset,
				type: 'svgborder'
			},
			desa: {
				dom: desa,
				sdo: desa.style.strokeDashoffset,
				type: 'svgborder'
			},
			des5: {
				dom: des5,
				sdo: des5.style.strokeDashoffset,
				type: 'svginlet'
			},
			desback: {
				dom: desback,
				type: 'svgbackground'
			},
			desbody: {
				dom: desbody,
				type: 'htmlbody'
			}
		};

		descriptions[quadrant] = description;
	}
}


function descriptionShow(show, click, includesvg, event){
	
	var quadrant = false;
	var target = event.target.id;
	var num = parseInt(target.charAt(target.length-1));
	var key, text, title;
	var up;
	

	switch(num){
		case 1:
			quadrant = 4;
			key = 'miami'
			up = '0px';
		break;
		
		case 2:
			quadrant = 3;
			key = 'dallas';
			up = '0px';
		break;
		
		case 3:
			quadrant = 1;
			key = 'sanfrancisco';
			up = '0px';
		break;
		
		case 4:
			quadrant = 2;
			key = 'seattle';
			up = '50%';
		break;
		
		case 5:
			quadrant = 1;
			key = 'chicago';
			up = '50%';
		break;
		
		case 6:
			quadrant = 3;
			key = 'newyork';
			up = '50%';
		break;
	}
	
	city = cities[key];
	
	if(click){
		quadrant = 6;
		
		$('.segment').css('pointerEvents', 'none');
		
		$('.segment')
		.css({
			pointerEvents: 'none',
			opacity: 0.1
		});
		
		if(show){
			$('#thumb1').css('background-image', 'url(\'src/images/' + key + '.jpg\')');
			$('#thumb2').css('background-image', 'url(\'src/images/' + key + '1.jpg\')');
			$('#thumb3').css('background-image', 'url(\'src/images/' + key + '2.jpg\')');
			$('#thumb4').css('background-image', 'url(\'src/images/' + key + '3.jpg\')');
		}

	}
	else if(window.innerWidth < 1000 || (window.innerWidth < 1200 && isFirefox)){
		quadrant = 5;
		$('#descont5').css('top', up);
		$('#quadrant5').css('top', up);
	}

	if(show){
		title = quadrant == 6 ? city.title2 : city.title;
		text = quadrant == 6 ? city.text2 : city.text;
		
		$('#title' + quadrant).text(title)
		$('#text' + quadrant).text(text)
		$('#incorp' + quadrant).text(city.date)
		$('#pop' + quadrant).text(city.pop)
	}

	if(includesvg){
		showSvg(descriptions[quadrant], show);
	}
}

// function to show or hide borders
function showSvg(panel, show){
	var type, dom;
	
	if(panel){
		for(var des in panel){
		
			type = panel[des].type;
			dom = panel[des].dom;
			
			if(show){
				if(type == 'svgbackground'){
					dom.style.opacity = backgroundOpacity;
				}
				else if(type == 'svgborder'){
					dom.style.strokeDashoffset = '0';
				}
				else if(type == 'htmlbody'){
					$(dom).addClass('show');
				}
			}
			else{
				if(type == 'svgbackground'){
					dom.style.opacity = '0';
				}
				else if(type == 'svgborder'){
					dom.style.strokeDashoffset = panel[des].sdo;
				}
				else if(type == 'htmlbody'){
					$(dom).removeClass('show');
				}
			}
		}
	}
}


function getx(theta, radius){
	return Math.cos(theta) * radius;
}

function gety(theta, radius){
	return Math.sin(theta) * radius;
}

function formRadialCircle(obj, startx, starty, lx, ly, x, y, radius, xaxis, largearc, sweep){
	d = 'M' + startx + ' ' + starty +
	' l ' + lx + ' ' + ly +
	' a ' + radius + ' ' + radius + ' ' + xaxis + ' ' + largearc + ' ' + sweep + ' ' + x + ' ' + y + ' z';
	
	if(obj){
		obj.setAttribute('d', d);
	}
}

function easing(progress, max){
	var result = Math.pow(progress/max, 5);
//	var result = progress / max;
	return result;
}

function difference(a, b){
	var result = Math.abs(a - b);
	return result;
}

function calcLargearc(phi, theta){
	var result = difference(phi, theta) < Math.PI ? 1 : 0;
	return result;
}

init();