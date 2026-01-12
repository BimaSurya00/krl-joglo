<script>
    /**
     * StationTimeline Component
     * Displays the railway line with all stations and active train positions
     */
    
    let { stations = [], activeTrains = [] } = $props();
    
    // Get train indicator position for a specific train
    function getTrainStyle(train) {
        const progress = train.position?.progress || 0;
        return `left: ${progress}%`;
    }
    
    // Check if a station has a train at it
    function getTrainAtStation(stationCode) {
        return activeTrains.find(t => 
            t.position?.status === 'at_station' && 
            t.position?.stationCode === stationCode
        );
    }
</script>

<div class="timeline-container">
    <!-- Railway Track -->
    <div class="track">
        <div class="track-line"></div>
        
        <!-- Stations -->
        {#each stations as station, index}
            {@const trainAtStation = getTrainAtStation(station.code)}
            <div 
                class="station" 
                style="left: {(index / (stations.length - 1)) * 100}%"
            >
                <div class="station-marker" class:has-train={trainAtStation}>
                    {#if trainAtStation}
                        <div class="train-at-station" title={trainAtStation.train_number}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                    {/if}
                </div>
                <div class="station-info">
                    <span class="station-code">{station.code}</span>
                    <span class="station-name">{station.name}</span>
                </div>
            </div>
        {/each}
        
        <!-- Moving Trains (in transit) -->
        {#each activeTrains.filter(t => t.position?.status === 'in_transit') as train}
            <div 
                class="train-indicator"
                class:to-solo={train.direction === 'to_solo'}
                class:to-yogya={train.direction === 'to_yogyakarta'}
                style={getTrainStyle(train)}
                title="{train.train_number} - {train.directionLabel}"
            >
                <div class="train-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                </div>
                <span class="train-number">{train.train_code}</span>
            </div>
        {/each}
    </div>
    
    <!-- Direction Labels -->
    <div class="direction-labels">
        <span class="direction-start">Yogyakarta</span>
        <span class="direction-end">Palur (Solo)</span>
    </div>
</div>

<style>
    .timeline-container {
        width: 100%;
        padding: var(--spacing-xl) 0;
    }
    
    .track {
        position: relative;
        height: 120px;
        margin: 0 40px;
    }
    
    .track-line {
        position: absolute;
        top: 40px;
        left: 0;
        right: 0;
        height: 4px;
        background-color: var(--color-primary);
        border-radius: 2px;
    }
    
    .station {
        position: absolute;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .station-marker {
        width: 16px;
        height: 16px;
        background-color: var(--color-white);
        border: 3px solid var(--color-primary);
        border-radius: 50%;
        margin-top: 32px;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
    }
    
    .station-marker.has-train {
        width: 24px;
        height: 24px;
        margin-top: 28px;
        background-color: var(--color-primary);
        border-color: var(--color-primary-dark);
    }
    
    .train-at-station {
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--color-primary);
        animation: bounce 1s infinite;
    }
    
    .train-at-station svg {
        width: 24px;
        height: 24px;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-4px); }
    }
    
    .station-info {
        margin-top: var(--spacing-sm);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .station-code {
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--color-primary);
        background-color: var(--color-primary-light);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
    }
    
    .station-name {
        font-size: 0.625rem;
        color: var(--color-gray-600);
        max-width: 60px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .train-indicator {
        position: absolute;
        top: 8px;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 10;
        animation: pulse-train 2s infinite;
    }
    
    @keyframes pulse-train {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    
    .train-indicator.to-solo {
        top: 8px;
    }
    
    .train-indicator.to-yogya {
        top: 52px;
    }
    
    .train-icon {
        width: 28px;
        height: 28px;
        background-color: var(--color-primary);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
    }
    
    .train-indicator.to-yogya .train-icon {
        background-color: var(--color-success);
    }
    
    .train-icon svg {
        width: 18px;
        height: 18px;
        color: white;
    }
    
    .train-number {
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--color-gray-700);
        margin-top: 2px;
    }
    
    .direction-labels {
        display: flex;
        justify-content: space-between;
        margin: var(--spacing-md) 40px 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--color-gray-500);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .track {
            height: 140px;
            margin: 0 20px;
        }
        
        .station-name {
            display: none;
        }
        
        .direction-labels {
            margin: var(--spacing-md) 20px 0;
        }
    }
</style>
