import { post } from "@/api/helpers";

export function moveAsset(mode, id, ownerId) {
  return post(
    "/asset/move",
    {},
    {
      params: { mode, id, ownerId },
      headers: {
        accept: "*/*",
      },
    },
    `Error moving asset mode=${mode}, id=${id}, ownerId=${ownerId}`
  );
}

export function renameAsset(mode, id, newName) {
  return post(
    "/asset/rename",
    {},
    {
      params: { mode, id, newName },
      headers: {
        accept: "*/*",
      },
    },
    `Error renaming asset mode=${mode}, id=${id}`
  );
}
