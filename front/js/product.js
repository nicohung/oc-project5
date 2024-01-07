const imageContainer = document.querySelector('.item__img');
const image = document.createElement('img');

const title = document.getElementById('title');
const price = document.getElementById('price');
const description = document.getElementById('description');

const colorContainer = document.getElementById('colors');

// Extract product ID from url using regex
const regexPattern = /(?<=\?id=)[^&]+/;
const regexMatch = regexPattern.exec(window.location.href);
const productID = regexMatch[0];
// console.log(productID);

const quantity = document.querySelector('#quantity');
const CTA = document.querySelector('#addToCart');

// Prepare request
let apiRequest = new XMLHttpRequest();

// Create a Promise
const requestPromise = new Promise((resolve, reject) => {
    apiRequest.open('GET', 'http://localhost:3000/api/products/' + productID);

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

        imageContainer.appendChild(image);
        image.src = response.imageUrl;
        image.alt = response.altTxt;

        price.textContent = response.price;
        description.textContent = response.description;

        let colorList = response.colors;
        for (i=0; i < colorList.length; i++) {
            const colorOption = document.createElement('option');
            colorContainer.appendChild(colorOption);
            colorOption.textContent = colorList[i];
            colorOption.value = colorList[i];
            // console.log(colorList[i]);
        };
    })

    //catch() method is called if the Promise is rejected (error).
    .catch(error => {
        console.error(error); // Handle the error
    });

// Retrive cart from localStorage, convert to JSON.
// If there is not cart in localStorage, create an empty array. 
// a||b means, return a if a is true, ortherwise return b. 
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];


CTA.addEventListener ('click', ($event) => {
    //prevent default behavior when clicked. 
    $event.preventDefault();

    const ATBProduct = {
        _id: productID,
        color: colorContainer.value,
        quantity: quantity.value,
    };

    const existingItemIndex = cartItems.findIndex(
        ATBProduct._id === _id && ATBProduct.color === color
    );

    // console.log(existingItemIndex);

    // cartItems.push(ATBProduct);
    console.log(cartItems);
    

});