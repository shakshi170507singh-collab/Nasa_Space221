import React, { useState } from "react";
import "./Quiz.css";

const questions = [
  {
    question: "What was the name of the Apollo 11 Lunar Module?",
    options: ["Falcon", "Eagle", "Columbia", "Challenger"],
    answer: 1,
    fact: "The Apollo 11 Lunar Module was named Eagle. It carried astronauts Neil Armstrong and Buzz Aldrin to the lunar surface."
  },
  {
    question: "Where did the Apollo 11 Lunar Module land?",
    options: [
      "Ocean of Storms",
      "Sea of Tranquility",
      "Lunar South Pole",
      "Sea of Serenity"
    ],
    answer: 1,
    fact: "Eagle landed in the Sea of Tranquility, a region on the near side of the Moon."
  },
  {
    question: "On which date did Apollo 11 land on the Moon?",
    options: [
      "16 July 1969",
      "19 July 1969",
      "20 July 1969",
      "24 July 1969"
    ],
    answer: 2,
    fact: "The Apollo 11 Lunar Module landed on the Moon on 20 July 1969."
  },
  {
    question: "What was the name given to Apollo 11's landing site?",
    options: [
      "Tranquility Base",
      "Eagle Station",
      "Apollo Point",
      "Lunar Gateway"
    ],
    answer: 0,
    fact: "After landing, the crew referred to their landing site as Tranquility Base."
  },
  {
    question: "Which part of the Lunar Module was left on the Moon?",
    options: [
      "The ascent stage",
      "The crew cabin",
      "The descent stage",
      "The docking module"
    ],
    answer: 2,
    fact: "The descent stage remained on the lunar surface after the ascent stage departed."
  },
  {
    question: "What is the NSSDCA spacecraft identifier for Eagle?",
    options: [
      "1969-059A",
      "1969-059B",
      "1969-059C",
      "1969-060C"
    ],
    answer: 2,
    fact: "NASA's NSSDCA record identifies the Apollo 11 Lunar Module as 1969-059C."
  },
  {
    question: "Why is the landing-site marker on the Moon map described as approximate?",
    options: [
      "The Moon map is a NASA photograph of the near side",
      "The landing site changes every year",
      "The map shows the far side of the Moon",
      "The marker represents the Apollo 12 landing"
    ],
    answer: 0,
    fact: "The exhibit uses a NASA photograph of the Moon's near side, and the marker indicates an approximate landing location."
  },
  {
    question: "Why is the Lunar Module displayed larger than life in the exhibit?",
    options: [
      "To show its actual size",
      "To make it look like a rocket",
      "To help visitors see its details",
      "To represent its size in lunar orbit"
    ],
    answer: 2,
    fact: "The lander is drawn larger than life so visitors can clearly see its features and details."
  }
];

function Quiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const handleAnswer = (index) => {
    if (selected !== null) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="quiz-page" id="quiz">

      <div className="quiz-stars"></div>

      <header className="quiz-header">
        <span className="quiz-logo">✦ SPACE MUSEUM</span>
        <span className="quiz-category">MISSION CHALLENGE / 001</span>
      </header>

      <main className="quiz-container">

        <div className="quiz-intro">
          <span className="quiz-label">NASA • APOLLO 11 MISSION</span>
          <h1>
            THE <span>EAGLE</span> QUIZ
          </h1>
          <p>
            How much do you know about the Lunar Module
            that carried humanity to the Moon?
            Test your knowledge and complete your mission.
          </p>
        </div>

        {!finished ? (
          <div className="quiz-card">

            <div className="quiz-progress-info">
              <span>QUESTION {current + 1} / {questions.length}</span>
              <span>SCORE: {score}</span>
            </div>

            <div className="quiz-progress">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`
                }}
              ></div>
            </div>

            <h2 className="quiz-question">
              {question.question}
            </h2>

            <div className="quiz-options">
              {question.options.map((option, index) => {
                let className = "quiz-option";

                if (selected !== null) {
                  if (index === question.answer) {
                    className += " correct";
                  } else if (index === selected) {
                    className += " incorrect";
                  }
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => handleAnswer(index)}
                    disabled={selected !== null}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span>{option}</span>

                    {selected !== null && index === question.answer && (
                      <span className="option-status">✓</span>
                    )}

                    {selected === index && index !== question.answer && (
                      <span className="option-status">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="quiz-feedback">
                <strong>
                  {selected === question.answer
                    ? "CORRECT! MISSION ACCOMPLISHED."
                    : "NOT QUITE! KEEP EXPLORING."}
                </strong>

                <p>{question.fact}</p>
              </div>
            )}

            <button
              className="quiz-next-btn"
              onClick={nextQuestion}
              disabled={selected === null}
            >
              {current === questions.length - 1
                ? "VIEW RESULTS ↗"
                : "NEXT QUESTION →"}
            </button>

          </div>
        ) : (
          <div className="quiz-result">

            <span className="result-icon">✦</span>

            <p className="quiz-label">MISSION COMPLETED</p>

            <h2>
              {score >= 7
                ? "COSMIC EXPERT!"
                : score >= 4
                ? "GREAT EXPLORER!"
                : "KEEP EXPLORING!"}
            </h2>

            <div className="result-score">
              {score}<span> / {questions.length}</span>
            </div>

            <p className="result-message">
              You answered {score} out of {questions.length} questions correctly.
              {score === questions.length
                ? " Perfect mission! You're an Apollo 11 expert."
                : " There's always more to discover about the Moon."}
            </p>

            <button
              className="quiz-next-btn"
              onClick={restartQuiz}
            >
              ↻ REPLAY MISSION
            </button>

          </div>
        )}

        <p className="quiz-source">
          BASED ON NASA'S APOLLO 11 LUNAR MODULE EXHIBIT
        </p>

      </main>

    </div>
  );
}

export default Quiz;