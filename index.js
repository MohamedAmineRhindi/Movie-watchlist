const searchForm = document.getElementById("search-form")
const searchResults = document.getElementById("search-results")
const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const savedMoviesStr = localStorage.getItem("myMoviesImdbID")
let savedMovies = savedMoviesStr ? JSON.parse(savedMoviesStr) : new Array()
console.log(savedMovies)

function getSearchResultHtml(movie) {
    const { Poster, Title, Year, imdbRating, Runtime, Genre, Plot } = movie
    const btn = savedMovies.find(imdbID => imdbID === movie.imdbID) ? "-" : "+"
    return `
        <div class="result-container">
            <img src=${Poster} class="movie-image">
            <div class="movie-info-container">
                <h2>${Title} (${Year})<span class="movie-score"> ⭐ ${imdbRating}</span></h2>
                <div class="movie-info">
                    <p>${Runtime}</p><p>${Genre}</p><div class="add-movie-box"><button class="add-delete-movie">${btn}</button><p>Watchlist</p></div>
                </div>
                <p class="movie-synopsis">${Plot}</p>
            </div>
        </div>
    `
}

function sortMoviesByYear(movies) {
    return movies.Search.sort((movie1, movie2) => {
        const diff = Number(movie2.Year) - Number(movie1.Year)
        if (diff) { return diff > 0 ? 1 : diff < 0 ? -1 : 0 } else { return 1 }
    })
}

function getNotFoundHtml() {
    return `<h3 class="empty-search">Unable to find what you’re looking for.<br> Please try another search.</h3>`
}

searchForm.addEventListener("submit", event => {
    event.preventDefault()
    searchResults.innerHTML = ""
    searchInput.disabled = true
    searchBtn.disabled = true
    let sortedMoviesByYear = []
    const url = `https://www.omdbapi.com/?apikey=ed083483&s=${searchInput.value}`

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.Search) {
                sortedMoviesByYear = sortMoviesByYear(data)
            }
            const urls = sortedMoviesByYear.map(movie => fetch(`https://www.omdbapi.com/?apikey=ed083483&i=${movie.imdbID}`))
            return urls
        })
        .then(promiseArray => Promise.all(promiseArray))
        .then(responses => responses.map(res => res.json()))
        .then(responses => Promise.all(responses))
        .then(data => {
            const SearchResultHtml = data.map(movie => getSearchResultHtml(movie)).join("")
            searchResults.innerHTML = SearchResultHtml ? SearchResultHtml : getNotFoundHtml()
            const addDeleteBtn = document.getElementsByClassName("add-delete-movie")
            for (let i = 0; i < addDeleteBtn.length; i++) {
                addDeleteBtn[i].addEventListener("click", () => {
                    if (!savedMovies.find(imdbID => imdbID === data[i].imdbID)) {
                        savedMovies.unshift(data[i].imdbID)
                        localStorage.setItem("myMoviesImdbID", JSON.stringify(savedMovies))
                        console.log(savedMovies)
                        addDeleteBtn[i].textContent = "-"
                    } else {
                        savedMovies = savedMovies.filter(imdbID => imdbID !== data[i].imdbID)
                        localStorage.setItem("myMoviesImdbID", JSON.stringify(savedMovies))
                        addDeleteBtn[i].textContent = "+"
                        console.log(savedMovies)
                    }

                })
            }
            searchInput.disabled = false
            searchBtn.disabled = false
        })
})


