import "dotenv/config";

import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import {
    courseParamsToBindValues,
    normalizeCourseParams
} from "./course-params.js";
import { runCourseCrawler } from "./crawler.js";
import type { Course } from "./schemas/course.schema.js";
import { env } from "hono/adapter";

type Bindings = {
    BASIC_AUTH_USER: string;
    BASIC_AUTH_PASS: string;
    CF_ACCOUNT_ID: string;
    CF_DATABASE_ID: string;
    CF_API_TOKEN: string;
};

const CHROMIUM_PACK_URL = process.env.VERCEL_BLOB_URL
    ? process.env.VERCEL_BLOB_URL
    : "https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
    // Return cached path if available
    if (cachedExecutablePath) return cachedExecutablePath;

    // Prevent concurrent downloads by reusing the same promise
    if (!downloadPromise) {
        const chromium = (await import("@sparticuz/chromium-min")).default;
        downloadPromise = chromium
            .executablePath(CHROMIUM_PACK_URL)
            .then((path) => {
                cachedExecutablePath = path;
                console.log("Chromium path resolved:", path);
                return path;
            })
            .catch((error) => {
                console.error("Failed to get Chromium path:", error);
                downloadPromise = null; // Reset on error to allow retry
                throw error;
            });
    }

    return downloadPromise;
}

async function updateD1ViaAPI(env: Bindings, courses: Course[]) {
    const { CF_ACCOUNT_ID, CF_DATABASE_ID, CF_API_TOKEN } = env;
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;

    const sql = `
        INSERT INTO courses (
            semester, courseFullID, courseName, courseEngName, department, 
            departmentID, courseType, subjectID, subjectGroup, grade, 
            classGroup, className, classID, credit, totalOfTakingStudents, 
            numberOfTakingStudents, weekNumber, day, dayNum, startPeriod, 
            endPeriod, startTime, endTime, courseLocation, mainTeacherName, 
            multipleTeacherName, note, courseAbstract, courseEngAbstract,
            content_hash
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(semester, courseFullID) DO UPDATE SET
            courseName = EXCLUDED.courseName,
            courseEngName = EXCLUDED.courseEngName,
            department = EXCLUDED.department,
            departmentID = EXCLUDED.departmentID,
            courseType = EXCLUDED.courseType,
            subjectID = EXCLUDED.subjectID,
            subjectGroup = EXCLUDED.subjectGroup,
            grade = EXCLUDED.grade,
            classGroup = EXCLUDED.classGroup,
            className = EXCLUDED.className,
            classID = EXCLUDED.classID,
            credit = EXCLUDED.credit,
            totalOfTakingStudents = EXCLUDED.totalOfTakingStudents,
            numberOfTakingStudents = EXCLUDED.numberOfTakingStudents,
            weekNumber = EXCLUDED.weekNumber,
            day = EXCLUDED.day,
            dayNum = EXCLUDED.dayNum,
            startPeriod = EXCLUDED.startPeriod,
            endPeriod = EXCLUDED.endPeriod,
            startTime = EXCLUDED.startTime,
            endTime = EXCLUDED.endTime,
            courseLocation = EXCLUDED.courseLocation,
            mainTeacherName = EXCLUDED.mainTeacherName,
            multipleTeacherName = EXCLUDED.multipleTeacherName,
            note = EXCLUDED.note,
            courseAbstract = EXCLUDED.courseAbstract,
            courseEngAbstract = EXCLUDED.courseEngAbstract,
            content_hash = EXCLUDED.content_hash
        WHERE courses.content_hash IS NULL
           OR courses.content_hash IS NOT EXCLUDED.content_hash
    `;

    const body = courses.map((course) => ({
        sql,
        params: courseParamsToBindValues(normalizeCourseParams(course))
    }));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          batch: body
        })
    });

    return await response.json();
}

app.use(
    "/api/v1/crawler", 
    async (c, next) => {
        const { BASIC_AUTH_USER, BASIC_AUTH_PASS } = env(c)

        const auth = basicAuth({
            username: BASIC_AUTH_USER ?? "",
            password: BASIC_AUTH_PASS ?? ""
        });

        return auth(c, next);
    }
).post("/api/v1/crawler", async (c) => {
    try {
        const isVercel = !!process.env.VERCEL_ENV;
        let puppeteer: any,
            launchOptions: any = {
                headless: true
            };

        if (isVercel) {
            // Vercel: Use puppeteer-core with downloaded Chromium binary
            const chromium = (await import("@sparticuz/chromium-min")).default;
            puppeteer = await import("puppeteer-core");
            const executablePath = await getChromiumPath();
            launchOptions = {
                ...launchOptions,
                args: chromium.args,
                executablePath
            };
            console.log(
                "Launching browser with executable path:",
                executablePath
            );
        } else {
            // Local: Use regular puppeteer with bundled Chromium
            puppeteer = await import("puppeteer");
        }

        const sem = c.req.query("sem");
        const courses = await runCourseCrawler(puppeteer, launchOptions, sem);
        if (courses instanceof Response) {
            return courses;
        }
        const result = await updateD1ViaAPI(env(c), courses);
        if (!result.success) {
            return c.json({ message: "Failed to update D1", errors: result.errors }, 500);
        }
        return c.json({ message: "Courses updated successfully" });
    } catch (error) {
        console.error("Error initializing browser:", error);
    }
});

export default app;
