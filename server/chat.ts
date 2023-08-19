import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { decrypt, encrypt } from './crypto.js';

const normalMessage = z.object({
  role: z.string(),
  content: z.string()
});

const chatMessage = z.union([
  z.object({
    role: z.string(),
    content: z.null(),
    function_call: z.object({
      name: z.string(),
      arguments: z.string()
    })
  }),
  z.object({
    role: z.literal("function"),
    content: z.string(),
    name: z.string()
  }),
  normalMessage,
])

const chatResponse = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: chatMessage
  })),
  usage: z.unknown()
})

type ChatMessage = z.TypeOf<typeof chatMessage>;
type NormalMessage = z.TypeOf<typeof normalMessage>;

let openaikey: string | undefined;

export function setOpenAiKey(v: string) {
  openaikey = v;
}

export class Chat {
  constructor(
    private messages: ChatMessage[],
    private functions: { [key: string]: { description: string, parameters: z.ZodTypeAny, callback: (arg: any) => Promise<any> } }
  ) {
  }

  public static create(content: string): Chat {
    return new Chat([{ role: "system", content }], {});
  }

  public static async decrypt(chat: string): Promise<Chat> {
    const messagesStr = await decrypt(chat);
    const messages = z.array(chatMessage).parse(JSON.parse(messagesStr));
    return new Chat(messages, {});
  }

  public encrypt(): Promise<string> {
    const messages = JSON.stringify(this.messages);
    return encrypt(messages);
  }

  private getFunctions(): any[] {
    return Array.from(Object.entries(this.functions))
      .map(([name, { description, parameters }]) => ({ name, description, parameters: zodToJsonSchema(parameters) }))
  }

  public withFunction<T>(name: string, description: string, parameters: z.ZodType<T>, callback: (arg: T) => Promise<any>) {
    return new Chat(this.messages, {
      ...this.functions,
      [name]: { description, parameters, callback }
    })
  }

  public async send(next: ChatMessage): Promise<[NormalMessage, Chat]> {
    if (this.messages.length >= 100) {
      throw new Error("This chat has reached more than 100 messages. Limit reached.")
    }

    if (!openaikey) {
      throw new Error("Could not find openai key");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0613",
        functions: this.getFunctions(),
        messages: [...this.messages, next]
      }),
      method: "POST",
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${openaikey}`
      }
    });

    const untyped = await response.json();

    console.log(untyped);

    const json = chatResponse.parse(untyped);


    const { message } = json.choices[0];

    if (!message) {
      throw new Error("No messages in response!");
    }

    const chat = new Chat([...this.messages, next, message], this.functions);

    if ("function_call" in message) {
      const { name, arguments: args } = message.function_call;

      const f = this.functions[name];

      if (!f) {
        return await new Chat([...this.messages, next, message], this.functions).send({ role: "system", content: `Function ${name} does not exist` });
      }

      try {
        console.log("Calling function", name, "with args", args);

        const x = JSON.parse(args);
        const y = f.parameters.parse(x);

        const result = await f.callback(y);

        return await chat.send({ role: "function", name, content: JSON.stringify(result) })
      } catch (e) {
        console.error("Failed to call function " + name + ":", e);

        return await chat.send({ role: "system", content: `Failed to call function, please try again with valid input. Error: ${e}` });
      }
    } else {
      return [
        message,
        chat
      ]
    }
  }
}
