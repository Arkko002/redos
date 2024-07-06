import { INotifier, ISubscriber } from "../..";

// NOTE: https://redis.io/docs/latest/develop/data-types/streams/#consumer-groups
// TODO: Types and interfaces
// TODO: XINFO
export class ConsumerGroup {
  private name: string;
  private streamKey: string;
  private lastDeliveredId: string;

  private unprocessedMessages: any[];
  private consumers: Consumer[];

  // TODO: If firstIdToProcess === undefined -> subscribe to stream else start processing entries from lastEntryId and then follow
  public constructor(
    name: string,
    streamKey: string,
    firstIdToProcess?: string,
  ) {
    this.name = name;
    this.streamKey = streamKey;
    this.lastDeliveredId = "";
    this.unprocessedMessages = [];
    this.consumers = [];
  }

  public addConsumer(consumer: Consumer): void {
    this.consumers.push(consumer);
  }
  public removeConsumer(consumer: Consumer): void {}

  // TODO: Messages should be assigned to consumers in a round-robin fashion during processing, and then tracked to make sure they are processed
  // TODO: XREADGROUP has consumer group name and consumer name in it
  public processMessages(): void {
    this.unprocessedMessages.forEach((message: any, index: number) => {});
  }
}

export class Consumer {
  public name: string;
  // TODO: XPENDING, XCLAIM, XACK, XAUTOCLAIM
  public pendingMessages: ConsumerMessage[];

  public constructor(name: string) {
    this.name = name;
    this.pendingMessages = [];
  }

  public notify(message: any): boolean {
    // TODO: Send consumer a message
    // TODO: Wait for ACK
    return false;
  }
}

class ConsumerMessage {
  private message: any;
  public consumer: Consumer;
  public state: MessageState;
  // TODO: Dead letter mechanism
  public deliveriesCount: number;

  public constructor(message: any, consumer: Consumer) {
    this.message = message;
    this.consumer = consumer;
    this.state = MessageState.NEW;
    this.deliveriesCount = 0;
  }

  public setProcessed(): void {
    this.state = MessageState.PROCESSED;
  }

  public deliver(): void {
    this.state = MessageState.PENDING;
    // TODO: Send message to consumer
    this.deliveriesCount++;
  }
}

enum MessageState {
  NEW,
  PENDING,
  PROCESSED,
}
