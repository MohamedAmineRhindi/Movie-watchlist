const searchForm = document.getElementById("search-form")
const searchResults = document.getElementById("search-results")
const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")

searchForm.addEventListener("submit", event => {
    event.preventDefault()
    searchResults.innerHTML = ""
    searchInput.disabled = true
    searchBtn.disabled = true
    let sortedMoviesByYear = []
    const url = `http://www.omdbapi.com/?apikey=ed083483&s=${searchInput.value}`

    firstFetch = fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.Search) {
                sortedMoviesByYear = sortMoviesByYear(data)
            }
            const urls = sortedMoviesByYear.map(movie => fetch(`http://www.omdbapi.com/?apikey=ed083483&i=${movie.imdbID}`))
            return urls
        })
        .then(promiseArray => Promise.all(promiseArray))
        .then(responses => responses.map(res => res.json()))
        .then(responses => Promise.all(responses))
        .then(data => {
            const SearchResultHtmlArray = data.map(movie => getSearchResultHtml(movie))
            searchResults.innerHTML = SearchResultHtmlArray.join("")
            searchInput.disabled = false
            searchBtn.disabled = false
        })
})

function getSearchResultHtml(movie) {
    const {Poster, Title, Year, imdbRating, Runtime, Genre, Plot} = movie
    return `
        <div class="result-container">
            <img src=${Poster} class="movie-image">
            <div class="movie-info-container">
                <h2>${Title} (${Year})<span class="movie-score">⭐ ${imdbRating}</span></h2>
                <div class="movie-info">
                    <p>${Runtime}</p><p>${Genre}</p><div class="add-movie-box"><button class="add-delete-movie">+</button><p>Watchlist</p></div>
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