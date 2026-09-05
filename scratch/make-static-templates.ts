import { generateTemplate, generateCsvTemplate } from '../lib/excel.ts'
import fs from 'fs'

fs.writeFileSync('public/CIOS-Result-Import-Template.xlsx', generateTemplate())
fs.writeFileSync('public/CIOS-Result-Import-Template.csv', generateCsvTemplate())
fs.writeFileSync('public/students_results_import_template.csv', generateCsvTemplate())

console.log('✅ Created static templates in public folder!')
