import client from "@/api/client";
import { logApiError } from "@/helpers/apiFeedback";

export async function deleteOrganisation(organisationId) {
  if (!organisationId && organisationId !== 0) {
    throw new Error("organisationId is required");
  }

  try {
    const response = await client.delete("/organisation/delete", {
      params: { orId: organisationId },
      headers: { accept: "*/*" },
    });
    return response.data;
  } catch (error) {
    logApiError(error, `Error deleting organisation id=${organisationId}`);
    throw error;
  }
}
