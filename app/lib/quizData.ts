export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

export const htmlBasicQuiz = {
  id: "html-basic",
  title: "HTML Basic Quiz",
  description: "Core HTML tags, attributes, and document basics.",
  questions: [
    {
      id: 1,
      question: "What does HTML stand for?",
      options: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "HyperTool Multi Language",
        "HomeText Markup Language",
      ],
      answer: "HyperText Markup Language",
    },
    {
      id: 2,
      question: "Which HTML tag creates a hyperlink?",
      options: ["<a>", "<link>", "<href>", "<nav>"],
      answer: "<a>",
    },
    {
      id: 3,
      question: "Which element is used for the largest heading?",
      options: ["<h6>", "<heading>", "<h1>", "<head>"],
      answer: "<h1>",
    },
    {
      id: 4,
      question: "Which attribute provides alternate text for an image?",
      options: ["title", "src", "alt", "href"],
      answer: "alt",
    },
    {
      id: 5,
      question: "Which tag is used to create an ordered list?",
      options: ["<ul>", "<ol>", "<li>", "<list>"],
      answer: "<ol>",
    },
  ] satisfies QuizQuestion[],
};
