const yelp = require('./yelp');

var restaurants = [];
var per_person = 5;
var enough_matches = 5;
var likes = [];
var matches = [];
var curr_user = 1;
var max_users = 2;
var last_rest = 0;
var using_matches = 0;

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(call_api);
}

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
        restaurants = rests;

        swap_user();
    });
}

function make_deck(rests) {
    rests = rests.sort((a, b) => 0.5 - Math.random());

    for (var i = 0; i < rests.length; i++) {
        make_card(rests[i]);
    }

    curr_user = curr_user % max_users + 1;
    document.getElementById("user-swap").getElementsByClassName("card-title")[0].innerHTML = "You're up Player " + curr_user;
}

function make_carousel(rests) {
    rests = rests.sort((a, b) => 0.5 - Math.random());

    for (var i = 0; i < rests.length; i++) {
        make_carousel_cell(rests[i]);
    }

    $('#basic_cell').remove()

    $('.main-carousel').flickity({
        // options
        freeScroll: true,
        cellAlign: 'left',
        wrapAround: true,
        contain: true,
        autoPlay: true,
        imagesLoaded: true,
        adaptiveHeight: true
    });
}

function swap_user() {
    if ((matches.length >= enough_matches || restaurants.length <= last_rest) && using_matches === 0) {
        using_matches = 1;
        matched_rests = [];
        for (var i = 0; i < matches.length; i++) {
            matched_rests.push(restaurants[matches[i]]);
        }
        restaurants = matched_rests;
        per_person = restaurants.length;
        matches = [];
        last_rest = 0;
    } else if (using_matches === 1) {
        using_matches++;
    } else if (using_matches === 2) {
        show_results();
        return;
    }

    var new_rests = [];

    for (var i = 0; i < likes.length; i++) {
        new_rests.push(restaurants[likes[i]]);
    }

    for (var i = new_rests.length; i < per_person & restaurants.length > last_rest; i++) {
        new_rests.push(restaurants[last_rest++]);
    }

    make_deck(new_rests);
}

function show_results() {
    document.getElementsByClassName("container")[0].remove();
    document.getElementsByClassName("main-carousel")[0].classList.remove("d-none");

    matched_rests = [];
    for (var i = 0; i < matches.length; i++) {
        matched_rests.push(restaurants[matches[i]]);
    }

    make_carousel(matched_rests);
}

function judge(card, judgement) {
    rest_name = $(card).find("h5.rest-name")[0].innerHTML.split(" <span")[0];
    var index = -1;
    restaurants.find(function(item, i){
        if(item.name === rest_name){
            index = i;
            return i;
        }
    });
    
    $(card).remove();
    if (index === -1)
        return;

    if (likes.indexOf(index) >= 0) {
        likes.splice(likes.indexOf(index), 1);
        if (judgement === 1)
            matches.push(index);
    } else if (judgement === 1) {
        likes.push(index);
    }
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
    $(new_card).show()
    
    new_card.getElementsByClassName("rest-img")[0].src = restaurant.image_url;
    new_card.getElementsByClassName("rest-name")[0].innerHTML = restaurant.name + " <span style='font-size: 0.8em;'>" +
                                                                parseInt(restaurant.distance/1609.34) + "mi</span>";
    new_card.getElementsByClassName("rest-rate")[0].innerHTML = "Rating: " + "★".repeat(parseInt(restaurant.rating+0.49)) +
                                                                " (" + restaurant.review_count + ") <span> Price: " +
                                                                restaurant.price + "</span>";
    new_card.getElementsByClassName("rest-category")[0].innerHTML = restaurant.categories.join(", ");
    new_card.getElementsByClassName("rest-transact")[0].innerHTML = capitalizeWords(restaurant.transactions).join(", ");
    new_card.getElementsByClassName("rest-location")[0].innerHTML = restaurant.location;
    new_card.getElementsByClassName("rest-yelp")[0].href = restaurant.url;

    basic_card.after(new_card);
}

function make_carousel_cell(restaurant) {
    var basic_card = document.querySelector('#basic_cell');
    var new_card = basic_card.cloneNode(true);
    new_card.id = restaurant.name
    $(new_card).show()
    
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