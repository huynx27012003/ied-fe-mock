import client from "@/api/client";
import { logApiError } from "@/helpers/apiFeedback";

export async function deleteVoltageLevel(voltageLevelId) {
  if (!voltageLevelId && voltageLevelId !== 0) {
    throw new Error("voltageLevelId is required");
  }

  try {
    const response = await client.delete("/voltage-level/delete", {
      params: { voltageLevelId },
      headers: { accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    logApiError(error, `Error deleting voltage level id=${voltageLevelId}`);
    throw error;
  }
}
