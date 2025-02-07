
//set listener on submitting search form
const search_form = document.getElementById("searchform");
search_form.addEventListener("submit", searchBooks);

var initialUrl;

function searchBooks(event) {
    event.preventDefault(); // Prevent the default form submission 

    // query constructing
    //define apitoken for google books api
    const apitoken = 'AIzaSyAeza6LN5uMwztmIVXSc7PUi5xOejhiNEw';
    // get category,sorting and query values.
    const categoryValue = document.getElementById('category').value.toLowerCase();
    const searchTerms = document.getElementById("userInput").value;
    const sortOption = document.getElementById("sortOption").value;

    if (categoryValue == 'all') { //no "subject" if all categories selected
        initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&key=${apitoken}`;
    } else {
        initialUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms + '+')}subject:${categoryValue}&key=${apitoken}`;
    }
    // make request to google api and proces data
    fetch(initialUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(result => {
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = ''; //clear previous request data

            if (result.items) {
                let sortedBooks;

               
                if (sortOption === 'date') { //some custom sorting func to view books by their publish date
                    sortedBooks = result.items.sort((a, b) => {
                        const dateA = new Date(a.volumeInfo.publishedDate);
                        const dateB = new Date(b.volumeInfo.publishedDate);
                        return dateB - dateA;
                    });
                } else {
                    // default  (no changes)
                    sortedBooks = result.items;
                }

                // iterate through each element of 
                sortedBooks.forEach(book => {
                    const title = book.volumeInfo.title;
                    const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';
                    const publishedDate = book.volumeInfo.publishedDate || 'Unknown Date'; // if published date is missing in given object, same with author in previous line
                    const bookElement = document.createElement("div");
                    bookElement.innerHTML = `<strong>Title:</strong> ${title} <br> <strong>Authors:</strong> ${authors} <br> <strong>Published Date:</strong> ${publishedDate}`;
                    
                    resultsContainer.appendChild(bookElement); // append the book element to the results container
                });
            } else {
                resultsContainer.innerHTML = 'No books found.';
            }
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });
}
