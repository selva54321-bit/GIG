-- Migration: Update GigCorpusLedger for growth tracking
ALTER TABLE GigCorpusLedger ADD COLUMN accumulated_returns DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE GigCorpusLedger ADD COLUMN compounding_last_run TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE GigCorpusLedger ADD COLUMN status VARCHAR(20) DEFAULT 'INVESTED'; -- INVESTED, MATURED, WITHDRAWN
