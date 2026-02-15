import type { FetchErrors } from "$lib/types";
import { fetchIntoResult, Result } from "$lib/utils";

export type ProposalStatus = "declined" | "approved" | "pending" | "cancelled";

export async function patchProposalStatus(proposalId: number, action: string): Promise<Result<unknown, FetchErrors>> {
    const payload = {
        action
    };
    const response = await fetchIntoResult(() => fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }));
    return response;
}