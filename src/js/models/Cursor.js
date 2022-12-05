import { TYPE } from "../constants/constants.js";

export default class Cursor {
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

    document.addEventListener("mouseover", (event) => {
      let collisionSource = event.target?.source;
      let previous = event.relatedTarget?.source;

      if (!collisionSource) return;

      if (collisionSource != previous) {
        console.log("new collision");
        // console.log(collisionSource);
        collisionSource.moveBall(this);
      }
    });
  }

  setPosition(x, y, oldPosition) {
    console.log("setPosition", x, y, oldPosition);

    if (oldPosition.x != x && oldPosition.y != y) {
      let vectX = oldPosition.x - x;
      let vectY = oldPosition.y - y;

      this.oldPosition = { x: oldPosition.x, y: oldPosition.y };

      let rotation = 0;

      let magnitude = Math.abs(Math.sqrt(vectX * vectX + vectY * vectY));
      if (magnitude > 0.3) {
        rotation = Math.atan(vectY / vectX) * (360 / (Math.PI * 2));
        rotation = rotation - 90 - 360 * Math.floor((rotation - 90) / 360);
        if (vectX <= 0) {
          rotation = rotation + 180;
        }
        rotation = rotation % 360;

        //console.log(rotation);
        rotation = closestEquivalentAngle(this.oldRotation, rotation);
        this.element.style.transform = `rotateZ(${rotation}deg) translate(-50%, 10%)`;
        this.oldRotation = rotation;
      }
    }

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

  // check for collision with other element
  checkCollision(element) {
    let x = this.x;
    let y = this.y;
    let width = this.width;
    let height = this.height;
    let x2 = element.x;
    let y2 = element.y;
    let width2 = element.width;
    let height2 = element.height;

    if (
      x < x2 + width2 &&
      x + width > x2 &&
      y < y2 + height2 &&
      y + height > y2
    ) {
      return true;
    }
    return false;
  }
}
