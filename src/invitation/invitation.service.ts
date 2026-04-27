import { Injectable } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationService {
  create(createInvitationDto: CreateInvitationDto) {
    return { message: 'Invitation created', data: createInvitationDto };
  }

  findAll() {
    return { message: 'List all invitations' };
  }

  findOne(id: string) {
    return { message: `Invitation #${id}` };
  }

  update(id: string, updateInvitationDto: UpdateInvitationDto) {
    return { message: `Invitation #${id} updated`, data: updateInvitationDto };
  }

  remove(id: string) {
    return { message: `Invitation #${id} removed` };
  }
}
