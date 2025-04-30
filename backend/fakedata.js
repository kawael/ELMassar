import fs from 'fs';

const addNewLocation = () => {
    const filePath = './historical-locations.json';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    data.targets.forEach((target) => {
        const locations = target.locations;
        const lastLocation = locations[locations.length - 1];
        const secondLastLocation = locations[locations.length - 2];

        const deltaLat = lastLocation.lat - secondLastLocation.lat;
        const deltaLng = lastLocation.lng - secondLastLocation.lng;

        const newLat = parseFloat((lastLocation.lat + deltaLat).toFixed(6));
        const newLng = parseFloat((lastLocation.lng + deltaLng).toFixed(6));
        const newTimestamp = lastLocation.timestamp + 10000; // Add 10 seconds

        target.locations.push({
            timestamp: newTimestamp,
            lat: newLat,
            lng: newLng,
        });
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('New locations added to historical-locations.json');
};

setInterval(addNewLocation, 10000);