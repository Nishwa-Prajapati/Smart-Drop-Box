document.addEventListener('DOMContentLoaded', () => {
    const otpBtn = document.getElementById('get-otp');
    const doneBtn = document.getElementById('done-btn');
    const timerDisplay = document.getElementById('timer');
    const captureBtn = document.getElementById('capture-btn');
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('captured-image');
    const imagePreview = document.getElementById('image-preview');
    let imageDataInput = document.getElementById("image-data");

    let stream;
    let countdown;
    let otpExpiryTime = 60;
    let otpTimerRunning = false;

    let isOrderIdValid = false;  // Set this based on your order validation logic
    let isOtpGenerated = false;  // Set when OTP is generated
    let isImageCaptured = false;  // Set when image is captured

    otpBtn.addEventListener('click', handleOtpRequest);
    doneBtn.addEventListener('click', handleDone);
    captureBtn.addEventListener('click', captureImage);


    // Add keydown event listener to handle "Enter" key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent default form submission or other behavior

            // Check which button to click based on the current form state
            if (isFormValid() && isOrderIdValid && !isImageCaptured) {
                // Trigger OTP request
                otpBtn.click();
            } else if (isOtpGenerated && !isImageCaptured) {
                // Trigger Done button (to proceed to capture image)
                doneBtn.click();
            } else if (isOtpGenerated && isImageCaptured) {
                // Trigger Capture button to capture image
                captureBtn.click();
            } else if (!isFormValid()) {
                alert("⚠️ Please fill all required fields before proceeding.");
            } else if (isFormValid() && !isOrderIdValid) {
                alert("⚠️ Order ID is invalid.");
            } else if (isFormValid() && isOrderIdValid && isImageCaptured) {
                alert("🚚 Delivery Already Done.");
            }
        }
    });

    // Helper function to validate the form fields
    function isFormValid() {
        let requiredFields = ["fname", "agencyname", "orderid", "mobileno", "email"];
        for (let fieldId of requiredFields) {
            let field = document.getElementById(fieldId);
            if (!field || !field.value) return false;  // If any field is empty
        }
        return true;
    }

    // Handle OTP Request
    async function handleOtpRequest(event) {
        event.preventDefault();

        // Get user inputs
        let fullName = document.getElementById("fname").value.trim();
        let agencyName = document.getElementById("agencyname").value.trim();
        let orderId = document.getElementById("orderid").value.trim();
        let mobileNo = document.getElementById("mobileno").value.trim();
        let email = document.getElementById("email").value.trim();

        // Validate fields
        if (!validateForm(fullName, agencyName, orderId, mobileNo, email)) {
            return; // Stop if validation fails
        }

        // Set Order ID validity flag
        isOrderIdValid = orderId ? true : false;

        // Disable OTP button to prevent multiple clicks
        otpBtn.disabled = true;

        try {
            // const host = process.env.HOST || "localhost";
            // const port = 5001;

            const response = await fetch('http://localhost:5001/api/register-delivery-guy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    agency_name: agencyName,
                    order_id: orderId,
                    mobile_number: mobileNo,
                    email: email
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Generate OTP for the valid orderId
                try {

                    // const host = process.env.HOST || "localhost";
                    // const port = 5001;

                    const otpResponse = await fetch("http://localhost:5001/api/generate-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ order_id: orderId, delivery_guy_name: fullName, email: email })
                    });

                    const otpResult = await otpResponse.json();

                    if (!otpResponse.ok) {
                        if (otpResult.message === "Delivery already completed for this Order ID") {
                            alert("🚚 Delivery is already completed for this Order ID.");
                            return;
                        } else {
                            alert(`⚠️ Error: ${otpResult.message}`);
                            otpBtn.disabled = false;
                            return;
                        }
                    }

                    // Set OTP generation flag
                    isOtpGenerated = true;
                    alert("✅ OTP sent successfully!");
                    toggleButtons();
                    startTimer(otpExpiryTime);

                } catch (error) {
                    console.error("Error generating OTP:", error);
                    alert("❌ Failed to generate OTP. Please try again.");
                    otpBtn.disabled = false;
                }
            } else {
                alert(data.message); // Show error message from backend
                otpBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred!");
            otpBtn.disabled = false;
        }
    }

    // Toggle visibility of buttons after OTP request
    function toggleButtons() {
        otpBtn.style.display = 'none';
        doneBtn.style.display = 'block';
        timerDisplay.style.display = 'inline';
    }

    // Start countdown timer for OTP expiry
    function startTimer(duration) {
        if (otpTimerRunning) return; // Prevent multiple timers from starting

        let timer = duration;
        otpTimerRunning = true;
        timerDisplay.innerText = `Time remaining: ${timer}s`;

        countdown = setInterval(() => {
            timer--;
            timerDisplay.innerText = `Time remaining: ${timer}s`;

            if (timer <= 0) {
                clearInterval(countdown);
                otpTimerRunning = false;
                timerDisplay.innerText = 'OTP expired';
                doneBtn.style.display = 'none';
                otpBtn.style.display = 'block';
            }
        }, 1000);
    }

    // Validate form fields before OTP request
    function validateForm(fullName, agencyName, orderId, mobileNo, email) {
        let isValid = true;
        let nameError = document.getElementById("nameError");
        let agencyError = document.getElementById("agencyError");
        let mobileError = document.getElementById("mobileError");
        let emailError = document.getElementById("emailError");

        // Validate Full Name (First & Last Name format)
        let namePattern = /^[A-Za-z]+\s[A-Za-z]+$/;
        if (!namePattern.test(fullName)) {
            nameError.innerText = "Enter a valid full name (First Last format)";
            nameError.style.display = "block";
            isValid = false;
        } else {
            nameError.style.display = "none";
        }

        // Validate Agency Name (Only alphabets)
        let agencyPattern = /^[A-Za-z\s]+$/;
        if (!agencyPattern.test(agencyName)) {
            agencyError.innerText = "Agency name in detail (only letters)";
            agencyError.style.display = "block";
            isValid = false;
        } else {
            agencyError.style.display = "none";
        }

        // Validate Mobile Number (Exactly 10 digits)
        let mobilePattern = /^\d{10}$/;
        if (!mobilePattern.test(mobileNo)) {
            mobileError.innerText = "Mobile number must be exactly 10 digits";
            mobileError.style.display = "block";
            isValid = false;
        } else {
            mobileError.style.display = "none";
        }

        // Validate Email Address
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailError.innerText = "Enter a valid email address";
            emailError.style.display = "block";
            isValid = false;
        } else {
            emailError.style.display = "none";
        }

        if (!orderId) {
            alert("⚠️ Please enter a valid Order ID.");
            isValid = false;
        }

        return isValid;
    }


         // 🚀 **Validation Function**
     function validateForm() {
        let fullName = document.getElementById("fname").value.trim();
        let agencyName = document.getElementById("agencyname").value.trim();
        let orderId = document.getElementById("orderid").value.trim();
        let mobileNo = document.getElementById("mobileno").value.trim();
        let email = document.getElementById("email").value.trim();

        let nameError = document.getElementById("nameError");
        let agencyError = document.getElementById("agencyError");
        let mobileError = document.getElementById("mobileError");
        let emailError = document.getElementById("emailError");

        let isValid = true;

        // Full Name Validation (Must have First & Last Name)
        let namePattern = /^[A-Za-z]+\s[A-Za-z]+$/;
        if (!namePattern.test(fullName)) {
            nameError.innerText = "Enter a valid full name (First Last format)";
            nameError.style.display = "block";
            isValid = false;
        } else {
            nameError.style.display = "none";
        }

        // Agency Name Validation (Only alphabets)
        let agencyPattern = /^[A-Za-z\s]+$/;
        if (!agencyPattern.test(agencyName)) {
            agencyError.innerText = "Agency name in detail (only letters)";
            agencyError.style.display = "block";
            isValid = false;
        } else {
            agencyError.style.display = "none";
        }

        // Mobile Number Validation (Must be exactly 10 digits)
        let mobilePattern = /^\d{10}$/;
        if (!mobilePattern.test(mobileNo)) {
            mobileError.innerText = "Mobile number must be exactly 10 digits";
            mobileError.style.display = "block";
            isValid = false;
        } else {
            mobileError.style.display = "none";
        }

        // Email Validation
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailError.innerText = "Enter a valid email address";
            emailError.style.display = "block";
            isValid = false;
        } else {
            emailError.style.display = "none";
        }

        return isValid;
    }


    // Handle Done button click to start camera
    async function handleDone() {
        try {
            // Open camera only when "Done" button is clicked
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = "block";
            captureBtn.style.display = "inline";
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Camera access denied. Please allow camera access in browser settings.");
        }
    }

    // Capture image from the camera
    async function captureImage() {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop camera after capture
        stream.getTracks().forEach(track => track.stop());
        video.style.display = "none";
        captureBtn.style.display = "none";

        // Convert to base64
        const imageData = canvas.toDataURL("image/png");
        imagePreview.src = imageData;
        imagePreview.style.display = "block";

        let imageDataInput = document.getElementById("image-data");

        // Send to backend
        const orderId = document.getElementById("orderid").value.trim();

        try {

            // const host = process.env.HOST || "localhost";
            // const port = 5001;

            const response = await fetch("http://localhost:5001/api/upload-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: orderId, image: imageData }),
            });

            const data = await response.json();
            alert(data.message);

            // ✅ Redirect after clicking OK on alert
            window.location.href = "/thankyou.html";

        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }


});
