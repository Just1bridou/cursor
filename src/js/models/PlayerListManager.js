export default class PlayerListManager {
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
