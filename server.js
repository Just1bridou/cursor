let express = require("express");
let socketio = require("socket.io");
let http = require("http");

const dotenv = require("dotenv");

dotenv.config();

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/pages", express.static(__dirname + "/pages"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/game.html");
});

app.get("/r/:code", function (req, res) {
  res.sendFile(__dirname + "/pages/game.html");
});

// sockets contain all player's socket of the server
var sockets = {};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Player {
  constructor(name, x, y) {
    this.uuid = uuid();
    this.name = name;
    this.position = new Position(x, y);
    this.oldPosition = new Position(0, 0);
  }

  setPosition(x, y) {
    if (
      this.oldPosition.x != this.position.x &&
      this.oldPosition.y != this.position.y
    )
      this.oldPosition.set(this.position.x, this.position.y);
    this.position.set(x, y);
  }
}

class PlayersManager {
  constructor() {
    this.players = [];
  }

  add(player) {
    this.players.push(player);
  }

  get(uuid) {
    return this.players.find((player) => player.uuid === uuid);
  }

  remove(uuid) {
    this.players = this.players.filter((player) => player.uuid !== uuid);
  }
}

const PM = new PlayersManager();

io.on("connect", (socket) => {
  socket.on("login", (data) => {
    let player = new Player(data.username, data.x, data.y);
    PM.add(player);
    socket.uuid = player.uuid;
    sockets[player.uuid] = socket;
    socket.emit("login", player);
    socket.emit("loadCursors", PM.players);
  });

  socket.on("mouse", (data) => {
    let player = PM.get(data.uuid);

    if (!player) return;
    player.setPosition(data.x, data.y);

    for (let socket of Object.values(sockets)) {
      socket.emit("mouse", player);
    }
  });

  socket.on("disconnect", (data) => {
    PM.remove(socket.uuid);
    for (let newSocket of Object.values(sockets)) {
      newSocket.emit("removePlayer", socket.uuid);
    }
  });
});

console.log("Running on port: " + process.env.PORT);

server.listen(process.env.PORT);
