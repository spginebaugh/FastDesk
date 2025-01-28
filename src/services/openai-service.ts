import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Message {
  content: string;
  role: 'user' | 'worker';
  senderFullName: string;
}

interface GenerateTicketResponseParams {
  ticketTitle: string;
  originalSenderFullName: string;
  currentWorkerFullName?: string;
  ticketContent: string;
  previousMessages: Message[];
}

export const openAIService = {
  async generateTicketResponse({ 
    ticketTitle,
    originalSenderFullName,
    currentWorkerFullName,
    ticketContent,
    previousMessages 
  }: GenerateTicketResponseParams) {
    try {
      // Construct conversation thread
      const conversationThread = previousMessages
        .map(msg => `${msg.senderFullName}\n\n${msg.content}\n\n###\n\n`)
        .join('');

      // Check if the currently logged-in worker has responded before
      const hasCurrentWorkerRespondedBefore = currentWorkerFullName && 
        previousMessages.some(msg => 
          msg.role === 'worker' && 
          msg.senderFullName === currentWorkerFullName // Only match the current worker's name exactly
        );

      const workerContext = hasCurrentWorkerRespondedBefore
        ? `as if you are ${currentWorkerFullName}`
        : 'as if you are a new worker responding for the first time in this thread';

      const lastUserMessage = previousMessages
        .filter(msg => msg.role === 'user')
        .pop()?.content || ticketContent;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful support worker assisting a user named ${originalSenderFullName} on a ticket titled ${ticketTitle}. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone.`
          },
          {
            role: "user",
            content: `Below is the conversation thread so far:\n\n---\n${conversationThread}\n\nPlease draft the next message ${workerContext}. Address ${originalSenderFullName}'s concern about "${lastUserMessage}". Maintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}; 