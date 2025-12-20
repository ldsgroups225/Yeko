import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface FeeType {
  id: string
  code: string
  name: string
  category: string
  isMandatory: boolean
  isRecurring: boolean
  status: string
}

interface FeeTypesTableProps {
  feeTypes: FeeType[]
  isLoading?: boolean
  onEdit?: (feeType: FeeType) => void
  onDelete?: (feeType: FeeType) => void
}

export function FeeTypesTable({
  feeTypes,
  isLoading = false,
  onEdit,
  onDelete,
}: FeeTypesTableProps) {
  const t = useTranslations()

  const getCategoryLabel = (category: string) => {
    const categoryTranslations = {
      tuition: t.finance.feeCategories.tuition,
      registration: t.finance.feeCategories.registration,
      exam: t.finance.feeCategories.exam,
      transport: t.finance.feeCategories.transport,
      uniform: t.finance.feeCategories.uniform,
      books: t.finance.feeCategories.books,
      meals: t.finance.feeCategories.meals,
      activities: t.finance.feeCategories.activities,
      other: t.finance.feeCategories.other,
    }
    return categoryTranslations[category as keyof typeof categoryTranslations]()
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (feeTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t.finance.feeTypes.noFeeTypes()}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.finance.feeTypes.code()}</TableHead>
          <TableHead>{t.common.name()}</TableHead>
          <TableHead>{t.finance.feeTypes.category()}</TableHead>
          <TableHead>{t.common.status()}</TableHead>
          <TableHead className="text-right">{t.common.actions()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feeTypes.map(feeType => (
          <TableRow key={feeType.id}>
            <TableCell className="font-mono text-sm">{feeType.code}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{feeType.name}</div>
                <div className="flex gap-1 mt-1">
                  {feeType.isMandatory && (
                    <Badge variant="outline" className="text-xs">
                      Obligatoire
                    </Badge>
                  )}
                  {feeType.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      Récurrent
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{getCategoryLabel(feeType.category)}</TableCell>
            <TableCell>
              <Badge variant={feeType.status === 'active' ? 'default' : 'secondary'}>
                {feeType.status === 'active' ? t.common.active() : t.common.inactive()}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t.common.actions()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(feeType)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t.common.edit()}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(feeType)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
