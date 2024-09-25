import { signIn } from "next-auth/react"

export default function SignIn() {
  return (
    <div>
      <button onClick={() => signIn('email')}>Sign in with Email</button>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  )
}