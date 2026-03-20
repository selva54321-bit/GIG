-- PostgreSQL Schema Design for GigShield

CREATE TYPE platform_type AS ENUM ('Zepto', 'Swiggy', 'Zomato', 'Other');
CREATE TYPE policy_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE policy_type AS ENUM ('INCOME_PROTECTION'); -- Only Parametric Income Protection
CREATE TYPE claim_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FRAUD_FLAGGED');
CREATE TYPE trigger_type AS ENUM ('RAIN', 'HEAT', 'AQI', 'CURFEW', 'FLOOD');

CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    platform_id platform_type NOT NULL,
    zone VARCHAR(100) NOT NULL,
    current_gigscore INT NOT NULL DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    type policy_type NOT NULL DEFAULT 'INCOME_PROTECTION',
    premium_amount DECIMAL(10, 2) NOT NULL,
    corpus_contribution DECIMAL(10, 2) NOT NULL, -- 30% of premium
    start_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Monday 00:00
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,   -- Sunday 23:59
    status policy_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES Policies(id) ON DELETE CASCADE,
    trigger_event trigger_type NOT NULL,
    claim_amount DECIMAL(10, 2) NOT NULL,
    status claim_status NOT NULL DEFAULT 'PENDING',
    fraud_score DECIMAL(5, 2), -- ML generated score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GigScoreHistory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    week_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GigCorpusLedger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES Policies(id),
    amount_invested DECIMAL(10, 2) NOT NULL,
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL -- 12 months after investment_date
);

CREATE TABLE FraudLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES Claims(id) ON DELETE CASCADE,
    gps_check_passed BOOLEAN,
    zone_check_passed BOOLEAN,
    velocity_check_passed BOOLEAN,
    graph_check_passed BOOLEAN,
    score_check_passed BOOLEAN,
    final_decision VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
