//set constants to be used by the functions. 
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

// Retrive items from localStorage, convert to JSON.
// If there is not cart in localStorage, create an empty array. 
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];


//get product details using the product ID
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


//use the information returned by getProductDetails to create and populate each product card in the cart.
async function populateCartItem(item) {
    try {
        //run getProductDetails by using the id stored in item within cartItems (localStorage)
        //the returned json product info will be stored in const response
        const response = await getProductDetails(item._id);

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


//loop through each item inside cartItems (localStorage), pass item to populateCartItem() function
async function populate() {
    for (const item of cartItems) {
        await populateCartItem(item);
    }
}


//update total quantity, price, cart array, and push to localstorage whenever an item quantity is changed.
function quantityChange() {

    //get all the quantity input fields in an array
    const quantityField = document.querySelectorAll('.cart__item__content__settings__quantity input');

    //loop through array of quantityField and add a listener and other commands.
    for (qf of quantityField) {
        // console.log(qf.value);

        // listen for changes, when the value changes or input loses focus
        // $event has information about the element that triggered the change
        qf.addEventListener ('change', async ($event) => {

            //get the <article> element closest to where the event occured. 
            const article = $event.target.closest('article');

            //get the dataId and dataColor from the article element.
            const dataId = article.getAttribute('data-id');
            const dataColor = article.getAttribute('data-color');

            //update the total quantity field
            quantityTotalUpdate();

            //update the total quantity field
            priceTotalUpdate();

            //update cart array using the constants set here. 
            updateCartItems(dataId, dataColor, article);

            //push array to localStorage
            pushToLocalStorage()
        });
    };
}


//update total quantity, price, cart array, and push to localstorage whenever an item is deleted.
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

            //use the index to locate and remove the item within cartItem, remove 1 element. 
            cartItems.splice(matchIndex, 1);

            //update localStorage
            pushToLocalStorage();

            //reload the page to repopulate the listing with the updated localStorage
            location.reload();
        });
    }

}

//set the total to 0 and add to it all the quantities shown in the quantity input. 
function quantityTotalUpdate() {

    const quantityField = document.querySelectorAll('.cart__item__content__settings__quantity input');
    //set the total to 0 before adding up the quantities. 
    let QtySum = parseInt(0);

    for (qf of quantityField) {
        QtySum += parseInt(qf.value);

        totalQuant.textContent = QtySum;
    };
}

//set the total to 0 and add to it all the item total prices (quantity*price. Use prices from API for the calculation.
async function priceTotalUpdate() {
    //set the new price sum to 0
    let PriceSum = parseInt(0);
    //get all the cart items
    const cartCardAll = document.querySelectorAll('.cart__item');

    //loop through cart items
    for (item of cartCardAll) {
        //for each product, grab their ID. 
        const itemID = item.getAttribute('data-id');

        //pass the ID to getProductDetails to get the price from the API
        const response = await getProductDetails(itemID);
        const priceAPI = response.price;

        //grab the qty for the item
        const qf = item.querySelector('.cart__item__content__settings__quantity input');

        //multiple quantity with price from API, and add it to the total price sum. 
        PriceSum += parseInt(qf.value) * parseInt(priceAPI);
        //update the total price html element
        totalPrice.textContent = PriceSum;
    };
}

//update cart items object to match the quantity shown in the cart page. 
//using the id, color and article from the item where a quantity change was detected.
function updateCartItems(id, color, article) {

    // use the article (closest article) and grab value of quantity input field
    const qty = article.querySelector('input').value;
    // console.log(qty);

    // locate the item in cartItem with the same id and color as the ones passed into this function.  
    const match = cartItems.find(item => item._id === id && item.color === color);

    if (match) {
        // if it matches, add the quantity in the dropdown to the match quantity.
        match.quantity = String(qty);
    }

    //for scenarios where user types in 0 in the quantity input.
    //get the index of the item within cartItems with the same id and color. 
    const matchIndex = cartItems.findIndex(item => item._id === id && item.color === color);
    const deleteBtnAll = document.querySelectorAll('.deleteItem');

    //if the quantity in the input field is 0, click the appropiate delete button. 
    //use the index to click the right delete button, which runs the deleteButton function. 
    if (qty === '0') {
        console.log('delete me');
        deleteBtnAll[matchIndex].click();
    }

    // console.log(cartItems);
}

//push cartItems object to localstorage.
function pushToLocalStorage() {
    // convert the cartItems array to a JSON string and store it in localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Retrieve the JSON string from localStorage
    const storedCart = localStorage.getItem('cart');
    
    // Parse the JSON string back into a JavaScript object
    const parsedCart = JSON.parse(storedCart);
    
    console.log(parsedCart);
}


//used to hide the product card template after it's been used for cloning. 
function hideTemplate() {
    cartCard.outerHTML = '<!-- -->';
}





//Form validation
//Access the Order button
const order = document.querySelector('#order');


//each field has a boolean value of true/false, defaulted to false.
let isFirstNameValid = false;
let isLastNameValid = false;
let isAddressValid = false;
let isCityValid = false;
let isEmailValid = false;


//Return boolean values for of the fields, used to check each field after user clicks Submit. 
function allValidator() {
    return [isFirstNameValid, isLastNameValid, isAddressValid, isCityValid, isEmailValid];
}


//Only accept letter characters, show error message and set field's boolean to false when anything else is typed. 
function validateFirstName() {
    const regexOnlyAlpha = /^[a-zA-Z]+$/;
    const firstName = document.querySelector('#firstName');
    const firstNameError = document.querySelector('#firstNameErrorMsg');
    
    //listen to every input event, runs after usr types anything in the field.
    firstName.addEventListener('input', ($event) => {
        const value = $event.target.value;
        //regex matches any single or multiple spaces, replace with empty string.
        const valueNoSpaces = value.replace(/\s+/g, ''); 

        try {
            //if input passes the only character test, set isFirstNameValud to True. 
            if (regexOnlyAlpha.test(valueNoSpaces)) {
                console.log('Input is valid');
                isFirstNameValid = true;
                throw '';
            }
            //if field is empty
            if (valueNoSpaces === '') {
                console.log('Input is invalid');
                isFirstNameValid = false;
                throw 'Please enter your first name.';
            } 
            //if field has non-letter characters
            else {
                console.log('Input is invalid');
                isFirstNameValid = false;
                throw 'We do not accept numbers or special characters.';
            }
        }

        //catch the error thrown in the try block
        catch(error){
            //set the error text in the html
            firstNameError.textContent = error;
        }

        console.log(isFirstNameValid);
        console.log(allValidator());

    });
}

//Only accept letter characters, show error message and set field's boolean to false when anything else is typed. 
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

//Accep alphanumeric, hash and period, show error message and set field's boolean to false when anything else is typed. 
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


//Accept letter characters and period, show error message and set field's boolean to false when anything else is typed. 
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

//Accepts emails with @ and at least 2 characters in the top level domain.
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

        //bring in the validator array only when the submit button is clicked.
        const arrayValid = allValidator();

        //use checkValid to evaluate every item within the arrayValid array. 
        //.every() returns true if all items pass the test. 
        let allValid = arrayValid.every(checkValid);

        if (allValid === true) {
            console.log('ALL GOOD');

            //grab values of the fields and create a contact object to be used in POST request. 
            const contact = {
                firstName: document.querySelector('#firstName').value,
                lastName: document.querySelector('#lastName').value,
                address: document.querySelector('#address').value,
                city: document.querySelector('#city').value,
                email: document.querySelector('#email').value,
            };

            //create an empty products array to be used in the POST request.
            const products = []

            //push the product ids in the cart to the product array. 
            for (item of cartItems) {
                products.push(item._id);
            }

            //data constant to be used in the POST request. 
            const data = {contact, products};

            //making the POST request.
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

                //clear the localStorage as the order has been submitted.
                localStorage.clear();
        
                // Get the orderId form the response
                const orderId = data.orderId;

                // get the current file path
                const currentFilePath = window.location.href;

                // replace "cart.html" with "confirmation.html"
                const confirmationURLString = currentFilePath.replace('cart.html', 'confirmation.html');
                console.log(confirmationURLString);

                // create an URL from the string
                confirmationURL = new URL(confirmationURLString);

                // Append the orderId as a query parameter
                confirmationURL.searchParams.append('orderId', orderId);
                console.log(confirmationURL);

                //navigate to the confirmation page with the order confirmation number appended. 
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






    










