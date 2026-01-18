
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, LessonPlan } from "../types";

export const generateLessonPlan = async (params: GenerationParams): Promise<LessonPlan> => {
  // Always use new instance right before call for potential key updates
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activityContext = Object.entries(params.activities)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  const textPrompt = `
    Generate a professional Daily Lesson Plan for Primary English (Bangladesh).
    Curriculum: NCTB (National Curriculum and Textbook Board) "English for Today".
    Language: English.

    Context:
    - Topic: ${params.topic}
    - Grade: ${params.gradeLevel}
    - Unit: ${params.unit}, Lesson: ${params.lessonNo}, Session: ${params.sessionNo}
    - Duration: ${params.duration}

    ${params.textbookText ? `Textbook Text: "${params.textbookText}"` : ''}
    ${activityContext ? `User Provided Activity Notes (Integrate these into the plan):\n${activityContext}` : ''}
    ${params.imageBase64 ? `Analyze the attached textbook image to ensure pedagogical alignment.` : ''}

    FORMATTING REQUIREMENT:
    For 'learningOutcomes', 'teachingAids', and all 'activities' fields, you MUST return the content using basic HTML tags for rich formatting:
    - Use <b>...</b> for bold.
    - Use <i>...</i> for italics.
    - Use <ul><li>...</li></ul> for bullet points.
    - Do NOT use Markdown. Use only valid simple HTML.

    Structure Requirements:
    1. Learning Outcomes: Specific competencies from the NCTB curriculum.
    2. Teaching Aids: Specific materials for this lesson.
    3. Teaching Learning Activities:
       - Introduction: Hook/Motivation.
       - Review of Prior Knowledge: Connecting to life.
       - Review of Previous Session: Recapping.
       - Presentation of the class: Core instruction.
       - Practice Activities: Active tasks.
       - Assessment: Check understanding.
       - Homework: Simple follow-up.
       - Feedback: Scaffolding/Correction.
       - Summary: Wrap up.
       - Concluding: Closing ritual.
  `;

  const parts: any[] = [{ text: textPrompt }];

  if (params.imageBase64 && params.imageMimeType) {
    parts.push({
      inlineData: {
        data: params.imageBase64.split(',')[1],
        mimeType: params.imageMimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schoolName: { type: Type.STRING },
          schoolAddress: { type: Type.STRING },
          teacherName: { type: Type.STRING },
          teacherDesignation: { type: Type.STRING },
          topic: { type: Type.STRING },
          gradeLevel: { type: Type.STRING },
          unit: { type: Type.STRING },
          lessonNo: { type: Type.STRING },
          sessionNo: { type: Type.STRING },
          pageNo: { type: Type.STRING },
          duration: { type: Type.STRING },
          learningOutcomes: { type: Type.STRING },
          teachingAids: { type: Type.STRING },
          activities: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              reviewPriorKnowledge: { type: Type.STRING },
              reviewPreviousSession: { type: Type.STRING },
              presentation: { type: Type.STRING },
              practice: { type: Type.STRING },
              assessment: { type: Type.STRING },
              homework: { type: Type.STRING },
              feedback: { type: Type.STRING },
              summary: { type: Type.STRING },
              concluding: { type: Type.STRING }
            },
            required: ["introduction", "presentation", "practice", "assessment", "feedback", "summary", "concluding"]
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Generation failed.");
  }

  const generated = JSON.parse(response.text.trim());
  
  return {
    ...generated,
    schoolName: params.schoolName || generated.schoolName,
    schoolAddress: params.schoolAddress || generated.schoolAddress,
    teacherName: params.teacherName || generated.teacherName,
    teacherDesignation: params.teacherDesignation || generated.teacherDesignation,
    topic: params.topic || generated.topic,
    gradeLevel: params.gradeLevel,
    unit: params.unit,
    lessonNo: params.lessonNo,
    sessionNo: params.sessionNo,
    pageNo: params.pageNo,
    duration: params.duration
  };
};