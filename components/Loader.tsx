import React from 'react'

export default function Loader({className}: {className?: string}) {
  return (
    <div className={`custom-loader mx-auto ${className}`}></div>
  )
}
