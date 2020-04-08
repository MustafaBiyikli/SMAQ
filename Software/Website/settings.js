$(document).ready(function () {
    var addUser = document.querySelector(".user-form");
    var list = document.getElementById("existing-users");
    const maxUsers = 5;
    if (addUser) {
        addUser.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            var data = { username, email };
            if (list.children.length < maxUsers) {
                // Post the data to backend
                $.post("/settingsAdd", data)
                    .done(function () {
                        appendList(username, email);
                        showAlert("success", "New user added");
                        setTimeout(function () {
                            window.location.reload();
                        }, 3000);
                    })
                    .fail(function () {
                        showAlert("error", "New user could not be added");
                    });
            } else {
                showAlert(
                    "error",
                    "Maximum number of users reached, remove users to add others"
                );
            }
        });
        var listItem = $("#existing-users li");
        listItem.click(function () {
            var index = $(this).index();
            var data = { index };
            confirmDelete(
                "Are you sure you want to delete this user?",
                function () {
                    // Post the data to backend
                    $.post("/settingsRemove", data)
                        .done(function () {
                            showAlert("success", "User removed");
                            list.removeChild(list.children[index]);
                        })
                        .fail(function () {
                            showAlert("error", "User could not be removed");
                        });
                }
            );
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
    window.setTimeout(hideAlert, 3000);
};

/**
 * Creates an alert to confirm deletion
 * @param {String} msg this message will show in the alert
 * @param {Function} callback function statement on confirmation
 */
const confirmDelete = (msg, callback) => {
    hideAlert();
    const markup = `<div class="alert alert-confirm">${msg}<br/>
                    <img id="confirm" src="../img/confirm.png">
                    <img id="cancel" src="../img/cancel.png">
                    </div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    $("#confirm").click(function () {
        hideAlert();
        callback();
    });
    $("#cancel").click(function () {
        hideAlert();
    });
};

/**
 * This function temporarly appends new user into the website
 * @param {String} username
 * @param {String} email
 */
function appendList(username, email) {
    var listNode = document.createElement("li");
    var listItem = document.createTextNode(`${username} | ${email}`);
    listNode.appendChild(listItem);
    document.getElementById("existing-users").appendChild(listNode);
}
