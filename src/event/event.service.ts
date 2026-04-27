import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  create(createEventDto: CreateEventDto) {
    return { message: 'Event created', data: createEventDto };
  }

  findAll() {
    return { message: 'List all events' };
  }

  findOne(id: string) {
    return { message: `Event #${id}` };
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return { message: `Event #${id} updated`, data: updateEventDto };
  }

  remove(id: string) {
    return { message: `Event #${id} removed` };
  }
}
