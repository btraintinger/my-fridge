const devices = [
    { width: 1024, height: 1366, ratio: 2 },
    { width: 834, height: 1194, ratio: 2 },
    { width: 768, height: 1024, ratio: 2 },
    { width: 820, height: 1180, ratio: 2 },
    { width: 834, height: 1112, ratio: 2 },
    { width: 810, height: 1080, ratio: 2 },
    { width: 744, height: 1133, ratio: 2 },
    { width: 440, height: 956, ratio: 3 },
    { width: 402, height: 874, ratio: 3 },
    { width: 420, height: 912, ratio: 3 },
    { width: 430, height: 932, ratio: 3 },
    { width: 393, height: 852, ratio: 3 },
    { width: 390, height: 844, ratio: 3 },
    { width: 428, height: 926, ratio: 3 },
    { width: 375, height: 812, ratio: 3 },
    { width: 414, height: 896, ratio: 3 },
    { width: 414, height: 896, ratio: 2 },
    { width: 414, height: 736, ratio: 3 },
    { width: 375, height: 667, ratio: 2 },
    { width: 320, height: 568, ratio: 2 },
]

export function AppleSplashLinks() {
    return devices.flatMap(({ width, height, ratio }) =>
        (['portrait', 'landscape'] as const).map((orientation) => {
            const pixelWidth =
                (orientation === 'portrait' ? width : height) * ratio
            const pixelHeight =
                (orientation === 'portrait' ? height : width) * ratio
            return (
                <link
                    key={`${width}-${height}-${ratio}-${orientation}`}
                    rel="apple-touch-startup-image"
                    href={`/icons/apple-splash-${pixelWidth}-${pixelHeight}.jpg`}
                    media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})`}
                />
            )
        })
    )
}
