import React, { useState } from 'react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { LoginForm } from '../components/auth/LoginForm'
import { SignUpForm } from '../components/auth/SignUpForm'

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <AuthLayout>
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignUpForm onToggleMode={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  )
}