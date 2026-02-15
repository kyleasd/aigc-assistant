import { create } from "zustand";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

type State = {
  messages: Message[];
  loading: boolean;
  addMessage: (m: Message) => void;
  setMessages: (ms: Message[]) => void;
  setLoading: (v: boolean) => void;
  clearMessages: () => void;
};

export const useStore = create<State>((set: any) => ({
  messages: [
    {
      id: "0",
      content: "你好！👋 我是 小爱，有什么我可以帮你的吗？",
      role: "assistant",
      timestamp: new Date(),
    },
  ],
  loading: false,
  addMessage: (m: Message) =>
    set((state: State) => ({ messages: [...state.messages, m] })),
  setMessages: (ms: Message[]) => set({ messages: ms }),
  setLoading: (v: boolean) => set({ loading: v }),
  clearMessages: () => set({ messages: [] }),
}));
