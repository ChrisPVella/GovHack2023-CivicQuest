import { useEffect, useRef, useState } from "react";
import Container from './container';
import { useMutation } from "@tanstack/react-query";

interface Message {
  role: string;
  content: string;
}

const cn = (...args: (string | false | null | undefined)[]) =>
  args.filter((x) => !!x).join(" ");

export const ChatBox = () => {
  const historyRef = useRef<string>();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there. I'm a chat bot that can help you plan your next holiday. To get started ask me to plan an itinerary for you." }
  ]);

  const [itinerary, setItinerary] = useState<unknown>();

  const { mutate: chat, isLoading } = useMutation(async (message: string) => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
    ]);

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

    input.value = '';
  }

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length <= 1) {
      return;
    }

    messageRef.current?.scrollTo({
      top: 10000000
    });

    textRef.current?.focus();
  }, [messages]);

  return (
    <Container>
      <div className="max-h-[100%] h-[100%] grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden gap-2 max-w-[900px] h-[600px] w-[100%] mx-auto drop-shadow-xl bg-white rounded-xl border">
        <div className="bg-indigo-700 py-4 text-center text-white font-bold text-xl">Plan your trip</div>
        <div ref={messageRef} className="overflow-x-auto h-[100%] px-2">
          {messages.map((x, i) => (
            <div
              key={i}
              className={cn(
                x.role !== "user" ? "mr-auto bg-gray-100" : "ml-auto bg-blue-300",
                "drop-shadow",
                "rounded-lg py-1 px-4 my-4 w-fit max-w-[min(600px,100%)]",
              )}
            >
              {x.content.split('\n').map(x => <div className="my-3">{x}</div>)}
            </div>
          ))}

          {isLoading && <div className="mr-auto bg-gray-100 drop-shadow rounded-l py-2 px-4 my-4 w-fit opacity-50">I'm thinking...</div>}


          {itinerary ? JSON.stringify(itinerary) : ''}

        </div>
        <div className="flex gap-2 p-2">
          <input className="grow border-2 text-lg py-3 rounded-lg py-2 px-4" placeholder="Ask anything..." disabled={isLoading} ref={textRef} onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              send();
            }
          }} />
          <button className="bg-indigo-500 text-white font-bold py-3 px-8 text-lg rounded-lg" disabled={isLoading} onClick={send}>Send</button>
        </div>
      </div>
    </Container>
  );
};
