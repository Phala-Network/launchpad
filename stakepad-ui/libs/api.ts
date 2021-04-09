interface GlobalTelemetry {
    annualizedReturnRate: number
    currentRound: number
    currentRoundClock: number
    lastRoundReturn: number

    averageStake: number
    totalStake: number
    totalStakeRate: number

    allWorkers: number
    onlineWorkers: number
}

export async function getGlobalTelemetry(): Promise<GlobalTelemetry> {
    return {
        annualizedReturnRate: 0.153,
        currentRound: 12434,
        currentRoundClock: 45,
        lastRoundReturn: 123123,

        averageStake: 12434,
        totalStake: 12434,
        totalStakeRate: 0.63,

        allWorkers: 534568,
        onlineWorkers: 12434
    }
}
