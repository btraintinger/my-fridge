import { useState, useCallback } from 'react'

interface PasswordState {
    newPassword: string
    confirmNewPassword: string
    currentPassword: string
    status: string
    loading: boolean
}

interface DeleteState {
    confirmation: string
    currentPassword: string
    status: string
    loading: boolean
}

export function usePasswordChangeState() {
    const [state, setState] = useState<PasswordState>({
        newPassword: '',
        confirmNewPassword: '',
        currentPassword: '',
        status: '',
        loading: false,
    })

    const setNewPassword = useCallback((value: string) => {
        setState((prev) => ({ ...prev, newPassword: value }))
    }, [])

    const setConfirmNewPassword = useCallback((value: string) => {
        setState((prev) => ({ ...prev, confirmNewPassword: value }))
    }, [])

    const setCurrentPassword = useCallback((value: string) => {
        setState((prev) => ({ ...prev, currentPassword: value }))
    }, [])

    const setStatus = useCallback((status: string) => {
        setState((prev) => ({ ...prev, status }))
    }, [])

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, loading }))
    }, [])

    const reset = useCallback(() => {
        setState({
            newPassword: '',
            confirmNewPassword: '',
            currentPassword: '',
            status: '',
            loading: false,
        })
    }, [])

    return {
        ...state,
        setNewPassword,
        setConfirmNewPassword,
        setCurrentPassword,
        setStatus,
        setLoading,
        reset,
    }
}

export function useDeleteAccountState() {
    const [state, setState] = useState<DeleteState>({
        confirmation: '',
        currentPassword: '',
        status: '',
        loading: false,
    })

    const setConfirmation = useCallback((value: string) => {
        setState((prev) => ({ ...prev, confirmation: value }))
    }, [])

    const setCurrentPassword = useCallback((value: string) => {
        setState((prev) => ({ ...prev, currentPassword: value }))
    }, [])

    const setStatus = useCallback((status: string) => {
        setState((prev) => ({ ...prev, status }))
    }, [])

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, loading }))
    }, [])

    const reset = useCallback(() => {
        setState({
            confirmation: '',
            currentPassword: '',
            status: '',
            loading: false,
        })
    }, [])

    return {
        ...state,
        setConfirmation,
        setCurrentPassword,
        setStatus,
        setLoading,
        reset,
    }
}

