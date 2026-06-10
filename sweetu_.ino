#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

const char* ssid = "HAR HAR MAHADEV 🙏";
const char* password = "4380.1980.";

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

WebServer server(80);

String conversationId = "";

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
  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate validation for Vercel

  HTTPClient http;

  String url = "https://your-sweetu-backend.vercel.app/api/chat";

  http.begin(client, url);
  http.setTimeout(30000);
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument req(1024);
  req["message"] = message;

  if(conversationId.length() > 0)
  {
    req["conversation_id"] = conversationId;
  }

  String payload;
  serializeJson(req, payload);

  int code = http.POST(payload);
  Serial.println("PAYLOAD:");
  Serial.println(payload);

  Serial.print("HTTP Code: ");
  Serial.println(code);

  if(code != 200 && code != 502)
  {
    Serial.println("ERROR RESPONSE:");
    Serial.println(http.getString());

    http.end();
    return "API Error";
  }

  String response = http.getString();
  Serial.println(response);

  DynamicJsonDocument doc(8192);
  DeserializationError error = deserializeJson(doc, response);

  if(error)
  {
    http.end();
    return "JSON Error";
  }

  if(doc["conversation_id"])
  {
    conversationId = doc["conversation_id"].as<String>();
  }

  String reply = doc["text"].as<String>();

  Serial.print("AI Reply: ");
  Serial.println(reply);

  http.end();
  return reply;
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

  showText("Connected! Ready.");

  server.on("/", handleRoot);
  server.on("/send", handleSend);

  server.begin();

  Serial.println("Web Server Started");
}

void loop()
{
  server.handleClient();
}
