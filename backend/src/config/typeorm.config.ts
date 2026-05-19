import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '..', '..', '.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'filemanager',
  password: process.env.DB_PASSWORD || 'filemanager',
  database: process.env.DB_DATABASE || 'filemanager',
  entities: [join(__dirname, '..', 'modules', '**', 'domain', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
