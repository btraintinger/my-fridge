export interface ServiceConfig {
    notifySuccess: (message: string) => void
    notifyError: (error: string | Error) => void
}

export abstract class BaseService {
    protected config?: ServiceConfig

    init(config: ServiceConfig) {
        this.config = config
    }

    protected async handleAction<T>(
        action: () => Promise<T>,
        successMessage?: string,
        errorMessage?: string
    ): Promise<T> {
        try {
            const result = await action()
            if (successMessage && this.config) {
                this.config.notifySuccess(successMessage)
            }
            return result
        } catch (error) {
            if (this.config) {
                this.config.notifyError(errorMessage || (error as Error))
            }
            throw error
        }
    }
}
