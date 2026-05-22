import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { AuthAside } from '@/components/auth'

import LoginForm from './components/login-form'

const SignInPage = () => {
  usePageTitle({ title: pageTitle.SIGN_IN_PAGE })

  return (
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[1.1fr_1fr]">
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
