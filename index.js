const http = require('http');
const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World</h1>');
});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});

const yelp = require('./yelp');

var restaurants = [{
    name: 'Zazie',
    image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/Lu45z9TTgc5o8jHuru1u5A/o.jpg',
    url: 'https://www.yelp.com/biz/zazie-san-francisco?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA',
    review_count: 123,
    categories: [ 'Breakfast & Brunch', 'French', 'Wine Bars' ],
    rating: 4,
    transactions: [ 'pickup', 'delivery' ],
    price: '$$',
    location: '941 Cole St, San Francisco',
    distance: 5020.969731767104
}];
var per_person = 5;
var enough_matches = 5;
var likes = [];
var matches = [];
var curr_user = 1;
var max_users = 2;
var last_rest = 0;
var using_matches = 0;

console.log("1");

// if(navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(call_api);
// }

function call_api(pos) {
    var searchRequest = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radius: parseInt(localStorage.getItem("distance")*1609.34),
        categories: localStorage.getItem("categories"),
        price: localStorage.getItem("prices"),
        sort_by: 'rating',
        open_now: true,
        limit: 20,
    };

    console.log(searchRequest);

    yelp.searchYelp(searchRequest).then(rests => {
        restaurants = rests; console.log(rests);
    });

    console.log(restaurants);

    swap_user();
}

function make_deck(rests) {
    rests = rests.sort((a, b) => 0.5 - Math.random());

    for (var i = 0; i < rests.length; i++) {
        console.log(i)
        make_card(rests[i]);
    }

    curr_user = curr_user % max_users + 1;
    document.getElementById("user-swap").getElementsByClassName("card-title").innerHTML = "You're up Player " + curr_user;
}

function swap_user() {
    if ((matches.length >= enough_matches || restaurants.length <= last_rest) && using_matches === 0) {
        using_matches = 1;
        restaurants = matches;
        per_person = restaurants.length;
        matches = [];
    } else if (using_matches === 1) {
        using_matches++;
    } else if (using_matches === 2) {
        show_results();
    }

    var new_rests = [];

    for (var i = 0; i < likes.length; i++) {
        new_rests.push(restaurants[likes[i]]);
    }

    for (var i = new_rests.length; i < per_person & restaurants.length > last_rest; i++) {
        new_rests.push(restaurants[last_rest++]);
    }

    console.log(new_rests);

    make_deck(new_rests);
}

function show_results() {
    console.log(matches);
    console.log(restaurants);
}

function judge(card, judgement) {
    rest_name = $(card).find("h5.rest-name")[0].innerHTML.split(" <span>")[0];
    var index = -1;
    restaurants.find(function(item, i){
        if(item.name === rest_name){
            index = i;
            return i;
        }
    });
    console.log(index);
    $(card).hide();
    if (index === -1)
        return;

    if (likes.indexOf(index) >= 0) {
        likes.splice(likes.indexOf(index), 1);
        if (judgement === 1)
            matches.push(index);
    } else if (judgement === 1) {
        likes.push(index);
    }
    console.log(likes);
    console.log(matches);
}

function capitalizeWords(arr) {
    return arr.map(element => {
        return element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
    });
}

function make_card(restaurant) {
    var basic_card = document.querySelector('#basic_card');
    var new_card = basic_card.cloneNode(true);
    new_card.id = restaurant.name
    
    new_card.getElementsByClassName("rest-img")[0].src = restaurant.image_url;
    new_card.getElementsByClassName("rest-name")[0].innerHTML = restaurant.name + " <span style='font-size: 0.8em;'>" +
                                                                parseInt(restaurant.distance/1609.34) + "mi</span>";
    new_card.getElementsByClassName("rest-rate")[0].innerHTML = "Rating: " + "*".repeat(parseInt(restaurant.rating)) +
                                                                " (" + restaurant.review_count + ") <span> Price: " +
                                                                restaurant.price + "</span>";
    new_card.getElementsByClassName("rest-category")[0].innerHTML = restaurant.categories.join(", ");
    new_card.getElementsByClassName("rest-transact")[0].innerHTML = capitalizeWords(restaurant.transactions).join(", ");
    new_card.getElementsByClassName("rest-location")[0].innerHTML = restaurant.location;
    new_card.getElementsByClassName("rest-yelp")[0].href = restaurant.url;

    basic_card.after(new_card);
}