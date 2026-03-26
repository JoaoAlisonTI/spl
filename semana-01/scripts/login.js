const form = document.querySelector("form");
    
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    let email = emailInput.value;
    let password = passwordInput.value;

    if (email === "test@gmail.com" && password === "senha") {
        document.querySelector(".div-error").style.display = "none"
        alert("Dashboard em breve será disponibilizado!");
    } else {
        document.querySelector(".div-error").style.display = "block"
    }
});