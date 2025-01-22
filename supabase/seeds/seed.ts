import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
import { TEST_USERS } from './seed-config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: '.env.development' })

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function seedDatabase() {
  try {
    console.log('Starting database seed...')

    // Step 1: Create auth users with specific UUIDs
    console.log('Creating auth users...')
    for (const user of TEST_USERS) {
      const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          user_type: user.user_type
        },
        id: user.id
      })

      if (createUserError) {
        console.error(`Error creating user ${user.email}:`, createUserError)
        continue
      }

      console.log(`Created user ${user.email} with ID ${user.id} successfully`)
    }

    // Step 2: Run the SQL seed file
    console.log('Running SQL seed...')
    const sqlSeedPath = path.join(__dirname, '../seed.sql.template')
    
    console.log('Looking for SQL file at:', sqlSeedPath)
    
    if (!fs.existsSync(sqlSeedPath)) {
      throw new Error(`seed.sql.template not found at path: ${sqlSeedPath}`)
    }

    let sqlSeed = fs.readFileSync(sqlSeedPath, 'utf8')

    // Replace placeholder values in SQL with exact values from config
    TEST_USERS.forEach((user, index) => {
      const placeholderIndex = index + 1
      const replacements = {
        [`USER_ID_${placeholderIndex}`]: user.id,
        [`USER_EMAIL_${placeholderIndex}`]: user.email,
        [`USER_FULL_NAME_${placeholderIndex}`]: user.full_name,
        [`USER_TYPE_${placeholderIndex}`]: user.user_type
      }

      Object.entries(replacements).forEach(([placeholder, value]) => {
        // Use word boundaries to prevent partial matches
        sqlSeed = sqlSeed.replace(new RegExp(`\\b${placeholder}\\b`, 'g'), value)
      })
    })

    // Split and execute SQL statements
    const statements = sqlSeed
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: statement
      })

      if (error) {
        console.error('Error executing SQL statement:', error)
        console.error('Statement:', statement)
        throw error
      }
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    // Clean up Supabase connection
    await supabaseAdmin.auth.signOut()
  }
}

// Run the seed script
seedDatabase()