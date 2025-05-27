'use client'
import { loading } from '@/lib/features/User'
import axios from '@/services/asios'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

function useFetch(initialUrl: string) {
    const [url, setUrl] = useState(initialUrl)
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!url) return

        const fetchData = async () => {
            setIsLoading(true)
            dispatch(loading(true))
            try {
                const { data } = await axios.get(url)
                setResponse(data)
                setError(null)
            } catch (err) {
                setError(err)
            } finally {
                setIsLoading(false)
                dispatch(loading(false))
            }
        }

        fetchData()
    }, [url, dispatch])

    return { response, error, isLoading, setUrl }
}

export default useFetch
