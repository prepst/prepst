/**
 * Utility functions for processing and rendering questions
 */

/**
 * Process question text to replace blank placeholders with proper blank elements
 * Handles common SAT fill-in-the-blank patterns like ____blank____, _____, ___blank___, etc.
 *
 * @param text - The raw question text from the database
 * @returns Processed HTML string with proper blank rendering
 */
export function processQuestionBlanks(text: string): string {
  if (!text) return text;

  // Common blank patterns in SAT questions
  const blankPatterns = [
    /____(?:blank|Blank)?____/g, // ____blank____ or ____Blank____
    /___(?:blank|Blank)?___/g, // ___blank___ or ___Blank___
    /__(?:blank|Blank)?__/g, // __blank__ or __Blank__
    /_(?:blank|Blank)?_/g, // _blank_ or _Blank_
    /_{3,}/g, // Three or more underscores (____, _____, ______, etc.)
  ];

  let processedText = text;

  // Replace each blank pattern with a span element styled as an underline
  for (const pattern of blankPatterns) {
    processedText = processedText.replace(
      pattern,
      '<span class="question-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'
    );
  }

  return processedText;
}

/**
 * Format topic name for display - converts to title case and shortens common phrases
 * Examples:
 * - "LINEAR EQUATIONS IN ONE VARIABLE" -> "Linear Equations"
 * - "COMPOSITE FUNCTIONS" -> "Composite Functions"
 * - "quadratic formula" -> "Quadratic Formula"
 *
 * @param topicName - The raw topic name from the database
 * @returns Formatted topic name in title case
 */
export function formatTopicName(topicName: string): string {
  if (!topicName) return topicName;

  // Common phrase mappings for shortening long topic names
  const phraseMappings: Record<string, string> = {
    "LINEAR EQUATIONS IN ONE VARIABLE": "Linear Equations",
    "LINEAR EQUATIONS": "Linear Equations",
    "QUADRATIC EQUATIONS": "Quadratic Equations",
    "SYSTEM OF EQUATIONS": "System of Equations",
    "SYSTEM OF INEQUALITIES": "System of Inequalities",
    "SYSTEM OF EQUATIONS/INEQUALITIES": "System of Equations",
    "COMPOSITE FUNCTIONS": "Composite Functions",
    "EXPONENTIAL FUNCTIONS": "Exponential Functions",
    "POLYNOMIAL FUNCTIONS": "Polynomials",
    "QUADRATIC FUNCTIONS": "Quadratic Functions",
    "LINEAR FUNCTIONS": "Linear Functions",
    "RADICAL EXPRESSIONS": "Radicals",
    "RATIONAL EXPRESSIONS": "Rational Expressions",
    "ALGEBRAIC MANIPULATION": "Algebraic Manipulation",
    "FACTORING POLYNOMIALS": "Factoring",
    "RULES OF EXPONENTS": "Rules of Exponents",
    "CREATING ALGEBRAIC EQUATIONS": "Creating Equations",
    "INTERPRETING EQUATIONS FROM WORD PROBLEMS": "Word Problems",
    "FUNCTIONS FROM GRAPHS": "Functions from Graphs",
    "FUNCTIONS FROM TABLES": "Functions from Tables",
    "UNDERSTANDING FUNCTION NOTATION": "Function Notation",
    "QUALITIES OF A QUADRATIC": "Quadratic Qualities",
    "VERTEX FORM": "Vertex Form",
    "ROOTS/FACTORS": "Roots/Factors",
    "DIFFERENCE OF SQUARES": "Difference of Squares",
    "LINE OF BEST FIT": "Line of Best Fit",
    "DIMENSIONAL ANALYSIS": "Dimensional Analysis",
    "GRAPH INTERSECTIONS": "Graph Intersections",
    "LINEAR INEQUALITIES": "Linear Inequalities",
    "ABSOLUTE VALUE": "Absolute Value",
  };

  // Check for exact match first (case-insensitive)
  const upperName = topicName.toUpperCase();
  if (phraseMappings[upperName]) {
    return phraseMappings[upperName];
  }

  // Check for partial matches (if topic name contains a mapped phrase)
  for (const [key, value] of Object.entries(phraseMappings)) {
    if (upperName.includes(key)) {
      return value;
    }
  }

  // Convert to title case if no mapping found
  return topicName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
