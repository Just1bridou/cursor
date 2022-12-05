import CursorManager from "./models/CursorManager.js";
import PlayerListManager from "./models/PlayerListManager.js";
import SpawnManager from "./models/SpawnManager.js";
import Cursor from "./models/Cursor.js";
import Ball from "./models/Elements/Ball.js";

import io from "Modules/socket.io-client";
document.addEventListener("DOMContentLoaded", () => {
  const Section = {
    LOGIN: "login",
    JOIN: "join",
    GAME: "game",
  };

  //let bl = new BLOCK_LIMIT(60, 60);
  let ball = new Ball(60, 60);

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

  // spawn();

  /**
   * LOGIN
   */
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

  /**
   * SEND MOUSE POS WHEN MOVE
   */
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

  /**
   * LOAD GAME SCREEN
   */
  socket.on("login", (data) => {
    document.querySelector(".login").classList.add("none");
    document.querySelector(".game").classList.remove("none");
    uuid = data.uuid;
    socket.uuid = data.uuid;
  });

  /**
   * ADD NEW CURSOR OR UPDATE CURSOR POS
   */
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
});
