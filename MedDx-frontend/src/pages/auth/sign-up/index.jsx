import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { AuthAside } from '@/components/auth'

import SignUpForm from './components/signup-form'

const SignUpPage = () => {
  usePageTitle({ title: pageTitle.SIGN_UP_PAGE })

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr] bg-grain">
      <AuthAside
        title="Care that meets you"
        italicWord="where you are."
        body="Sign up to consult admin-verified specialists over secure video. First consultation is free — no card required."
        quote="MedDx routed me to the right specialist on the first try. The doctor's notes came back the same day, in my language."
        quoteAuthor="Patient · Nashik, Maharashtra"
      />
      <SignUpForm />
    </div>
  )
}

export default SignUpPage
