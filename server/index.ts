import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    // Relay the message to all other clients in the room
    this.room.broadcast(message, [sender.id]);
  }
}
