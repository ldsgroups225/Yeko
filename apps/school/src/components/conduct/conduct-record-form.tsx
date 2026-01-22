import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconAlertCircle,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconTag,
  IconTypography,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StudentCombobox } from "@/components/attendance/student/student-combobox";
import { useTranslations } from "@/i18n";

const conductTypes = ["incident", "sanction", "reward", "note"] as const;
const conductCategories = [
  "behavior",
  "academic",
  "attendance",
  "uniform",
  "property",
  "violence",
  "bullying",
  "cheating",
  "achievement",
  "improvement",
  "other",
] as const;
const severityLevels = ["low", "medium", "high", "critical"] as const;

const conductRecordFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  type: z.enum(conductTypes),
  category: z.enum(conductCategories),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  severity: z.enum(severityLevels).optional(),
  incidentDate: z.date().optional(),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  witnesses: z.string().optional(),
});

type ConductRecordFormData = z.infer<typeof conductRecordFormSchema>;

interface ConductRecordFormProps {
  studentId?: string;
  defaultType?: (typeof conductTypes)[number];
  onSubmit: (data: ConductRecordFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ConductRecordForm({
  studentId: initialStudentId,
  defaultType = "incident",
  onSubmit,
  onCancel,
  isSubmitting,
}: ConductRecordFormProps) {
  const t = useTranslations();

  const form = useForm<ConductRecordFormData>({
    resolver: zodResolver(conductRecordFormSchema),
    defaultValues: {
      studentId: initialStudentId ?? "",
      type: defaultType,
      category: "behavior",
      title: "",
      description: "",
    },
  });

  const watchType = form.watch("type");
  const showSeverity = watchType === "incident" || watchType === "sanction";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {!initialStudentId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconUsers className="size-3.5" />
            {t.conduct.student()}
          </Label>
          <StudentCombobox
            value={form.watch("studentId")}
            onSelect={(id) => form.setValue("studentId", id)}
          />
          {form.formState.errors.studentId && (
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">
              {form.formState.errors.studentId.message}
            </p>
          )}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <Type className="size-3.5" />
            {t.conduct.form.type()}
          </Label>
          <Select
            value={form.watch("type")}
            onValueChange={(v) =>
              form.setValue("type", v as (typeof conductTypes)[number])
            }
          >
            <SelectTrigger className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              {conductTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3"
                >
                  {t.conduct.type[type]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconTag className="size-3.5" />
            {t.conduct.form.category()}
          </Label>
          <Select
            value={form.watch("category")}
            onValueChange={(v) =>
              form.setValue("category", v as (typeof conductCategories)[number])
            }
          >
            <SelectTrigger className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40 overflow-y-auto max-h-[300px]">
              {conductCategories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3"
                >
                  {t.conduct.category[cat]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          <Type className="size-3.5" />
          {t.conduct.form.title()}
        </Label>
        <Input
          id="title"
          {...form.register("title")}
          className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold"
          placeholder={t.conduct.form.title()}
        />
        {form.formState.errors.title && (
          <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          <IconTag className="size-3.5" />
          {t.conduct.form.description()}
        </Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all min-h-[120px] font-medium italic"
          placeholder={t.conduct.form.description()}
        />
        {form.formState.errors.description && (
          <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </motion.div>

      {showSeverity && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 overflow-hidden"
        >
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconAlertCircle className="size-3.5" />
            {t.conduct.form.severity()}
          </Label>
          <Select
            value={form.watch("severity") ?? ""}
            onValueChange={(v) =>
              form.setValue("severity", v as (typeof severityLevels)[number])
            }
          >
            <SelectTrigger className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all text-destructive font-black">
              <SelectValue placeholder={t.conduct.form.selectSeverity()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              {severityLevels.map((level) => (
                <SelectItem
                  key={level}
                  value={level}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3 text-destructive"
                >
                  {t.conduct.severity[level]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconCalendar className="size-3.5" />
            {t.conduct.form.incidentDate()}
          </Label>
          <DatePicker
            date={form.watch("incidentDate")}
            onSelect={(d) => form.setValue("incidentDate", d)}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 hover:bg-card/70 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconClock className="size-3.5" />
            {t.conduct.form.incidentTime()}
          </Label>
          <Input
            id="incidentTime"
            type="time"
            {...form.register("incidentTime")}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconMapPin className="size-3.5" />
            {t.conduct.form.location()}
          </Label>
          <Input
            id="location"
            {...form.register("location")}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
            placeholder={t.conduct.form.location()}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          <IconUsers className="size-3.5" />
          {t.conduct.form.witnesses()}
        </Label>
        <Input
          id="witnesses"
          {...form.register("witnesses")}
          className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
          placeholder={t.conduct.form.witnessesPlaceholder()}
        />
      </motion.div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-2xl border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 h-12 px-8 transition-all"
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] h-12 px-10 transition-all hover:scale-105 active:scale-95"
        >
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  );
}
