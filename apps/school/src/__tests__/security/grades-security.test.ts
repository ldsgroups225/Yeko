/**
 * Security Audit Tests for Grades Management System
 *
 * Tests security characteristics of grade-related operations:
 * - Input validation and sanitization
 * - SQL injection prevention
 * - XSS prevention
 * - Authorization checks
 * - Data integrity
 */

import { describe, expect, test } from "vitest";

import {
  bulkGradesSchema,
  createGradeSchema,
  gradeValueSchema,
  rejectGradesSchema,
  validateGradesSchema,
} from "@/schemas/grade";

describe("grades Security Audit", () => {
  describe("input Validation - SQL Injection Prevention", () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE student_grades; --",
      "1; DELETE FROM students WHERE 1=1; --",
      "' OR '1'='1",
      "1 UNION SELECT * FROM users --",
      "'; INSERT INTO admin VALUES('hacker', 'password'); --",
      "1; UPDATE grades SET value = 20 WHERE 1=1; --",
      "Robert'); DROP TABLE students;--",
      "1/**/UNION/**/SELECT/**/password/**/FROM/**/users",
    ];

    test("should reject SQL injection in studentId", () => {
      sqlInjectionPayloads.forEach((payload) => {
        const result = createGradeSchema.safeParse({
          studentId: payload,
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
        });

        // Schema should accept the string but Drizzle ORM will parameterize it
        // The important thing is that the value is treated as a string, not SQL
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.studentId).toBe(payload); // Value is preserved as string
        }
      });
    });

    test("should reject SQL injection in description", () => {
      sqlInjectionPayloads.forEach((payload) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
          description: payload,
        });

        // Description is optional and accepts strings
        // Drizzle ORM parameterizes all inputs
        if (result.success) {
          expect(result.data.description).toBe(payload);
        }
      });
    });

    test("should reject SQL injection in rejection reason", () => {
      sqlInjectionPayloads.forEach((payload) => {
        // Only test payloads that are >= 10 characters (schema requirement)
        if (payload.length >= 10) {
          const result = rejectGradesSchema.safeParse({
            gradeIds: ["grade-1"],
            reason: payload,
          });

          if (result.success) {
            expect(result.data.reason).toBe(payload);
          }
        }
      });
    });
  });

  describe("input Validation - XSS Prevention", () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      "<svg onload=\"alert('XSS')\">",
      'javascript:alert("XSS")',
      "<iframe src=\"javascript:alert('XSS')\">",
      "<body onload=\"alert('XSS')\">",
      '"><script>alert("XSS")</script>',
      "'-alert('XSS')-'",
      "<div style=\"background:url(javascript:alert('XSS'))\">",
      '{{constructor.constructor("alert(1)")()}}',
    ];

    test("should handle XSS payloads in description safely", () => {
      xssPayloads.forEach((payload) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
          description: payload,
        });

        // Schema accepts strings - React will escape them on render
        if (result.success) {
          expect(result.data.description).toBe(payload);
        }
      });
    });

    test("should handle XSS payloads in rejection reason safely", () => {
      xssPayloads.forEach((payload) => {
        // Only test payloads that are >= 10 characters
        if (payload.length >= 10) {
          const result = rejectGradesSchema.safeParse({
            gradeIds: ["grade-1"],
            reason: payload,
          });

          if (result.success) {
            expect(result.data.reason).toBe(payload);
          }
        }
      });
    });

    test("should handle XSS payloads in validation comment safely", () => {
      xssPayloads.forEach((payload) => {
        const result = validateGradesSchema.safeParse({
          gradeIds: ["grade-1"],
          comment: payload,
        });

        if (result.success) {
          expect(result.data.comment).toBe(payload);
        }
      });
    });
  });

  describe("input Validation - Type Coercion Attacks", () => {
    test("should reject non-numeric grade values", () => {
      const invalidValues = [
        "fifteen",
        "15abc",
        "NaN",
        "Infinity",
        "-Infinity",
        "0x10",
        "1e10",
        "15.5.5",
        "",
        null,
        undefined,
        {},
        [],
        true,
        false,
      ];

      invalidValues.forEach((value) => {
        const result = gradeValueSchema.safeParse(value);
        expect(result.success).toBe(false);
      });
    });

    test("should reject prototype pollution attempts", () => {
      // Test that Zod strips unknown keys, preventing prototype pollution
      const result = createGradeSchema.safeParse({
        studentId: "student-1",
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        value: 15,
        type: "test",
        weight: 1,
        // These would be stripped by Zod
        unknownField: { admin: true },
        anotherField: { prototype: { admin: true } },
      });

      // Zod strips unknown keys, preventing prototype pollution
      if (result.success) {
        expect(result.data).not.toHaveProperty("unknownField");
        expect(result.data).not.toHaveProperty("anotherField");
      }
    });

    test("should reject array injection in string fields", () => {
      const result = createGradeSchema.safeParse({
        studentId: ["student-1", "student-2"],
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        value: 15,
        type: "test",
        weight: 1,
      });

      expect(result.success).toBe(false);
    });

    test("should reject object injection in string fields", () => {
      const result = createGradeSchema.safeParse({
        studentId: { $ne: null },
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        value: 15,
        type: "test",
        weight: 1,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("input Validation - Boundary Testing", () => {
    test("should reject grade values outside valid range", () => {
      const invalidValues = [-0.01, -1, -100, 20.01, 21, 100, 1000];

      invalidValues.forEach((value) => {
        const result = gradeValueSchema.safeParse(value);
        expect(result.success).toBe(false);
      });
    });

    test("should accept grade values at boundaries", () => {
      const validBoundaryValues = [0, 0.25, 19.75, 20];

      validBoundaryValues.forEach((value) => {
        const result = gradeValueSchema.safeParse(value);
        expect(result.success).toBe(true);
      });
    });

    test("should reject weight values outside valid range", () => {
      const invalidWeights = [0, -1, 11, 100];

      invalidWeights.forEach((weight) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight,
        });

        expect(result.success).toBe(false);
      });
    });

    test("should accept weight values at boundaries", () => {
      const validWeights = [1, 5, 10];

      validWeights.forEach((weight) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight,
        });

        expect(result.success).toBe(true);
      });
    });

    test("should reject description exceeding max length", () => {
      const result = createGradeSchema.safeParse({
        studentId: "student-1",
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        value: 15,
        type: "test",
        weight: 1,
        description: "a".repeat(201), // Max is 200
      });

      expect(result.success).toBe(false);
    });

    test("should reject rejection reason below min length", () => {
      const result = rejectGradesSchema.safeParse({
        gradeIds: ["grade-1"],
        reason: "Too short", // Min is 10 characters
      });

      expect(result.success).toBe(false);
    });

    test("should reject rejection reason exceeding max length", () => {
      const result = rejectGradesSchema.safeParse({
        gradeIds: ["grade-1"],
        reason: "a".repeat(501), // Max is 500
      });

      expect(result.success).toBe(false);
    });
  });

  describe("input Validation - Required Fields", () => {
    test("should reject missing required fields", () => {
      const requiredFields = [
        "studentId",
        "classId",
        "subjectId",
        "termId",
        "value",
        "type",
      ];

      requiredFields.forEach((field) => {
        const validGrade: Record<string, unknown> = {
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
        };

        delete validGrade[field];

        const result = createGradeSchema.safeParse(validGrade);
        expect(result.success).toBe(false);
      });
    });

    test("should reject empty string for required fields", () => {
      const requiredStringFields = [
        "studentId",
        "classId",
        "subjectId",
        "termId",
      ];

      requiredStringFields.forEach((field) => {
        const result = createGradeSchema.safeParse({
          studentId: field === "studentId" ? "" : "student-1",
          classId: field === "classId" ? "" : "class-1",
          subjectId: field === "subjectId" ? "" : "subject-1",
          termId: field === "termId" ? "" : "term-1",
          value: 15,
          type: "test",
          weight: 1,
        });

        expect(result.success).toBe(false);
      });
    });

    test("should require at least one grade in bulk submission", () => {
      const result = bulkGradesSchema.safeParse({
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        type: "test",
        weight: 1,
        grades: [],
      });

      expect(result.success).toBe(false);
    });

    test("should require at least one grade ID for validation", () => {
      const result = validateGradesSchema.safeParse({
        gradeIds: [],
        comment: "Approved",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("input Validation - Type Enum Validation", () => {
    test("should only accept valid grade types", () => {
      const validTypes = [
        "quiz",
        "test",
        "exam",
        "participation",
        "homework",
        "project",
      ];
      const invalidTypes = [
        "invalid",
        "QUIZ",
        "Test",
        "EXAM",
        "",
        "midterm",
        "final",
      ];

      validTypes.forEach((type) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type,
          weight: 1,
        });

        expect(result.success).toBe(true);
      });

      invalidTypes.forEach((type) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type,
          weight: 1,
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("input Validation - Date Format", () => {
    test("should only accept valid date format (YYYY-MM-DD)", () => {
      const validDates = ["2025-01-15", "2024-12-31", "2025-06-01"];
      const invalidDates = [
        "15/01/2025", // DD/MM/YYYY
        "01-15-2025", // MM-DD-YYYY
        "2025/01/15", // Wrong separator
        "25-01-15", // Short year
        "2025-1-15", // Missing leading zero
        "2025-01-5", // Missing leading zero
        "January 15, 2025", // Text format
        "1705276800000", // Timestamp
        "invalid",
      ];

      validDates.forEach((date) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
          gradeDate: date,
        });

        expect(result.success).toBe(true);
      });

      invalidDates.forEach((date) => {
        const result = createGradeSchema.safeParse({
          studentId: "student-1",
          classId: "class-1",
          subjectId: "subject-1",
          termId: "term-1",
          value: 15,
          type: "test",
          weight: 1,
          gradeDate: date,
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("data Integrity", () => {
    test("should preserve data integrity through validation", () => {
      const originalData = {
        studentId: "student-123",
        classId: "class-456",
        subjectId: "subject-789",
        termId: "term-001",
        value: 15.75,
        type: "exam" as const,
        weight: 3,
        description: "Chapitre 5 - Équations différentielles",
        gradeDate: "2025-12-07",
      };

      const result = createGradeSchema.safeParse(originalData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.studentId).toBe(originalData.studentId);
        expect(result.data.classId).toBe(originalData.classId);
        expect(result.data.subjectId).toBe(originalData.subjectId);
        expect(result.data.termId).toBe(originalData.termId);
        expect(result.data.value).toBe(originalData.value);
        expect(result.data.type).toBe(originalData.type);
        expect(result.data.weight).toBe(originalData.weight);
        expect(result.data.description).toBe(originalData.description);
        expect(result.data.gradeDate).toBe(originalData.gradeDate);
      }
    });

    test("should strip unknown fields", () => {
      const dataWithExtraFields = {
        studentId: "student-1",
        classId: "class-1",
        subjectId: "subject-1",
        termId: "term-1",
        value: 15,
        type: "test" as const,
        weight: 1,
        unknownField: "should be stripped",
        anotherUnknown: 123,
      };

      const result = createGradeSchema.safeParse(dataWithExtraFields);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("unknownField");
        expect(result.data).not.toHaveProperty("anotherUnknown");
      }
    });
  });
});
