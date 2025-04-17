document.addEventListener("DOMContentLoaded", function () {
    let loginForm = document.getElementById("login-form");
    let signupForm = document.getElementById("signup-form");
    let showSignupLink = document.getElementById("show-signup");
    let showLoginLink = document.getElementById("show-login");
    let signupBtn = document.getElementById("signup-btn");
    let formContainer = document.getElementById("form-container");
    let newContainer = document.getElementById("new-container");
    let setOrderBtn = document.getElementById("set-order-btn");
    let checkStatusBtn = document.getElementById("check-status-btn");
    let setOrderContainer = document.getElementById("setOrderPage");
    let checkStatusContainer = document.getElementById("checkStatusPage");


    let formPageIcon = document.getElementById("form-page-icon");
    let newContainerPageIcon = document.getElementById("newcontainer-page-icon");
    let backTonewContainerPageIcon = document.getElementById("backto-newcontainer-page-icon");


    let checkStatBtn = document.getElementById("fetchStatusBtn");
    let orderInput = document.getElementById("orderInput");
    let statusMessage = document.getElementById("statusMessage");
    let parcelImage = document.getElementById("parcelImage");
    

    function clearFormFields() {

        document.querySelectorAll("input").forEach(input => {
            input.value = "";  // Clear input value
        });
    
        document.querySelectorAll(".error").forEach(error => {
            error.innerText = ""; // Clear error messages
            error.style.display = "none";
        });

         // ✅ Hide parcel image and messages
         const img = document.getElementById("parcelImage");
         const msg = document.getElementById("parcelMessage");
         const status = document.getElementById("statusMessage");
        if (img) img.style.display = "none";
        if (msg) {
            msg.innerText = "";
            msg.style.display = "none";
            document.getElementById("celebrationMessage").style.display = "none";
        }
        if (status) status.textContent = "";
    }

    // Switch to Sign Up Form
    showSignupLink.addEventListener("click", function (event) {
        event.preventDefault();
        clearFormFields(); // Clear fields before showing signup
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    // Switch to Login Form
    showLoginLink.addEventListener("click", function (event) {
        event.preventDefault();
        clearFormFields(); // Clear fields before showing login
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Validate Signup Form and Send Data to Backend
    signupBtn.addEventListener("click", function (event) {
        event.preventDefault();

        let fullName = document.getElementById("fullname").value.trim();
        let phone = document.getElementById("phone").value.trim();
        let userId = document.getElementById("userid").value.trim();
        let password = document.getElementById("password").value.trim();

        let nameError = document.getElementById("nameError");
        let phoneError = document.getElementById("phoneError");
        let userIdError = document.getElementById("userIdError");
        let passwordError = document.getElementById("passwordError");

        let isValid = true;

        // Full Name Validation (Allow multiple words)
        let namePattern = /^[A-Z][a-z]+\s[A-Z][a-z]+$/;
        
        if (!namePattern.test(fullName)) {
            nameError.innerText = "Enter a valid full name (First Last format)";
            nameError.style.display = "block";
            isValid = false;
        } else {
            nameError.style.display = "none";
        }

        // Phone Number Validation (10 Digits)
        let phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(phone)) {
            phoneError.innerText = "Phone number must be exactly 10 digits";
            phoneError.style.display = "block";
            isValid = false;
        } else {
            phoneError.style.display = "none";
        }

        // User ID Validation (Starts with uppercase, followed by digits)
        let userIdPattern = /^[A-Z][a-zA-Z0-9]{4,}$/;
        if (!userIdPattern.test(userId)) {
            userIdError.innerText = "User ID must start with an uppercase letter and be at least 5 characters long";
            userIdError.style.display = "block";
            isValid = false;
        } else {
            userIdError.style.display = "none";
        }

        // Password Validation (Minimum 6 characters)
        if (password.length < 6) {
            passwordError.innerText = "Password must be at least 6 characters long";
            passwordError.style.display = "block";
            isValid = false;
        } else {
            passwordError.style.display = "none";
        }

        // If all validations pass, send data to backend
        if (isValid) {
            const userData = {
                name: fullName,
                mobile_number: phone,
                user_id: userId,
                password: password
            };

            // const host = process.env.HOST || "localhost";
            // const port = 5001;

            fetch("http://localhost:5001/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response Message:", data.message);
                if (data.message === "✅ User registered successfully! now LOGIN to move further.") {
                     alert("Signup successful! Now login with the same ID to move further.");
                     clearFormFields();

                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Signup failed. Please try again.");
            });
        }
    });

    let loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", function (event) {
        event.preventDefault();

        let userId = document.getElementById("login-userid").value.trim();
        let password = document.getElementById("login-password").value.trim();

        let loginUserIdError = document.getElementById("loginUserIdError");
        let loginPasswordError = document.getElementById("loginPasswordError");

        const errorMessage = document.getElementById("login-error-message");

        let isValid = true;

        // Validate user ID
        if (userId === "") {
            loginUserIdError.innerText = "User ID is required";
            loginUserIdError.style.display = "block";
            isValid = false;
        } else {
            loginUserIdError.style.display = "none";
        }

        // Validate password
        if (password === "") {
            loginPasswordError.innerText = "Password is required";
            loginPasswordError.style.display = "block";
            isValid = false;
        } else {
            loginPasswordError.style.display = "none";
        }

        if (isValid) {


            const loginData = { user_id: userId, password: password };

            // const host = process.env.HOST || "localhost";
            // const port = 5001;
            // const BASE_URL = `http://${host}:${port}`;

            fetch(`http://localhost:5001/api/auth/login`,  {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            })
            .then(response => response.json())
            .then(data => {
                console.log("🔍 API Response:", data);  // NEW LOG TO SEE RESPONSE
                if (data.message.includes("Login successful!")) {
                    alert("Login successful!");

                    // Store JWT token in localStorage
                    localStorage.setItem("authToken", data.token);

                    // Hide login form and show new container
                    formContainer.classList.add("hide");
                    newContainer.classList.add("show");
                } else {
                    console.warn("⚠️ Login failed:", data.message);
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Login failed. Please try again.");
            });
        }
    });

    setOrderBtn.addEventListener("click", function (event) {
        
        clearFormFields();
        document.getElementById("orderId").value="";
        newContainer.classList.add("hide");
        setOrderContainer.classList.add("show");
    });

    checkStatusBtn.addEventListener("click", async function (event) {
    
        clearFormFields();
        newContainer.classList.add("hide");
        checkStatusContainer.classList.add("show");
        
    });



    const fireConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
      
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.4 }
          });
        }, 300);
      };


   // Fetch Parcel Image on Button Click
checkStatBtn.addEventListener("click", function () {
    let orderId = orderInput.value.trim();

    if (!orderId) {
        statusMessage.textContent = "Please enter an Order ID!";
        return;
    }

    statusMessage.textContent = "Loading...";
    parcelImage.style.display = "none"; // Hide image initially
    parcelMessage.style.display = "none"; // Hide message initially

    console.log(`Fetching image for Order ID: ${orderId}`);

    fetch(`http://localhost:5001/api/getParcelImage/${orderId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Received Data:", data);

            const imgElement = document.getElementById("parcelImage");
            const messageElement = document.getElementById("parcelMessage");

            if (data.success) {
                if (data.status === "image") {
                    // ✅ Correctly assign the base64 image
                    imgElement.src = data.image; 
                    imgElement.style.display = "block";

                    document.getElementById("celebrationMessage").style.display = "block";
                    fireConfetti();

                    messageElement.style.display = "none";
                    statusMessage.textContent = "";
                } else if (data.status === "waiting") {
                    imgElement.style.display = "none";
                    document.getElementById("celebrationMessage").style.display = "none";
                    messageElement.innerText = "Waiting...";
                    messageElement.style.display = "block";
                    statusMessage.textContent = "";
                }
            } else {
                imgElement.style.display = "none";
                messageElement.innerText = "No such Order ID exists.";
                document.getElementById("celebrationMessage").style.display = "none";
                messageElement.style.display = "block";
                statusMessage.textContent = "";
            }
        })
        .catch(err => {
            console.error("Error fetching image:", err);
            statusMessage.textContent = "Error fetching status. Try again later.";
        });
});

    if (formPageIcon) {
        formPageIcon.addEventListener("click", function (event) {
                event.preventDefault();
                clearFormFields();
                // Hide new container
                newContainer.classList.remove("show");
        
                // Show form container
                formContainer.classList.remove("hide");
        });
    }

    if (newContainerPageIcon) {
        newContainerPageIcon.addEventListener("click", function (event) {
                event.preventDefault();
        
                
                // Hide new container
                checkStatusContainer.classList.remove("show");
        
                // Show form container
                newContainer.classList.remove("hide");
        });
    }

    if (backTonewContainerPageIcon) {
        backTonewContainerPageIcon.addEventListener("click", function (event) {
                event.preventDefault();
                
                // Hide new container
                setOrderContainer.classList.remove("show");
        
                // Show form container
                newContainer.classList.remove("hide");
        });
    }

    let submitButton = document.getElementById("blue-btn");

    if (submitButton) {

        console.log("✅ Submit button found!");

    submitButton.addEventListener("click", function (event) {
        event.preventDefault();

        let orderId = document.getElementById("orderId").value.trim();
        let userToken = localStorage.getItem("authToken"); // Retrieve stored JWT token

        if (!orderId) {
            alert("Please enter a valid Order ID");
            return;
        }

        // const host = process.env.HOST || "localhost";
        // const port = 5001;

        fetch(`http://localhost:5001/api/auth/set-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`  // Fix string interpolation
            },
            body: JSON.stringify({ orderId })
            // body: JSON.stringify({ order_id: orderId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Order ID updated successfully") {
                alert("Order ID stored in the database!");
                clearFormFields();
                
            } 
            
            else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to store Order ID. Try again.");
        });
    });
}

});
