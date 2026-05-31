"use client"
import { useEffect, useState } from 'react'

const LOCATION_STORAGE_KEY = "user_location"
const LOCATION_EXPIRY_DAYS = 20

interface LocationData {
    country: string
    city: string
    timestamp: number
}

const getStoredLocation = (): LocationData | null => {
    // Prevent SSR errors by checking if window is defined
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!stored) return null

    try {
        const parsedData = JSON.parse(stored)
        const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        const isExpired = Date.now() - parsedData.timestamp > expiryTime

        return isExpired ? null : parsedData
    } catch (e) {
        return null // Handle potential JSON parsing errors safely
    }
}

const useLocationTracker = () => {
    // Start with null to prevent Next.js hydration mismatch
    const [location, setLocation] = useState<LocationData | null>(null)

    useEffect(() => {
        // 1. Check local storage safely on the client side after mount
        const stored = getStoredLocation()
        if (stored) {
            setLocation(stored)
            return
        }

        // 2. Fetch via HTTPS if no valid cache exists
        fetch("https://ipapi.co/json/")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok")
                return res.json()
            })
            .then(data => {
                console.log("Fetched location data:", data) // Debug log to verify API response
                const locationData: LocationData = {
                    // ipapi.co uses 'country_name' instead of 'country'
                    country: data.country_name || "Unknown", 
                    city: data.city || "Unknown",
                    timestamp: Date.now()
                }
                setLocation(locationData)
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData))
            })
            .catch((err) => {
                console.error("Failed to fetch location:", err)
                
                const fallbackLocation: LocationData = {
                    country: "Unknown",
                    city: "Unknown",
                    timestamp: Date.now()
                }
                setLocation(fallbackLocation)
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(fallbackLocation))
            })
    }, [])

    console.log("Location:", location) // Debug log to verify location is being set

    return location
}

export default useLocationTracker