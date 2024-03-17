import React, { useEffect, useState } from "react";
import styles from "./Questionaire.module.css";
import { Link } from "react-router-dom";

function Questionaire() {
  const [pdfText, setPdfText] = useState("");
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log(questions, "quetionsssssssssssssssssssssssssss");
  }, [questions]);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setPdfText("");
    setSummary("");
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
  };

  const handleExtractText = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setPdfText(data.text || "");
        } else {
          console.error("Failed to extract text from PDF");
        }
      } catch (error) {
        console.error("Error communicating with the server:", error);
      }
    } else {
      console.error("Please select a PDF file");
    }
  };

  const generateSummary = async () => {
    if (pdfText) {
      try {
        const generatedSummary = await fetchSummaryFromOpenAI(pdfText);
        // console.log("Geenereated questionaire", generatedSummary);
        setSummary(generatedSummary);
        // const parsedData = JSON.parse(generatedSummary);
        console.log("pdfdpdpdpdpdpdpdd", generatedSummary);
        setQuestions(generatedSummary);
      } catch (error) {
        console.error("Error generating summary:", error.message);
      }
    } else {
      console.error("Please extract text from a PDF file first");
    }
  };

  const fetchSummaryFromOpenAI = async (text) => {
    // (Same as your existing code for fetching summary from OpenAI)
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: ` Create and Give me 5 MCQ Questions with answers from the given transcript:\n${text}}.`,
        },
        {
          role: "user",
          content: ` Give it in the form of an array of objects which consist question as key and options for choise the quetions for and also a key containing the correct answer from array. The Quetions array must resemble to following structure:
          [
            {
                "question": "What are the two main categories in which all machine learning models can be categorized?",
                "options": [
                    "Supervised and Unsupervised",
                    "Regression and Classification",
                    "Decision Trees and Neural Networks",
                    "Clustering and Dimensionality Reduction"
                ],
                "correct_answer": "Supervised and Unsupervised"
            },
            {
                "question": "Which type of learning involves mapping an input to an output based on example input-output pairs?",
                "options": [
                    "Supervised learning",
                    "Unsupervised learning",
                    "Reinforcement learning",
                    "Deep learning"
                ],
                "correct_answer": "Supervised learning"
            },....].Note dont give json object I want array consisting of objects`,
        },
      ],
      max_tokens: 450,
      temperature: 0.7,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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", // Replace with your OpenAI API key
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.choices[0].message.content);
        console.log("type of", typeof data.choices[0].message.content);
        const parsedData = JSON.parse(data.choices[0].message.content);
        console.log("Parsing questionaire", parsedData);
        // const parsedSkeleton = parseSkeleton(parsedData);
        // return data.choices[0].message.content;
        return parsedData;
      } else {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  };
  // const parseSkeleton = (skeleton) => {
  //   console.log("Received skeleton:", skeleton);
  //   // Remove newline characters from the skeleton string
  //   // const cleanedSkeleton = skeleton.replace(/\n/g, "");

  //   const cleanedSkeleton = skeleton.replace(/\n|\s{2,}/g, " ");

  //   // Parse the skeleton and create a hierarchical structure
  //   console.log("cleanedskeleton", cleanedSkeleton);

  //   // const parsedTopics = JSON.parse(cleanedSkeleton);
  //   const parsedTopics = cleanedSkeleton;
  //   console.log("Parsed topicicic", parsedTopics);

  //   // ... (rest of your parsing logic)

  //   // Flatten the hierarchy to a simplified format
  //   // const flattenHierarchy = (item) => {
  //   //   const result = {
  //   //     parent: item.parent,
  //   //     children: [],
  //   //   };

  //   //   if (item.children && item.children.length > 0) {
  //   //     item.children.forEach((child) => {
  //   //       const childItem = parsedTopics.find((x) => x.parent === child);
  //   //       if (childItem) {
  //   //         result.children.push(...flattenHierarchy(childItem).children);
  //   //       } else {
  //   //         result.children.push(child);
  //   //       }
  //   //     });
  //   //   }
  //   //   console.log("resuttltltlt", result);

  //   //   return result;
  //   // };

  //   // // Convert the parsed hierarchical structure to the desired format
  //   // const formattedTopics = parsedTopics[0].map((item) =>
  //   //   flattenHierarchy(item)
  //   // );
  //   console.log(parsedTopics);
  //   return parsedTopics;
  // };
  const handleOptionClick = (questionIndex, option) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: option,
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };
  return (
    <>
    <header className={styles.header}>
          <a className={styles.logo} href="#">
            <img
              alt="Mountain"
              className={styles["logo-icon"]}
              src="/images/logo.png"
            />
            <span className={styles["logo-text"]}>Git-R-Done</span>
          </a>
          <nav className={styles.nav}>
            <Link to={"/"} className={styles["nav-element"]}>
              Home
            </Link>
            <Link to={"/pdf-to-summary"} className={styles["nav-element"]}>
              Summary
            </Link>
            <Link to={"/mindmap"} className={styles["nav-element"]}>
              Mind Map
            </Link>
            <Link to={"/Questionaire"} className={styles["nav-element"]}>
              Questionaire
            </Link>
            <Link to={"/GeminiProVision"} className={styles["nav-element"]}>
              Analyze Image
            </Link>
          </nav>
        </header>
      <div>
        <h1>Generate Questionaire from Pdf</h1>
      </div>
      <div className={styles.container}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <button onClick={handleExtractText} className={styles.button}>
          Extract Text
        </button>
        <button onClick={generateSummary} className={styles.button}>
          Generate Questionnaire
        </button>

        {questions.length > 0 && (
          <div>
            {questions.map((question, index) => (
              <div key={index} className={styles.questionContainer}>
                <div className={styles.question}>
                  {`${index + 1}. ${question.question}`}
                </div>
                <div className={styles.options}>
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={styles.optionLabel}
                      htmlFor={`question_${index}_option_${optionIndex}`}
                    >
                      <input
                        type="radio"
                        id={`question_${index}_option_${optionIndex}`}
                        name={`question_${index}`}
                        value={option}
                        onChange={() => handleOptionClick(index, option)}
                        disabled={showResults}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} className={styles.button}>
              Submit Answers
            </button>
          </div>
        )}

        {/* {showResults && (
          <div className={styles.results}>
            <h2>Results:</h2>
            {questions.map((question, index) => (
              <div key={index} className={styles.resultItem}>
                <div className={styles.question}>
                  {`${index + 1}. ${question.question}`}
                </div>
                <div className={styles.userAnswer}>
                  Your Answer: {userAnswers[index]}
                </div>
                <div className={styles.correctAnswer}>
                  Correct Answer: {question.correctAnswer}
                </div>
                <div className={styles.resultStatus}>
                  {userAnswers[index] === question.correctAnswer
                    ? "Correct"
                    : "Incorrect"}
                </div>
              </div>
            ))}
          </div>
        )} */}
        {showResults && (
          <div className={styles.results}>
            <h2>Results:</h2>
            {questions.map((question, index) => (
              <div key={index} className={styles.resultItem}>
                <div className={styles.question}>
                  {`${index + 1}. ${question.question}`}
                </div>
                <div className={styles.userAnswer}>
                  Your Answer: {userAnswers[index]}
                </div>
                <div className={styles.resultStatus}>
                  {userAnswers[index] === question.correct_answer ? (
                    <span className={styles.correct}>Correct</span>
                  ) : (
                    <>
                      <span className={styles.incorrect}>Incorrect</span>
                      <div className={styles.correctAnswer}>
                        Correct Answer: {question.correct_answer}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Questionaire;
