/**
 * Train Tracker Utility Functions
 * Calculates train positions based on schedule data
 */

/**
 * Parse time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Get current time as minutes since midnight
 * @param {Date} date - Date object (defaults to now)
 * @returns {number} Minutes since midnight
 */
export function getCurrentTimeMinutes(date = new Date()) {
    return date.getHours() * 60 + date.getMinutes();
}

/**
 * Format minutes to HH:MM string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
export function formatMinutesToTime(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get the current day name in English lowercase
 * @param {Date} date - Date object
 * @returns {string} Day name (monday, tuesday, etc.)
 */
export function getCurrentDayName(date = new Date()) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

/**
 * Check if a train operates on the given day
 * @param {Object} train - Train schedule object
 * @param {string} dayName - Day name in lowercase
 * @returns {boolean}
 */
export function trainOperatesOnDay(train, dayName) {
    return train.operating_days.includes(dayName);
}

/**
 * Get train position based on current time
 * @param {Object} train - Train schedule object with stops
 * @param {number} currentMinutes - Current time in minutes
 * @param {Array} stations - Array of station objects
 * @returns {Object|null} Position info or null if train not active
 */
export function getTrainPosition(train, currentMinutes, stations) {
    const stops = train.stops;
    
    // Get first departure and last arrival times
    const firstDepartureTime = parseTimeToMinutes(stops[0].departure);
    const lastArrivalTime = parseTimeToMinutes(stops[stops.length - 1].arrival);
    
    // Check if train is active (between first departure and last arrival)
    if (currentMinutes < firstDepartureTime || currentMinutes > lastArrivalTime) {
        return null;
    }
    
    // Find current position
    let prevStop = null;
    let nextStop = null;
    let atStation = null;
    
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const arrivalTime = parseTimeToMinutes(stop.arrival);
        const departureTime = parseTimeToMinutes(stop.departure);
        
        // Check if train is at this station
        if (arrivalTime !== null && departureTime !== null) {
            if (currentMinutes >= arrivalTime && currentMinutes <= departureTime) {
                atStation = stop;
                break;
            }
        } else if (arrivalTime !== null && departureTime === null) {
            // Final station
            if (currentMinutes >= arrivalTime) {
                atStation = stop;
                break;
            }
        } else if (arrivalTime === null && departureTime !== null) {
            // First station
            if (currentMinutes <= departureTime) {
                atStation = stop;
                break;
            }
        }
        
        // Check if train is between this station and next
        if (i < stops.length - 1) {
            const currentDeparture = parseTimeToMinutes(stop.departure);
            const nextArrival = parseTimeToMinutes(stops[i + 1].arrival);
            
            if (currentDeparture !== null && nextArrival !== null) {
                if (currentMinutes > currentDeparture && currentMinutes < nextArrival) {
                    prevStop = stop;
                    nextStop = stops[i + 1];
                    break;
                }
            }
        }
    }
    
    // Find station details
    const getStationDetails = (stationCode) => {
        return stations.find(s => s.code === stationCode);
    };
    
    if (atStation) {
        const stationDetails = getStationDetails(atStation.station);
        return {
            status: 'at_station',
            station: stationDetails,
            stationCode: atStation.station,
            arrivalTime: atStation.arrival,
            departureTime: atStation.departure,
            progress: getStationProgress(atStation.station, stations, train)
        };
    }
    
    if (prevStop && nextStop) {
        const prevStationDetails = getStationDetails(prevStop.station);
        const nextStationDetails = getStationDetails(nextStop.station);
        const departureTime = parseTimeToMinutes(prevStop.departure);
        const arrivalTime = parseTimeToMinutes(nextStop.arrival);
        const journeyProgress = (currentMinutes - departureTime) / (arrivalTime - departureTime);
        
        return {
            status: 'in_transit',
            fromStation: prevStationDetails,
            toStation: nextStationDetails,
            fromStationCode: prevStop.station,
            toStationCode: nextStop.station,
            journeyProgress: Math.min(Math.max(journeyProgress, 0), 1),
            etaMinutes: arrivalTime - currentMinutes,
            progress: getTransitProgress(prevStop.station, nextStop.station, journeyProgress, stations, train)
        };
    }
    
    return null;
}

/**
 * Calculate progress percentage along the entire route when at a station
 */
function getStationProgress(stationCode, stations, train) {
    const stationIndex = stations.findIndex(s => s.code === stationCode);
    const totalStations = stations.length;
    
    // Check direction
    const isToSolo = train.departure_station === 'YK';
    
    if (isToSolo) {
        return (stationIndex / (totalStations - 1)) * 100;
    } else {
        return ((totalStations - 1 - stationIndex) / (totalStations - 1)) * 100;
    }
}

/**
 * Calculate progress percentage along the entire route when in transit
 */
function getTransitProgress(fromCode, toCode, journeyProgress, stations, train) {
    const fromIndex = stations.findIndex(s => s.code === fromCode);
    const toIndex = stations.findIndex(s => s.code === toCode);
    const totalStations = stations.length;
    
    const isToSolo = train.departure_station === 'YK';
    
    if (isToSolo) {
        const baseProgress = fromIndex / (totalStations - 1);
        const segmentProgress = journeyProgress / (totalStations - 1);
        return (baseProgress + segmentProgress) * 100;
    } else {
        const baseProgress = (totalStations - 1 - fromIndex) / (totalStations - 1);
        const segmentProgress = journeyProgress / (totalStations - 1);
        return (baseProgress + segmentProgress) * 100;
    }
}

/**
 * Get all active trains with their positions
 * @param {Object} schedules - Schedule data (yogyakarta_to_solo and solo_to_yogyakarta)
 * @param {Array} stations - Array of station objects
 * @param {Date} currentDate - Current date/time
 * @returns {Array} Array of active trains with position info
 */
export function getActiveTrains(schedules, stations, currentDate = new Date()) {
    const currentMinutes = getCurrentTimeMinutes(currentDate);
    const dayName = getCurrentDayName(currentDate);
    const activeTrains = [];
    
    // Process trains from Yogyakarta to Solo
    const toSoloTrains = schedules.yogyakarta_to_solo || [];
    for (const train of toSoloTrains) {
        if (!trainOperatesOnDay(train, dayName)) continue;
        
        const position = getTrainPosition(train, currentMinutes, stations);
        if (position) {
            activeTrains.push({
                ...train,
                direction: 'to_solo',
                directionLabel: 'Yogyakarta → Solo',
                position
            });
        }
    }
    
    // Process trains from Solo to Yogyakarta
    const toYogyaTrains = schedules.solo_to_yogyakarta || [];
    for (const train of toYogyaTrains) {
        if (!trainOperatesOnDay(train, dayName)) continue;
        
        const position = getTrainPosition(train, currentMinutes, stations);
        if (position) {
            activeTrains.push({
                ...train,
                direction: 'to_yogyakarta',
                directionLabel: 'Solo → Yogyakarta',
                position
            });
        }
    }
    
    return activeTrains;
}

/**
 * Get next departing trains from a station
 * @param {Object} schedules - Schedule data
 * @param {string} stationCode - Station code
 * @param {number} limit - Max number of trains to return
 * @param {Date} currentDate - Current date/time
 * @returns {Array} Array of upcoming trains
 */
export function getNextTrains(schedules, stationCode, limit = 5, currentDate = new Date()) {
    const currentMinutes = getCurrentTimeMinutes(currentDate);
    const dayName = getCurrentDayName(currentDate);
    const upcomingTrains = [];
    
    const allTrains = [
        ...(schedules.yogyakarta_to_solo || []).map(t => ({ ...t, direction: 'to_solo', directionLabel: 'ke Solo' })),
        ...(schedules.solo_to_yogyakarta || []).map(t => ({ ...t, direction: 'to_yogyakarta', directionLabel: 'ke Yogyakarta' }))
    ];
    
    for (const train of allTrains) {
        if (!trainOperatesOnDay(train, dayName)) continue;
        
        const stop = train.stops.find(s => s.station === stationCode);
        if (!stop) continue;
        
        const departureTime = parseTimeToMinutes(stop.departure);
        if (departureTime === null || departureTime <= currentMinutes) continue;
        
        upcomingTrains.push({
            trainNumber: train.train_number,
            direction: train.directionLabel,
            departureTime: stop.departure,
            minutesUntil: departureTime - currentMinutes
        });
    }
    
    // Sort by departure time and limit
    return upcomingTrains
        .sort((a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime))
        .slice(0, limit);
}
