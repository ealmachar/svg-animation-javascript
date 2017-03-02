

// will contain "description boxes" located on the 4 quadrants
var descriptions = {}

// will contain "radial segments" spoked from the center
var segments = [];

var numSegments = 6;
var segmentSize = (2 * Math.PI) / numSegments;

// used for animation, going down from max to zero
var max = 200;
var progress = max;

// "background radius" of background segments
var bradius = Math.sqrt( Math.pow(window.innerWidth/2, 2) + Math.pow(window.innerHeight/2, 2));

// radius of central segments
var radius = 100;

// traversal for animations of central segments
var radiusStep = bradius - radius;

// center
var startx = window.innerWidth/2;
var starty = window.innerHeight/2;



function init(){
	
	
	var elements = document.getElementsByClassName('segment');

	for(var i = 0; i < elements.length; i++){
		var dom = elements[i];

		dom.onmouseenter = function(event){
			launch(event, 'expand');
			descriptionShow(true, event);
		}
		
		dom.onmouseleave = function(event){
			launch(event, 'contract');
			descriptionShow(false, event);
		}
	}
	

	
	initSegments()
	setSegments();
	setImages();
	setClippers();
	
	initDescriptions();
	initDescriptionBorders('1');
	initDescriptionBorders('2');
	initDescriptionBorders('3');
	initDescriptionBorders('4');
	setDescriptionAnimations();
}

init();

window.onresize = function(){

	setSizes();
	setSegments();
	setImages();
	setClippers();
	
	initDescriptionBorders('1');
	initDescriptionBorders('2');
	initDescriptionBorders('3');
	initDescriptionBorders('4');
	setDescriptionAnimations();
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

// called for window resize;
function setSizes(){
	bradius = Math.sqrt( Math.pow(window.innerWidth/2, 2) + Math.pow(window.innerHeight/2, 2));

	radiusStep = bradius - radius;

	startx = window.innerWidth/2;
	starty = window.innerHeight/2;
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
		formRadialCircle(radial, startx, starty, lx, ly, x, y, radius, 0, 0, 1 );
		
		background.style.opacity = '0.1';
		formRadialCircle(background, startx, starty, blx, bly, bx, by, bradius, 0, 0, 1 );
	}
}

// align images embedded in the SVG
function setImages(){
	var images = document.getElementsByTagName('pattern');
	var dom, offset;
	for(var i = 0; i < images.length; i++){
		dom = images[i];
		offset = 0;
		
		if(i == 1 )
			offset -= window.innerWidth/3;// + (50 * (window.innerWidth/3) / window.innerWidth);
		else if(i == 4)
			offset -= window.innerWidth/3;// + 180;
			
		dom.setAttribute('x', window.innerWidth/2 + offset);
		dom.setAttribute('y', window.innerHeight/2);
	}
}

var clipWidth;

// set dimensions of invisible clip boxes used for "slanting" text
// through the css property "shape-outside" and "clip-path"
function setClippers(){
	var clip = document.getElementsByClassName('block');
	var height = window.innerHeight/3;
	var width, mod;
	
	clipWidth = (Math.tan(Math.PI/6)*height) * (1/0.6);
	
	for(var i = 0; i < clip.length; i++){
		if(i < 2)
			mod = 0.6;
		else if(i == 2)
			mod = 0.8;
		else
			mod = 0.7;
		width = (Math.tan(Math.PI/6)*height) * (1/mod);
		clip[i].style.height = height + 'px';
		clip[i].style.width = width + 'px';
	}
}

// launch function for the radial animations
function launch(event, method){
	var target = event.target.id.substring(6, event.target.id.length);
	var progress = max;
	if(method == 'expand'){
		segments[target-1].background.style.opacity = 1;
		segments[target-1].radial.style.opacity = 0.1;
	}
	else{
		segments[target-1].background.style.opacity = 0.1;
		segments[target-1].radial.style.opacity = 1;
	}
	anim(event, method, target, progress);
}

// animate
function anim(event, method, target, progress){
	var interval = setInterval(function(){
		
		var offset = segments[target-1].offset;
	
		
		if(segments[target-1].anim != method && progress == max){
			segments[target-1].anim = method;

		}
		else if(segments[target-1].anim != method){
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
		
		var largearc = calcLargearc(phi, theta);
		
		formRadialCircle(event.srcElement, startx, starty, lx, ly, x, y, r, 0, 0, 1);
	
		if(progress > 0){
			progress --;
		}
		else if(progress <= 0){
			clearInterval(interval);
			segments[target-1].anim = null;
		}
	},1);
}


function initDescriptionBorders(quadrant){
	
	var description = descriptions[quadrant];
	
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
	
	if(quadrant == '1' || quadrant == '4'){
		corner2y = window.innerHeight/2 - Math.sin(arc2)*radius - Math.sin(arc3) * hyp;
	}
	else if(quadrant == '2' || quadrant == '3'){
		corner2y = Math.sin(arc2)*radius + Math.sin(arc3) * hyp;
	}


	var d1, d2, d3, d4, d5, da;
	var l1, l2, l3, l4, l5, a;

	var rightOffset = window.innerWidth/2;
	
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
	
	body += d1 + l1 + l2 + a + l3 + l4;
	
			
	d5 = 'M ' + 0 + ' ' + 5;
	l5 = ' l ' + (window.innerWidth) + ' ' + 0;
	
	description.des1.obj.setAttribute('d', d1 + l1);
	description.des2.obj.setAttribute('d', d2 + l2);
	description.desa.obj.setAttribute('d', da + a);
	description.des3.obj.setAttribute('d', d3 + l3);
	description.des4.obj.setAttribute('d', d4 + l4);
	description.des5.obj.setAttribute('d', d5 + l5);
	description.desback.obj.setAttribute('d', body);

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
				obj = description[i].obj;
				obj.style.opacity = '0';
				
				obj.style.transition = 'opacity 0.5s ease-in-out';
			}
			else if(description[i].type == 'svgborder'){
			
				obj = description[i].obj;

				length = obj.getTotalLength();
			
				obj.style.strokeDasharray = length + ' ' + length;
				obj.style.strokeDashoffset = description[i].sdo = length;
				
				obj.getBoundingClientRect();

				obj.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
			}
		}
	}
}


function initDescriptions(){
	var des1, des2, desa, des3, des4, des5, desa, desback, desbody;
	
	for(var quadrant = 1; quadrant <= 4; quadrant++){
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
				obj: des1,
				sdo: des1.style.strokeDashoffset,
				type: 'svgborder'
			},
			des2: {
				obj: des2,
				sdo: des2.style.strokeDashoffset,
				type: 'svgborder'
			},
			des3: {
				obj: des3,
				sdo: des3.style.strokeDashoffset,
				type: 'svgborder'
			},
			des4: {
				obj: des4,
				sdo: des4.style.strokeDashoffset,
				type: 'svgborder'
			},
			desa: {
				obj: desa,
				sdo: desa.style.strokeDashoffset,
				type: 'svgborder'
			},
			des5: {
				obj: des5,
				sdo: des5.style.strokeDashoffset,
				type: 'svginlet'
			},
			desback: {
				obj: desback,
				type: 'svgbackground'
			},
			desbody: {
				obj: desbody,
				type: 'htmlbody'
			}
		};

		descriptions[quadrant] = description;
	}
}


function descriptionShow(show, event){

	var quadrant = false;
	var target = event.target.id;
	var num = parseInt(target.charAt(target.length-1));
	var city;

	switch(num){
		case 1:
			quadrant = 4;
			city = cities.miami;
		break;
		
		case 2:
			quadrant = 3;
			city = cities.dallas;
		break;
		
		case 3:
			quadrant = 1;
			city = cities.sanfrancisco;
		break;
		
		case 4:
			quadrant = 2;
			city = cities.seattle;
		break;
		
		case 5:
			quadrant = 1;
			city = cities.chicago;
		break;
		
		case 6:
			quadrant = 3;
			city = cities.newyork;
		break;
	}
	

	$('#title' + quadrant).text(city.title)
	$('#text' + quadrant).text(city.text)
	$('#incorp' + quadrant).text(city.date)
	$('#pop' + quadrant).text(city.pop)
	
	var panel = descriptions[quadrant];
		
	var type, obj;
	
	if(panel){
		for(var des in panel){
		
			type = panel[des].type;
			obj = panel[des].obj;
			
			if(show){
				if(type == 'svgbackground'){
					obj.style.opacity = '0.4';
				}
				else if(type == 'svgborder'){
					obj.style.strokeDashoffset = '0';
				}
				else if(type == 'htmlbody'){
					$(obj).addClass('show');
				}
			}
			else{
				if(type == 'svgbackground'){
					obj.style.opacity = '0';
				}
				else if(type == 'svgborder'){
					obj.style.strokeDashoffset = panel[des].sdo;
				}
				else if(type == 'htmlbody'){
					$(obj).removeClass('show');
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
	
	obj.setAttribute('d', d);
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
