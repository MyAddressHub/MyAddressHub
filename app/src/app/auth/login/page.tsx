"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login, user, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()

    // Only redirect if user is authenticated and we're not in a loading state
    useEffect(() => {
        if (user && !isAuthLoading && !isLoading) {
            router.replace("/")
        }
    }, [user, isAuthLoading, isLoading, router])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            e.stopPropagation()

            if (isLoading) return

            setError("")
            setIsLoading(true)

            try {
                await login(username, password)
            } catch (err: any) {
                console.error("Login error:", err)
                const errorMessage =
                    err.response?.data?.detail ||
                    "Failed to login. Please check your credentials and try again."
                setError(errorMessage)
                setPassword("")
            } finally {
                setIsLoading(false)
            }
        },
        [isLoading, login, password, username]
    )

    // Show loading state while checking initial authentication
    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mb-4 text-gray-600 dark:text-gray-300">
                        Loading...
                    </div>
                </div>
            </div>
        )
    }

    // Don't show login form if user is authenticated
    if (user) {
        return null
    }

    return (
        <div className="flex min-h-[calc(100vh-300px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-stone-950 relative isolate ">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{" "}
                        <Link
                            href="/auth/register"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div
                        className="rounded-md bg-red-50 p-4 dark:bg-red-900/30"
                        role="alert"
                    >
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="off"
                >
                    <input type="hidden" name="remember" value="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="px-3 relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 sm:text-sm sm:leading-6"
                                placeholder="Username"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="px-3 relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 sm:text-sm sm:leading-6"
                                placeholder="Password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                href="/auth/forgot-password"
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-900 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
            {/* top background blob */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute  inset-x-0 -top-40 -z-20 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            {/* bottom background blob */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-20 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-40rem)] "
            >
                <div
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>
        </div>
    )
}
