const itemListing = document.querySelector('#items');
const productCard = document.getElementById('product-card-template');


// Prepare request
let apiRequest = new XMLHttpRequest();

// Create a Promise
const requestPromise = new Promise((resolve, reject) => {
    apiRequest.open('GET', 'http://localhost:3000/api/products');

    apiRequest.onreadystatechange = () => {
        if (apiRequest.readyState === 4) {
            // API returns JSON, but the request receives it as text. 
            const responseClean = JSON.parse(apiRequest.response);
            resolve(responseClean);

        } else if (apiRequest.readyState === 4 && apiRequest.status !== 200) {
            // Reject the promise if the status is not 200
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











// const productCard = document.querySelector('#product-card');
// var clone = productCard.cloneNode(true);

// itemListing.appendChild(clone);
// clone = productCard.cloneNode(true);
// itemListing.appendChild(clone);
// clone = productCard.cloneNode(true);
// itemListing.appendChild(clone);
// clone = productCard.cloneNode(true);

// productName.textContent = responseClean[0].name;
// productDescription.textContent = responseClean[0].name;