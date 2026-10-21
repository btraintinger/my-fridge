'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { useLoginForm } from '@/components/auth/useLoginForm'

export function LoginForm() {
    const t = useTranslations()
    const searchParams = useSearchParams()
    const showVerificationSent = searchParams.get('verification') === 'sent'
    const {
        register,
        errors,
        isSubmitting,
        error,
        message,
        verificationLoading,
        resetLoading,
        attemptedUnverifiedLogin,
        attemptedWrongCredentials,
        onSubmit,
        handleResendVerification,
        handleForgotPassword,
    } = useLoginForm()

    return (
        <form noValidate onSubmit={onSubmit} className="w-full space-y-6">
            {showVerificationSent && (
                <Alert className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50">
                    <AlertDescription className="text-inherit">
                        {t('auth.login.verificationSentBanner')}
                    </AlertDescription>
                </Alert>
            )}

            {message && (
                <Alert className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in duration-200">
                    <AlertDescription className="text-inherit">
                        {message}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert
                    variant="destructive"
                    className="p-4 bg-error/10 text-error rounded-2xl text-sm font-semibold border border-error/20 animate-in shake-in duration-300"
                >
                    <AlertDescription className="text-inherit">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <FormField
                label={t('auth.fields.email')}
                required
                error={errors.email?.message}
            >
                {(fieldProps) => (
                    <Input
                        {...fieldProps}
                        type="email"
                        placeholder={t('auth.fields.emailPlaceholder')}
                        aria-invalid={!!errors.email}
                        {...register('email')}
                    />
                )}
            </FormField>

            <FormField
                label={t('auth.fields.password')}
                required
                error={errors.password?.message}
            >
                {(fieldProps) => (
                    <>
                        <Input
                            {...fieldProps}
                            type="password"
                            placeholder={t('auth.fields.passwordPlaceholder')}
                            aria-invalid={!!errors.password}
                            {...register('password')}
                        />
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {(attemptedUnverifiedLogin ||
                                showVerificationSent) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl"
                                    onClick={handleResendVerification}
                                    disabled={
                                        isSubmitting ||
                                        verificationLoading ||
                                        resetLoading
                                    }
                                >
                                    {verificationLoading
                                        ? t('auth.login.sendingVerification')
                                        : t('auth.login.resendVerification')}
                                </Button>
                            )}

                            {attemptedWrongCredentials && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl"
                                    onClick={handleForgotPassword}
                                    disabled={
                                        isSubmitting ||
                                        verificationLoading ||
                                        resetLoading
                                    }
                                >
                                    {resetLoading
                                        ? t('auth.login.sendingResetEmail')
                                        : t('auth.login.forgotPassword')}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </FormField>

            <Button
                type="submit"
                className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                disabled={isSubmitting || verificationLoading || resetLoading}
            >
                {isSubmitting
                    ? t('auth.login.submitting')
                    : t('auth.login.submit')}
            </Button>
        </form>
    )
}
