import { Router, json } from "itty-router";
import { renderPage } from "vite-plugin-ssr/server";
import { Chat } from "./chat.js";
import { z } from "zod";

import Fuse from 'fuse.js';

import { parks } from "./parks.js";
import { bbqs } from "./bbq.js";

const initial =
  "You are a helpful bot that helps it's user come up with an interesting travel regime. You are required to determine where the user would like to go or think of places close to them to help them plan their itinerary. Get as much information as possible before recommending places to go and things to do. Make sure you keep your responses friendly, but short and to the point. Be creative and don't ask too many questions of the user. When you are confident you've completed the itinerary call the `submit_travel_itinerary` function.";

async function getChat(value?: string): Promise<Chat> {
  const defaultChat = Chat.create(initial);

  const chat = value
    ? await Chat.decrypt(value).catch((e) => {
      console.error(e, defaultChat);

      return defaultChat;
    })
    : defaultChat;

  return chat;
}

const parkFuse = new Fuse(parks, {
  keys: ["PARK_NAME", "SUBURB"],
  shouldSort: true,
  isCaseSensitive: false
});

const bbqFuse = new Fuse(bbqs, {
  keys: ["PARK_NAME", "SUBURB", "ITEM_DESCRIPTION"],
  shouldSort: true,
  isCaseSensitive: false
});

const router = Router()
  .post("/api/chat", async (ctx) => {
    const body = await ctx.json();

    let itinerary: any = null;

    const chat = (await getChat(body.history))
      .withFunction(
        "current_date",
        "Get the current date and time",
        z.object({}),
        async () => new Date().toString(),
      )
      .withFunction(
        "current_brisbane_weather",
        "Get the current weather and temperature in Brisbane",
        z.object({}),
        () => fetch("https://api.open-meteo.com/v1/forecast?latitude=-27.4&longitude=153.02&current_weather=true").then(x => x.json())
      )
      .withFunction(
        "search_by_suburb_for_activities",
        "Get various activities in the specified suburb of things to do. The suburb is always in Brisbane.",
        z.object({
          suburb: z
            .string()
            .describe(
              "The suburb in Brisbane of the place to search for things to do.",
            ),
        }),
        async ({ suburb }) => {
          const parks = parkFuse.search(suburb, { limit: 10 });
          const bbqs = bbqFuse.search(suburb, { limit: 10 });

          return [
            ...parks.map(x => `Go to the park at ${x.item.PARK_NAME}`),
            ...bbqs.map(x => `Have a bbq at ${x.item.PARK_NAME}`)
          ]
        },
      )
      .withFunction(
        "save_and_submit_travel_itinerary",
        "Save or submit the itinerary for the user.",
        z.object({
          name: z.string().describe("The name of the completed itinerary"),
          summary: z
            .string()
            .describe(
              "A short two sentence summary of the itinerary that is as exciting as possible",
            ),
          plan: z.array(
            z.object({
              location: z.string().describe("The name of the location to go to"),
              tips: z
                .string()
                .describe("Tips about how to have the most fun in that location"),
              day: z
                .number()
                .describe("The day of the itinerary. This should be incrementing."),
            }),
          ),
        }),
        async it => {
          itinerary = it;
          return "submitted"
        }
      );


    const [message, next] = await chat.send({
      role: "user",
      content: body.message as string,
    });

    console.log("sent");

    return json({
      message,
      itinerary,
      history: await next.encrypt().catch((e) => {
        console.log(e);
      }),
    });
  })
  .get("*", async (ctx) => {
    const pageContext = await renderPage({ urlOriginal: ctx.url });
    const { httpResponse } = pageContext;
    if (!httpResponse) {
      return null;
    } else {
      const { readable, writable } = new TransformStream();
      httpResponse.pipe(writable);
      return new Response(readable);
    }
  });

export default router;
