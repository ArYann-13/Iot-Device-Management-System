#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define LDR_PIN 34
#define LIGHT_PIN 2
#define FAN_PIN 5

#define SERVER_DATA_URL "http://Your-IP/api/data"  // POST here
#define SERVER_STATE_URL "http://Your-IP/api/latest" // GET here

DHT dht(DHTPIN, DHTTYPE);
bool manualLight = false;
bool manualFan = false;
bool fanState = false;
bool lightState = false;
bool desiredLightState = false;

const char* ssid = "Wi-Fi Name";
const char* password = "wifi password";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(LDR_PIN, INPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int ldrValue = analogRead(LDR_PIN);

  // 1. First, get latest control states
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_STATE_URL); // <-- Fetch control commands from server
    int httpCode = http.GET();
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Server Response:");
      Serial.println(response);

      // Parse JSON manually (since ESP32 is small memory)
      manualFan = response.indexOf("\"fanState\":true") > 0;
      // manualLight = response.indexOf("\"lightState\":true") > 0;
      manualLight = response.indexOf("\"manualLight\":true") > 0;
      desiredLightState = response.indexOf("\"lightState\":true") > 0;
    } else {
      Serial.println("Error fetching control states");
    }
    http.end();
  }

  // 2. Update Devices based on Control Commands

  // Fan Control
digitalWrite(FAN_PIN, manualFan ? LOW : HIGH);
  fanState = manualFan; // Update fanState

  // Light Control (auto or manual)
  // if (!manualLight) {
  //   if (ldrValue < 1000) { // Dark
  //     digitalWrite(LIGHT_PIN, HIGH);
  //     lightState = true;
  //   } else {
  //     digitalWrite(LIGHT_PIN, LOW);
  //     lightState = false;
  //   }
  // } else {
  //   digitalWrite(LIGHT_PIN, HIGH);
  //   lightState = true;
  // }

if (manualLight) {
  // Manual override ON — use user's button state
  digitalWrite(LIGHT_PIN, desiredLightState ? HIGH : LOW);
  lightState = desiredLightState;
} else {
  // Auto Mode — control based on LDR
  if (ldrValue < 1000) { // Dark
    digitalWrite(LIGHT_PIN, HIGH);
    lightState = true;
  } else {
    digitalWrite(LIGHT_PIN, LOW);
    lightState = false;
  }
}

  

  // 3. Send updated sensor values to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_DATA_URL);  // <-- Post data to server
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"temperature\":" + String(temperature, 2) + 
                     ",\"humidity\":" + String(humidity, 2) + 
                     ",\"ldr\":" + String(ldrValue) + 
                     ",\"fanState\":" + String(fanState) +
                     ",\"lightState\":" + String(lightState) + "}";

    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    http.end();
  }

  delay(5000);
}
