import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expires_at?: number;
  }
}

// 追加スコープ: 'https://www.googleapis.com/auth/calendar.readonly'
export const nextAuthOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          // Google OAuth画面で求めるスコープを指定
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          // access_typeをofflineにしておくとリフレッシュトークンが取得できる
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  // NextAuth.jsでセッション／JWTにトークンを保存する設定
  callbacks: {
    // JWTコールバック: アクセストークンやリフレッシュトークンをJWTに保持
    async jwt({ token, account }) {
      // 初回ログイン時 (アクセストークン, リフレッシュトークン取得)
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expires_at = account.expires_at; // UNIX time (秒)
      }

      // もしアクセストークンの有効期限が切れている／切れそうで、リフレッシュトークンがある場合は再取得する
      const shouldRefreshTime = 5 * 60; // 期限切れ前5分
      if (
        token.expires_at &&
        Date.now() / 1000 > token.expires_at - shouldRefreshTime
      ) {
        console.log("Refreshing Google Access Token...");
        try {
          // リフレッシュトークンで再取得
          const url =
            "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID || "",
              client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            });

          const response = await fetch(url, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            method: "POST",
          });

          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw refreshedTokens;
          }

          token.accessToken = refreshedTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + refreshedTokens.expires_in
          );
          // 必要であればrefreshTokenも更新
          if (refreshedTokens.refresh_token) {
            token.refreshToken = refreshedTokens.refresh_token;
          }
        } catch (error) {
          console.error("RefreshAccessTokenError", error);
          // 取得失敗時、ログアウト扱いにするなど
        }
      }

      return token;
    },

    // セッションコールバック: セッションの中にアクセストークンを含める
    async session({ session, token }) {
      if (token && session.user) {
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.expires_at = token.expires_at;
      }
      return session;
    },
  },

  // セッション管理方法
  session: {
    strategy: "jwt",
  },

  // NextAuthのSecret
  secret: process.env.NEXTAUTH_SECRET,
};
