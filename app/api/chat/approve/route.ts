import { auth } from "@/auth"
import { pendingApprovals } from "@/lib/approval-store"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { toolCallId, approved, feedback } = await req.json() as {
    toolCallId: string
    approved: boolean
    feedback?: string
  }

  const pending = pendingApprovals.get(toolCallId)
  if (!pending) {
    return Response.json({ error: "No pending approval found" }, { status: 404 })
  }

  pendingApprovals.delete(toolCallId)

  if (approved) {
    pending.resolve({ kind: "approved" })
  } else {
    pending.resolve({ kind: "denied-interactively-by-user", feedback })
  }

  return Response.json({ ok: true })
}
