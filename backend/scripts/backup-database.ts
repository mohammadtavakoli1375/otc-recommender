import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

interface BackupConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): BackupConfig {
  // Parse PostgreSQL URL: postgresql://username:password@host:port/database
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

async function createBackup(config: BackupConfig, outputPath: string): Promise<void> {
  const { host, port, username, password, database } = config;
  
  // Set PGPASSWORD environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: password };
  
  const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -Fc -f "${outputPath}"`;
  
  console.log(`🔄 Creating backup: ${outputPath}`);
  console.log(`📡 Connecting to: ${username}@${host}:${port}/${database}`);
  
  try {
    const { stdout, stderr } = await execAsync(command, { env });
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.warn('⚠️  Backup warnings:', stderr);
    }
    
    if (stdout) {
      console.log('📄 Backup output:', stdout);
    }
    
    // Check if backup file was created and has content
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        console.log(`✅ Backup created successfully: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        throw new Error('Backup file is empty');
      }
    } else {
      throw new Error('Backup file was not created');
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('🚀 Starting database backup...');
    
    // Parse database URL
    const config = parseDatabaseUrl(databaseUrl);
    
    // Create backups directory
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${backupDir}`);
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFileName = `${config.database}_${timestamp}_${Date.now()}.dump`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Create backup
    await createBackup(config, backupPath);
    
    console.log('🎉 Database backup completed successfully!');
    console.log(`📂 Backup location: ${backupPath}`);
    
    // Show restore command
    console.log('\n📋 To restore this backup, use:');
    console.log(`pg_restore -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} --clean --create "${backupPath}"`);
    
  } catch (error) {
    console.error('💥 Backup script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as backupDatabase };