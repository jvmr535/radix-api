import { Injectable } from '@nestjs/common';
import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';

@Injectable()
export class AwsDynamoDBClient {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  public async queryItems<T>(params: QueryCommandInput): Promise<T[]> {
    try {
      const command = new QueryCommand(params);

      const { Items } = await this.client.send(command);

      if (Items.length === 0) {
        return null;
      }

      const data = Items.map((item) => this.parseDynamoDBItem(item));

      return data;
    } catch (error) {
      throw error;
    }
  }

  public async insertItem(tableName: string, item: any) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: this.formatItem(item),
    });

    try {
      await this.client.send(command);
      return item;
    } catch (error) {
      throw error;
    }
  }

  public async batchInsertItems<T>(
    tableName: string,
    items: T[],
    chunkSize: number,
  ): Promise<T[]> {
    const chunks = this.chunkArray(items, chunkSize);

    const insertedItems: T[] = [];

    for (const chunk of chunks) {
      const putRequests = chunk.map((item) => ({
        PutRequest: {
          Item: this.formatItem(item),
        },
      }));

      const params = {
        RequestItems: {
          [tableName]: putRequests,
        },
      };

      try {
        await this.client.send(new BatchWriteItemCommand(params));
        insertedItems.push(...chunk);
      } catch (error) {
        throw error;
      }
    }

    return insertedItems;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }

  private formatItem<T>(item: T): Record<string, any> {
    const formattedItem: Record<string, any> = {};

    for (const [key, value] of Object.entries(item)) {
      if (value === undefined) {
        continue;
      }

      formattedItem[key] = {
        [this.getType(value)]: this.convertValue(value),
      };
    }

    return formattedItem;
  }

  private getType(value: any): string {
    if (typeof value === 'string') {
      return 'S';
    }

    if (typeof value === 'number') {
      return 'N';
    }

    if (typeof value === 'boolean') {
      return 'BOOL';
    }

    if (Array.isArray(value)) {
      return 'L';
    }

    return 'S';
  }

  private convertValue(value: any): any {
    if (typeof value === 'number') {
      return value.toString();
    }

    return value;
  }

  private parseDynamoDBItem(item: { [key: string]: any }): any {
    const parsedItem: { [key: string]: any } = {};

    const attributeHandlers: { [type: string]: (value: any) => any } = {
      S: (value) => value,
      SS: (value) => value,
      N: (value) => Number(value),
      NS: (value) => value.map(Number),
      B: (value) => value,
      BS: (value) => value,
      BOOL: (value) => value,
      L: (value) =>
        value.map((element: any) => this.parseDynamoDBItem(element)),
      M: (value) => this.parseDynamoDBItem(value),
    };

    for (const key in item) {
      const value = item[key];

      const handler = Object.keys(value).find(
        (type) => attributeHandlers[type],
      );
      if (handler) {
        parsedItem[key] = attributeHandlers[handler](value[handler]);
      }
    }

    return parsedItem;
  }
}
