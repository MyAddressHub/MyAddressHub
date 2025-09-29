"use client"

import React, { useState, useEffect, useRef } from "react"
import { AddressForm } from "@/components/AddressForm"
import { AddressList } from "@/components/AddressList"
import { addressesAPI } from "@/shared/api/addresses"
import { useAuth } from "@/lib/auth"
import { PermissionManager } from "@/components/PermissionManager"
import Image from "next/image"
import Typewriter from "typewriter-effect"
import { FaPlus } from "react-icons/fa"
import { scrollToElement } from "@/utils/functions"

interface Address {
    id: string
    addressName: string
    address: string
    street: string
    suburb: string
    state: string
    postcode: string
    isDefault: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
    fullAddress: string
    addressBreakdown: {
        address: string
        street: string
        suburb: string
        state: string
        postcode: string
    }
}

export default function AddressesPage() {
    const { user } = useAuth()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [showPermissionManager, setShowPermissionManager] = useState(false)
    const [selectedAddressForPermissions, setSelectedAddressForPermissions] =
        useState<Address | null>(null)
    const formRef = useRef(null)
    const manageREf = useRef(null)

    // Debug authentication
    useEffect(() => {
        console.log("AddressesPage - User:", user)
        console.log(
            "AddressesPage - Auth token:",
            localStorage.getItem("accessToken")
        )
        console.log(
            "AddressesPage - Refresh token:",
            localStorage.getItem("refreshToken")
        )
    }, [user])

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setShowCopyToast(true)
            setTimeout(() => setShowCopyToast(false), 2000)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    // Load addresses on component mount
    useEffect(() => {
        if (user) {
            console.log("Loading addresses for user:", user.username)
            loadAddresses()
        } else {
            console.log("No user found, not loading addresses")
        }
    }, [user])

    const loadAddresses = async () => {
        try {
            setIsLoading(true)
            console.log("Attempting to load addresses...")
            const response = await addressesAPI.getUserAddresses()
            console.log("Raw API response:", response)
            console.log("Response type:", typeof response)
            console.log("Response keys:", Object.keys(response))

            if (response.success) {
                console.log("Address data received:", response.data)
                console.log("Data type:", typeof response.data)
                console.log(
                    "Data length:",
                    Array.isArray(response.data)
                        ? response.data.length
                        : "Not an array"
                )

                // Log each address to see the structure
                if (Array.isArray(response.data)) {
                    response.data.forEach((address: any, index: number) => {
                        console.log(`Address ${index + 1}:`, {
                            id: address.id,
                            addressName: address.addressName,
                            isDefault: address.isDefault,
                            createdAt: address.createdAt,
                            createdAtType: typeof address.createdAt,
                            fullAddress: address.fullAddress,
                            address: address.address,
                        })
                    })
                }
                setAddresses(response.data)
            } else {
                console.error("API returned success: false:", response)
            }
        } catch (error: any) {
            console.error("Error loading addresses:", error)
            console.error("Error response:", error.response)
            // Show user-friendly error message
            if (error.response?.status === 401) {
                alert(
                    "Please log in to view your addresses. You will be redirected to the login page."
                )
                window.location.href = "/auth/login"
            } else {
                alert("Failed to load addresses. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAddress = async (addressData: any) => {
        console.log("handleCreateAddress called with data:", addressData)
        try {
            setIsSubmitting(true)
            // The form now provides both the sub-parts and the built full address
            const requestData = {
                addressName: addressData.addressName,
                address: addressData.address, // This is the automatically built full address
                street: addressData.street,
                suburb: addressData.suburb,
                state: addressData.state,
                postcode: addressData.postcode,
                isDefault: addressData.isDefault || false,
            }
            console.log("Sending request data:", requestData)
            const response = await addressesAPI.createAddress(requestData)
            console.log("createAddress response:", response)
            if (response.success) {
                setShowForm(false)
                await loadAddresses()
                setSuccessMessage("Address created successfully!")
            }
        } catch (error: any) {
            console.error("Error creating address:", error)
            if (error.response?.status === 401) {
                alert(
                    "Please log in to create addresses. You will be redirected to the login page."
                )
                window.location.href = "/auth/login"
            } else {
                alert("Failed to create address. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateAddress = async (addressData: any) => {
        if (!editingAddress) return

        console.log("handleUpdateAddress called with data:", addressData)
        try {
            setIsSubmitting(true)
            // The form now provides both the sub-parts and the built full address
            const requestData = {
                addressName: addressData.addressName,
                address: addressData.address, // This is the automatically built full address
                street: addressData.street,
                suburb: addressData.suburb,
                state: addressData.state,
                postcode: addressData.postcode,
                isDefault: addressData.isDefault || false,
            }
            console.log("Sending update request data:", requestData)
            const response = await addressesAPI.updateAddress(
                editingAddress.id,
                requestData
            )
            console.log("updateAddress response:", response)
            if (response.success) {
                setShowForm(false)
                setEditingAddress(null)
                await loadAddresses()
                setSuccessMessage("Address updated successfully!")
            }
        } catch (error: any) {
            console.error("Error updating address:", error)
            if (error.response?.status === 401) {
                alert(
                    "Please log in to update addresses. You will be redirected to the login page."
                )
                window.location.href = "/auth/login"
            } else {
                alert("Failed to update address. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return

        try {
            const response = await addressesAPI.deleteAddress(addressId)
            console.log("deleteAddress response:", response)
            if (response.success) {
                await loadAddresses()
                setSuccessMessage("Address deleted successfully!")
            }
        } catch (error) {
            console.error("Error deleting address:", error)
        }
    }

    const handleSetDefaultAddress = async (addressId: string) => {
        try {
            const response = await addressesAPI.setDefaultAddress(addressId)
            console.log("setDefaultAddress response:", response)
            if (response.success) {
                await loadAddresses()
                setSuccessMessage("Default address updated successfully!")
            }
        } catch (error) {
            console.error("Error setting default address:", error)
        }
    }

    const handleViewBreakdown = async (addressId: string) => {
        try {
            const response = await addressesAPI.getAddressBreakdown(addressId)
            console.log("Address breakdown response:", response)
            if (response.success) {
                alert(
                    `Address Breakdown:\n${JSON.stringify(response.data, null, 2)}`
                )
            }
        } catch (error) {
            console.error("Error getting address breakdown:", error)
        }
    }

    const handleManagePermissions = (address: Address) => {
        setSelectedAddressForPermissions(address)
        setShowPermissionManager(true)
    }

    const handlePermissionChange = () => {
        // Reload addresses to reflect any permission changes
        loadAddresses()
    }

    const handleClosePermissionManager = () => {
        setShowPermissionManager(false)
        setSelectedAddressForPermissions(null)
    }

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address)
        setShowForm(true)
    }

    const handleCancelForm = () => {
        setShowForm(false)
        setEditingAddress(null)
    }

    const handleSubmitForm = async (data: any) => {
        console.log("handleSubmitForm called with data:", data)
        // The form now automatically builds the full address from sub-parts
        // data.address contains the built full address
        // data also contains all the individual fields (street, suburb, state, postcode)
        if (editingAddress) {
            console.log("Updating existing address...")
            await handleUpdateAddress(data)
        } else {
            console.log("Creating new address...")
            await handleCreateAddress(data)
        }
    }

    useEffect(() => {
        if (showForm) {
            // wait for the next paint so layout is ready
            requestAnimationFrame(() => {
                if (formRef) {
                    formRef?.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    })
                }
            })
        }
    }, [showForm])
    // Check if user is an individual user
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
                <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-stone-950 dark:text-white">
                            Please log in to access your dashboard
                        </h1>
                    </div>
                </div>
            </div>
        )
    }

    //type writer package init

    const userName = user.first_name || user.username

    if (user.profile?.user_type === "organization") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-stone-950 dark:text-white">
                            Access Denied
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            This dashboard is only available for individual
                            users. Organization users should use the
                            organization dashboard.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const defaultAddress = addresses.find((addr) => addr.isDefault)
    const totalAddresses = addresses.length

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}

                <div className="relative isolate">
                    <div className="mb-8 z-20">
                        <div className="flex items-center justify-between h-[75vh]">
                            <div className="lg:w-3/5">
                                {" "}
                                {/* <h1 className="text-3xl font-bold text-stone-950 dark:text-white ">
                                    {" "}
                                    {user.first_name || user.username}!
                                </h1> */}
                                <h1 className="text-4xl font-bold text-stone-950 dark:text-white">
                                    <Typewriter
                                        options={{
                                            strings: [
                                                `Hello ${userName}`,
                                                "Welcome Back!",
                                            ],
                                            autoStart: true,
                                            loop: true,
                                        }}
                                    />
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Manage your addresses and keep them
                                    organized.
                                </p>
                                <div className="flex text text-stone-950 dark:text-white mt-8 gap-x-5">
                                    <button
                                        onClick={() =>
                                            scrollToElement(manageREf)
                                        }
                                        className="px-7 py-3 bg-gray-400 dark:bg-gray-700 rounded-3xl"
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowForm(true)
                                            scrollToElement(formRef)
                                        }}
                                        className="px-7 py-3 bg-gray-400 dark:bg-gray-700 rounded-3xl flex items-center gap-x-2"
                                    >
                                        <span>
                                            <FaPlus />
                                        </span>
                                        <span>New Address</span>
                                    </button>
                                </div>
                            </div>

                            <div className="relative w-2/5 h-full  hidden lg:block -mb-10">
                                {/* blurred bg layer */}
                                <Image
                                    src="/hero.jpg"
                                    alt="city"
                                    fill
                                    priority
                                    className="object-cover blur-[4px] saturate-150 brightness-90 rounded-lg "
                                />
                                {/* sharp layer on top */}
                                <Image
                                    src="/hero.jpg"
                                    alt="city"
                                    fill
                                    className="object-cover scale-y-[82.5%] scale-x-[85%] translate-x-9  saturate-[25%] rounded-xs"
                                />
                                <div className="absolute w-full h-full bg-transparent origin-top-left top-[-6%] left-[-10%] -z-10  border-[2.5px] border-gray-800 scale-[95%] rounded-sm"></div>
                            </div>
                            {/* <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Addresses
                                </p>
                                <p className="text-2xl font-bold text-stone-950 dark:text-white">
                                    {totalAddresses}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add New Address
                            </button>
                        </div> */}
                        </div>
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
                        className="pointer-events-none absolute inset-x-0 top-[calc(100%-13rem)] -z-20 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
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

                {/* Success Notification */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {successMessage}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="inline-flex rounded-md bg-green-50 dark:bg-green-900/20 p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50 dark:focus:ring-offset-green-900/20"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <svg
                                            className="h-5 w-5"
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

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 mb-20">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Total Addresses
                                </p>
                                <p className="text-2xl font-bold text-stone-950 dark:text-white">
                                    {totalAddresses}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Default Address
                                </p>
                                <p className="text-lg font-semibold text-stone-950 dark:text-white">
                                    {defaultAddress
                                        ? defaultAddress.addressName
                                        : "Not set"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Last Updated
                                </p>
                                <p className="text-lg font-semibold text-stone-950 dark:text-white">
                                    {addresses.length > 0
                                        ? (() => {
                                              try {
                                                  const date = new Date(
                                                      addresses[0].updatedAt
                                                  )
                                                  if (isNaN(date.getTime())) {
                                                      return "Recently"
                                                  }
                                                  return date.toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      }
                                                  )
                                              } catch (error) {
                                                  return "Recently"
                                              }
                                          })()
                                        : "Never"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Default Address Card */}
                {defaultAddress && (
                    <div ref={manageREf} className="mb-20">
                        <h2 className="text-xl font-semibold text-stone-950 dark:text-white mb-4">
                            Default Address
                        </h2>
                        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-medium text-stone-950 dark:text-white">
                                            {defaultAddress.addressName ||
                                                "Unnamed Address"}{" "}
                                            --{" "}
                                            <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                                {defaultAddress.id}
                                            </span>
                                        </h3>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    defaultAddress.id
                                                )
                                            }
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Copy UUID"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Default
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {defaultAddress.address}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        handleViewBreakdown(defaultAddress.id)
                                    }
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address Form or Address List */}
                {showForm ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-stone-950 dark:text-white">
                                {editingAddress
                                    ? "Edit Address"
                                    : "Add New Address"}
                            </h2>
                        </div>
                        <div ref={formRef}>
                            <AddressForm
                                initialData={editingAddress || undefined}
                                onSubmit={handleSubmitForm}
                                onCancel={handleCancelForm}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-stone-950 dark:text-white">
                                All Addresses ({addresses.length})
                            </h2>
                            {addresses.length > 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-7 py-3 bg-gray-400 dark:bg-gray-700 rounded-3xl flex items-center gap-x-2 text-stone-950 dark:text-white"
                                >
                                    <span>
                                        {" "}
                                        <FaPlus />{" "}
                                    </span>
                                    <span>New Address</span>
                                </button>
                            )}
                        </div>

                        <AddressList
                            addresses={addresses}
                            onEdit={handleEditAddress}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                            onViewBreakdown={handleViewBreakdown}
                            onManagePermissions={handleManagePermissions}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>

            {/* Copy Toast Notification */}
            {showCopyToast && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span>UUID copied to clipboard!</span>
                    </div>
                </div>
            )}

            {/* Permission Manager Modal */}
            {showPermissionManager && selectedAddressForPermissions && (
                <PermissionManager
                    address={selectedAddressForPermissions}
                    onClose={handleClosePermissionManager}
                    onPermissionChange={handlePermissionChange}
                />
            )}
        </div>
    )
}
