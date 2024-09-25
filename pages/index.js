import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from 'react'

export default function Home() {
  const { data: session, status  } = useSession()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const result = await signIn('email', { email, redirect: false })
      if (result.error) {
        setError(result.error)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error(error)
    }
  }
  console.log('session', session)
  console.log('status', status)

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.email}!</h1>
        <button 
          onClick={() => signOut()} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to our website</h1>
      <p className="mb-4">Please sign in with your email</p>
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
        onClick={() => signIn('google')}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Sign in with Google
      </button>
    </div>
  )
}