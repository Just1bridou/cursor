export default class Ball {
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
    detector.classList.add("ball");

    detector.style.top = this.y + "%";
    detector.style.left = this.x + "%";

    detector.style.height = this.height + "px";
    detector.style.width = this.width + "px";

    this.element = detector;
    this.element.source = this;

    document.querySelector(".game").appendChild(this.element);
    //this.mouseOver();
  }

  moveBall(cursor) {
    //console.log(cursor);

    let v = {
      x: cursor.x - cursor.oldPosition.x,
      y: cursor.y - cursor.oldPosition.y,
    };

    length = Math.sqrt(v.x * v.x + v.y * v.y);

    // normalize vector
    v.x /= length;
    v.y /= length;

    // increase vector size
    v.x *= 50;
    v.y *= 50;

    // console.log(v);

    let x = (this.x * window.innerWidth) / 100;
    let y = (this.y * window.innerHeight) / 100;

    let newPos = {
      x: x + v.x,
      y: y + v.y,
    };

    this.x = this.lerp(this.x, newPos.x, 0.1);
    this.y = this.lerp(this.y, newPos.y, 0.1);
    this.updatePos(newPos);
  }

  updatePos(newPos) {
    this.element.style.transform = `translate3d(${this.x}%, ${this.y}%, 0)`;

    // convert newPos from px to %
    this.x = (newPos.x * 100) / window.innerWidth;
    this.y = (newPos.y * 100) / window.innerHeight;

    this.element.style.top = this.y + "%";
    this.element.style.left = this.x + "%";
  }

  // var circle = {
  //   el:$('#circle'),
  //   x:window.innerWidth/2, y:window.innerHeight/2, w:100, h:100,
  //   update:function(){
  //     l = this.x-this.w/2;
  //     t = this.y-this.h/2;
  //     this.el.css({
  //       'transform':'translate3d('+l+'px, '+t+'px, 0)'
  //     });
  //   }
  // }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  setEvents() {}
}
