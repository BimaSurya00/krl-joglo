<script>
    import { onMount } from "svelte";
    import krlData from "$lib/data/krl_yogyakarta_solo.json";
    import {
        getActiveTrains,
        getCurrentTimeMinutes,
        formatMinutesToTime,
        getCurrentDayName,
    } from "$lib/utils/trainTracker.js";
    import StationTimeline from "$lib/components/StationTimeline.svelte";
    import TrainCard from "$lib/components/TrainCard.svelte";

    // Reactive state
    let currentTime = $state(new Date());
    let activeTrains = $state([]);

    // Derived values
    let timeString = $derived(
        currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
    );

    let dateString = $derived(
        currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
    );

    // Update trains position
    function updateTrains() {
        currentTime = new Date();
        activeTrains = getActiveTrains(
            krlData.schedules,
            krlData.stations,
            currentTime,
        );
    }

    // Separate trains by direction
    let trainsToSolo = $derived(
        activeTrains.filter((t) => t.direction === "to_solo"),
    );
    let trainsToYogya = $derived(
        activeTrains.filter((t) => t.direction === "to_yogyakarta"),
    );

    onMount(() => {
        updateTrains();

        // Update every 10 seconds for smooth tracking feel
        const interval = setInterval(updateTrains, 10000);

        // Update clock every second
        const clockInterval = setInterval(() => {
            currentTime = new Date();
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    });
</script>

<div class="app">
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <svg
                        class="logo-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                        />
                    </svg>
                    <div class="logo-text">
                        <span class="logo-title">KRL Jogja - Solo</span>
                        <span class="logo-subtitle">Tracking Kereta</span>
                    </div>
                </div>
                <div class="header-info">
                    <span class="live-badge">
                        <span class="live-dot"></span>
                        LIVE
                    </span>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="clock-display">
                    <span class="clock-time">{timeString}</span>
                    <span class="clock-date">{dateString}</span>
                </div>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-value">{activeTrains.length}</span>
                        <span class="stat-label">Kereta Aktif</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-value"
                            >{krlData.metadata.total_stations}</span
                        >
                        <span class="stat-label">Stasiun</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-value"
                            >Rp {krlData.metadata.fare.toLocaleString(
                                "id-ID",
                            )}</span
                        >
                        <span class="stat-label">Tarif</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Tracking Section -->
    <main class="main-content">
        <div class="container">
            <!-- Station Timeline -->
            <section class="timeline-section card">
                <h2 class="section-title">Peta Jalur</h2>
                <p class="section-subtitle">
                    Posisi kereta aktif saat ini di jalur Yogyakarta - Solo
                </p>
                <StationTimeline stations={krlData.stations} {activeTrains} />
                <div class="legend">
                    <div class="legend-item">
                        <span class="legend-dot to-solo"></span>
                        <span>Arah Solo</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot to-yogya"></span>
                        <span>Arah Yogyakarta</span>
                    </div>
                </div>
            </section>

            <!-- Active Trains -->
            <section class="trains-section">
                <h2 class="section-title">Kereta Aktif</h2>

                {#if activeTrains.length === 0}
                    <div class="empty-state card">
                        <svg
                            class="empty-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            />
                        </svg>
                        <p class="empty-text">
                            Tidak ada kereta aktif saat ini
                        </p>
                        <p class="empty-subtext">
                            Jadwal KRL beroperasi mulai pukul 05:05 - 21:35
                        </p>
                    </div>
                {:else}
                    <div class="trains-grid">
                        <!-- Trains to Solo -->
                        {#if trainsToSolo.length > 0}
                            <div class="train-column">
                                <h3 class="column-title">
                                    <span class="direction-indicator to-solo"
                                    ></span>
                                    Arah Solo ({trainsToSolo.length})
                                </h3>
                                <div class="train-list">
                                    {#each trainsToSolo as train (train.train_number)}
                                        <TrainCard {train} />
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        <!-- Trains to Yogyakarta -->
                        {#if trainsToYogya.length > 0}
                            <div class="train-column">
                                <h3 class="column-title">
                                    <span class="direction-indicator to-yogya"
                                    ></span>
                                    Arah Yogyakarta ({trainsToYogya.length})
                                </h3>
                                <div class="train-list">
                                    {#each trainsToYogya as train (train.train_number)}
                                        <TrainCard {train} />
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p class="footer-text">
                {krlData.metadata.route_name} • {krlData.metadata.operator}
            </p>
            <p class="footer-note">
                Data jadwal terakhir diperbarui: {krlData.metadata.last_updated}
            </p>
        </div>
    </footer>
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* Header */
    .header {
        background-color: var(--color-primary);
        color: var(--color-white);
        padding: var(--spacing-md) 0;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .logo-icon {
        width: 36px;
        height: 36px;
    }

    .logo-text {
        display: flex;
        flex-direction: column;
    }

    .logo-title {
        font-size: 1.125rem;
        font-weight: 700;
        line-height: 1.2;
    }

    .logo-subtitle {
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .header-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .live-badge {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        background-color: rgba(255, 255, 255, 0.2);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
    }

    .live-dot {
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    /* Hero */
    .hero {
        background-color: var(--color-primary-dark);
        color: var(--color-white);
        padding: var(--spacing-xl) 0;
    }

    .hero-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-lg);
    }

    .clock-display {
        display: flex;
        flex-direction: column;
    }

    .clock-time {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    .clock-date {
        font-size: 0.875rem;
        opacity: 0.8;
        margin-top: var(--spacing-xs);
    }

    .hero-stats {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
    }

    .stat-label {
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .stat-divider {
        width: 1px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.2);
    }

    /* Main Content */
    .main-content {
        flex: 1;
        padding: var(--spacing-xl) 0;
    }

    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-xs);
    }

    .section-subtitle {
        font-size: 0.875rem;
        color: var(--color-gray-500);
        margin-bottom: var(--spacing-lg);
    }

    .timeline-section {
        margin-bottom: var(--spacing-xl);
        overflow-x: auto;
    }

    .legend {
        display: flex;
        justify-content: center;
        gap: var(--spacing-lg);
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--color-gray-100);
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 0.75rem;
        color: var(--color-gray-600);
    }

    .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-sm);
    }

    .legend-dot.to-solo {
        background-color: var(--color-primary);
    }

    .legend-dot.to-yogya {
        background-color: var(--color-success);
    }

    .trains-section {
        margin-top: var(--spacing-xl);
    }

    .trains-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
    }

    .train-column {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .column-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-gray-700);
    }

    .direction-indicator {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-sm);
    }

    .direction-indicator.to-solo {
        background-color: var(--color-primary);
    }

    .direction-indicator.to-yogya {
        background-color: var(--color-success);
    }

    .train-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: var(--spacing-2xl);
    }

    .empty-icon {
        width: 48px;
        height: 48px;
        color: var(--color-gray-300);
        margin-bottom: var(--spacing-md);
    }

    .empty-text {
        font-size: 1rem;
        color: var(--color-gray-600);
        margin-bottom: var(--spacing-xs);
    }

    .empty-subtext {
        font-size: 0.875rem;
        color: var(--color-gray-400);
    }

    /* Footer */
    .footer {
        background-color: var(--color-gray-800);
        color: var(--color-gray-400);
        padding: var(--spacing-lg) 0;
        text-align: center;
    }

    .footer-text {
        font-size: 0.875rem;
        margin-bottom: var(--spacing-xs);
    }

    .footer-note {
        font-size: 0.75rem;
        opacity: 0.7;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .hero-content {
            flex-direction: column;
            align-items: flex-start;
        }

        .clock-time {
            font-size: 2rem;
        }

        .hero-stats {
            width: 100%;
            justify-content: space-between;
        }

        .stat-divider {
            height: 30px;
        }

        .trains-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
