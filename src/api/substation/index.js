import client from "@/api/client";
import { logApiError } from "@/helpers/apiFeedback";

export async function deleteSubstation(substationId) {
  if (!substationId && substationId !== 0) {
    throw new Error("substationId is required");
  }

  try {
    const response = await client.delete("/substation/delete", {
      params: { id: substationId },
      headers: { accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    logApiError(error, `Error deleting substation id=${substationId}`);
    throw error;
  }
}
