import { profileClient } from '$lib/features/profiles/client.js';

export async function load({ fetch }) {
    const userProfile = await profileClient(fetch).get();
    return {
        profileData: userProfile,
    }
}