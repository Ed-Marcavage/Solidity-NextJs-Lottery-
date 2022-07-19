import { useWeb3Contract } from "react-moralis" // Calls Function in contract
import abi from "../constants/abi.json"
import contractAddresses from "../constants/contractAddresses.json"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // [func output, func] = useState(resetValue)??
    const [entranceFee, setEntranceFee] = useState("0") // 0 is starting value
    const [numPlayers, setNumPlayers] = useState("0") // 0 is starting value
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()
    // Create Functions section: abi + address + funcName + params + msgValue

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setNumPlayers(numPlayersFromCall)
        setEntranceFee(entranceFeeFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNotification(tx)
        updateUI()
    }

    const handleNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR", // if exluded, will get TypeError: Cannot read properties of undefined (reading 'push')error
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log("error"),
                            })
                        }}
                        disable={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div className="py-4 px-4 font-bold text-3xl">
                        Enterance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                    </div>
                    <div className="py-4 px-4 font-bold text-3xl">
                        ETH Number of Players: {numPlayers}
                    </div>
                    <div className="py-4 px-4 font-bold text-2xl">
                        Recent Winner: {recentWinner}
                    </div>
                </div>
            ) : (
                <div className="py-4 px-4 font-bold text-2xl">Please Connect With MetaMask</div>
            )}
        </div>
    )
}
