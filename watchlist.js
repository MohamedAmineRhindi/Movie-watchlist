
const searchResults = document.getElementById("search-results")
const savedMoviesStr = localStorage.getItem("myMoviesImdbID")
let savedMovies = savedMoviesStr ? JSON.parse(savedMoviesStr) : new Array()
console.log(savedMovies, savedMovies.length)

function getSavedMoviesHtml(movie) {
    const { Poster, Title, Year, imdbRating, Runtime, Genre, Plot, imdbID } = movie
    return `
        <div class="result-container" id="${imdbID}">
            <img src=${Poster} class="movie-image">
            <div class="movie-info-container">
                <h2>${Title} (${Year})<span class="movie-score"> ⭐ ${imdbRating}</span></h2>
                <div class="movie-info">
                    <p>${Runtime}</p><p>${Genre}</p><div class="add-movie-box"><button class="add-delete-movie">-</button><p>Watchlist</p></div>
                </div>
                <p class="movie-synopsis">${Plot}</p>
            </div>
        </div>
    `
}

function getEmptyWatchListHtml() {
    return `
        <h3 class="empty-search">Your watchlist is looking a little empty...</h3>
        <a href="./index.html"><button class="add-delete-movie">+</button> Let’s add some movies!</a>
    `
}


Promise.all(savedMovies.map(imdbID => fetch(`https://www.omdbapi.com/?apikey=ed083483&i=${imdbID}`)))
    .then(promiseArray => Promise.all(promiseArray))
    .then(responses => responses.map(res => res.json()))
    .then(responses => Promise.all(responses))
    .then(data => {
        const SearchResultHtml = data.map(movie => getSavedMoviesHtml(movie)).join("")
        searchResults.innerHTML = SearchResultHtml ? SearchResultHtml : getEmptyWatchListHtml()
        const addDeleteBtn = document.getElementsByClassName("add-delete-movie")
            for (let i = 0; i < addDeleteBtn.length; i++) {
                addDeleteBtn[i].addEventListener("click", () => {
                    savedMovies = savedMovies.filter(imdbID => imdbID !== data[i].imdbID)
                    localStorage.setItem("myMoviesImdbID", JSON.stringify(savedMovies))
                    document.getElementById(data[i].imdbID).remove()
                    console.log(savedMovies)
                    if(savedMovies.length === 0) {
                        searchResults.innerHTML = getEmptyWatchListHtml()
                    }
                })
            }
    })



