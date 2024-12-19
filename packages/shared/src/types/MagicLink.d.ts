declare interface MagicLink {
    magicLinkId: string;
    clientId: string;
    token: string;
    usedDateTime?: Date;
    createdDateTime?: Date;
    expirationDateTime?: Date;
    usedCount?: number;
    // client fields
    isLoading?: boolean = false;
    isExpired?: boolean = false;
    hasBeenUsed?: boolean = false;
    isAccountLocked?: boolean = undefined;
    hasVerifiedSecurityQuestions?: boolean = undefined;
    clientEmail?: string;
    status: null | MagicLinkStatus;
}