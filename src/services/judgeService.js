const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63, typescript: 74, python: 71, java: 62,
  c: 50, cpp: 54, csharp: 51, go: 60, rust: 73,
  php: 68, ruby: 72, swift: 83, kotlin: 78, bash: 46,
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fixCode = (code, language) => {
  let fixed = code
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');

  switch (language) {
    case "java":
      fixed = fixed.replace(/public class \w+/g, "public class Main");
      break;
    case "cpp":
    case "c":
      fixed = fixed.replace(/#include\s*<([^>]+)>\s*/g, '#include <$1>\n');
      break;
    case "python":
      if (!fixed.includes('\n')) {
        fixed = fixed.replace(/;\s*/g, '\n');
      }
      break;
    case "csharp":
      fixed = fixed.replace(/public class \w+/g, "public class Main");
      if (!fixed.includes("using System")) {
        fixed = "using System;\n" + fixed;
      }
      break;
    case "php":
      if (!fixed.startsWith("<?php")) {
        fixed = "<?php\n" + fixed;
      }
      break;
    case "bash":
      if (!fixed.startsWith("#!/")) {
        fixed = "#!/bin/bash\n" + fixed;
      }
      break;
    default:
      break;
  }
  return fixed;
};

export const runCode = async (code, language, stdin = "") => {
  const nonExecutable = ["html", "css", "sql", "json", "yaml", "markdown"];
  if (nonExecutable.includes(language)) {
    return {
      output: "",
      error: `${language.toUpperCase()} execute nahi ho sakta!`,
      status: "Not Supported",
      time: null, memory: null,
    };
  }

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      output: "",
      error: `${language} supported nahi hai!`,
      status: "Not Supported",
      time: null, memory: null,
    };
  }

  const finalCode = fixCode(code, language);

  try {
    const submitRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: finalCode,
          language_id: languageId,
          stdin: stdin || "",
        }),
      }
    );

    const result = await submitRes.json();

    if (result.token && !result.stdout && !result.stderr && result.status?.id <= 2) {
      let attempts = 0;
      while (attempts < 10) {
        await delay(1000);
        const pollRes = await fetch(
          `${JUDGE0_URL}/submissions/${result.token}?base64_encoded=false`
        );
        const pollResult = await pollRes.json();
        if (pollResult.status?.id > 2) {
          return {
            output: pollResult.stdout || "",
            error: pollResult.stderr || pollResult.compile_output || "",
            status: pollResult.status?.description || "Unknown",
            time: pollResult.time, memory: pollResult.memory,
          };
        }
        attempts++;
      }
      throw new Error("Execution timeout");
    }

    return {
      output: result.stdout || "",
      error: result.stderr || result.compile_output || "",
      status: result.status?.description || "Unknown",
      time: result.time, memory: result.memory,
    };
  } catch (err) {
    return {
      output: "",
      error: err.message,
      status: "Error",
      time: null, memory: null,
    };
  }
};