"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/libs/supabase'
import ButtonBackHome from '@/components/ButtonBackHome'

export default function SignUpPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            })

            if (error) throw error

            alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
            router.push('/signin')
        } catch (error) {
            console.error('회원가입 중 오류:', error)
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <ButtonBackHome />

                <h1 className="text-2xl font-bold mb-6 mt-4">회원가입</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="label">
                            <span className="label-text">이메일</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="input input-bordered w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            <span className="label-text">비밀번호</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input input-bordered w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="label">
                            <span className="label-text">비밀번호 확인</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input input-bordered w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-error text-sm">{error}</div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => router.back()}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                '회원가입'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
} 