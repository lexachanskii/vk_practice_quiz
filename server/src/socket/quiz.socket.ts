import type { Server, Socket } from "socket.io";
import {
  QuestionType,
  SessionQuestionStatus,
  SessionStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../utils/jwt";

type OrganizerJoinPayload = {
  sessionId: string;
  token: string;
};

type ParticipantJoinPayload = {
  sessionId: string;
  participantId: string;
};

type StartSessionPayload = {
  sessionId: string;
  token: string;
};

type ShowQuestionPayload = {
  sessionId: string;
  token: string;
  questionId?: string;
};

type SubmitAnswerPayload = {
  sessionId: string;
  participantId: string;
  questionId: string;
  selectedOptionIds: string[];
};

type FinishQuestionPayload = {
  sessionId: string;
  token: string;
  questionId: string;
};

type FinishSessionPayload = {
  sessionId: string;
  token: string;
};

function getSessionRoom(sessionId: string) {
  return `session:${sessionId}`;
}

function getParticipantRoom(participantId: string) {
  return `participant:${participantId}`;
}

function getOrganizerRoom(sessionId: string) {
  return `organizer:${sessionId}`;
}

const questionTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getQuestionTimerKey(sessionId: string, questionId: string) {
  return `${sessionId}:${questionId}`;
}

function clearQuestionTimer(sessionId: string, questionId: string) {
  const key = getQuestionTimerKey(sessionId, questionId);
  const timer = questionTimers.get(key);

  if (timer) {
    clearTimeout(timer);
    questionTimers.delete(key);
  }
}

function clearSessionTimers(sessionId: string) {
  for (const [key, timer] of questionTimers.entries()) {
    if (key.startsWith(`${sessionId}:`)) {
      clearTimeout(timer);
      questionTimers.delete(key);
    }
  }
}

async function checkOrganizerAccess(token: string, sessionId: string) {
  const payload = verifyAccessToken(token);

  const session = await prisma.quizSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      quiz: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.quiz.organizerId !== payload.userId) {
    throw new Error("Access denied");
  }

  return {
    userId: payload.userId,
    session,
  };
}

async function getLeaderboard(sessionId: string) {
  const participants = await prisma.sessionParticipant.findMany({
    where: {
      sessionId,
    },
    include: {
      answers: {
        select: {
          isCorrect: true,
          pointsAwarded: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });

  return participants
    .map((participant, index) => {
      const correctAnswersCount = participant.answers.filter(
        (answer) => answer.isCorrect
      ).length;

      return {
        place: index + 1,
        id: participant.id,
        nickname: participant.nickname,
        score: participant.score,
        correctAnswersCount,
        totalAnswersCount: participant.answers.length,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.nickname.localeCompare(b.nickname);
    })
    .map((participant, index) => ({
      ...participant,
      place: index + 1,
    }));
}

async function emitLeaderboard(io: Server, sessionId: string) {
  const leaderboard = await getLeaderboard(sessionId);

  io.to(getSessionRoom(sessionId)).emit("leaderboard_updated", {
    sessionId,
    leaderboard,
  });
}

async function finishQuestionByServer(
  io: Server,
  sessionId: string,
  questionId: string,
  reason: "manual" | "time_expired" | "session_finished" = "manual"
) {
  const sessionQuestion = await prisma.sessionQuestion.findFirst({
    where: {
      sessionId,
      questionId,
      status: SessionQuestionStatus.ACTIVE,
    },
    include: {
      question: {
        include: {
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!sessionQuestion) {
    return null;
  }

  await prisma.sessionQuestion.update({
    where: {
      id: sessionQuestion.id,
    },
    data: {
      status: SessionQuestionStatus.FINISHED,
      finishedAt: new Date(),
    },
  });

  clearQuestionTimer(sessionId, questionId);

  const correctOptions = sessionQuestion.question.options
    .filter((option) => option.isCorrect)
    .map((option) => ({
      id: option.id,
      text: option.text,
      imageUrl: option.imageUrl,
      order: option.order,
    }));

  io.to(getSessionRoom(sessionId)).emit("question_finished", {
    sessionId,
    questionId,
    reason,
    correctOptions,
  });

  await emitLeaderboard(io, sessionId);

  return {
    sessionQuestionId: sessionQuestion.id,
    questionId,
    reason,
  };
}

function scheduleQuestionTimer(
  io: Server,
  sessionId: string,
  questionId: string,
  timeLimitSeconds: number
) {
  clearQuestionTimer(sessionId, questionId);

  const timer = setTimeout(async () => {
    try {
      await finishQuestionByServer(io, sessionId, questionId, "time_expired");
    } catch (error) {
      console.error("Failed to auto-finish question:", error);
    }
  }, timeLimitSeconds * 1000);

  questionTimers.set(getQuestionTimerKey(sessionId, questionId), timer);
}

async function getPublicQuestion(sessionQuestionId: string) {
  const sessionQuestion = await prisma.sessionQuestion.findUnique({
    where: {
      id: sessionQuestionId,
    },
    include: {
      question: {
        include: {
          quiz: {
            select: {
              defaultTimeLimitSeconds: true,
              pointsPerQuestion: true,
            },
          },
          options: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              text: true,
              imageUrl: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!sessionQuestion) {
    return null;
  }

  const effectiveTimeLimitSeconds =
    sessionQuestion.question.timeLimitSeconds ??
    sessionQuestion.question.quiz.defaultTimeLimitSeconds;

  const effectivePoints =
    sessionQuestion.question.points ??
    sessionQuestion.question.quiz.pointsPerQuestion;

  return {
    sessionQuestionId: sessionQuestion.id,
    status: sessionQuestion.status,
    startedAt: sessionQuestion.startedAt,
    finishedAt: sessionQuestion.finishedAt,
    question: {
      id: sessionQuestion.question.id,
      text: sessionQuestion.question.text,
      imageUrl: sessionQuestion.question.imageUrl,
      type: sessionQuestion.question.type,
      order: sessionQuestion.question.order,
      timeLimitSeconds: effectiveTimeLimitSeconds,
      points: effectivePoints,
      options: sessionQuestion.question.options,
    },
  };
}

function areAnswersEqual(userOptionIds: string[], correctOptionIds: string[]) {
  const userSet = new Set(userOptionIds);
  const correctSet = new Set(correctOptionIds);

  if (userSet.size !== correctSet.size) {
    return false;
  }

  for (const id of correctSet) {
    if (!userSet.has(id)) {
      return false;
    }
  }

  return true;
}

export function registerQuizSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(
      "organizer_join_session",
      async (payload: OrganizerJoinPayload, callback) => {
        try {
          const { sessionId, token } = payload;

          await checkOrganizerAccess(token, sessionId);

          socket.join(getSessionRoom(sessionId));
          socket.join(getOrganizerRoom(sessionId));

          socket.emit("organizer_joined_session", {
            sessionId,
            socketId: socket.id,
          });

          const leaderboard = await getLeaderboard(sessionId);

          socket.emit("leaderboard_updated", {
            sessionId,
            leaderboard,
          });

          callback?.({
            ok: true,
            message: "Organizer joined session",
          });
        } catch (error) {
          callback?.({
            ok: false,
            message:
              error instanceof Error ? error.message : "Failed to join session",
          });
        }
      }
    );

    socket.on(
      "participant_join_session",
      async (payload: ParticipantJoinPayload, callback) => {
        try {
          const { sessionId, participantId } = payload;

          const participant = await prisma.sessionParticipant.findFirst({
            where: {
              id: participantId,
              sessionId,
            },
          });

          if (!participant) {
            callback?.({
              ok: false,
              message: "Participant not found in this session",
            });
            return;
          }

          socket.join(getSessionRoom(sessionId));
          socket.join(getParticipantRoom(participantId));

          io.to(getSessionRoom(sessionId)).emit("participant_joined", {
            sessionId,
            participant: {
              id: participant.id,
              nickname: participant.nickname,
              score: participant.score,
            },
          });

          await emitLeaderboard(io, sessionId);

          callback?.({
            ok: true,
            message: "Participant joined session",
          });
        } catch (error) {
          callback?.({
            ok: false,
            message:
              error instanceof Error ? error.message : "Failed to join session",
          });
        }
      }
    );

    socket.on("start_session", async (payload: StartSessionPayload, callback) => {
      try {
        const { sessionId, token } = payload;

        await checkOrganizerAccess(token, sessionId);

        const session = await prisma.quizSession.findUnique({
          where: {
            id: sessionId,
          },
        });

        if (!session) {
          callback?.({
            ok: false,
            message: "Session not found",
          });
          return;
        }

        if (session.status !== SessionStatus.WAITING) {
          callback?.({
            ok: false,
            message: "Session can be started only from WAITING status",
          });
          return;
        }

        const updatedSession = await prisma.quizSession.update({
          where: {
            id: sessionId,
          },
          data: {
            status: SessionStatus.ACTIVE,
            startedAt: new Date(),
          },
        });

        io.to(getSessionRoom(sessionId)).emit("session_started", {
          session: updatedSession,
        });

        callback?.({
          ok: true,
          session: updatedSession,
        });
      } catch (error) {
        callback?.({
          ok: false,
          message:
            error instanceof Error ? error.message : "Failed to start session",
        });
      }
    });

    socket.on("show_question", async (payload: ShowQuestionPayload, callback) => {
      try {
        const { sessionId, token, questionId } = payload;

        await checkOrganizerAccess(token, sessionId);

        const session = await prisma.quizSession.findUnique({
          where: {
            id: sessionId,
          },
        });

        if (!session) {
          callback?.({
            ok: false,
            message: "Session not found",
          });
          return;
        }

        if (session.status !== SessionStatus.ACTIVE) {
          callback?.({
            ok: false,
            message: "Session is not active",
          });
          return;
        }

        const activeQuestion = await prisma.sessionQuestion.findFirst({
          where: {
            sessionId,
            status: SessionQuestionStatus.ACTIVE,
          },
        });

        if (activeQuestion) {
          callback?.({
            ok: false,
            message: "There is already an active question",
          });
          return;
        }

        const sessionQuestion = questionId
          ? await prisma.sessionQuestion.findFirst({
              where: {
                sessionId,
                questionId,
                status: SessionQuestionStatus.PENDING,
              },
              include: {
                question: true,
              },
            })
          : await prisma.sessionQuestion.findFirst({
              where: {
                sessionId,
                status: SessionQuestionStatus.PENDING,
              },
              orderBy: {
                question: {
                  order: "asc",
                },
              },
              include: {
                question: true,
              },
            });

        if (!sessionQuestion) {
          callback?.({
            ok: false,
            message: "No pending question found",
          });
          return;
        }

        const startedAt = new Date();

        const startedSessionQuestion = await prisma.sessionQuestion.update({
          where: {
            id: sessionQuestion.id,
          },
          data: {
            status: SessionQuestionStatus.ACTIVE,
            startedAt,
          },
        });

        const publicQuestion = await getPublicQuestion(startedSessionQuestion.id);

        if (!publicQuestion) {
          callback?.({
            ok: false,
            message: "Question not found after start",
          });
          return;
        }

        const timeLimitSeconds = publicQuestion.question.timeLimitSeconds;
        const expiresAt = new Date(startedAt.getTime() + timeLimitSeconds * 1000);

        scheduleQuestionTimer(io, sessionId, publicQuestion.question.id, timeLimitSeconds);

        io.to(getSessionRoom(sessionId)).emit("question_started", {
          sessionId,
          ...publicQuestion,
          expiresAt,
        });

        callback?.({
          ok: true,
          question: publicQuestion,
          expiresAt,
        });
      } catch (error) {
        callback?.({
          ok: false,
          message:
            error instanceof Error ? error.message : "Failed to show question",
        });
      }
    });

    socket.on("submit_answer", async (payload: SubmitAnswerPayload, callback) => {
      try {
        const { sessionId, participantId, questionId, selectedOptionIds } =
          payload;

        if (!Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
          callback?.({
            ok: false,
            message: "Selected options are required",
          });
          return;
        }

        const participant = await prisma.sessionParticipant.findFirst({
          where: {
            id: participantId,
            sessionId,
          },
        });

        if (!participant) {
          callback?.({
            ok: false,
            message: "Participant not found",
          });
          return;
        }

        const sessionQuestion = await prisma.sessionQuestion.findFirst({
          where: {
            sessionId,
            questionId,
            status: SessionQuestionStatus.ACTIVE,
          },
          include: {
            question: {
              include: {
                options: true,
                quiz: true,
              },
            },
          },
        });

        if (!sessionQuestion) {
          callback?.({
            ok: false,
            message: "Question is not active",
          });
          return;
        }

        const startedAt = sessionQuestion.startedAt;

        if (!startedAt) {
          callback?.({
            ok: false,
            message: "Question has not started",
          });
          return;
        }

        const question = sessionQuestion.question;

        const timeLimitSeconds =
          question.timeLimitSeconds ?? question.quiz.defaultTimeLimitSeconds;

        const expiresAt = startedAt.getTime() + timeLimitSeconds * 1000;

        if (Date.now() > expiresAt) {
          await finishQuestionByServer(io, sessionId, questionId, "time_expired");

          callback?.({
            ok: false,
            message: "Time is over",
          });
          return;
        }

        if (!sessionQuestion.startedAt) {
          callback?.({
            ok: false,
            message: "Question has not started",
          });
          return;
        }

        const alreadyAnswered = await prisma.participantAnswer.findFirst({
          where: {
            sessionId,
            participantId,
            questionId,
          },
        });

        if (alreadyAnswered) {
          callback?.({
            ok: false,
            message: "Participant has already answered this question",
          });
          return;
        }

        const uniqueSelectedOptionIds = [...new Set(selectedOptionIds)];

        if (
          question.type === QuestionType.SINGLE_CHOICE &&
          uniqueSelectedOptionIds.length !== 1
        ) {
          callback?.({
            ok: false,
            message: "Single choice question accepts only one answer",
          });
          return;
        }

        const validOptions = question.options;
        const validOptionIds = new Set(validOptions.map((option) => option.id));

        const hasInvalidOption = uniqueSelectedOptionIds.some(
          (optionId) => !validOptionIds.has(optionId)
        );

        if (hasInvalidOption) {
          callback?.({
            ok: false,
            message: "Some selected options do not belong to this question",
          });
          return;
        }

        const correctOptionIds = validOptions
          .filter((option) => option.isCorrect)
          .map((option) => option.id);

        const isCorrect = areAnswersEqual(
          uniqueSelectedOptionIds,
          correctOptionIds
        );

        const pointsForQuestion =
          question.points ?? question.quiz.pointsPerQuestion;

        const pointsAwarded = isCorrect ? pointsForQuestion : 0;

        const answer = await prisma.$transaction(async (tx) => {
          const createdAnswer = await tx.participantAnswer.create({
            data: {
              sessionId,
              participantId,
              questionId,
              isCorrect,
              pointsAwarded,
              selectedOptions: {
                create: uniqueSelectedOptionIds.map((answerOptionId) => ({
                  answerOptionId,
                })),
              },
            },
            include: {
              selectedOptions: true,
            },
          });

          if (pointsAwarded > 0) {
            await tx.sessionParticipant.update({
              where: {
                id: participantId,
              },
              data: {
                score: {
                  increment: pointsAwarded,
                },
              },
            });
          }

          return createdAnswer;
        });

        socket.to(getOrganizerRoom(sessionId)).emit("answer_received", {
          sessionId,
          participantId,
          questionId,
          isCorrect,
        });

        socket.emit("answer_accepted", {
          answerId: answer.id,
          sessionId,
          questionId,
          isCorrect,
          pointsAwarded,
        });

        await emitLeaderboard(io, sessionId);

        callback?.({
          ok: true,
          answer: {
            id: answer.id,
            isCorrect,
            pointsAwarded,
          },
        });
      } catch (error) {
        callback?.({
          ok: false,
          message:
            error instanceof Error ? error.message : "Failed to submit answer",
        });
      }
    });

    socket.on(
      "finish_question",
      async (payload: FinishQuestionPayload, callback) => {
        try {
          const { sessionId, token, questionId } = payload;

          await checkOrganizerAccess(token, sessionId);

          const result = await finishQuestionByServer(
            io,
            sessionId,
            questionId,
            "manual"
          );

          if (!result) {
            callback?.({
              ok: false,
              message: "Active question not found",
            });
            return;
          }

          callback?.({
            ok: true,
            message: "Question finished",
          });
        } catch (error) {
          callback?.({
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to finish question",
          });
        }
      }
    );

    socket.on(
      "finish_session",
      async (payload: FinishSessionPayload, callback) => {
        try {
          const { sessionId, token } = payload;

          await checkOrganizerAccess(token, sessionId);
          
          clearSessionTimers(sessionId);

          const updatedSession = await prisma.quizSession.update({
            where: {
              id: sessionId,
            },
            data: {
              status: SessionStatus.FINISHED,
              finishedAt: new Date(),
              questions: {
                updateMany: {
                  where: {
                    status: {
                      in: [
                        SessionQuestionStatus.PENDING,
                        SessionQuestionStatus.ACTIVE,
                      ],
                    },
                  },
                  data: {
                    status: SessionQuestionStatus.FINISHED,
                    finishedAt: new Date(),
                  },
                },
              },
            },
          });

          const leaderboard = await getLeaderboard(sessionId);

          io.to(getSessionRoom(sessionId)).emit("session_finished", {
            session: updatedSession,
            leaderboard,
          });

          callback?.({
            ok: true,
            session: updatedSession,
            leaderboard,
          });
        } catch (error) {
          callback?.({
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to finish session",
          });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}