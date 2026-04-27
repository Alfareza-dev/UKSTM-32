import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client!: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const supabaseUrl = this.configService.getOrThrow<string>(
      'NEXT_PUBLIC_SUPABASE_URL',
    );
    const supabaseKey = this.configService.getOrThrow<string>(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );

    this._client = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized');
  }

  /**
   * Returns the Supabase client instance.
   * Use this in other services/controllers to interact with Supabase.
   */
  get client(): SupabaseClient {
    return this._client;
  }
}
