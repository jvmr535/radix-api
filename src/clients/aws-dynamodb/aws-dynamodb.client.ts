import { Injectable } from '@nestjs/common';
import {
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
    console.log('item', item)

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
