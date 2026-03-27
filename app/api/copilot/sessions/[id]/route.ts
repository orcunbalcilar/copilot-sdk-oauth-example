/**
 * Copilot Session Delete API
 *
 * DELETE /api/copilot/sessions/[id] — delete a session by ID
 */

import { auth } from "@/auth";
import { getClient } from "@/lib/copilot-client";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const githubToken = session.accessToken;
  const client = getClient(githubToken);

  try {
    await client.deleteSession(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[Sessions] Failed to delete session:", error);
    return Response.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
