import type { Fetch } from "$lib/types";
import { fetchIntoResult } from "$lib/utils";
import type { ProfileGET, ProfileJSON } from "./models";

function processProfileJSON(data: ProfileJSON): ProfileGET {
    return {
        ...data,
        created_at: data.created_at ? new Date(data.created_at) : undefined
    };
}

export const profileClient = (fetch: Fetch) => {
    return {
        get: async () => {
            const userProfile = await fetchIntoResult<ProfileJSON>(() => fetch("/api/profile"));
            const profileData = userProfile.map(processProfileJSON);
            return profileData;
        }
    }
}