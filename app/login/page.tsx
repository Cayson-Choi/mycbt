"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

function isKakaoInApp() {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes("kakaotalk")
}

function openExternalBrowser(url: string) {
  const intentUrl =
    `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("iphone") || ua.includes("ipad")) {
    window.location.href = url
  } else {
    window.location.href = intentUrl
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [kakaoAlert, setKakaoAlert] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    if (isKakaoInApp()) {
      setKakaoAlert(true)
      setTimeout(() => {
        openExternalBrowser(window.location.href)
      }, 1500)
      return
    }
    setSocialLoading("google")
    signIn("google", { callbackUrl: "/" })
  }

  const handleSocialLogin = (provider: string) => {
    setSocialLoading(provider)
    signIn(provider, { callbackUrl: "/" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "signup") {
      // 1단계: 계정 생성 (비밀번호 저장)
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          setLoading(false)
          return
        }

        if (data.sendVerification) {
          // 2단계: 인증 메일 발송 (기존 Nodemailer 매직링크 활용)
          await signIn("nodemailer", { email, redirect: false, callbackUrl: "/" })
          setEmailSent(true)
        } else {
          // 소셜 계정에 비밀번호 추가한 경우 → 바로 로그인 가능
          setError("")
          setMode("login")
          setLoading(false)
          return
        }
      } catch {
        setError("오류가 발생했습니다")
      }
      setLoading(false)
    } else {
      // 로그인: 이메일+비밀번호
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다")
        setLoading(false)
      } else {
        window.location.href = "/"
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-0 sm:min-h-[60vh] gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">로그인</h1>
        <p className="text-gray-500 dark:text-gray-400">
          전기짱에 오신 것을 환영합니다
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* 카카오톡 인앱 구글 로그인 안내 */}
        {kakaoAlert && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
              카카오톡 내에서는 구글 로그인이 불가합니다.
            </p>
            <p className="text-yellow-700 dark:text-yellow-400">
              외부 브라우저로 이동합니다. 잠시만 기다려주세요...
            </p>
          </div>
        )}

        {/* 로그인 중 표시 */}
        {socialLoading && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-center">
            <div className="text-blue-700 dark:text-blue-300 font-medium">
              로그인 중...
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              로그인 화면으로 이동합니다
            </p>
          </div>
        )}

        {/* 소셜 로그인 */}
        <button
          onClick={handleGoogleLogin}
          disabled={!!socialLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>{socialLoading === "google" ? "로그인 중..." : "Google로 로그인"}</span>
        </button>

        <button
          onClick={() => handleSocialLogin("kakao")}
          disabled={!!socialLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] text-black rounded-lg hover:bg-[#FDD800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#000" d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.37 6.24l-1.12 4.16c-.1.35.3.64.6.44l4.96-3.27c.39.04.79.06 1.19.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
          </svg>
          <span>{socialLoading === "kakao" ? "로그인 중..." : "카카오로 로그인"}</span>
        </button>

        <button
          onClick={() => handleSocialLogin("naver")}
          disabled={!!socialLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-bold">N</span>
          <span>{socialLoading === "naver" ? "로그인 중..." : "네이버로 로그인"}</span>
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-500">또는</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* 이메일+비밀번호 */}
        {emailSent ? (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-medium">
              인증 메일을 발송했습니다
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {email}로 보낸 메일의 링크를 클릭하면 가입이 완료됩니다
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "비밀번호 설정 (6자 이상)" : "비밀번호"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading
                  ? (mode === "signup" ? "처리 중..." : "로그인 중...")
                  : (mode === "signup" ? "회원가입" : "로그인")
                }
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {mode === "login" ? (
                <p>
                  계정이 없으신가요?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError("") }}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    회원가입
                  </button>
                </p>
              ) : (
                <p>
                  이미 계정이 있으신가요?{" "}
                  <button
                    onClick={() => { setMode("login"); setError("") }}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    로그인
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
