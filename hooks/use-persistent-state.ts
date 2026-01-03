"use client"

import { useState, useEffect, type Dispatch, type SetStateAction } from "react"

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialValue)

    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return

        try {
            const item = window.sessionStorage.getItem(key)
            if (item) {
                setState(JSON.parse(item))
            }
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error)
        }
    }, [key])

    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return

        try {
            window.sessionStorage.setItem(key, JSON.stringify(state))
        } catch (error) {
            console.warn(`Error writing sessionStorage key "${key}":`, error)
        }
    }, [key, state])

    return [state, setState]
}
