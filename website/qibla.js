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
const qiblaHelperTitle = document.getElementById("qibla-helper-title");
const qiblaHelperText = document.getElementById("qibla-helper-text");

let currentBearing = null;
let latestHeading = null;
let smoothedHeading = null;
let compassReadingReceived = false;
let compassTimeoutId = null;
let qiblaBooted = false;
let locationWatchId = null;
let orientationHandler = null;
let motionPermissionRequested = false;
let absoluteCompassReady = false;
const qiblaLocationStorageKey = "nooriva-qibla-last-location";
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
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

function shortestAngleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setAccuracyLabel(label) {
  setText(qiblaAccuracy, label);
}

function setCompassMode(label) {
  setText(qiblaMode, label);
}

function setFallbackLabel(label) {
  setText(qiblaFallback, label);
}

function setGuidance(title, detail) {
  setText(qiblaGuidanceTitle, title);
  setText(qiblaGuidanceDetail, detail);
  setText(qiblaGuidanceText, detail);
}

function setHelper(title, detail) {
  setText(qiblaHelperTitle, title);
  setText(qiblaHelperText, detail);
}

function loadStoredLocation() {
  try {
    const raw = localStorage.getItem(qiblaLocationStorageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (typeof parsed?.latitude !== "number" || typeof parsed?.longitude !== "number") {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

function storeLocation(position) {
  try {
    localStorage.setItem(
      qiblaLocationStorageKey,
      JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    // Ignore storage failures.
  }
}

function setWaitingForHeading() {
  if (latestHeading !== null) {
    return;
  }

  qiblaPhoneArrow.style.opacity = "0.5";
  qiblaPhoneArrow.style.transform = "rotate(0deg)";
  qiblaDirectionArrow.style.transform = "rotate(0deg)";
  setText(deviceHeading, "--");
  setText(qiblaAlignment, "Starting");
  setAccuracyLabel("Warming up");
  setCompassMode("Opening compass");
  setHelper("Compass help", "Keep your phone upright and still for a moment.");
  setGuidance(
    "Preparing live compass",
    "Nooriva is opening your device sensors now.",
  );
}

function getScreenAngle() {
  if (window.screen?.orientation && typeof window.screen.orientation.angle === "number") {
    return window.screen.orientation.angle;
  }

  if (typeof window.orientation === "number") {
    return window.orientation;
  }

  return 0;
}

function normalizeHeading(degrees) {
  return (degrees % 360 + 360) % 360;
}

function getHeadingFromOrientationEvent(event) {
  if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
    absoluteCompassReady = true;
    if (typeof event.webkitCompassAccuracy === "number" && !Number.isNaN(event.webkitCompassAccuracy)) {
      if (event.webkitCompassAccuracy <= 12) {
        setAccuracyLabel("High precision");
      } else if (event.webkitCompassAccuracy <= 25) {
        setAccuracyLabel("Calibrating");
      } else {
        setAccuracyLabel("Needs calibration");
      }
    }
    return normalizeHeading(event.webkitCompassHeading);
  }

  if (typeof event.alpha !== "number" || Number.isNaN(event.alpha)) {
    return null;
  }

  if (event.absolute === true) {
    absoluteCompassReady = true;
  } else if (absoluteCompassReady) {
    return null;
  }

  return normalizeHeading(360 - event.alpha - getScreenAngle());
}

function useBearingFallback(reason) {
  qiblaPhoneArrow.style.opacity = "0.14";
  qiblaPhoneArrow.style.transform = "rotate(0deg)";
  qiblaDirectionArrow.style.transform = `rotate(${currentBearing ?? 0}deg)`;
  setText(deviceHeading, "Use north");
  setText(qiblaAlignment, "Bearing mode");
  setAccuracyLabel("Manual guidance");
  setCompassMode("Bearing fallback");
  setFallbackLabel("North reference");
  setHelper("Compass unavailable", "Face north first, then follow the gold arrow toward the Qibla.");
  qiblaAngle.textContent = currentBearing
    ? `Qibla is ${Math.round(currentBearing)}${degreeSymbol} ${degreesToCardinal(currentBearing)}`
    : "Qibla bearing ready";
  qiblaStatus.textContent = reason ?? "Compass unavailable. Using bearing direction.";
}

function updateAlignment(heading) {
  if (currentBearing === null) {
    latestHeading = heading;
    smoothedHeading = heading;
    setText(deviceHeading, `${Math.round(heading)}${degreeSymbol} ${degreesToCardinal(heading)}`);
    setCompassMode("Compass ready");
    setAccuracyLabel("Waiting for location");
    setHelper("Location needed", "Compass is ready. Nooriva is still confirming your location.");
    return;
  }

  latestHeading = heading;
  smoothedHeading =
    smoothedHeading === null
      ? heading
      : (smoothedHeading + shortestAngleDelta(smoothedHeading, heading) * 0.34 + 360) % 360;

  compassReadingReceived = true;
  qiblaPhoneArrow.style.opacity = "0.92";

  const diff = shortestAngleDelta(smoothedHeading, currentBearing);
  const absoluteDiff = Math.abs(diff);

  qiblaPhoneArrow.style.transform = "rotate(0deg)";
  qiblaDirectionArrow.style.transform = `rotate(${diff}deg)`;
  setText(
    deviceHeading,
    `${Math.round(smoothedHeading)}${degreeSymbol} ${degreesToCardinal(smoothedHeading)}`,
  );
  setCompassMode("Live compass");
  setFallbackLabel("Compass first");

  if (absoluteDiff <= 6) {
    setText(qiblaAlignment, "Aligned");
    qiblaAngle.textContent = "You are facing the Qibla";
    qiblaStatus.textContent = "Aligned";
    setAccuracyLabel("Excellent");
    setHelper("Perfect", "You are facing the Qibla.");
    return;
  }

  if (absoluteDiff <= 15) {
    setText(qiblaAlignment, "Very close");
    setAccuracyLabel("Very good");
    setHelper("Almost there", "A small turn should line you up.");
  } else if (absoluteDiff <= 30) {
    setText(qiblaAlignment, "Close");
    setAccuracyLabel("Good");
    setHelper("Fine tune", "Turn gently until the arrows line up.");
  } else {
    setText(qiblaAlignment, "Turn");
    setAccuracyLabel("Re-align");
    setHelper("Re-align", "Move your phone in a figure-eight if the compass feels off.");
  }

  qiblaStatus.textContent = "Move slowly and calibrate your phone if the compass drifts.";
  qiblaAngle.textContent =
    diff > 0
      ? `Turn ${Math.round(absoluteDiff)}${degreeSymbol} clockwise`
      : `Turn ${Math.round(absoluteDiff)}${degreeSymbol} anti-clockwise`;
}

function startCompassWatchdog() {
  window.clearTimeout(compassTimeoutId);
  compassTimeoutId = window.setTimeout(() => {
    if (!compassReadingReceived && currentBearing !== null) {
      useBearingFallback("No live compass reading came through on this device.");
    }
  }, 2200);
}

function attachOrientationListeners(handleOrientation) {
  detachOrientationListeners();
  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
  orientationHandler = handleOrientation;
}

function detachOrientationListeners() {
  if (!orientationHandler) {
    return;
  }

  window.removeEventListener("deviceorientationabsolute", orientationHandler, true);
  window.removeEventListener("deviceorientation", orientationHandler, true);
  orientationHandler = null;
}

function startCompass() {
  const handleOrientation = (event) => {
    const heading = getHeadingFromOrientationEvent(event);

    if (typeof heading !== "number" || Number.isNaN(heading)) {
      return;
    }

    updateAlignment(heading);
  };

  absoluteCompassReady = false;
  setWaitingForHeading();
  startCompassWatchdog();

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    if (motionPermissionRequested) {
      attachOrientationListeners(handleOrientation);
      return;
    }

    motionPermissionRequested = true;
    DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission !== "granted") {
          qiblaStatus.textContent = "Motion permission was not granted.";
          setHelper("Motion blocked", "Enable motion access if you want the live compass to work.");
          useBearingFallback("Motion access was denied, so Nooriva is using bearing mode.");
          return;
        }

        setAccuracyLabel("Compass starting");
        attachOrientationListeners(handleOrientation);
      })
      .catch(() => {
        qiblaStatus.textContent = "Unable to access motion sensors.";
        setHelper("Compass unavailable", "This device did not expose a usable compass.");
        useBearingFallback("This device could not expose motion sensors.");
      });

    return;
  }

  setAccuracyLabel("Compass starting");
  attachOrientationListeners(handleOrientation);
}

function applyLocation(position, sourceLabel) {
  storeLocation(position);
  currentBearing = calculateQiblaBearing(position.coords.latitude, position.coords.longitude);
  setText(
    qiblaBearing,
    `${Math.round(currentBearing)}${degreeSymbol} ${degreesToCardinal(currentBearing)}`,
  );
  qiblaStatus.textContent =
    sourceLabel === "cached"
      ? "Using your last known location."
      : "Move your phone gently for the best result.";

  if (latestHeading !== null) {
    updateAlignment(latestHeading);
  } else {
    qiblaAngle.textContent = "Preparing compass...";
  }
}

function startLocationUpdates() {
  if (!navigator.geolocation) {
    qiblaStatus.textContent = "Geolocation is not supported on this device.";
    setText(qiblaAlignment, "Unavailable");
    setAccuracyLabel("Unavailable");
    setCompassMode("Unavailable");
    setFallbackLabel("No location");
    return;
  }

  qiblaStatus.textContent = "Getting your location...";
  setText(qiblaAlignment, "Checking");
  setAccuracyLabel("Checking");
  setCompassMode("Checking sensors");
  setFallbackLabel("Compass first");
  setHelper("Getting location", "Nooriva is checking your location for the Qibla bearing.");

  const storedLocation = loadStoredLocation();

  if (storedLocation) {
    applyLocation(
      {
        coords: {
          latitude: storedLocation.latitude,
          longitude: storedLocation.longitude,
        },
      },
      "cached",
    );
  }

  navigator.geolocation.getCurrentPosition(
    (position) => applyLocation(position, "cached"),
    () => undefined,
    {
      enableHighAccuracy: false,
      timeout: 1500,
      maximumAge: 1000 * 60 * 60 * 6,
    },
  );

  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
  }

  locationWatchId = navigator.geolocation.watchPosition(
    (position) => applyLocation(position, "live"),
    () => {
      if (currentBearing === null) {
        qiblaStatus.textContent = "Location permission is needed for Qibla direction.";
        setText(qiblaAlignment, "Unavailable");
        setAccuracyLabel("Unavailable");
        setCompassMode("Unavailable");
        setFallbackLabel("No location");
        setHelper("Location blocked", "Allow location so Nooriva can calculate the Qibla properly.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
}

function startQibla() {
  if (qiblaBooted) {
    qiblaStatus.textContent =
      currentBearing === null
        ? "Still preparing your Qibla direction..."
        : "Qibla is active.";
    return;
  }

  qiblaBooted = true;
  startCompass();
  startLocationUpdates();
}

enableQiblaButton?.addEventListener("click", startQibla);

window.setTimeout(() => {
  if (!qiblaBooted) {
    startQibla();
  }
}, 180);

if (
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof DeviceOrientationEvent.requestPermission !== "function" &&
  window.isSecureContext
) {
  window.setTimeout(() => {
    if (!qiblaBooted) {
      startQibla();
    }
  }, 300);
}
