
export interface LessonActivities {
  introduction: string;
  reviewPriorKnowledge?: string;
  reviewPreviousSession?: string;
  presentation: string;
  practice: string;
  assessment: string;
  homework?: string;
  feedback: string;
  summary: string;
  concluding: string;
}

export interface LessonPlan {
  schoolName: string;
  schoolAddress: string;
  teacherName: string;
  teacherDesignation: 'Assistant Teacher' | 'Head Teacher';
  topic: string;
  gradeLevel: string;
  unit: string;
  lessonNo: string;
  sessionNo: string;
  pageNo: string;
  duration: string;
  learningOutcomes: string;
  teachingAids: string;
  activities: LessonActivities;
}

export interface GenerationParams {
  schoolName: string;
  schoolAddress: string;
  teacherName: string;
  teacherDesignation: 'Assistant Teacher' | 'Head Teacher';
  topic: string;
  gradeLevel: string;
  unit: string;
  lessonNo: string;
  sessionNo: string;
  pageNo: string;
  duration: string;
  imageBase64?: string;
  imageMimeType?: string;
  textbookText?: string;
  activities: LessonActivities;
}