const enableQiblaButton = document.getElementById("enable-qibla");
const qiblaStatus = document.getElementById("qibla-status");
const qiblaDirectionArrow = document.getElementById("qibla-direction-arrow");
const qiblaPhoneArrow = document.getElementById("qibla-phone-arrow");
const qiblaAngle = document.getElementById("qibla-angle");
const deviceHeading = document.getElementById("device-heading");
const qiblaBearing = document.getElementById("qibla-bearing");
const qiblaAlignment = document.getElementById("qibla-alignment");

let currentBearing = null;

function degreesToCardinal(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function calculateQiblaBearing(latitude, longitude) {
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLon = 39.8262 * (Math.PI / 180);
  const userLat = latitude * (Math.PI / 180);
  const userLon = longitude * (Math.PI / 180);
  const deltaLon = kaabaLon - userLon;

  const y = Math.sin(deltaLon);
  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(deltaLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function updateAlignment(heading) {
  if (currentBearing === null) {
    return;
  }

  const diff = ((currentBearing - heading + 540) % 360) - 180;
  const absoluteDiff = Math.abs(diff);

  qiblaPhoneArrow.style.transform = `rotate(${heading}deg)`;
  qiblaDirectionArrow.style.transform = `rotate(${currentBearing}deg)`;
  deviceHeading.textContent = `${Math.round(heading)}° ${degreesToCardinal(heading)}`;

  if (absoluteDiff <= 10) {
    qiblaAlignment.textContent = "Aligned";
    qiblaAngle.textContent = "You are facing the Qibla";
    return;
  }

  qiblaAlignment.textContent = absoluteDiff <= 25 ? "Close" : "Turn";
  qiblaAngle.textContent =
    diff > 0
      ? `Turn ${Math.round(absoluteDiff)}° clockwise`
      : `Turn ${Math.round(absoluteDiff)}° anti-clockwise`;
}

function startCompass() {
  const handleOrientation = (event) => {
    const alpha = event.webkitCompassHeading ?? (360 - event.alpha);

    if (typeof alpha !== "number" || Number.isNaN(alpha)) {
      return;
    }

    updateAlignment(alpha % 360);
  };

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission !== "granted") {
          qiblaStatus.textContent = "Motion permission was not granted.";
          return;
        }

        window.addEventListener("deviceorientation", handleOrientation, true);
      })
      .catch(() => {
        qiblaStatus.textContent = "Unable to access motion sensors.";
      });

    return;
  }

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function startQibla() {
  if (!navigator.geolocation) {
    qiblaStatus.textContent = "Geolocation is not supported on this device.";
    return;
  }

  qiblaStatus.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentBearing = calculateQiblaBearing(
        position.coords.latitude,
        position.coords.longitude,
      );

      qiblaBearing.textContent = `${Math.round(currentBearing)}° ${degreesToCardinal(currentBearing)}`;
      qiblaStatus.textContent = "Move your phone gently to align with the Qibla.";
      startCompass();
    },
    () => {
      qiblaStatus.textContent = "Location permission is needed for Qibla direction.";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
}

if (enableQiblaButton) {
  enableQiblaButton.addEventListener("click", startQibla);
}
