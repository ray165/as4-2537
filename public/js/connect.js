"use strict";

$(document).ready(function () {
  $("#submit").on("click", function () {
    let pw = document.querySelector("#password").value;
    let un = document.querySelector("#username").value;

    if (pw === "arron") {
      localStorage.setItem("loggedIn", true);
      localStorage.setItem("name", un);
      window.location.href = "/chatRoom";
    } else {
        document.querySelector("#warning").value = "you weren't invited";

    }
  });
});
