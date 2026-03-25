import type { PermissionRequestResult } from "@github/copilot-sdk"

type PendingApproval = {
  resolve: (result: PermissionRequestResult) => void
  request: { kind: string; toolCallId?: string; [key: string]: unknown }
}

export const pendingApprovals = new Map<string, PendingApproval>()
