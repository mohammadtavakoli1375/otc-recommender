import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// SQLite client for reading data
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL client for writing data (uses DATABASE_URL from env)
const postgresClient = new PrismaClient();

interface MigrationStats {
  tableName: string;
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  errors: string[];
}

const BATCH_SIZE = 500;

async function backupSQLiteDatabase() {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `sqlite-backup-${timestamp}.db`);
  const originalPath = path.join(__dirname, '../prisma/dev.db');
  
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log(`✅ SQLite backup created: ${backupPath}`);
  } else {
    console.log('⚠️  SQLite database file not found, skipping backup');
  }
}

async function migrateTable<T extends Record<string, any>>(
  tableName: string,
  fetchData: () => Promise<T[]>,
  insertData: (data: T[], tx: any) => Promise<void>
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    tableName,
    totalRecords: 0,
    migratedRecords: 0,
    failedRecords: 0,
    errors: []
  };

  try {
    console.log(`🔄 Migrating ${tableName}...`);
    const data = await fetchData();
    stats.totalRecords = data.length;

    if (data.length === 0) {
      console.log(`ℹ️  No records found in ${tableName}`);
      return stats;
    }

    // Process in batches
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      try {
        await postgresClient.$transaction(async (tx) => {
          await insertData(batch, tx);
        });
        
        stats.migratedRecords += batch.length;
        console.log(`  ✅ Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records`);
      } catch (error) {
        stats.failedRecords += batch.length;
        const errorMsg = `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`;
        stats.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }

    console.log(`✅ ${tableName} migration completed: ${stats.migratedRecords}/${stats.totalRecords} records migrated`);
  } catch (error) {
    stats.errors.push(`Failed to fetch data: ${error.message}`);
    console.error(`❌ Failed to migrate ${tableName}: ${error.message}`);
  }

  return stats;
}

async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...');
  
  // Create backup first
  await backupSQLiteDatabase();
  
  const allStats: MigrationStats[] = [];
  
  try {
    // Connect to both databases
    await sqliteClient.$connect();
    await postgresClient.$connect();
    
    console.log('✅ Connected to both databases');
    
    // Migration order (respecting foreign key constraints)
    
    // 1. Users (no dependencies)
    allStats.push(await migrateTable(
      'Users',
      () => sqliteClient.user.findMany(),
      async (users, tx) => {
        for (const user of users) {
          await tx.user.create({ data: user });
        }
      }
    ));
    
    // 2. Drugs (no dependencies)
    allStats.push(await migrateTable(
      'Drugs',
      () => sqliteClient.drug.findMany(),
      async (drugs, tx) => {
        for (const drug of drugs) {
          await tx.drug.create({ data: drug });
        }
      }
    ));
    
    // 3. PatientProfiles (depends on Users)
    allStats.push(await migrateTable(
      'PatientProfiles',
      () => sqliteClient.patientProfile.findMany(),
      async (profiles, tx) => {
        for (const profile of profiles) {
          await tx.patientProfile.create({ data: profile });
        }
      }
    ));
    
    // 4. MedicalHistory (depends on PatientProfiles)
    allStats.push(await migrateTable(
      'MedicalHistory',
      () => sqliteClient.medicalHistory.findMany(),
      async (histories, tx) => {
        for (const history of histories) {
          await tx.medicalHistory.create({ data: history });
        }
      }
    ));
    
    // 5. MedicationHistory (depends on PatientProfiles and Drugs)
    allStats.push(await migrateTable(
      'MedicationHistory',
      () => sqliteClient.medicationHistory.findMany(),
      async (medications, tx) => {
        for (const medication of medications) {
          await tx.medicationHistory.create({ data: medication });
        }
      }
    ));
    
    // 6. Reminders (depends on PatientProfiles and MedicationHistory)
    allStats.push(await migrateTable(
      'Reminders',
      () => sqliteClient.reminder.findMany(),
      async (reminders, tx) => {
        for (const reminder of reminders) {
          await tx.reminder.create({ data: reminder });
        }
      }
    ));
    
    // 7. DoseCalculations (depends on Users and Drugs)
    allStats.push(await migrateTable(
      'DoseCalculations',
      () => sqliteClient.doseCalculation.findMany(),
      async (calculations, tx) => {
        for (const calculation of calculations) {
          await tx.doseCalculation.create({ data: calculation });
        }
      }
    ));
    
    // 8. EducationalContent (no dependencies)
    allStats.push(await migrateTable(
      'EducationalContent',
      () => sqliteClient.educationalContent.findMany(),
      async (contents, tx) => {
        for (const content of contents) {
          await tx.educationalContent.create({ data: content });
        }
      }
    ));
    
    // 9. FAQ (no dependencies)
    allStats.push(await migrateTable(
      'FAQ',
      () => sqliteClient.fAQ.findMany(),
      async (faqs, tx) => {
        for (const faq of faqs) {
          await tx.fAQ.create({ data: faq });
        }
      }
    ));
    
    // Print final report
    console.log('\n📊 Migration Summary:');
    console.log('=' .repeat(60));
    
    let totalRecords = 0;
    let totalMigrated = 0;
    let totalFailed = 0;
    
    for (const stat of allStats) {
      totalRecords += stat.totalRecords;
      totalMigrated += stat.migratedRecords;
      totalFailed += stat.failedRecords;
      
      const status = stat.failedRecords === 0 ? '✅' : '⚠️';
      console.log(`${status} ${stat.tableName.padEnd(20)} | Total: ${stat.totalRecords.toString().padStart(5)} | Migrated: ${stat.migratedRecords.toString().padStart(5)} | Failed: ${stat.failedRecords.toString().padStart(5)}`);
      
      if (stat.errors.length > 0) {
        stat.errors.forEach(error => console.log(`    ❌ ${error}`));
      }
    }
    
    console.log('=' .repeat(60));
    console.log(`📈 Overall: ${totalMigrated}/${totalRecords} records migrated successfully`);
    
    if (totalFailed === 0) {
      console.log('🎉 Migration completed successfully with no errors!');
    } else {
      console.log(`⚠️  Migration completed with ${totalFailed} failed records. Please review the errors above.`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { main as migrateSQLiteToPostgres };