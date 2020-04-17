let apiUrl = "https://www.omdbapi.com/?apikey=41e208eb";
let favoritesHTML = ``;

$(document).ready(function () {
  if (localStorage.length != 0) {
    $("#favorites-block").addClass("show");
    favoritesHTML = localStorage.getItem("html");
    $("#favorites").html(favoritesHTML);
  }
  $("#searchButton").click(() => SearchFilms(1));
  $("#searchField").keypress(function (e) {
    if (event.keyCode == 13) {
      SearchFilms(1);
    }
  });
});
function SearchFilms(pageNumber) {
  $("#details").removeClass("show");
  $("#pagination").removeClass("show");
  let stringPageNumber = "&page=" + pageNumber;
  let type = "&type=" + $('[type="radio"]:checked').val();
  let title = $("#searchField").val();
  title = "&s=" + title.replace(" ", "+");
  //Пошук фільмів
  fetch(apiUrl + title + type + stringPageNumber)
    .then((result) => result.json())
    .then((data) => {
      //Список фільмів
      let resultHTML = ``;
      let image = "";
      for (let i = 0; i < data.Search.length; i++) {
        image = data.Search[i].Poster;
        if (image == "N/A") {
          image = "img/no-poster.jpg";
        }
        resultHTML += `
        <div class="results__item">
            <div class="results__title">${data.Search[i].Title}</div>
            <div>
              <div class="results__details">
                  <span>Details...</span>
                  <div class="results__id">${data.Search[i].imdbID}</div>
              </div>
              <div class="results__favorites">
                  <span>Add to favorites</span>
                  <div class="results__id">${data.Search[i].imdbID}</div>
              </div>
            </div>
            <img src="${image}" alt="img">
        </div>`;
      }
      $("#results").html(resultHTML);

      //Пагінація

      let pageCount = Math.ceil(data.totalResults / 10);
      let pagination = `Pages: `;
      if (pageCount != 1) {
        $("#pagination").addClass("show");
        for (let page = 1; page <= pageCount; page++) {
          if (page == pageNumber) {
            pagination += `<div class="page page__active">${page}</div>`;
          } else {
            pagination += `<div class="page" >${page}</div>`;
          }
        }
        $("#pagination").html(pagination);
      }
      $("#pagination").click(function (pageButton) {
        SearchFilms($(pageButton.target).text());
      });
      //Детальна інформація про фільм
      $(".results__details").click((detailsButton) => {
        ShowDetails(detailsButton);
      });
      //Додати в favorites
      $(".results__favorites").click(function (favoritesButton) {
        AddToFavorites(favoritesButton);
      });
    })
    .catch(() => {
      $("#results").html("Movie not found");
    });
}
//Детальна інформація:
function ShowDetails(detailsButton) {
  let id = "&i=" + $(detailsButton.currentTarget.lastElementChild).html();
  $("#details").addClass("show");
  fetch(apiUrl + id)
    .then((idResult) => idResult.json())
    .then((idData) => {
      image = idData.Poster;
      if (image == "N/A") {
        image = "img/no-poster.jpg";
      }
      $("#details").html(`
          <div class="details__image"><img src="${image}" alt="img"></div>
          <div class="details__description">
              <div class="details__title">${idData.Title}</div>
              <div class="details__year">Year: <i>${idData.Year}</i></div>
              <div class="details__runtime">Runtime: <i>${idData.Runtime}</i></div>
              <div class="details__genre">Genre: <i>${idData.Genre}</i></div>
              <div class="details__actors">Actors: <i>${idData.Actors}</i></div>
          </div>
          <div class="details__plot"><i>${idData.Plot}</i></div>
      `);
    });
}
//Додати в улюблене:
function AddToFavorites(addButton) {
  $("#favorites-block").addClass("show");
  let id = "&i=" + $(addButton.currentTarget.lastElementChild).html();
  if (favoritesHTML.indexOf(id) == -1) {
    fetch(apiUrl + id)
      .then((favoritesRequest) => favoritesRequest.json())
      .then((favoritesData) => {
        image = favoritesData.Poster;
        if (image == "N/A") {
          image = "img/no-poster.jpg";
        }
        favoritesHTML += `
          <div class="favorites__result results__item ">
              <div class="favorites__result-title results__title ">${favoritesData.Title}</div>
              <div style="display:none">&i=${favoritesData.imdbID}</div>
              <div class="favorites__image"><img src="${image}" alt="img"></div>
          </div>
          `;
        $("#favorites").html(favoritesHTML);
        localStorage.setItem("html", favoritesHTML);
      });
  }
}
