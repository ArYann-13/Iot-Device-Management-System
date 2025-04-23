#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define LDR_PIN 34
#define LIGHT_PIN 2
#define FAN_PIN 5

#define SERVER_DATA_URL "http://Your-ip:5000/api/data"  // POST here
#define SERVER_STATE_URL "http://Your-ip:5000/api/latest" // GET here

DHT dht(DHTPIN, DHTTYPE);
bool manualLight = false;
bool manualFan = false;
bool fanState = false;
bool lightState = false;
bool desiredLightState = false;

const char* ssid = "WiFi Name";
const char* password = "WiFi Password";

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
  // Read back the current state of relay pin

  bool isFanConnected = digitalRead(FAN_PIN) == LOW;

  bool isDHTConnected = !(isnan(temperature) || isnan(humidity));
  bool isLDRConnected = (ldrValue > 10 && ldrValue < 4095);  // crude check
  

  // 🔐 Only try to fetch commands if at least WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_STATE_URL);
    int httpCode = http.GET();
    if (httpCode > 0) {
      String response = http.getString();
      manualFan = response.indexOf("\"fanState\":true") > 0;
      manualLight = response.indexOf("\"manualLight\":true") > 0;
      desiredLightState = response.indexOf("\"lightState\":true") > 0;
    }
    http.end();
  }

  // 🌡️ Don't control if sensor is disconnected
  if (isDHTConnected) {
    digitalWrite(FAN_PIN, manualFan ? LOW : HIGH);
    fanState = manualFan;
  } else {
    fanState = false;
    digitalWrite(FAN_PIN, HIGH);  // Turn OFF fan
  }

  // 💡 Light (auto/manual)
  if (manualLight) {
    digitalWrite(LIGHT_PIN, desiredLightState ? HIGH : LOW);
    lightState = desiredLightState;
  } else {
    if (isLDRConnected && ldrValue < 1000) {
      digitalWrite(LIGHT_PIN, HIGH);
      lightState = true;
    } else {
      digitalWrite(LIGHT_PIN, LOW);
      lightState = false;
    }
  }

  // 🛑 If sensor is disconnected, skip sending fake/old data
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
    payload += ",\"deviceStatus\":{";
    payload += "\"dht22\":" + String(isDHTConnected ? "true" : "false") + ",";
    payload += "\"ldr\":" + String(isLDRConnected ? "true" : "false") + ",";
    payload += "\"fan\":" + String(isFanConnected ? "true" : "false");
    payload += "}}";

    int response = http.POST(payload);
    if (response > 0) {
      Serial.println("Payload Sent: ");
      Serial.println(payload);
    } else {
      Serial.println("Failed to send data");
    }
    http.end();
  }

  delay(5000);
}
