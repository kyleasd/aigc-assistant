import { create } from "zustand";

export interface Message {
  id: string;
  content: string;
  isLoading: boolean;
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
      isLoading: false,
      timestamp: new Date(),
    },
  ],
  loading: false,
  addMessage: (m: Message) =>
    set((state: State) => {
      // 确保 state.messages 是数组
      const currentMessages = Array.isArray(state.messages) ? state.messages : [];
      return { messages: [...currentMessages, m] };
    }),
  setMessages: (ms: Message[]) => {
    // 确保传入的参数是数组，如果不是则保持当前状态
    return set((state: State) => {
      const currentMessages = Array.isArray(state.messages) ? state.messages : [];
      return { messages: Array.isArray(ms) ? ms : currentMessages };
    });
  },
  setLoading: (v: boolean) => set({ loading: v }),
  clearMessages: () => set({ messages: [] }),
}));
