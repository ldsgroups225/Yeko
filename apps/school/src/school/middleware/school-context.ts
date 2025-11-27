import { createServerFn } from '@tanstack/react-start';

export const getSchoolContext = createServerFn().handler(async () => {
  // TODO: Get cookie from request headers
  // const schoolId = getCookie(SCHOOL_CONTEXT_COOKIE);
  const schoolId = null;

  if (!schoolId) {
    return null;
  }

  // Validate user has access to this school
  // TODO: Check user_schools table

  return { schoolId };
});

export const setSchoolContext = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const schoolId = data;

    // Validate user has access to this school
    // TODO: Check user_schools table

    // TODO: Set cookie in response headers
    // setCookie(SCHOOL_CONTEXT_COOKIE, schoolId, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 30, // 30 days
    // });

    return { success: true, schoolId };
  });
