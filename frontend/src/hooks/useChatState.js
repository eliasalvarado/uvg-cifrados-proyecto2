import { useState } from 'react';

function useChatState() {
  
    const [messages, setMessages] = useState([]); // [ id: [{}]]

    return {
        messages
    };
}

export default useChatState;
