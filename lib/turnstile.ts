/**
 * Cloudflare Turnstile Server Verification Utility
 */

export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
  hostname?: string;
  challengeTs?: string;
}

/**
 * Verify Cloudflare Turnstile token using Cloudflare siteverify API endpoint
 * @param token The token from cf-turnstile-response
 * @param remoteIp Optional client IP address
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured in environment variables");
    return {
      success: false,
      error: "Hệ thống chưa cấu hình Cloudflare Turnstile Secret Key.",
    };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "Vui lòng xác minh mã bảo mật Cloudflare Turnstile.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey.trim());
    formData.append("response", token.trim());
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Cloudflare Turnstile HTTP error: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        error: "Không thể kết nối đến máy chủ xác thực bảo mật Cloudflare.",
      };
    }

    const outcome = await response.json();

    if (outcome.success) {
      return {
        success: true,
        hostname: outcome.hostname,
        challengeTs: outcome.challenge_ts,
      };
    }

    const errorCodes: string[] = outcome["error-codes"] || [];
    console.warn("Cloudflare Turnstile validation failed with codes:", errorCodes);

    let friendlyError = "Mã xác minh bảo mật không hợp lệ hoặc đã hết hạn.";
    if (errorCodes.includes("timeout-or-duplicate")) {
      friendlyError = "Mã bảo mật đã hết hạn hoặc đã được sử dụng. Vui lòng xác thực lại.";
    } else if (errorCodes.includes("invalid-input-secret") || errorCodes.includes("missing-input-secret")) {
      friendlyError = "Lỗi cấu hình khóa bảo mật từ phía máy chủ.";
    }

    return {
      success: false,
      error: friendlyError,
    };
  } catch (error: any) {
    console.error("Error verifying Turnstile token:", error);
    return {
      success: false,
      error: "Lỗi kết nối khi xác thực bảo mật. Vui lòng thử lại sau.",
    };
  }
}
