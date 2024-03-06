import { __secret } from "@ss/common"

export class AuthOptions {
    resetTokenExpiry: number | string = "10m" // https://github.com/zeit/ms
    accessTokenExpiry: number | string = "20m" // https://github.com/zeit/ms
    refreshTokenExpiry: number | string = "7 days"
    verifyTokenExpiry: number | string = "20m"
    maximumAllowedLoginAttempts = 5
    maximumAllowedLoginAttemptsExpiry = 60 * 5 * 1000 // 5 mins
    issuer: string = null
    forceEmailVerification = false
    forcePhoneVerification = false
    sendWelcomeEmail = true
    secret = __secret()

    externalAuth?: Record<string, Record<string, string>> = {}
}
