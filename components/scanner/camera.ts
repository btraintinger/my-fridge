import type { CameraDevice, Html5Qrcode } from 'html5-qrcode'
export const SCANNER_CONTAINER_ID = 'scanner-modal-container'

export function normalizeDigits(value: string): string {
    return value.replace(/\s+/g, '')
}

export function clearScannerContainer() {
    const container = document.getElementById(SCANNER_CONTAINER_ID)
    if (container) container.innerHTML = ''
}

export type ExtendedCapabilities = MediaTrackCapabilities & {
    torch?: boolean
    zoom?: { max: number; min?: number; step?: number }
    focusDistance?: { max: number; min: number; step?: number }
    frameRate?: { max: number }
}
export type CameraConfig =
    string | { facingMode: string } | { deviceId: string }

export function pickBackCameraIndex(cameras: CameraDevice[]): number {
    // Prefer the standard back camera; avoid ultra-wide / telephoto which
    // cannot autofocus close enough for barcode scanning on iPhones.
    const preferred = cameras.findIndex(
        (d) =>
            /back|rück|rear/i.test(d.label) &&
            !/ultra|tele|telephoto|wide angle/i.test(d.label)
    )
    if (preferred !== -1) return preferred
    const anyBack = cameras.findIndex((d) => /back|rück|rear/i.test(d.label))
    return anyBack !== -1 ? anyBack : 0
}

export async function applyCameraConstraints(
    scanner: Html5Qrcode,
    caps: ExtendedCapabilities
) {
    const advanced: MediaTrackConstraintSet[] = []
    if (caps.zoom) {
        advanced.push({
            zoom: Math.min(2.0, caps.zoom.max),
        } as MediaTrackConstraintSet)
    }
    if (caps.focusDistance) {
        advanced.push({
            focusDistance: caps.focusDistance.min,
        } as MediaTrackConstraintSet)
    }
    await scanner.applyVideoConstraints({
        width: { ideal: 1000 },
        frameRate: { ideal: caps.frameRate?.max ?? 30 },
        advanced,
    })
}
