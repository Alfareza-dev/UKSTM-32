export class CreateEventDto {
  readonly nama_event!: string;
  readonly tanggal!: string;
  readonly lokasi!: string;
  readonly deskripsi?: string;
}
