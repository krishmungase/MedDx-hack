import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { AuthAside } from '@/components/auth'

import SignUpForm from './components/signup-form'

const SignUpPage = () => {
  usePageTitle({ title: pageTitle.SIGN_UP_PAGE })

  return (
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      <AuthAside
        title="Care that meets you"
        italicWord="where you are."
        body="Sign up to consult admin-verified specialists over secure video. First consultation is free — no card required."
      />
      <SignUpForm />
    </div>
  )
}

export default SignUpPage
