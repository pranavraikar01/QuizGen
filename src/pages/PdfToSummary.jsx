import React, { useState } from "react";
import styles from "./PdfToSummary.module.css";
import { Link } from "react-router-dom";

function PdfToSummary() {
  const [pdfText, setPdfText] = useState("");
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setPdfText("");
    setSummary("");
  };

  const handleExtractText = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5001/upload", {
          //update your path
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
        setSummary(generatedSummary);
        playSummaryAudio(generatedSummary);
      } catch (error) {
        console.error("Error generating summary:", error.message);
      }
    } else {
      console.error("Please extract text from a PDF file first");
    }
  };

  const fetchSummaryFromOpenAI = async (text) => {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: ` Summarize the following:\n${text}` },
      ],
      max_tokens: 200,
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
        return data.choices[0].message.content;
      } else {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  };

  const playSummaryAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSummaryAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className={styles.body}>
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
        <h1 className="faltu" style={{opacity: '0'}}>efkgbwrbgoiebg</h1>
        <h1>Generate Summary from Pdf</h1>
      </div>
      <div className={styles.container}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <button onClick={handleExtractText} className={styles.ExtractTextBtn}>
          Extract Text
        </button>
        <button onClick={generateSummary} className={styles.button}>
          Generate Summary
        </button>
        {isPlaying ? (
          <button onClick={stopSummaryAudio} className={styles.button}>
            Stop Audio
          </button>
        ) : (
          <button onClick={playSummaryAudio} className={styles.button}>
            Play Audio
          </button>
        )}
        {summary && <div className={styles.summary}>Summary: {summary}</div>}
      </div>
    </div>
  );
}
export default PdfToSummary;
