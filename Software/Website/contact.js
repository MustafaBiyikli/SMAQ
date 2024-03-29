$(document).ready(function () {
    var contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fname = document.getElementById("fname").value;
            const lname = document.getElementById("lname").value;
            const email = document.getElementById("email").value;
            const category = document.getElementById("category").value;
            const message = document.getElementById("subject").value;
            const data = {
                fname,
                lname,
                email,
                category,
                message,
            };

            // Post the data to backend
            $.post("/contact", data)
                .done(function () {
                    showAlert("success", "Success! We've got your email!");
                    contactForm.reset();
                })
                .fail(function () {
                    showAlert("error", "There was an error. Please try again.");
                });
        });
    }
});

const hideAlert = () => {
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};

/**
 * Shows an alert
 * @param {String} type "success" or "error", this is used for css
 * @param {String} msg This message will be shown in the alert
 */
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert-${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout(hideAlert, 5000);
};
