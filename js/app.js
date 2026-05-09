// Execute after page loads
document.addEventListener('DOMContentLoaded', () => {
  // Get geolocation data
  fetchGeoData();
});

/**
 * Fetch geolocation data from edge function
 */
async function fetchGeoData() {
  try {
    // Show loading state
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('geo-data').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    // Call edge function
    const response = await fetch('/GeoLocation');

    // Check response status
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Display data
    displayGeoData(data);

    // Hide loading state
    document.getElementById('loading').style.display = 'none';
    document.getElementById('geo-data').style.display = 'block';



  } catch (error) {
    console.error('Error fetching geolocation data:', error);

    // Show error message
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').style.display = 'flex';
  }
}

/**
 * Display geolocation data on the page
 * @param {Object} data - Geolocation data retrieved from API
 */
function displayGeoData(data) {
  const geo = data.geo;

  // Update country information
  document.getElementById('country').textContent = geo.countryName || 'Unknown';
  document.getElementById('country-code').textContent =
    `${geo.countryCodeAlpha2 || ''} / ${geo.countryCodeAlpha3 || ''} / ${geo.countryCodeNumeric || ''}`;

  // Update region information
  document.getElementById('region').textContent = geo.regionName || 'Unknown';
  document.getElementById('region-code').textContent = geo.regionCode || '';

  // Update city information
  document.getElementById('city').textContent = geo.cityName || 'Unknown';

  // Update coordinates
  document.getElementById('coordinates').textContent =
    `${geo.latitude ?? 0}, ${geo.longitude ?? 0}`;

  // Update ISP information
  document.getElementById('isp').textContent = geo.cisp || 'Unknown';

  // Update ASN
  document.getElementById('asn').textContent = geo.asn ?? 'Unknown';

  // Update Client IP
  document.getElementById('client-ip').textContent = data.clientIp || 'Unknown';

  // Update JSON display
  document.getElementById('json-display').textContent = JSON.stringify(data, null, 2);
}


