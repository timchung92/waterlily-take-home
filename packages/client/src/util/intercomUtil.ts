export function updateIntercomUser(
  user: {
    name: string;
    email: string;
    createdAt: number;
    userId: string;
    userHash: string;
    clientAdlCount?: number;
    clientPartOfGroupPlan?: boolean;
  },
  path: string,
) {
  window.Intercom('update', {
    name: user.name, // Full name
    email: user.email, // the email for your user
    created_at: user.createdAt, // Signup date as a Unix timestamp
    user_id: user.userId, // User ID
    user_hash: user.userHash, // Identity Verification HMAC
    client_adl_count: user.clientAdlCount ?? null,
    client_part_of_group_plan: user.clientPartOfGroupPlan ?? null,

    path,
  });
}

export function initializeIntercom() {
  window.Intercom('boot', {
    app_id: 'kx3qn1mv',
    api_base: 'https://api-iam.intercom.io',
  });
}
