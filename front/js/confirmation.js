let orderId = document.querySelector('#orderId');

// Extract product ID from url using regex
const regexPattern = /orderId=(.*)/;
const regexMatch = regexPattern.exec(window.location.href);

//add the orderID text in the page.
orderId.textContent = regexMatch[1];