


let express = require("express");
let socketio = require("socket.io");
let http = require("http");
let child_process = require("child_process");
const dotenv = require("dotenv");

dotenv.config();


const child = child_process.spawn('webpack --mode development', {
  stdio: 'inherit',
  shell: true
});

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use("/", express.static(__dirname + "/dist"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/r/:code", function (req, res) {
  res.sendFile(__dirname + "/index.html");
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
const map = randomPath();

io.on("connect", (socket) => {
  socket.on("login", (data) => {
    let player = new Player(data.username, data.x, data.y);
    PM.add(player);
    socket.uuid = player.uuid;
    sockets[player.uuid] = socket;
    socket.emit("login", player);
    socket.emit("loadCursors", PM.players);
    socket.emit("map", map);
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

// function to generate random path into a double matrice of 50x50
function randomPath() {
  let matrice = [];
  for (let i = 0; i < 50; i++) {
    matrice[i] = [];
    for (let j = 0; j < 50; j++) {
      matrice[i][j] = 0;
    }
  }
  let x = 0;
  let y = 0;
  let path = [];
  let directions = ["up", "down", "left", "right"];
  let direction;
  let count = 0;
  while (x != 49 || y != 49) {
    direction = directions[Math.floor(Math.random() * 4)];
    if (direction == "up" && y > 0) {
      matrice[x][y] = 1;
      y -= 1;
      path.push({ x: x, y: y });
      count = 0;
    } else if (direction == "down" && y < 49) {
      matrice[x][y] = 1;
      y += 1;
      path.push({ x: x, y: y });
      count = 0;
    } else if (direction == "left" && x > 0) {
      matrice[x][y] = 1;
      x -= 1;
      path.push({ x: x, y: y });
      count = 0;
    } else if (direction == "right" && x < 49) {
      matrice[x][y] = 1;
      x += 1;
      path.push({ x: x, y: y });
      count = 0;
    } else {
      count++;
    }
    if (count > 100) {
      console.log("Failed to generate path");
      return;
    }
  }
  matrice[x][y] = 1;
  return path;
}
