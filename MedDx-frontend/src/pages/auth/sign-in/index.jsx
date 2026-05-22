import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { AuthAside } from '@/components/auth'

import LoginForm from './components/login-form'

const SignInPage = () => {
  usePageTitle({ title: pageTitle.SIGN_IN_PAGE })

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr] bg-grain">
      <AuthAside
        title="Welcome back to"
        italicWord="quieter care."
        body="Pick up where you left off — your specialists, your records, and your prescriptions are right where they should be."
        quote="The doctor saw me from the village clinic. No bus, no full day lost. Just care."
        quoteAuthor="Patient · Vidarbha, Maharashtra"
      />
      <LoginForm />
    </div>
  )
}

export default SignInPage
