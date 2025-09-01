# Dry Run: Basic Data Processing Workflow

This dry run demonstrates the complete data processing workflow from input to output, showing exactly how the application handles real-world scenarios.

## Scenario Overview

**Objective**: Process a batch of user data, validate it, transform it, and store it in the database.

**Input**: CSV file with 1,000 user records
**Expected Output**: Processed and validated user records in database
**Estimated Time**: 30 seconds

## Prerequisites

Before running this example:
- ✅ Application is running locally
- ✅ Database is connected and migrated
- ✅ Sample data file is available
- ✅ API key is configured

## Step-by-Step Execution

### Step 1: Prepare Sample Data

First, let's create a sample CSV file with user data:

```csv
id,name,email,age,department,join_date
1,John Doe,john@example.com,28,Engineering,2023-01-15
2,Jane Smith,jane@example.com,32,Marketing,2023-02-01
3,Bob Johnson,bob@example.com,25,Sales,2023-02-15
4,Alice Brown,alice@example.com,29,Engineering,2023-03-01
5,Charlie Wilson,charlie@example.com,35,HR,2023-03-15
```

Save this as `sample-users.csv` in your project root.

### Step 2: Start the Processing Job

```bash
# Start the dry run
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "source": "sample-users.csv",
    "type": "user_import",
    "options": {
      "validate": true,
      "transform": true,
      "dry_run": true
    }
  }'
```

**Expected Response:**
```json
{
  "job_id": "job_12345",
  "status": "started",
  "message": "Processing job started",
  "estimated_duration": "30s"
}
```

### Step 3: Monitor Progress

Check the job status every few seconds:

```bash
curl http://localhost:3000/api/jobs/job_12345 \
  -H "Authorization: Bearer your-api-key"
```

**Progress Responses:**

*Initial processing (5s):*
```json
{
  "job_id": "job_12345",
  "status": "processing",
  "progress": {
    "current_step": "validation",
    "completed": 200,
    "total": 1000,
    "percentage": 20
  }
}
```

*Mid-processing (15s):*
```json
{
  "job_id": "job_12345",
  "status": "processing",
  "progress": {
    "current_step": "transformation",
    "completed": 650,
    "total": 1000,
    "percentage": 65
  }
}
```

*Final processing (25s):*
```json
{
  "job_id": "job_12345",
  "status": "processing",
  "progress": {
    "current_step": "storage",
    "completed": 950,
    "total": 1000,
    "percentage": 95
  }
}
```

### Step 4: Completion and Results

After ~30 seconds, the job completes:

```json
{
  "job_id": "job_12345",
  "status": "completed",
  "results": {
    "total_records": 1000,
    "processed": 987,
    "failed": 13,
    "validation_errors": 8,
    "transformation_errors": 5,
    "duration": "28.4s"
  },
  "summary": {
    "success_rate": "98.7%",
    "throughput": "35 records/second",
    "memory_peak": "125MB"
  }
}
```

## Detailed Analysis

### Validation Phase (Steps 1-200)

During validation, the system checks:
- ✅ **Email format validation** - 995 valid, 5 invalid
- ✅ **Age range validation** - 998 valid, 2 invalid  
- ✅ **Required fields check** - 999 valid, 1 missing
- ✅ **Date format validation** - 1000 valid

**Failed Records:**
```javascript
// Invalid email examples
{
  id: 156,
  email: "invalid-email",
  error: "Invalid email format"
}

// Age out of range
{
  id: 789,
  age: -5,
  error: "Age must be between 16 and 100"
}
```

### Transformation Phase (Steps 201-650)

The transformation process:

1. **Name normalization** - Convert to proper case
2. **Email lowercase** - Ensure consistent format
3. **Department mapping** - Map to internal department IDs
4. **Date standardization** - Convert to ISO format

```javascript
// Before transformation
{
  name: "john doe",
  email: "JOHN@EXAMPLE.COM",
  department: "Engineering",
  join_date: "2023-01-15"
}

// After transformation
{
  name: "John Doe",
  email: "john@example.com", 
  department_id: "eng_001",
  join_date: "2023-01-15T00:00:00Z"
}
```

### Storage Phase (Steps 651-1000)

Records are stored in batches of 50:

```sql
-- Generated SQL (batch 1)
INSERT INTO users (name, email, age, department_id, join_date)
VALUES 
  ('John Doe', 'john@example.com', 28, 'eng_001', '2023-01-15T00:00:00Z'),
  ('Jane Smith', 'jane@example.com', 32, 'mkt_001', '2023-02-01T00:00:00Z'),
  -- ... 48 more records
```

## Performance Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|---------|
| **Processing Time** | 28.4s | <30s | ✅ Pass |
| **Memory Usage** | 125MB | <200MB | ✅ Pass |
| **Success Rate** | 98.7% | >95% | ✅ Pass |
| **Throughput** | 35 rec/s | >30 rec/s | ✅ Pass |

## Error Analysis

### Validation Errors (8 records)
- **Invalid email format**: 5 records
- **Age out of range**: 2 records  
- **Missing required field**: 1 record

### Transformation Errors (5 records)
- **Department mapping failed**: 3 records
- **Date parsing failed**: 2 records

> **Note:** Failed records are logged to `logs/failed_records.json` for manual review.

## Verification Steps

After completion, verify the results:

```bash
# Check database record count
curl http://localhost:3000/api/users/count \
  -H "Authorization: Bearer your-api-key"

# Expected response: {"count": 987}
```

```bash
# Sample a few records
curl http://localhost:3000/api/users?limit=3 \
  -H "Authorization: Bearer your-api-key"
```

## Cleanup

```bash
# Remove test data (optional)
curl -X DELETE http://localhost:3000/api/test-data \
  -H "Authorization: Bearer your-api-key"
```

## Key Takeaways

✅ **High Success Rate** - 98.7% of records processed successfully
✅ **Good Performance** - Met all performance targets
✅ **Proper Error Handling** - Failed records logged for review
✅ **Scalable Process** - Can handle larger datasets

## Next Steps

- Try [Example 2: Advanced Integration](example-2.md) for more complex scenarios
- Review [API Documentation](../api/endpoints.md) for detailed endpoint information
- Check [Troubleshooting Guide](../troubleshooting.md) if you encounter issues

---

> **Tip:** Run this dry run with different data sizes to test scalability: 100 records, 10K records, 100K records.