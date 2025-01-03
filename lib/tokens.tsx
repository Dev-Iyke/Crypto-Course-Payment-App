import { TokenUSDT, TokenDAI, TokenUSDC, TokenBUSD, TokenTUSD } from "@web3icons/react";
interface Token {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const tokens: Token[] = [
  {
    value: "usdt",
    label: "USDT",
    icon: <TokenUSDT variant="branded" />,
  },
  {
    value: "dai",
    label: "DAI",
    icon: <TokenDAI variant="branded" />,
  },
  {
    value: "usdc",
    label: "USDC",
    icon: <TokenUSDC variant="branded" />,
  },
  {
    value: "busd",
    label: "BUSD",
    icon: <TokenBUSD variant="branded" />,
  },
  {
    value: "tusd",
    label: "TUSD",
    icon: <TokenTUSD variant="branded" />,
  },
]

// import React, { useEffect, useState } from 'react'

// const Tokens = () => {
//   const [availableTokens, setAvailableTokens] = useState<string[]>()

//   useEffect(() => {
//     const getAllCoins = async () => {
//       try {
//         const response = await fetch(`/api/initialize-payment`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         })
//         const data = await response.json()
//         if(response.ok){
//           console.log(data)
//           // setCoins(data.coins)
//           setAvailableTokens(data.selectedCurrencies)
//         }
//         throw new Error(data.error)
//       } catch (error) {
//         console.log(error)
//       }
//     }
    
//     getAllCoins()
//   }, [])

//   const useableTokens = availableTokens?.map((token) => {
//     console.log(token.slice(0, 4))
//     const newPattern = token.slice(0, 4)
//     return newPattern
//   })
//   console.log(useableTokens)
//   console.log(availableTokens)
//   return (
//     <div>{availableTokens}</div>
//   )
// }

// export default Tokens