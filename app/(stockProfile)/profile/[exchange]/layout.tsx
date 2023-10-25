import GeneralHeader from "@/components/global/GeneralHeader"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                < GeneralHeader/>
                {children}</body>
        </html>
    )
}
