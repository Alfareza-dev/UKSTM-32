import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return { message: 'Admin created', data: createAdminDto };
  }

  findAll() {
    return { message: 'List all admins' };
  }

  findOne(id: string) {
    return { message: `Admin #${id}` };
  }

  update(id: string, updateAdminDto: UpdateAdminDto) {
    return { message: `Admin #${id} updated`, data: updateAdminDto };
  }

  remove(id: string) {
    return { message: `Admin #${id} removed` };
  }
}
