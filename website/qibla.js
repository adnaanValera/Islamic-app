const enableQiblaButton = document.getElementById("enable-qibla");
const qiblaStatus = document.getElementById("qibla-status");
const qiblaDirectionArrow = document.getElementById("qibla-direction-arrow");
const qiblaPhoneArrow = document.getElementById("qibla-phone-arrow");
const qiblaAngle = document.getElementById("qibla-angle");
const deviceHeading = document.getElementById("device-heading");
const qiblaBearing = document.getElementById("qibla-bearing");
const qiblaAlignment = document.getElementById("qibla-alignment");
const qiblaAccuracy = document.getElementById("qibla-accuracy");

let currentBearing = null;
const degreeSymbol = "\u00B0";

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

function setAccuracyLabel(label) {
  if (qiblaAccuracy) {
    qiblaAccuracy.textContent = label;
  }
}

function updateAlignment(heading) {
  if (currentBearing === null) {
    return;
  }

  const diff = ((currentBearing - heading + 540) % 360) - 180;
  const absoluteDiff = Math.abs(diff);

  qiblaPhoneArrow.style.transform = `rotate(${heading}deg)`;
  qiblaDirectionArrow.style.transform = `rotate(${currentBearing}deg)`;
  deviceHeading.textContent = `${Math.round(heading)}${degreeSymbol} ${degreesToCardinal(heading)}`;

  if (absoluteDiff <= 8) {
    qiblaAlignment.textContent = "Aligned";
    qiblaAngle.textContent = "You are facing the Qibla";
    setAccuracyLabel("Very accurate");
    return;
  }

  if (absoluteDiff <= 20) {
    qiblaAlignment.textContent = "Close";
    setAccuracyLabel("Good");
  } else {
    qiblaAlignment.textContent = "Turn";
    setAccuracyLabel("Re-align");
  }

  qiblaAngle.textContent =
    diff > 0
      ? `Turn ${Math.round(absoluteDiff)}${degreeSymbol} clockwise`
      : `Turn ${Math.round(absoluteDiff)}${degreeSymbol} anti-clockwise`;
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
          qiblaAlignment.textContent = "Limited";
          setAccuracyLabel("Limited");
          return;
        }

        setAccuracyLabel("Live compass");
        window.addEventListener("deviceorientation", handleOrientation, true);
      })
      .catch(() => {
        qiblaStatus.textContent = "Unable to access motion sensors.";
        qiblaAlignment.textContent = "Unavailable";
        setAccuracyLabel("Unavailable");
      });

    return;
  }

  setAccuracyLabel("Live compass");
  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function startQibla() {
  if (!navigator.geolocation) {
    qiblaStatus.textContent = "Geolocation is not supported on this device.";
    qiblaAlignment.textContent = "Unavailable";
    setAccuracyLabel("Unavailable");
    return;
  }

  qiblaStatus.textContent = "Getting your location...";
  qiblaAlignment.textContent = "Checking";
  setAccuracyLabel("Checking");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentBearing = calculateQiblaBearing(
        position.coords.latitude,
        position.coords.longitude,
      );

      qiblaBearing.textContent = `${Math.round(currentBearing)}${degreeSymbol} ${degreesToCardinal(currentBearing)}`;
      qiblaStatus.textContent =
        "Move your phone gently and keep it away from metal objects for the best result.";
      setAccuracyLabel("Compass starting");
      startCompass();
    },
    () => {
      qiblaStatus.textContent = "Location permission is needed for Qibla direction.";
      qiblaAlignment.textContent = "Unavailable";
      setAccuracyLabel("Unavailable");
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
