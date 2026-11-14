
import React, { useState } from "react";
import "./Quiz.css";

const questions = [
  {
    question: "What was the Lunar Roving Vehicle (LRV) designed for?",
    options: [
      "Flying between planets",
      "Transporting astronauts across the Moon",
      "Collecting satellites",
      "Landing spacecraft"
    ],
    answer: 1,
    fact: "The LRV helped astronauts travel farther across the lunar surface and explore more areas."
  },
  {
    question: "How many Lunar Roving Vehicles were driven on the Moon?",
    options: ["One", "Two", "Three", "Five"],
    answer: 2,
    fact: "Three LRVs were used during Apollo 15, Apollo 16 and Apollo 17."
  },
  {
    question: "Which Apollo mission first used the Lunar Rover?",
    options: ["Apollo 11", "Apollo 13", "Apollo 15", "Apollo 17"],
    answer: 2,
    fact: "Apollo 15 was the first mission to take a Lunar Rover to the Moon in 1971."
  },
  {
    question: "What powered the Lunar Rover?",
    options: [
      "Solar panels",
      "Petrol",
      "Nuclear energy",
      "Electric batteries"
    ],
    answer: 3,
    fact: "The rover used two 36-volt silver-zinc batteries to power its systems."
  },
  {
    question: "How many wheels did the Lunar Rover have?",
    options: ["Two", "Four", "Six", "Eight"],
    answer: 1,
    fact: "The LRV was a lightweight four-wheeled electric vehicle."
  },
  {
    question: "What happened to the three Lunar Rovers after their missions?",
    options: [
      "They returned to Earth",
      "They entered lunar orbit",
      "They were left on the Moon",
      "They were launched towards Mars"
    ],
    answer: 2,
    fact: "All three Apollo mission rovers remained on the lunar surface."
  },
  {
    question: "What was the approximate mass of an empty Lunar Rover?",
    options: ["50 kg", "100 kg", "210 kg", "500 kg"],
    answer: 2,
    fact: "NASA's lunar rover reference gives its empty mass as approximately 210 kg."
  },
  {
    question: "Which Apollo mission used the final Lunar Rover?",
    options: ["Apollo 12", "Apollo 14", "Apollo 16", "Apollo 17"],
    answer: 3,
    fact: "Apollo 17 was the last Apollo mission to use a Lunar Roving Vehicle."
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
    <div className="quiz-page">

      <div className="quiz-stars"></div>

      <header className="quiz-header">
        <span className="quiz-logo">✦ SPACE MUSEUM</span>
        <span className="quiz-category">MISSION CHALLENGE / 001</span>
      </header>

      <main className="quiz-container">

        <div className="quiz-intro">
          <span className="quiz-label">NASA • APOLLO MISSIONS</span>
          <h1>
            THE LUNAR <span>ROVER</span> QUIZ
          </h1>
          <p>
            Think you know the machines that explored the Moon?
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
                ? " Perfect mission! You're a Lunar Rover expert."
                : " There's always more to discover about the universe."}
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
          BASED ON NASA'S APOLLO LUNAR ROVING VEHICLE ARCHIVE
        </p>

      </main>

    </div>
  );
}

export default Quiz;
