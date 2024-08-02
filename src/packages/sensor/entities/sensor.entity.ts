import { CreateSensorDto } from "../dto/create-sensor.dto";

export class Sensor {
    EquipmentId: string;
    Timestamp: Date;
    Value: number;

    constructor(sensor: CreateSensorDto) {
        this.EquipmentId = sensor.equipmentId;
        this.Timestamp = sensor.timestamp;
        this.Value = sensor.value;
    }
}
