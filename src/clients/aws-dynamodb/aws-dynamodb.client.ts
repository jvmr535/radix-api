import { Injectable } from '@nestjs/common';
import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

@Injectable()
export class AwsDynamoDBClient {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  public async insertItem<T>(tableName: string, item: T): Promise<T> {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: this.formatItem(item),
    });

    try {
      await this.client.send(command);
      return item;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async batchInsertItems<T>(tableName: string, items: T[], chunkSize: number): Promise<T[]> {
    const chunks = this.chunkArray(items, chunkSize);

    const insertedItems: T[] = [];

    for (const chunk of chunks) {
      const putRequests = chunk.map(item => ({
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
        console.error(error);
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

    return 'M';
  }

  private convertValue(value: any): any {
    if (typeof value === 'number') {
      return value.toString();
    }

    return value;
  }
}
