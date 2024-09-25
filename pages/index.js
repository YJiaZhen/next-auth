import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from 'react'
import { getSession } from "next-auth/react"

export default function Home({ serverSession }) {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setError('')
    try {
      console.log("[Home] Attempting email sign in", { email })
      const result = await signIn('email', { email, redirect: false })
      console.log("[Home] Sign in result", result)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error) {
      console.error("[Home] Sign in error", error)
      setError('An unexpected error occurred')
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
    return <p>Loading...</p>
  }

  if (session) {
    console.log("[Home] User is signed in", session.user)
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.email}!</h1>
        <p>You are signed in with: {session.user.provider_id || 'Email'}</p>
        <button 
          onClick={() => {
            console.log("[Home] Sign out clicked")
            signOut()
          }} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to our website</h1>
      <p className="mb-4">Please sign in with your email or Google</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleEmailSignIn} className="space-y-4 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Sign in with Email
        </button>
      </form>
      <button 
        onClick={handleGoogleSignIn}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Sign in with Google
      </button>
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