const itemListing = document.querySelector('#items');
const productCard = document.getElementById('product-card-template');


// Make a request to fetch product data from http://localhost:3000/api/products using fetch
const requestPromise = new Promise((resolve, reject) => {
    fetch('http://localhost:3000/api/products')
        .then(response => {
            // Check if the response is successful (status code 200)
            if (response.ok) {
                return response.json(); // Parse the response as JSON
            } else {
                return response.json().then(errorData => {
                    throw new Error(errorData); // Throw an error to be caught by the catch block
                });
            }
        })
        .then(data => {
            resolve(data); // Resolve the promise with the parsed data
        })
        .catch(error => {
            reject(error); // Reject the promise with the error
        });
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











