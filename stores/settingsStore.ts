import { create } from 'zustand'

type SettingsDialog = 'password' | 'delete' | null

interface PasswordFormState {
    newPassword: string
    confirmNewPassword: string
    currentPassword: string
    status: string
    loading: boolean
}

interface DeleteFormState {
    confirmation: string
    currentPassword: string
    status: string
    loading: boolean
}

interface SettingsStore {
    activeDialog: SettingsDialog
    password: PasswordFormState
    deleteAccount: DeleteFormState
    openDialog: (dialog: Exclude<SettingsDialog, null>) => void
    closeDialog: () => void
    setPasswordField: (
        field: keyof Pick<
            PasswordFormState,
            'newPassword' | 'confirmNewPassword' | 'currentPassword'
        >,
        value: string
    ) => void
    setPasswordStatus: (status: string) => void
    setPasswordLoading: (loading: boolean) => void
    resetPassword: (status?: string) => void
    setDeleteField: (
        field: keyof Pick<DeleteFormState, 'confirmation' | 'currentPassword'>,
        value: string
    ) => void
    setDeleteStatus: (status: string) => void
    setDeleteLoading: (loading: boolean) => void
    resetDelete: (status?: string) => void
}

const initialPasswordState: PasswordFormState = {
    newPassword: '',
    confirmNewPassword: '',
    currentPassword: '',
    status: '',
    loading: false,
}

const initialDeleteState: DeleteFormState = {
    confirmation: '',
    currentPassword: '',
    status: '',
    loading: false,
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    activeDialog: null,
    password: initialPasswordState,
    deleteAccount: initialDeleteState,
    openDialog: (dialog) =>
        set((state) => ({
            activeDialog: dialog,
            password:
                dialog === 'password'
                    ? { ...state.password, status: '' }
                    : state.password,
            deleteAccount:
                dialog === 'delete'
                    ? { ...state.deleteAccount, status: '' }
                    : state.deleteAccount,
        })),
    closeDialog: () =>
        set((state) => ({
            activeDialog: null,
            password:
                state.activeDialog === 'password'
                    ? {
                          ...initialPasswordState,
                          status: state.password.status,
                      }
                    : state.password,
            deleteAccount:
                state.activeDialog === 'delete'
                    ? {
                          ...initialDeleteState,
                          status: state.deleteAccount.status,
                      }
                    : state.deleteAccount,
        })),
    setPasswordField: (field, value) =>
        set((state) => ({
            password: {
                ...state.password,
                [field]: value,
            },
        })),
    setPasswordStatus: (status) =>
        set((state) => ({
            password: {
                ...state.password,
                status,
            },
        })),
    setPasswordLoading: (loading) =>
        set((state) => ({
            password: {
                ...state.password,
                loading,
            },
        })),
    resetPassword: (status = '') =>
        set({
            password: {
                ...initialPasswordState,
                status,
            },
        }),
    setDeleteField: (field, value) =>
        set((state) => ({
            deleteAccount: {
                ...state.deleteAccount,
                [field]: value,
            },
        })),
    setDeleteStatus: (status) =>
        set((state) => ({
            deleteAccount: {
                ...state.deleteAccount,
                status,
            },
        })),
    setDeleteLoading: (loading) =>
        set((state) => ({
            deleteAccount: {
                ...state.deleteAccount,
                loading,
            },
        })),
    resetDelete: (status = '') =>
        set({
            deleteAccount: {
                ...initialDeleteState,
                status,
            },
        }),
}))
