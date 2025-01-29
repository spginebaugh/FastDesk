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

async function executeSqlFile(filePath: string, replacements: boolean = false) {
  console.log(`Reading SQL file: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found at path: ${filePath}`)
  }

  let sqlContent = fs.readFileSync(filePath, 'utf8')

  // Replace placeholder values if needed
  if (replacements) {
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
        sqlContent = sqlContent.replace(new RegExp(`\\b${placeholder}\\b`, 'g'), value)
      })
    })
  }

  // Split SQL content into statements, preserving dollar-quoted strings
  const statements: string[] = []
  let currentStatement = ''
  let inDollarQuote = false
  let dollarQuoteTag = ''

  const lines = sqlContent.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      continue
    }

    // Check for dollar quote start/end
    if (!inDollarQuote) {
      const dollarQuoteMatch = trimmedLine.match(/\$\$|\$[a-zA-Z]*\$/g)
      if (dollarQuoteMatch) {
        inDollarQuote = true
        dollarQuoteTag = dollarQuoteMatch[0]
      }
    } else if (trimmedLine.includes(dollarQuoteTag)) {
      inDollarQuote = false
      dollarQuoteTag = ''
    }

    currentStatement += line + '\n'

    // If we're not in a dollar quote and the line ends with a semicolon,
    // we've reached the end of a statement
    if (!inDollarQuote && trimmedLine.endsWith(';')) {
      statements.push(currentStatement.trim())
      currentStatement = ''
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim())
  }

  // Execute each statement
  for (const statement of statements) {
    if (!statement) continue

    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: statement
    })

    if (error) {
      console.error('Error executing SQL statement:', error)
      console.error('Statement:', statement)
      throw error
    }
  }
}

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

    // Step 2: Run the initial SQL seed file
    console.log('Running initial SQL seed...')
    await executeSqlFile(path.join(__dirname, '../seed-initial-data.sql'), true)

    // Step 3: Create TipTap content function
    console.log('Creating TipTap content function...')
    await executeSqlFile(path.join(__dirname, '../functions/create-tiptap-content.sql'), false)

    // Step 4: Run the ticket messages SQL seed file
    console.log('Running ticket messages SQL seed...')
    await executeSqlFile(path.join(__dirname, '../seed-ticket-messages.sql'), true)

    // Step 5: Run the ticket stories SQL seed file
    console.log('Running ticket stories SQL seed...')
    await executeSqlFile(path.join(__dirname, '../seed-ticket-stories.sql'), true)

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