import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    /*Whenever enableWeb3() is run, isWeb3Enabled = True */
    useEffect(() => {
        if (isWeb3Enabled) return /*If isWeb3Enabled = True, wallet already connected */
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                /* ^^ If connected key exist */
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3() /*If Set is Web3enabled to false */
                console.log("Null account found")
            }
        })
    }, [])

    return (
        <div>
            {account /* If there is a connected account.... */ ? (
                <div>
                    connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                /* If there is NOT a connected account.... */
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
