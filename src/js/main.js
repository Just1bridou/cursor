import Cursor from "./Cursor.js";
import io from "Modules/socket.io-client";


console.log("tarace", Cursor);
document.addEventListener("DOMContentLoaded", () => {

  const Section = {
    LOGIN: "login",
    JOIN: "join",
    GAME: "game",
  };

  class CursorManager {
    constructor() {
      this.cursors = [];
    }

    add(cursor) {
      this.cursors.push(cursor);
    }

    get(uuid) {
      return this.cursors.find((cursor) => cursor.uuid === uuid);
    }

    remove(uuid) {
      let cursor = this.cursors.filter((cursor) => cursor.uuid == uuid);
      if (!cursor[0]) return;
      cursor[0].remove();
    }
  }

  class PlayerListManager {
    constructor() {
      this.players = [];
      this.list = document.querySelector(".player-container");
    }

    add(player) {
      this.players.push(player);
      this.updateList();
    }

    updateList() {
      this.list.innerHTML = "";
      this.players.forEach((player) => {
        let li = document.createElement("div");
        li.innerText = player.name;
        this.list.appendChild(li);
      });
    }

    remove(uuid) {
      this.players = this.players.filter((player) => player.uuid !== uuid);
      this.updateList();
    }
  }

  class BLOCK_LIMIT {
    constructor(x, y) {
      this.mortal = true;
      this.height = 30;
      this.width = 30;
      this.x = x;
      this.y = y;
      this.color = "blue";
      this.init();
      this.setEvents();
    }

    init() {
      let detector = document.createElement("div");
      detector.classList.add("detector");

      let element = document.createElement("div");
      element.classList.add("block");
      element.style.height = this.height + "px";
      element.style.width = this.width + "px";
      element.style.backgroundColor = this.color;

      detector.style.top = this.y + "%";
      detector.style.left = this.x + "%";

      detector.appendChild(element);
      this.element = detector;
      document.querySelector(".game").appendChild(this.element);
    }

    setEvents() {
      this.element.addEventListener("mouseenter", (e) => {
        switch (e.relatedTarget.type) {
          case TYPE.CURSOR:
            let cursor = CM.get(e.relatedTarget.uuid);
            cursor.moveStop();
            cursor.teleport(10, 30);
            console.log("cursor enter");
        }
      });
    }
  }

  class Ball {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.init();
      this.setRandomPosition();
      this.setEvents();
    }

    init() {
      let detector = document.createElement("div");
      detector.classList.add("detector");

      let element = document.createElement("div");
      element.classList.add("ball");

      detector.appendChild(element);
      this.element = detector;
      document.querySelector(".game").appendChild(this.element);
    }

    setEvents() {
      this.element.addEventListener("mouseenter", (e) => {
        console.log(e);
        switch (e.relatedTarget.type) {
          case TYPE.CURSOR:
            let cursor = CM.get(e.relatedTarget.uuid);
            /*cursor.moveStop();
            cursor.teleport(10, 30);*/
            console.log("cursor enter");
        }
      });
    }

    setRandomPosition() {
      this.x = Math.floor(Math.random() * (95 - 5 + 1) + 5);
      this.y = Math.floor(Math.random() * (95 - 5 + 1) + 5);
      this.element.style.top = this.y + "%";
      this.element.style.left = this.x + "%";
    }
  }

  class SpawnManager {
    constructor() {
      this.blocks = [];
    }

    spawn() {
      let ball = new Ball();
      //this.blocks.push(ball)
    }
  }

  //let bl = new BLOCK_LIMIT(60, 60);

  const SM = new SpawnManager();
  const CM = new CursorManager();
  const PL = new PlayerListManager();
  const socket = io.connect("http://localhost:8080");

  console.log(socket);

  var uuid = null;

  function spawn() {
    SM.spawn();

    var min = 1;
    var max = 2;
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(spawn, rand * 1000);
  }

  //spawn()

  document.querySelector(".login-button").addEventListener("click", () => {
    socket.emit("login", {
      username: document.querySelector(".login-username").value,
      x: 0,
      y: 0,
    });
  });

  let isReady = false;
  setInterval(() => {
    isReady = true;
  }, 10);

  document.addEventListener("mousemove", (e) => {
    //if (!uuid || !CM.get(uuid).move) return;

    let xpos = parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2));
    let ypos = parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2));

    if (xpos != 0 && ypos != 0 && isReady) {
      isReady = false;
      socket.emit("mouse", {
        uuid: uuid,
        x: xpos,
        y: ypos,
      });
    }
  });

  socket.on("login", (data) => {
    document.querySelector(".login").classList.add("none");
    document.querySelector(".game").classList.remove("none");
    uuid = data.uuid;
    socket.uuid = data.uuid;
  });

  socket.on("mouse", (data) => {
    let cursor = CM.get(data.uuid);
    if (!cursor) {
      CM.add(
        new Cursor(
          data.name,
          data.uuid,
          data.position.x,
          data.position.y,
          this.oldPosition
        )
      );

      PL.add(data);
    } else {
      cursor.setPosition(data.position.x, data.position.y, data.oldPosition);
    }
  });

  socket.on("loadCursors", (data) => {
    for (let it of data) {
      let cursor = CM.get(it.uuid);
      if (!cursor) {
        CM.add(
          new Cursor(
            it.name,
            it.uuid,
            it.position.x,
            it.position.y,
            it.oldPosition
          )
        );
        PL.add(it);
      }
    }
  });

  socket.on("removePlayer", (data) => {
    CM.remove(data);
    PL.remove(data);
  });

  socket.on("map", (data) => {
    //console.log(data.length);
    // display the matrice on screen
    let maxX = 50;
    let maxY = 50;
    let count = 0;
    for (let i = 0; i < maxX; i++) {
      let line = document.createElement("div");
      line.classList.add("line");
      line.style.height = "10px";

      for (let j = 0; j < maxY; j++) {
        let block;
        // console.log(data);

        block = document.createElement("div");

        let actual = data[count];
        console.log(actual);
        block.classList.add("block_" + i + "_" + j);
        block.style.height = "10px";
        block.style.width = "10px";
        block.style.backgroundColor = "white";

        //   if (data[i][j].x == i && data[i][j].y == j) {
        //     // road
        //     block = document.createElement("div");
        //     block.classList.add("block");
        //     block.style.height = "10px";
        //     block.style.width = "10px";
        //     block.style.backgroundColor = "white";
        //   } else {
        //     // void
        //     block = document.createElement("div");
        //     block.classList.add("block");
        //     block.style.height = "10px";
        //     block.style.width = "10px";
        //     block.style.backgroundColor = "black";
        //   }

        line.appendChild(block);
        count++;
      }

      document.querySelector(".mapContainer").appendChild(line);
    }

    for (let it of data) {
      let block = document.querySelector(".block_" + it.x + "_" + it.y);
      block.style.backgroundColor = "black";
    }
  });
});
