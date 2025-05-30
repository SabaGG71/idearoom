import React from "react";
import { getCourses, getCourseById } from "../../services/apiCourses";
import CourseClient from "./_components/CourseClient";

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const courseId = params.courseId;
  const course = await getCourseById(parseInt(courseId));

  if (!course) {
    return {
      title: "კურსი არ მოიძებნა !",
      description: "მოთხოვნილი კურსი ვერ მოიძებნა",
    };
  }

  return {
    title: course.title,
    description:
      Array.isArray(course.course_details) && course.course_details.length > 0
        ? course.course_details[0]
        : "Course details",
    robots: {
      follow: true,
      index: true,
    },
  };
}

// Main component for the course page
export default async function CoursePage({ params, searchParams }) {
  const courseId = params.courseId;
  const activeTab = searchParams?.tab || "details";

  // Fetch course data
  const courseData = await getCourseById(parseInt(courseId));

  // Get related courses
  const allCourses = await getCourses();
  const relatedCourses = allCourses
    .filter((c) => c.id !== parseInt(courseId))
    .slice(0, 4);

  // Process syllabus data
  const processData = (data) => {
    if (Array.isArray(data)) return data;
    if (data == null) return [];
    if (typeof data === "string") {
      try {
        const trimmedData = data.trim();
        if (
          (trimmedData.startsWith("[") && trimmedData.endsWith("]")) ||
          (trimmedData.startsWith("{") && trimmedData.endsWith("}"))
        ) {
          return JSON.parse(trimmedData);
        }
        return [trimmedData];
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return [];
      }
    }
    return [];
  };

  const validateSyllabusContent = (content) => {
    if (!Array.isArray(content)) return [String(content)];
    return content.map((item) => String(item));
  };

  let syllabusItems = [];
  if (courseData) {
    const titles = processData(courseData.syllabus_title);
    const contents = processData(courseData.syllabus_content);

    if (Array.isArray(titles) && titles.length > 0) {
      syllabusItems = titles.map((title, index) => {
        let contentArray = [];
        if (Array.isArray(contents) && contents.length > index) {
          contentArray = validateSyllabusContent(contents[index]);
        }
        return {
          title: `ლექცია ${index + 1}: ${title}`,
          content: contentArray,
        };
      });
    } else if (Array.isArray(contents) && contents.length > 0) {
      syllabusItems = contents.map((contentArray, index) => ({
        title: `ლექცია ${index + 1}`,
        content: validateSyllabusContent(contentArray),
      }));
    }

    if (syllabusItems.length === 0) {
      syllabusItems = [
        {
          title: "ლექცია 1",
          content: ["შინაარსი 1", "შინაარსი 2"],
        },
      ];
    }
  }

  return (
    <CourseClient
      courseData={courseData}
      relatedCourses={relatedCourses}
      syllabusItems={syllabusItems}
      activeTab={activeTab}
      courseId={courseId}
    />
  );
}

// Define static paths for the generation
export async function generateStaticParams() {
  try {
    const courses = await getCourses();
    return courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
