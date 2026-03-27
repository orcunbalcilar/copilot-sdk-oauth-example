/**
 * Copilot Sessions API
 *
 * GET  /api/copilot/sessions       — list sessions
 * DELETE /api/copilot/sessions/:id — delete a session (handled via query param)
 */

import { auth } from "@/auth";
import { getClient } from "@/lib/copilot-client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const githubToken = session.accessToken;
  const client = getClient(githubToken);

  try {
    const sessions = await client.listSessions();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}
