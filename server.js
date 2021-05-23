const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const rfs = require("rotating-file-stream");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser  = require('body-parser');

// database
const credentials = fs.readFileSync("./cert.pem");
const mongoose = require('mongoose');
const url =
  "mongodb+srv://wecycle-vancouver.2hson.mongodb.net/WecycleMain?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority";
// IMPORT SCHEMAS
const myModels = require("./models/schema.js");

// mongoose.connect comes first
async function connectToDB() {
  try {
    await mongoose.connect(url, {
      sslKey: credentials,
      sslCert: credentials,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err);
  }
}
connectToDB();

const db = mongoose.connection;
// line code 22-25 retrieved from https://www.mongoosejs.com/docs/

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongoose running");
});

app.use("/images", express.static("public/images"));
app.use("/js", express.static("public/js"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "logs"),
});

// a 'good-to-know':
// https://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x

app.use(morgan(":referrer :url :user-agent", { stream: accessLogStream }));

app.get("/", function (req, res) {
  let doc = fs.readFileSync("./public/connect.html", "utf8");

  res.send(doc);
});

app.get("/chatRoom", function (req, res) {
  let doc = fs.readFileSync("./public/index.html", "utf8");
  res.send(doc);
});

app.post("/save", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log(req.body);
  var newChat = myModels.chatLog({
    authorName: req.body._name, 
    message: req.body.msg,
  });

  newChat.save(function (err, newPost) {
    if (err) return console.error(err);
  });

  res.send({ status: "success", msg: "post created." });
});

app.get("/getChatLog", function(req, res) {
    console.log("Call to query db successful, returning all chat logs");
  
    async function getData() {
      let dataToSend = await db.collection("logs")
        .find({}).toArray();
  
      console.log(dataToSend);
  
      res.json(dataToSend);
    
    }
    getData().catch((err) => console.error(err));
})

var userCount = 0;

io.on("connect", function (socket) {
  userCount++;
  socket.userName = "anonymous";
  io.emit("user_joined", { user: socket.userName, numOfUsers: userCount });
  console.log("Connected users:", userCount);

  socket.on("disconnect", function (data) {
    userCount--;
    io.emit("user_left", { user: socket.userName, numOfUsers: userCount });

    console.log("Connected users:", userCount);
  });

  socket.on("chatting", function (data) {
    console.log("User", data.name, "Message", data.message);

    // if you don't want to send to the sender
    //socket.broadcast.emit({user: data.name, text: data.message});

    if (socket.userName == "anonymous") {
      io.emit("chatting", {
        user: data.name,
        text: data.message,
      });
      socket.userName = data.name;
    } else {
      io.emit("chatting", { user: socket.userName, text: data.message });
    }
  });
});

// RUN SERVER
let port = 8000;
server.listen(port, function () {
  console.log("Server running on " + port);
});
