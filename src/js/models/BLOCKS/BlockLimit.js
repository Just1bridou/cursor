import { TYPE } from "/js/constants/constants.js";

export default class BLOCK_LIMIT {
  constructor(x, y) {
    this.mortal = true;
    this.height = 30;
    this.width = 30;
    this.x = x;
    this.y = y;
    this.color = "blue";
    this.element;
    this.init();
    this.setEvents();
  }

  init() {
    let detector = document.createElement("div");
    detector.classList.add("detector");

    let center = document.createElement("div");
    center.classList.add("block");
    center.style.height = this.height + "px";
    center.style.width = this.width + "px";
    center.style.backgroundColor = this.color;

    detector.style.top = this.y + "%";
    detector.style.left = this.x + "%";

    center.source = this;
    detector.appendChild(center);

    this.element = detector;
    this.element.source = this;

    document.querySelector(".game").appendChild(this.element);
  }

  setEvents() {}
}
