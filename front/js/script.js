const itemListing = document.querySelector('#items');
const productCard = document.getElementById('product-card-template');


// Prepare request to the server - create a new instance of XMLHttpRequest()
let apiRequest = new XMLHttpRequest();

// Make a request to fetch product data from http://localhost:3000/api/products
const requestPromise = new Promise((resolve, reject) => {
    // Open a request, do a GET request. 
    // All the products live as an array in http://localhost:3000/api/products
    apiRequest.open('GET', 'http://localhost:3000/api/products');

    // Event handler, called when readyState property of XMLHttpRequest() changes
    // Checks state of the request
    apiRequest.onreadystatechange = () => {

        // If 4 (Complete) and status is successful (200)
        // Parse the response, and resolve the promise with the parsed data.
        // API returns JSON, but the request receives it as text. 
        if (apiRequest.readyState === 4) {
            const responseClean = JSON.parse(apiRequest.response);
            resolve(responseClean);

        // If the status is unsucessful
        // Parse the response, and reject the promise.
        } else if (apiRequest.readyState === 4 && apiRequest.status !== 200) {
            reject(JSON.parse(apiRequest.response));
        }
    };

    apiRequest.send();
});


// Use the Promise
requestPromise
    //then() method is called if the Promise is resolved (successful response)
    .then(response => {
        console.log(response); // Handle the successful response

        // Loop through the product data and populate the product cards
        response.forEach(product => {
            // Clone the template
            const clonedProductCard = productCard.cloneNode(true);

            // Update the cloned product card with data
            clonedProductCard.href = `./product.html?id=${product._id}`;
            clonedProductCard.querySelector('img').src = product.imageUrl;
            clonedProductCard.querySelector('img').alt = product.altTxt;
            clonedProductCard.querySelector('.productName').textContent = product.name;
            clonedProductCard.querySelector('.productDescription').textContent = product.description;

            // Make the cloned product card visible
            clonedProductCard.style.display = 'flex';

            // Append the product card to the container
            itemListing.appendChild(clonedProductCard);

            // hide the original template
            productCard.style.display = 'none';
        });
    })

    //catch() method is called if the Promise is rejected (error).
    .catch(error => {
        console.error(error); // Handle the error
    });











