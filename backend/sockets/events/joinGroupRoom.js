import { verifyIfUserIsGroupMember } from "../../apiServices/chat/chat.model.js";

export default function joinGroupRoom(io, socket) {
  socket.on("join_group_room",async ({ groupId }) => {
    const userId = socket.user.id;
    const isMember = await verifyIfUserIsGroupMember(groupId, userId);
    if (!isMember) {
      console.log("El usuario no es miembro del grupo");
      return;
    }

    socket.join(`group_${groupId}`);
    console.log(`Usuario ${userId} ha solicitado y se ha unido a la sala group_${groupId}`);
  })

}
