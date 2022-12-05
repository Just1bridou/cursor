export default class CursorManager {
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
