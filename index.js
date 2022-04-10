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

console.log("1");

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
        restaurants = rests; console.log(rests);

        console.log(restaurants);

        swap_user();
    });

    // restaurants = get_rests();

    
}

function make_deck(rests) {
    rests = rests.sort((a, b) => 0.5 - Math.random());

    for (var i = 0; i < rests.length; i++) {
        make_card(rests[i]);
    }

    curr_user = curr_user % max_users + 1;
    console.log(document.getElementById("user-swap").getElementsByClassName("card-title"));
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

    console.log(new_rests);

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
    console.log(index);
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

function get_rests() {
    return [
        {
            "name": "2Fifty Texas BBQ",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/PGAoAZTD-WJ8U0dHHups5Q/o.jpg",
            "url": "https://www.yelp.com/biz/2fifty-texas-bbq-riverdale-park-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 195,
            "categories": [
                "Barbeque"
            ],
            "rating": 4.5,
            "transactions": [
                "delivery"
            ],
            "price": "$$",
            "location": "4700 Riverdale Rd, Riverdale Park",
            "distance": 3765.499710524122
        },
        {
            "name": "Trattoria Da Lina",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/iadWLKXvs2fFIp3trhOQ_Q/o.jpg",
            "url": "https://www.yelp.com/biz/trattoria-da-lina-takoma-park?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 190,
            "categories": [
                "Italian",
                "Desserts",
                "Bars"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "7000 Carroll Ave, Takoma Park",
            "distance": 6553.370642062754
        },
        {
            "name": "Cielo Rojo",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/ewx4vsrSP_dl0y7Nofgb2Q/o.jpg",
            "url": "https://www.yelp.com/biz/cielo-rojo-takoma-park-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 286,
            "categories": [
                "Mexican"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "7056 Carroll Ave, Takoma Park",
            "distance": 6389.059270437426
        },
        {
            "name": "Sardi's Pollo A La Brasa",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/xJCV3D3eXDzrCxRkrQiZyA/o.jpg",
            "url": "https://www.yelp.com/biz/sardis-pollo-a-la-brasa-beltsville-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 880,
            "categories": [
                "Latin American",
                "Peruvian",
                "Chicken Shop"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "10433 Baltimore Ave, Beltsville",
            "distance": 4072.702754711685
        },
        {
            "name": "Seoul Food DC",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/dWiBHKmZ6FUBMXxYr3ae4A/o.jpg",
            "url": "https://www.yelp.com/biz/seoul-food-dc-takoma-park-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 455,
            "categories": [
                "Korean",
                "Asian Fusion",
                "Noodles"
            ],
            "rating": 4.5,
            "transactions": [
                "delivery"
            ],
            "price": "$$",
            "location": "7302 Carroll Ave, Takoma Park",
            "distance": 5925.31007288395
        },
        {
            "name": "Takoma Bev",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/hVom9wRYO3gsDZ_-tAsHAw/o.jpg",
            "url": "https://www.yelp.com/biz/takoma-bev-takoma-park-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 172,
            "categories": [
                "Cocktail Bars",
                "Coffee & Tea",
                "Breakfast & Brunch"
            ],
            "rating": 4.5,
            "transactions": [
                "delivery"
            ],
            "price": "$$",
            "location": "6917 Laurel Ave, Takoma Park",
            "distance": 6582.932429431657
        },
        {
            "name": "Shagga Coffee And Restaurant",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/qsD74sUtPdp-9lGanbIgZw/o.jpg",
            "url": "https://www.yelp.com/biz/shagga-coffee-and-restaurant-hyattsville?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 373,
            "categories": [
                "Ethiopian",
                "Coffee & Tea"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "6040 Baltimore Ave, Hyattsville",
            "distance": 3804.8052919271295
        },
        {
            "name": "Chez Dior",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/zYi8yQWX09V9RrB-s9u_lw/o.jpg",
            "url": "https://www.yelp.com/biz/chez-dior-hyattsville?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 157,
            "categories": [
                "Senegalese"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "5124 Baltimore Ave, Hyattsville",
            "distance": 4816.242594013466
        },
        {
            "name": "Banana Blossom Bistro",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/pvtQo5flomj1dJAfBgzo0g/o.jpg",
            "url": "https://www.yelp.com/biz/banana-blossom-bistro-riverdale-park-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 127,
            "categories": [
                "Vietnamese",
                "Noodles",
                "Sandwiches"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "6202 Rhode Island Ave, Riverdale Park",
            "distance": 3660.6467297856493
        },
        {
            "name": "Curry Place Indian Cuisine",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ix_oVNfdqZlTHegSQLYs_w/o.jpg",
            "url": "https://www.yelp.com/biz/curry-place-indian-cuisine-silver-spring?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 89,
            "categories": [
                "Indian",
                "Himalayan/Nepalese"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "11229 New Hampshire Ave, Silver Spring",
            "distance": 6518.002591694612
        },
        {
            "name": "Gangster Vegan Organics",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/fB3uKAw_0bGK09r36SA1Ug/o.jpg",
            "url": "https://www.yelp.com/biz/gangster-vegan-organics-riverdale-park?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 61,
            "categories": [
                "Salad",
                "Juice Bars & Smoothies",
                "Vegan"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "6202 Rhode Island Ave, Riverdale Park",
            "distance": 3660.6467297856493
        },
        {
            "name": "Jodeem African Cuisine",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/tp3GBrJomwWO9-Dt2XEHpw/o.jpg",
            "url": "https://www.yelp.com/biz/jodeem-african-cuisine-greenbelt-2?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 101,
            "categories": [
                "African"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "6000 Greenbelt Rd, Greenbelt",
            "distance": 2767.0086242186594
        },
        {
            "name": "Jackie Lee's",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/WzTCjL1ysHPaled85t5eKA/o.jpg",
            "url": "https://www.yelp.com/biz/jackie-lees-washington?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 57,
            "categories": [
                "Bars",
                "American (Traditional)"
            ],
            "rating": 4.5,
            "transactions": [
                "delivery"
            ],
            "price": "$",
            "location": "116 Kennedy St NW, Washington, DC",
            "distance": 7536.406442797551
        },
        {
            "name": "Da Rae Won Restaurant",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/Q6Gdz9XvYPFvCmOtQ2hphg/o.jpg",
            "url": "https://www.yelp.com/biz/da-rae-won-restaurant-beltsville?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 438,
            "categories": [
                "Korean",
                "Noodles",
                "Asian Fusion"
            ],
            "rating": 4.5,
            "transactions": [
                "delivery"
            ],
            "price": "$$",
            "location": "5013 Garrett Ave, Beltsville",
            "distance": 5921.218835219151
        },
        {
            "name": "Yia Yia's Kitchen",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/qaCgYIx0RlAVykh3Y7ytTw/o.jpg",
            "url": "https://www.yelp.com/biz/yia-yias-kitchen-beltsville-3?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 488,
            "categories": [
                "Greek",
                "Salad",
                "Soup"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "10413 Baltimore Ave, Beltsville",
            "distance": 3979.078155665173
        },
        {
            "name": "Manila Mart",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/9mUVlqEaOnJKYyaGIAiUeg/o.jpg",
            "url": "https://www.yelp.com/biz/manila-mart-beltsville?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 169,
            "categories": [
                "Filipino",
                "International Grocery"
            ],
            "rating": 4.5,
            "transactions": [],
            "price": "$$",
            "location": "5023 Garrett Ave, Beltsville",
            "distance": 5935.108313164645
        },
        {
            "name": "Captain Cookie and the Milk Man Food Truck",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/W2cbU81jVgDl0WQedPHDfw/o.jpg",
            "url": "https://www.yelp.com/biz/captain-cookie-and-the-milk-man-food-truck-washington?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 351,
            "categories": [
                "Desserts",
                "Food Trucks",
                "Ice Cream & Frozen Yogurt"
            ],
            "rating": 4.5,
            "transactions": [],
            "price": "$",
            "location": ", Washington, DC",
            "distance": 12971.154165854314
        },
        {
            "name": "Puddin'",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/U-lESxwgxBbf574c-qmD7g/o.jpg",
            "url": "https://www.yelp.com/biz/puddin-washington?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 353,
            "categories": [
                "Cajun/Creole",
                "Food Trucks"
            ],
            "rating": 4,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$",
            "location": "1309 5th St NE, Washington, DC",
            "distance": 10811.737246122266
        },
        {
            "name": "Tacos 5 De Mayo Restaurant",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/Gnzgu2eNSKwoyUdnXyoIMA/o.jpg",
            "url": "https://www.yelp.com/biz/tacos-5-de-mayo-restaurant-hyattsville?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 235,
            "categories": [
                "Mexican",
                "Salvadoran"
            ],
            "rating": 4.5,
            "transactions": [
                "pickup"
            ],
            "price": "$",
            "location": "7201 Annapolis Rd, Hyattsville",
            "distance": 6914.070623335781
        },
        {
            "name": "Marathon Deli",
            "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/h_ljWlcNC5otPCWFHUVEXw/o.jpg",
            "url": "https://www.yelp.com/biz/marathon-deli-college-park?adjust_creative=16U1oFiyIsfEcayrt94vSA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=16U1oFiyIsfEcayrt94vSA",
            "review_count": 399,
            "categories": [
                "Delis",
                "Greek",
                "Pizza"
            ],
            "rating": 4,
            "transactions": [
                "pickup",
                "delivery"
            ],
            "price": "$$",
            "location": "7412 Baltimore Ave, College Park",
            "distance": 1600.7378919139437
        }
    ];    
}