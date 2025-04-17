document.addEventListener("DOMContentLoaded", function () {
    let userBtn = document.getElementById("user-btn");
    let deliveryBtn = document.getElementById("delivery-btn");
    let userInfo = document.getElementById("user-info");
    let deliveryInfo = document.getElementById("delivery-info");

    
    userBtn.addEventListener("click", function () {
        userInfo.classList.add("show");
        deliveryInfo.classList.remove("show"); 
    });

    
    deliveryBtn.addEventListener("click", function () {
        deliveryInfo.classList.add("show");
        userInfo.classList.remove("show"); 
    });
});
