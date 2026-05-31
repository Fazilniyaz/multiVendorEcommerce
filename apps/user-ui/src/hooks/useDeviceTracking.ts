"use client"

import { useEffect, useState } from 'react'
import {UAParser} from 'ua-parser-js'


const useDeviceTracker = () => {
    const [deviceInfo, setDeviceInfo] = useState<{os: string, browser: string} | null>(null)    

    useEffect(() => {
        const parser = new UAParser()
        const result = parser.getResult()

        //Set device info only when component mount
        setDeviceInfo({os: `${result.device.type || "Desktop"} ${result.os.version}`, browser: `${result.browser.name} ${result.browser.version}`})   
    }
    , [])

    console.log("Device Info:", deviceInfo) // Debug log to verify device info is being set

    return deviceInfo
}

export default useDeviceTracker