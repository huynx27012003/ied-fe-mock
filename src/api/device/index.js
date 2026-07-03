import { del, get } from "@/api/helpers";

export function getIedInfoById(iedId) {
  return get("/ied-info/by-ied", { iedId }, `Error fetching IED info for id=${iedId}`);
}

export async function deleteDevice(iedId) {
  return del("/ied", { iedId }, "Error deleting device");
}
