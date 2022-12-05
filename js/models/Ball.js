// export default class Ball {
//   constructor() {
//     this.x = 0;
//     this.y = 0;
//     this.init();
//     this.setRandomPosition();
//     this.setEvents();
//   }

//   init() {
//     let detector = document.createElement("div");
//     detector.classList.add("detector");

//     let element = document.createElement("div");
//     element.classList.add("ball");

//     detector.appendChild(element);
//     this.element = detector;
//     document.querySelector(".game").appendChild(this.element);
//   }

//   setEvents() {
//     this.element.addEventListener("mouseenter", (e) => {
//       console.log(e);
//       switch (e.relatedTarget.type) {
//         case TYPE.CURSOR:
//           let cursor = CM.get(e.relatedTarget.uuid);
//           /*cursor.moveStop();
//             cursor.teleport(10, 30);*/
//           console.log("cursor enter");
//       }
//     });
//   }

//   setRandomPosition() {
//     this.x = Math.floor(Math.random() * (95 - 5 + 1) + 5);
//     this.y = Math.floor(Math.random() * (95 - 5 + 1) + 5);
//     this.element.style.top = this.y + "%";
//     this.element.style.left = this.x + "%";
//   }
// }
