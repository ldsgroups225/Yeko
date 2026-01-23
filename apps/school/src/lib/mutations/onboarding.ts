import { importSmartTemplate as importSmartTemplateQuery } from "@repo/data-ops/queries/onboarding";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSchoolContext } from "@/school/middleware/school-context";

export const importSmartTemplate = createServerFn()
  .inputValidator(z.void())
  .handler(async () => {
    const context = await getSchoolContext();
    if (!context) throw new Error("No school context");

    return await importSmartTemplateQuery(context.schoolId);
  });
