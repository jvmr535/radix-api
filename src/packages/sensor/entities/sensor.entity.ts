import { CreateSensorDto } from "../dto/create-sensor.dto";

export class Sensor {
    EquipmentId: string;
    ActivityId: string;
    Timestamp: Date;
    Value: number;
}
