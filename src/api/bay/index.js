import client from "@/api/client";
import { logApiError } from "@/helpers/apiFeedback";

export async function deleteBay(bayId) {
  if (!bayId && bayId !== 0) {
    throw new Error("bayId is required");
  }

  try {
    const response = await client.delete("/bay/delete", {
      params: { bayId },
      headers: { accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    logApiError(error, `Error deleting bay id=${bayId}`);
    throw error;
  }
}
