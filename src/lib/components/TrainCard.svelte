<script>
    /**
     * TrainCard Component
     * Displays information about an active train
     */
    
    let { train } = $props();
    
    // Status text in Indonesian
    function getStatusText() {
        if (train.position?.status === 'at_station') {
            return 'Berhenti di Stasiun';
        }
        return 'Dalam Perjalanan';
    }
    
    // Get location description
    function getLocationText() {
        const pos = train.position;
        if (pos?.status === 'at_station') {
            return pos.station?.name || pos.stationCode;
        }
        if (pos?.status === 'in_transit') {
            return `${pos.fromStation?.name || pos.fromStationCode} → ${pos.toStation?.name || pos.toStationCode}`;
        }
        return '-';
    }
    
    // Get ETA text
    function getEtaText() {
        const pos = train.position;
        if (pos?.status === 'in_transit' && pos.etaMinutes) {
            return `${pos.etaMinutes} menit lagi`;
        }
        if (pos?.status === 'at_station' && pos.departureTime) {
            return `Berangkat ${pos.departureTime}`;
        }
        return null;
    }
</script>

<div class="train-card" class:to-solo={train.direction === 'to_solo'} class:to-yogya={train.direction === 'to_yogyakarta'}>
    <div class="card-header">
        <div class="train-number-badge">
            <svg class="train-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            <span>{train.train_number}</span>
        </div>
        <span class="direction-badge">{train.directionLabel}</span>
    </div>
    
    <div class="card-body">
        <div class="status-row">
            <span class="status-indicator" class:at-station={train.position?.status === 'at_station'}></span>
            <span class="status-text">{getStatusText()}</span>
        </div>
        
        <div class="location-row">
            <svg class="location-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span class="location-text">{getLocationText()}</span>
        </div>
        
        {#if getEtaText()}
            <div class="eta-row">
                <svg class="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span class="eta-text">{getEtaText()}</span>
            </div>
        {/if}
    </div>
    
    <!-- Progress bar -->
    <div class="progress-bar">
        <div class="progress-fill" style="width: {train.position?.progress || 0}%"></div>
    </div>
</div>

<style>
    .train-card {
        background-color: var(--color-white);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-gray-200);
        overflow: hidden;
        transition: box-shadow 0.2s ease;
    }
    
    .train-card:hover {
        box-shadow: var(--shadow-md);
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background-color: var(--color-gray-50);
        border-bottom: 1px solid var(--color-gray-100);
    }
    
    .train-number-badge {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-weight: 600;
        color: var(--color-gray-800);
    }
    
    .train-icon {
        width: 20px;
        height: 20px;
        color: var(--color-primary);
    }
    
    .to-yogya .train-icon {
        color: var(--color-success);
    }
    
    .direction-badge {
        font-size: 0.75rem;
        font-weight: 500;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        background-color: var(--color-primary-light);
        color: var(--color-primary);
    }
    
    .to-yogya .direction-badge {
        background-color: #D1FAE5;
        color: #065F46;
    }
    
    .card-body {
        padding: var(--spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .status-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-warning);
        animation: pulse 2s infinite;
    }
    
    .status-indicator.at-station {
        background-color: var(--color-success);
        animation: none;
    }
    
    .status-text {
        font-size: 0.875rem;
        color: var(--color-gray-600);
    }
    
    .location-row,
    .eta-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .location-icon,
    .clock-icon {
        width: 16px;
        height: 16px;
        color: var(--color-gray-400);
        flex-shrink: 0;
    }
    
    .location-text {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-gray-800);
    }
    
    .eta-text {
        font-size: 0.75rem;
        color: var(--color-gray-500);
    }
    
    .progress-bar {
        height: 4px;
        background-color: var(--color-gray-100);
    }
    
    .progress-fill {
        height: 100%;
        background-color: var(--color-primary);
        transition: width 0.5s ease;
    }
    
    .to-yogya .progress-fill {
        background-color: var(--color-success);
    }
</style>
