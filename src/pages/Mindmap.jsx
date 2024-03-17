import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./GeminiProVision.module.css"
import { Link } from "react-router-dom";

function Mindmap() {
  const mindMapContainerRef = useRef();

  const [pdfText, setPdfText] = useState("");
  const [file, setFile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [summary, setSummary] = useState("");
  useEffect(() => {
    if (!mindMapContainerRef.current.querySelector("svg")) {
      generateMindMap();
    }
  }, [topics]);
  useEffect(() => {
    console.log(topics, "hello");
  }, [topics]);
  const handleFileChange = (event) => { 
    setFile(event.target.files[0]);
    setPdfText("");
    setTopics([]);
    setSummary("");
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

          // Call function to generate skeleton using OpenAI API
          await generateSkeletonFromOpenAI(data.text);
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

  const generateSkeletonFromOpenAI = async (text) => {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          // content: `Generate a skeleton with parent and children relationships I.e a big topic can be assumed as parent and small related topics are the children of the parent for the following text:\n${text}\nTopics: The relationships must be generated based on the data given in text and open ai's self inteligence over the topic.These relationships mai help in forming a mind tree further,based on the parents relate some parents to other parents as a paernt child relationship.Dont keep children array empty parent's related children must be in that`,
          content: `Based on the data given in :\n${text} and open ai's self inteligence over the topic generate parent children relations between the topics.The format must be similar as below relation  
          Generate a structured relation that can be easily put on following type of mind map Dont put \n's in your answer as it may disrupt the flow`,
        },
        {
          role: "user",
          content: `The heirarchy must resemble to following structure:
        [{
          "parent": "Blockchain",
          "children": ["Decentralization", "Transparency", "Direct Transactions"],
        },
        {
          "parent": "Decentralization",
          "children": ["Trust in Banks", "Failure of Banks"],
        },
        { "parent": "Transparency", "children": ["Visibility", "Public Ledger"] },......] Give the complete object
        `,
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
           // Replace with your OpenAI API key
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        const skeleton = data.choices[0].message.content;
        console.log(data.choices[0].message.content, "Dattaaaaa");
        // Parse the skeleton and set it to the state
        setTopics(parseSkeleton(skeleton));
        console.log(topics, "hello");
      } else {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`OpenAI API Error: ${error.message}`);
    }
  };

  const parseSkeleton = (skeleton) => {
    console.log("Received skeleton:", skeleton);
    // Remove newline characters from the skeleton string
    // const cleanedSkeleton = skeleton.replace(/\n/g, "");

    const cleanedSkeleton = skeleton.replace(/\n|\s{2,}/g, " ");

    // Parse the skeleton and create a hierarchical structure
    console.log("cleanedskeleton", cleanedSkeleton);

    // const parsedTopics = JSON.parse(cleanedSkeleton);
    const parsedTopics = cleanedSkeleton;
    console.log("Parsed topicicic", parsedTopics);

    console.log(parsedTopics);
    return parsedTopics;
  };

  const generateMindMap = () => {
    if (topics.length > 0) {
      d3.select(mindMapContainerRef.current).selectAll("svg").remove();
      console.log("Hemloadfggggggggggadggggggggggg", topics);
      const hierarchicalData = generateHierarchicalData(topics);
      console.log("Heirarichal data", hierarchicalData);
      createMindMap(hierarchicalData);
    } else {
      console.error("No topics available to generate mind map");
    }
  };

  const generateHierarchicalData = (topics) => {
    // topics.map((data) => {
    //   console.log("Helo[pprararahr", data);
    // });
    console.log("Topapapapapapapapapaa", topics);
    console.log(typeof topics);
    const parseingTopics = JSON.parse(topics);
    console.log(parseingTopics);
    const hierarchy = { name: parseingTopics[0].parent, children: [] };
    // console.log("Topiciciciciciciccic", topics[0].parent);
    console.log("Topiciciciciciciccic", hierarchy);

    const findOrCreateNode = (parentNode, childName) => {
      let childNode = parentNode.children.find(
        (child) => child.name === childName
      );
      if (!childNode) {
        childNode = { name: childName, children: [] };
        parentNode.children.push(childNode);
      }
      return childNode;
    };

    parseingTopics.forEach(({ parent, children }) => {
      const parentNode = findOrCreateNode(hierarchy, parent);
      children.forEach((child) => {
        findOrCreateNode(parentNode, child);
      });
    });

    return hierarchy;
  };

  const createMindMap = (data) => {
    const width = 800;
    const height = 600;

    const treeLayout = d3.tree().size([height, width - 100]);
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    const svg = d3
      .select("#mindMapContainer")
      .append("svg")
      .attr("width", 1000)
      .attr("height", 1000)
      .append("g")
      .attr("transform", "translate(50,50)");

    const link = svg
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        return `M${d.source.y},${d.source.x} L${d.target.y},${d.target.x}`;
      })
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", "1.5px");

    const node = svg
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", clicked);

    node
      .append("circle")
      .attr("r", 7)
      .style("fill", "#fff")
      .style("stroke", "steelblue")
      .style("stroke-width", "1.5px");

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -10 : 10))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name);

    function clicked(event, d) {
      // Toggle the collapsed state for the clicked node's children
      if (d.children) {
        d.children.forEach((child) => {
          child.data._collapsed = !child.data._collapsed;
        });
      }

      // Update the tree layout with the updated data
      const updatedData = root.descendants();
      const updatedTreeData = treeLayout(root);

      // Update the links
      link
        .data(updatedTreeData.links())
        .transition()
        .duration(500)
        .attr("d", (d) => {
          return `M${d.source.y},${d.source.x} L${d.target.y},${d.target.x}`;
        })
        .style("opacity", (d) => {
          // Hide links connected to collapsed nodes
          return d.source.data._collapsed || d.target.data._collapsed ? 0 : 1;
        });

      // Update the nodes
      node
        .data(updatedData)
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .style("opacity", (d) => (d.data._collapsed ? 0 : 1));

      // Update the node text
      node.select("text").text((d) => (d.data._collapsed ? "" : d.data.name));

      // Update the visibility of node circles
      node
        .select("circle")
        .style("opacity", (d) => (d.data._collapsed ? 0 : 1));
    }
  };

  return (
    <div>
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
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleExtractText}>Extract Text</button>
      {pdfText && <div>{pdfText}</div>}
      {/* {topics.length > 0 && (
        <div>
          <h2>Generated Topics:</h2>
          <pre>{JSON.stringify(topics, null, 2)}</pre>
        </div>
      )} */}
      <button onClick={generateMindMap} disabled={topics.length === 0}>
        Generate Mind Map
      </button>
      <div
        ref={mindMapContainerRef}
        id="mindMapContainer"
        style={{
          position: "relative",
          width: "1600px",
          height: "1200px",
          backgroundColor: "white",
        }}
      ></div>
    </div>
  );
}

export default Mindmap;
