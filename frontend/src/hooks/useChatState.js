import { useContext } from 'react';
import ChatContext from '../context/ChatContext';

function useChatState() {

const {messages, setMessages} = useContext(ChatContext);


    const addMessage = (message) => {
        const originUserId = message.from;
        setMessages((prevMessages) => {
            const userMessages = prevMessages[originUserId] || [];
            return {
                ...prevMessages,
                [originUserId]: [...userMessages, message]
            };
        });
    }
        

    return {
        messages,
        addMessage
    };
}

export default useChatState;
