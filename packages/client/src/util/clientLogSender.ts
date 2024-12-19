import { postLogMessageForPublicRequest, store } from "../model";
import { LogLevel, LogMessage } from "@shared";
import { debounce } from 'lodash';

let pendingMessages: LogMessage[] = [];

export function clientLogSender(message: LogMessage) {
  if (message.level === LogLevel.local) {
    return;
  }
  pendingMessages.push(message);
  sendPendingMessages();
}

const sendPendingMessages = debounce(
  function sendPendingMessagesImpl() {
    const messagesToSend = pendingMessages;
    pendingMessages = [];
    store.dispatch(postLogMessageForPublicRequest(messagesToSend));
  },
  150
);
