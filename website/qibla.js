const enableQiblaButton = document.getElementById("enable-qibla");
const qiblaStatus = document.getElementById("qibla-status");
const qiblaDirectionArrow = document.getElementById("qibla-direction-arrow");
const qiblaPhoneArrow = document.getElementById("qibla-phone-arrow");
const qiblaAngle = document.getElementById("qibla-angle");
const deviceHeading = document.getElementById("device-heading");
const qiblaBearing = document.getElementById("qibla-bearing");
const qiblaAlignment = document.getElementById("qibla-alignment");
const qiblaAccuracy = document.getElementById("qibla-accuracy");
const qiblaMode = document.getElementById("qibla-mode");
const qiblaFallback = document.getElementById("qibla-fallback");
const qiblaGuidanceTitle = document.getElementById("qibla-guidance-title");
const qiblaGuidanceDetail = document.getElementById("qibla-guidance-detail");
const qiblaGuidanceText = document.getElementById("qibla-guidance-text");

let currentBearing = null;
let currentHeading = null;
let compassReadingReceived = false;
let compassTimeoutId = null;

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

function setCompassMode(label) {
  if (qiblaMode) {
    qiblaMode.textContent = label;
  }
}

function setFallbackLabel(label) {
  if (qiblaFallback) {
    qiblaFallback.textContent = label;
  }
}

function setGuidance(title, detail) {
  if (qiblaGuidanceTitle) {
    qiblaGuidanceTitle.textContent = title;
  }

  if (qiblaGuidanceDetail) {
    qiblaGuidanceDetail.textContent = detail;
  }

  if (qiblaGuidanceText) {
    qiblaGuidanceText.textContent = detail;
  }
}

function useBearingFallback(reason) {
  qiblaPhoneArrow.style.opacity = "0.14";
  qiblaPhoneArrow.style.transform = "rotate(0deg)";
  qiblaDirectionArrow.style.transform = `rotate(${currentBearing ?? 0}deg)`;
  deviceHeading.textContent = `Use north`;
  qiblaAlignment.textContent = "Bearing mode";
  setAccuracyLabel("Manual guidance");
  setCompassMode("Bearing fallback");
  setFallbackLabel("North reference");
  qiblaAngle.textContent = currentBearing
    ? `Qibla is ${Math.round(currentBearing)}${degreeSymbol} ${degreesToCardinal(currentBearing)} from north`
    : "Qibla bearing ready";
  setGuidance(
    "Compass fallback active",
    reason ??
      "Your device is not giving a stable live compass, so Nooriva is showing the Qibla bearing from north instead.",
  );
}

function updateAlignment(heading) {
  if (currentBearing === null) {
    return;
  }

  currentHeading = heading;
  compassReadingReceived = true;
  qiblaPhoneArrow.style.opacity = "0.92";

  const diff = ((currentBearing - heading + 540) % 360) - 180;
  const absoluteDiff = Math.abs(diff);

  qiblaPhoneArrow.style.transform = `rotate(${heading}deg)`;
  qiblaDirectionArrow.style.transform = `rotate(${currentBearing}deg)`;
  deviceHeading.textContent = `${Math.round(heading)}${degreeSymbol} ${degreesToCardinal(heading)}`;
  setCompassMode("Live compass");
  setFallbackLabel("Compass first");

  if (absoluteDiff <= 6) {
    qiblaAlignment.textContent = "Aligned";
    qiblaAngle.textContent = "You are facing the Qibla";
    setAccuracyLabel("Excellent");
    setGuidance(
      "Perfect alignment",
      "You are lined up well. Small hand movement is normal, so aim to keep both arrows overlapping.",
    );
    return;
  }

  if (absoluteDiff <= 15) {
    qiblaAlignment.textContent = "Very close";
    setAccuracyLabel("Very good");
    setGuidance(
      "Just a little more",
      "Slow, gentle movement usually works better than big turns when you are already close.",
    );
  } else if (absoluteDiff <= 30) {
    qiblaAlignment.textContent = "Close";
    setAccuracyLabel("Good");
    setGuidance(
      "Fine-tune your angle",
      "If the reading keeps drifting, step away from metal furniture, chargers, speakers, or magnets.",
    );
  } else {
    qiblaAlignment.textContent = "Turn";
    setAccuracyLabel("Re-align");
    setGuidance(
      "Large correction needed",
      "Turn until the dark phone arrow approaches the gold Qibla arrow, then slow down for the final alignment.",
    );
  }

  qiblaAngle.textContent =
    diff > 0
      ? `Turn ${Math.round(absoluteDiff)}${degreeSymbol} clockwise`
      : `Turn ${Math.round(absoluteDiff)}${degreeSymbol} anti-clockwise`;
}

function startCompassWatchdog() {
  window.clearTimeout(compassTimeoutId);
  compassTimeoutId = window.setTimeout(() => {
    if (!compassReadingReceived && currentBearing !== null) {
      useBearingFallback(
        "No live compass reading came through on this device. Nooriva switched to bearing mode so you can still orient using north.",
      );
    }
  }, 4500);
}

function startCompass() {
  const handleOrientation = (event) => {
    const alpha = event.webkitCompassHeading ?? (typeof event.alpha === "number" ? 360 - event.alpha : null);

    if (typeof alpha !== "number" || Number.isNaN(alpha)) {
      return;
    }

    updateAlignment(alpha % 360);
  };

  startCompassWatchdog();

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission !== "granted") {
          qiblaStatus.textContent = "Motion permission was not granted.";
          useBearingFallback(
            "Motion access was denied, so Nooriva is using bearing mode. You can still follow the angle from north.",
          );
          return;
        }

        setAccuracyLabel("Compass starting");
        window.addEventListener("deviceorientation", handleOrientation, true);
      })
      .catch(() => {
        qiblaStatus.textContent = "Unable to access motion sensors.";
        useBearingFallback(
          "This device could not expose motion sensors, so Nooriva switched to the manual Qibla bearing view.",
        );
      });

    return;
  }

  setAccuracyLabel("Compass starting");
  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function startQibla() {
  if (!navigator.geolocation) {
    qiblaStatus.textContent = "Geolocation is not supported on this device.";
    qiblaAlignment.textContent = "Unavailable";
    setAccuracyLabel("Unavailable");
    setCompassMode("Unavailable");
    setFallbackLabel("No location");
    return;
  }

  qiblaStatus.textContent = "Getting your location...";
  qiblaAlignment.textContent = "Checking";
  setAccuracyLabel("Checking");
  setCompassMode("Checking sensors");
  setFallbackLabel("Compass first");
  setGuidance(
    "Finding your direction",
    "Nooriva is calculating the Qibla from your location, then it will try to use your device compass for live alignment.",
  );

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentBearing = calculateQiblaBearing(
        position.coords.latitude,
        position.coords.longitude,
      );

      qiblaBearing.textContent = `${Math.round(currentBearing)}${degreeSymbol} ${degreesToCardinal(currentBearing)}`;
      qiblaStatus.textContent =
        "Move your phone gently and keep it away from metal objects for the best result.";
      setGuidance(
        "Compass calibration matters",
        "If the compass feels off, make a slow figure-eight motion and keep the phone flat for a cleaner reading.",
      );
      startCompass();
    },
    () => {
      qiblaStatus.textContent = "Location permission is needed for Qibla direction.";
      qiblaAlignment.textContent = "Unavailable";
      setAccuracyLabel("Unavailable");
      setCompassMode("Unavailable");
      setFallbackLabel("No location");
      setGuidance(
        "Location required",
        "Nooriva needs your location to calculate the Qibla direction from where you are standing.",
      );
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
