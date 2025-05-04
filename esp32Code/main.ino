#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiUdp.h>
#include "DHT.h"
#include "time.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define LDR_PIN 34
#define LIGHT_PIN 2
#define FAN_PIN 5

#define SERVER_DATA_URL "http://192.168.87.9:5000/api/data"
#define SERVER_STATE_URL "http://192.168.87.9:5000/api/latest"

DHT dht(DHTPIN, DHTTYPE);

bool manualLight = false;
bool manualFan = false;
bool fanState = false;
bool lightState = false;
bool desiredLightState = false;

String scheduleLightOff = "";
String scheduleFanOff = "";

const char* ssid = "Aryan";
const char* password = "maaryan@0908";

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

  // Set time from NTP
  configTime(19800, 0, "pool.ntp.org"); // IST offset (UTC+5:30)
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int ldrValue = analogRead(LDR_PIN);

  bool isFanConnected = digitalRead(FAN_PIN) == LOW;
  bool isDHTConnected = !(isnan(temperature) || isnan(humidity));
  bool isLDRConnected = (ldrValue > 10 && ldrValue < 4095);

  // Get latest control + schedule from backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_STATE_URL);
    int httpCode = http.GET();
    if (httpCode > 0) {
      String response = http.getString();
      manualFan = response.indexOf("\"fanState\":true") > 0;
      manualLight = response.indexOf("\"manualLight\":true") > 0;
      desiredLightState = response.indexOf("\"lightState\":true") > 0;

      // Extract schedule
      int lightIdx = response.indexOf("\"lightOff\":\"");
      int fanIdx = response.indexOf("\"fanOff\":\"");

      if (lightIdx > 0) {
        lightIdx += 12;
        scheduleLightOff = response.substring(lightIdx, response.indexOf("\"", lightIdx));
      }

      if (fanIdx > 0) {
        fanIdx += 10;
        scheduleFanOff = response.substring(fanIdx, response.indexOf("\"", fanIdx));
      }
    }
    http.end();
  }

  // Get current time (HH:MM)
  struct tm timeinfo;
  char timeStr[6] = "--:--";
  if (getLocalTime(&timeinfo)) {
    strftime(timeStr, sizeof(timeStr), "%H:%M", &timeinfo);
  }

  // Scheduled fan off
  if (scheduleFanOff.length() > 0 && scheduleFanOff == String(timeStr)) {
    manualFan = false;
  }

  // Scheduled light off
  if (scheduleLightOff.length() > 0 && scheduleLightOff == String(timeStr)) {
    manualLight = false;
    desiredLightState = false;
  }

  // Fan control
  if (isDHTConnected) {
    digitalWrite(FAN_PIN, manualFan ? LOW : HIGH);
    fanState = manualFan;
  } else {
    digitalWrite(FAN_PIN, HIGH); // OFF
    fanState = false;
  }

  // Light control (Manual Override First, then Scheduler)
  if (manualLight) {
    digitalWrite(LIGHT_PIN, desiredLightState ? HIGH : LOW);
    lightState = desiredLightState;
  } else {
    // LDR-based control (automatically turn on/off based on light)
    if (isLDRConnected && ldrValue < 1000) {  // LDR threshold for night (low light)
      digitalWrite(LIGHT_PIN, HIGH);  // Turn on the light
      lightState = true;
    } else {
      digitalWrite(LIGHT_PIN, LOW);   // Turn off the light
      lightState = false;
    }
  }

  // Send sensor + device state to backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_DATA_URL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"temperature\":" + String(isDHTConnected ? temperature : 0.0, 2);
    payload += ",\"humidity\":" + String(isDHTConnected ? humidity : 0.0, 2);
    payload += ",\"ldr\":" + String(isLDRConnected ? ldrValue : 0);
    payload += ",\"fanState\":" + String(fanState ? "true" : "false");
    payload += ",\"lightState\":" + String(lightState ? "true" : "false");
    payload += ",\"manualLight\":" + String(manualLight ? "true" : "false");
    payload += ",\"deviceStatus\":{";
    payload += "\"dht22\":" + String(isDHTConnected ? "true" : "false") + ","; 
    payload += "\"ldr\":" + String(isLDRConnected ? "true" : "false") + ","; 
    payload += "\"fan\":" + String(isFanConnected ? "true" : "false");
    payload += "}}";

    int response = http.POST(payload);
    if (response > 0) {
      Serial.println("Payload sent: " + payload);
    } else {
      Serial.println("Failed to send data");
    }
    http.end();
  }

  delay(5000);  // Adjust delay if needed
}
