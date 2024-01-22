// const productID = document.querySelector('#{product-ID}');
// const productColor = document.querySelector('#{product-color}');

const cartListing = document.querySelector('#cart__items');

const cartCard = document.querySelector('.cart__item');

const productName = document.querySelector('.cart__item__content__description h2');
const imageSrc = document.querySelector('.cart__item__img img').src;
const imageAlt = document.querySelector('.cart__item__img img').alt;
const color = document.querySelectorAll('.cart__item__content__description p')[0];
const price = document.querySelectorAll('.cart__item__content__description p')[1];

const quantity = document.querySelector('.itemQuantity');

const deleteBtn = document.querySelector('.deleteItem');

const totalQuant = document.querySelector('#totalQuantity');
const totalPrice = document.querySelector('#totalPrice');

// Retrive cart from localStorage, convert to JSON.
// If there is not cart in localStorage, create an empty array. 
// a||b means, return a if a is true, ortherwise return b. 
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
// console.log(cartItems);


async function getProductDetails(itemId) {
    try {
        //make an api request with the id of the item in question, return the product info in json format.
        const response = await fetch(`http://localhost:3000/api/products/${itemId}`);
        const product = await response.json();
        return product;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function populateCartItem(item) {
    try {
        //run getProductDetails by using the id stored in item within cartItems (localStorage)
        //the returned json product info will be stored in const response
        const response = await getProductDetails(item._id);
        // console.log(response);

        //for each product returned, clone and populate a product card.
        const clonedProductCard = cartCard.cloneNode(true);

        //set data-id and data-color attributes
        clonedProductCard.setAttribute('data-id', item._id);
        clonedProductCard.setAttribute('data-color', item.color);
        
        clonedProductCard.querySelector('.cart__item__content__description h2').textContent = response.name;
        clonedProductCard.querySelector('.cart__item__img img').src = response.imageUrl;
        clonedProductCard.querySelector('.cart__item__img img').alt = response.altTxt;
        clonedProductCard.querySelectorAll('.cart__item__content__description p')[1].textContent = '€' + response.price;

        clonedProductCard.querySelectorAll('.cart__item__content__description p')[0].textContent = item.color;
        clonedProductCard.querySelector('.itemQuantity').value = item.quantity;
        
        cartListing.appendChild(clonedProductCard);

        // add the quanity to the total quantity
        // add the price * quanity to the total price
        totalQuant.textContent = parseInt(totalQuant.textContent) + parseInt(item.quantity);
        totalPrice.textContent = parseInt(totalPrice.textContent) + parseInt(response.price * item.quantity);

    } catch (error) {
        console.error(error);
    }
}

async function populate() {
    //loop through each item inside cartItems (localStorage), pass item to populateCartItem() function
    for (const item of cartItems) {
        await populateCartItem(item);
    }
}


function quantityChange() {

    const quantityField = document.querySelectorAll('.cart__item__content__settings__quantity input');

    for (qf of quantityField) {
        // console.log(qf.value);

        qf.addEventListener ('change', async ($event) => {

            //get the element where the event occured. 
            const article = $event.target.closest('article');

            //get the dataId and dataColor from the article element.
            const dataId = article.getAttribute('data-id');
            const dataColor = article.getAttribute('data-color');

            const response = await getProductDetails(dataId);
            const priceAPI = response.price;

            //update the total quantity field
            quantityTotalUpdate();

            //update the total quantity field
            priceTotalUpdate();

            //update cart array
            updateCartItems(dataId, dataColor, article);

            //push array to localStorage
            pushToLocalStorage()
        });
    };
}


function deleteButton() {

    const deleteBtnAll = document.querySelectorAll('.cart__item__content__settings__delete');

    for (btn of deleteBtnAll) {

        btn.addEventListener ('click', ($event) => {

            //get the element where the event occured. 
            const article = $event.target.closest('article');

            //get the dataId and dataColor from the article element.
            const dataId = article.getAttribute('data-id');
            const dataColor = article.getAttribute('data-color');

            //get the index of the item within cartItems with the same id and color. 
            const matchIndex = cartItems.findIndex(item => item._id === dataId && item.color === dataColor);

            //use the index to locate and remove the item within cartItem. 
            cartItems.splice(matchIndex, 1);

            //update localStorage
            pushToLocalStorage();

            //reload the page to repopulate the listing with the updated localStorage
            location.reload();
        });
    }

}


function quantityTotalUpdate() {

    const quantityField = document.querySelectorAll('.cart__item__content__settings__quantity input');
    let QtySum = parseInt(0);

    for (qf of quantityField) {
        QtySum += parseInt(qf.value);

        totalQuant.textContent = QtySum;
    };
}

async function priceTotalUpdate() {

    let PriceSum = parseInt(0);
    const cartCardAll = document.querySelectorAll('.cart__item');

    //loop through cart products
    for (item of cartCardAll) {
        //for each product, grab their ID. 
        const itemID = item.getAttribute('data-id');

        //pass the ID to getProductDetails to get the price from the API
        const response = await getProductDetails(itemID);
        const priceAPI = response.price;

        //grab the qty for the product
        const qf = item.querySelector('.cart__item__content__settings__quantity input');

        // console.log(priceAPI);
        // console.log(qf.value);

        //multiple aty with price from API, and add it to the total price sum. 
        PriceSum += parseInt(qf.value) * parseInt(priceAPI);
        totalPrice.textContent = PriceSum;
    };
}

function updateCartItems(id, color, article) {
    // use the article (closest article) and grab value of quantity input field
    const qty = article.querySelector('input').value;
    console.log(qty);

    const match = cartItems.find(item => item._id === id && item.color === color);

    if (match) {
        // if it matches, add the quantity in the dropdown to the match quantity.
        match.quantity = String(qty);
    }

    //for scenarios where user types in 0 in tue quantity input.
    //get the index of the item within cartItems with the same id and color. 
    //use the index to click the right delete button. 
    const matchIndex = cartItems.findIndex(item => item._id === id && item.color === color);
    const deleteBtnAll = document.querySelectorAll('.deleteItem');

    if (qty === '0') {
        console.log('delete me');
        deleteBtnAll[matchIndex].click();
    }

    console.log(cartItems);
}

function pushToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    console.log(localStorage);
}

function hideTemplate() {
    cartCard.outerHTML = '<!-- -->';
}


//Form validation
const order = document.querySelector('#order');

let isFirstNameValid = false;
let isLastNameValid = false;
let isAddressValid = false;
let isCityValid = false;
let isEmailValid = false;

function allValidator() {
    return [isFirstNameValid, isLastNameValid, isAddressValid, isCityValid, isEmailValid];
}


function validateFirstName() {
    const regexOnlyAlpha = /^[a-zA-Z]+$/;
    const firstName = document.querySelector('#firstName');
    const firstNameError = document.querySelector('#firstNameErrorMsg');
    
    firstName.addEventListener('input', ($event) => {
        const value = $event.target.value;
        const valueNoSpaces = value.replace(/\s+/g, '');

        try {
            if (regexOnlyAlpha.test(valueNoSpaces)) {
                console.log('Input is valid');
                isFirstNameValid = true;
                throw '';
            }
            if (valueNoSpaces === '') {
                console.log('Input is invalid');
                isFirstNameValid = false;
                throw 'Please enter your first name.';
            } 
            else {
                console.log('Input is invalid');
                isFirstNameValid = false;
                throw 'We do not accept numbers or special characters.';
            }
        }

        catch(error){
            firstNameError.textContent = error;
        }

        console.log(isFirstNameValid);
        console.log(allValidator());

    });
}

function validateLastName() {
    const regexOnlyAlpha = /^[a-zA-Z]+$/;
    const lastName = document.querySelector('#lastName');
    const lastNameError = document.querySelector('#lastNameErrorMsg');

    lastName.addEventListener('input', ($event) => {
        const value = $event.target.value;
        const valueNoSpaces = value.replace(/\s+/g, '');
        
        try {
            if (regexOnlyAlpha.test(valueNoSpaces)) {
                console.log('Input is valid');
                isLastNameValid = true;
                throw '';
            }
            if (valueNoSpaces === '') {
                console.log('Input is invalid');
                isLastNameValid = false;
                throw 'Please enter your last name.';
            } 
            else {
                console.log('Input is invalid');
                isLastNameValid = false;
                throw 'We do not accept numbers or special characters.';
            }
        }

        catch(error){
            lastNameError.textContent = error;
        }

        console.log(isLastNameValid);
        console.log(allValidator());

    });
}

function validateAddress() {
    const regexAddress = /[!@$%^&*(),?":{}|<>]/;
    const address = document.querySelector('#address');
    const addressError = document.querySelector('#addressErrorMsg');

    address.addEventListener('input', ($event) => {
        const value = $event.target.value;

        try {
            if (regexAddress.test(value)) {
                console.log('Input is invalid');
                isAddressValid = false;
                throw 'Please enter a valid street number and street name.';
            } 
            if (value === '') {
                console.log('Input is invalid');
                isAddressValid = false;
                throw 'Please enter your street number and street name.';
            } 
            else {
                console.log('Input is valid');
                isAddressValid = true;
                throw '';
            }
        }

        catch(error){
            addressError.textContent = error;
        }

        console.log(isAddressValid);
        console.log(allValidator());
        
    });
}

function validateCity() {
    const regexCity = /^[a-zA-Z.-]+(?:[\s.][\/a-zA-Z]+)*$/;
    const city = document.querySelector('#city');
    const cityError = document.querySelector('#cityErrorMsg');

    city.addEventListener('input', ($event) => {
        const value = $event.target.value;
        const valueNoSpaces = value.replace(/\s+/g, '');
        
        try {
            if (regexCity.test(valueNoSpaces)) {
                console.log('Input is valid');
                isCityValid = true;
                throw '';
            } 
            if (valueNoSpaces === '') {
                console.log('Input is invalid');
                isCityValid = false;
                throw 'Please enter your city.';
            } 
            else {
                console.log('Input is invalid');
                isCityValid = false;
                throw 'Please enter a valid city name.';
            }
        }

        catch(error){
            cityError.textContent = error;
        }

        console.log(isCityValid);
        console.log(allValidator());
    });
}

function validateEmail() {
    const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const email = document.querySelector('#email');
    const emailError = document.querySelector('#emailErrorMsg');

    email.addEventListener('input', ($event) => {
        const value = $event.target.value;

        try {
            if (regexEmail.test(value)) {
                console.log('Input is valid');
                isEmailValid = true;
                throw '';
            }
            if (value === '') {
                console.log('Input is invalid');
                isEmailValid = false;
                throw 'Please enter your email address.';
            } 
            else {
                console.log('Input is invalid');
                isEmailValid = false;
                throw 'Please enter a valid email address.';
            }
        }

        catch(error){
            emailError.textContent = error;
        }
        
        console.log(isEmailValid);
        console.log(allValidator());
    });
}


function orderBtn() {
    order.addEventListener('click', ($event) => {

        // prevent default behavior when clicked. 
        $event.preventDefault();

        function checkValid(item) {
            return item === true;
        };

        const arrayValid = allValidator();
        console.log(arrayValid);

        let allValid = arrayValid.every(checkValid);
        
        console.log(allValid);

        if (allValid === true) {
            console.log('ALL GOOD');

            const contact = {
                firstName: document.querySelector('#firstName').value,
                lastName: document.querySelector('#lastName').value,
                address: document.querySelector('#address').value,
                city: document.querySelector('#city').value,
                email: document.querySelector('#email').value,
            };

            const products = []

            for (item of cartItems) {
                products.push(item._id);
            }

            const data = {contact, products};


            fetch ('http://localhost:3000/api/products/order', {
                method: 'POST', 

                headers: {
                'Content-Type': 'application/json',
                },

                body: JSON.stringify(data), 
            })

            //turn the response into a json, pass it to the next .then()
            .then (response => response.json())

            .then (data => {
                console.log('Success:', data);
                console.log(data.orderId);
        
                let confirmationURL = new URL('http://127.0.0.1:5501/front/html/confirmation.html');
                confirmationURL.searchParams.append('orderId', data.orderId);
                console.log(confirmationURL);
                // add state to browser's history
        
                window.location.href = confirmationURL;
            })

            .catch ((error) => {
                console.error('Error:', error);
            });


        
        } else {
            console.log('PROBLEM!');
        }

        

    });
}


function saveOrder (data) {
    fetch ('http://localhost:3000/api/products/order', {
        method: 'POST', 

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(data), 
    })

    //turn the response into a json
    .then (response => response.json())

    .then (data => {
        console.log('Success:', data);
    })

    .catch ((error) => {
        console.error('Error:', error);
    });
}



async function execute() {
    await populate();
    quantityChange();
    deleteButton();
    hideTemplate();

    allValidator()
    validateFirstName();
    validateLastName();
    validateAddress();
    validateCity();
    validateEmail();

    orderBtn();
}

execute();






    










