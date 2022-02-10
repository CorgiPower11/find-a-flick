
// variables 
var searchButtonEl = document.getElementsByClassName("btn")

var getMovieInfo = function(movie, key) {

    // OMDB var
    var apiUrl = "http://www.omdbapi.com/?apikey=4ba5eec&t=" + movie;

    // get data through a fetch request
    fetch(apiUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        // Check to see if the response comes back as true or false
        if (data.Response === 'False') {
            alert("Please Enter a valid Movie Title!")
        } else {
            displayMovieInfo(data);
            streamingAvailability(data, key);
        }
    })
    .catch(function(error) {
        alert("Unable to connect to server!")
    });
};

var streamingAvailability = function (movie, key) {

    
    // pull out imdbID for API fetch request
    var imdb_id = movie.imdbID;
    // pull title for error message
    var title = movie.Title;

    // assemble the endpoint URL
    var apiUrl = "https://streaming-availability.p.rapidapi.com/get/basic?country=us&imdb_id=" + imdb_id + "&output_language=en";

    // call with the required header as a second argument
    fetch(apiUrl, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
            "x-rapidapi-key": key
        }
    }).then(function (response) {

        if (response.ok) {
            return response.json();
        } else {
            // create error message if 404 error / no object returned.
            var msg = "We were not able to find streaming availability for " + title + ". Thank you for using find-a-flick!";

            var noStreamEl = document.createElement("div");
            var msgEl = document.createElement("h2");
            msgEl.textContent = (msg);

            noStreamEl.appendChild(msgEl);

            document.body.appendChild(noStreamEl)
            return;
        }
    }).then(function (data) {
        // pass the data object if it was returned
        displayStreamingLinks(data);
    });

};

var displayMovieInfo = function(data) {
    
    // Create a container to hold information from OMDB and display it
    // Might be unnecessary IF it is hard coded in html 
    var MOVIECONTAINER = document.createElement('infoContainer')

    // Create a title element
    var filmTitle = document.createElement('movieTitle')
    // set text to title value from omdb
    filmTitle.textContent = (data.Title)
    // Append to the page
    MOVIECONTAINER.appendChild(filmTitle)

    // Create an img element 
    var poster = document.createElement('movieImg')
    // set source of img as link for poster from omdb
    poster.setAttribute("src", data.Poster)
    // Append to the page
    MOVIECONTAINER.appendChild(poster)

    // Create text for Year
    var year = document.createElement('movieYear')
    // set text of the year to value form omdb
    year.textContent = ("Released: " + data.Year)
    // Append to the page
    MOVIECONTAINER.appendChild(year)

    // Create text for Rated
    var rated = document.createElement('movieRated')
    // set text to rated value from omdb
    rated.textContent = ("Rated: " + data.Rated)
    // Append to the page
    MOVIECONTAINER.appendChild(rated)

    // Create text for Runtime
    var runtime = document.createElement('movieRuntime')
    // set text to runtime from omdb
    runtime.textContent = ("Runtime: " + data.Runtime)
    // Append to the page
    MOVIECONTAINER.appendChild(runtime)

    // Create text for Plot
    var plot = document.createElement('moviePlot')
    // set text for plot from omdb
    plot.textContent = (data.Plot)
    // Append to the page
    MOVIECONTAINER.appendChild(plot)

    document.body.appendChild(MOVIECONTAINER)

};

var displayStreamingLinks = function (data) {

    // title variable case sensitive and title is not captialized in the streaming-availability object
    var title = data.title;
    // empty string for success/failure msg
    var msg = "";

    // container for the links
    var linkContainer = document.createElement('watchOptions');

    // populate the h2 header and append to container
    var msgEl = document.createElement("div")
    msgEl.classList=("streamingMessage")
    msgEl.textContent = (msg);
    linkContainer.appendChild(msgEl);

    // create ul to house the list of links
    var ulEl = document.createElement('linkList');

    // Use object.keys to create an array of the names of the streaming options available 
    var options = Object.keys(data.streamingInfo);

    if (options[0] == null) {
        // if options array is empty, then teh object was returned and no streaming services were found
        // so create a failure message and display it to the user
        msg = "We were not able to find streaming availability for " + title + ". Thank you for using find-a-flick!";

        var linkContainer = document.createElement('watchOptions');

        // populate the h2 header and append to container
        var msgEl = document.createElement("h2")
        msgEl.textContent = (msg);
        linkContainer.appendChild(msgEl);

        document.body.appendChild(linkContainer);

    } else {
        // if options array is not empty, then streaming services were returned
        // create success message
        msg = "Thank you for using find-a-flick! Your selection of " + title + " is available to stream at:"

        var linkContainer = document.createElement('watchOptions');

        // populate the h2 header and append to container
        var msgEl = document.createElement("h2")
        msgEl.textContent = (msg);
        linkContainer.appendChild(msgEl);

        // then loop through the array of options to access the link for each
        // ex data.streamingInfo[key = netflix].us.link;
        // with each iteration also save the text name of the option.
        for (var i = 0; i < options.length; i++) {
            var key = options[i];
            var link = data.streamingInfo[key].us.link;

            var newTab = "_blank";

            // save the streaming option as a string
            var tempString = options[i];

            // then use charAt() to split off the first character into its own string and capitalize it with toUpperCase
            // then concatenate that with everything after the first character in tempString
            // to receive the service name capitalized.
            var serviceName = tempString.charAt(0).toUpperCase() + tempString.slice(1);

            // create list item and link el
            var optEl = document.createElement("li");
            var linkEl = document.createElement('streamingLink');

            // set link to linkS href to go to the streaming service and correct name
            linkEl.setAttribute("href", link);
            // set target to _blank so link opens a new tab
            linkEl.setAttribute("target", newTab);
            linkEl.textContent = (serviceName);
            optEl.appendChild(linkEl);
            ulEl.appendChild(optEl);
        };

        var serviceLinks = document.createElement("nav");
        serviceLinks.appendChild(ulEl);

        linkContainer.appendChild(serviceLinks);

        document.body.appendChild(linkContainer);
    }
};


// add onload="test()" to html
var test = function (){
    var testStr = "Simpsons";
    var key = "38c2d6859bmsh6250293f6ae6019p10b60ejsnb83f50f7665d";
    console.log(1);
    getMovieInfo(testStr, key);
    console.log(2);
    saveSearch(testStr);
    // That 70s Show returns an object but no streaming
    // Simpsons returns multiple streaming options
    // Wallace and Gromit 404s and doesen't return an object
};

var saveSearch = function (title) {
    // length + 1 so nothing is overwritten
    key = localStorage.length + 1;
    var value = title;
    // save user entered title and key to local storage
    localStorage.setItem(key, JSON.stringify(value));

    // create past search element to append to the nav dropdown
    var pastSearch = document.createElement("a");
    pastSearch.setAttribute("id", key);
    pastSearch.setAttribute("class", "navbar-item");
    pastSearch.textContent = (title);

    // append the elment to nav dropdown
    document.getElementById("recent-search").appendChild(pastSearch);
};


$("#btn").click(function(event) {
    // Prevent page from reloading
    event.preventDefault();

    // Set sibling form text value to variable
    var movieTitle = $(this).siblings(".form").text();

    // Grab user entered API Key and pass along
    var key = $("#api-key").text(); 

    // send variable "Movie title" into fetch request
    getMovieInfo(movieTitle, key);
});

$(".navbar-item").click(function(event) {
    // Prevent page from reloading
    event.preventDefault();
    console.log("triggered")

    var key = $(this).attr("id");
    console.log(key);

    // pull key from local storage
    var api = JSON.parse(localStorage.getItem(key));

    // pull title from local storage. 
    var movieTitle = JSON.parse(localStorage.getItem(key));
    console.log(movieTitle);
    
    getMovieInfo(movieTitle, api)

});

