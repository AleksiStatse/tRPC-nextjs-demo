"use client";
import React from "react";
import { trpc } from "./_trpc/client";
import Image from "next/image"

type ChatMessageType = {
  sender: "user" | "server"
  message: string
}

export default function Home() {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [message, setMessage] = React.useState<string>("")
  const [chat, setChat] = React.useState<ChatMessageType[]>([
    {
      sender: "server",
      message: "Please ask a question"
    }
  ]) 
  const containerRef = React.useRef<HTMLDivElement>(null);
  const addTodo = trpc.todo.addEmbedding.useMutation();
  const addPdf = trpc.todo.addPdf.useMutation();

  const scrollToBottom = () => {
    //TODO: Fix server answer not triggering scroll bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  React.useEffect(()=>{
    scrollToBottom()
  }, [chat])

  const sendMessage = async () => {
    if (!message || loading) {
      return;
    }
    setLoading(true)
    const messages = [...chat]
    messages.push({
      sender: "user",
      message
    })
    setChat(messages)
    setMessage("")
    
    const response = await addTodo.mutateAsync(message);
    const serverMessage = response?.content

    if (!serverMessage) {
      throw new Error("Error: No message from server!")
    }

    messages.push({
      sender: "server",
      message: serverMessage
    })

    setLoading(false)
    setChat(messages)
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="drawer drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center relative">
            <div className="flex flex-col w-full gap-4 h-screen pt-8 pb-28 ">
            <div id="chat" ref={containerRef} className="overflow-scroll px-8">
              {chat.map((item, index)=>{
                if (item.sender === "server"){
                  return (
                    <div key={index} className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-red">
                          <Image src="/next.svg" width={100} height={100} alt=""/>
                        </div>
                      </div>
                      <div className="chat-header">
                        {item.sender}
                      </div>
                      <div className="chat-bubble chat-bubble-primary">{item.message}</div>
                    </div>
                  )
                }

                return (
                  <div className="chat chat-end" key={index}>
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <Image src="/vercel.svg" width={100} height={100} alt=""/>
                      </div>
                    </div>
                    <div className="chat-header">
                      {item.sender}
                    </div>
                    <div className="chat-bubble chat-bubble-secondary">{item.message}</div>
                  </div>
                )
              })}
              {loading ?  
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                      <div className="w-10 rounded-full bg-red">
                        <Image src="/next.svg" width={100} height={100} alt=""/>
                      </div>
                    </div>
                  <div className="chat-bubble chat-bubble-primary">
                    <span className="loading loading-dots loading-xs"></span>
                  </div>
                </div> : null}
            </div>
            <div className="mt-auto w-full bg-base-100 bottom-0 left-0 py-4 absolute border-t-2">
              <div className="px-8 flex flex-row gap-2 ">
                <input
                  value={message}
                  placeholder="message..."
                  className="input input-bordered w-full"
                  name="Message"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      sendMessage()
                    }
                  }
                }
                />
                <button
                  className="btn"
                  disabled={loading}
                  onClick={sendMessage}
                >
                  Ask
                </button>
              </div>
            </div>
        </div>
        </div> 
        <div className="drawer-side bg-base-200 p-4">
          <ul className="menu w-80 min-h-fulltext-base-content">
            {/* List uploaded files */}
            <li>File.pdf</li>
          </ul>
          <div className="flex flex-col gap-4">
            <label htmlFor="my-drawer-2" aria-label="close sidebasr" className="drawer-overlay"></label> 
            <input type="file" className="file-input w-full max-w-xs" />
            <button
              className="btn btn-primary"
              onClick={() => {
                const response = addPdf.mutate(null);
              }}
            >
              Add pdf
            </button> 
          </div> 
        </div>
      </div>  
    
    </main>
  );
}



