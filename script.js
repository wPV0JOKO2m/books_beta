const search_form = document.querySelector(".search-button");
const loadingBar = document.querySelector(".loading-bar");
const resultsCount = document.querySelector(".results-count");
search_form.addEventListener("click", searchBooks);

const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

let startIndex = 0;
const maxResults = 30;
let currentQuery = "";
let currentCategory = "";
let currentSortOption = "relevance";

function searchBooks(event) {
  event.preventDefault();
  loadingBar.classList.add("active");

  const apitoken = "AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw";
  currentCategory = document.getElementById("category").value.toLowerCase();
  currentQuery = document.getElementById("userInput").value;
  currentSortOption = document.getElementById("sortOption").value;

  startIndex = 0;
  fetchBooks(apitoken);
}

function fetchBooks(apitoken) {
  let initialUrl;
  if (currentCategory === "all") {
    initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      currentQuery
    )}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apitoken}`;
  } else {
    initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      currentQuery + "+"
    )}subject:${currentCategory}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apitoken}`;
  }

  fetch(initialUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((result) => {
      loadingBar.classList.remove("active");
      resultsContainer.innerHTML = "";

      if (!result.items) {
        resultsContainer.innerHTML =
          '<div class="no-results">No books found.</div>';
        paginationContainer.innerHTML = "";
        resultsCount.textContent = "No results found";
        return;
      }

      resultsCount.textContent = `Found ${result.totalItems} results`;

      let books = result.items;
      if (currentSortOption === "date") {
        books = books.sort((a, b) => {
          const dateA = new Date(a.volumeInfo.publishedDate);
          const dateB = new Date(b.volumeInfo.publishedDate);
          return dateB - dateA;
        });
      }

      books.forEach((book) => {
        const cover = book.volumeInfo.imageLinks
          ? book.volumeInfo.imageLinks.thumbnail
          : "";
        const title = book.volumeInfo.title
          ? book.volumeInfo.title
          : "No Title";
        const authors = book.volumeInfo.authors
          ? book.volumeInfo.authors.join(", ")
          : "Unknown Author";
        const categories = book.volumeInfo.categories
          ? book.volumeInfo.categories[0]
          : "";

        const bookElement = document.createElement("div");
        bookElement.className = "book-card";
        bookElement.innerHTML = `
                    <img src="${cover || "placeholder-image.jpg"}" alt="cover">
                    <div class="content">
                        ${categories ? `<small>${categories}</small>` : ""}
                        <h3>${title}</h3>
                        <p>${authors}</p>
                    </div>
                `;

        bookElement.addEventListener("click", () => {
          showFullBookInfo(book.id, apitoken);
        });

        resultsContainer.appendChild(bookElement);
      });

      createPagination(result.totalItems);
    })
    .catch((error) => {
      loadingBar.classList.remove("active");
      console.error("Error fetching books:", error);
      resultsContainer.innerHTML =
        '<div class="error">Error loading books. Please try again.</div>';
      resultsCount.textContent = "";
    });
}

function createPagination(totalItems) {
  paginationContainer.innerHTML = "";

  if (startIndex > 0) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.addEventListener("click", () => {
      startIndex -= maxResults;
      const apitoken = "AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw";
      fetchBooks(apitoken);
      window.scrollTo(0, 0);
    });
    paginationContainer.appendChild(prevBtn);
  }

  if (startIndex + maxResults < totalItems) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      startIndex += maxResults;
      const apitoken = "AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw";
      fetchBooks(apitoken);
      window.scrollTo(0, 0);
    });
    paginationContainer.appendChild(nextBtn);
  }
}

function showFullBookInfo(bookId, apitoken) {
  loadingBar.classList.add("active");
  resultsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";
  resultsCount.textContent = "";

  const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apitoken}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      loadingBar.classList.remove("active");
      const vol = data.volumeInfo;

      const cover = vol.imageLinks ? vol.imageLinks.thumbnail : "";
      const title = vol.title ? vol.title : "No Title";
      const authors = vol.authors ? vol.authors.join(", ") : "Unknown Author";
      const description = vol.description
        ? vol.description
        : "No description available";
      const publishedDate = vol.publishedDate
        ? vol.publishedDate
        : "Unknown Date";
      const publisher = vol.publisher ? vol.publisher : "Unknown Publisher";
      const pageCount = vol.pageCount ? vol.pageCount : "Unknown";
      const categories = vol.categories
        ? vol.categories.join(" / ")
        : "No categories listed";

      const fullCard = document.createElement("div");
      fullCard.className = "full-book-view";
      fullCard.innerHTML = `
                <img src="${cover}" alt="cover">
                <div class="book-details">
                    <small>${categories}</small>
                    <h2>${title}</h2>
                    <p>${authors}</p>
                    <p><strong>Publisher:</strong> ${publisher}</p>
                    <p><strong>Published Date:</strong> ${publishedDate}</p>
                    <p><strong>Page Count:</strong> ${pageCount}</p>
                    <div class="description">
                        <h3>Description:</h3>
                        <p>${description}</p>
                    </div>
                    <button class="backtosearch" onclick="window.location.reload()">Back to Search</button>
                </div>
            `;

      resultsContainer.appendChild(fullCard);
    })
    .catch((error) => {
      loadingBar.classList.remove("active");
      console.error(error);
      resultsContainer.innerHTML =
        '<div class="error">Error loading book details. Please try again.</div>';
    });
}
