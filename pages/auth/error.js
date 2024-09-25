import { useRouter } from 'next/router'

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred: {error}</p>
      {error === 'OAuthAccountNotLinked' && (
        <p>
          It seems you already have an account with this email address. 
          Please sign in with the method you used originally.
        </p>
      )}
      <button onClick={() => router.push('/')}>Back to Sign In</button>
    </div>
  )
}