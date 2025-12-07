---
inclusion: manual
description: Excel import/export patterns using @chronicstone/typed-xlsx and xlsx libraries
---

# Excel Import/Export for Yeko

## Libraries

- **Export**: @chronicstone/typed-xlsx (type-safe)
- **Import**: xlsx (parsing)

## Export Pattern

### Basic Export
```typescript
import { ExcelBuilder } from '@chronicstone/typed-xlsx'

export function exportSchoolsToExcel(schools: School[]) {
  const buffer = ExcelBuilder.create()
    .sheet('Écoles')
    .addTable({
      data: schools,
      columns: [
        { label: 'Nom', value: 'name' },
        { label: 'Code', value: 'code' },
        { label: 'Statut', value: 'status' },
        { label: 'Email', value: 'email' },
        { label: 'Téléphone', value: 'phone' },
        { label: 'Adresse', value: 'address' },
      ],
    })
    .build({ output: 'buffer' })

  return buffer
}
```

### Download in Browser
```typescript
function downloadExcel(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Usage
const buffer = exportSchoolsToExcel(schools)
downloadExcel(buffer, `ecoles_${new Date().toISOString().split('T')[0]}.xlsx`)
```

### Export with Formatting
```typescript
const buffer = ExcelBuilder.create()
  .sheet('Coefficients')
  .addTable({
    data: coefficients,
    columns: [
      { label: 'Matière', value: 'subjectName' },
      { label: 'Classe', value: 'gradeName' },
      { label: 'Série', value: 'seriesName' },
      {
        label: 'Coefficient',
        value: 'weight',
        format: '0', // Number format
      },
    ],
  })
  .build({ output: 'buffer' })
```

## Import Pattern

### Parse Excel File
```typescript
import * as XLSX from 'xlsx'

export async function parseExcelFile<T>(
  file: File,
  columnMapping: Record<string, keyof T>
): Promise<T[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  if (!sheet) throw new Error('No sheet found')
  
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
  
  return rawData.map(row => {
    const mapped: Partial<T> = {}
    for (const [excelCol, fieldName] of Object.entries(columnMapping)) {
      if (row[excelCol] !== undefined) {
        mapped[fieldName] = row[excelCol] as T[keyof T]
      }
    }
    return mapped as T
  })
}
```

### Import with Validation
```typescript
import { z } from 'zod'

const importSchoolSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  email: z.string().email().optional().or(z.literal('')),
})

export async function importSchools(file: File) {
  // Support French and English column names
  const columnMapping = {
    'Nom': 'name',
    'Name': 'name',
    'Code': 'code',
    'Statut': 'status',
    'Status': 'status',
    'Email': 'email',
  }
  
  const rawData = await parseExcelFile(file, columnMapping)
  
  const results = {
    valid: [] as SchoolInput[],
    errors: [] as { row: number; errors: string[] }[],
  }
  
  rawData.forEach((row, index) => {
    const result = importSchoolSchema.safeParse(row)
    if (result.success) {
      results.valid.push(result.data)
    } else {
      results.errors.push({
        row: index + 2, // +2 for header and 0-index
        errors: result.error.errors.map(e => e.message),
      })
    }
  })
  
  return results
}
```

### File Input Component
```typescript
function ExcelImport({ onImport }: { onImport: (data: SchoolInput[]) => void }) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<{ row: number; errors: string[] }[]>([])
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const result = await importSchools(file)
      
      if (result.errors.length > 0) {
        setErrors(result.errors)
        toast.error(t('import.hasErrors', { count: result.errors.length }))
      }
      
      if (result.valid.length > 0) {
        onImport(result.valid)
        toast.success(t('import.success', { count: result.valid.length }))
      }
    } catch (error) {
      toast.error(t('import.failed'))
    }
    
    // Reset input
    e.target.value = ''
  }
  
  return (
    <div>
      <Input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
      {errors.length > 0 && (
        <div className="mt-2 text-sm text-destructive">
          {errors.map(err => (
            <p key={err.row}>
              {t('import.rowError', { row: err.row })}: {err.errors.join(', ')}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Template Generation

```typescript
export function generateImportTemplate() {
  const buffer = ExcelBuilder.create()
    .sheet('Template')
    .addTable({
      data: [
        {
          name: 'École Exemple',
          code: 'EX001',
          status: 'active',
          email: 'contact@ecole.com',
          phone: '+225 00 00 00 00',
        },
      ],
      columns: [
        { label: 'Nom', value: 'name' },
        { label: 'Code', value: 'code' },
        { label: 'Statut', value: 'status' },
        { label: 'Email', value: 'email' },
        { label: 'Téléphone', value: 'phone' },
      ],
    })
    .build({ output: 'buffer' })

  return buffer
}
```

## Server-Side Export

```typescript
export const exportSchools = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    const schools = await getSchools(data)
    const buffer = exportSchoolsToExcel(schools.data)
    
    // Return base64 for client download
    return {
      data: Buffer.from(buffer).toString('base64'),
      filename: `ecoles_${new Date().toISOString().split('T')[0]}.xlsx`,
    }
  })
```
