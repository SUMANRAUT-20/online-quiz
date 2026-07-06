import mysql, {
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { htmlBasicQuiz } from "./quizData";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type QuizOptionKey = "A" | "B" | "C" | "D";

export type QuizQuestionForClient = {
  id: number;
  question: string;
  options: {
    key: QuizOptionKey;
    text: string;
  }[];
};

export type QuizSummary = {
  id: string;
  title: string;
  description: string;
  questionCount: number;
};

export type QuizResult = {
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  completedAt: string;
};

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

type PublicUserRow = RowDataPacket & User;

type QuestionRow = RowDataPacket & {
  id: number;
  quiz_slug: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuizOptionKey;
};

type CountRow = RowDataPacket & {
  count: number;
};

type ResultRow = RowDataPacket & {
  quiz_slug: string;
  quiz_title: string;
  score: number;
  total: number;
  created_at: Date;
};

const globalForMySql = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
  mysqlReady?: Promise<void>;
  mysqlSchemaVersion?: number;
};

const SCHEMA_VERSION = 2;

function getDatabaseName() {
  const databaseName = process.env.DB_NAME ?? "online_quiz";

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error("DB_NAME can only contain letters, numbers, and underscores.");
  }

  return databaseName;
}

function getConnectionConfig(includeDatabase: boolean) {
  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: includeDatabase ? getDatabaseName() : undefined,
    connectionLimit: 10,
  };
}

export function getPool() {
  if (!globalForMySql.mysqlPool) {
    globalForMySql.mysqlPool = mysql.createPool(getConnectionConfig(true));
  }

  return globalForMySql.mysqlPool;
}

export async function ensureDatabase() {
  if (
    !globalForMySql.mysqlReady ||
    globalForMySql.mysqlSchemaVersion !== SCHEMA_VERSION
  ) {
    globalForMySql.mysqlReady = initializeDatabase();
  }

  return globalForMySql.mysqlReady;
}

async function initializeDatabase() {
  const databaseName = getDatabaseName();
  const serverConnection = await mysql.createConnection(
    getConnectionConfig(false),
  );

  await serverConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await serverConnection.end();

  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_slug VARCHAR(100) NOT NULL,
      question TEXT NOT NULL,
      option_a VARCHAR(255) NOT NULL,
      option_b VARCHAR(255) NOT NULL,
      option_c VARCHAR(255) NOT NULL,
      option_d VARCHAR(255) NOT NULL,
      correct_option CHAR(1) NOT NULL,
      INDEX quiz_slug_index (quiz_slug)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      quiz_slug VARCHAR(100) NOT NULL,
      quiz_title VARCHAR(150) NOT NULL,
      score INT NOT NULL,
      total INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX user_result_index (user_id, created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await migrateExistingTables();
  await seedDefaultQuestions();
  globalForMySql.mysqlSchemaVersion = SCHEMA_VERSION;
}

async function columnExists(tableName: string, columnName: string) {
  const [rows] = await getPool().execute<CountRow[]>(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [getDatabaseName(), tableName, columnName],
  );

  return (rows[0]?.count ?? 0) > 0;
}

async function migrateExistingTables() {
  const pool = getPool();

  if (!(await columnExists("questions", "id"))) {
    await pool.execute(
      "ALTER TABLE questions ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST",
    );
  }

  if (!(await columnExists("results", "quiz_title"))) {
    await pool.execute(
      "ALTER TABLE results ADD COLUMN quiz_title VARCHAR(150) NOT NULL DEFAULT 'HTML Basic Quiz' AFTER quiz_slug",
    );
  }
}

async function seedDefaultQuestions() {
  const pool = getPool();
  const [rows] = await pool.execute<CountRow[]>(
    "SELECT COUNT(*) AS count FROM questions WHERE quiz_slug = ?",
    [htmlBasicQuiz.id],
  );

  if ((rows[0]?.count ?? 0) > 0) {
    return;
  }

  for (const question of htmlBasicQuiz.questions) {
    const correctIndex = question.options.findIndex(
      (option) => option === question.answer,
    );
    const correctOption = ["A", "B", "C", "D"][correctIndex] ?? "A";

    await pool.execute(
      `INSERT INTO questions
        (quiz_slug, question, option_a, option_b, option_c, option_d, correct_option)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        htmlBasicQuiz.id,
        question.question,
        question.options[0],
        question.options[1],
        question.options[2],
        question.options[3],
        correctOption,
      ],
    );
  }
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  await ensureDatabase();

  const [result] = await getPool().execute<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
}

export async function findUserByEmail(email: string) {
  await ensureDatabase();

  const [rows] = await getPool().execute<UserRow[]>(
    "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  return rows[0] ?? null;
}

export async function getUserById(userId: number) {
  await ensureDatabase();

  const [rows] = await getPool().execute<PublicUserRow[]>(
    "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
    [userId],
  );

  return rows[0] ?? null;
}

export async function getQuizSummary(slug = htmlBasicQuiz.id) {
  await ensureDatabase();

  const [rows] = await getPool().execute<CountRow[]>(
    "SELECT COUNT(*) AS count FROM questions WHERE quiz_slug = ?",
    [slug],
  );

  return {
    id: htmlBasicQuiz.id,
    title: htmlBasicQuiz.title,
    description: htmlBasicQuiz.description,
    questionCount: rows[0]?.count ?? 0,
  } satisfies QuizSummary;
}

export async function getQuizQuestions(slug = htmlBasicQuiz.id) {
  await ensureDatabase();

  const [rows] = await getPool().execute<QuestionRow[]>(
    `SELECT id, quiz_slug, question, option_a, option_b, option_c, option_d, correct_option
     FROM questions
     WHERE quiz_slug = ?
     ORDER BY id ASC`,
    [slug],
  );

  return rows;
}

export function toClientQuestion(row: QuestionRow): QuizQuestionForClient {
  return {
    id: row.id,
    question: row.question,
    options: [
      { key: "A", text: row.option_a },
      { key: "B", text: row.option_b },
      { key: "C", text: row.option_c },
      { key: "D", text: row.option_d },
    ],
  };
}

export async function saveResult({
  quizSlug,
  quizTitle,
  score,
  total,
  userId,
}: {
  quizSlug: string;
  quizTitle: string;
  score: number;
  total: number;
  userId: number;
}) {
  await ensureDatabase();

  await getPool().execute(
    `INSERT INTO results (user_id, quiz_slug, quiz_title, score, total)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, quizSlug, quizTitle, score, total],
  );
}

export async function getLatestResult(userId: number) {
  await ensureDatabase();

  const [rows] = await getPool().execute<ResultRow[]>(
    `SELECT quiz_slug, quiz_title, score, total, created_at
     FROM results
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId],
  );

  const result = rows[0];

  if (!result) {
    return null;
  }

  return {
    quizId: result.quiz_slug,
    quizTitle: result.quiz_title,
    score: result.score,
    total: result.total,
    completedAt: result.created_at.toISOString(),
  } satisfies QuizResult;
}
