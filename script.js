document.getElementById("moreDetails").onclick = function(){expand()};
document.getElementById("close").onclick = function(){retract()};
var w = window.innerWidth;
var h = window.innerHeight;
var plus = document.getElementById("plus").getBoundingClientRect();
var article = document.getElementById("article").getBoundingClientRect();
var plusX = (plus.left + plus.right) / 2;
var plusY = (plus.top + plus.bottom) / 2 + 50;
var articleX = (article.left + article.right) / 2;
var articleY = (article.top + article.bottom) / 2;

document.getElementsByTagName("ARTICLE")[0].style.display = "none";

var zoom = anime({
	targets: 'article',
	translateX: plusX - articleX,
	translateY: plusY - articleY,
	borderRadius: 200,
	scale: .05,
	duration: 500,
	easing: 'linear',
	autoplay: true
});

var fade = anime({
	targets: 'header',
	opacity: 0,
	duration: 300,
	easing: 'linear',
	autoplay: false
});

function expand() {
	fade.play();
	document.getElementsByTagName("ARTICLE")[0].style.display = "block";
	zoom.reverse();
	zoom.play();
	setTimeout(function() {
		document.getElementsByTagName("HEADER")[0].style.display = "none";
	}, 500);
}

function retract() {
	zoom.reverse();
	zoom.play();
	document.getElementsByTagName("HEADER")[0].style.display = "block";
	document.getElementsByTagName("HEADER")[0].style.opacity = 0;
	setTimeout(function() {
		fade.play();
		fade.reverse();
	}, 200);
	setTimeout(function() {
		document.getElementsByTagName("ARTICLE")[0].style.display = "none";
		fade.reverse();
	}, 500);
}