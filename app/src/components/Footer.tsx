"use client"

import Link from "next/link"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white dark:bg-stone-950">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center">
                    <div className="py-6">
                        <div className="text-center text-sm text-gray-500">
                            © {currentYear} MyAddressHub. All rights reserved.
                        </div>
                    </div>

                    <div className="flex space-x-6">
                        <Link
                            href="/about"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        >
                            About
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
