/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()); // creates express http server

const Keyv = require("keyv");

// One of the following
const keyv = new Keyv();
app.get("/", (req, res) => {
  res.status(200).send("Deployed");
});
// Handle DB connection errors

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
  console.log("webhook is listening");
});

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
 
  let body = req.body;
  // keyv.on("error", err => console.log("Connection Error", err));

//   (async () => {
//     await keyv.set('foo', 'expires in 1 second', 1000); // true
//     await keyv.set('foo', 'never expires'); // true
//     await keyv.get('foo').then((test) => console.log(test));// 'never expires'
//     await keyv.delete('foo'); // true
//     await keyv.clear(); // undefined})();
// })()


  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    console.log("body", JSON.stringify(body));
    //     if(!body.entry.messaging){
    //         console.log('persistent menu');

    // return
    //     }

    //   else{
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0

      console.log("here");
      let webhook_event = entry.messaging[0];

      // console.log(webhook_event);
      // console.log('webhook_event' + webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        console.log("calling handleMessage");

        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        console.log("calling handlePostback");
        handlePostback(sender_psid, webhook_event.postback);
      }
    });
    // }
    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  console.log("handleMessage");

  //  let response;

  //   // Check if the message contains text
  //   if (received_message.text) {

  //     // Create the payload for a basic text message
  //     response = {
  //       "text": `You sent the message: "${received_message.text}". Now send me an image!`
  //     }
  //   }

  //   // Sends the response message
  //   callSendAPI(sender_psid, response);

  let response;
  console.log("received_message" + JSON.stringify(received_message) + "\n");

  // Checks if the message contains text
  if (received_message.text == "Hello") {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      text: `You sent the message: "${
        received_message.text
      }". Now send me an attachment!`
    };
  } else if (received_message.attachments) {
    console.log(
      "attachments" + JSON.stringify(received_message.attachments) + "\n"
    );

    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    console.log("attachment_url" + attachment_url);
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes"
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no"
                }
              ]
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Button_format") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "What do you want to do next?",
          buttons: [
            {
              type: "web_url",
              url: "https://www.messenger.com",
              title: "Visit Messenger"
            },
            {
              type: "postback",
              title: "<BUTTON_TEXT>",
              payload: "<STRING_SENT_TO_WEBHOOK>"
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Element_share") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Breaking News: Record Thunderstorms",
              subtitle:
                "The local area is due for record thunderstorms over the weekend.",
              image_url: "https://thechangreport.com/img/lightning.png",
              buttons: [
                {
                  type: "element_share",
                  share_contents: {
                    attachment: {
                      type: "template",
                      payload: {
                        template_type: "generic",
                        elements: [
                          {
                            title: "I took the hat quiz",
                            subtitle: "My result: Fez",
                            image_url:
                              "https://bot.peters-hats.com/img/hats/fez.jpg",
                            default_action: {
                              type: "web_url",
                              url: "http://m.me/petershats?ref=invited_by_24601"
                            },
                            buttons: [
                              {
                                type: "web_url",
                                url:
                                  "http://m.me/petershats?ref=invited_by_24601",
                                title: "Take Quiz"
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Test") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "What do you want to do next?",
          buttons: [
            {
              type: "phone_number",
              title: "<BUTTON_TEXT>",
              payload: "<PHONE_NUMBER>"
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Call_support") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Call for Help",
          buttons: [
            {
              type: "web_url",
              title: "Visit web",
              url:
                "https://www.hsbc.com.eg/1/2/eg/personal/useful-link/contact-us",
              webview_height_ratio: "full"
            },
            {
              type: "phone_number",
              title: "Call bank support",
              payload: "+201006747065"
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Démarrer") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Call for Help",
          buttons: [
            {
              type: "web_url",
              title: "Visit web",
              url:
                "https://www.hsbc.com.eg/1/2/eg/personal/useful-link/contact-us",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    };
  } else if (received_message.text == "Test1") {
    response = { text: "integration succedded" };
  } else {
    response = {
      text: `This is not a recognized command`
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  console.log("handlePostback");

  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;
  console.log(payload);
  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  } else if (payload === "PAYBILL_PAYLOAD") {
    response = { text: "you are not signed in you need to sign in" };
  } else if (payload == "BOOTBOT_GET_STARTED") {
    response = {
      text: "Welcome sir we are checking if you have an account with us"
    };
  }

  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}
