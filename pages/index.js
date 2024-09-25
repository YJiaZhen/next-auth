import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { getSession } from "next-auth/react"

export default function Home({ serverSession }) {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [isResendDisabled, setIsResendDisabled] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
    } else {
      setIsResendDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    await sendEmailSignIn()
  }

  const sendEmailSignIn = async () => {
    setError('')
    setEmailSent(false)
    try {
      console.log("[Home] Attempting email sign in", { email })
      const result = await signIn('email', { email, redirect: false })
      console.log("[Home] Sign in result", result)
      if (result?.error) {
        setError(result.error)
      } else {
        setEmailSent(true)
        setIsResendDisabled(true)
        setResendCountdown(60) // 60 seconds cooldown
      }
    } catch (error) {
      console.error("[Home] Sign in error", error)
      setError('An unexpected error occurred')
    }
  }

  const handleResendEmail = async () => {
    if (!isResendDisabled) {
      await sendEmailSignIn()
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log("[Home] Google sign in clicked")
      const result = await signIn('google', { redirect: false })
      console.log("[Home] Google sign in result", result)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error) {
      console.error("[Home] Google sign in error", error)
      setError('An unexpected error occurred during Google sign in')
    }
  }

  console.log("[Home] Rendering. Status:", status, "Session:", session || serverSession)

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  if (session) {
    console.log("[Home] User is signed in", session.user)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome, {session.user.email}!</h1>
          <p className="text-center text-gray-600 mb-6">You are signed in with: {session.user.provider_id || 'Email'}</p>
          <button 
            onClick={() => {
              console.log("[Home] Sign out clicked")
              signOut()
            }} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome to AI客服媒合通</h1>
        <p className="text-center text-gray-600 mb-6">Please sign in with your email or Google</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {emailSent && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Email sent! </strong>
            <span className="block sm:inline">Please check your inbox for the login link.</span>
          </div>
        )}
        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Sign in with Email
          </button>
        </form>
        {emailSent && (
          <button 
            onClick={handleResendEmail}
            disabled={isResendDisabled}
            className={`w-full mb-4 ${isResendDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out`}
          >
            {isResendDisabled ? `Resend Email (${resendCountdown}s)` : 'Resend Email'}
          </button>
        )}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
        <button 
          onClick={handleGoogleSignIn}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  let session = null
  try {
    session = await getSession(context)
    console.log("[getServerSideProps] Session:", session)
  } catch (error) {
    console.error("[getServerSideProps] Error fetching session:", error)
  }
  return {
    props: { serverSession: session }
  }
}