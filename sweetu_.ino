#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <WiFiClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

const char* ssid = "HAR HAR MAHADEV 🙏";
const char* password = "4380.1980.";

const char* ha_url = "http://13.126.44.22:8123/api/";
const char* token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyNmJkZTNjMzg4ZDQ0YTM0YTZjM2U1NzliOTBlNzFjMSIsImlhdCI6MTc4MDkxNTEwMiwiZXhwIjoyMDk2Mjc1MTAyfQ.nyHy8J4e4GS4Z6PP6SbIu7jnizGrQ24SVhl-Ukiif7I";

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

WebServer server(80);

String conversationId = "";
String lastReply = "";

const char* WLED_IP = "192.168.0.104";

void showText(String text)
{
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);

  display.println("SWEETU");
  display.println("");
  display.println(text);

  display.display();
}

void handleRoot()
{
String html = R"rawliteral(
<!DOCTYPE html>
<html>

<head>

<meta name="viewport"
content="width=device-width, initial-scale=1">

<title>SWEETU</title>

<style>

body{
background:#111;
color:white;
font-family:Arial;
margin:0;
padding:0;
}

.header{
background:#1f1f1f;
padding:15px;
font-size:22px;
font-weight:bold;
text-align:center;
}

.chat{
height:80vh;
overflow-y:auto;
padding:10px;
}

.user{
background:#2563eb;
padding:10px;
border-radius:12px;
margin:10px;
text-align:right;
}

.ai{
background:#333;
padding:10px;
border-radius:12px;
margin:10px;
}

.bottom{
position:fixed;
bottom:0;
width:100%;
display:flex;
background:#1f1f1f;
}

input{
flex:1;
padding:15px;
font-size:16px;
border:none;
outline:none;
}

button{
padding:15px;
font-size:16px;
}

</style>

</head>

<body>

<div class="header">
SWEETU 
</div>

<div id="chat"
class="chat">
</div>

<div class="bottom">

<input
id="msg"
placeholder="Message Sweetu">

<button
onclick="sendMsg()">
Send
</button>

</div>

<script>

function sendMsg(){

let msg =
document
.getElementById("msg")
.value;

if(msg=="")
return;

let chat =
document
.getElementById("chat");

chat.innerHTML +=
'<div class="user">'
+ msg +
'</div>';

fetch('/send?msg='
+
encodeURIComponent(msg))

.then(r=>r.text())

.then(reply=>{

chat.innerHTML +=
'<div class="ai">'
+ reply +
'</div>';

chat.scrollTop =
chat.scrollHeight;

});

document
.getElementById("msg")
.value="";

}

</script>

</body>

</html>
)rawliteral";

server.send(
200,
"text/html",
html);
}

void handleSend()
{
String msg =
server.arg("msg");

String aiReply =
askSweetu(msg);

showText(aiReply);

server.send(
200,
"text/plain",
aiReply);
}



String askSweetu(String message)
{
HTTPClient http;

String url =
"http://13.126.44.22:8123/api/conversation/process";

http.begin(url);

http.setTimeout(30000);

http.addHeader(
"Authorization",
"Bearer " + String(token));

http.addHeader(
"Content-Type",
"application/json");

DynamicJsonDocument req(1024);

req["text"] = message;

req["agent_id"] =
"conversation.google_ai_conversation_2";

if(conversationId.length() > 0)
{
req["conversation_id"] =
conversationId;
}

String payload;

serializeJson(req, payload);

int code = http.POST(payload);
Serial.println("PAYLOAD:");
Serial.println(payload);

Serial.print("HTTP Code: ");
Serial.println(code);

if(code != 200)
{
  Serial.println("ERROR RESPONSE:");
  Serial.println(http.getString());

  http.end();
  return "API Error";
}

String response =
http.getString();

Serial.println(response);

DynamicJsonDocument doc(8192);

DeserializationError error =
deserializeJson(doc, response);

if(error)
{
http.end();
return "JSON Error";
}

if(doc["conversation_id"])
{
conversationId =
doc["conversation_id"]
.as<String>();
}

String reply =
doc["response"]["speech"]
["plain"]["speech"]
.as<String>();

Serial.print("AI Reply: ");
Serial.println(reply);

if(reply.startsWith("WLED_RGB:"))
{
  String rgb = reply.substring(9);

  int first = rgb.indexOf(',');
  int second = rgb.indexOf(',', first + 1);

  int r = rgb.substring(0, first).toInt();
  int g = rgb.substring(first + 1, second).toInt();
  int b = rgb.substring(second + 1).toInt();

  sendWledRGB(r, g, b);

  http.end();
  return "LED color changed";
}
else if(reply.startsWith("WLED_EFFECT:"))
{
  String effect = reply.substring(12);
  effect.trim();

  sendWledEffect(effect);

  http.end();
  return "LED effect changed";
}
else if(reply.startsWith("WLED_BRIGHTNESS:"))
{
  int brightness = reply.substring(16).toInt();

  sendWledBrightness(brightness);

  http.end();
  return "LED brightness changed";
}
else if(reply.startsWith("WLED_POWER:"))
{
  String power = reply.substring(11);
  power.trim();

  sendWledPower(power);

  http.end();
  return "LED power changed";
}

http.end();
return reply;
}
void sendWledRGB(int r, int g, int b)
{
  HTTPClient http;

  String url =
  "http://" +
  String(WLED_IP) +
  "/json/state";

  http.begin(url);

  http.addHeader(
  "Content-Type",
  "application/json");

  String json =
  "{\"on\":true,\"seg\":[{\"col\":[[" +
  String(r) + "," +
  String(g) + "," +
  String(b) +
  "]]}]}";

  http.POST(json);

  http.end();
}
void sendWledEffect(String effect)
{
  HTTPClient http;

  String url =
  "http://" +
  String(WLED_IP) +
  "/json/state";

  http.begin(url);

  http.addHeader(
  "Content-Type",
  "application/json");

  String json;

  if(effect == "rainbow")
  {
    json =
    "{\"on\":true,\"seg\":[{\"fx\":9}]}";
  }
  else if(effect == "fire")
  {
    json =
    "{\"on\":true,\"seg\":[{\"fx\":45}]}";
  }
  else if(effect == "blink")
  {
    json =
    "{\"on\":true,\"seg\":[{\"fx\":1}]}";
  }
  else
  {
    http.end();
    return;
  }

  http.POST(json);

  http.end();
}

void sendWledPower(String power)
{
  HTTPClient http;

  String url =
  "http://" +
  String(WLED_IP) +
  "/json/state";

  http.begin(url);

  http.addHeader(
  "Content-Type",
  "application/json");

  String json =
  (power == "on")
  ? "{\"on\":true}"
  : "{\"on\":false}";

  http.POST(json);

  http.end();
}

void sendWledBrightness(int brightness)
{
  brightness = constrain(brightness, 0, 60);

  int bri = map(brightness, 0, 60, 0, 255);

  HTTPClient http;

  String url =
    "http://" +
    String(WLED_IP) +
    "/json/state";

  http.begin(url);

  http.addHeader("Content-Type", "application/json");

  String json =
    "{\"on\":true,\"bri\":" +
    String(bri) +
    "}";

  http.POST(json);

  http.end();
}


void setup()
{
  Serial.begin(115200);

  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    while (true);
  }

  showText("Connecting WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
  }

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  showText("Testing HA");

  HTTPClient http;

  http.begin(ha_url);

  http.addHeader(
    "Authorization",
    "Bearer " + String(token));

  http.addHeader(
    "Content-Type",
    "application/json");

  int code = http.GET();

  if (code == 200)
  {
    showText("HA Connected");
  }
  else
  {
    showText("HA Error: " + String(code));
  }

  http.end();

  server.on("/", handleRoot);
  server.on("/send", handleSend);

  server.begin();

  Serial.println("Web Server Started");
}

void loop()
{
  server.handleClient();
}
