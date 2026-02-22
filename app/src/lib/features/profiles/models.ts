export interface ProfileJSON {
    user_id: string,
    first_name: string,
    last_name: string,
    role: string,
    bio?: string,
    skills?: string[],
    linkedin_link?: string,
    github_link?: string,
    portfolio_link?: string,
    created_at?: string,
}

export interface ProfileGET {
    user_id: string,
    first_name: string,
    last_name: string,
    role: string,
    bio?: string,
    skills?: string[],
    linkedin_link?: string,
    github_link?: string,
    portfolio_link?: string,
    created_at?: Date,
}