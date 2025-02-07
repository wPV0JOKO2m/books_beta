const search_form = document.getElementById("searchform");
search_form.addEventListener("submit", searchBooks);

const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

let startIndex = 0;
const maxResults = 30; // max amount of books per 1 page 
let currentQuery = '';
let currentCategory = '';
let currentSortOption = 'default';

function searchBooks(event) {
    event.preventDefault();

    const apitoken = 'AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw'; 

    //getting values for search selected by user from html 
    currentCategory = document.getElementById('category').value.toLowerCase(); //categories displayed with first symbol in uppercase when google only supports lower 
    currentQuery = document.getElementById("userInput").value;
    currentSortOption = document.getElementById("sortOption").value;

    startIndex = 0;
    fetchBooks(apitoken);
}

function fetchBooks(apitoken) {
    let initialUrl;
    // if selected category is 'all' just dont select any "subject"
    if (currentCategory === 'all') {
        initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentQuery)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apitoken}`;
    } else {
        initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentQuery + '+')}subject:${currentCategory}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apitoken}`;
    }


    //fetch google api and process recieved data 
    fetch(initialUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(result => {
            resultsContainer.innerHTML = '';
            if (!result.items) {
                resultsContainer.innerHTML = 'No books found.';
                paginationContainer.innerHTML = '';
                return;
            }

            let books = result.items;
            if (currentSortOption === 'date') { //some custom sorting method to firstly show newest books
                books = books.sort((a, b) => {


                    const dateA = new Date(a.volumeInfo.publishedDate);
                    const dateB = new Date(b.volumeInfo.publishedDate);
                    return dateB - dateA;
                });
            }

            books.forEach(book => {
                const cover = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : ''; // if some of params is not defined it will be changed with default value
                const title = book.volumeInfo.title ? book.volumeInfo.title : 'No Title';
                const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';


                //creating bookelement for every book in loop
                const bookElement = document.createElement("div");

                bookElement.innerHTML = `
                    <img src="${cover}" alt="cover" style="max-width:100px; display:block; margin-bottom:5px;">
                    <strong>Title:</strong> ${title}<br>
                    <strong>Author(s):</strong> ${authors}
                    <hr>
                `;

                bookElement.style.cursor = "pointer";
                bookElement.addEventListener("click", () => {
                    showFullBookInfo(book.id, apitoken);
                });

                resultsContainer.appendChild(bookElement);
            });

            createPagination(result.totalItems);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });
}

function createPagination(totalItems) {
    paginationContainer.innerHTML = ''; // clear data from previous searches

    if (startIndex > 0) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.addEventListener("click", () => {
            startIndex -= maxResults;
            const apitoken = 'AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw';
            fetchBooks(apitoken);
        });
        paginationContainer.appendChild(prevBtn);
    }


    if (startIndex + maxResults < totalItems) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.addEventListener("click", () => {
            startIndex += maxResults;
            const apitoken = 'AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw';
            fetchBooks(apitoken);
        });
        paginationContainer.appendChild(nextBtn);
    }
}

function showFullBookInfo(bookId, apitoken) {

    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';


//fetch google api to get full info about book
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apitoken}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const vol = data.volumeInfo; 

            const cover = vol.imageLinks ? vol.imageLinks.thumbnail : '';
            const title = vol.title ? vol.title : 'No Title';
            const authors = vol.authors ? vol.authors.join(', ') : 'Unknown Author';
            const description = vol.description ? vol.description : 'No description available';
            const publishedDate = vol.publishedDate ? vol.publishedDate : 'Unknown Date';
            const publisher = vol.publisher ? vol.publisher : 'Unknown Publisher';
            const pageCount = vol.pageCount ? vol.pageCount : 'Unknown';
            const categories = vol.categories ? vol.categories.join(', ') : 'No categories listed';


            const fullCard = document.createElement("div"); // create full card for book 
            fullCard.innerHTML = `
                <img src="${cover}" alt="cover" style="max-width:150px; display:block; margin-bottom:10px;">
                <strong>Title:</strong> ${title}<br>
                <strong>Author(s):</strong> ${authors}<br>
                <strong>Publisher:</strong> ${publisher}<br>
                <strong>Published Date:</strong> ${publishedDate}<br>
                <strong>Page Count:</strong> ${pageCount}<br>
                <strong>Categories:</strong> ${categories}<br>
                <p><strong>Description:</strong> ${description}</p>
            `;

            resultsContainer.appendChild(fullCard);
        })
        .catch(error => console.error(error));
}
