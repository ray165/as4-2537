"use strict";

function saveMsg(myData) {
  console.log(myData);
  fetch("/save", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(myData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

$(document).ready(function () {
  document.querySelector("#name").value = localStorage.getItem("name");

  /* This happens when the document is loaded. We start off with http://localhost:8000
       And if the browser supports this, we get a new connection as well at:
       ws://localhost:8000
     */
  let socket = io();

  socket.on("user_joined", function (data) {
    let beginTag = "<h1 style='color: black;'>";
    let numOfUsers = data.numOfUsers;
    let userStr = "";
    if (numOfUsers == 1) {
      userStr = "user";
    } else {
      userStr = "users";
    }
    if (numOfUsers < 2) {
      $("#welcome").append("<h1>Welcome " + localStorage.getItem("name") + "</h1>");
    } else {
      $("#welcome").append(
        beginTag +
        localStorage.getItem("name") +
          " connected. There are " +
          numOfUsers +
          " " +
          userStr +
          ".</h1>"
      );
    }

  });

  socket.on("user_left", function (data) {
    let beginTag = "<p style='color: Green;'>";
    let numOfUsers = data.numOfUsers;
    let userStr = "";
    if (numOfUsers == 1) {
      userStr = "user";
    } else {
      userStr = "users";
    }
    if (numOfUsers < 2) {
      $("#chat_content").append(
        "<p>" +
          data.user +
          " left. You are now all alone on this chat server <span style='font-size: 1.2em; color: blue;'>☹</span>.</p>"
      );
    } else {
      $("#chat_content").append(
        beginTag +
          data.user +
          " left. Now chatting with " +
          numOfUsers +
          " " +
          userStr +
          "</p>"
      );
    }
  });

  socket.on("end", function () {
    console.log("user has disconnected");
    socket.disconnect();
  });

  // this is from others - not our text
  socket.on("chatting", function (data) {
    //console.log(data);
    let me = $("#name").val();
    let beginTag = "<p>";
    if (me == data.user) {
      beginTag = "<p style='color: black; font-size: 0.5em'>";
    }
    if (data.event) {
      $("#chat_content").append(
        "<p style='color: orange;'>" + data.event + "</p>"
      );
    }

    $("#chat_content").append(
      beginTag + data.user + " said: " + data.text + "</p>"
    );
  });

  $("#logout").on("click", function () {
    socket.disconnect();
    console.log("you are disconnected");
    window.location.href = "/";
  });

  $("#send").click(function () {
    let name = $("#name").val();
    let text = $("#msg").val();

    // check if the name is blank, shouldn't be
    if (name == null || name === "") {
      $("#name").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
      return;
    }
    if (text == null || text === "") {
      $("#msg").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
      return;
    }
    socket.emit("chatting", { name: name, message: text });

    console.log(name, text);
    let myData = {
      _name: name || "testUser",
      msg: text,
    };

    saveMsg(myData);
    $("#msg").val("");
  });

  $("#getChat").on("click", function () {
    $.ajax({
      url: "/getChatLog",
      type: "get",
      success: function (data) {
        console.log("Success: ", data);
        for (let i = 0; i < data.length; i++) {
          let str = `<p> date: ${data[i].postDate} author: ${data[i].authorName}  message ${data[i].message} </p>`;
          $("#chatLogs").append(str);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("Error:", jqXHR, textStatus, errorThrown);
      },
    });
  });
});
