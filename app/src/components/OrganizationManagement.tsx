"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import axios from "@/shared/api/axios"

interface OrganizationMember {
    id: string
    userUsername: string
    userEmail: string
    userFirstName: string
    userLastName: string
    role: "owner" | "admin" | "manager" | "member"
    createdByUsername: string
    createdAt: string
    isActive: boolean
}

interface CreateUserFormData {
    username: string
    email: string
    first_name: string
    last_name: string
    password: string
    password2: string
    role: "member" | "manager" | "admin"
}

const OrganizationManagement: React.FC = () => {
    const { user, token, refreshUser } = useAuth()
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [createForm, setCreateForm] = useState<CreateUserFormData>({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
        role: "member",
    })

    // Check if user is organization user
    const isOrganizationUser = user?.profile?.user_type === "organization"

    useEffect(() => {
        if (isOrganizationUser && token) {
            fetchOrganizationUsers()
        }
    }, [isOrganizationUser, token])

    const fetchOrganizationUsers = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/auth/organization/users/")
            console.log("API Response:", response.data)
            console.log("Response type:", typeof response.data)
            console.log("Is array:", Array.isArray(response.data))

            // Handle different response formats
            let membersData = response.data
            if (
                response.data &&
                typeof response.data === "object" &&
                !Array.isArray(response.data)
            ) {
                // If it's an object, check for common pagination/response wrappers
                membersData =
                    response.data.results ||
                    response.data.data ||
                    response.data.members ||
                    []
            }

            console.log("Processed members data:", membersData)

            setMembers(Array.isArray(membersData) ? membersData : [])
        } catch (err) {
            setError("Failed to fetch organization users")
            console.error("Error fetching organization users:", err)
            setMembers([]) // Set empty array on error
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        if (createForm.password !== createForm.password2) {
            setError("Passwords do not match")
            return
        }

        try {
            const response = await axios.post(
                "/api/auth/organization/users/create/",
                createForm
            )

            if (response.status === 201) {
                setCreateForm({
                    username: "",
                    email: "",
                    first_name: "",
                    last_name: "",
                    password: "",
                    password2: "",
                    role: "member",
                })
                setShowCreateForm(false)
                fetchOrganizationUsers() // Refresh data
            } else {
                setError("Failed to create user")
            }
        } catch (err) {
            setError("Failed to create user")
            console.error("Error creating user:", err)
        }
    }

    const handleUpdateUserRole = async (memberId: string, newRole: string) => {
        if (!token) return

        try {
            const response = await axios.patch(
                `/api/auth/organization/users/${memberId}/role/`,
                { role: newRole }
            )

            if (response.status === 200) {
                fetchOrganizationUsers() // Refresh data
            } else {
                setError("Failed to update user role")
            }
        } catch (err) {
            setError("Failed to update user role")
            console.error("Error updating user role:", err)
        }
    }

    const handleDeactivateUser = async (memberId: string) => {
        if (!token) return

        if (!confirm("Are you sure you want to deactivate this user?")) {
            return
        }

        try {
            const response = await axios.patch(
                `/api/auth/organization/users/${memberId}/deactivate/`,
                { is_active: false }
            )

            if (response.status === 200) {
                fetchOrganizationUsers() // Refresh data
            } else {
                setError("Failed to deactivate user")
            }
        } catch (err) {
            setError("Failed to deactivate user")
            console.error("Error deactivating user:", err)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "owner":
                return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            case "admin":
                return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
            case "manager":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
            case "member":
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        }
    }

    if (!isOrganizationUser) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                            Organization User Management
                        </h2>
                        <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                            This feature is only available for organization
                            users. Please contact your administrator to join an
                            organization.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-stone-950 dark:text-white">
                                Organization User Management
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Manage users within your organization
                            </p>
                        </div>
                        <button
                            onClick={refreshUser}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Refresh Profile
                        </button>
                    </div>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {error}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setError(null)}
                                        className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 dark:focus:ring-offset-red-900/20 focus:ring-red-600"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <svg
                                            className="h-3 w-3"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-stone-950 dark:text-white">
                            Organization Users
                        </h2>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Create User
                        </button>
                    </div>

                    {!Array.isArray(members) || members.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No users found.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Created By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {Array.isArray(members) &&
                                        members.map((member) => (
                                            <tr key={member.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-stone-950 dark:text-white">
                                                            {
                                                                member.userFirstName
                                                            }{" "}
                                                            {
                                                                member.userLastName
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {member.userEmail}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            @
                                                            {
                                                                member.userUsername
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}
                                                    >
                                                        {member.role
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            member.role.slice(
                                                                1
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(
                                                        member.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {member.createdByUsername}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"}`}
                                                    >
                                                        {member.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) =>
                                                            handleUpdateUserRole(
                                                                member.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs text-white cursor-pointer"
                                                        disabled={
                                                            member.userUsername ===
                                                            user?.username
                                                        }
                                                    >
                                                        <option value="member">
                                                            Member
                                                        </option>
                                                        <option value="manager">
                                                            Manager
                                                        </option>
                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                        <option value="owner">
                                                            Owner
                                                        </option>
                                                    </select>
                                                    {member.userUsername !==
                                                        user?.username &&
                                                        member.isActive && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeactivateUser(
                                                                        member.id
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900 text-xs"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create User Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-stone-950 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-stone-950 dark:text-white mb-4">
                                    Create New User
                                </h3>
                                <form onSubmit={handleCreateUser}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.username}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    username: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={createForm.email}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.first_name}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.last_name}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={createForm.role}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    role: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                        >
                                            <option value="member">
                                                Member
                                            </option>
                                            <option value="manager">
                                                Manager
                                            </option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={createForm.password}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={createForm.password2}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    password2: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-stone-950 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCreateForm(false)
                                            }
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Create User
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrganizationManagement
