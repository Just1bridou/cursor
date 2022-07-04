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
      this.oldRotation = 0;
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
      // document.querySelector(".night").addEventListener('mousemove', event => {
        
      //   event.target.style.webkitMaskPositionX =  container.offsetLeft + event.target.offsetWidth/2 + "px";
      //   event.target.style.webkitMaskPositionY =  container.offsetTop + event.target.offsetHeight/2 + "px";
      // }, false);

      document.querySelector(".game").appendChild(this.element);
    }

    setPosition(x, y, oldPosition) {
      //   console.log("---");
      //   console.log(x, oldPosition.x);

     

  
      if (oldPosition.x != x && oldPosition.y != y) {
     
        let vectX = oldPosition.x - x;
        let vectY = oldPosition.y - y;

        let rotation = 0

        let magnitude =  Math.abs(Math.sqrt(vectX * vectX + vectY * vectY));
        if(magnitude > 0.3) {
           rotation =  Math.atan(vectY/vectX) *  (360 / (Math.PI * 2))
          rotation = (rotation-90) - 360 * Math.floor((rotation-90)/360);
          if(vectX <= 0)
          {
            rotation = rotation + 180;
          }
          rotation =  ((rotation % 360))
  
          //console.log(rotation);
          rotation = closestEquivalentAngle(this.oldRotation, rotation)
          this.element.style.transform = `rotateZ(${rotation}deg) translate(-50%, 10%)`;
          this.oldRotation = rotation;
        }
  
      }

     
      let LIMIT = 5;

      let vectorX = 0;
      let vectorY = 0;

      // PLACE ELEMENT ON MAP
      this.x = x;
      this.y = y;
      this.element.style.top = this.y + "%";
      this.element.style.left = this.x + "%";


      function closestEquivalentAngle(from, to) {
        var delta = ((((to - from) % 360) + 540) % 360) - 180;
        return from + delta;
      }
     
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
      if(!cursor[0]) return;
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
      this.init()
      this.setRandomPosition()
      this.setEvents()
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
        console.log(e)
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
      this.blocks = []
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
  const socket = io();

  var uuid = null;

 function spawn() {

    SM.spawn()

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
  isReady = true
        
},10)

  document.addEventListener("mousemove", (e) => {
    //if (!uuid || !CM.get(uuid).move) return;

    let xpos = parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2))
    let ypos = parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2))

      if(xpos  != 0 &&  ypos != 0 && isReady) {
        isReady = false
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


});

