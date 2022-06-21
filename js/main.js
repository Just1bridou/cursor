document.addEventListener("DOMContentLoaded", () => {
  const Section = {
    LOGIN: "login",
    JOIN: "join",
    GAME: "game",
  };

  class Cursor {
    constructor(name, uuid, x, y) {
      this.uuid = uuid;
      this.name = name;
      this.x = x;
      this.y = y;
      this.height = 20;
      this.width = 20;
      this.color = "red";
      this.init();
    }

    init() {
      let container = document.createElement("div");
      container.classList.add("container");

      let element = document.createElement("div");
      element.classList.add("cursor");
      element.style.height = this.height + "px";
      element.style.width = this.width + "px";
      element.style.backgroundColor = this.color;

      let text = document.createElement("div");
      text.classList.add("container-text");
      text.innerHTML = this.name;

      container.appendChild(element);
      container.appendChild(text);

      container.style.top = this.y + "%";
      container.style.left = this.x + "%";

      this.element = container;

      document.querySelector(".game").appendChild(this.element);
    }

    setPosition(x, y) {
      this.x = x;
      this.y = y;
      this.element.style.top = this.y + "%";
      this.element.style.left = this.x + "%";
    }

    remove() {
      this.element.remove();
    }
  }

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
        li.innerHTML = player.name;
        this.list.appendChild(li);
      });
    }

    remove(uuid) {
      this.players = this.players.filter((player) => player.uuid !== uuid);
      this.updateList();
    }
  }

  const CM = new CursorManager();
  const PL = new PlayerListManager();
  const socket = io();

  var uuid = null;

  document.querySelector(".login-button").addEventListener("click", () => {
    socket.emit("login", {
      username: document.querySelector(".login-username").value,
      x: 0,
      y: 0,
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (!uuid) return;
    socket.emit("mouse", {
      uuid: uuid,
      x: parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2)),
      y: parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2)),
    });
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
        new Cursor(data.name, data.uuid, data.position.x, data.position.y)
      );
      PL.add(data);
    } else {
      cursor.setPosition(data.position.x, data.position.y);
    }
  });

  socket.on("loadCursors", (data) => {
    for (let it of data) {
      let cursor = CM.get(it.uuid);
      if (!cursor) {
        CM.add(new Cursor(it.name, it.uuid, it.position.x, it.position.y));
        PL.add(it);
      }
    }
  });

  socket.on("removePlayer", (data) => {
    CM.remove(data);
    PL.remove(data);
  });
});
