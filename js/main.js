document.addEventListener("DOMContentLoaded", () => {
  const Section = {
    LOGIN: "login",
    JOIN: "join",
    GAME: "game",
  };

  const TYPE = {
    CURSOR: "cursor",
    BLOCK: "block",
  };

  class Cursor {
    constructor(name, uuid, x, y, oldPosition) {
      this.uuid = uuid;
      this.name = name;
      this.x = x;
      this.y = y;
      this.height = 20;
      this.width = 20;
      this.color = "red";
      this.type = TYPE.CURSOR;
      this.move = true;
      this.oldPosition = oldPosition;
      this.vector = { x: 0, y: 0 };
      this.init();
    }

    init() {
      let container = document.createElement("div");
      container.classList.add("container");

      let element = document.createElement("img");
      element.classList.add("cursor");
      element.classList.add("cursor-car");
      //   element.style.height = this.height + "px";
      //   element.style.width = this.width + "px";
      //   element.style.backgroundColor = this.color;
      element.src = "/assets/car.png";
      element.uuid = this.uuid;
      element.type = this.type;

      let text = document.createElement("div");
      text.classList.add("container-text");
      text.innerText = this.name;

      container.appendChild(element);
      container.appendChild(text);

      container.style.top = this.y + "%";
      container.style.left = this.x + "%";

      this.element = container;

      document.querySelector(".game").appendChild(this.element);
    }

    setPosition(x, y, oldPosition) {
      //   console.log("---");
      //   console.log(x, oldPosition.x);
      let LIMIT = 5;

      let vectorX = 0;
      let vectorY = 0;

      //   console.log(this.oldPosition.x - x);
      //   if (
      //     Math.abs(this.oldPosition.x - x) > LIMIT ||
      //     Math.abs(this.oldPosition.y - y) > LIMIT
      //   ) {
      //     this.oldPosition = oldPosition;
      //   }

      //   if (Math.abs(this.oldPosition.x - x) > LIMIT) {
      //     console.log("X");
      //     this.oldPosition = oldPosition;
      //     // console.log(this.x);
      //     // console.log(this.oldPosition.x);
      //     // console.log(this.x - this.oldPosition.x);
      //     this.calcPositionVectorX(this.x - this.oldPosition.x);
      //   }

      //   if (Math.abs(this.oldPosition.y - y) > LIMIT) {
      //     console.log("Y");
      //     this.oldPosition = oldPosition;
      //     this.calcPositionVectorY(this.y - this.oldPosition.y);
      //   }

      //   if (oldPosition.x - x != 0 && oldPosition.y - y != 0) {
      //     this.oldPosition = oldPosition;
      //   }

      //this.oldPosition = oldPosition;

      //   let vector = this.calcPositionVector(
      //     this.x - this.oldPosition.x,
      //     this.y - this.oldPosition.y
      //   );

      // PLACE ELEMENT ON MAP
      this.x = x;
      this.y = y;
      this.element.style.top = this.y + "%";
      this.element.style.left = this.x + "%";

      //   console.log(this.vector);

      //   let z = Math.atan2(this.vector.y, this.vector.x);
      //   this.element.style.transform = `rotateZ(${z}rad)`;
    }

    calcPositionVectorX(x) {
      let nX = 0;
      if (x > 0) nX = 1;
      if (x < 0) nX = -1;
      this.vector = { x: nX, y: this.vector.y };
    }

    calcPositionVectorY(y) {
      let nY = 0;
      if (y > 0) nY = 1;
      if (y < 0) nY = -1;
      this.vector = { x: this.vector.x, y: nY };
    }

    // calcPositionVector(x, y) {
    //   let nX = 0;
    //   let nY = 0;
    //   if (x > 0) nX = 1;
    //   if (x < 0) nX = -1;
    //   if (y > 0) nY = 1;
    //   if (y < 0) nY = -1;
    //   return { x: nX, y: nY };
    // }

    teleport(x, y) {
      socket.emit("mouse", {
        uuid: this.uuid,
        x: x,
        y: y,
      });
    }

    moveStop() {
      this.move = false;
    }

    moveResume() {
      this.move = true;
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

  let bl = new BLOCK_LIMIT(60, 60);

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
    //if (!uuid || !CM.get(uuid).move) return;
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
