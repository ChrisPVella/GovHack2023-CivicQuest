import { ReactNode, useEffect, useRef, useState } from "react";
import Container from "./container";
import { useMutation } from "@tanstack/react-query";

import { WheelChair } from "./WheelChair";
import { Star } from "./Star";

import mapUrl from './map.png';
import { Plus } from "./Plus";

interface Message {
  role: string;
  content: ReactNode;
}

const cn = (...args: (string | false | null | undefined)[]) =>
  args.filter((x) => !!x).join(" ");

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function PreparedMessage() {
  return (
    <>
      <div className="my-3">I have created the following itinerary:</div>
      <ul className="my-3 list-disc ml-8 grid grid-cols-1 gap-1">
        <li>
          Travel <span className="opacity-70">(Walk 532m - 9:57 AM)</span>
        </li>
        <li>
          Brunch at Brioche Bistro
          <div className="flex items-center gap-1 opacity-70 text-sm"><WheelChair /> Wheelchair accessible</div>
        </li>
        <li>
          Travel <span className="opacity-70">(Walk 200m - 12:11 PM)</span>
        </li>
        <li>
          Percussion in the Park <br />
          <div className="flex items-center gap-1 text-sm opacity-70">
            <Star /> Local event
          </div>
        </li>
        <li>
          Travel <span className="opacity-70">(Bus 178 - 5:12 PM)</span>
        </li>
        <li>
          Dinner at La Feta
          <div className="flex items-center gap-1 opacity-70 text-sm"><WheelChair /> Wheelchair accessible</div>
        </li>
        <li>Travel <span className="opacity-70">(Bus 192 - 8:18 PM)</span></li>
        <li>Complete <span className="opacity-70">(8:42 PM)</span>
          <div className="my-2">
            <img className="w-full max-w-[400px] rounded-[30px] border" src={mapUrl} />
          </div>
        </li>
      </ul>
      <div className="my-3">
        Would you like to add this plan to your itinerary? Or make changes?
      </div>
    </>
  );
}

function AddButton() {
  return <button className="bg-indigo-500 py-2 px-4 my-2 text-white font-bold rounded-lg flex gap-2 items-center"><Plus /> Add to itinerary</button>
}

export const ChatBox = () => {
  const historyRef = useRef<string>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there. I'm a chat bot that can help you plan your next holiday. To get started ask me to plan an itinerary for you.",
    },
  ]);

  const [itinerary, setItinerary] = useState<unknown>();

  async function preparedMessage() {
    await wait(1232);

    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: "Hello! Sure, I can help with that." },
    ]);

    await wait(3523);

    setMessages((messages) => [
      ...messages,
      {
        role: "assistant",
        content: <PreparedMessage />,
      },
    ]);

    await wait(1240);

    setMessages((messages) => [
      ...messages,
      {
        role: "assistant",
        content: <AddButton />,
      },
    ]);
  }

  const { mutate: chat, isLoading } = useMutation(async (message: string) => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
    ]);

    if (message === "Please organise an itinerary for today in Brisbane until 9:00 PM.") {
      return await preparedMessage();
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        history: historyRef.current,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const res = await response.json();

    if (!res.message) {
      return;
    }

    setMessages((messages) => [...messages, res.message]);

    if (res.itinerary) {
      setItinerary(res.itinerary);
    }

    historyRef.current = res.history;
  });

  const textRef = useRef<HTMLInputElement>(null);

  function send() {
    const input = textRef.current;

    if (!input) {
      return;
    }

    chat(input.value);

    input.value = "";
  }

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length <= 1) {
      return;
    }

    messageRef.current?.scrollTo({
      top: 10000000,
    });

    textRef.current?.focus();
  }, [messages]);

  return (
    <Container>
      <div className="max-h-[100%] h-[100%] grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden gap-2 max-w-[900px] h-[900px] w-[100%] mx-auto drop-shadow-xl bg-white rounded-xl border">
        <div className="bg-indigo-500 py-4 text-center text-white">
          <div className="font-bold text-2xl">
            Plan your next adventure
          </div>
          <div className="text-sm opacity-60">Chat with our chat bot and create your itinerary</div>
        </div>
        <div ref={messageRef} className="overflow-x-auto h-[100%] px-2">
          {messages.map((x, i) => (
            <div
              key={i}
              className={cn(
                x.role !== "user"
                  ? "mr-auto bg-gray-50"
                  : "ml-auto bg-blue-300",
                "drop-shadow-sm",
                "border rounded-lg py-1 px-4 my-4 w-fit max-w-[min(600px,100%)]",
              )}
            >
              {typeof x.content === "string"
                ? x.content
                  .split("\n")
                  .map((x) => <div className="my-3">{x}</div>)
                : x.content}
            </div>
          ))}

          {isLoading && (
            <div className="mr-auto bg-gray-100 drop-shadow-sm rounded-l py-2 px-4 my-4 w-fit opacity-50">
              I'm thinking...
            </div>
          )}

          {itinerary ? JSON.stringify(itinerary) : ""}
        </div>
        <div className="flex gap-2 p-2">
          <input
            className="grow border-2 text-lg py-3 rounded-lg py-2 px-4"
            placeholder="Ask anything..."
            disabled={isLoading}
            ref={textRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                send();
              }
            }}
          />
          <button
            className="bg-indigo-500 text-white font-bold py-3 px-8 text-lg rounded-lg"
            disabled={isLoading}
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>
    </Container>
  );
};
